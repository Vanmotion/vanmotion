"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export async function updateVehicleImageAlt(
  formData: FormData
): Promise<void> {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN?.trim();
  const cookieStore = await cookies();
  const currentToken = cookieStore
    .get("vanmotion_admin_session")
    ?.value.trim();

  if (!expectedToken || currentToken !== expectedToken) {
    throw new Error("Acceso no autorizado.");
  }

  const imageId = formData.get("imageId");
  const vehicleId = formData.get("vehicleId");
  const rawAlt = formData.get("alt");

  if (
    typeof imageId !== "string" ||
    !imageId.trim() ||
    typeof vehicleId !== "string" ||
    !vehicleId.trim() ||
    typeof rawAlt !== "string"
  ) {
    throw new Error("Datos de fotografía no válidos.");
  }

  const alt = rawAlt.trim();

  if (!alt || alt.length > 180) {
    throw new Error(
      "La descripción debe contener entre 1 y 180 caracteres."
    );
  }

  const image = await prisma.vehicleImage.findFirst({
    where: {
      id: imageId,
      vehicleId,
    },
    select: {
      id: true,
    },
  });

  if (!image) {
    throw new Error("La fotografía no existe.");
  }

  await prisma.vehicleImage.update({
    where: {
      id: image.id,
    },
    data: {
      alt,
    },
  });

  revalidatePath(`/admin/vehicles/${vehicleId}/images`);
  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
  revalidatePath(`/coleccion/${vehicleId}`);
  revalidatePath("/coleccion");

  redirect(
    `/admin/vehicles/${vehicleId}/images?descripcion=1`
  );
}
