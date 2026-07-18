import type { Language } from "@/app/language";
import { getPublicMusicTracks } from "@/app/lib/music-library";

import MusicPlayer from "./MusicPlayer";

export const dynamic = "force-dynamic";

type DatabaseMusicPlayerProps = {
  language: Language;
};

export default async function DatabaseMusicPlayer({
  language,
}: DatabaseMusicPlayerProps) {
  const tracks = await getPublicMusicTracks();

  return (
    <MusicPlayer
      language={language}
      tracks={tracks.map((track) => ({
        id: track.id,
        title: track.title,
        subtitle: track.subtitle,
        src: track.src,
        coverUrl:
          track.title === "Sueños Prestados"
            ? "/uploads/music-covers/suenos-prestados-1784376509559.png"
            : track.coverUrl,
        format: track.format,
      }))}
    />
  );
}