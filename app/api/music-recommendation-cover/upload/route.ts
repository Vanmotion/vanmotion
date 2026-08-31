import path from "node:path";

import { del, put } from "@vercel/blob";
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

const MAX_COVER_SIZE =
  8 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const ALLOWED_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
  ]);

type ClientPayload = {
  recommendationId: string;
};

type RegisterActionBody = {
  action: "register";
  recommendationId: string;
  url: string;
  pathname: string;
  fileName: string;
  contentType: string;
  size: number;
};

function requireAdminSession(
  request: NextRequest,
): void {
  const expectedToken =
    process.env
      .ADMIN_SESSION_TOKEN
      ?.trim();

  const currentToken =
    request.cookies
      .get(SESSION_COOKIE_NAME)
      ?.value.trim();

  if (
    !expectedToken ||
    currentToken !==
      expectedToken
  ) {
    throw new Error(
      "No tienes autorización para gestionar portadas.",
    );
  }
}

function requiredText(
  value: unknown,
  message: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(message);
  }

  return value.trim();
}

function parseClientPayload(
  value: string | null | undefined,
): ClientPayload {
  if (!value) {
    throw new Error(
      "No se ha recibido la recomendación.",
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
    !("recommendationId" in parsed)
  ) {
    throw new Error(
      "La recomendación indicada no es válida.",
    );
  }

  return {
    recommendationId: requiredText(
      parsed.recommendationId,
      "La recomendación indicada no es válida.",
    ),
  };
}

function parseRegisterAction(
  value: unknown,
): RegisterActionBody | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("action" in value) ||
    value.action !== "register"
  ) {
    return null;
  }

  const body =
    value as Record<
      string,
      unknown
    >;

  const size =
    Number(body.size);

  if (
    !Number.isFinite(size) ||
    size <= 0 ||
    size > MAX_COVER_SIZE
  ) {
    throw new Error(
      "El tamaño de la portada no es válido.",
    );
  }

  return {
    action: "register",
    recommendationId: requiredText(
      body.recommendationId,
      "La recomendación indicada no es válida.",
    ),
    url: requiredText(
      body.url,
      "La dirección de la portada no es válida.",
    ),
    pathname: requiredText(
      body.pathname,
      "La ubicación de la portada no es válida.",
    ),
    fileName: requiredText(
      body.fileName,
      "El nombre de la portada no es válido.",
    ),
    contentType:
      typeof body.contentType ===
      "string"
        ? body.contentType
        : "",
    size,
  };
}

function isVercelBlobUrl(
  value: string | null,
): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(
        ".blob.vercel-storage.com",
      )
    );
  } catch {
    return false;
  }
}

function refreshMusicPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath(
    "/admin/music/covers",
  );
  revalidatePath("/musica");
  revalidatePath("/");
}

