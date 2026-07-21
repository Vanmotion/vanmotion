import { Resend } from "resend";

type OrderEmailInput = {
  orderId: string;
  checkoutSessionId: string;

  productName: string;
  size: string;
  quantity: number;

  amountTotal: number;
  currency: string;

  customerEmail: string | null;
  customerName: string | null;

  shippingName: string | null;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingPostalCode: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingCountry: string | null;

  stockUpdated: boolean;
};

function escapeHtml(value: string): string {
  const characters: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(
    /[&<>"']/g,
    (character) =>
      characters[character] ?? character,
  );
}

function getErrorMessage(
  value: unknown,
): string {
  if (value instanceof Error) {
    return value.message;
  }

  return String(value);
}

function formatAmount(
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export async function sendOrderEmails(
  input: OrderEmailInput,
): Promise<void> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  /*
   * Reutilizamos la configuración de correo que ya
   * funciona para los formularios de contacto.
   */
  const notificationEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "VANMOTION <contacto@vanmotion.es>";

  if (!apiKey) {
    console.warn(
      "VANMOTION_ORDER_EMAIL_SKIPPED: " +
        "Falta RESEND_API_KEY.",
    );

    return;
  }

  if (
    !notificationEmail &&
    !input.customerEmail
  ) {
    console.warn(
      "VANMOTION_ORDER_EMAIL_SKIPPED: " +
        "No existe ninguna dirección de destino.",
    );

    return;
  }

  const resend = new Resend(apiKey);

  const customerName =
    input.customerName ||
    input.shippingName ||
    "Cliente";

  const safeCustomerName =
    escapeHtml(customerName);

  const safeCustomerEmail =
    escapeHtml(
      input.customerEmail ||
        "No indicado",
    );

  const safeProductName =
    escapeHtml(input.productName);

  const safeSize =
    escapeHtml(input.size);

  const safeOrderId =
    escapeHtml(input.orderId);

  const total = formatAmount(
    input.amountTotal,
    input.currency,
  );

  const addressParts = [
    input.shippingName,
    input.shippingLine1,
    input.shippingLine2,
    [
      input.shippingPostalCode,
      input.shippingCity,
    ]
      .filter(Boolean)
      .join(" "),
    input.shippingState,
    input.shippingCountry,
  ]
    .filter(
      (value): value is string =>
        Boolean(value?.trim()),
    )
    .map((value) =>
      escapeHtml(value.trim()),
    );

  const shippingAddress =
    addressParts.length > 0
      ? addressParts.join("<br>")
      : "No indicada";

  const orderStatusText =
    input.stockUpdated
      ? "Pago recibido y pedido pendiente de preparación."
      : "Pago recibido. El pedido necesita una revisión manual de stock.";

  const notificationPromise =
    notificationEmail
      ? resend.emails.send({
          from: fromEmail,

          to: [
            notificationEmail,
          ],

          ...(input.customerEmail
            ? {
                replyTo:
                  input.customerEmail,
              }
            : {}),

          subject:
            `Nuevo pedido VANMOTION · ${input.orderId}`,

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
                  padding:28px;
                "
              >
                <p
                  style="
                    margin:0 0 20px;
                    font-size:11px;
                    letter-spacing:3px;
                    color:#888888;
                  "
                >
                  VANMOTION · NUEVO PEDIDO
                </p>

                <h1
                  style="
                    margin:0 0 26px;
                    font-size:27px;
                  "
                >
                  Compra confirmada
                </h1>

                <p>
                  <strong>Pedido:</strong><br>
                  ${safeOrderId}
                </p>

                <p>
                  <strong>Cliente:</strong><br>
                  ${safeCustomerName}
                </p>

                <p>
                  <strong>Correo:</strong><br>
                  ${safeCustomerEmail}
                </p>

                <p>
                  <strong>Producto:</strong><br>
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

                <p>
                  <strong>Total:</strong>
                  ${escapeHtml(total)}
                </p>

                <div
                  style="
                    margin-top:24px;
                    padding:20px;
                    border:1px solid #333333;
                    background:#111111;
                    line-height:24px;
                  "
                >
                  <strong>Dirección de envío</strong>
                  <br><br>
                  ${shippingAddress}
                </div>

                <p
                  style="
                    margin-top:24px;
                    color:#bbbbbb;
                    line-height:22px;
                  "
                >
                  ${escapeHtml(orderStatusText)}
                </p>
              </div>
            </div>
          `,
        })
      : Promise.resolve({
          data: null,
          error: null,
        });

  const confirmationPromise =
    input.customerEmail
      ? resend.emails.send({
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
            `Pedido confirmado · ${input.productName}`,

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
                  Pedido confirmado
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
                  Hemos recibido correctamente tu pago.
                  Tu pedido ya está registrado en
                  VANMOTION.
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
                    <strong>Pedido:</strong><br>
                    ${safeOrderId}
                  </p>

                  <p>
                    <strong>Producto:</strong><br>
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

                  <p>
                    <strong>Total:</strong>
                    ${escapeHtml(total)}
                  </p>
                </div>

                <div
                  style="
                    margin-top:22px;
                    padding:20px;
                    border:1px solid #333333;
                    line-height:24px;
                  "
                >
                  <strong>Dirección de envío</strong>
                  <br><br>
                  ${shippingAddress}
                </div>

                <p
                  style="
                    margin-top:28px;
                    color:#777777;
                    font-size:12px;
                    line-height:19px;
                  "
                >
                  Este es un mensaje automático de
                  confirmación. Conserva este correo como
                  referencia de tu pedido.
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
        })
      : Promise.resolve({
          data: null,
          error: null,
        });

  const [
    notificationResult,
    confirmationResult,
  ] = await Promise.allSettled([
    notificationPromise,
    confirmationPromise,
  ]);

  const errors: string[] = [];

  if (
    notificationResult.status ===
    "rejected"
  ) {
    errors.push(
      `Aviso a VANMOTION: ${getErrorMessage(
        notificationResult.reason,
      )}`,
    );
  } else if (
    notificationResult.value.error
  ) {
    errors.push(
      `Aviso a VANMOTION: ${notificationResult.value.error.message}`,
    );
  }

  if (
    confirmationResult.status ===
    "rejected"
  ) {
    errors.push(
      `Confirmación al cliente: ${getErrorMessage(
        confirmationResult.reason,
      )}`,
    );
  } else if (
    confirmationResult.value.error
  ) {
    errors.push(
      `Confirmación al cliente: ${confirmationResult.value.error.message}`,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      errors.join(" | "),
    );
  }

  console.log(
    "VANMOTION_ORDER_EMAIL_SENT:",
    {
      orderId: input.orderId,
      customerEmailSent:
        Boolean(input.customerEmail),
      notificationEmailSent:
        Boolean(notificationEmail),
    },
  );
}