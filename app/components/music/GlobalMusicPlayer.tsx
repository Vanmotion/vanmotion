"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { Language } from "@/app/language";
import type { PublicMusicRecommendation } from "@/app/lib/music-library";
import { getLocalizedTrackTitle } from "@/app/lib/music-track-titles";

import { useMusicPlayer } from "./MusicPlayerContext";
import YouTubeRecommendationPlayer, {
  type YouTubePlayerHandle,
} from "./YouTubeRecommendationPlayer";
import styles from "./GlobalMusicPlayer.module.css";

type GlobalMusicPlayerProps = {
  language: Language;
  recommendations: PublicMusicRecommendation[];
};

const translations = {
  es: {
    playerName: "VANMOTION RADIO",
    openPlayer: "Abrir reproductor",
    closePlayer: "Cerrar reproductor",
    expandPlayer: "Mostrar canciones y volumen",
    reducePlayer: "Ocultar canciones y volumen",
    recommendations: "Volver a recomendaciones",
    minimizeRecommendation: "Minimizar vídeo",
    expandRecommendation: "Ampliar vídeo",
    videoUnavailable: "No se puede reproducir este vídeo.",
    openOnYouTube: "Abrir en YouTube",
    closeRecommendation: "Cerrar vídeo",
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
    playerName: "VANMOTION RADIO",
    openPlayer: "Open player",
    closePlayer: "Close player",
    expandPlayer: "Show tracks and volume",
    reducePlayer: "Hide tracks and volume",
    recommendations: "Back to recommendations",
    minimizeRecommendation: "Minimize video",
    expandRecommendation: "Expand video",
    videoUnavailable: "This video cannot be played.",
    openOnYouTube: "Open on YouTube",
    closeRecommendation: "Close video",
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
    recommendations: string;
    minimizeRecommendation: string;
    expandRecommendation: string;
    videoUnavailable: string;
    openOnYouTube: string;
    closeRecommendation: string;
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

function formatPlayerTime(value: number) {
  const safeValue =
    Number.isFinite(value) && value > 0 ? value : 0;

  const minutes = Math.floor(safeValue / 60);
  const seconds = Math.floor(safeValue % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function GlobalMusicPlayer({
  language,
  recommendations,
}: GlobalMusicPlayerProps) {
  const content = translations[language];
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const [seekPreview, setSeekPreview] =
    useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeRecommendation, setActiveRecommendation] =
    useState<string | null>(null);
  const [
    recommendationIsPlaying,
    setRecommendationIsPlaying,
  ] = useState(false);
  const recommendationPlayerRef =
    useRef<YouTubePlayerHandle | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [recommendationRetry, setRecommendationRetry] = useState(0);

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
    pausePlayback,
    setAudioStartHandler,
    setVideoSessionActive,
    selectTrack,
    playPrevious,
    playNext,
    changeProgress,
    changeVolume,
    setLastTrackEndedHandler,
  } = useMusicPlayer();

  const activeRecommendationData = recommendations.find(
    (recommendation) =>
      recommendation.youtubeVideoId === activeRecommendation,
  );

  useEffect(() => {
    setVideoSessionActive(Boolean(activeRecommendationData));
    return () => setVideoSessionActive(false);
  }, [activeRecommendationData, setVideoSessionActive]);

  useEffect(() => {
    setAudioStartHandler(() => {
      recommendationPlayerRef.current?.pauseVideo?.();
      setRecommendationIsPlaying(false);
    });
    return () => setAudioStartHandler(null);
  }, [setAudioStartHandler]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      setExpanded(false);
    }
  }, [pathname]);

  function closeRecommendation() {
    recommendationPlayerRef.current?.stopVideo?.();
    setRecommendationIsPlaying(false);
    setActiveRecommendation(null);
    setVideoSessionActive(false);
    setRecommendationError(null);
  }

  function selectRecommendation(videoId: string) {
    pausePlayback();
    setRecommendationError(null);
    setRecommendationIsPlaying(true);
    setVideoSessionActive(true);
    setActiveRecommendation(videoId);
    setExpanded(true);
  }

  const selectRecommendationRef = useRef(selectRecommendation);
  useEffect(() => {
    selectRecommendationRef.current = selectRecommendation;
  });

  useEffect(() => {
    setLastTrackEndedHandler(() => {
      const firstRecommendation = recommendations[0];

      if (firstRecommendation) {
        selectRecommendationRef.current(firstRecommendation.youtubeVideoId);
      } else {
        setRecommendationIsPlaying(false);
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

  if (tracks.length === 0 && recommendations.length === 0) {
    return null;
  }

  const currentTrackTitle = currentTrack
    ? getLocalizedTrackTitle(currentTrack, language)
    : content.playerName;

  const error =
    playbackError === "activation"
      ? content.audioActivation
      : playbackError === "missing-audio"
        ? content.missingAudio
        : null;

  const playerIsPlaying =
    activeRecommendation !== null
      ? recommendationIsPlaying
      : isPlaying;

  return (
    <aside
      className={`${styles.player} ${
        expanded ? styles.expanded : ""
      } ${
        activeRecommendationData
          ? styles.recommendationActive
          : ""
      } ${
        activeRecommendationData && !expanded
          ? styles.recommendationMinimized
          : ""
      }`}
    >
      <div className={styles.mainRow} hidden={Boolean(activeRecommendationData)}>
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

            <strong>
              {String(currentIndex + 1).padStart(2, "0")} ·{" "}
              {currentTrackTitle}
            </strong>

            <span className={styles.trackMeta}>
              {currentTrack?.subtitle
                ? `${currentTrack.subtitle} · `
                : ""}
              {formatPlayerTime(currentTime)} /{" "}
              {formatPlayerTime(duration)}
            </span>
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
              closeRecommendation();
              playPrevious();
            }}
            disabled={!currentTrack}
            aria-label={content.previousTrack}
            title={content.previousTrack}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeRecommendation) {
                setRecommendationIsPlaying(
                  (current) => !current,
                );
                return;
              }

              void togglePlayback();
            }}
            className={styles.playButton}
            disabled={!currentTrack && !activeRecommendation}
            aria-label={
              playerIsPlaying
                ? content.pause
                : content.play
            }
            title={
              playerIsPlaying
                ? content.pause
                : content.play
            }
          >
            {playerIsPlaying ? "Ⅱ" : "▶"}
          </button>

          <button
            type="button"
            onClick={() => {
              closeRecommendation();
              playNext();
            }}
            disabled={!currentTrack}
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
        className={styles.miniProgress}
        hidden={Boolean(activeRecommendationData)}
        aria-hidden="true"
      >
        <span
          style={{
            width: `${
              duration > 0
                ? Math.min(
                    100,
                    (currentTime / duration) * 100,
                  )
                : 0
            }%`,
          }}
        />
      </div>

      {activeRecommendationData && (
        <div className={styles.recommendationStage}>
          <div className={styles.recommendationStageHeader}>
            <div className={styles.recommendationStageTitle}>
              <span>{content.playerName}</span>
              <strong>{activeRecommendationData.title}</strong>
              <small>{activeRecommendationData.artist}</small>
            </div>
            <div className={styles.recommendationStageControls}>
              <button
                type="button"
                onClick={() => {
                  setRecommendationError(null);
                  if (!recommendationIsPlaying) pausePlayback();
                  setRecommendationIsPlaying((current) => !current);
                }}
                aria-label={recommendationIsPlaying ? content.pause : content.play}
                title={recommendationIsPlaying ? content.pause : content.play}
              >
                {recommendationIsPlaying ? "Ⅱ" : "▶"}
              </button>
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-label={expanded ? content.minimizeRecommendation : content.expandRecommendation}
                title={expanded ? content.minimizeRecommendation : content.expandRecommendation}
              >
                {expanded ? "−" : "□"}
              </button>
              <button
                type="button"
                onClick={closeRecommendation}
                aria-label={content.closeRecommendation}
                title={content.closeRecommendation}
              >
                ×
              </button>
            </div>
          </div>

          <YouTubeRecommendationPlayer
            key={`${activeRecommendationData.youtubeVideoId}:${recommendationRetry}`}
            videoId={activeRecommendationData.youtubeVideoId}
            title={`${activeRecommendationData.title} · ${activeRecommendationData.artist}`}
            playing={recommendationIsPlaying}
            playerRef={recommendationPlayerRef}
            onPlaying={() => {
              pausePlayback();
              setRecommendationIsPlaying(true);
              setRecommendationError(null);
            }}
            onPaused={() => setRecommendationIsPlaying(false)}
            onError={(message) => {
              setRecommendationIsPlaying(false);
              setRecommendationError(message);
            }}
            onEnded={() => {
              const activeIndex = recommendations.findIndex(
                (recommendation) =>
                  recommendation.youtubeVideoId === activeRecommendationData.youtubeVideoId,
              );
              const nextRecommendation = recommendations[activeIndex + 1];
              if (nextRecommendation) {
                selectRecommendation(nextRecommendation.youtubeVideoId);
                return;
              }
              closeRecommendation();
              selectTrack(0, true);
            }}
          />

          {recommendationError && (
            <div className={styles.recommendationError} role="alert">
              <p>{recommendationError}</p>
              <button type="button" onClick={() => {
                setRecommendationError(null);
                setRecommendationRetry((current) => current + 1);
                setRecommendationIsPlaying(true);
              }}>
                {content.play}
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${activeRecommendationData.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.openOnYouTube} ↗
              </a>
            </div>
          )}

          {expanded && (
            <button
              type="button"
              className={styles.recommendationBackButton}
              onClick={closeRecommendation}
            >
              {content.recommendations}
            </button>
          )}
        </div>
      )}

      <div
        hidden={!expanded || Boolean(activeRecommendation)}
        inert={!expanded || Boolean(activeRecommendation)}
        className={`${styles.expandedContent} ${
          expanded && !activeRecommendation
            ? ""
            : styles.expandedContentHidden
        }`}
      >
          <div className={styles.progress}>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={
                seekPreview ??
                Math.min(currentTime, duration || 0)
              }
              onChange={(event) => {
                setSeekPreview(
                  Number(event.currentTarget.value),
                );
              }}
              onPointerUp={(event) => {
                changeProgress(
                  Number(event.currentTarget.value),
                );
                setSeekPreview(null);
              }}
              onKeyUp={(event) => {
                changeProgress(
                  Number(event.currentTarget.value),
                );
                setSeekPreview(null);
              }}
              onBlur={(event) => {
                if (seekPreview === null) {
                  return;
                }

                changeProgress(
                  Number(event.currentTarget.value),
                );
                setSeekPreview(null);
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
                    closeRecommendation();
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

                      <button
                          type="button"
                          className={
                            styles.youtubePreviewButton
                          }
                          onClick={() => {
                            selectRecommendation(
                              recommendation.youtubeVideoId,
                            );
                          }}
                          aria-label={`Reproducir ${recommendation.title}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              recommendation.coverUrl ??
                              `https://i.ytimg.com/vi/${recommendation.youtubeVideoId}/hqdefault.jpg`
                            }
                            alt=""
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
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
