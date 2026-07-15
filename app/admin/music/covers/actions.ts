"use server";

import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { prisma } from "@/app/lib/prisma";

const MAX_COVER_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

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

function validateCover(file: File) {
  const extension = path
    .extname(file.name)
    .toLowerCase();

  if (
    !ALLOWED_IMAGE_TYPES.has(file.type) &&
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    throw new Error(
      "La portada debe ser JPG, PNG, WebP o AVIF.",
    );
  }

  if (file.size > MAX_COVER_SIZE) {
    throw new Error(
      "La portada no puede superar los 8 MB.",
    );
  }
}

async function removeLocalCover(
  coverUrl: string | null,
) {
  if (
    !coverUrl ||
    !coverUrl.startsWith(
      "/uploads/music-covers/",
    )
  ) {
    return;
  }

  const publicDirectory = path.resolve(
    process.cwd(),
    "public",
  );

  const coversDirectory = path.resolve(
    publicDirectory,
    "uploads",
    "music-covers",
  );

  const filePath = path.resolve(
    publicDirectory,
    coverUrl.replace(/^\/+/, ""),
  );

  if (!filePath.startsWith(coversDirectory)) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    // El archivo puede haber sido eliminado antes.
  }
}

export async function saveTrackCover(
  formData: FormData,
): Promise<void> {
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

  validateCover(cover);

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

  const originalExtension = path
    .extname(cover.name)
    .toLowerCase();

  const extension =
    ALLOWED_EXTENSIONS.has(originalExtension)
      ? originalExtension
      : cover.type === "image/png"
        ? ".png"
        : cover.type === "image/webp"
          ? ".webp"
          : cover.type === "image/avif"
            ? ".avif"
            : ".jpg";

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "music-covers",
  );

  await mkdir(uploadDirectory, {
    recursive: true,
  });

  const fileName = safeFileName(
    `${track.slug}-${Date.now()}${extension}`,
  );

  const destination = path.join(
    uploadDirectory,
    fileName,
  );

  const buffer = Buffer.from(
    await cover.arrayBuffer(),
  );

  await writeFile(destination, buffer);

  const newCoverUrl =
    `/uploads/music-covers/${fileName}`;

  const previousCoverUrl = track.coverUrl;

  await prisma.musicTrack.update({
    where: {
      id: track.id,
    },
    data: {
      coverUrl: newCoverUrl,
    },
  });

  await removeLocalCover(previousCoverUrl);

  refreshMusicPages();
}

export async function removeTrackCover(
  formData: FormData,
): Promise<void> {
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

  await removeLocalCover(track.coverUrl);

  refreshMusicPages();
}