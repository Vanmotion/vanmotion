"use client";

import Image from "next/image";
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

const BASE_CALIBRATION: Calibration = {
  x: 27.3000,
  y: 48.3000,
  width: 9.9500,
  height: 11.1000,
  rotate: 0.08,
  skewX: 0.35,
  skewY: 0,
};

/*
 * Cada escena de otoño puede tener su propia calibración.
 * De momento todas parten exactamente de la referencia maestra.
 */
const AUTUMN_CALIBRATIONS: Record<string, Calibration> = {
  "atardecer.webp": { ...BASE_CALIBRATION },
  "dia.webp": { ...BASE_CALIBRATION },
  "manana-dia.webp": { ...BASE_CALIBRATION },
  "manana.webp": { ...BASE_CALIBRATION },
  "noche.webp": { ...BASE_CALIBRATION },

  "cloudy/atardecer.webp": { ...BASE_CALIBRATION },
  "cloudy/dia.webp": {
    x: 27.3700,
    y: 48.4200,
    width: 9.9500,
    height: 11.1000,
    rotate: 0.08,
    skewX: 0.35,
    skewY: 0,
  },
  "cloudy/manana-dia.webp": { ...BASE_CALIBRATION },
  "cloudy/manana.webp": { ...BASE_CALIBRATION },
  "cloudy/noche.webp": { ...BASE_CALIBRATION },

  "rain/atardecer.webp": { ...BASE_CALIBRATION },
  "rain/dia.webp": { ...BASE_CALIBRATION },
  "rain/manana-dia.webp": { ...BASE_CALIBRATION },
  "rain/manana.webp": { ...BASE_CALIBRATION },
  "rain/noche.webp": { ...BASE_CALIBRATION },

  "snow/dia.webp": { ...BASE_CALIBRATION },
};

function getSceneCalibration(heroImage: string): Calibration {
  const marker = "/experience/music/autumn/";
  const index = heroImage.indexOf(marker);

  if (index === -1) {
    return BASE_CALIBRATION;
  }

  const key = heroImage.slice(index + marker.length);

  return AUTUMN_CALIBRATIONS[key] ?? BASE_CALIBRATION;
}

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
      const resetFrame = window.requestAnimationFrame(() => {
        setMirrorAvailable(false);
      });

      return () => {
        window.cancelAnimationFrame(resetFrame);
      };
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

      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2,
      );

      const targetWidth = Math.max(
        1,
        Math.round(rect.width * pixelRatio),
      );

      const targetHeight = Math.max(
        1,
        Math.round(rect.height * pixelRatio),
      );

      if (
        canvas.width !== targetWidth ||
        canvas.height !== targetHeight
      ) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      const context = canvas.getContext("2d");

      if (context) {
        const sourceWidth = video.videoWidth;
        const sourceHeight = video.videoHeight;

        const sourceRatio =
          sourceWidth / sourceHeight;

        const targetRatio =
          targetWidth / targetHeight;

        let sx = 0;
        let sy = 0;
        let sw = sourceWidth;
        let sh = sourceHeight;

        /*
         * Equivalente a object-fit: cover.
         * Conserva proporciones: nunca estira el vídeo.
         */
        if (sourceRatio > targetRatio) {
          sw = sourceHeight * targetRatio;
          sx = (sourceWidth - sw) / 2;
        } else {
          sh = sourceWidth / targetRatio;
          sy = (sourceHeight - sh) / 2;
        }

        try {
          context.clearRect(
            0,
            0,
            targetWidth,
            targetHeight,
          );

          context.drawImage(
            video,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            targetWidth,
            targetHeight,
          );
        } catch {
          // Firefox puede disponer del elemento antes
          // del primer frame decodificado.
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

      const calibration = getSceneCalibration(heroImage);

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
        left: baseLeft,
        top: baseTop,
        width: baseWidth,
        height: baseHeight,
        calibration,
      });
    };

    updateGeometry();

    const observer = new ResizeObserver(updateGeometry);
    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, [heroImage]);

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
      {recommendationVideoId && !isPlaying ? (
        mirrorAvailable ? (
          <canvas
            ref={mirrorCanvasRef}
            className={styles.heroMonitorMirror}
          />
        ) : (
          <Image
            key={recommendationVideoId}
            src={cover}
            alt=""
            fill
            sizes="(max-width: 700px) 42vw, 22vw"
            quality={75}
            className={styles.heroMonitorArtwork}
          />
        )
      ) : (
        <Image
          key={cover}
          src={cover}
          alt=""
          fill
          sizes="(max-width: 700px) 42vw, 22vw"
          quality={75}
          className={styles.heroMonitorArtwork}
        />
      )}
    </div>
  );
}
