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
import YouTubeRecommendationPlayer from "@/app/components/music/YouTubeRecommendationPlayer";
import { getYouTubeVideoId } from "@/app/components/music/YouTubeUrl";

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

type ExactCorners = {
  tl: [number, number];
  tr: [number, number];
  br: [number, number];
  bl: [number, number];
};

const EXACT_CORNER_CALIBRATIONS: Record<string, ExactCorners> = {
  "rain/dia.webp": {
    tl: [27.470362, 48.447593],
    tr: [36.995383, 48.501796],
    br: [37.115233, 59.052072],
    bl: [27.572967, 59.416696],
  },
};

const BASE_CALIBRATION: Calibration = {
  x: 27.5600,
  y: 48.5400,
  width: 9.7000,
  height: 10.9400,
  rotate: -1.04,
  skewX: 1.01,
  skewY: 1.10,
};

/*
 * Cada escena de otoño puede tener su propia calibración.
 * De momento todas parten exactamente de la referencia maestra.
 */
const AUTUMN_CALIBRATIONS: Record<string, Calibration> = {
  "atardecer.webp": { ...BASE_CALIBRATION },
  "dia.webp": { ...BASE_CALIBRATION },
  "manana-dia.webp": { ...BASE_CALIBRATION },
  "manana.webp": {
    x: 27.6600,
    y: 48.6100,
    width: 9.7500,
    height: 10.8000,
    rotate: -0.29,
    skewX: 0.04,
    skewY: 0.92,
  },
  "noche.webp": { ...BASE_CALIBRATION },

  "cloudy/atardecer.webp": { ...BASE_CALIBRATION },
  "cloudy/dia.webp": { ...BASE_CALIBRATION },
  "cloudy/manana-dia.webp": { ...BASE_CALIBRATION },
  "cloudy/manana.webp": { ...BASE_CALIBRATION },
  "cloudy/noche.webp": { ...BASE_CALIBRATION },

  "rain/atardecer.webp": { ...BASE_CALIBRATION },
  "rain/dia.webp": {
    x: 27.3100,
    y: 48.4600,
    width: 9.7400,
    height: 10.7200,
    rotate: -0.58,
    skewX: 0.57,
    skewY: 1.10,
  },
  "rain/manana-dia.webp": { ...BASE_CALIBRATION },
  "rain/manana.webp": { ...BASE_CALIBRATION },
  "rain/noche.webp": { ...BASE_CALIBRATION },

  "snow/dia.webp": {
    x: 27.5900,
    y: 48.9900,
    width: 9.6700,
    height: 10.6500,
    rotate: -1.04,
    skewX: 0.39,
    skewY: 1.10,
  },
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

function getExactSceneCorners(
  heroImage: string,
): ExactCorners | null {
  const marker = "/experience/music/autumn/";
  const index = heroImage.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const key = heroImage.slice(index + marker.length);

  return EXACT_CORNER_CALIBRATIONS[key] ?? null;
}

function solveLinearSystem(
  matrix: number[][],
  values: number[],
): number[] {
  const n = values.length;

  const augmented = matrix.map((row, index) => [
    ...row,
    values[index],
  ]);

  for (let column = 0; column < n; column += 1) {
    let pivot = column;

    for (let row = column + 1; row < n; row += 1) {
      if (
        Math.abs(augmented[row][column]) >
        Math.abs(augmented[pivot][column])
      ) {
        pivot = row;
      }
    }

    if (Math.abs(augmented[pivot][column]) < 1e-12) {
      throw new Error("Invalid monitor perspective");
    }

    [augmented[column], augmented[pivot]] = [
      augmented[pivot],
      augmented[column],
    ];

    const divisor = augmented[column][column];

    for (let j = column; j <= n; j += 1) {
      augmented[column][j] /= divisor;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === column) {
        continue;
      }

      const factor = augmented[row][column];

      for (let j = column; j <= n; j += 1) {
        augmented[row][j] -=
          factor * augmented[column][j];
      }
    }
  }

  return augmented.map((row) => row[n]);
}

