"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/app/lib/admin-session";
import { prisma } from "@/app/lib/prisma";

function requiredString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function optionalString(
  formData: FormData,
  field: string,
): string | null {
  const value = requiredString(
    formData,
    field,
  );

  return value || null;
}

function refreshMusicPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/music");
  revalidatePath("/musica");
  revalidatePath("/");
}

export async function initializeMusicLibrary(
  _formData: FormData,
): Promise<void> {
  await requireAdminSession();
  const defaultTracks = [
    {
      slug: "the-cool-ashtray",
      title: "The Cool Ashtray",
      subtitle:
        "VANMOTION · Single original",
      fileUrl:
        "/music/the-cool-ashtray.mp3",
      coverUrl: null,
      externalUrl:
        "https://open.spotify.com/album/39kirsfmk8K3LVNuOXfGFn",
      format: "MP3",
      duration: null,
      active: true,
      sortOrder: 0,
    },
    {
      slug: "suenos-prestados",
      title: "Sueños Prestados",
      subtitle:
        "VANMOTION · Single original",
      fileUrl:
        "/music/suenos-prestados.mp3",
      coverUrl: null,
      externalUrl:
        "https://hearnow.com/preview/dLLRtS%2FKI3PyS2Bo6Y5wcw%3D%3D?cid=100",
      format: "MP3",
      duration: null,
      active: true,
      sortOrder: 1,
    },
    {
      slug: "solo-en-mi-mente",
      title: "Solo En Mi Mente",
      subtitle:
        "VANMOTION · Trap y violín",
      fileUrl:
        "/music/solo-en-mi-mente.mp3",
      coverUrl: null,
      externalUrl: null,
      format: "MP3",
      duration: null,
      active: true,
      sortOrder: 2,
    },
    {
      slug: "vanmotion",
      title: "Vanmotion",
      subtitle:
        "VANMOTION · Identidad y trabajo",
      fileUrl:
        "/music/vanmotion.mp3",
      coverUrl: null,
      externalUrl:
        "https://hearnow.com/preview/ad5WF67x6Ga8IGKviMDcAg%3D%3D?cid=100",
      format: "MP3",
      duration: null,
      active: true,
      sortOrder: 3,
    },
    {
      slug: "volvere-por-ti",
      title: "Volveré por ti",
      subtitle:
        "VANMOTION · Producido por VANMOTION",
      fileUrl:
        "/music/volvere-por-ti.mp3",
      coverUrl:
        "/music/covers/volvere-por-ti.webp",
      externalUrl: null,
      format: "MP3",
      duration: "3:01",
      active: true,
      sortOrder: 4,
    },
    {
      slug: "cero-dramas",
      title: "Cero Dramas",
      subtitle:
        "VANMOTION · Producido por VANMOTION",
      fileUrl:
        "/music/cero-dramas.mp3",
      coverUrl:
        "/music/covers/cero-dramas.webp",
      externalUrl: null,
      format: "MP3",
      duration: "1:42",
      active: true,
      sortOrder: 5,
    },
  ];

  try {
    await prisma.$transaction(
      defaultTracks.map((track) =>
        prisma.musicTrack.upsert({
          where: {
            slug: track.slug,
          },

          update: {
            title: track.title,
            subtitle: track.subtitle,
            fileUrl: track.fileUrl,
            coverUrl: track.coverUrl,
            externalUrl:
              track.externalUrl,
            format: track.format,
            duration: track.duration,
            active: track.active,
            sortOrder: track.sortOrder,
          },

          create: track,
        }),
      ),
    );

    refreshMusicPages();
  } catch (error) {
    console.error(
      "VANMOTION_MUSIC_INIT_ERROR:",
      error,
    );

    throw new Error(
      "No se pudo inicializar la biblioteca musical.",
    );
  }
}

export async function saveMusicTrack(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();
  const id = requiredString(
    formData,
    "id",
  );

  const title = requiredString(
    formData,
    "title",
  );

  const subtitle = optionalString(
    formData,
    "subtitle",
  );

  const externalUrl = optionalString(
    formData,
    "externalUrl",
  );

  const duration = optionalString(
    formData,
    "duration",
  );

  const format =
    requiredString(
      formData,
      "format",
    ) || "MP3";

  const active =
    formData.get("active") === "on";

  if (!id) {
    throw new Error(
      "No se ha identificado la canción.",
    );
  }

  if (!title) {
    throw new Error(
      "El título de la canción es obligatorio.",
    );
  }

  try {
    const existingTrack = await prisma.musicTrack.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTrack) {
      throw new Error(
        "No se ha encontrado la canción.",
      );
    }

    await prisma.musicTrack.update({
      where: {
        id,
      },

      data: {
        title,
        subtitle,
        externalUrl,
        format,
        duration,
        active,
      },
    });

    refreshMusicPages();
  } catch (error) {
    console.error(
      "VANMOTION_MUSIC_SAVE_ERROR:",
      error,
    );

    throw new Error(
      "No se pudieron guardar los cambios de la canción.",
    );
  }
}

export async function moveMusicTrack(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();
  const id = requiredString(
    formData,
    "id",
  );

  const direction = requiredString(
    formData,
    "direction",
  );

  if (!id) {
    throw new Error(
      "No se ha identificado la canción.",
    );
  }

  if (
    direction !== "up" &&
    direction !== "down"
  ) {
    throw new Error(
      "La dirección indicada no es válida.",
    );
  }

  const tracks =
    await prisma.musicTrack.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  const currentIndex =
    tracks.findIndex(
      (track) => track.id === id,
    );

  if (currentIndex === -1) {
    throw new Error(
      "No se ha encontrado la canción.",
    );
  }

  const targetIndex =
    direction === "up"
      ? currentIndex - 1
      : currentIndex + 1;

  if (
    targetIndex < 0 ||
    targetIndex >= tracks.length
  ) {
    return;
  }

  const reorderedTracks = [...tracks];

  [
    reorderedTracks[currentIndex],
    reorderedTracks[targetIndex],
  ] = [
    reorderedTracks[targetIndex],
    reorderedTracks[currentIndex],
  ];

  try {
    await prisma.$transaction(
      reorderedTracks.map(
        (track, index) =>
          prisma.musicTrack.update({
            where: {
              id: track.id,
            },

            data: {
              sortOrder: index,
            },
          }),
      ),
    );

    refreshMusicPages();
  } catch (error) {
    console.error(
      "VANMOTION_MUSIC_MOVE_ERROR:",
      error,
    );

    throw new Error(
      "No se pudo cambiar el orden de la canción.",
    );
  }
}