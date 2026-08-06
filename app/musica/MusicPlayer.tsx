"use client";

import { useEffect, useState } from "react";

import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import { getLocalizedTrackTitle } from "@/app/lib/music-track-titles";

import styles from "./musica.module.css";

export type MusicPlayerLanguage = "es" | "en";

type MusicPlayerProps = {
  language?: MusicPlayerLanguage;
};

const translations = {
  es: {
    empty: "No hay canciones configuradas.",
    playbackError:
      "No se ha podido reproducir el archivo. Pulsa reproducir otra vez.",
    audioNotFound: (title: string) =>
      `No se encuentra el audio de “${title}”.`,
    nowPlaying: "Reproduciendo ahora",
    previousTrack: "Canción anterior",
    nextTrack: "Canción siguiente",
    play: "Reproducir",
    pause: "Pausar",
    progress: "Progreso de la canción",
    volume: "Volumen",
    playing: "SONANDO",
    coverAlt: "Portada de",
  },

  en: {
    empty: "No tracks have been configured.",
    playbackError:
      "The file could not be played. Press play again.",
    audioNotFound: (title: string) =>
      `The audio file for “${title}” could not be found.`,
    nowPlaying: "Now playing",
    previousTrack: "Previous track",
    nextTrack: "Next track",
    play: "Play",
    pause: "Pause",
    progress: "Track progress",
    volume: "Volume",
    playing: "PLAYING",
    coverAlt: "Cover artwork for",
  },
} as const;

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

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function MusicPlayer({
  language = "es",
}: MusicPlayerProps) {
  const [coverError, setCoverError] = useState(false);
  const content = translations[language];

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
    setCoverError(false);
  }, [currentTrack?.coverUrl, currentTrack?.id]);

  if (!currentTrack) {
    return (
      <section className={styles.player}>
        <p className={styles.error}>{content.empty}</p>
      </section>
    );
  }

  const idKey = normalizeTrackKey(currentTrack.id);
  const titleKey = normalizeTrackKey(currentTrack.title);
  const coverUrl =
    coverByTrack[idKey] ??
    coverByTrack[titleKey] ??
    currentTrack.coverUrl;
  const showCover = Boolean(coverUrl) && !coverError;
  const currentTrackTitle = getLocalizedTrackTitle(
    currentTrack,
    language,
  );

  const error =
    playbackError === "activation"
      ? content.playbackError
      : playbackError === "missing-audio"
        ? content.audioNotFound(currentTrackTitle)
        : null;

  return (
    <section className={styles.player}>
      <div className={styles.nowPlaying}>
        <div
          className={styles.cover}
          style={
            showCover
              ? {
                  padding: 0,
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {showCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={coverUrl}
              src={coverUrl ?? undefined}
              alt={`${content.coverAlt} ${currentTrackTitle}`}
              onError={() => {
                setCoverError(true);
              }}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <>
              <span>V</span>

              <div>
                <small>VANMOTION</small>
                <strong>MUSIC</strong>
              </div>
            </>
          )}
        </div>

        <div className={styles.trackInformation}>
          <p>{content.nowPlaying}</p>
          <h2>{currentTrackTitle}</h2>
          <span>{currentTrack.subtitle}</span>
        </div>
      </div>

      <div className={styles.playerControls}>
        <button
          type="button"
          onClick={playPrevious}
          aria-label={content.previousTrack}
          title={content.previousTrack}
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => {
            void togglePlayback();
          }}
          className={styles.playButton}
          aria-label={isPlaying ? content.pause : content.play}
          title={isPlaying ? content.pause : content.play}
        >
          {isPlaying ? "Ⅱ" : "▶"}
        </button>

        <button
          type="button"
          onClick={playNext}
          aria-label={content.nextTrack}
          title={content.nextTrack}
        >
          →
        </button>
      </div>

      <div className={styles.progressSection}>
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            changeProgress(Number(event.target.value));
          }}
          aria-label={content.progress}
          title={content.progress}
        />

        <span>{formatTime(duration)}</span>
      </div>

      <div className={styles.volume}>
        <span>VOL</span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => {
            changeVolume(Number(event.target.value));
          }}
          aria-label={content.volume}
          title={content.volume}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

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
              onClick={() => {
                selectTrack(index, true);
              }}
              className={active ? styles.activeTrack : ""}
              aria-label={`${content.play}: ${trackTitle}`}
            >
              <span className={styles.trackNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className={styles.trackName}>
                <strong>{trackTitle}</strong>
                <small>{track.subtitle}</small>
              </span>

              <span className={styles.trackFormat}>
                {active && isPlaying
                  ? content.playing
                  : track.format}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
