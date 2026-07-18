import { prisma } from "@/app/lib/prisma";

export type PublicMusicTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  coverUrl: string | null;
  format: string;
  externalUrl: string | null;
};

export const fallbackTracks: PublicMusicTrack[] = [
  {
    id: "the-cool-ashtray",
    title: "The Cool Ashtray",
    subtitle: "VANMOTION · Single original",
    src: "/music/the-cool-ashtray.mp3",
    coverUrl: "/uploads/music-covers/the-cool-ashtray-1784373940751.png",
    format: "MP3",
    externalUrl:
      "https://open.spotify.com/album/39kirsfmk8K3LVNuOXfGFn",
  },
  {
    id: "suenos-prestados",
    title: "Sueños Prestados",
    subtitle: "VANMOTION · Single original",
    src: "/music/suenos-prestados.mp3",
    coverUrl: null,
    format: "MP3",
    externalUrl:
      "https://hearnow.com/preview/dLLRtS%2FKI3PyS2Bo6Y5wcw%3D%3D?cid=100",
  },
  {
    id: "solo-en-mi-mente",
    title: "Solo En Mi Mente",
    subtitle: "VANMOTION · Trap y violín",
    src: "/music/solo-en-mi-mente.mp3",
    coverUrl: null,
    format: "MP3",
    externalUrl: null,
  },
  {
    id: "vanmotion",
    title: "Vanmotion",
    subtitle: "VANMOTION · Identidad y trabajo",
    src: "/music/vanmotion.mp3",
    coverUrl: null,
    format: "MP3",
    externalUrl:
      "https://hearnow.com/preview/ad5WF67x6Ga8IGKviMDcAg%3D%3D?cid=100",
  },
  {
    id: "volvere-por-ti",
    title: "Volveré por ti",
    subtitle: "VANMOTION · Producido por VANMOTION",
    src: "/music/volvere-por-ti.mp3",
    coverUrl:
      "/music/covers/volvere-por-ti.webp",
    format: "MP3",
    externalUrl: null,
  },
  {
    id: "cero-dramas",
    title: "Cero Dramas",
    subtitle: "VANMOTION · Producido por VANMOTION",
    src: "/music/cero-dramas.mp3",
    coverUrl:
      "/music/covers/cero-dramas.webp",
    format: "MP3",
    externalUrl: null,
  },
];

export async function getPublicMusicTracks(): Promise<
  PublicMusicTrack[]
> {
  try {
    const totalTracks =
      await prisma.musicTrack.count();

    if (totalTracks === 0) {
      return fallbackTracks;
    }

    const tracks =
      await prisma.musicTrack.findMany({
        where: {
          active: true,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          fileUrl: true,
          coverUrl: true,
          format: true,
          externalUrl: true,
        },
      });

    return tracks.map((track) => ({
      id: track.slug || track.id,
      title: track.title,
      subtitle:
        track.subtitle ??
        "VANMOTION · Música original",
      src: track.fileUrl,
      coverUrl:
        track.coverUrl ??
        (track.slug === "the-cool-ashtray"
          ? "/uploads/music-covers/the-cool-ashtray-1784373940751.png"
          : null),
      format: track.format,
      externalUrl: track.externalUrl,
    }));
  } catch (error) {
    console.error(
      "VANMOTION_PUBLIC_MUSIC_ERROR:",
      error,
    );

    return fallbackTracks;
  }
}