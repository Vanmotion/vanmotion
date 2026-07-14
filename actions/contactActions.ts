"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendContactNotification } from "@/app/lib/contact-email";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

const allowedStatuses = [
  "PENDING",
  "CONTACTED",
  "CLOSED",
] as const;

type ContactStatus =
  (typeof allowedStatuses)[number];

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
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

export async function createContactRequest(
  formData: FormData,
): Promise<void> {
  const language = await getCurrentLanguage();
  const errors = translations[language];

  const vehicleId = getText(
    formData,
    "vehicleId",
  );

  const name = normaliseText(
    getText(formData, "name"),
    120,
  );

  const email = normaliseText(
    getText(formData, "email").toLowerCase(),
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

  if (
    !vehicleId ||
    !name ||
    !email ||
    !message
  ) {
    throw new Error(errors.requiredFields);
  }

  if (!isValidEmail(email)) {
    throw new Error(errors.invalidEmail);
  }

  const vehicle =
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
      errors.unavailableVehicle,
    );
  }

  await prisma.contactRequest.create({
    data: {
      vehicleId: vehicle.id,
      name,
      email,
      phone: phone || null,
      message,
      status: "PENDING",
    },
  });

  /*
   * El contacto queda guardado en PostgreSQL
   * aunque Resend todavía no esté configurado
   * o el envío del correo falle.
   */
  try {
    await sendContactNotification({
      vehicleId: vehicle.id,
      name,
      email,
      phone: phone || null,
      message,
    });
  } catch (error) {
    console.error(
      "La solicitud se guardó, pero el correo no pudo enviarse:",
      error,
    );
  }

  revalidatePath("/admin/contacts");
  revalidatePath("/admin/contactos");

  redirect(
    `/coleccion/${vehicle.id}?enviado=1`,
  );
}

export async function updateContactStatus(
  formData: FormData,
): Promise<void> {
  const contactId = getText(
    formData,
    "contactId",
  );

  const status = getText(
    formData,
    "status",
  );

  if (!contactId) {
    throw new Error(
      "No se ha recibido el identificador de la solicitud.",
    );
  }

  if (
    !allowedStatuses.includes(
      status as ContactStatus,
    )
  ) {
    throw new Error(
      "El estado seleccionado no es válido.",
    );
  }

  await prisma.contactRequest.update({
    where: {
      id: contactId,
    },

    data: {
      status,
    },
  });

  revalidatePath("/admin/contacts");
  revalidatePath("/admin/contactos");
}

export async function deleteContactRequest(
  formData: FormData,
): Promise<void> {
  const contactId = getText(
    formData,
    "contactId",
  );

  if (!contactId) {
    throw new Error(
      "No se ha recibido el identificador de la solicitud.",
    );
  }

  await prisma.contactRequest.delete({
    where: {
      id: contactId,
    },
  });

  revalidatePath("/admin/contacts");
  revalidatePath("/admin/contactos");
}