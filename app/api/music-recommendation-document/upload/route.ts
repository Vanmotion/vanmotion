import path from "node:path";

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

const MAX_DOCUMENT_SIZE =
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
      "No tienes autorización para gestionar documentos.",
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
    size > MAX_DOCUMENT_SIZE
  ) {
    throw new Error(
      "El tamaño de la documento no es válido.",
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
      "La dirección de la documento no es válida.",
    ),
    pathname: requiredText(
      body.pathname,
      "La ubicación de la documento no es válida.",
    ),
    fileName: requiredText(
      body.fileName,
      "El nombre de la documento no es válido.",
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

async function registerDocument({
  recommendationId,
  url,
  pathname,
}: {
  recommendationId: string;
  url: string;
  pathname: string;
}): Promise<void> {
  const expectedPrefix =
    `music-recommendation-documents/${recommendationId}/`;

  if (
    !pathname.startsWith(
      expectedPrefix,
    ) ||
    pathname.includes("..") ||
    !isVercelBlobUrl(url)
  ) {
    throw new Error(
      "La ubicación de la documento no es válida.",
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
      "El formato de la documento no es válido.",
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
          documentImageUrl: true,
        },
      });

  if (!track) {
    throw new Error(
      "No se ha encontrado la recomendación.",
    );
  }

  if (track.documentImageUrl === url) {
    return;
  }

  try {
    await prisma.musicRecommendation.update({
      where: {
        id: track.id,
      },
      data: {
        documentImageUrl: url,
      },
    });
  } catch (error) {
    try {
      await del(url);
    } catch (
      cleanupError
    ) {
      console.error(
        "VANMOTION_MUSIC_DOCUMENT_CLEANUP_ERROR:",
        cleanupError,
      );
    }

    throw error;
  }

  if (
    track.documentImageUrl !== url &&
    isVercelBlobUrl(
      track.documentImageUrl,
    )
  ) {
    try {
      await del(
        track.documentImageUrl,
      );
    } catch (
      deleteError
    ) {
      console.error(
        "VANMOTION_OLD_MUSIC_DOCUMENT_DELETE_ERROR:",
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
    const body: unknown =
      await request.json();

    const registerAction =
      parseRegisterAction(body);

    if (registerAction) {
      requireAdminSession(
        request,
      );

      await registerDocument({
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
              `music-recommendation-documents/${recommendationId}/`;

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
                "La ubicación de la documento no es válida.",
              );
            }

            return {
              allowedContentTypes:
                ALLOWED_CONTENT_TYPES,
              maximumSizeInBytes:
                MAX_DOCUMENT_SIZE,
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
              await registerDocument({
                recommendationId,
                url: blob.url,
                pathname:
                  blob.pathname,
              });
            } catch (
              completionError
            ) {
              console.error(
                "VANMOTION_MUSIC_DOCUMENT_COMPLETION_ERROR:",
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