async function registerCover({
  recommendationId,
  url,
  pathname,
}: {
  recommendationId: string;
  url: string;
  pathname: string;
}): Promise<void> {
  const expectedPrefix =
    `music-recommendation-covers/${recommendationId}/`;

  if (
    !pathname.startsWith(
      expectedPrefix,
    ) ||
    pathname.includes("..") ||
    !isVercelBlobUrl(url)
  ) {
    throw new Error(
      "La ubicación de la portada no es válida.",
    );
  }

  const extension =
    path
      .extname(pathname)
      .toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.has(
      extension,
    )
  ) {
    throw new Error(
      "El formato de la portada no es válido.",
    );
  }

  const track =
    await prisma.musicRecommendation
      .findUnique({
        where: {
          id: recommendationId,
        },
        select: {
          id: true,
          coverUrl: true,
        },
      });

  if (!track) {
    throw new Error(
      "No se ha encontrado la recomendación.",
    );
  }

  if (track.coverUrl === url) {
    return;
  }

  try {
    await prisma.musicRecommendation.update({
      where: {
        id: track.id,
      },
      data: {
        coverUrl: url,
      },
    });
  } catch (error) {
    try {
      await del(url);
    } catch (
      cleanupError
    ) {
      console.error(
        "VANMOTION_MUSIC_COVER_CLEANUP_ERROR:",
        cleanupError,
      );
    }

    throw error;
  }

  if (
    track.coverUrl !== url &&
    isVercelBlobUrl(
      track.coverUrl,
    )
  ) {
    try {
      await del(
        track.coverUrl,
      );
    } catch (
      deleteError
    ) {
      console.error(
        "VANMOTION_OLD_MUSIC_COVER_DELETE_ERROR:",
        deleteError,
      );
    }
  }

  refreshMusicPages();
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const contentType =
      request.headers.get("content-type") ?? "";

    if (
      contentType
        .toLowerCase()
        .includes("multipart/form-data")
    ) {
      requireAdminSession(request);

      const formData =
        await request.formData();

      const recommendationId =
        requiredText(
          formData.get("recommendationId"),
          "La recomendación indicada no es válida.",
        );

      const uploadedFile =
        formData.get("file");

      if (!(uploadedFile instanceof File)) {
        throw new Error(
          "No se ha recibido ninguna portada.",
        );
      }

      if (
        uploadedFile.size <= 0 ||
        uploadedFile.size > MAX_COVER_SIZE
      ) {
        throw new Error(
          "El tamaño de la portada no es válido.",
        );
      }

      if (
        uploadedFile.type &&
        !ALLOWED_CONTENT_TYPES.includes(
          uploadedFile.type,
        )
      ) {
        throw new Error(
          "El tipo de imagen no está permitido.",
        );
      }

      const extension =
        path
          .extname(uploadedFile.name)
          .toLowerCase();

      if (
        !ALLOWED_EXTENSIONS.has(extension)
      ) {
        throw new Error(
          "El formato de la portada no es válido.",
        );
      }

      const recommendation =
        await prisma.musicRecommendation
          .findUnique({
            where: {
              id: recommendationId,
            },
            select: {
              id: true,
            },
          });

      if (!recommendation) {
        throw new Error(
          "No se ha encontrado la recomendación.",
        );
      }

      const safeName =
        uploadedFile.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9._-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") ||
        `portada${extension}`;

      const pathname =
        `music-recommendation-covers/${recommendationId}/` +
        `${Date.now()}-${safeName}`;

      const blob =
        await put(
          pathname,
          uploadedFile,
          {
            access: "public",
            addRandomSuffix: true,
          },
        );

      await registerCover({
        recommendationId,
        url: blob.url,
        pathname: blob.pathname,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        pathname: blob.pathname,
      });
    }

    const body: unknown =
      await request.json();

    const registerAction =
      parseRegisterAction(body);

    if (registerAction) {
      requireAdminSession(
        request,
      );

      await registerCover({
        recommendationId:
          registerAction.recommendationId,
        url: registerAction.url,
        pathname:
          registerAction.pathname,
      });

      return NextResponse.json({
        success: true,
      });
    }

    const response =
      await handleUpload({
        body:
          body as HandleUploadBody,
        request,

        onBeforeGenerateToken:
          async (
            pathname,
            clientPayload,
          ) => {
            requireAdminSession(
              request,
            );

            const { recommendationId } =
              parseClientPayload(
                clientPayload,
              );

            const track =
              await prisma.musicRecommendation
                .findUnique({
                  where: {
                    id: recommendationId,
                  },
                  select: {
                    id: true,
                  },
                });

            if (!track) {
              throw new Error(
                "No se ha encontrado la recomendación.",
              );
            }

            const expectedPrefix =
              `music-recommendation-covers/${recommendationId}/`;

            if (
              !pathname.startsWith(
                expectedPrefix,
              ) ||
              pathname.includes(
                "..",
              ) ||
              !ALLOWED_EXTENSIONS.has(
                path
                  .extname(pathname)
                  .toLowerCase(),
              )
            ) {
              throw new Error(
                "La ubicación de la portada no es válida.",
              );
            }

            return {
              allowedContentTypes:
                ALLOWED_CONTENT_TYPES,
              maximumSizeInBytes:
                MAX_COVER_SIZE,
              addRandomSuffix: true,
              tokenPayload:
                JSON.stringify({
                  recommendationId,
                } satisfies ClientPayload),
            };
          },

        onUploadCompleted:
          async ({
            blob,
            tokenPayload,
          }) => {
            const { recommendationId } =
              parseClientPayload(
                tokenPayload,
              );

            try {
              await registerCover({
                recommendationId,
                url: blob.url,
                pathname:
                  blob.pathname,
              });
            } catch (
              completionError
            ) {
              console.error(
                "VANMOTION_MUSIC_COVER_COMPLETION_ERROR:",
                completionError,
              );
            }
          },
      });

    return NextResponse.json(
      response,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la subida.";

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
