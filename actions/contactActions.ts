"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendContactNotification } from "@/app/lib/contact-email";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const allowedStatuses = [
  "PENDING",
  "CONTACTED",
  "CLOSED",
] as const;

type ContactStatus =
  (typeof allowedStatuses)[number];

const allowedTopics = [
  "GENERAL",
  "VEHICLES",
  "MUSIC",
  "CLOTHING",
  "PROJECTS",
] as const;

type ContactTopic =
  (typeof allowedTopics)[number];

type AdminContactPath =
  | "/admin/contacts"
  | "/admin/contactos";

const translations = {
  es: {
    requiredFields:
      "Debes completar el nombre, el correo electrónico y el mensaje.",

    invalidEmail:
      "El correo electrónico introducido no es válido.",

    unavailableVehicle:
      "El vehículo seleccionado ya no está disponible.",

    invalidContact:
      "No se ha recibido el identificador de la solicitud.",

    invalidStatus:
      "El estado seleccionado no es válido.",

    topics: {
      GENERAL: "Consulta general",
      VEHICLES: "Vehículos",
      MUSIC: "Música",
      CLOTHING: "Ropa",
      PROJECTS: "Proyectos y colaboraciones",
    },
  },

  en: {
    requiredFields:
      "You must complete your name, email address and message.",

    invalidEmail:
      "The email address entered is not valid.",

    unavailableVehicle:
      "The selected vehicle is no longer available.",

    invalidContact:
      "The enquiry identifier was not received.",

    invalidStatus:
      "The selected status is not valid.",

    topics: {
      GENERAL: "General enquiry",
      VEHICLES: "Vehicles",
      MUSIC: "Music",
      CLOTHING: "Clothing",
      PROJECTS: "Projects and collaborations",
    },
  },
} as const;

