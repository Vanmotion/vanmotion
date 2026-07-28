import { Resend } from "resend";

import {
  normalizeCustomerEmailLanguage,
  renderCustomerEmail,
  renderEmailDetails,
  renderEmailNotice,
  type CustomerEmailLanguage,
} from "@/app/lib/customer-email-template";

type OrderEmailInput = {
  orderId: string;
  checkoutSessionId: string;

  productName: string;
  size: string;
  quantity: number;

  amountTotal: number;
  currency: string;
  language: CustomerEmailLanguage;

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
  language: CustomerEmailLanguage,
): string {
  try {
    return new Intl.NumberFormat(
      language === "es"
        ? "es-ES"
        : "en-GB",
      {
        style: "currency",
        currency: currency.toUpperCase(),
      },
    ).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export async function sendOrderEmails(
  input: OrderEmailInput,
): Promise<void> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const notificationEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "VANMOTION <contacto@vanmotion.es>";

  const customerEmail =
    input.customerEmail?.trim() ||
    null;

  if (!apiKey) {
    throw new Error(
      "No se puede enviar el correo del pedido: falta RESEND_API_KEY.",
    );
  }

  if (
    !notificationEmail &&
    !customerEmail
  ) {
    throw new Error(
      "No se puede enviar el correo del pedido: no existe ninguna dirección de destino.",
    );
  }

  const resend = new Resend(apiKey);

  const language =
    normalizeCustomerEmailLanguage(
      input.language,
    );

  const isSpanish =
    language === "es";

  const customerName =
    input.customerName?.trim() ||
    input.shippingName?.trim() ||
    (isSpanish ? "Cliente" : "Customer");

  const safeCustomerName =
    escapeHtml(customerName);

  const safeCustomerEmail =
    escapeHtml(
      customerEmail ||
        "No indicado",
    );

  const safeProductName =
    escapeHtml(input.productName);

  const safeSize =
    escapeHtml(input.size);

  const safeOrderId =
    escapeHtml(input.orderId);

  const totalAdmin = formatAmount(
    input.amountTotal,
    input.currency,
    "es",
  );

  const totalCustomer = formatAmount(
    input.amountTotal,
    input.currency,
    language,
  );

  const rawAddressParts = [
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
  ].filter(
    (value): value is string =>
      Boolean(value?.trim()),
  );

  const shippingAddressHtml =
    rawAddressParts.length > 0
      ? rawAddressParts
          .map((value) =>
            escapeHtml(value.trim()),
          )
          .join("<br>")
      : isSpanish
        ? "No indicada"
        : "Not provided";

  const shippingAddressText =
    rawAddressParts.length > 0
      ? rawAddressParts.join("\n")
      : isSpanish
        ? "No indicada"
        : "Not provided";

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

          ...(customerEmail
            ? {
                replyTo:
                  customerEmail,
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
                    color:#d97827;
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

                <p><strong>Pedido:</strong><br>${safeOrderId}</p>
                <p><strong>Cliente:</strong><br>${safeCustomerName}</p>
                <p><strong>Correo:</strong><br>${safeCustomerEmail}</p>
                <p><strong>Idioma:</strong><br>${language.toUpperCase()}</p>
                <p><strong>Producto:</strong><br>${safeProductName}</p>
                <p><strong>Talla:</strong> ${safeSize}</p>
                <p><strong>Cantidad:</strong> ${input.quantity}</p>
                <p><strong>Total:</strong> ${escapeHtml(totalAdmin)}</p>

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
                  ${shippingAddressHtml}
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

          text: [
            "VANMOTION · NUEVO PEDIDO",
            "",
            `Pedido: ${input.orderId}`,
            `Cliente: ${customerName}`,
            `Correo: ${customerEmail || "No indicado"}`,
            `Idioma: ${language.toUpperCase()}`,
            `Producto: ${input.productName}`,
            `Talla: ${input.size}`,
            `Cantidad: ${input.quantity}`,
            `Total: ${totalAdmin}`,
            "",
            "Dirección de envío:",
            shippingAddressText,
            "",
            orderStatusText,
          ].join("\n"),
        })
      : Promise.resolve({
          data: null,
          error: null,
        });

  const title = isSpanish
    ? "PEDIDO CONFIRMADO"
    : "ORDER CONFIRMED";

  const subject = isSpanish
    ? `Pedido confirmado · ${input.productName}`
    : `Order confirmed · ${input.productName}`;

  const greeting = isSpanish
    ? `Hola ${safeCustomerName},`
    : `Hello ${safeCustomerName},`;

  const introductionHtml = isSpanish
    ? `${greeting}<br><br>Hemos recibido correctamente tu pago. Tu pedido ya está registrado en VANMOTION y comenzaremos a prepararlo.`
    : `${greeting}<br><br>We have received your payment. Your order is now registered with VANMOTION and we will begin preparing it.`;

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
    {
      label:
        isSpanish
          ? "Total"
          : "Total",
      valueHtml:
        escapeHtml(totalCustomer),
    },
  ]);

  const addressNotice = renderEmailNotice(
    isSpanish
      ? "Dirección de envío"
      : "Shipping address",
    shippingAddressHtml,
  );

  const customerHtml = renderCustomerEmail({
    language,
    preheader:
      isSpanish
        ? "Tu pedido VANMOTION ha sido confirmado."
        : "Your VANMOTION order has been confirmed.",
    eyebrow:
      isSpanish
        ? "Compra online · VANMOTION"
        : "Online purchase · VANMOTION",
    title,
    introductionHtml,
    contentHtml:
      detailsHtml + addressNotice,
    footerText:
      isSpanish
        ? "Conserva este correo como referencia de tu compra. Puedes responder directamente si necesitas ayuda."
        : "Keep this email as your purchase reference. You can reply directly if you need assistance.",
    action: {
      label:
        isSpanish
          ? "Visitar la web"
          : "Visit the website",
      href:
        "https://www.vanmotion.es/ropa",
    },
  });

  const customerText = [
    title,
    "",
    isSpanish
      ? `Hola ${customerName},`
      : `Hello ${customerName},`,
    isSpanish
      ? "Hemos recibido correctamente tu pago. Tu pedido ya está registrado en VANMOTION y comenzaremos a prepararlo."
      : "We have received your payment. Your order is now registered with VANMOTION and we will begin preparing it.",
    "",
    `${isSpanish ? "Pedido" : "Order"}: ${input.orderId}`,
    `${isSpanish ? "Producto" : "Product"}: ${input.productName}`,
    `${isSpanish ? "Talla" : "Size"}: ${input.size}`,
    `${isSpanish ? "Cantidad" : "Quantity"}: ${input.quantity}`,
    `Total: ${totalCustomer}`,
    "",
    `${isSpanish ? "Dirección de envío" : "Shipping address"}:`,
    shippingAddressText,
    "",
    isSpanish
      ? "Conserva este correo como referencia de tu compra."
      : "Keep this email as your purchase reference.",
    "https://www.vanmotion.es/ropa",
  ].join("\n");

  const confirmationPromise =
    customerEmail
      ? resend.emails.send({
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
          html: customerHtml,
          text: customerText,
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
      language,
      customerEmailSent:
        Boolean(customerEmail),
      notificationEmailSent:
        Boolean(notificationEmail),
    },
  );
}
