"use server";

import { WithdrawalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  sendOrderShippedEmail,
} from "@/app/lib/order-shipped-email";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const ALLOWED_FULFILLMENT_STATUSES =
  new Set([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REVIEW_REQUIRED",
  ]);

const ALLOWED_WITHDRAWAL_STATUSES =
  new Set<WithdrawalStatus>([
    WithdrawalStatus.RECEIVED,
    WithdrawalStatus.UNDER_REVIEW,
    WithdrawalStatus.RETURN_RECEIVED,
    WithdrawalStatus.REFUNDED,
    WithdrawalStatus.REJECTED,
  ]);

function isWithdrawalStatus(
  value: string,
): value is WithdrawalStatus {
  return ALLOWED_WITHDRAWAL_STATUSES.has(
    value as WithdrawalStatus,
  );
}

async function requireAdminSession(): Promise<void> {
  const expectedToken =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  const cookieStore =
    await cookies();

  const currentToken =
    cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

  if (
    !expectedToken ||
    !currentToken ||
    currentToken !== expectedToken
  ) {
    redirect("/login-admin");
  }
}

function normalizeOptionalText(
  value: FormDataEntryValue | null,
  maximumLength = 500,
): string | null {
  const normalized = String(
    value ?? "",
  )
    .replace(/\0/g, "")
    .trim()
    .slice(0, maximumLength);

  return normalized || null;
}

function normalizeTrackingUrl(
  value: FormDataEntryValue | null,
): string | null {
  const normalized =
    normalizeOptionalText(
      value,
      1000,
    );

  if (!normalized) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(normalized);
  } catch {
    throw new Error(
      "El enlace de seguimiento no es válido.",
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "El enlace de seguimiento debe comenzar por http:// o https://.",
    );
  }

  return url.toString();
}

function refreshOrderPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
}

export async function updateOrderFulfillmentStatusAction(
  formData: FormData,
): Promise<void> {
  /*
   * El proxy protege la navegación del panel,
   * pero la Server Action también debe comprobar
   * directamente la sesión administrativa.
   */
  await requireAdminSession();

  const orderId = String(
    formData.get("orderId") ?? "",
  ).trim();

  const fulfillmentStatus = String(
    formData.get(
      "fulfillmentStatus",
    ) ?? "",
  ).trim();

  const shippingCarrier =
    normalizeOptionalText(
      formData.get(
        "shippingCarrier",
      ),
      120,
    );

  const trackingNumber =
    normalizeOptionalText(
      formData.get(
        "trackingNumber",
      ),
      180,
    );

  const trackingUrl =
    normalizeTrackingUrl(
      formData.get(
        "trackingUrl",
      ),
    );

  if (!orderId) {
    throw new Error(
      "No se ha recibido el identificador del pedido.",
    );
  }

  if (
    !ALLOWED_FULFILLMENT_STATUSES.has(
      fulfillmentStatus,
    )
  ) {
    throw new Error(
      "El estado seleccionado no es válido.",
    );
  }

  const existingOrder =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      select: {
        id: true,

        fulfillmentStatus:
          true,

        customerEmail:
          true,

        customerName:
          true,

        shippingName:
          true,

        productName:
          true,

        size:
          true,

        quantity:
          true,

        shippingCarrier:
          true,

        trackingNumber:
          true,

        trackingUrl:
          true,

        shippedAt:
          true,
      },
    });

  if (!existingOrder) {
    throw new Error(
      "El pedido indicado no existe.",
    );
  }

  const statusChanged =
    existingOrder
      .fulfillmentStatus !==
    fulfillmentStatus;

  const trackingChanged =
    existingOrder
      .shippingCarrier !==
      shippingCarrier ||
    existingOrder
      .trackingNumber !==
      trackingNumber ||
    existingOrder
      .trackingUrl !==
      trackingUrl;

  /*
   * Si no ha cambiado ni el estado ni la
   * información de transporte, no hacemos
   * ninguna actualización.
   */
  if (
    !statusChanged &&
    !trackingChanged
  ) {
    refreshOrderPages();

    return;
  }

  /*
   * El correo se envía exclusivamente cuando
   * el pedido pasa realmente desde otro estado
   * al estado SHIPPED.
   */
  const shouldSendShippedEmail =
    fulfillmentStatus ===
      "SHIPPED" &&
    existingOrder
      .fulfillmentStatus !==
      "SHIPPED";

  const shippedAt =
    shouldSendShippedEmail
      ? existingOrder
          .shippedAt ??
        new Date()
      : existingOrder
          .shippedAt;

  const updatedOrder =
    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        fulfillmentStatus,

        shippingCarrier,
        trackingNumber,
        trackingUrl,

        shippedAt,
      },

      select: {
        id: true,

        customerEmail:
          true,

        customerName:
          true,

        shippingName:
          true,

        productName:
          true,

        size:
          true,

        quantity:
          true,

        shippingCarrier:
          true,

        trackingNumber:
          true,

        trackingUrl:
          true,
      },
    });

  let shippedEmailSent =
    false;

  if (shouldSendShippedEmail) {
    try {
      await sendOrderShippedEmail({
        orderId:
          updatedOrder.id,

        productName:
          updatedOrder
            .productName,

        size:
          updatedOrder.size,

        quantity:
          updatedOrder.quantity,

        customerEmail:
          updatedOrder
            .customerEmail,

        customerName:
          updatedOrder
            .customerName ??
          updatedOrder
            .shippingName,

        shippingCarrier:
          updatedOrder
            .shippingCarrier,

        trackingNumber:
          updatedOrder
            .trackingNumber,

        trackingUrl:
          updatedOrder
            .trackingUrl,
      });

      shippedEmailSent =
        true;
    } catch (emailError) {
      /*
       * El estado y los datos del transporte
       * permanecen guardados aunque Resend falle.
       */
      console.error(
        "VANMOTION_ORDER_SHIPPED_EMAIL_ERROR:",
        emailError instanceof Error
          ? emailError.message
          : emailError,
      );
    }
  }

  console.log(
    "VANMOTION_ORDER_UPDATED:",
    {
      orderId:
        updatedOrder.id,

      fulfillmentStatus,

      trackingIncluded:
        Boolean(
          shippingCarrier ||
          trackingNumber ||
          trackingUrl,
        ),

      shippedEmailSent,
    },
  );

  refreshOrderPages();
}

