"use server";

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
): string | null {
  const normalized = String(
    value ?? "",
  ).trim();

  return normalized || null;
}

function normalizeTrackingUrl(
  value: FormDataEntryValue | null,
): string | null {
  const normalized =
    normalizeOptionalText(value);

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
    );

  const trackingNumber =
    normalizeOptionalText(
      formData.get(
        "trackingNumber",
      ),
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

      shippedEmailSent:
        shouldSendShippedEmail,
    },
  );

  refreshOrderPages();
}