"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/app/lib/prisma";

function requiredText(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error("El nombre de la marca es obligatorio.");
  }

  return value.trim();
}

function createSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function refreshBrandPaths() {
  revalidatePath("/");
  revalidatePath("/coleccion");
  revalidatePath("/admin");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/marcas");
  revalidatePath("/admin/vehicles");
  revalidatePath("/admin/vehicles/nuevo");
}

export async function createBrand(formData: FormData) {
  const name = requiredText(formData, "name");
  const slug = createSlug(name);

  if (!slug) {
    throw new Error("El nombre de la marca no es válido.");
  }

  const existingBrand = await prisma.brand.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingBrand) {
    throw new Error("Ya existe una marca con ese nombre.");
  }

  await prisma.brand.create({
    data: {
      name,
      slug,
    },
  });

  refreshBrandPaths();
}

export async function updateBrand(
  brandId: string,
  formData: FormData,
) {
  const name = requiredText(formData, "name");
  const slug = createSlug(name);

  if (!slug) {
    throw new Error("El nombre de la marca no es válido.");
  }

  const currentBrand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
    },
  });

  if (!currentBrand) {
    throw new Error("La marca que intentas modificar no existe.");
  }

  const duplicateBrand = await prisma.brand.findFirst({
    where: {
      slug,
      id: {
        not: brandId,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateBrand) {
    throw new Error("Ya existe otra marca con ese nombre.");
  }

  await prisma.brand.update({
    where: {
      id: brandId,
    },
    data: {
      name,
      slug,
    },
  });

  refreshBrandPaths();
}

export async function deleteBrand(brandId: string) {
  const brand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
  });

  if (!brand) {
    throw new Error("La marca ya no existe.");
  }

  if (brand._count.vehicles > 0) {
    throw new Error(
      `No puedes eliminar ${brand.name} porque tiene vehículos asociados.`,
    );
  }

  await prisma.brand.delete({
    where: {
      id: brandId,
    },
  });

  refreshBrandPaths();
}