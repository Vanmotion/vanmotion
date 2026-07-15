"use server";

import { unlink } from "node:fs/promises";
import { basename, join } from "node:path";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

function getText(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

function getOptionalText(
  formData: FormData,
  field: string,
): string | undefined {
  const value = getText(formData, field);
  return value === "" ? undefined : value;
}

function validateVehicleData({
  brandId,
  model,
  fuel,
  transmission,
  year,
  mileage,
  price,
  power,
}: {
  brandId: string;
  model: string;
  fuel: string;
  transmission: string;
  year: number;
  mileage: number;
  price: number;
  power?: number;
}) {
  if (
    !brandId ||
    !model ||
    !fuel ||
    !transmission ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100 ||
    !Number.isInteger(mileage) ||
    mileage < 0 ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      "Los datos obligatorios del vehículo no son válidos.",
    );
  }

  if (
    power !== undefined &&
    (!Number.isInteger(power) || power < 0)
  ) {
    throw new Error(
      "La potencia debe introducirse solamente como número.",
    );
  }
}

function validateImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      throw new Error();
    }
  } catch {
    throw new Error(
      "La dirección de la imagen no es una URL válida.",
    );
  }
}

function getImageFile(formData: FormData): File {
  const value = formData.get("image");

  if (!(value instanceof File) || value.size === 0) {
    throw new Error(
      "Debes seleccionar una fotografía.",
    );
  }

  if (!(value.type in ALLOWED_IMAGE_TYPES)) {
    throw new Error(
      "La imagen debe estar en formato JPG, PNG, WebP o AVIF.",
    );
  }

  if (value.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      "La imagen no puede superar los 4 MB.",
    );
  }

  return value;
}

function getUploadsDirectory(): string {
  return join(
    process.cwd(),
    "public",
    "uploads",
    "vehicles",
  );
}

function isVercelBlobUrl(imageUrl: string): boolean {
  try {
    const parsedUrl = new URL(imageUrl);

    return parsedUrl.hostname.endsWith(
      ".blob.vercel-storage.com",
    );
  } catch {
    return false;
  }
}

async function removeStoredVehicleImage(
  imageUrl: string,
): Promise<void> {
  if (isVercelBlobUrl(imageUrl)) {
    try {
      await del(imageUrl);
    } catch (error) {
      console.error(
        "No se ha podido eliminar la imagen de Vercel Blob:",
        error,
      );
    }

    return;
  }

  const prefix = "/uploads/vehicles/";

  if (!imageUrl.startsWith(prefix)) {
    return;
  }

  const filename = basename(imageUrl);

  if (!filename) {
    return;
  }

  const filePath = join(
    getUploadsDirectory(),
    filename,
  );

  try {
    await unlink(filePath);
  } catch (error) {
    const code =
      error instanceof Error && "code" in error
        ? String(error.code)
        : "";

    if (code !== "ENOENT") {
      console.error(
        "No se ha podido eliminar la imagen local:",
        error,
      );
    }
  }
}

function revalidateVehiclePages(vehicleId: string) {
  revalidatePath("/");
  revalidatePath("/coleccion");
  revalidatePath(`/coleccion/${vehicleId}`);

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
  revalidatePath(`/admin/vehicles/${vehicleId}/images`);
}

