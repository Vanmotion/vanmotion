"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

function getText(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createComparisonKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function redirectWithMessage(
  type: "success" | "error",
  message: string,
): never {
  redirect(
    `/admin/brands?${type}=${encodeURIComponent(message)}`,
  );
}

export async function createBrand(formData: FormData) {
  const name = getText(formData, "name");

  if (!name) {
    redirectWithMessage(
      "error",
      "Debes introducir el nombre de la marca.",
    );
  }

  if (name.length < 2 || name.length > 60) {
    redirectWithMessage(
      "error",
      "El nombre debe tener entre 2 y 60 caracteres.",
    );
  }

  const slug = createSlug(name);

  if (!slug) {
    redirectWithMessage(
      "error",
      "No se ha podido generar un identificador válido.",
    );
  }

  const comparisonKey = createComparisonKey(name);

  const existingBrands = await prisma.brand.findMany({
    select: {
      name: true,
      slug: true,
    },
  });

  const duplicateBrand = existingBrands.some((brand) => {
    return (
      createComparisonKey(brand.name) === comparisonKey ||
      createComparisonKey(brand.slug) === comparisonKey
    );
  });

  if (duplicateBrand) {
    redirectWithMessage(
      "error",
      `La marca "${name}" ya está registrada.`,
    );
  }

  const existingSlug = await prisma.brand.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingSlug) {
    redirectWithMessage(
      "error",
      "Ya existe una marca con un nombre equivalente.",
    );
  }

  await prisma.brand.create({
    data: {
      name,
      slug,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/vehicles");
  revalidatePath("/admin/vehicles/new");

  redirectWithMessage(
    "success",
    `Marca "${name}" creada correctamente.`,
  );
}

export async function deleteBrand(formData: FormData) {
  const brandId = getText(formData, "brandId");

  if (!brandId) {
    redirectWithMessage(
      "error",
      "No se ha recibido el identificador de la marca.",
    );
  }

  const brand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      name: true,
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
  });

  if (!brand) {
    redirectWithMessage(
      "error",
      "La marca seleccionada no existe.",
    );
  }

  if (brand._count.vehicles > 0) {
    redirectWithMessage(
      "error",
      `No puedes eliminar "${brand.name}" porque tiene ${brand._count.vehicles} vehículo asociado.`,
    );
  }

  await prisma.brand.delete({
    where: {
      id: brandId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/vehicles/new");

  redirectWithMessage(
    "success",
    `Marca "${brand.name}" eliminada correctamente.`,
  );
}