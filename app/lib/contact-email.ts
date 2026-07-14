import { Resend } from "resend";

import { prisma } from "@/app/lib/prisma";

type ContactNotificationInput = {
  vehicleId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
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
    (character) => characters[character] ?? character,
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
    "VANMOTION <onboarding@resend.dev>";

  if (!apiKey || !notificationEmail) {
    console.warn(
      "El correo no está completamente configurado. " +
        "La solicitud permanece guardada en PostgreSQL.",
    );

    return;
  }

  const vehicle = await prisma.vehicle.findUnique({
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

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [notificationEmail],
    subject: `Nueva solicitud VANMOTION · ${vehicleName}`,

    html: `
      <div style="background:#080808;color:#ffffff;padding:30px;font-family:Arial,sans-serif">
        <div style="max-width:620px;margin:auto;border:1px solid #333;padding:28px">
          <p style="font-size:11px;letter-spacing:3px;color:#888">
            VANMOTION · SOLICITUD DE VEHÍCULO
          </p>

          <h1 style="font-size:25px">
            Nueva solicitud de información
          </h1>

          <p><strong>Vehículo:</strong><br>
            ${escapeHtml(vehicleName)}
          </p>

          <p><strong>Nombre:</strong><br>
            ${escapeHtml(input.name)}
          </p>

          <p><strong>Correo:</strong><br>
            ${escapeHtml(input.email)}
          </p>

          <p><strong>Teléfono:</strong><br>
            ${escapeHtml(input.phone || "No indicado")}
          </p>

          <p><strong>Mensaje:</strong><br>
            ${escapeHtml(input.message).replace(/\n/g, "<br>")}
          </p>

          <p style="margin-top:30px;color:#777;font-size:12px">
            La solicitud también está guardada en el panel privado de VANMOTION.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(
      `No se pudo enviar el correo: ${error.message}`,
    );
  }
}