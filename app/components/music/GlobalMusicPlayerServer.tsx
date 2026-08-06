import { getCurrentLanguage } from "@/app/lib/language";

import GlobalMusicPlayer from "./GlobalMusicPlayer";

export default async function GlobalMusicPlayerServer() {
  const language = await getCurrentLanguage();

  return <GlobalMusicPlayer language={language} />;
}
