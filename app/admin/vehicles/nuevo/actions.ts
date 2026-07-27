"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/prisma";
import {
  translateVehicleDescriptionToEnglish,
} from "@/app/lib/vehicle-description-translation";

const ADMIN_SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const ALLOWED_STATUSES = new Set([
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "EMBLEM",
]);

const FUEL_ALIASES: Record<string, string> = {
  DIESEL: "DIESEL",
  Diesel: "DIESEL",
  diesel: "DIESEL",

  GASOLINE: "GASOLINE",
  Gasoline: "GASOLINE",
  gasolina: "GASOLINE",
  Gasolina: "GASOLINE",

  HYBRID: "HYBRID",
  Hybrid: "HYBRID",
  hybrid: "HYBRID",
  Híbrido: "HYBRID",
  Hibrido: "HYBRID",

  PLUG_IN_HYBRID: "PLUG_IN_HYBRID",
  "Plug-in hybrid": "PLUG_IN_HYBRID",
  "Híbrido enchufable": "PLUG_IN_HYBRID",
  "Hibrido enchufable": "PLUG_IN_HYBRID",

  ELECTRIC: "ELECTRIC",
  Electric: "ELECTRIC",
  electric: "ELECTRIC",
  Eléctrico: "ELECTRIC",
  Electrico: "ELECTRIC",

  LPG: "LPG",
  GLP: "LPG",
};

const TRANSMISSION_ALIASES: Record<string, string> = {
  MANUAL: "MANUAL",
  Manual: "MANUAL",
  manual: "MANUAL",

  AUTOMATIC: "AUTOMATIC",
  Automatic: "AUTOMATIC",
  automatic: "AUTOMATIC",
  Automática: "AUTOMATIC",
  Automatica: "AUTOMATIC",
};

async function requireAdminSession(): Promise<void> {
  const sessionToken =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  if (!sessionToken) {
    throw new Error(
      "La configuración de acceso al panel no está completa.",
    );
  }

  const cookieStore = await cookies();

  const currentSession =
    cookieStore
      .get(ADMIN_SESSION_COOKIE_NAME)
      ?.value.trim();

  if (currentSession !== sessionToken) {
    throw new Error(
      "No tienes autorización para realizar esta acción.",
    );
  }
}

function normalizeText(
  value: FormDataEntryValue | null,
  maximumLength: number,
): string {
  return String(value ?? "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, maximumLength);
}

function requiredString(
  formData: FormData,
  field: string,
  maximumLength = 500,
): string {
  const normalized = normalizeText(
    formData.get(field),
    maximumLength,
  );

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
  maximumLength = 500,
): string | null {
  const normalized = normalizeText(
    formData.get(field),
    maximumLength,
  );

  return normalized || null;
}

function requiredInt(
  formData: FormData,
  field: string,
): number {
  const value = requiredString(
    formData,
    field,
    30,
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
    30,
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
    50,
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

function normalizeFuel(
  formData: FormData,
): string {
  const receivedFuel = requiredString(
    formData,
    "fuel",
    80,
  );

  const normalizedFuel =
    FUEL_ALIASES[receivedFuel];

  if (!normalizedFuel) {
    throw new Error(
      "El tipo de combustible no es válido.",
    );
  }

  return normalizedFuel;
}

function normalizeTransmission(
  formData: FormData,
): string {
  const receivedTransmission =
    requiredString(
      formData,
      "transmission",
      80,
    );

  const normalizedTransmission =
    TRANSMISSION_ALIASES[
      receivedTransmission
    ];

  if (!normalizedTransmission) {
    throw new Error(
      "El tipo de transmisión no es válido.",
    );
  }

  return normalizedTransmission;
}

function vehicleStatus(
  formData: FormData,
): string {
  const status =
    optionalString(
      formData,
      "status",
      50,
    ) ?? "AVAILABLE";

  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error(
      "El estado del vehículo no es válido.",
    );
  }

  return status;
}

export async function createVehicle(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const brandId = requiredString(
    formData,
    "brandId",
    100,
  );

  const model = requiredString(
    formData,
    "model",
    160,
  );

  const version = optionalString(
    formData,
    "version",
    180,
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

  /*
   * El formulario antiguo enviaba Diesel,
   * Gasoline, Manual y Automatic.
   * La edición utiliza DIESEL, GASOLINE,
   * MANUAL y AUTOMATIC. Normalizamos ambos
   * formatos para guardar siempre el valor
   * canónico en PostgreSQL.
   */
  const fuel = normalizeFuel(formData);
  const transmission =
    normalizeTransmission(formData);

  const drivetrain = optionalString(
    formData,
    "drivetrain",
    100,
  );

  const engine = optionalString(
    formData,
    "engine",
    120,
  );

  const power = optionalInt(
    formData,
    "power",
  );

  const color = optionalString(
    formData,
    "color",
    100,
  );

  const description = optionalString(
    formData,
    "description",
    10000,
  );

  const descriptionEn =
    await translateVehicleDescriptionToEnglish(
      description,
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
      descriptionEn,
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

  redirect(
    `/admin/vehicles/${vehicle.id}/edit`,
  );
}

export async function createVehicleAction(
  formData: FormData,
): Promise<void> {
  return createVehicle(formData);
}
