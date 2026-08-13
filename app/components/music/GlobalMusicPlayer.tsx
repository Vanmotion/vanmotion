"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Language } from "@/app/language";
import type { PublicMusicRecommendation } from "@/app/lib/music-library";
import { getLocalizedTrackTitle } from "@/app/lib/music-track-titles";

import { useMusicPlayer } from "./MusicPlayerContext";
import styles from "./GlobalMusicPlayer.module.css";

type GlobalMusicPlayerProps = {
  language: Language;
  recommendations: PublicMusicRecommendation[];
};

type YouTubePlayerInstance = {
  destroy?: () => void;
};

type YouTubeStateChangeEvent = {
  data: number;
};

type YouTubeApi = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events?: {
        onStateChange?: (
          event: YouTubeStateChangeEvent,
        ) => void;
      };
    },
  ) => YouTubePlayerInstance;
};

type YouTubeWindow = Window &
  typeof globalThis & {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  };

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const youtubeWindow = window as YouTubeWindow;

  if (youtubeWindow.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady =
      youtubeWindow.onYouTubeIframeAPIReady;

    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

type YouTubeRecommendationPlayerProps = {
  videoId: string;
  title: string;
  onEnded: () => void;
};

function YouTubeRecommendationPlayer({
  videoId,
  title,
  onEnded,
}: YouTubeRecommendationPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;

    void loadYouTubeIframeApi().then(() => {
      if (cancelled || !iframeRef.current) {
        return;
      }

      const youtubeWindow = window as YouTubeWindow;
      const api = youtubeWindow.YT;

      if (!api?.Player) {
        return;
      }

      new api.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            if (event.data === 0) {
              onEndedRef.current();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return (
    <iframe
      ref={iframeRef}
      className={styles.youtubeEmbed}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&enablejsapi=1&playsinline=1&controls=0&disablekb=1&fs=0`}
      title={title}
      allow="autoplay; encrypted-media"
      tabIndex={-1}
      style={{ pointerEvents: "none" }}
    />
  );
}

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
  recommendations,
}: GlobalMusicPlayerProps) {
  const content = translations[language];
  const [expanded, setExpanded] = useState(false);
  const [activeRecommendation, setActiveRecommendation] =
    useState<string | null>(null);

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
    setLastTrackEndedHandler,
  } = useMusicPlayer();

  useEffect(() => {
    setLastTrackEndedHandler(() => {
      const firstRecommendation = recommendations[0];

      if (firstRecommendation) {
        setActiveRecommendation(
          firstRecommendation.youtubeVideoId,
        );
      } else {
        selectTrack(0, true);
      }
    });

    return () => {
      setLastTrackEndedHandler(null);
    };
  }, [
    recommendations,
    selectTrack,
    setLastTrackEndedHandler,
  ]);

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
            onClick={() => {
              setActiveRecommendation(null);
              playPrevious();
            }}
            aria-label={content.previousTrack}
            title={content.previousTrack}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRecommendation(null);
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
            onClick={() => {
              setActiveRecommendation(null);
              playNext();
            }}
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

      <div
        className={`${styles.expandedContent} ${
          expanded ? "" : styles.expandedContentHidden
        }`}
      >
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
                    setActiveRecommendation(null);
                    selectTrack(index, true);
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

          {recommendations.length > 0 && (
            <div className={styles.recommendedInPlayer}>
              <p className={styles.recommendedTitle}>
                {language === "es"
                  ? "VANMOTION RECOMIENDA"
                  : "VANMOTION RECOMMENDS"}
              </p>

              {recommendations.map(
                (recommendation, index) => {
                  const displayNumber = String(
                    tracks.length + index + 1,
                  ).padStart(2, "0");
                  const nextRecommendation =
                    recommendations[index + 1];

                  return (
                    <div
                      className={
                        styles.spotifyRecommendedTrack
                      }
                      key={recommendation.id}
                    >
                      <div
                        className={
                          styles.recommendedTrackLabel
                        }
                      >
                        <span>{displayNumber}</span>

                        <div>
                          <strong>
                            {recommendation.title}
                          </strong>

                          <small>
                            {recommendation.artist}
                          </small>
                        </div>
                      </div>

                      {activeRecommendation ===
                      recommendation.youtubeVideoId ? (
                        <div
                          className={
                            styles.youtubeCoverPlayer
                          }
                        >
                          <YouTubeRecommendationPlayer
                            videoId={
                              recommendation.youtubeVideoId
                            }
                            title={`${recommendation.title} · ${recommendation.artist}`}
                            onEnded={() => {
                              if (nextRecommendation) {
                                setActiveRecommendation(
                                  nextRecommendation.youtubeVideoId,
                                );
                                return;
                              }

                              setActiveRecommendation(null);
                              selectTrack(0, true);
                            }}
                          />

                          <img
                            src={
                              recommendation.coverUrl ??
                              `https://i.ytimg.com/vi/${recommendation.youtubeVideoId}/hqdefault.jpg`
                            }
                            alt={`${recommendation.title} · ${recommendation.artist}`}
                            className={
                              styles.youtubeOfficialCover
                            }
                          />

                          <span
                            className={
                              styles.youtubePlayingBadge
                            }
                          >
                            {language === "es"
                              ? "SONANDO"
                              : "PLAYING"}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={
                            styles.youtubePreviewButton
                          }
                          onClick={() => {
                            if (isPlaying) {
                              void togglePlayback();
                            }

                            setActiveRecommendation(
                              recommendation.youtubeVideoId,
                            );
                          }}
                          aria-label={`Reproducir ${recommendation.title}`}
                        >
                          <img
                            src={
                              recommendation.coverUrl ??
                              `https://i.ytimg.com/vi/${recommendation.youtubeVideoId}/hqdefault.jpg`
                            }
                            alt=""
                            className={
                              styles.youtubePreviewImage
                            }
                          />

                          <span
                            className={
                              styles.youtubePreviewPlay
                            }
                          >
                            ▶
                          </span>
                        </button>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}

          {error && (
            <p
              className={styles.error}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
    </aside>
  );
}
