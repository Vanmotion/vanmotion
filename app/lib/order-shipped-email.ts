import { Resend } from "resend";

type OrderShippedEmailInput = {
  orderId: string;

  productName: string;
  size: string;
  quantity: number;

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
    console.warn(
      "VANMOTION_SHIPPED_EMAIL_SKIPPED: " +
        "Falta RESEND_API_KEY.",
    );

    return;
  }

  if (!input.customerEmail) {
    console.warn(
      "VANMOTION_SHIPPED_EMAIL_SKIPPED: " +
        "El pedido no contiene correo del cliente.",
    );

    return;
  }

  const resend =
    new Resend(apiKey);

  const customerName =
    input.customerName?.trim() ||
    "Cliente";

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

  const trackingInformation =
    safeShippingCarrier ||
    safeTrackingNumber ||
    safeTrackingUrl
      ? `
        <div
          style="
            margin-top:22px;
            padding:20px;
            border:1px solid #333333;
            background:#111111;
          "
        >
          <p
            style="
              margin:0 0 18px;
              font-size:11px;
              letter-spacing:3px;
              color:#888888;
            "
          >
            INFORMACIÓN DE SEGUIMIENTO
          </p>

          ${
            safeShippingCarrier
              ? `
                <p
                  style="
                    margin:0 0 14px;
                    line-height:24px;
                  "
                >
                  <strong>
                    Empresa de transporte:
                  </strong>
                  <br>
                  ${safeShippingCarrier}
                </p>
              `
              : ""
          }

          ${
            safeTrackingNumber
              ? `
                <p
                  style="
                    margin:0 0 14px;
                    line-height:24px;
                  "
                >
                  <strong>
                    Número de seguimiento:
                  </strong>
                  <br>
                  ${safeTrackingNumber}
                </p>
              `
              : ""
          }

          ${
            safeTrackingUrl
              ? `
                <a
                  href="${safeTrackingUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display:inline-block;
                    margin-top:6px;
                    padding:14px 18px;
                    background:#ffffff;
                    color:#000000;
                    font-size:11px;
                    font-weight:bold;
                    letter-spacing:2px;
                    text-decoration:none;
                  "
                >
                  CONSULTAR SEGUIMIENTO →
                </a>
              `
              : ""
          }
        </div>
      `
      : `
        <div
          style="
            margin-top:22px;
            padding:20px;
            border:1px solid #333333;
            color:#aaaaaa;
            line-height:24px;
          "
        >
          El pedido ha sido enviado.
          VANMOTION te comunicará los datos
          de seguimiento cuando estén disponibles.
        </div>
      `;

  const result =
    await resend.emails.send({
      from: fromEmail,

      to: [
        input.customerEmail,
      ],

      ...(notificationEmail
        ? {
            replyTo:
              notificationEmail,
          }
        : {}),

      subject:
        `Tu pedido VANMOTION ha sido enviado · ${input.productName}`,

      html: `
        <div
          style="
            background:#080808;
            color:#ffffff;
            padding:30px;
            font-family:Arial,sans-serif;
          "
        >
          <div
            style="
              max-width:620px;
              margin:auto;
              border:1px solid #333333;
              padding:30px;
            "
          >
            <p
              style="
                margin:0 0 22px;
                font-size:11px;
                letter-spacing:4px;
                color:#888888;
              "
            >
              VANMOTION · MADRID
            </p>

            <h1
              style="
                margin:0 0 24px;
                font-size:28px;
                line-height:34px;
              "
            >
              Tu pedido ha sido enviado
            </h1>

            <p
              style="
                margin:0 0 18px;
                line-height:26px;
              "
            >
              Hola ${safeCustomerName},
            </p>

            <p
              style="
                margin:0;
                color:#cccccc;
                line-height:26px;
              "
            >
              Tu pedido ya ha sido preparado
              y ha salido de VANMOTION.
            </p>

            <div
              style="
                margin-top:28px;
                padding:20px;
                border:1px solid #333333;
                background:#111111;
              "
            >
              <p>
                <strong>Pedido:</strong>
                <br>
                ${safeOrderId}
              </p>

              <p>
                <strong>Producto:</strong>
                <br>
                ${safeProductName}
              </p>

              <p>
                <strong>Talla:</strong>
                ${safeSize}
              </p>

              <p>
                <strong>Cantidad:</strong>
                ${input.quantity}
              </p>
            </div>

            ${trackingInformation}

            <p
              style="
                margin-top:28px;
                color:#777777;
                font-size:12px;
                line-height:19px;
              "
            >
              Este es un mensaje automático.
              Puedes responder directamente a este
              correo para contactar con VANMOTION.
            </p>

            <p
              style="
                margin-top:28px;
                font-size:12px;
                letter-spacing:2px;
              "
            >
              HUMILDAD · TRABAJO · MOVIMIENTO
            </p>
          </div>
        </div>
      `,
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