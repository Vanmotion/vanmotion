"use server";

import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

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

  const normalized = value.replace(
    /[^\d-]/g,
    "",
  );

  const parsed = Number.parseInt(
    normalized,
    10,
  );

  if (!Number.isInteger(parsed)) {
    throw new Error(
      `El campo “${field}” debe ser un número válido.`,
    );
  }

  return parsed;
}

function optionalInt(
  formData: FormData,
  field: string,
): number | null {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .replace(/[^\d-]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(
    normalized,
    10,
  );

  return Number.isNaN(parsed)
    ? null
    : parsed;
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

function vehicleIdFromForm(
  formData: FormData,
): string {
  const possibleFields = [
    "id",
    "vehicleId",
  ];

  for (const field of possibleFields) {
    const value = formData.get(field);

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  throw new Error(
    "No se ha identificado el vehículo.",
  );
}

function imageIdFromForm(
  formData: FormData,
): string {
  const possibleFields = [
    "imageId",
    "id",
  ];

  for (const field of possibleFields) {
    const value = formData.get(field);

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  throw new Error(
    "No se ha identificado la imagen.",
  );
}

function safeFileName(
  fileName: string,
): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getImageFiles(
  formData: FormData,
): File[] {
  const possibleFields = [
    "images",
    "imageFiles",
    "photos",
  ];

  const files: File[] = [];

  for (const field of possibleFields) {
    const values = formData.getAll(field);

    for (const value of values) {
      if (
        value instanceof File &&
        value.size > 0
      ) {
        files.push(value);
      }
    }
  }

  return Array.from(
    new Set(files),
  ).slice(0, MAX_IMAGES);
}

function validateImageFile(file: File) {
  const extension = path
    .extname(file.name)
    .toLowerCase();

  const validMime =
    ALLOWED_IMAGE_TYPES.has(file.type);

  const validExtension =
    ALLOWED_IMAGE_EXTENSIONS.has(extension);

  if (!validMime && !validExtension) {
    throw new Error(
      `El archivo “${file.name}” no tiene un formato permitido.`,
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `La imagen “${file.name}” supera los 8 MB.`,
    );
  }
}

async function saveVehicleImages({
  vehicleId,
  files,
  alt,
}: {
  vehicleId: string;
  files: File[];
  alt: string;
}) {
  if (files.length === 0) {
    return;
  }

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "vehicles",
  );

  await mkdir(uploadDirectory, {
    recursive: true,
  });

  const currentMaximum =
    await prisma.vehicleImage.aggregate({
      where: {
        vehicleId,
      },
      _max: {
        sortOrder: true,
      },
    });

  const firstSortOrder =
    (currentMaximum._max.sortOrder ?? -1) +
    1;

  const imageRecords: Array<{
    vehicleId: string;
    url: string;
    alt: string;
    sortOrder: number;
  }> = [];

  for (
    let index = 0;
    index < files.length;
    index += 1
  ) {
    const file = files[index];

    validateImageFile(file);

    const originalExtension = path
      .extname(file.name)
      .toLowerCase();

    const extension =
      originalExtension || ".jpg";

    const fileName = safeFileName(
      `${vehicleId}-${Date.now()}-${index}${extension}`,
    );

    const destination = path.join(
      uploadDirectory,
      fileName,
    );

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    await writeFile(destination, buffer);

    imageRecords.push({
      vehicleId,
      url: `/uploads/vehicles/${fileName}`,
      alt,
      sortOrder: firstSortOrder + index,
    });
  }

  await prisma.vehicleImage.createMany({
    data: imageRecords,
  });
}

async function normalizeImageOrder(
  vehicleId: string,
) {
  const images =
    await prisma.vehicleImage.findMany({
      where: {
        vehicleId,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  if (images.length === 0) {
    return;
  }

  await prisma.$transaction(
    images.map((image, index) =>
      prisma.vehicleImage.update({
        where: {
          id: image.id,
        },
        data: {
          sortOrder: index,
        },
      }),
    ),
  );
}

async function removeLocalImageFile(
  imageUrl: string,
) {
  if (
    !imageUrl.startsWith(
      "/uploads/vehicles/",
    )
  ) {
    return;
  }

  const publicDirectory = path.join(
    process.cwd(),
    "public",
  );

  const uploadsDirectory = path.join(
    publicDirectory,
    "uploads",
    "vehicles",
  );

  const filePath = path.join(
    publicDirectory,
    imageUrl.replace(/^\/+/, ""),
  );

  if (
    !filePath.startsWith(
      uploadsDirectory,
    )
  ) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    // El archivo físico puede haber sido
    // eliminado anteriormente.
  }
}

function refreshVehiclePages(
  vehicleId: string,
) {
  revalidatePath("/admin");
  revalidatePath("/admin/vehicles");
  revalidatePath(
    `/admin/vehicles/${vehicleId}/edit`,
  );
  revalidatePath("/coleccion");
  revalidatePath(
    `/coleccion/${vehicleId}`,
  );
  revalidatePath("/");
}

export async function updateVehicle(
  formData: FormData,
) {
  const id = vehicleIdFromForm(formData);

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

  const [vehicle, brand] =
    await Promise.all([
      prisma.vehicle.findUnique({
        where: {
          id,
        },
      }),

      prisma.brand.findUnique({
        where: {
          id: brandId,
        },
      }),
    ]);

  if (!vehicle) {
    throw new Error(
      "El vehículo no existe.",
    );
  }

  if (!brand) {
    throw new Error(
      "La marca seleccionada no existe.",
    );
  }

  await prisma.vehicle.update({
    where: {
      id,
    },
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
  });

  const imageFiles =
    getImageFiles(formData);

  await saveVehicleImages({
    vehicleId: id,
    files: imageFiles,
    alt: `${brand.name} ${model}`,
  });

  refreshVehiclePages(id);

  redirect(
    `/admin/vehicles/${id}/edit`,
  );
}

export async function updateVehicleAction(
  formData: FormData,
) {
  return updateVehicle(formData);
}

export async function uploadVehicleImages(
  formData: FormData,
) {
  const vehicleId =
    vehicleIdFromForm(formData);

  const vehicle =
    await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      include: {
        brand: true,
      },
    });

  if (!vehicle) {
    throw new Error(
      "El vehículo no existe.",
    );
  }

  const files = getImageFiles(formData);

  if (files.length === 0) {
    throw new Error(
      "Selecciona al menos una imagen.",
    );
  }

  await saveVehicleImages({
    vehicleId,
    files,
    alt: `${vehicle.brand.name} ${vehicle.model}`,
  });

  refreshVehiclePages(vehicleId);
}

export async function setVehicleCoverImage(
  formData: FormData,
) {
  const vehicleId =
    vehicleIdFromForm(formData);

  const imageId =
    imageIdFromForm(formData);

  const images =
    await prisma.vehicleImage.findMany({
      where: {
        vehicleId,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  const selectedImage = images.find(
    (image) => image.id === imageId,
  );

  if (!selectedImage) {
    throw new Error(
      "La imagen seleccionada no existe.",
    );
  }

  const reorderedImages = [
    selectedImage,
    ...images.filter(
      (image) => image.id !== imageId,
    ),
  ];

  await prisma.$transaction(
    reorderedImages.map(
      (image, index) =>
        prisma.vehicleImage.update({
          where: {
            id: image.id,
          },
          data: {
            sortOrder: index,
          },
        }),
    ),
  );

  refreshVehiclePages(vehicleId);
}

export async function moveVehicleImage(
  formData: FormData,
) {
  const vehicleId =
    vehicleIdFromForm(formData);

  const imageId =
    imageIdFromForm(formData);

  const direction =
    optionalString(
      formData,
      "direction",
    ) ?? "up";

  const images =
    await prisma.vehicleImage.findMany({
      where: {
        vehicleId,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  const currentIndex = images.findIndex(
    (image) => image.id === imageId,
  );

  if (currentIndex === -1) {
    throw new Error(
      "La imagen seleccionada no existe.",
    );
  }

  const targetIndex =
    direction === "down"
      ? currentIndex + 1
      : currentIndex - 1;

  if (
    targetIndex < 0 ||
    targetIndex >= images.length
  ) {
    return;
  }

  const reorderedImages = [...images];

  [
    reorderedImages[currentIndex],
    reorderedImages[targetIndex],
  ] = [
    reorderedImages[targetIndex],
    reorderedImages[currentIndex],
  ];

  await prisma.$transaction(
    reorderedImages.map(
      (image, index) =>
        prisma.vehicleImage.update({
          where: {
            id: image.id,
          },
          data: {
            sortOrder: index,
          },
        }),
    ),
  );

  refreshVehiclePages(vehicleId);
}

export async function deleteVehicleImage(
  formData: FormData,
) {
  const vehicleId =
    vehicleIdFromForm(formData);

  const imageId =
    imageIdFromForm(formData);

  const image =
    await prisma.vehicleImage.findFirst({
      where: {
        id: imageId,
        vehicleId,
      },
    });

  if (!image) {
    throw new Error(
      "La imagen seleccionada no existe.",
    );
  }

  await prisma.vehicleImage.delete({
    where: {
      id: image.id,
    },
  });

  await removeLocalImageFile(image.url);

  await normalizeImageOrder(vehicleId);

  refreshVehiclePages(vehicleId);
}