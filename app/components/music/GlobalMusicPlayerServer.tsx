import { getCurrentLanguage } from "@/app/lib/language";
import { getPublicMusicTracks } from "@/app/lib/music-library";

import GlobalMusicPlayer from "./GlobalMusicPlayer";

export default async function GlobalMusicPlayerServer() {
  const [tracks, language] = await Promise.all([
    getPublicMusicTracks(),
    getCurrentLanguage(),
  ]);

  return (
    <GlobalMusicPlayer
      tracks={tracks}
      language={language}
    />
  );
}