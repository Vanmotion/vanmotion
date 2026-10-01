/* eslint-disable @next/next/no-img-element -- Raw img is intentional here for dynamic/external/preview media. */
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
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
  x: 27.67,
  y: 48.65,
  width: 9.52,
  height: 12.32,
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

type HeroMusicMonitorProps = {
  heroImage: string;
};

export default function HeroMusicMonitor({
  heroImage,
}: HeroMusicMonitorProps) {

  const isAutumnCloudySunset =
    heroImage === "/experience/music/autumn/cloudy/atardecer.webp";
  const {
    currentTrack,
    isPlaying,
    recommendationVideoId,
  } = useMusicPlayer();

  const monitorRef = useRef<HTMLDivElement>(null);
  const mirrorCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [geometry, setGeometry] =
    useState<MonitorGeometry | null>(null);

  const cover =
    currentTrack?.coverUrl ?? "/brand/vanmotion-mark.webp";

  const [mirrorAvailable, setMirrorAvailable] =
    useState(false);

  useEffect(() => {
    if (!recommendationVideoId) {
      setMirrorAvailable(false);
      return;
    }

    let frame = 0;

    const detectMaster = () => {
      const video =
        document.getElementById(
          "vanmotion-mirror-master",
        ) as HTMLVideoElement | null;

      if (video) {
        setMirrorAvailable(true);
        return;
      }

      setMirrorAvailable(false);
      frame = requestAnimationFrame(detectMaster);
    };

    detectMaster();

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [recommendationVideoId]);

  useEffect(() => {
    if (!recommendationVideoId || !mirrorAvailable) {
      return;
    }

    let cancelled = false;
    let frameRequest = 0;

    const draw = () => {
      if (cancelled) {
        return;
      }

      const video =
        document.getElementById(
          "vanmotion-mirror-master",
        ) as HTMLVideoElement | null;

      const canvas = mirrorCanvasRef.current;

      if (
        !video ||
        !canvas ||
        video.readyState < 2 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        frameRequest = requestAnimationFrame(draw);
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;
        canvas.height = height;
      }

      const context = canvas.getContext("2d");

      if (context) {
        try {
          context.drawImage(
            video,
            0,
            0,
            width,
            height,
          );
        } catch {
          // Firefox puede tener el elemento listo antes
          // de disponer del primer frame decodificado.
          // No detenemos el espejo: reintentamos.
        }
      }

      frameRequest = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelled = true;

      if (frameRequest) {
        cancelAnimationFrame(frameRequest);
      }
    };
  }, [
    recommendationVideoId,
    mirrorAvailable,
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

      const isMobile = containerWidth <= 640;

      const calibration =
        isMobile
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

      const autumnMobileInset =
        isMobile && isAutumnCloudySunset
          ? {
              offsetX: 1.6,
              offsetY: 1.0,
              widthScale: 0.92,
              heightScale: 0.92,
            }
          : {
              offsetX: 0,
              offsetY: 0,
              widthScale: 1,
              heightScale: 1,
            };

      const baseLeft =
        imageLeft +
        renderedWidth * (calibration.x / 100);

      const baseTop =
        imageTop +
        renderedHeight * (calibration.y / 100);

      const baseWidth =
        renderedWidth * (calibration.width / 100);

      const baseHeight =
        renderedHeight * (calibration.height / 100);

      setGeometry({
        left: baseLeft + autumnMobileInset.offsetX,
        top: baseTop + autumnMobileInset.offsetY,
        width: baseWidth * autumnMobileInset.widthScale,
        height: baseHeight * autumnMobileInset.heightScale,
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
          ${isAutumnCloudySunset ? "translate3d(1px, -3px, 0)" : ""}
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
      {recommendationVideoId && !isPlaying ? (
        mirrorAvailable ? (
          <canvas
            ref={mirrorCanvasRef}
            className={styles.heroMonitorMirror}
          />
        ) : (
          <img
            key={recommendationVideoId}
            src={cover}
            alt=""
            className={styles.heroMonitorArtwork}
          />
        )
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
