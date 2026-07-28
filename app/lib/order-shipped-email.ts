import { Resend } from "resend";

import {
  normalizeCustomerEmailLanguage,
  renderCustomerEmail,
  renderEmailDetails,
  renderEmailNotice,
  type CustomerEmailLanguage,
} from "@/app/lib/customer-email-template";

type OrderShippedEmailInput = {
  orderId: string;

  productName: string;
  size: string;
  quantity: number;
  language: CustomerEmailLanguage;

  customerEmail: string | null;
  customerName: string | null;

  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

function escapeHtml(
  value: string,
): string {
  const characters: Record<
    string,
    string
  > = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(
    /[&<>"']/g,
    (character) =>
      characters[character] ??
      character,
  );
}

function normalizeOptionalText(
  value: string | null,
): string | null {
  const normalized =
    value?.trim();

  return normalized
    ? normalized
    : null;
}

function getSafeTrackingUrl(
  value: string | null,
): string | null {
  const normalized =
    normalizeOptionalText(value);

  if (!normalized) {
    return null;
  }

  try {
    const url =
      new URL(normalized);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function sendOrderShippedEmail(
  input: OrderShippedEmailInput,
): Promise<void> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const notificationEmail =
    process.env
      .CONTACT_NOTIFICATION_EMAIL
      ?.trim();

  const fromEmail =
    process.env
      .CONTACT_FROM_EMAIL
      ?.trim() ||
    "VANMOTION <contacto@vanmotion.es>";

  if (!apiKey) {
    throw new Error(
      "No se puede enviar el correo de envío: falta RESEND_API_KEY.",
    );
  }

  const customerEmail =
    input.customerEmail?.trim();

  if (!customerEmail) {
    throw new Error(
      "No se puede enviar el correo de envío: el pedido no contiene un correo de cliente válido.",
    );
  }

  const resend =
    new Resend(apiKey);

  const language =
    normalizeCustomerEmailLanguage(
      input.language,
    );

  const isSpanish =
    language === "es";

  const customerName =
    input.customerName?.trim() ||
    (isSpanish ? "Cliente" : "Customer");

  const shippingCarrier =
    normalizeOptionalText(
      input.shippingCarrier,
    );

  const trackingNumber =
    normalizeOptionalText(
      input.trackingNumber,
    );

  const trackingUrl =
    getSafeTrackingUrl(
      input.trackingUrl,
    );

  const safeCustomerName =
    escapeHtml(customerName);

  const safeProductName =
    escapeHtml(
      input.productName,
    );

  const safeSize =
    escapeHtml(input.size);

  const safeOrderId =
    escapeHtml(input.orderId);

  const safeShippingCarrier =
    shippingCarrier
      ? escapeHtml(
          shippingCarrier,
        )
      : null;

  const safeTrackingNumber =
    trackingNumber
      ? escapeHtml(
          trackingNumber,
        )
      : null;

  const safeTrackingUrl =
    trackingUrl
      ? escapeHtml(
          trackingUrl,
        )
      : null;

  const detailsHtml = renderEmailDetails([
    {
      label:
        isSpanish
          ? "Pedido"
          : "Order",
      valueHtml:
        safeOrderId,
    },
    {
      label:
        isSpanish
          ? "Producto"
          : "Product",
      valueHtml:
        safeProductName,
    },
    {
      label:
        isSpanish
          ? "Talla"
          : "Size",
      valueHtml:
        safeSize,
    },
    {
      label:
        isSpanish
          ? "Cantidad"
          : "Quantity",
      valueHtml:
        String(input.quantity),
    },
  ]);

  const trackingRows: Array<{
    label: string;
    valueHtml: string;
  }> = [];

  if (safeShippingCarrier) {
    trackingRows.push({
      label:
        isSpanish
          ? "Transportista"
          : "Carrier",
      valueHtml:
        safeShippingCarrier,
    });
  }

  if (safeTrackingNumber) {
    trackingRows.push({
      label:
        isSpanish
          ? "Número de seguimiento"
          : "Tracking number",
      valueHtml:
        safeTrackingNumber,
    });
  }

  if (safeTrackingUrl) {
    trackingRows.push({
      label:
        isSpanish
          ? "Seguimiento"
          : "Tracking",
      valueHtml: `
        <a
          href="${safeTrackingUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="color:#d97827;text-decoration:underline;font-weight:800;"
        >
          ${isSpanish ? "Consultar envío" : "Track shipment"} →
        </a>
      `,
    });
  }

  const trackingHtml =
    trackingRows.length > 0
      ? renderEmailNotice(
          isSpanish
            ? "Información de seguimiento"
            : "Tracking information",
          renderEmailDetails(
            trackingRows,
          ),
        )
      : renderEmailNotice(
          isSpanish
            ? "Estado del envío"
            : "Shipping status",
          isSpanish
            ? "El pedido ha sido enviado. Te comunicaremos los datos de seguimiento cuando estén disponibles."
            : "Your order has been shipped. We will share the tracking details as soon as they are available.",
        );

  const subject = isSpanish
    ? `Tu pedido VANMOTION ha sido enviado · ${input.productName}`
    : `Your VANMOTION order has shipped · ${input.productName}`;

  const title = isSpanish
    ? "PEDIDO ENVIADO"
    : "ORDER SHIPPED";

  const introductionHtml = isSpanish
    ? `Hola ${safeCustomerName},<br><br>Tu pedido ya ha sido preparado y ha salido de VANMOTION.`
    : `Hello ${safeCustomerName},<br><br>Your order has been prepared and has now left VANMOTION.`;

  const html = renderCustomerEmail({
    language,
    preheader:
      isSpanish
        ? "Tu pedido VANMOTION ya está en camino."
        : "Your VANMOTION order is on its way.",
    eyebrow:
      isSpanish
        ? "Envío · VANMOTION"
        : "Shipping · VANMOTION",
    title,
    introductionHtml,
    contentHtml:
      detailsHtml + trackingHtml,
    footerText:
      isSpanish
        ? "Puedes responder directamente a este correo para contactar con VANMOTION."
        : "You can reply directly to this email to contact VANMOTION.",
    ...(trackingUrl
      ? {
          action: {
            label:
              isSpanish
                ? "Seguir el pedido"
                : "Track order",
            href:
              trackingUrl,
          },
        }
      : {
          action: {
            label:
              isSpanish
                ? "Visitar la web"
                : "Visit the website",
            href:
              "https://www.vanmotion.es",
          },
        }),
  });

  const trackingText = [
    shippingCarrier
      ? `${isSpanish ? "Transportista" : "Carrier"}: ${shippingCarrier}`
      : null,
    trackingNumber
      ? `${isSpanish ? "Número de seguimiento" : "Tracking number"}: ${trackingNumber}`
      : null,
    trackingUrl
      ? `${isSpanish ? "Seguimiento" : "Tracking"}: ${trackingUrl}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const text = [
    title,
    "",
    isSpanish
      ? `Hola ${customerName},`
      : `Hello ${customerName},`,
    isSpanish
      ? "Tu pedido ya ha sido preparado y ha salido de VANMOTION."
      : "Your order has been prepared and has now left VANMOTION.",
    "",
    `${isSpanish ? "Pedido" : "Order"}: ${input.orderId}`,
    `${isSpanish ? "Producto" : "Product"}: ${input.productName}`,
    `${isSpanish ? "Talla" : "Size"}: ${input.size}`,
    `${isSpanish ? "Cantidad" : "Quantity"}: ${input.quantity}`,
    "",
    trackingText ||
      (isSpanish
        ? "Te comunicaremos los datos de seguimiento cuando estén disponibles."
        : "We will share the tracking details as soon as they are available."),
  ].join("\n");

  const result =
    await resend.emails.send({
      from: fromEmail,

      to: [
        customerEmail,
      ],

      ...(notificationEmail
        ? {
            replyTo:
              notificationEmail,
          }
        : {}),

      subject,
      html,
      text,
    });

  if (result.error) {
    throw new Error(
      result.error.message,
    );
  }

  console.log(
    "VANMOTION_ORDER_SHIPPED_EMAIL_SENT:",
    {
      orderId:
        input.orderId,

      language,

      customerEmailSent:
        true,

      trackingIncluded:
        Boolean(
          shippingCarrier ||
          trackingNumber ||
          trackingUrl,
        ),
    },
  );
}
