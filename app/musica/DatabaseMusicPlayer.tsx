import MusicPlayer, {
  type MusicPlayerLanguage,
} from "./MusicPlayer";

type DatabaseMusicPlayerProps = {
  language?: MusicPlayerLanguage;
};

export default function DatabaseMusicPlayer({
  language = "es",
}: DatabaseMusicPlayerProps) {
  return <MusicPlayer language={language} />;
}
