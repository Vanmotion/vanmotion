"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

const ALLOWED_STATUSES = new Set([
  "AVAILABLE",
  "RESERVED",
  "SOLD",
]);

function requiredString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    throw new Error(
      `El campo “${field}” es obligatorio.`,
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(
      `El campo “${field}” es obligatorio.`,
    );
  }

  return normalized;
}

function optionalString(
  formData: FormData,
  field: string,
): string | null {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function requiredInt(
  formData: FormData,
  field: string,
): number {
  const value = requiredString(
    formData,
    field,
  );

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new Error(
      `El campo “${field}” debe ser un número entero válido.`,
    );
  }

  return parsed;
}

function optionalInt(
  formData: FormData,
  field: string,
): number | null {
  const value = optionalString(
    formData,
    field,
  );

  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new Error(
      `El campo “${field}” debe ser un número entero válido.`,
    );
  }

  return parsed;
}

function requiredPrice(
  formData: FormData,
  field: string,
): string {
  const rawValue = requiredString(
    formData,
    field,
  );

  let normalized = rawValue
    .replace(/[€\s]/g, "")
    .trim();

  if (
    normalized.includes(".") &&
    normalized.includes(",")
  ) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  normalized = normalized.replace(
    /[^\d.-]/g,
    "",
  );

  const amount = Number(normalized);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "El precio debe ser un número válido.",
    );
  }

  return amount.toFixed(2);
}

function checkboxValue(
  formData: FormData,
  field: string,
): boolean {
  const value = formData.get(field);

  return (
    value === "on" ||
    value === "true" ||
    value === "1"
  );
}

function vehicleStatus(
  formData: FormData,
): string {
  const status =
    optionalString(formData, "status") ??
    "AVAILABLE";

  if (!ALLOWED_STATUSES.has(status)) {
    return "AVAILABLE";
  }

  return status;
}

export async function createVehicle(
  formData: FormData,
) {
  const brandId = requiredString(
    formData,
    "brandId",
  );

  const model = requiredString(
    formData,
    "model",
  );

  const version = optionalString(
    formData,
    "version",
  );

  const year = requiredInt(
    formData,
    "year",
  );

  const mileage = requiredInt(
    formData,
    "mileage",
  );

  const price = requiredPrice(
    formData,
    "price",
  );

  const fuel = requiredString(
    formData,
    "fuel",
  );

  const transmission = requiredString(
    formData,
    "transmission",
  );

  const drivetrain = optionalString(
    formData,
    "drivetrain",
  );

  const engine = optionalString(
    formData,
    "engine",
  );

  const power = optionalInt(
    formData,
    "power",
  );

  const color = optionalString(
    formData,
    "color",
  );

  const description = optionalString(
    formData,
    "description",
  );

  const featured = checkboxValue(
    formData,
    "featured",
  );

  const status = vehicleStatus(formData);

  const currentYear =
    new Date().getFullYear();

  if (
    year < 1886 ||
    year > currentYear + 1
  ) {
    throw new Error(
      "El año del vehículo no es válido.",
    );
  }

  if (mileage < 0) {
    throw new Error(
      "El kilometraje no puede ser negativo.",
    );
  }

  if (power !== null && power < 0) {
    throw new Error(
      "La potencia no puede ser negativa.",
    );
  }

  const brand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
    },
  });

  if (!brand) {
    throw new Error(
      "La marca seleccionada no existe.",
    );
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      brandId,
      model,
      version,
      year,
      mileage,
      price,
      fuel,
      transmission,
      drivetrain,
      engine,
      power,
      color,
      description,
      featured,
      status,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/vehicles");
  revalidatePath("/coleccion");
  revalidatePath("/");

  /*
   * Las fotografías se suben después desde la pantalla de edición,
   * que utiliza la carga directa a Vercel Blob.
   */
  redirect(
    `/admin/vehicles/${vehicle.id}/edit`,
  );
}

export async function createVehicleAction(
  formData: FormData,
) {
  return createVehicle(formData);
}