"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import VimeoPlayer from "@vimeo/player";
import YouTubeRecommendationPlayer from "./YouTubeRecommendationPlayer";
import { getYouTubeVideoId } from "./YouTubeUrl";

import type { Language } from "@/app/language";
import { getLocalizedTrackTitle } from "@/app/lib/music-track-titles";

export type GlobalMusicRecommendation = {
  id: string;
  title: string;
  videoUrl: string | null;
  coverUrl: string | null;
};

import { useMusicPlayer } from "./MusicPlayerContext";
import styles from "./GlobalMusicPlayer.module.css";

type GlobalMusicPlayerProps = {
  language: Language;
  recommendations: GlobalMusicRecommendation[];
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

function getWikimediaVp9Url(
  videoUrl: string,
): string {
  if (
    !videoUrl.includes(
      "upload.wikimedia.org/wikipedia/commons/transcoded/",
    ) ||
    !videoUrl.endsWith(".360p.mpeg4.mov")
  ) {
    return videoUrl;
  }

  return videoUrl.replace(
    /\.360p\.mpeg4\.mov$/,
    ".480p.vp9.webm",
  );
}

function getVimeoEmbedUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host !== "vimeo.com" && host !== "player.vimeo.com") {
      return null;
    }

    const id = url.pathname
      .split("/")
      .filter(Boolean)
      .find((part) => /^\d+$/.test(part));

    return id
      ? `https://player.vimeo.com/video/${id}?dnt=1&autoplay=0&loop=0`
      : null;
  } catch {
    return null;
  }
}

