"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import YouTubeRecommendationPlayer, {
  type YouTubePlayerHandle,
} from "@/app/components/music/YouTubeRecommendationPlayer";
import styles from "./musica.module.css";

const IMAGE_WIDTH = 1672;
const IMAGE_HEIGHT = 941;

const OBJECT_POSITION_X = 0.58;
const OBJECT_POSITION_Y = 0.42;

type Calibration = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  skewX: number;
  skewY: number;
};

const DESKTOP_CALIBRATION: Calibration = {
  x: 27.68,
  y: 48.97,
  width: 9.72,
  height: 12.94,
  rotate: -0.30,
  skewX: 0.35,
  skewY: 0.30,
};

const MOBILE_CALIBRATION: Calibration = {
  x: 27.68,
  y: 48.99,
  width: 9.72,
  height: 11.58,
  rotate: -0.50,
  skewX: -0.45,
  skewY: -0.35,
};

type MonitorGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  calibration: Calibration;
};

export default function HeroMusicMonitor() {
  const {
    currentTrack,
    recommendationVideoId,
    recommendationVideoPlaying,
    recommendationVideoTime,
  } = useMusicPlayer();

  const monitorRef = useRef<HTMLDivElement>(null);
  const mirrorPlayerRef =
    useRef<YouTubePlayerHandle | null>(null);

  const [geometry, setGeometry] =
    useState<MonitorGeometry | null>(null);

  const cover =
    currentTrack?.coverUrl ?? "/brand/vanmotion-mark.webp";

  useEffect(() => {
    if (!recommendationVideoId) {
      return;
    }

    const player = mirrorPlayerRef.current;
    const mirrorTime = player?.getCurrentTime?.();

    if (
      !player ||
      typeof mirrorTime !== "number" ||
      !Number.isFinite(mirrorTime)
    ) {
      return;
    }

    if (
      Math.abs(mirrorTime - recommendationVideoTime) >
      0.25
    ) {
      player.seekTo?.(recommendationVideoTime, true);
    }
  }, [
    recommendationVideoId,
    recommendationVideoTime,
  ]);

  useEffect(() => {
    if (!recommendationVideoId) {
      return;
    }

    const resync = () => {
      mirrorPlayerRef.current?.seekTo?.(
        recommendationVideoTime,
        true,
      );

      if (recommendationVideoPlaying) {
        mirrorPlayerRef.current?.playVideo?.();
      }
    };

    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);

    return () => {
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [
    recommendationVideoId,
    recommendationVideoPlaying,
    recommendationVideoTime,
  ]);

  useLayoutEffect(() => {
    const monitor = monitorRef.current;
    const hero = monitor?.parentElement;

    if (!monitor || !hero) {
      return;
    }

    const updateGeometry = () => {
      const {
        width: containerWidth,
        height: containerHeight,
      } = hero.getBoundingClientRect();

      if (containerWidth <= 0 || containerHeight <= 0) {
        return;
      }

      const calibration =
        containerWidth <= 640
          ? MOBILE_CALIBRATION
          : DESKTOP_CALIBRATION;

      /*
       * Reproduce exactamente object-fit: cover
       * de la fotografía 1672 × 941.
       */
      const scale = Math.max(
        containerWidth / IMAGE_WIDTH,
        containerHeight / IMAGE_HEIGHT,
      );

      const renderedWidth = IMAGE_WIDTH * scale;
      const renderedHeight = IMAGE_HEIGHT * scale;

      /*
       * Reproduce object-position: 58% 42%.
       */
      const imageLeft =
        (containerWidth - renderedWidth) *
        OBJECT_POSITION_X;

      const imageTop =
        (containerHeight - renderedHeight) *
        OBJECT_POSITION_Y;

      setGeometry({
        left:
          imageLeft +
          renderedWidth * (calibration.x / 100),

        top:
          imageTop +
          renderedHeight * (calibration.y / 100),

        width:
          renderedWidth * (calibration.width / 100),

        height:
          renderedHeight * (calibration.height / 100),

        calibration,
      });
    };

    updateGeometry();

    const observer = new ResizeObserver(updateGeometry);
    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, []);

  const geometryStyle: CSSProperties = geometry
    ? {
        left: geometry.left,
        top: geometry.top,
        width: geometry.width,
        height: geometry.height,
        transform: `
          rotate(${geometry.calibration.rotate}deg)
          skewX(${geometry.calibration.skewX}deg)
          skewY(${geometry.calibration.skewY}deg)
        `,
        transformOrigin: "50% 50%",
      }
    : {
        visibility: "hidden",
      };

  return (
    <div
      ref={monitorRef}
      className={styles.heroMonitorScreen}
      style={geometryStyle}
      aria-hidden="true"
    >
      {recommendationVideoId ? (
        <YouTubeRecommendationPlayer
          key={recommendationVideoId}
          videoId={recommendationVideoId}
          title="Vídeo recomendado sincronizado"
          playing={recommendationVideoPlaying}
          muted
          controls={false}
          playerRef={mirrorPlayerRef}
          className={styles.heroMonitorVideo}
          onReady={() => {
            mirrorPlayerRef.current?.seekTo?.(
              recommendationVideoTime,
              true,
            );
          }}
          onPlaying={() => {}}
          onPaused={() => {}}
          onEnded={() => {}}
          onError={() => {}}
        />
      ) : (
        <img
          key={cover}
          src={cover}
          alt=""
          className={styles.heroMonitorArtwork}
        />
      )}
    </div>
  );
}
