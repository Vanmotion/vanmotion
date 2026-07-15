"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./musica.module.css";

export type MusicTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  format: string;
};

export type MusicPlayerLanguage = "es" | "en";

type MusicPlayerProps = {
  tracks: MusicTrack[];
  language?: MusicPlayerLanguage;
};

const translations = {
  es: {
    empty: "No hay canciones configuradas.",
    playbackError:
      "No se ha podido reproducir el archivo. Comprueba que existe en public/music.",
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
  },

  en: {
    empty: "No tracks have been configured.",
    playbackError:
      "The file could not be played. Check that it exists in public/music.",
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
  },
} as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function MusicPlayer({
  tracks,
  language = "es",
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeAfterChangeRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);

  const content = translations[language];
  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.load();

    setCurrentTime(0);
    setDuration(0);
    setError(null);

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
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  if (!currentTrack) {
    return (
      <section className={styles.player}>
        <p className={styles.error}>{content.empty}</p>
      </section>
    );
  }

  function selectTrack(
    index: number,
    autoplay = true,
  ) {
    if (index < 0 || index >= tracks.length) {
      return;
    }

    resumeAfterChangeRef.current =
      autoplay || isPlaying;

    setCurrentIndex(index);
  }

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
        setError(content.playbackError);
      }

      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  function playPrevious() {
    const previousIndex =
      currentIndex === 0
        ? tracks.length - 1
        : currentIndex - 1;

    selectTrack(previousIndex);
  }

  function playNext() {
    const nextIndex =
      currentIndex === tracks.length - 1
        ? 0
        : currentIndex + 1;

    selectTrack(nextIndex);
  }

  function changeProgress(value: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeVolume(value: number) {
    setVolume(value);
  }

  return (
    <section className={styles.player}>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        onTimeUpdate={(event) => {
          setCurrentTime(
            event.currentTarget.currentTime,
          );
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
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
          setError(
            content.audioNotFound(
              currentTrack.title,
            ),
          );
        }}
      />

      <div className={styles.nowPlaying}>
        <div className={styles.cover}>
          <span>V</span>

          <div>
            <small>VANMOTION</small>
            <strong>MUSIC</strong>
          </div>
        </div>

        <div className={styles.trackInformation}>
          <p>{content.nowPlaying}</p>

          <h2>{currentTrack.title}</h2>

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
            changeVolume(
              Number(event.target.value),
            );
          }}
          aria-label={content.volume}
          title={content.volume}
        />
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      <div className={styles.trackList}>
        {tracks.map((track, index) => {
          const active = index === currentIndex;

          return (
            <button
              type="button"
              key={track.id}
              onClick={() => {
                selectTrack(index, true);
              }}
              className={
                active ? styles.activeTrack : ""
              }
              aria-label={`${content.play}: ${track.title}`}
            >
              <span className={styles.trackNumber}>
                {String(index + 1).padStart(
                  2,
                  "0",
                )}
              </span>

              <span className={styles.trackName}>
                <strong>{track.title}</strong>
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