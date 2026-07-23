"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";
import {
  sendWithdrawalEmails,
} from "@/app/lib/withdrawal-email";

type Language =
  | "es"
  | "en";

type WithdrawalOrder = {
  id: string;
  customerEmail: string | null;
  customerName: string | null;
  shippingName: string | null;
  productName: string;
  size: string;
  quantity: number;

  withdrawalRequest: {
    id: string;
    statement: string;
    customerMessage: string | null;
    requestedAt: Date;
    confirmationSentAt: Date | null;
  } | null;
};

function getText(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeText(
  value: string,
  maximumLength: number,
): string {
  return value
    .replace(/\0/g, "")
    .trim()
    .slice(0, maximumLength);
}

function isValidEmail(
  email: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function buildRedirectUrl(
  parameters: Record<
    string,
    string
  >,
): string {
  const searchParams =
    new URLSearchParams(
      parameters,
    );

  return (
    `/desistimiento?${searchParams.toString()}` +
    "#formulario"
  );
}

function getStatement(
  language: Language,
  orderId: string,
): string {
  const displayOrderId =
    orderId
      .slice(-10)
      .toUpperCase();

  if (language === "en") {
    return (
      "Through this electronic form, I unequivocally " +
      "communicate my decision to withdraw from the " +
      `purchase contract relating to order #${displayOrderId}.`
    );
  }

  return (
    "Mediante este formulario electrónico comunico de " +
    "forma inequívoca mi decisión de desistir del " +
    `contrato de compra correspondiente al pedido #${displayOrderId}.`
  );
}

async function findPaidOrder(
  orderReference: string,
  email: string,
): Promise<WithdrawalOrder | null> {
  return prisma.order.findFirst({
    where: {
      id: {
        endsWith:
          orderReference,
      },

      customerEmail: {
        equals: email,
        mode: "insensitive",
      },

      paymentStatus: {
        equals: "paid",
        mode: "insensitive",
      },
    },

    select: {
      id: true,
      customerEmail: true,
      customerName: true,
      shippingName: true,
      productName: true,
      size: true,
      quantity: true,

      withdrawalRequest: {
        select: {
          id: true,
          statement: true,
          customerMessage: true,
          requestedAt: true,
          confirmationSentAt: true,
        },
      },
    },
  });
}

async function findExistingWithdrawal(
  orderId: string,
): Promise<
  WithdrawalOrder["withdrawalRequest"]
> {
  return prisma.withdrawalRequest.findUnique({
    where: {
      orderId,
    },

    select: {
      id: true,
      statement: true,
      customerMessage: true,
      requestedAt: true,
      confirmationSentAt: true,
    },
  });
}

export async function createWithdrawalRequestAction(
  formData: FormData,
): Promise<void> {
  const language =
    await getCurrentLanguage();

  const orderReference =
    normalizeText(
      getText(
        formData,
        "orderReference",
      ),
      120,
    )
      .replace(/^#+/, "")
      .toLowerCase();

  const customerName =
    normalizeText(
      getText(
        formData,
        "customerName",
      ),
      120,
    );

  const customerEmail =
    normalizeText(
      getText(
        formData,
        "customerEmail",
      ).toLowerCase(),
      180,
    );

  const customerMessage =
    normalizeText(
      getText(
        formData,
        "customerMessage",
      ),
      2000,
    );

  const acceptedDeclaration =
    getText(
      formData,
      "acceptedDeclaration",
    ) === "yes";

  if (
    !orderReference ||
    !customerName ||
    !customerEmail ||
    !acceptedDeclaration
  ) {
    redirect(
      buildRedirectUrl({
        error: "required",
      }),
    );
  }

  if (
    orderReference.length < 8
  ) {
    redirect(
      buildRedirectUrl({
        error:
          "invalid_reference",
      }),
    );
  }

  if (
    !isValidEmail(
      customerEmail,
    )
  ) {
    redirect(
      buildRedirectUrl({
        error: "invalid_email",
      }),
    );
  }

  const order =
    await findPaidOrder(
      orderReference,
      customerEmail,
    );

  /*
   * Usamos un mensaje genérico para no revelar
   * si existe un pedido asociado a otro correo.
   */
  if (
    !order ||
    !order.customerEmail
  ) {
    redirect(
      buildRedirectUrl({
        error: "not_found",
      }),
    );
  }

  const statement =
    getStatement(
      language,
      order.id,
    );

  let withdrawal =
    order.withdrawalRequest;

  if (!withdrawal) {
    try {
      withdrawal =
        await prisma.withdrawalRequest.create({
          data: {
            orderId:
              order.id,

            customerName,
            customerEmail:
              order.customerEmail
                .trim()
                .toLowerCase(),

            statement,

            customerMessage:
              customerMessage ||
              null,

            language,
            status:
              "RECEIVED",
          },

          select: {
            id: true,
            statement: true,
            customerMessage: true,
            requestedAt: true,
            confirmationSentAt: true,
          },
        });
    } catch (error) {
      /*
       * Dos envíos simultáneos pueden intentar crear
       * la misma solicitud. La restricción única del
       * pedido evita duplicados y recuperamos la ya
       * creada.
       */
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        withdrawal =
          await findExistingWithdrawal(
            order.id,
          );
      } else {
        console.error(
          "VANMOTION_WITHDRAWAL_CREATE_ERROR:",
          error instanceof Error
            ? error.message
            : error,
        );

        redirect(
          buildRedirectUrl({
            error: "server",
          }),
        );
      }
    }
  }

  if (!withdrawal) {
    redirect(
      buildRedirectUrl({
        error: "server",
      }),
    );
  }

  const emailResult =
    await sendWithdrawalEmails({
      withdrawalId:
        withdrawal.id,

      orderId:
        order.id,

      customerName,

      customerEmail:
        order.customerEmail,

      productName:
        order.productName,

      size:
        order.size,

      quantity:
        order.quantity,

      statement:
        withdrawal.statement,

      customerMessage:
        withdrawal.customerMessage,

      requestedAt:
        withdrawal.requestedAt,

      language,
    });

  if (
    emailResult
      .customerConfirmationSent &&
    !withdrawal
      .confirmationSentAt
  ) {
    await prisma.withdrawalRequest.update({
      where: {
        id: withdrawal.id,
      },

      data: {
        confirmationSentAt:
          new Date(),
      },
    });
  }

  revalidatePath(
    "/admin/pedidos",
  );

  revalidatePath(
    "/desistimiento",
  );

  redirect(
    buildRedirectUrl({
      enviado: "1",
      referencia:
        withdrawal.id
          .slice(-10)
          .toUpperCase(),
    }),
  );
}