export default function GlobalMusicPlayer({
  language,
  recommendations,
}: GlobalMusicPlayerProps) {
  const content = translations[language];
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const [expanded, setExpanded] = useState(false);
  const [audioLibraryOpen, setAudioLibraryOpen] = useState(false);
  const [activeRecommendation, setActiveRecommendation] =
    useState<string | null>(null);
  const [
    recommendationIsPlaying,
    setRecommendationIsPlaying,
  ] = useState(false);
  const vimeoControllerRef = useRef<VimeoPlayer | null>(null);
  const recommendationVideoRef =
    useRef<HTMLVideoElement | null>(null);
  const recommendationStartingRef =
    useRef(false);
  const recommendationAutoplayRef =
    useRef(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [recommendationRetry, setRecommendationRetry] = useState(0);

  const {
    tracks,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    playbackError,
    togglePlayback,
    pausePlayback,
    setAudioStartHandler,
    setVideoSessionActive,
    setRecommendationVideoState,
    setRecommendationVideoTime,
    selectTrack,
    changeProgress,
    playPrevious,
    playNext,
    setLastTrackEndedHandler,
  } = useMusicPlayer();

  const activeRecommendationData = recommendations.find(
    (recommendation) =>
      recommendation.id === activeRecommendation,
  );

  const recommendationVideoUrl =
    activeRecommendationData?.videoUrl?.trim() || null;

  const activeYouTubeId = getYouTubeVideoId(recommendationVideoUrl);

  const [preferVp9Video, setPreferVp9Video] =
    useState(false);

  useEffect(() => {
    const probe = document.createElement("video");

    const vp9Support = probe.canPlayType(
      'video/webm; codecs="vp9, opus"',
    );

    const frame = window.requestAnimationFrame(() => {
      setPreferVp9Video(vp9Support !== "");
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const recommendationPlaybackUrl =
    recommendationVideoUrl
      ? preferVp9Video
        ? getWikimediaVp9Url(
            recommendationVideoUrl,
          )
        : recommendationVideoUrl
      : null;

  useEffect(() => {
    setVideoSessionActive(Boolean(activeRecommendationData));
    return () => setVideoSessionActive(false);
  }, [activeRecommendationData, setVideoSessionActive]);

  useEffect(() => {
    setRecommendationVideoState(
      activeRecommendationData?.id ?? null,
      Boolean(activeRecommendationData && recommendationIsPlaying),
    );
  }, [
    activeRecommendationData,
    recommendationIsPlaying,
    setRecommendationVideoState,
  ]);

  useEffect(() => {
    if (!activeRecommendationData) {
      setRecommendationVideoTime(0);
      return;
    }

    const syncTime = () => {
      const time =
        recommendationVideoRef.current?.currentTime;

      if (
        typeof time === "number" &&
        Number.isFinite(time)
      ) {
        setRecommendationVideoTime(time);
      }
    };

    syncTime();

    const interval = window.setInterval(syncTime, 8000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    activeRecommendationData,
    recommendationIsPlaying,
    setRecommendationVideoTime,
  ]);

  useEffect(() => {
    return () => setRecommendationVideoState(null, false);
  }, [setRecommendationVideoState]);

  useEffect(() => {
    setAudioStartHandler(() => {
      recommendationStartingRef.current = false;
      recommendationAutoplayRef.current = false;

      recommendationVideoRef.current?.pause();

      setRecommendationIsPlaying(false);
      setActiveRecommendation(null);
      setVideoSessionActive(false);
      setRecommendationError(null);
    });

    return () => setAudioStartHandler(null);
  }, [
    setAudioStartHandler,
    setVideoSessionActive,
  ]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      setExpanded(false);
    }
  }, [pathname]);

  function closeRecommendation() {
    setAudioLibraryOpen(false);
    recommendationStartingRef.current = false;
    recommendationAutoplayRef.current = false;
    if (recommendationVideoRef.current) {
      recommendationVideoRef.current.pause();
      recommendationVideoRef.current.currentTime = 0;
    }
    setRecommendationIsPlaying(false);
    setActiveRecommendation(null);
    setVideoSessionActive(false);
    setRecommendationError(null);
  }

  function selectRecommendation(recommendationId: string) {
    const selectedRecommendation =
      recommendations.find(
        (recommendation) =>
          recommendation.id === recommendationId,
      );

    if (!selectedRecommendation?.videoUrl) {
      return;
    }

    pausePlayback();
    setRecommendationVideoTime(0);
    setRecommendationError(null);
    setVideoSessionActive(true);

    recommendationStartingRef.current = true;

    flushSync(() => {
      setActiveRecommendation(recommendationId);
      setRecommendationIsPlaying(
        !Boolean(getVimeoEmbedUrl(selectedRecommendation.videoUrl))
      );
      setExpanded(false);
    });

    // Inicio desde el clic original del usuario.
    if (getVimeoEmbedUrl(selectedRecommendation.videoUrl)) {
      recommendationStartingRef.current = false;

      const iframe = document.querySelector<HTMLIFrameElement>(
        'aside iframe[src^="https://player.vimeo.com/video/"]'
      );

      if (iframe) {
        const player = new VimeoPlayer(iframe);
        vimeoControllerRef.current = player;
        void player.play().catch(() => {
          // Si Firefox bloquea el audio automático,
          // Vimeo conserva su botón de reproducción.
        });
      }
      return;
    }

    if (getYouTubeVideoId(selectedRecommendation.videoUrl)) {
      recommendationStartingRef.current = false;
      return;
    }

    const video = recommendationVideoRef.current;

    if (video && !getVimeoEmbedUrl(selectedRecommendation.videoUrl)) {
      video.src =
        preferVp9Video
          ? getWikimediaVp9Url(
              selectedRecommendation.videoUrl,
            )
          : selectedRecommendation.videoUrl;
      video.load();

      void video.play().catch(() => {
        // onCanPlay hará un segundo intento manteniendo
        // la intención iniciada por el clic del usuario.
      });
    }
  }

  const selectRecommendationRef = useRef(selectRecommendation);
  useEffect(() => {
    selectRecommendationRef.current = selectRecommendation;
  });

  // VANMOTION AUTO-SEQUENCE VIMEO
  const advanceRecommendationRef =
    useRef<(id: string) => void>(() => {});

  advanceRecommendationRef.current = (finishedId) => {
    if (activeRecommendation !== finishedId) return;

    const index = recommendations.findIndex(
      (item) => item.id === finishedId
    );

    if (index < 0) return;

    const next = recommendations
      .slice(index + 1)
      .find((item) => Boolean(item.videoUrl));

    if (next) {
      selectRecommendationRef.current(next.id);
      return;
    }

    closeRecommendation();
    changeProgress(0);

    if (tracks.length > 0) {
      selectTrack(0, true);
    }
  };

  useEffect(() => {
    if (
      !activeRecommendationData ||
      !getVimeoEmbedUrl(recommendationVideoUrl)
    ) {
      return;
    }

    const iframe = document.querySelector<HTMLIFrameElement>(
      'aside iframe[src^="https://player.vimeo.com/video/"]'
    );

    if (!iframe) return;

    const player = new VimeoPlayer(iframe);
    const finishedId = activeRecommendationData.id;
    let handled = false;

    const onEnded = () => {
      if (handled) return;
      handled = true;
      advanceRecommendationRef.current(finishedId);
    };

    player.on("ended", onEnded);

    // Evitar que Vimeo repita el videoclip
    // antes de emitir el evento de finalizacion.
    void player.setLoop(false).catch(() => {});

    return () => {
      player.off("ended", onEnded);
    };
  }, [
    activeRecommendationData?.id,
    recommendationVideoUrl,
  ]);


  useEffect(() => {
    setLastTrackEndedHandler(() => {
      const firstRecommendation = recommendations[0];

      if (firstRecommendation) {
        selectRecommendationRef.current(firstRecommendation.id);
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

  useEffect(() => {
    const video = recommendationVideoRef.current;

    if (!video || !recommendationPlaybackUrl) {
      return;
    }

    video.pause();
    video.load();

    return () => {
      video.pause();
    };
  }, [recommendationPlaybackUrl]);

  useEffect(() => {
    const video = recommendationVideoRef.current;

    if (!video || !recommendationPlaybackUrl) {
      return;
    }

    if (recommendationIsPlaying) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [
    recommendationPlaybackUrl,
    recommendationIsPlaying,
  ]);

  if (tracks.length === 0 && recommendations.length === 0) {
    return null;
  }

  return (
    <aside
      className={`${styles.player} ${
        audioLibraryOpen ? styles.audioLibraryMode : ""
      } ${
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
      {activeRecommendationData && expanded && (
        <button
          type="button"
          className={styles.recommendationMenuCollapse}
          onClick={() => {
            setExpanded(false);
          }}
          aria-label={
            language === "es"
              ? "Volver al reproductor reducido"
              : "Return to minimized player"
          }
          title={
            language === "es"
              ? "Reducir reproductor"
              : "Minimize player"
          }
        >
          ↙
        </button>
      )}

      {activeRecommendationData && (
        <button
          type="button"
          className={styles.switchToMusicButton}
          onClick={() => {
            setAudioLibraryOpen(true);
          }}
          aria-label={
            language === "es"
              ? "Elegir canción de VANMOTION"
              : "Choose VANMOTION music"
          }
          title={
            language === "es"
              ? "Música VANMOTION"
              : "VANMOTION music"
          }
        >
          <span aria-hidden="true">♫</span>
        </button>
      )}

      <div className={styles.mainRow} hidden={Boolean(activeRecommendationData)}>
        <button
          type="button"
          className={styles.trackButton}
          onClick={() => {
            setExpanded((current) => !current);
          }}
          aria-label={`${expanded ? content.closePlayer : content.openPlayer}: ${currentTrackTitle}`}
        >
          <span className={styles.trackText}>
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
          {expanded ? "×" : "+"}
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
            <span className={styles.recommendationStageLabel}>
              {language === "es" ? "RECOMENDADO" : "RECOMMENDED"}
            </span>

            <div className={styles.recommendationStageControls}>
              {!getVimeoEmbedUrl(recommendationVideoUrl) && (
                <button
                type="button"
                onClick={() => {
                  setRecommendationError(null);
                  if (!recommendationIsPlaying) {
                    pausePlayback();
                  }
                  setRecommendationIsPlaying(
                    (current) => !current,
                  );
                }}
                aria-label={
                  recommendationIsPlaying
                    ? content.pause
                    : content.play
                }
                title={
                  recommendationIsPlaying
                    ? content.pause
                    : content.play
                }
              >
                {recommendationIsPlaying ? "Ⅱ" : "▶"}
              </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const activeIndex = recommendations.findIndex(
                    (recommendation) =>
                      recommendation.id ===
                      activeRecommendationData.id,
                  );

                  const nextRecommendation =
                    recommendations[
                      (activeIndex + 1) % recommendations.length
                    ];

                  if (nextRecommendation) {
                    selectRecommendation(
                      nextRecommendation.id,
                    );
                  }
                }}
                aria-label={
                  language === "es"
                    ? "Siguiente recomendado"
                    : "Next recommendation"
                }
                title={
                  language === "es"
                    ? "Siguiente recomendado"
                    : "Next recommendation"
                }
              >
                →
              </button>



              <button
                type="button"
                className={styles.recommendationSizeToggle}
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                aria-label={
                  expanded
                    ? content.minimizeRecommendation
                    : content.expandRecommendation
                }
                title={
                  expanded
                    ? content.minimizeRecommendation
                    : content.expandRecommendation
                }
              >
                {expanded ? "↙" : "⛶"}
              </button>
            </div>
          </div>

          {activeYouTubeId ? (
            <YouTubeRecommendationPlayer
              key={activeRecommendationData.id}
              videoId={activeYouTubeId}
              title={activeRecommendationData.title}
              playing={recommendationIsPlaying}
              syncRole="source"
              onPlaying={() => {
                pausePlayback();
                setRecommendationIsPlaying(true);
                setRecommendationError(null);
              }}
              onPaused={() => setRecommendationIsPlaying(false)}
              onEnded={() => {
                advanceRecommendationRef.current(activeRecommendationData.id);
              }}
              onError={(message) => {
                setRecommendationIsPlaying(false);
                setRecommendationError(message);
              }}
            />
          ) : getVimeoEmbedUrl(recommendationVideoUrl) ? (
            <iframe
              key={activeRecommendationData.id}
              src={getVimeoEmbedUrl(recommendationVideoUrl)!}
              title={activeRecommendationData.title}
              className={styles.youtubeEmbed}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : recommendationPlaybackUrl ? (
            <video
              key={`${activeRecommendationData.id}:${recommendationRetry}`}
              ref={recommendationVideoRef}
              id="vanmotion-mirror-master"
              src={recommendationPlaybackUrl}
              poster={
                activeRecommendationData.coverUrl ??
                "/brand/vanmotion-mark.webp"
              }
              playsInline
              autoPlay={recommendationIsPlaying}
              disablePictureInPicture
              preload="metadata"
              crossOrigin="anonymous"
              className={styles.youtubeEmbed}
              onCanPlay={(event) => {
                if (
                  recommendationStartingRef.current ||
                  recommendationIsPlaying
                ) {
                  void event.currentTarget
                    .play()
                    .catch(() => {});
                }
              }}
              onPlay={() => {
                recommendationAutoplayRef.current = false;
                pausePlayback();
                setRecommendationIsPlaying(true);
                setRecommendationError(null);
              }}
              onPause={(event) => {
                if (recommendationStartingRef.current) {
                  return;
                }

                if (!event.currentTarget.ended) {
                  setRecommendationIsPlaying(false);
                }
              }}
              onTimeUpdate={(event) => {
                setRecommendationVideoTime(
                  event.currentTarget.currentTime,
                );
              }}
              onError={() => {
                setRecommendationIsPlaying(false);
                setRecommendationError(
                  content.videoUnavailable,
                );
              }}
              onEnded={() => {
                const activeIndex =
                  recommendations.findIndex(
                    (recommendation) =>
                      recommendation.id ===
                      activeRecommendationData.id,
                  );

                const nextRecommendation =
                  recommendations[activeIndex + 1];

                if (nextRecommendation) {
                  selectRecommendation(
                    nextRecommendation.id,
                  );
                  return;
                }

                closeRecommendation();
                selectTrack(0, true);
              }}
            />
          ) : (
            <div
              className={styles.recommendationError}
              role="alert"
            >
              <p>{content.videoUnavailable}</p>
            </div>
          )}

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
        id="vanmotion-recommendation-music-list"
        hidden={activeRecommendationData ? !audioLibraryOpen : !expanded}
        inert={activeRecommendationData ? !audioLibraryOpen : !expanded}
        className={`${styles.expandedContent} ${
          audioLibraryOpen || (expanded && !activeRecommendation)
            ? ""
            : styles.expandedContentHidden
        }`}
      >

          {activeRecommendationData && audioLibraryOpen && (
            <div className={styles.audioLibraryHeader}>
              <button
                type="button"
                className={styles.audioLibraryCollapseButton}
                onClick={() => {
                  setAudioLibraryOpen(false);
                  setExpanded(false);
                }}
                aria-label={
                  language === "es"
                    ? "Plegar selector de música"
                    : "Collapse music selector"
                }
                title={
                  language === "es"
                    ? "Plegar reproductor"
                    : "Minimize player"
                }
              >
                ↙
              </button>
            </div>
          )}

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
                  <span className={styles.minimalTrackTitle}>
                    <strong>{trackTitle}</strong>
                  </span>
                </button>
              );
            })}
          </div>

          {recommendations.length > 0 && (
            <div className={styles.recommendedInPlayer}>

              {recommendations.map((recommendation) => (
                <button
                  key={recommendation.id}
                  type="button"
                  className={styles.spotifyRecommendedTrack}
                  onClick={() => selectRecommendation(recommendation.id)}
                  aria-label={`Reproducir ${recommendation.title}`}
                >
                  <span className={styles.recommendedTrackLabel}>
                    <strong>{recommendation.title}</strong>
                  </span>

                  <span
                    className={styles.youtubePreviewButton}
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        recommendation.coverUrl ??
                        "/brand/vanmotion-mark.webp"
                      }
                      alt=""
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className={styles.youtubePreviewImage}
                    />
                    <span className={styles.youtubePreviewPlay}>
                      ▶
                    </span>
                  </span>
                </button>
              ))}
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
