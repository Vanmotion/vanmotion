import { list } from "@vercel/blob";
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

type RegisterActionBody = {
  action: "register";
  vehicleId: string;
  url: string;
  pathname: string;
};

type SyncActionBody = {
  action: "sync";
  vehicleId: string;
};

type CustomActionBody =
  | RegisterActionBody
  | SyncActionBody;

function requireAdminSession(
  request: NextRequest,
) {
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
      "No tienes autorización para gestionar imágenes.",
    );
  }
}

function requiredText(
  value: unknown,
  errorMessage: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(errorMessage);
  }

  return value.trim();
}

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
    !("vehicleId" in parsed)
  ) {
    throw new Error(
      "El identificador del vehículo no es válido.",
    );
  }

  return {
    vehicleId: requiredText(
      parsed.vehicleId,
      "El identificador del vehículo no es válido.",
    ),
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
    !("alt" in parsed)
  ) {
    throw new Error(
      "Los datos internos de la imagen están incompletos.",
    );
  }

  return {
    vehicleId: requiredText(
      parsed.vehicleId,
      "El identificador interno del vehículo no es válido.",
    ),
    alt: requiredText(
      parsed.alt,
      "El texto alternativo de la imagen no es válido.",
    ),
  };
}

function parseCustomAction(
  value: unknown,
): CustomActionBody | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("action" in value)
  ) {
    return null;
  }

  if (value.action === "sync") {
    if (!("vehicleId" in value)) {
      throw new Error(
        "No se ha recibido el vehículo.",
      );
    }

    return {
      action: "sync",
      vehicleId: requiredText(
        value.vehicleId,
        "El identificador del vehículo no es válido.",
      ),
    };
  }

  if (value.action === "register") {
    if (
      !("vehicleId" in value) ||
      !("url" in value) ||
      !("pathname" in value)
    ) {
      throw new Error(
        "Los datos de la fotografía están incompletos.",
      );
    }

    return {
      action: "register",
      vehicleId: requiredText(
        value.vehicleId,
        "El identificador del vehículo no es válido.",
      ),
      url: requiredText(
        value.url,
        "La dirección de la fotografía no es válida.",
      ),
      pathname: requiredText(
        value.pathname,
        "La ubicación de la fotografía no es válida.",
      ),
    };
  }

  return null;
}

function validateBlobLocation({
  vehicleId,
  url,
  pathname,
}: {
  vehicleId: string;
  url: string;
  pathname: string;
}) {
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

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(
      "La dirección de la imagen no es válida.",
    );
  }

  if (
    parsedUrl.protocol !== "https:" ||
    !parsedUrl.hostname.endsWith(
      ".blob.vercel-storage.com",
    )
  ) {
    throw new Error(
      "La fotografía no pertenece al almacenamiento autorizado.",
    );
  }
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

async function getVehicleAlt(
  vehicleId: string,
): Promise<string> {
  const vehicle =
    await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      select: {
        model: true,
        version: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

  if (!vehicle) {
    throw new Error(
      "El vehículo no existe.",
    );
  }

  return [
    vehicle.brand.name,
    vehicle.model,
    vehicle.version,
  ]
    .filter(Boolean)
    .join(" ");
}

async function registerVehicleImage({
  vehicleId,
  url,
  pathname,
  alt,
}: {
  vehicleId: string;
  url: string;
  pathname: string;
  alt?: string;
}): Promise<boolean> {
  validateBlobLocation({
    vehicleId,
    url,
    pathname,
  });

  const duplicatedImage =
    await prisma.vehicleImage.findFirst({
      where: {
        url,
      },
      select: {
        id: true,
      },
    });

  if (duplicatedImage) {
    return false;
  }

  const imageCount =
    await prisma.vehicleImage.count({
      where: {
        vehicleId,
      },
    });

  if (imageCount >= MAX_IMAGES) {
    throw new Error(
      "Este vehículo ya tiene el máximo de 8 fotografías.",
    );
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
      url,
      alt:
        alt ??
        (await getVehicleAlt(
          vehicleId,
        )),
      sortOrder: nextSortOrder,
    },
  });

  refreshVehiclePages(vehicleId);

  return true;
}