function getText(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function normaliseText(
  value: string,
  maximumLength: number,
): string {
  return value
    .replace(/\0/g, "")
    .trim()
    .slice(0, maximumLength);
}

/** Validación antibots en servidor: imprescindible ANTES de escribir en BD o enviar correo. */
async function verifyContactTurnstile(formData: FormData): Promise<"ok" | "bot" | "invalid"> {
  // Los bots suelen rellenar esta casilla oculta: nunca llega al contacto real.
  if (getText(formData, "companyWebsite")) {
    return "bot";
  }

  // Solo se registran códigos de error: NUNCA claves, tokens ni datos personales.
  const fail = (reason: string, details: Record<string, unknown> = {}) => {
    console.warn("VANMOTION_TURNSTILE_VERIFICATION_FAILED", { reason, ...details });
    return "invalid" as const;
  };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const token = getText(formData, "cf-turnstile-response");

  // Fail closed: nunca aceptar solicitudes sin captcha validado.
  if (!secret) return fail("missing-secret-key");
  if (!token) return fail("missing-token");
  if (token.length > 2048) return fail("invalid-token-length");

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      return fail("siteverify-http-error", { status: response.status });
    }

    const data = (await response.json()) as {
      success?: boolean;
      hostname?: string;
      "error-codes"?: string[];
    };

    if (data.success !== true) {
      return fail("siteverify-rejected", { codes: data["error-codes"] ?? [] });
    }

    if (data.hostname !== "www.vanmotion.es" && data.hostname !== "vanmotion.es") {
      return fail("hostname-mismatch", { hostname: data.hostname ?? "unknown" });
    }

    return "ok";
  } catch (error) {
    return fail("siteverify-request-failed", {
      type: error instanceof Error ? error.name : "unknown",
    });
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function isContactStatus(
  value: string,
): value is ContactStatus {
  return allowedStatuses.includes(
    value as ContactStatus,
  );
}

function isContactTopic(
  value: string,
): value is ContactTopic {
  return allowedTopics.includes(
    value as ContactTopic,
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

/*
 * Comprueba la sesión dentro de cada Server Action privada.
 *
 * El proxy protege la navegación hacia /admin, pero esta
 * validación adicional evita que las acciones administrativas
 * puedan ejecutarse directamente sin una sesión válida.
 */
async function requireAdminSession(): Promise<void> {
  const expectedToken =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  const cookieStore = await cookies();

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

/*
 * Detecta desde qué panel se ha enviado el formulario.
 * Tras guardar o eliminar, fuerza una navegación nueva
 * para que el estado mostrado no vuelva al valor anterior.
 */
async function getAdminContactPath(): Promise<AdminContactPath> {
  const headerList = await headers();
  const referer = headerList.get("referer");

  if (!referer) {
    return "/admin/contactos";
  }

  try {
    const pathname =
      new URL(referer).pathname;

    if (pathname === "/admin/contacts") {
      return "/admin/contacts";
    }

    if (
      pathname === "/admin/contactos"
    ) {
      return "/admin/contactos";
    }
  } catch {
    // Si la cabecera no es una URL válida,
    // utilizamos el panel principal en español.
  }

  return "/admin/contactos";
}

/*
 * Crea una solicitud desde:
 *
 * - La ficha pública de un vehículo disponible.
 * - El formulario general de /contacto.
 *
 * La solicitud se guarda antes de intentar enviar los correos.
 *
 * Si el envío falla, la solicitud sigue guardada en el panel,
 * pero nunca se muestra una confirmación falsa al usuario.
 */
export async function createContactRequest(
  formData: FormData,
): Promise<void> {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  const vehicleId = normaliseText(
    getText(formData, "vehicleId"),
    120,
  );

  const name = normaliseText(
    getText(formData, "contactName"),
    120,
  );

  const email = normaliseText(
    getText(
      formData,
      "email",
    ).toLowerCase(),
    180,
  );

  const phone = normaliseText(
    getText(formData, "phone"),
    40,
  );

  const message = normaliseText(
    getText(formData, "message"),
    3000,
  );

  // Rechazar bots sin almacenar nada ni lanzar errores de servidor.
  const securityCheck = await verifyContactTurnstile(formData);
  if (securityCheck === "bot") {
    return;
  }
  if (securityCheck !== "ok") {
    redirect(vehicleId
      ? `/coleccion/${encodeURIComponent(vehicleId)}?enviado=0&error=verificacion#confirmacion`
      : "/contacto?enviado=0&error=verificacion#formulario");
  }

  if (!name || !email || !message) {
    throw new Error(
      content.requiredFields,
    );
  }

  if (!isValidEmail(email)) {
    throw new Error(
      content.invalidEmail,
    );
  }

  // Límite persistente: una solicitud cada 10 minutos por correo.
  const recentRequest = await prisma.contactRequest.findFirst({
    where: {
      email,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (recentRequest) {
    redirect(vehicleId
      ? `/coleccion/${encodeURIComponent(vehicleId)}?enviado=0&error=limite#confirmacion`
      : "/contacto?enviado=0&error=limite#formulario");
  }

  let vehicle: {
    id: string;
  } | null = null;

  if (vehicleId) {
    vehicle =
      await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          status: "AVAILABLE",
        },

        select: {
          id: true,
        },
      });

    if (!vehicle) {
      throw new Error(
        content.unavailableVehicle,
      );
    }
  }

  const rawTopic = getText(
    formData,
    "topic",
  ).toUpperCase();

  const topic: ContactTopic =
    isContactTopic(rawTopic)
      ? rawTopic
      : "GENERAL";

  const subject = vehicle
    ? null
    : content.topics[topic];

  const contactRequest =
    await prisma.contactRequest.create({
      data: {
        ...(vehicle
          ? {
              vehicleId: vehicle.id,
            }
          : {}),

        subject,
        name,
        email,
        phone: phone || null,
        message,
        status: "PENDING",
      },

      select: {
        id: true,
      },
    });

  const emailConfigurationIsComplete =
    Boolean(
      process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_NOTIFICATION_EMAIL?.trim(),
    );

  let emailDeliveryFailed = false;

  if (!emailConfigurationIsComplete) {
    emailDeliveryFailed = true;

    console.error(
      "VANMOTION_CONTACT_EMAIL_FAILED",
      {
        contactRequestId:
          contactRequest.id,
        reason:
          "Faltan RESEND_API_KEY o CONTACT_NOTIFICATION_EMAIL.",
      },
    );
  } else {
    try {
      await sendContactNotification({
        vehicleId:
          vehicle?.id ?? null,
        subject,
        name,
        email,
        phone:
          phone || null,
        message,
        language,
      });

      console.info(
        "VANMOTION_CONTACT_EMAIL_SENT",
        {
          contactRequestId:
            contactRequest.id,
        },
      );
    } catch (error) {
      emailDeliveryFailed = true;

      console.error(
        "VANMOTION_CONTACT_EMAIL_FAILED",
        {
          contactRequestId:
            contactRequest.id,
          reason:
            getErrorMessage(error),
        },
      );
    }
  }

  revalidatePath(
    "/admin/contacts",
  );

  revalidatePath(
    "/admin/contactos",
  );

  if (vehicle) {
    if (emailDeliveryFailed) {
      redirect(
        `/coleccion/${vehicle.id}?enviado=0&error=correo#confirmacion`,
      );
    }

    redirect(
      `/coleccion/${vehicle.id}?enviado=1#confirmacion`,
    );
  }

  revalidatePath("/contacto");

  if (emailDeliveryFailed) {
    redirect(
      "/contacto?enviado=0&error=correo#formulario",
    );
  }

  redirect(
    "/contacto?enviado=1#formulario",
  );
}

/*
 * Cambia una solicitud entre:
 *
 * - PENDING
 * - CONTACTED
 * - CLOSED
 *
 * La acción comprueba primero que existe una sesión
 * administrativa válida.
 */
export async function updateContactStatus(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const language =
    await getCurrentLanguage();

  const errors =
    translations[language];

  const contactId = normaliseText(
    getText(formData, "contactId"),
    120,
  );

  const status = getText(
    formData,
    "status",
  );

  if (!contactId) {
    throw new Error(
      errors.invalidContact,
    );
  }

  if (!isContactStatus(status)) {
    throw new Error(
      errors.invalidStatus,
    );
  }

  const returnPath =
    await getAdminContactPath();

  await prisma.contactRequest.update({
    where: {
      id: contactId,
    },

    data: {
      status,
    },
  });

  revalidatePath(
    "/admin/contacts",
  );

  revalidatePath(
    "/admin/contactos",
  );

  redirect(returnPath);
}

/*
 * Elimina una solicitud del panel privado.
 * La acción comprueba primero que existe una sesión
 * administrativa válida.
 */
export async function deleteContactRequest(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const language =
    await getCurrentLanguage();

  const errors =
    translations[language];

  const contactId = normaliseText(
    getText(formData, "contactId"),
    120,
  );

  if (!contactId) {
    throw new Error(
      errors.invalidContact,
    );
  }

  const returnPath =
    await getAdminContactPath();

  await prisma.contactRequest.delete({
    where: {
      id: contactId,
    },
  });

  revalidatePath(
    "/admin/contacts",
  );

  revalidatePath(
    "/admin/contactos",
  );

  redirect(returnPath);
}
