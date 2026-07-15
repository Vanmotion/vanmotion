import { del } from "@vercel/blob";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { revalidatePath } from "next/cache";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

type ClientPayload = {
  vehicleId: string;
};

type UploadTokenPayload = {
  vehicleId: string;
  alt: string;
};

function parseClientPayload(
  value: string | null | undefined,
): ClientPayload {
  if (!value) {
    throw new Error(
      "No se ha recibido el vehículo.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      "Los datos de la subida no son válidos.",
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("vehicleId" in parsed) ||
    typeof parsed.vehicleId !== "string" ||
    !parsed.vehicleId.trim()
  ) {
    throw new Error(
      "El identificador del vehículo no es válido.",
    );
  }

  return {
    vehicleId: parsed.vehicleId.trim(),
  };
}

function parseTokenPayload(
  value: string | null | undefined,
): UploadTokenPayload {
  if (!value) {
    throw new Error(
      "No se han recibido los datos internos de la subida.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      "Los datos internos de la subida no son válidos.",
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("vehicleId" in parsed) ||
    typeof parsed.vehicleId !== "string" ||
    !("alt" in parsed) ||
    typeof parsed.alt !== "string"
  ) {
    throw new Error(
      "Los datos internos de la imagen están incompletos.",
    );
  }

  return {
    vehicleId: parsed.vehicleId,
    alt: parsed.alt,
  };
}

function refreshVehiclePages(
  vehicleId: string,
) {
  revalidatePath("/");
  revalidatePath("/coleccion");
  revalidatePath(
    `/coleccion/${vehicleId}`,
  );

  revalidatePath("/admin");
  revalidatePath("/admin/vehicles");
  revalidatePath(
    `/admin/vehicles/${vehicleId}`,
  );
  revalidatePath(
    `/admin/vehicles/${vehicleId}/edit`,
  );
  revalidatePath(
    `/admin/vehicles/${vehicleId}/images`,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const body =
    (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload,
      ) => {
        const expectedToken =
          process.env.ADMIN_SESSION_TOKEN;

        const currentToken =
          request.cookies.get(
            SESSION_COOKIE_NAME,
          )?.value;

        if (
          !expectedToken ||
          currentToken !== expectedToken
        ) {
          throw new Error(
            "No tienes autorización para subir imágenes.",
          );
        }

        const { vehicleId } =
          parseClientPayload(clientPayload);

        const expectedPrefix =
          `vehicles/${vehicleId}/`;

        if (
          !pathname.startsWith(
            expectedPrefix,
          ) ||
          pathname.includes("..")
        ) {
          throw new Error(
            "La ubicación de la imagen no es válida.",
          );
        }

        const vehicle =
          await prisma.vehicle.findUnique({
            where: {
              id: vehicleId,
            },
            select: {
              id: true,
              model: true,
              version: true,
              brand: {
                select: {
                  name: true,
                },
              },
              _count: {
                select: {
                  images: true,
                },
              },
            },
          });

        if (!vehicle) {
          throw new Error(
            "El vehículo no existe.",
          );
        }

        if (
          vehicle._count.images >=
          MAX_IMAGES
        ) {
          throw new Error(
            "Este vehículo ya tiene el máximo de 8 fotografías.",
          );
        }

        const alt = [
          vehicle.brand.name,
          vehicle.model,
          vehicle.version,
        ]
          .filter(Boolean)
          .join(" ");

        return {
          allowedContentTypes:
            ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes:
            MAX_IMAGE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            vehicleId,
            alt,
          } satisfies UploadTokenPayload),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        const { vehicleId, alt } =
          parseTokenPayload(tokenPayload);

        const expectedPrefix =
          `vehicles/${vehicleId}/`;

        if (
          !blob.pathname.startsWith(
            expectedPrefix,
          )
        ) {
          await del(blob.url);

          throw new Error(
            "La imagen se ha subido a una ubicación incorrecta.",
          );
        }

        const duplicatedImage =
          await prisma.vehicleImage.findFirst({
            where: {
              url: blob.url,
            },
            select: {
              id: true,
            },
          });

        if (duplicatedImage) {
          return;
        }

        const vehicleExists =
          await prisma.vehicle.findUnique({
            where: {
              id: vehicleId,
            },
            select: {
              id: true,
            },
          });

        if (!vehicleExists) {
          await del(blob.url);
          return;
        }

        const imageCount =
          await prisma.vehicleImage.count({
            where: {
              vehicleId,
            },
          });

        if (imageCount >= MAX_IMAGES) {
          await del(blob.url);
          return;
        }

        const currentMaximum =
          await prisma.vehicleImage.aggregate({
            where: {
              vehicleId,
            },
            _max: {
              sortOrder: true,
            },
          });

        const nextSortOrder =
          (currentMaximum._max.sortOrder ??
            -1) + 1;

        await prisma.vehicleImage.create({
          data: {
            vehicleId,
            url: blob.url,
            alt,
            sortOrder: nextSortOrder,
          },
        });

        refreshVehiclePages(vehicleId);
      },
    });

    return NextResponse.json(
      jsonResponse,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la subida.";

    console.error(
      "VANMOTION_CLIENT_IMAGE_UPLOAD_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}