import type { PublicMusicRecommendation } from "@/app/lib/music-library";

export function getLocalVimeoTestRecommendations(): PublicMusicRecommendation[] {
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  return [
    {
      id: "local-vimeo-test-r01",
      title: "R01 · Vimeo playback test",
      artist: "Local test · Vimeo 192812815",
      youtubeVideoId: null,
      videoUrl: "https://vimeo.com/192812815",
      coverUrl: null,
      editorialHeading: "LOCAL · VIMEO",
      editorialTextEs: "Prueba local de inserción, reproducción y sincronización.",
      editorialTextEn: "Local test for embedding, playback and synchronization.",
      editorialCredit: "Vimeo 192812815",
      editorialStyle: null,
      documentImageUrl: null,
      documentSourceUrl: null,
      documentAuthentic: false,
    },
    {
      id: "local-vimeo-test-r02",
      title: "R02 · Vimeo playback test",
      artist: "Local test · Vimeo 358850441",
      youtubeVideoId: null,
      videoUrl: "https://vimeo.com/358850441",
      coverUrl: null,
      editorialHeading: "LOCAL · VIMEO",
      editorialTextEs: "Prueba local de inserción, reproducción y sincronización.",
      editorialTextEn: "Local test for embedding, playback and synchronization.",
      editorialCredit: "Vimeo 358850441",
      editorialStyle: null,
      documentImageUrl: null,
      documentSourceUrl: null,
      documentAuthentic: false,
    },
  ];
}
