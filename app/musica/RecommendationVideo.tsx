"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import styles from "./musica.module.css";

type RecommendationVideoProps = {
  src: string;
  poster?: string;
  title: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getMediaDuration(video: HTMLVideoElement) {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    return video.duration;
  }

  if (video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);

    if (Number.isFinite(end) && end > 0) {
      return end;
    }
  }

  return 0;
}

export default function RecommendationVideo({
  src,
  poster,
  title,
}: RecommendationVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const rawId = useId();
  const mediaId = `vm-recommendation-${rawId}`;

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) {
      return;
    }

    const channel =
      new BroadcastChannel("vanmotion-media");

    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (
        event.data?.type === "recommendation-play" &&
        event.data?.id !== mediaId
      ) {
        videoRef.current?.pause();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [mediaId]);

  const pauseOtherMedia = () => {
    const current = videoRef.current;

    document
      .querySelectorAll<HTMLMediaElement>("audio, video")
      .forEach((media) => {
        if (media !== current && !media.paused) {
          media.pause();
        }
      });
  };

  const handlePlay = () => {
    pauseOtherMedia();
    setPlaying(true);

    channelRef.current?.postMessage({
      type: "recommendation-play",
      id: mediaId,
    });
  };

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      pauseOtherMedia();

      try {
        await video.play();
      } catch {
        // El navegador puede bloquear el primer intento.
      }
    } else {
      video.pause();
    }
  };

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setFullscreen(false);
      return;
    }

    try {
      if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen();
        setFullscreen(true);
        return;
      }
    } catch {
      // Si el navegador no admite fullscreen real,
      // usamos el modo pantalla completa CSS.
    }

    setFullscreen((current) => !current);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.recommendVideoPlayer} ${
        fullscreen ? styles.recommendVideoPlayerFullscreen : ""
      }`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        className={styles.recommendVideoMedia}
        onPlay={handlePlay}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;

          setDuration(getMediaDuration(video));
          setVolume(video.volume);
          setMuted(video.muted);
        }}
        onLoadedData={(event) => {
          setDuration(getMediaDuration(event.currentTarget));
        }}
        onCanPlay={(event) => {
          setDuration(getMediaDuration(event.currentTarget));
        }}
        onProgress={(event) => {
          setDuration(getMediaDuration(event.currentTarget));
        }}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;

          setCurrentTime(video.currentTime);

          const nextDuration = getMediaDuration(video);

          if (nextDuration > 0) {
            setDuration(nextDuration);
          }
        }}
        onDurationChange={(event) => {
          const nextDuration = getMediaDuration(event.currentTarget);

          if (nextDuration > 0) {
            setDuration(nextDuration);
          }
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
      />

      <button
        type="button"
        className={styles.recommendFullscreenButton}
        onClick={toggleFullscreen}
        aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {fullscreen ? "✕" : "⛶"}
      </button>

      {!playing && (
        <button
          type="button"
          className={styles.recommendCenterPlay}
          onClick={togglePlayback}
          aria-label={`Reproducir ${title}`}
        >
          ▶
        </button>
      )}

      <div className={styles.recommendVideoControls}>
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? "Pausar" : "Reproducir"}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>

        <span className={styles.recommendVideoTime}>
          {formatTime(currentTime)}
        </span>

        <input
          className={styles.recommendVideoProgress}
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          aria-label="Progreso del vídeo"
          onChange={(event) => {
            const next = Number(event.target.value);
            const video = videoRef.current;

            if (!video || !Number.isFinite(next)) {
              return;
            }

            video.currentTime = next;
            setCurrentTime(next);
          }}
        />

        <span className={styles.recommendVideoTime}>
          {formatTime(duration)}
        </span>

        <button
          type="button"
          onClick={() => {
            const video = videoRef.current;

            if (!video) {
              return;
            }

            video.muted = !video.muted;
          }}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted || volume === 0 ? "🔇" : "🔊"}
        </button>

        <input
          className={styles.recommendVideoVolume}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          aria-label="Volumen"
          onChange={(event) => {
            const next = Number(event.target.value);
            const video = videoRef.current;

            if (!video) {
              return;
            }

            video.volume = next;
            video.muted = next === 0;
          }}
        />
      </div>
    </div>
  );
}
