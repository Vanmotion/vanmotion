"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import type { Language } from "@/app/language";
import type { PublicMusicTrack } from "@/app/lib/music-library";

import styles from "./GlobalMusicPlayer.module.css";

type GlobalMusicPlayerProps = {
  tracks: PublicMusicTrack[];
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
  tracks,
  language,
}: GlobalMusicPlayerProps) {
  const pathname = usePathname();
  const content = translations[language];

  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeAfterChangeRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentTrack = tracks[currentIndex] ?? tracks[0];

  const hidden =
    pathname === "/musica" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login-admin");

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    const savedTrack = window.localStorage.getItem(
      "vanmotion-global-track",
    );

    const savedVolume = window.localStorage.getItem(
      "vanmotion-global-volume",
    );

    if (savedTrack !== null) {
      const index = Number(savedTrack);

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < tracks.length
      ) {
        setCurrentIndex(index);
      } else {
        setCurrentIndex(0);
      }
    }

    if (savedVolume !== null) {
      const parsedVolume = Number(savedVolume);

      if (
        Number.isFinite(parsedVolume) &&
        parsedVolume >= 0 &&
        parsedVolume <= 1
      ) {
        setVolume(parsedVolume);
      }
    }
  }, [tracks.length]);

  useEffect(() => {
    if (
      currentIndex >= tracks.length &&
      tracks.length > 0
    ) {
      setCurrentIndex(0);
    }
  }, [currentIndex, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    audio.load();
    setProgress(0);
    setDuration(0);
    setError(null);

    window.localStorage.setItem(
      "vanmotion-global-track",
      String(currentIndex),
    );

    if (resumeAfterChangeRef.current) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [currentIndex, currentTrack?.src]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume;
    }

    window.localStorage.setItem(
      "vanmotion-global-volume",
      String(volume),
    );
  }, [volume]);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        setError(null);
      } catch {
        setError(content.audioActivation);
      }

      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  function selectTrack(index: number) {
    if (index < 0 || index >= tracks.length) {
      return;
    }

    resumeAfterChangeRef.current = isPlaying;
    setCurrentIndex(index);
  }

  function playPrevious() {
    if (tracks.length === 0) {
      return;
    }

    const nextIndex =
      currentIndex === 0
        ? tracks.length - 1
        : currentIndex - 1;

    resumeAfterChangeRef.current = true;
    setCurrentIndex(nextIndex);
  }

  function playNext() {
    if (tracks.length === 0) {
      return;
    }

    const nextIndex =
      currentIndex === tracks.length - 1
        ? 0
        : currentIndex + 1;

    resumeAfterChangeRef.current = true;
    setCurrentIndex(nextIndex);
  }

  function changeProgress(value: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = value;
    setProgress(value);
  }

  if (
    hidden ||
    tracks.length === 0 ||
    !currentTrack
  ) {
    return null;
  }

  return (
    <aside
      className={`${styles.player} ${
        expanded ? styles.expanded : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const audioDuration =
            event.currentTarget.duration;

          setDuration(
            Number.isFinite(audioDuration)
              ? audioDuration
              : 0,
          );
        }}
        onTimeUpdate={(event) => {
          setProgress(
            event.currentTarget.currentTime,
          );
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={playNext}
        onError={() => {
          setIsPlaying(false);
          setError(content.missingAudio);
        }}
      />

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
            <strong>{currentTrack.title}</strong>
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
            onClick={togglePlayback}
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
                progress,
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
                setVolume(
                  Number(event.target.value),
                );
              }}
              aria-label={content.volume}
            />
          </div>

          <div className={styles.trackList}>
            {tracks.map((track, index) => {
              const active =
                index === currentIndex;

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
                    selectTrack(index);
                  }}
                >
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span>
                    <strong>{track.title}</strong>
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