function perspectiveMatrix3d(
  width: number,
  height: number,
  quad: [number, number][],
): string {
  const source: [number, number][] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];

  const matrix: number[][] = [];
  const values: number[] = [];

  source.forEach(([x, y], index) => {
    const [targetX, targetY] = quad[index];

    matrix.push([
      x,
      y,
      1,
      0,
      0,
      0,
      -targetX * x,
      -targetX * y,
    ]);

    values.push(targetX);

    matrix.push([
      0,
      0,
      0,
      x,
      y,
      1,
      -targetY * x,
      -targetY * y,
    ]);

    values.push(targetY);
  });

  const [
    h11,
    h12,
    h13,
    h21,
    h22,
    h23,
    h31,
    h32,
  ] = solveLinearSystem(matrix, values);

  return `matrix3d(${[
    h11, h21, 0, h31,
    h12, h22, 0, h32,
    0, 0, 1, 0,
    h13, h23, 0, 1,
  ].join(",")})`;
}

type MonitorGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  calibration: Calibration;
  exactTransform?: string;
};

type HeroMusicMonitorProps = {
  heroImage: string;
  recommendations: Array<{
    id: string;
    videoUrl: string | null;
  }>;
};

function getVimeoId(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "vimeo.com" && host !== "player.vimeo.com") {
      return null;
    }
    return url.pathname.split("/").find(
      (part) => /^\d+$/.test(part)
    ) ?? null;
  } catch {
    return null;
  }
}