export async function updateWithdrawalRequestAction(
  formData: FormData,
): Promise<void> {
  /*
   * Esta acción solo puede utilizarse desde
   * una sesión administrativa válida.
   */
  await requireAdminSession();

  const withdrawalId = String(
    formData.get(
      "withdrawalId",
    ) ?? "",
  ).trim();

  const withdrawalStatus = String(
    formData.get(
      "withdrawalStatus",
    ) ?? "",
  ).trim();

  const adminNotes =
    normalizeOptionalText(
      formData.get(
        "adminNotes",
      ),
      4000,
    );

  if (!withdrawalId) {
    throw new Error(
      "No se ha recibido el identificador del desistimiento.",
    );
  }

  if (
    !isWithdrawalStatus(
      withdrawalStatus,
    )
  ) {
    throw new Error(
      "El estado del desistimiento no es válido.",
    );
  }

  const existingWithdrawal =
    await prisma.withdrawalRequest.findUnique({
      where: {
        id: withdrawalId,
      },

      select: {
        id: true,
        orderId: true,
        status: true,
        returnReceivedAt: true,
        refundedAt: true,
        rejectedAt: true,
        resolvedAt: true,
      },
    });

  if (!existingWithdrawal) {
    throw new Error(
      "La solicitud de desistimiento indicada no existe.",
    );
  }

  const now =
    new Date();

  const dateUpdates: {
    returnReceivedAt?: Date;
    refundedAt?: Date;
    rejectedAt?: Date;
    resolvedAt?: Date;
  } = {};

  if (
    withdrawalStatus ===
      "RETURN_RECEIVED" &&
    !existingWithdrawal
      .returnReceivedAt
  ) {
    dateUpdates.returnReceivedAt =
      now;
  }

  if (
    withdrawalStatus ===
      "REFUNDED"
  ) {
    if (
      !existingWithdrawal
        .refundedAt
    ) {
      dateUpdates.refundedAt =
        now;
    }

    if (
      !existingWithdrawal
        .resolvedAt
    ) {
      dateUpdates.resolvedAt =
        now;
    }
  }

  if (
    withdrawalStatus ===
      "REJECTED"
  ) {
    if (
      !existingWithdrawal
        .rejectedAt
    ) {
      dateUpdates.rejectedAt =
        now;
    }

    if (
      !existingWithdrawal
        .resolvedAt
    ) {
      dateUpdates.resolvedAt =
        now;
    }
  }

  const statusChanged =
    existingWithdrawal.status !==
    withdrawalStatus;

  const updatedWithdrawal =
    await prisma.withdrawalRequest.update({
      where: {
        id: withdrawalId,
      },

      data: {
        status:
          withdrawalStatus,

        adminNotes,

        ...dateUpdates,
      },

      select: {
        id: true,
        orderId: true,
        status: true,
      },
    });

  /*
   * Al empezar la revisión, también dejamos
   * el pedido marcado para revisión interna.
   */
  if (
    statusChanged &&
    (
      withdrawalStatus ===
        "RECEIVED" ||
      withdrawalStatus ===
        "UNDER_REVIEW"
    )
  ) {
    await prisma.order.update({
      where: {
        id:
          updatedWithdrawal
            .orderId,
      },

      data: {
        fulfillmentStatus:
          "REVIEW_REQUIRED",
      },
    });
  }

  console.log(
    "VANMOTION_WITHDRAWAL_UPDATED:",
    {
      withdrawalId:
        updatedWithdrawal.id,

      orderId:
        updatedWithdrawal.orderId,

      withdrawalStatus:
        updatedWithdrawal.status,
    },
  );

  refreshOrderPages();
}