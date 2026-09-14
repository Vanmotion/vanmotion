"use client";

import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import styles from "./musica.module.css";

export default function HeroMusicMonitor() {
  const { currentTrack } = useMusicPlayer();

  const cover =
    currentTrack?.coverUrl ?? "/brand/vanmotion-mark.webp";

  return (
    <div
      className={styles.heroMonitorScreen}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover}
        alt=""
        className={styles.heroMonitorArtwork}
      />
    </div>
  );
}
