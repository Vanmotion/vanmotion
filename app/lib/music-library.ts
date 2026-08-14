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

export type PublicMusicRecommendation = {
  id: string;
  title: string;
  artist: string;
  youtubeVideoId: string;
  coverUrl: string | null;
  editorialHeading: string | null;
  editorialTextEs: string | null;
  editorialTextEn: string | null;
  editorialCredit: string | null;
  editorialStyle: string | null;
  documentImageUrl: string | null;
  documentSourceUrl: string | null;
  documentAuthentic: boolean;
};

export const fallbackRecommendations: PublicMusicRecommendation[] = [
  {
    id: "fallback-time-after-time",
    title: "TIME AFTER TIME",
    artist: "Cyndi Lauper",
    youtubeVideoId: "VdQY7BusJNU",
    coverUrl: null,
    editorialHeading: "1983",
    editorialTextEs:
      "Cyndi Lauper + Rob Hyman. Letras manuscritas de Time After Time conservadas hoy como parte de su archivo en el Rock & Roll Hall of Fame.",
    editorialTextEn:
      "Cyndi Lauper + Rob Hyman. Handwritten lyrics for Time After Time are preserved today as part of her archive at the Rock & Roll Hall of Fame.",
    editorialCredit:
      "Rock & Roll Hall of Fame · archive",
    editorialStyle: "paper",
    documentImageUrl: null,
    documentSourceUrl: null,
    documentAuthentic: false,
  },
  {
    id: "fallback-sin-ti",
    title: "SIN TI",
    artist: "Jay Wheeler",
    youtubeVideoId: "3WOPP2ZaoK8",
    coverUrl: null,
    editorialHeading: "2019 · PLATÓNICO",
    editorialTextEs:
      "Sin Ti pertenece al primer capítulo de Jay Wheeler: canciones donde la vulnerabilidad y la ausencia empezaron a definir una voz propia dentro del urbano.",
    editorialTextEn:
      "Sin Ti belongs to Jay Wheeler's first chapter: songs where vulnerability and absence began to define a voice of his own within urban music.",
    editorialCredit:
      "Transcripción editorial · VANMOTION",
    editorialStyle: "memo",
    documentImageUrl: null,
    documentSourceUrl: null,
    documentAuthentic: false,
  },
];

export async function getPublicMusicRecommendations(): Promise<
  PublicMusicRecommendation[]
> {
  try {
    const recommendations =
      await prisma.musicRecommendation.findMany({
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
          title: true,
          artist: true,
          youtubeVideoId: true,
          coverUrl: true,
          editorialHeading: true,
          editorialTextEs: true,
          editorialTextEn: true,
          editorialCredit: true,
          editorialStyle: true,
          documentImageUrl: true,
          documentSourceUrl: true,
          documentAuthentic: true,
        },
      });

    return recommendations;
  } catch (error) {
    console.error(
      "VANMOTION_PUBLIC_MUSIC_RECOMMENDATIONS_ERROR:",
      error,
    );

    return fallbackRecommendations;
  }
}
