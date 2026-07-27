"use server";

import path from "node:path";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { prisma } from "@/app/lib/prisma";

const ADMIN_SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const MAX_COVER_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<
  string,
  ReadonlySet<string>
> = {
  "image/jpeg": new Set([
    ".jpg",
    ".jpeg",
  ]),
  "image/png": new Set([
    ".png",
  ]),
  "image/webp": new Set([
    ".webp",
  ]),
  "image/avif": new Set([
    ".avif",
  ]),
};

async function requireAdminSession(): Promise<void> {
  const expectedSession =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  if (!expectedSession) {
    throw new Error(
      "La configuración de acceso al panel no está completa.",
    );
  }

  const cookieStore = await cookies();

  const currentSession =
    cookieStore
      .get(ADMIN_SESSION_COOKIE_NAME)
      ?.value.trim();

  if (currentSession !== expectedSession) {
    throw new Error(
      "No tienes autorización para gestionar portadas.",
    );
  }
}

function requiredString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `El campo “${field}” es obligatorio.`,
    );
  }

  return value.trim();
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

function refreshMusicPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath("/admin/music/covers");
  revalidatePath("/musica");
  revalidatePath("/");
}

function validateCover(file: File): string {
  const extension = path
    .extname(file.name)
    .toLowerCase();

  const allowedExtensions =
    ALLOWED_IMAGE_TYPES[file.type];

  if (
    !allowedExtensions ||
    !allowedExtensions.has(extension)
  ) {
    throw new Error(
      "La portada debe ser JPG, PNG, WebP o AVIF y su extensión debe coincidir con el archivo.",
    );
  }

  if (file.size > MAX_COVER_SIZE) {
    throw new Error(
      "La portada no puede superar los 8 MB.",
    );
  }

  return extension;
}

function isVercelBlobUrl(
  value: string | null,
): value is string {
  if (!value || value.startsWith("/")) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.endsWith(
        ".blob.vercel-storage.com",
      )
    );
  } catch {
    return false;
  }
}

async function removeStoredCover(
  coverUrl: string | null,
): Promise<void> {
  if (!isVercelBlobUrl(coverUrl)) {
    return;
  }

  try {
    await del(coverUrl);
  } catch (error) {
    console.error(
      "No se pudo eliminar la portada de Vercel Blob:",
      error,
    );
  }
}

export async function saveTrackCover(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const trackId = requiredString(
    formData,
    "trackId",
  );

  const cover = formData.get("cover");

  if (
    !(cover instanceof File) ||
    cover.size === 0
  ) {
    throw new Error(
      "Selecciona una imagen para la portada.",
    );
  }

  const extension = validateCover(cover);

  const track =
    await prisma.musicTrack.findUnique({
      where: {
        id: trackId,
      },
    });

  if (!track) {
    throw new Error(
      "No se ha encontrado la canción.",
    );
  }

  const baseName =
    path.basename(
      cover.name,
      extension,
    ) || track.slug || "portada";

  const pathname =
    `music-covers/${track.id}/` +
    safeFileName(
      `${baseName}${extension}`,
    );

  const previousCoverUrl = track.coverUrl;

  const blob = await put(
    pathname,
    cover,
    {
      access: "public",
      addRandomSuffix: true,
    },
  );

  try {
    await prisma.musicTrack.update({
      where: {
        id: track.id,
      },
      data: {
        coverUrl: blob.url,
      },
    });
  } catch (error) {
    try {
      await del(blob.url);
    } catch (cleanupError) {
      console.error(
        "No se pudo limpiar la nueva portada tras fallar la base de datos:",
        cleanupError,
      );
    }

    throw error;
  }

  await removeStoredCover(previousCoverUrl);

  refreshMusicPages();
}

export async function removeTrackCover(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const trackId = requiredString(
    formData,
    "trackId",
  );

  const track =
    await prisma.musicTrack.findUnique({
      where: {
        id: trackId,
      },
    });

  if (!track) {
    throw new Error(
      "No se ha encontrado la canción.",
    );
  }

  await prisma.musicTrack.update({
    where: {
      id: track.id,
    },
    data: {
      coverUrl: null,
    },
  });

  await removeStoredCover(track.coverUrl);

  refreshMusicPages();
}
