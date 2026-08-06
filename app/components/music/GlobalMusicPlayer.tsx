"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { Language } from "@/app/language";
import { getLocalizedTrackTitle } from "@/app/lib/music-track-titles";

import { useMusicPlayer } from "./MusicPlayerContext";
import styles from "./GlobalMusicPlayer.module.css";

type GlobalMusicPlayerProps = {
  language: Language;
};

const translations = {
  es: {
    playerName: "MÚSICA",
    openPlayer: "Abrir reproductor",
    closePlayer: "Cerrar reproductor",
    expandPlayer: "Mostrar canciones y volumen",
    reducePlayer: "Ocultar canciones y volumen",
    previousTrack: "Canción anterior",
    nextTrack: "Canción siguiente",
    play: "Reproducir",
    pause: "Pausar",
    progress: "Progreso de la canción",
    volume: "Volumen",
    volumeShort: "VOL",
    playing: "SONANDO",
    audioActivation:
      "Pulsa reproducir otra vez para activar el audio.",
    missingAudio:
      "No se encuentra el archivo de audio.",
    home: "Ir al inicio de VANMOTION",
  },

  en: {
    playerName: "MUSIC",
    openPlayer: "Open player",
    closePlayer: "Close player",
    expandPlayer: "Show tracks and volume",
    reducePlayer: "Hide tracks and volume",
    previousTrack: "Previous track",
    nextTrack: "Next track",
    play: "Play",
    pause: "Pause",
    progress: "Track progress",
    volume: "Volume",
    volumeShort: "VOL",
    playing: "PLAYING",
    audioActivation:
      "Press play again to enable the audio.",
    missingAudio:
      "The audio file could not be found.",
    home: "Go to the VANMOTION home page",
  },
} satisfies Record<
  Language,
  {
    playerName: string;
    openPlayer: string;
    closePlayer: string;
    expandPlayer: string;
    reducePlayer: string;
    previousTrack: string;
    nextTrack: string;
    play: string;
    pause: string;
    progress: string;
    volume: string;
    volumeShort: string;
    playing: string;
    audioActivation: string;
    missingAudio: string;
    home: string;
  }
>;

export default function GlobalMusicPlayer({
  language,
}: GlobalMusicPlayerProps) {
  const pathname = usePathname();
  const content = translations[language];
  const [expanded, setExpanded] = useState(false);

  const {
    tracks,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackError,
    togglePlayback,
    selectTrack,
    playPrevious,
    playNext,
    changeProgress,
    changeVolume,
  } = useMusicPlayer();

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  if (tracks.length === 0 || !currentTrack) {
    return null;
  }

  const currentTrackTitle = getLocalizedTrackTitle(
    currentTrack,
    language,
  );

  const error =
    playbackError === "activation"
      ? content.audioActivation
      : playbackError === "missing-audio"
        ? content.missingAudio
        : null;

  return (
    <aside
      className={`${styles.player} ${
        expanded ? styles.expanded : ""
      }`}
    >
      <div className={styles.mainRow}>
        <button
          type="button"
          className={styles.trackButton}
          onClick={() => {
            setExpanded((current) => !current);
          }}
          aria-label={
            expanded
              ? content.closePlayer
              : content.openPlayer
          }
        >
          <span className={styles.trackText}>
            <small>{content.playerName}</small>
            <strong>{currentTrackTitle}</strong>
          </span>
        </button>

        <Link
          href="/"
          className={styles.centerLogo}
          aria-label={content.home}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/vanmotion-mark.webp"
            alt="VANMOTION"
          />
        </Link>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={playPrevious}
            aria-label={content.previousTrack}
            title={content.previousTrack}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => {
              void togglePlayback();
            }}
            className={styles.playButton}
            aria-label={
              isPlaying
                ? content.pause
                : content.play
            }
            title={
              isPlaying
                ? content.pause
                : content.play
            }
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>

          <button
            type="button"
            onClick={playNext}
            aria-label={content.nextTrack}
            title={content.nextTrack}
          >
            ›
          </button>
        </div>

        <button
          type="button"
          className={styles.expandButton}
          onClick={() => {
            setExpanded((current) => !current);
          }}
          aria-label={
            expanded
              ? content.reducePlayer
              : content.expandPlayer
          }
          title={
            expanded
              ? content.reducePlayer
              : content.expandPlayer
          }
        >
          {expanded ? "×" : "≡"}
        </button>
      </div>

      {expanded && (
        <div className={styles.expandedContent}>
          <div className={styles.progress}>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(
                currentTime,
                duration || 0,
              )}
              onChange={(event) => {
                changeProgress(
                  Number(event.target.value),
                );
              }}
              aria-label={content.progress}
            />
          </div>

          <div className={styles.volume}>
            <span>{content.volumeShort}</span>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => {
                changeVolume(
                  Number(event.target.value),
                );
              }}
              aria-label={content.volume}
            />
          </div>

          <div className={styles.trackList}>
            {tracks.map((track, index) => {
              const active = index === currentIndex;
              const trackTitle = getLocalizedTrackTitle(
                track,
                language,
              );

              return (
                <button
                  type="button"
                  key={track.id}
                  className={
                    active
                      ? styles.activeTrack
                      : ""
                  }
                  onClick={() => {
                    selectTrack(index, isPlaying);
                  }}
                >
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span>
                    <strong>{trackTitle}</strong>
                    <small>{track.subtitle}</small>
                  </span>

                  <span>
                    {active && isPlaying
                      ? content.playing
                      : track.format}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p
              className={styles.error}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