async function synchronizeVehicleImages(
  vehicleId: string,
): Promise<{
  added: number;
  imageCount: number;
}> {
  await getVehicleAlt(vehicleId);

  const prefix =
    `vehicles/${vehicleId}/`;

  const storedImages = await list({
    prefix,
    limit: 100,
  });

  const orderedBlobs = [
    ...storedImages.blobs,
  ].sort(
    (first, second) =>
      new Date(
        first.uploadedAt,
      ).getTime() -
      new Date(
        second.uploadedAt,
      ).getTime(),
  );

  let added = 0;

  for (const blob of orderedBlobs) {
    const currentCount =
      await prisma.vehicleImage.count({
        where: {
          vehicleId,
        },
      });

    if (currentCount >= MAX_IMAGES) {
      break;
    }

    const wasAdded =
      await registerVehicleImage({
        vehicleId,
        url: blob.url,
        pathname: blob.pathname,
      });

    if (wasAdded) {
      added += 1;
    }
  }

  const imageCount =
    await prisma.vehicleImage.count({
      where: {
        vehicleId,
      },
    });

  if (added > 0) {
    refreshVehiclePages(vehicleId);
  }

  return {
    added,
    imageCount,
  };
}

async function handleCustomAction({
  request,
  actionBody,
}: {
  request: NextRequest;
  actionBody: CustomActionBody;
}): Promise<NextResponse> {
  requireAdminSession(request);

  if (actionBody.action === "sync") {
    const result =
      await synchronizeVehicleImages(
        actionBody.vehicleId,
      );

    return NextResponse.json(result);
  }

  const added =
    await registerVehicleImage({
      vehicleId:
        actionBody.vehicleId,
      url: actionBody.url,
      pathname:
        actionBody.pathname,
    });

  const imageCount =
    await prisma.vehicleImage.count({
      where: {
        vehicleId:
          actionBody.vehicleId,
      },
    });

  return NextResponse.json({
    added: added ? 1 : 0,
    imageCount,
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const body: unknown =
      await request.json();

    const customAction =
      parseCustomAction(body);

    if (customAction) {
      return await handleCustomAction({
        request,
        actionBody: customAction,
      });
    }

    const jsonResponse =
      await handleUpload({
        body:
          body as HandleUploadBody,
        request,

        onBeforeGenerateToken: async (
          pathname,
          clientPayload,
        ) => {
          requireAdminSession(request);

          const { vehicleId } =
            parseClientPayload(
              clientPayload,
            );

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

          const imageCount =
            await prisma.vehicleImage.count({
              where: {
                vehicleId,
              },
            });

          if (imageCount >= MAX_IMAGES) {
            throw new Error(
              "Este vehículo ya tiene el máximo de 8 fotografías.",
            );
          }

          const alt =
            await getVehicleAlt(
              vehicleId,
            );

          return {
            allowedContentTypes:
              ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes:
              MAX_IMAGE_SIZE,
            addRandomSuffix: true,
            tokenPayload:
              JSON.stringify({
                vehicleId,
                alt,
              } satisfies UploadTokenPayload),
          };
        },

        /*
         * Se mantiene como respaldo por si Vercel ejecuta
         * correctamente el callback asíncrono. La interfaz
         * registra además cada imagen de forma inmediata.
         */
        onUploadCompleted: async ({
          blob,
          tokenPayload,
        }) => {
          const { vehicleId, alt } =
            parseTokenPayload(
              tokenPayload,
            );

          try {
            await registerVehicleImage({
              vehicleId,
              url: blob.url,
              pathname:
                blob.pathname,
              alt,
            });
          } catch (completionError) {
            console.error(
              "VANMOTION_BLOB_COMPLETION_ERROR:",
              completionError,
            );

            /*
             * No se elimina el archivo aquí: la acción de
             * sincronización puede recuperarlo automáticamente.
             */
          }
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