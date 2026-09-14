"use client";

import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import YouTubeRecommendationPlayer from "@/app/components/music/YouTubeRecommendationPlayer";
import styles from "./musica.module.css";

export default function HeroMusicMonitor() {
  const {
    currentTrack,
    recommendationVideoId,
    recommendationVideoPlaying,
  } = useMusicPlayer();

  const cover =
    currentTrack?.coverUrl ?? "/brand/vanmotion-mark.webp";

  return (
    <div
      className={styles.heroMonitorScreen}
      aria-hidden="true"
    >
      {recommendationVideoId ? (
        <YouTubeRecommendationPlayer
          key={recommendationVideoId}
          videoId={recommendationVideoId}
          title="Vídeo recomendado"
          playing={recommendationVideoPlaying}
          muted
          controls={false}
          className={styles.heroMonitorVideo}
          onPlaying={() => {}}
          onPaused={() => {}}
          onEnded={() => {}}
          onError={() => {}}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className={styles.heroMonitorArtwork}
        />
      )}
    </div>
  );
}
