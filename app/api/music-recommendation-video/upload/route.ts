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

const MAX_VIDEO_SIZE =
  250 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "video/mp4",
];

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
    process.env.ADMIN_SESSION_TOKEN?.trim();

  const currentToken =
    request.cookies
      .get(SESSION_COOKIE_NAME)
      ?.value.trim();

  if (
    !expectedToken ||
    currentToken !== expectedToken
  ) {
    throw new Error(
      "No tienes autorización para gestionar vídeos.",
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

  const parsed = JSON.parse(value) as Record<
    string,
    unknown
  >;

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
    value as Record<string, unknown>;

  const size = Number(body.size);

  if (
    !Number.isFinite(size) ||
    size <= 0 ||
    size > MAX_VIDEO_SIZE
  ) {
    throw new Error(
      "El tamaño del vídeo no es válido.",
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
      "La dirección del vídeo no es válida.",
    ),
    pathname: requiredText(
      body.pathname,
      "La ubicación del vídeo no es válida.",
    ),
    fileName: requiredText(
      body.fileName,
      "El nombre del vídeo no es válido.",
    ),
    contentType:
      typeof body.contentType === "string"
        ? body.contentType
        : "",
    size,
  };
}

function isVercelBlobUrl(
  value: string | null,
): value is string {
  if (!value) return false;

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
  revalidatePath("/musica");
  revalidatePath("/");
}

async function registerVideo({
  recommendationId,
  url,
  pathname,
}: {
  recommendationId: string;
  url: string;
  pathname: string;
}): Promise<void> {
  const expectedPrefix =
    `music/recommendations/${recommendationId}/`;

  if (
    !pathname.startsWith(expectedPrefix) ||
    pathname.includes("..") ||
    path.extname(pathname).toLowerCase() !==
      ".mp4" ||
    !isVercelBlobUrl(url)
  ) {
    throw new Error(
      "La ubicación del vídeo no es válida.",
    );
  }

  const recommendation =
    await prisma.musicRecommendation.findUnique({
      where: {
        id: recommendationId,
      },
      select: {
        id: true,
        videoUrl: true,
      },
    });

  if (!recommendation) {
    throw new Error(
      "No se ha encontrado la recomendación.",
    );
  }

  if (recommendation.videoUrl === url) {
    return;
  }

  const previousVideoUrl =
    recommendation.videoUrl;

  try {
    await prisma.musicRecommendation.update({
      where: {
        id: recommendation.id,
      },
      data: {
        videoUrl: url,
      },
    });
  } catch (error) {
    try {
      await del(url);
    } catch {}

    throw error;
  }

  if (
    previousVideoUrl !== url &&
    isVercelBlobUrl(previousVideoUrl)
  ) {
    try {
      await del(previousVideoUrl);
    } catch (error) {
      console.error(
        "VANMOTION_OLD_RECOMMENDATION_VIDEO_DELETE_ERROR:",
        error,
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
      requireAdminSession(request);

      await registerVideo({
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

            const expectedPrefix =
              `music/recommendations/${recommendationId}/`;

            if (
              !pathname.startsWith(
                expectedPrefix,
              ) ||
              pathname.includes("..") ||
              path
                .extname(pathname)
                .toLowerCase() !== ".mp4"
            ) {
              throw new Error(
                "La ubicación del vídeo no es válida.",
              );
            }

            return {
              allowedContentTypes:
                ALLOWED_CONTENT_TYPES,
              maximumSizeInBytes:
                MAX_VIDEO_SIZE,
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
              await registerVideo({
                recommendationId,
                url: blob.url,
                pathname: blob.pathname,
              });
            } catch (error) {
              console.error(
                "VANMOTION_RECOMMENDATION_VIDEO_COMPLETION_ERROR:",
                error,
              );
            }
          },
      });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la subida.";

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
