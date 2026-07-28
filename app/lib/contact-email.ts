import { Resend } from "resend";

import {
  renderCustomerEmail,
  renderEmailDetails,
  renderEmailNotice,
} from "@/app/lib/customer-email-template";
import { prisma } from "@/app/lib/prisma";

type ContactNotificationInput = {
  vehicleId?: string | null;
  subject?: string | null;
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

function getErrorMessage(
  value: unknown,
): string {
  if (value instanceof Error) {
    return value.message;
  }

  return String(value);
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

  const vehicle = input.vehicleId
    ? await prisma.vehicle.findUnique({
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
      })
    : null;

  const vehicleName = vehicle
    ? [
        vehicle.brand.name,
        vehicle.model,
        vehicle.version,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  const isVehicleEnquiry =
    Boolean(vehicleName);

  const generalSubject =
    input.subject?.trim() ||
    (input.language === "es"
      ? "Consulta general"
      : "General enquiry");

  const reference =
    vehicleName ?? generalSubject;

  const safeReference =
    escapeHtml(reference);

  const safeName =
    escapeHtml(input.name);

  const safeEmail =
    escapeHtml(input.email);

  const safePhone =
    escapeHtml(
      input.phone ||
        (input.language === "es"
          ? "No indicado"
          : "Not provided"),
    );

  const safeMessage =
    escapeHtml(input.message).replace(
      /\n/g,
      "<br>",
    );

  const resend = new Resend(apiKey);

  const notificationType =
    isVehicleEnquiry
      ? "SOLICITUD DE VEHÍCULO"
      : "CONSULTA GENERAL";

  const notificationTitle =
    isVehicleEnquiry
      ? "Nueva solicitud de información"
      : "Nuevo contacto desde la web";

  const referenceLabel =
    isVehicleEnquiry
      ? "Vehículo"
      : "Asunto";

  const isSpanish =
    input.language === "es";

  const confirmationSubject = isSpanish
    ? `Hemos recibido tu solicitud · ${reference}`
    : `We received your enquiry · ${reference}`;

  const confirmationTitle = isSpanish
    ? "SOLICITUD RECIBIDA"
    : "ENQUIRY RECEIVED";

  const confirmationGreeting = isSpanish
    ? `Hola ${safeName},`
    : `Hello ${safeName},`;

  const confirmationText = isVehicleEnquiry
    ? isSpanish
      ? `Gracias por contactar con VANMOTION. Hemos recibido tu solicitud sobre <strong>${safeReference}</strong>. Revisaremos la información y contactaremos contigo personalmente.`
      : `Thank you for contacting VANMOTION. We received your enquiry regarding <strong>${safeReference}</strong>. We will review the information and contact you personally.`
    : isSpanish
      ? `Gracias por contactar con VANMOTION. Hemos recibido tu consulta sobre <strong>${safeReference}</strong>. Revisaremos tu mensaje y contactaremos contigo personalmente.`
      : `Thank you for contacting VANMOTION. We received your enquiry about <strong>${safeReference}</strong>. We will review your message and contact you personally.`;

  const confirmationFooter = isSpanish
    ? "Este es un mensaje automático de confirmación. Puedes responder directamente a este correo."
    : "This is an automatic confirmation message. You can reply directly to this email.";

  const customerDetails = renderEmailDetails([
    {
      label:
        isVehicleEnquiry
          ? isSpanish
            ? "Vehículo"
            : "Vehicle"
          : isSpanish
            ? "Asunto"
            : "Subject",
      valueHtml:
        safeReference,
    },
    {
      label:
        isSpanish
          ? "Correo"
          : "Email",
      valueHtml:
        safeEmail,
    },
    ...(input.phone
      ? [
          {
            label:
              isSpanish
                ? "Teléfono"
                : "Phone",
            valueHtml:
              safePhone,
          },
        ]
      : []),
  ]);

  const messageNotice = renderEmailNotice(
    isSpanish
      ? "Tu mensaje"
      : "Your message",
    safeMessage,
  );

  const customerHtml = renderCustomerEmail({
    language:
      input.language,
    preheader:
      isSpanish
        ? "VANMOTION ha recibido tu solicitud."
        : "VANMOTION has received your enquiry.",
    eyebrow:
      isVehicleEnquiry
        ? isSpanish
          ? "Vehículos · Contacto directo"
          : "Vehicles · Direct contact"
        : isSpanish
          ? "Contacto directo · VANMOTION"
          : "Direct contact · VANMOTION",
    title:
      confirmationTitle,
    introductionHtml:
      `${confirmationGreeting}<br><br>${confirmationText}`,
    contentHtml:
      customerDetails + messageNotice,
    footerText:
      confirmationFooter,
    action: {
      label:
        isSpanish
          ? "Visitar VANMOTION"
          : "Visit VANMOTION",
      href:
        isVehicleEnquiry
          ? "https://www.vanmotion.es/coleccion"
          : "https://www.vanmotion.es/contacto",
    },
  });

  const customerText = [
    confirmationTitle,
    "",
    isSpanish
      ? `Hola ${input.name},`
      : `Hello ${input.name},`,
    isVehicleEnquiry
      ? isSpanish
        ? `Gracias por contactar con VANMOTION. Hemos recibido tu solicitud sobre ${reference}. Revisaremos la información y contactaremos contigo personalmente.`
        : `Thank you for contacting VANMOTION. We received your enquiry regarding ${reference}. We will review the information and contact you personally.`
      : isSpanish
        ? `Gracias por contactar con VANMOTION. Hemos recibido tu consulta sobre ${reference}. Revisaremos tu mensaje y contactaremos contigo personalmente.`
        : `Thank you for contacting VANMOTION. We received your enquiry about ${reference}. We will review your message and contact you personally.`,
    "",
    `${isVehicleEnquiry ? (isSpanish ? "Vehículo" : "Vehicle") : (isSpanish ? "Asunto" : "Subject")}: ${reference}`,
    `${isSpanish ? "Correo" : "Email"}: ${input.email}`,
    ...(input.phone
      ? [
          `${isSpanish ? "Teléfono" : "Phone"}: ${input.phone}`,
        ]
      : []),
    "",
    `${isSpanish ? "Tu mensaje" : "Your message"}:`,
    input.message,
    "",
    confirmationFooter,
  ].join("\n");

  const [
    notificationResult,
    confirmationResult,
  ] = await Promise.allSettled([
    resend.emails.send({
      from: fromEmail,

      to: [
        notificationEmail,
      ],

      replyTo: input.email,

      subject:
        `Nueva solicitud VANMOTION · ${reference}`,

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
              VANMOTION · ${notificationType}
            </p>

            <h1
              style="
                margin:0 0 28px;
                font-size:25px;
              "
            >
              ${notificationTitle}
            </h1>

            <p><strong>${referenceLabel}:</strong><br>${safeReference}</p>
            <p><strong>Nombre:</strong><br>${safeName}</p>
            <p><strong>Correo:</strong><br>${safeEmail}</p>
            <p><strong>Teléfono:</strong><br>${safePhone}</p>
            <p><strong>Idioma:</strong><br>${input.language.toUpperCase()}</p>
            <p><strong>Mensaje:</strong><br>${safeMessage}</p>

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
                  background:#d97827;
                  color:#080808;
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

      text: [
        `VANMOTION · ${notificationType}`,
        "",
        notificationTitle,
        "",
        `${referenceLabel}: ${reference}`,
        `Nombre: ${input.name}`,
        `Correo: ${input.email}`,
        `Teléfono: ${input.phone || "No indicado"}`,
        `Idioma: ${input.language.toUpperCase()}`,
        "",
        "Mensaje:",
        input.message,
      ].join("\n"),
    }),

    resend.emails.send({
      from: fromEmail,

      to: [
        input.email,
      ],

      replyTo: notificationEmail,

      subject:
        confirmationSubject,

      html:
        customerHtml,

      text:
        customerText,
    }),
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
}