export default function HeroMusicMonitor({
  heroImage,
  recommendations,
}: HeroMusicMonitorProps) {
  const {
    currentTrack,
    isPlaying,
    recommendationVideoId,
    recommendationVideoPlaying,
  } = useMusicPlayer();

  const activeRecommendation = recommendations.find(
    (item) => item.id === recommendationVideoId
  );
  const activeVimeoId = getVimeoId(
    activeRecommendation?.videoUrl ?? null
  );
  const activeYouTubeId = getYouTubeVideoId(
    activeRecommendation?.videoUrl ?? null
  );

  const projectedIframeRef = useRef<HTMLIFrameElement>(null);
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
    if (!recommendationVideoId || activeYouTubeId) {
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
  }, [recommendationVideoId, activeYouTubeId]);

  useEffect(() => {
    if (!recommendationVideoId || !mirrorAvailable || activeYouTubeId) {
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
    activeYouTubeId,
  ]);

  // vanmotion-vimeo-projection
  useEffect(() => {
    if (!activeVimeoId) return;

    let disposed = false;
    let frame = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cleanup = () => {};
    let stop = () => {};

    const connect = () => {
      if (disposed) return;

      const sourceFrame = document.querySelector<HTMLIFrameElement>(
        `aside iframe[src^="https://player.vimeo.com/video/${activeVimeoId}"]`
      );
      const targetFrame = projectedIframeRef.current;

      if (!sourceFrame || !targetFrame) {
        frame = requestAnimationFrame(connect);
        return;
      }

      void import("@vimeo/player").then(async ({ default: Player }) => {
        if (disposed) return;

        const source = new Player(sourceFrame);
        const target = new Player(targetFrame);
        let ready = false;
        let busy = false;
        let lastSeek = 0;

        const sync = async (force = false) => {
          if (disposed || !ready || busy) return;
          busy = true;

          try {
            const [
              sourcePaused,
              sourceTime,
              targetTime,
              targetPaused
            ] = await Promise.all([
              source.getPaused(),
              source.getCurrentTime(),
              target.getCurrentTime(),
              target.getPaused()
            ]);

            if (disposed) return;

            if (sourcePaused) {
              if (!targetPaused) await target.pause();
            } else if (targetPaused) {
              await target.play();
            }

            const difference = Math.abs(sourceTime - targetTime);
            const threshold = force ? 0.25 : 0.65;

            if (
              difference > threshold &&
              (force || performance.now() - lastSeek > 1300)
            ) {
              lastSeek = performance.now();

              // Obtenemos el tiempo de nuevo para evitar
              // utilizar una posición anterior a la espera.
              const latestTime = await source.getCurrentTime();

              if (!disposed) {
                await target.setCurrentTime(latestTime);
              }
            }
          } catch {
            // Un retraso de Vimeo no detiene la página.
          } finally {
            busy = false;
          }
        };

        const onPlay = () => {
          void sync(true);
        };

        const onPause = () => {
          void target.pause().catch(() => {});
          void sync(true);
        };

        const onSeek = () => {
          void sync(true);
        };

        try {
          await Promise.all([source.ready(), target.ready()]);
          if (disposed) return;

          await target.setMuted(true);

          await Promise.allSettled([
            source.setAutopause(false),
            target.setAutopause(false)
          ]);

          if (disposed) return;

          ready = true;

          source.on("play", onPlay);
          source.on("playing", onPlay);
          source.on("pause", onPause);
          source.on("ended", onPause);
          source.on("seeked", onSeek);

          cleanup = () => {
            source.off("play", onPlay);
            source.off("playing", onPlay);
            source.off("pause", onPause);
            source.off("ended", onPause);
            source.off("seeked", onSeek);
          };

          stop = () => {
            void target.pause().catch(() => {});
          };

          timer = setInterval(() => {
            void sync(false);
          }, 650);

          void sync(true);
        } catch {
          // Se mantiene intacto el resto del monitor.
        }
      }).catch(() => {});
    };

    connect();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (timer) clearInterval(timer);
      cleanup();
      stop();
    };
  }, [activeVimeoId]);

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

      const exactCorners = getExactSceneCorners(heroImage);

      if (exactCorners) {
        const renderedPoints: [number, number][] = [
          exactCorners.tl,
          exactCorners.tr,
          exactCorners.br,
          exactCorners.bl,
        ].map(([x, y]) => [
          renderedWidth * (x / 100),
          renderedHeight * (y / 100),
        ]);

        const xs = renderedPoints.map(([x]) => x);
        const ys = renderedPoints.map(([, y]) => y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const boxWidth = maxX - minX;
        const boxHeight = maxY - minY;

        const localQuad: [number, number][] =
          renderedPoints.map(([x, y]) => [
            x - minX,
            y - minY,
          ]);

        setGeometry({
          left: imageLeft + minX,
          top: imageTop + minY,
          width: boxWidth,
          height: boxHeight,
          calibration,
          exactTransform: perspectiveMatrix3d(
            boxWidth,
            boxHeight,
            localQuad,
          ),
        });

        return;
      }

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
        transform:
          geometry.exactTransform ??
          `
            rotate(${geometry.calibration.rotate}deg)
            skewX(${geometry.calibration.skewX}deg)
            skewY(${geometry.calibration.skewY}deg)
          `,
        transformOrigin: geometry.exactTransform
          ? "0 0"
          : "50% 50%",
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
      {activeYouTubeId ? (
        <YouTubeRecommendationPlayer
          key={activeYouTubeId}
          videoId={activeYouTubeId}
          title="Proyección musical VANMOTION"
          playing={recommendationVideoPlaying}
          muted
          controls={false}
          className={styles.heroMonitorVideo}
          onPlaying={() => {}}
          onPaused={() => {}}
          onEnded={() => {}}
          onError={() => {}}
        />
      ) : activeVimeoId ? (
        <iframe
          ref={projectedIframeRef}
          title="Proyección musical VANMOTION"
          src={`https://player.vimeo.com/video/${activeVimeoId}?dnt=1&muted=1&autoplay=0&controls=0`}
          allow="autoplay; fullscreen"
          tabIndex={-1}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            pointerEvents: "none",
            background: "#000",
          }}
        />
      ) : recommendationVideoId && !isPlaying ? (
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
