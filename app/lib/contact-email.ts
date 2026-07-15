import { Resend } from "resend";

import { prisma } from "@/app/lib/prisma";

type ContactNotificationInput = {
  vehicleId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  language: "es" | "en";
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

export async function sendContactNotification(
  input: ContactNotificationInput,
): Promise<void> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const notificationEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "VANMOTION <contacto@vanmotion.es>";

  if (!apiKey || !notificationEmail) {
    console.warn(
      "El correo no está completamente configurado. " +
        "La solicitud permanece guardada en PostgreSQL.",
    );

    return;
  }

  const vehicle =
    await prisma.vehicle.findUnique({
      where: {
        id: input.vehicleId,
      },

      select: {
        model: true,
        version: true,

        brand: {
          select: {
            name: true,
          },
        },
      },
    });

  const vehicleName = vehicle
    ? [
        vehicle.brand.name,
        vehicle.model,
        vehicle.version,
      ]
        .filter(Boolean)
        .join(" ")
    : "Vehículo VANMOTION";

  const safeVehicle =
    escapeHtml(vehicleName);

  const safeName =
    escapeHtml(input.name);

  const safeEmail =
    escapeHtml(input.email);

  const safePhone =
    escapeHtml(
      input.phone || "No indicado",
    );

  const safeMessage =
    escapeHtml(input.message).replace(
      /\n/g,
      "<br>",
    );

  const resend = new Resend(apiKey);

  /*
   * 1. Aviso privado para VANMOTION.
   */
  const {
    error: notificationError,
  } = await resend.emails.send({
    from: fromEmail,

    to: [
      notificationEmail,
    ],

    replyTo: input.email,

    subject:
      `Nueva solicitud VANMOTION · ${vehicleName}`,

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
            VANMOTION · SOLICITUD DE VEHÍCULO
          </p>

          <h1
            style="
              margin:0 0 28px;
              font-size:25px;
            "
          >
            Nueva solicitud de información
          </h1>

          <p>
            <strong>Vehículo:</strong><br>
            ${safeVehicle}
          </p>

          <p>
            <strong>Nombre:</strong><br>
            ${safeName}
          </p>

          <p>
            <strong>Correo:</strong><br>
            ${safeEmail}
          </p>

          <p>
            <strong>Teléfono:</strong><br>
            ${safePhone}
          </p>

          <p>
            <strong>Mensaje:</strong><br>
            ${safeMessage}
          </p>

          <div
            style="
              margin-top:30px;
              padding-top:22px;
              border-top:1px solid #333333;
            "
          >
            <a
              href="mailto:${safeEmail}"
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
              line-height:18px;
            "
          >
            La solicitud también está guardada
            en el panel privado de VANMOTION.
          </p>
        </div>
      </div>
    `,
  });

  if (notificationError) {
    throw new Error(
      `No se pudo enviar el aviso a VANMOTION: ${notificationError.message}`,
    );
  }

  /*
   * 2. Confirmación automática para el cliente.
   */
  const isSpanish =
    input.language === "es";

  const confirmationSubject = isSpanish
    ? `Hemos recibido tu solicitud · ${vehicleName}`
    : `We received your enquiry · ${vehicleName}`;

  const confirmationTitle = isSpanish
    ? "Hemos recibido tu solicitud"
    : "We received your enquiry";

  const confirmationGreeting = isSpanish
    ? `Hola ${safeName},`
    : `Hello ${safeName},`;

  const confirmationText = isSpanish
    ? `
        Gracias por contactar con VANMOTION.
        Hemos recibido tu solicitud sobre el vehículo
        <strong>${safeVehicle}</strong>.
        Revisaremos la información y contactaremos contigo personalmente.
      `
    : `
        Thank you for contacting VANMOTION.
        We received your enquiry regarding
        <strong>${safeVehicle}</strong>.
        We will review the information and contact you personally.
      `;

  const confirmationMessageLabel =
    isSpanish
      ? "Tu mensaje"
      : "Your message";

  const confirmationFooter = isSpanish
    ? "Este es un mensaje automático de confirmación. Puedes responder directamente a este correo."
    : "This is an automatic confirmation message. You can reply directly to this email.";

  const {
    error: confirmationError,
  } = await resend.emails.send({
    from: fromEmail,

    to: [
      input.email,
    ],

    replyTo: notificationEmail,

    subject: confirmationSubject,

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
            ${confirmationTitle}
          </h1>

          <p
            style="
              margin:0 0 18px;
              color:#ffffff;
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
            "
          >
            <p
              style="
                margin:0 0 10px;
                font-size:11px;
                letter-spacing:2px;
                color:#777777;
              "
            >
              ${confirmationMessageLabel}
            </p>

            <p
              style="
                margin:0;
                color:#ffffff;
                line-height:24px;
              "
            >
              ${safeMessage}
            </p>
          </div>

          <p
            style="
              margin-top:28px;
              color:#777777;
              font-size:12px;
              line-height:19px;
            "
          >
            ${confirmationFooter}
          </p>

          <p
            style="
              margin-top:28px;
              font-size:12px;
              letter-spacing:2px;
              color:#ffffff;
            "
          >
            HUMILDAD · TRABAJO · MOVIMIENTO
          </p>
        </div>
      </div>
    `,
  });

  if (confirmationError) {
    throw new Error(
      `No se pudo enviar la confirmación al cliente: ${confirmationError.message}`,
    );
  }
}