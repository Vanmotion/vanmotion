"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/app/lib/admin-session";
import { prisma } from "@/app/lib/prisma";

function requiredText(
  formData: FormData,
  fieldName: string,
): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }

  return value.trim();
}

function optionalText(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

export async function saveSiteSettings(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();
  const businessName = requiredText(
    formData,
    "businessName",
  );

  const email = optionalText(
    formData,
    "email",
  );

  const phone = optionalText(
    formData,
    "phone",
  );

  const whatsapp = optionalText(
    formData,
    "whatsapp",
  );

  const address = optionalText(
    formData,
    "address",
  );

  const city = optionalText(
    formData,
    "city",
  );

  const postalCode = optionalText(
    formData,
    "postalCode",
  );

  const instagram = optionalText(
    formData,
    "instagram",
  );

  const youtube = optionalText(
    formData,
    "youtube",
  );

  const tiktok = optionalText(
    formData,
    "tiktok",
  );

  const openingHours = optionalText(
    formData,
    "openingHours",
  );

  await prisma.siteSettings.upsert({
    where: {
      id: "main",
    },

    update: {
      businessName,
      email,
      phone,
      whatsapp,
      address,
      city,
      postalCode,
      instagram,
      youtube,
      tiktok,
      openingHours,
    },

    create: {
      id: "main",
      businessName,
      email,
      phone,
      whatsapp,
      address,
      city,
      postalCode,
      instagram,
      youtube,
      tiktok,
      openingHours,
    },
  });

  updateTag("vanmotion-site-settings");

  revalidatePath("/");
  revalidatePath("/contacto");
  revalidatePath("/coleccion");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/configuracion");

  redirect("/admin/settings?saved=1");
}
