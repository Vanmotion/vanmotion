import { getPublicMusicTracks } from "@/app/lib/music-library";

import MusicPlayer, {
  type MusicPlayerLanguage,
} from "./MusicPlayer";

type DatabaseMusicPlayerProps = {
  language?: MusicPlayerLanguage;
};

const coverByTrack: Record<string, string> = {
  "the-cool-ashtray":
    "/uploads/music-covers/the-cool-ashtray-1784373940751.png",

  "suenos-prestados":
    "/uploads/music-covers/suenos-prestados-1784376509559.png",

  "solo-en-mi-mente":
    "/uploads/music-covers/solo-en-mi-mente-1784377787037.png",

  "solo-con-mi-mente":
    "/uploads/music-covers/solo-en-mi-mente-1784377787037.png",

  vanmotion:
    "/uploads/music-covers/vanmotion-1784378515490.png",
};

function normalizeTrackKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function DatabaseMusicPlayer({
  language = "es",
}: DatabaseMusicPlayerProps) {
  const tracks = await getPublicMusicTracks();

  const playerTracks = tracks.map((track) => {
    const idKey = normalizeTrackKey(track.id);
    const titleKey = normalizeTrackKey(track.title);

    const fixedCover =
      coverByTrack[idKey] ??
      coverByTrack[titleKey] ??
      track.coverUrl;

    return {
      id: track.id,
      title: track.title,
      subtitle: track.subtitle,
      src: track.src,
      coverUrl: fixedCover,
      format: track.format,
    };
  });

  return (
    <MusicPlayer
      tracks={playerTracks}
      language={language}
    />
  );
}