export async function createVehicle(formData: FormData) {
  const brandId = getText(formData, "brandId");
  const model = getText(formData, "model");
  const fuel = getText(formData, "fuel");
  const transmission = getText(formData, "transmission");

  const year = Number(formData.get("year"));
  const mileage = Number(formData.get("mileage"));
  const price = Number(formData.get("price"));

  const version = getOptionalText(formData, "version");
  const drivetrain = getOptionalText(
    formData,
    "drivetrain",
  );
  const engine = getOptionalText(formData, "engine");
  const color = getOptionalText(formData, "color");
  const description = getOptionalText(
    formData,
    "description",
  );
  const imageUrl = getOptionalText(formData, "imageUrl");

  const powerText = getText(formData, "power");
  const power =
    powerText === "" ? undefined : Number(powerText);

  const status =
    getOptionalText(formData, "status") ?? "AVAILABLE";

  const featured = formData.get("featured") === "true";

  validateVehicleData({
    brandId,
    model,
    fuel,
    transmission,
    year,
    mileage,
    price,
    power,
  });

  if (imageUrl) {
    validateImageUrl(imageUrl);
  }

  await prisma.vehicle.create({
    data: {
      brandId,
      model,
      year,
      mileage,
      fuel,
      transmission,
      price,
      featured,
      status,

      ...(version ? { version } : {}),
      ...(drivetrain ? { drivetrain } : {}),
      ...(engine ? { engine } : {}),
      ...(power !== undefined ? { power } : {}),
      ...(color ? { color } : {}),
      ...(description ? { description } : {}),

      ...(imageUrl
        ? {
            images: {
              create: {
                url: imageUrl,
                alt: `${model}${version ? ` ${version}` : ""}`,
                sortOrder: 0,
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/vehicles");
  revalidatePath("/coleccion");
  revalidatePath("/");

  redirect("/admin/vehicles");
}

export async function updateVehicle(formData: FormData) {
  const vehicleId = getText(formData, "vehicleId");
  const brandId = getText(formData, "brandId");
  const model = getText(formData, "model");
  const fuel = getText(formData, "fuel");
  const transmission = getText(formData, "transmission");

  const year = Number(formData.get("year"));
  const mileage = Number(formData.get("mileage"));
  const price = Number(formData.get("price"));

  const version = getOptionalText(formData, "version");
  const drivetrain = getOptionalText(
    formData,
    "drivetrain",
  );
  const engine = getOptionalText(formData, "engine");
  const color = getOptionalText(formData, "color");
  const description = getOptionalText(
    formData,
    "description",
  );

  const powerText = getText(formData, "power");
  const power =
    powerText === "" ? undefined : Number(powerText);

  const status =
    getOptionalText(formData, "status") ?? "AVAILABLE";

  const featured = formData.get("featured") === "true";

  if (!vehicleId) {
    throw new Error(
      "No se ha recibido el identificador del vehículo.",
    );
  }

  validateVehicleData({
    brandId,
    model,
    fuel,
    transmission,
    year,
    mileage,
    price,
    power,
  });

  await prisma.vehicle.update({
    where: {
      id: vehicleId,
    },
    data: {
      brandId,
      model,
      version: version ?? null,
      year,
      mileage,
      fuel,
      transmission,
      drivetrain: drivetrain ?? null,
      engine: engine ?? null,
      power: power ?? null,
      color: color ?? null,
      price,
      featured,
      status,
      description: description ?? null,
    },
  });

  revalidateVehiclePages(vehicleId);
  redirect(`/admin/vehicles/${vehicleId}`);
}

export async function deleteVehicle(formData: FormData) {
  const vehicleId = getText(formData, "vehicleId");

  if (!vehicleId) {
    throw new Error(
      "No se ha recibido el identificador del vehículo.",
    );
  }

  const images = await prisma.vehicleImage.findMany({
    where: {
      vehicleId,
    },
    select: {
      url: true,
    },
  });

  await prisma.vehicle.delete({
    where: {
      id: vehicleId,
    },
  });

  await Promise.all(
    images.map((image) =>
      removeStoredVehicleImage(image.url),
    ),
  );

  revalidatePath("/admin/vehicles");
  revalidatePath("/coleccion");
  revalidatePath("/");
}

export async function addVehicleImage(
  formData: FormData,
): Promise<void> {
  const vehicleId = getText(formData, "vehicleId");
  const alt = getOptionalText(formData, "alt");

  if (!vehicleId) {
    throw new Error(
      "No se ha recibido el identificador del vehículo.",
    );
  }

  const imageFile = getImageFile(formData);

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
    select: {
      id: true,
      brand: {
        select: {
          name: true,
        },
      },
      model: true,
      version: true,
    },
  });

  if (!vehicle) {
    throw new Error("El vehículo no existe.");
  }

  const highestOrder = await prisma.vehicleImage.aggregate({
    where: {
      vehicleId,
    },
    _max: {
      sortOrder: true,
    },
  });

  const nextOrder =
    highestOrder._max.sortOrder === null
      ? 0
      : highestOrder._max.sortOrder + 1;

  const extension =
    ALLOWED_IMAGE_TYPES[
      imageFile.type as keyof typeof ALLOWED_IMAGE_TYPES
    ];

  const normalizedModel = vehicle.model
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const pathname =
    `vehicles/${vehicleId}/` +
    `${normalizedModel || "vehiculo"}.${extension}`;

  const defaultAlt =
    `${vehicle.brand.name} ${vehicle.model}` +
    `${vehicle.version ? ` ${vehicle.version}` : ""}`;

  const blob = await put(pathname, imageFile, {
    access: "public",
    addRandomSuffix: true,
    contentType: imageFile.type,
  });

  try {
    await prisma.vehicleImage.create({
      data: {
        vehicleId,
        url: blob.url,
        alt: alt ?? defaultAlt,
        sortOrder: nextOrder,
      },
    });
  } catch (error) {
    await removeStoredVehicleImage(blob.url);
    throw error;
  }

  revalidateVehiclePages(vehicleId);

  redirect(
    `/admin/vehicles/${vehicleId}/images?subida=1`,
  );
}

export async function setPrimaryVehicleImage(
  formData: FormData,
): Promise<void> {
  const imageId = getText(formData, "imageId");

  if (!imageId) {
    throw new Error(
      "No se ha recibido el identificador de la imagen.",
    );
  }

  const selectedImage =
    await prisma.vehicleImage.findUnique({
      where: {
        id: imageId,
      },
      select: {
        id: true,
        vehicleId: true,
      },
    });

  if (!selectedImage) {
    throw new Error("La imagen no existe.");
  }

  const images = await prisma.vehicleImage.findMany({
    where: {
      vehicleId: selectedImage.vehicleId,
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

  const reorderedImages = [
    ...images.filter((image) => image.id === imageId),
    ...images.filter((image) => image.id !== imageId),
  ];

  await prisma.$transaction(
    reorderedImages.map((image, index) =>
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

  revalidateVehiclePages(selectedImage.vehicleId);

  redirect(
    `/admin/vehicles/${selectedImage.vehicleId}/images?principal=1`,
  );
}

export async function deleteVehicleImage(
  formData: FormData,
): Promise<void> {
  const imageId = getText(formData, "imageId");

  if (!imageId) {
    throw new Error(
      "No se ha recibido el identificador de la imagen.",
    );
  }

  const image = await prisma.vehicleImage.findUnique({
    where: {
      id: imageId,
    },
    select: {
      vehicleId: true,
      url: true,
    },
  });

  if (!image) {
    throw new Error("La imagen no existe.");
  }

  await prisma.vehicleImage.delete({
    where: {
      id: imageId,
    },
  });

  await removeStoredVehicleImage(image.url);

  const remainingImages =
    await prisma.vehicleImage.findMany({
      where: {
        vehicleId: image.vehicleId,
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

  await prisma.$transaction(
    remainingImages.map((remainingImage, index) =>
      prisma.vehicleImage.update({
        where: {
          id: remainingImage.id,
        },
        data: {
          sortOrder: index,
        },
      }),
    ),
  );

  revalidateVehiclePages(image.vehicleId);

  redirect(
    `/admin/vehicles/${image.vehicleId}/images?eliminada=1`,
  );
}