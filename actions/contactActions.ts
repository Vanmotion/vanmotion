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
    getText(formData, "name"),
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
  });

  try {
    await sendContactNotification({
      vehicleId: vehicle?.id ?? null,
      subject,
      name,
      email,
      phone: phone || null,
      message,
      language,
    });
  } catch (error) {
    console.error(
      "La solicitud se guardó, pero uno de los correos no pudo enviarse:",
      error,
    );
  }

  revalidatePath(
    "/admin/contacts",
  );

  revalidatePath(
    "/admin/contactos",
  );

  if (vehicle) {
    redirect(
      `/coleccion/${vehicle.id}?enviado=1`,
    );
  }

  revalidatePath("/contacto");

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