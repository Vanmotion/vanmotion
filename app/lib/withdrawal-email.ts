import { Resend } from "resend";

type WithdrawalLanguage =
  | "es"
  | "en";

type WithdrawalEmailInput = {
  withdrawalId: string;
  orderId: string;

  customerName: string;
  customerEmail: string;

  productName: string;
  size: string;
  quantity: number;

  statement: string;
  customerMessage: string | null;

  requestedAt: Date;
  language: WithdrawalLanguage;
};

type WithdrawalEmailResult = {
  customerConfirmationSent: boolean;
  notificationEmailSent: boolean;
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

function formatDate(
  date: Date,
  language: WithdrawalLanguage,
): string {
  return new Intl.DateTimeFormat(
    language === "es"
      ? "es-ES"
      : "en-GB",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    },
  ).format(date);
}

export async function sendWithdrawalEmails(
  input: WithdrawalEmailInput,
): Promise<WithdrawalEmailResult> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const notificationEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "VANMOTION <contacto@vanmotion.es>";

  if (!apiKey) {
    console.warn(
      "VANMOTION_WITHDRAWAL_EMAIL_SKIPPED: " +
        "Falta RESEND_API_KEY.",
    );

    return {
      customerConfirmationSent: false,
      notificationEmailSent: false,
    };
  }

  const resend = new Resend(apiKey);

  const isSpanish =
    input.language === "es";

  const displayOrderId =
    input.orderId
      .slice(-10)
      .toUpperCase();

  const safeWithdrawalId =
    escapeHtml(input.withdrawalId);

  const safeOrderId =
    escapeHtml(displayOrderId);

  const safeCustomerName =
    escapeHtml(input.customerName);

  const safeCustomerEmail =
    escapeHtml(input.customerEmail);

  const safeProductName =
    escapeHtml(input.productName);

  const safeSize =
    escapeHtml(input.size);

  const safeStatement =
    escapeHtml(input.statement).replace(
      /\n/g,
      "<br>",
    );

  const safeCustomerMessage =
    input.customerMessage
      ? escapeHtml(
          input.customerMessage,
        ).replace(/\n/g, "<br>")
      : null;

  const safeRequestedAt =
    escapeHtml(
      formatDate(
        input.requestedAt,
        input.language,
      ),
    );

  const notificationPromise =
    notificationEmail
      ? resend.emails.send({
          from: fromEmail,

          to: [
            notificationEmail,
          ],

          replyTo:
            input.customerEmail,

          subject:
            `Nueva solicitud de desistimiento · #${displayOrderId}`,

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
                  max-width:640px;
                  margin:auto;
                  border:1px solid #333333;
                  padding:30px;
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
                  VANMOTION · DESISTIMIENTO
                </p>

                <h1
                  style="
                    margin:0 0 26px;
                    font-size:27px;
                    line-height:34px;
                  "
                >
                  Nueva solicitud recibida
                </h1>

                <div
                  style="
                    padding:20px;
                    border:1px solid #333333;
                    background:#111111;
                    line-height:24px;
                  "
                >
                  <p>
                    <strong>Solicitud:</strong><br>
                    ${safeWithdrawalId}
                  </p>

                  <p>
                    <strong>Pedido:</strong><br>
                    #${safeOrderId}
                  </p>

                  <p>
                    <strong>Fecha de recepción:</strong><br>
                    ${safeRequestedAt}
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
                </div>

                <div
                  style="
                    margin-top:22px;
                    padding:20px;
                    border:1px solid #333333;
                    line-height:24px;
                  "
                >
                  <strong>Declaración del cliente</strong>
                  <br><br>
                  ${safeStatement}
                </div>

                ${
                  safeCustomerMessage
                    ? `
                      <div
                        style="
                          margin-top:22px;
                          padding:20px;
                          border:1px solid #333333;
                          line-height:24px;
                        "
                      >
                        <strong>Mensaje voluntario</strong>
                        <br><br>
                        ${safeCustomerMessage}
                      </div>
                    `
                    : ""
                }

                <div
                  style="
                    margin-top:28px;
                    padding-top:22px;
                    border-top:1px solid #333333;
                  "
                >
                  <a
                    href="mailto:${safeCustomerEmail}"
                    style="
                      display:inline-block;
                      background:#ffffff;
                      color:#000000;
                      padding:14px 20px;
                      text-decoration:none;
                      font-size:12px;
                      font-weight:bold;
                      letter-spacing:1px;
                    "
                  >
                    RESPONDER AL CLIENTE
                  </a>
                </div>

                <p
                  style="
                    margin-top:28px;
                    color:#777777;
                    font-size:12px;
                    line-height:19px;
                  "
                >
                  La solicitud permanece guardada en
                  PostgreSQL y vinculada al pedido.
                </p>
              </div>
            </div>
          `,
        })
      : Promise.resolve({
          data: null,
          error: null,
        });

  const confirmationTitle =
    isSpanish
      ? "Solicitud de desistimiento recibida"
      : "Withdrawal request received";

  const confirmationSubject =
    isSpanish
      ? `Desistimiento recibido · Pedido #${displayOrderId}`
      : `Withdrawal received · Order #${displayOrderId}`;

  const confirmationGreeting =
    isSpanish
      ? `Hola ${safeCustomerName},`
      : `Hello ${safeCustomerName},`;

  const confirmationText =
    isSpanish
      ? `
          Hemos recibido correctamente tu solicitud
          de desistimiento relacionada con el pedido
          <strong>#${safeOrderId}</strong>.
          VANMOTION revisará la solicitud y se pondrá
          en contacto contigo para continuar la gestión.
        `
      : `
          We have received your withdrawal request
          concerning order
          <strong>#${safeOrderId}</strong>.
          VANMOTION will review the request and contact
          you to continue the process.
        `;

  const referenceLabel =
    isSpanish
      ? "Referencia de la solicitud"
      : "Request reference";

  const orderLabel =
    isSpanish
      ? "Pedido"
      : "Order";

  const dateLabel =
    isSpanish
      ? "Fecha de recepción"
      : "Date received";

  const productLabel =
    isSpanish
      ? "Producto"
      : "Product";

  const sizeLabel =
    isSpanish
      ? "Talla"
      : "Size";

  const quantityLabel =
    isSpanish
      ? "Cantidad"
      : "Quantity";

  const statementLabel =
    isSpanish
      ? "Declaración registrada"
      : "Recorded statement";

  const footerText =
    isSpanish
      ? "Conserva este correo como confirmación de que VANMOTION ha recibido tu solicitud."
      : "Keep this email as confirmation that VANMOTION has received your request.";

  const confirmationPromise =
    resend.emails.send({
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
        confirmationSubject,

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
              max-width:640px;
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
              ${confirmationTitle}
            </h1>

            <p
              style="
                margin:0 0 18px;
                line-height:26px;
              "
            >
              ${confirmationGreeting}
            </p>

            <p
              style="
                margin:0;
                color:#cccccc;
                line-height:26px;
              "
            >
              ${confirmationText}
            </p>

            <div
              style="
                margin-top:28px;
                padding:20px;
                border:1px solid #333333;
                background:#111111;
                line-height:24px;
              "
            >
              <p>
                <strong>${referenceLabel}:</strong><br>
                ${safeWithdrawalId}
              </p>

              <p>
                <strong>${orderLabel}:</strong><br>
                #${safeOrderId}
              </p>

              <p>
                <strong>${dateLabel}:</strong><br>
                ${safeRequestedAt}
              </p>

              <p>
                <strong>${productLabel}:</strong><br>
                ${safeProductName}
              </p>

              <p>
                <strong>${sizeLabel}:</strong>
                ${safeSize}
              </p>

              <p>
                <strong>${quantityLabel}:</strong>
                ${input.quantity}
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
              <strong>${statementLabel}</strong>
              <br><br>
              ${safeStatement}
            </div>

            <p
              style="
                margin-top:28px;
                color:#777777;
                font-size:12px;
                line-height:19px;
              "
            >
              ${footerText}
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

  const [
    notificationResult,
    confirmationResult,
  ] = await Promise.allSettled([
    notificationPromise,
    confirmationPromise,
  ]);

  let notificationEmailSent =
    false;

  let customerConfirmationSent =
    false;

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
  } else {
    notificationEmailSent =
      Boolean(notificationEmail);
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
  } else {
    customerConfirmationSent =
      true;
  }

  if (errors.length > 0) {
    console.error(
      "VANMOTION_WITHDRAWAL_EMAIL_ERROR:",
      errors.join(" | "),
    );
  }

  console.log(
    "VANMOTION_WITHDRAWAL_EMAIL_RESULT:",
    {
      withdrawalId:
        input.withdrawalId,

      orderId:
        input.orderId,

      customerConfirmationSent,
      notificationEmailSent,
    },
  );

  return {
    customerConfirmationSent,
    notificationEmailSent,
  };
}