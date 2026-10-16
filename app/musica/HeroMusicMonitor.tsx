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

const WINTER_EXACT_CORNER_CALIBRATIONS: Record<string, ExactCorners> = {
  "manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "cloudy/manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "rain/manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "snow/manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "cloudy/manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "rain/manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },
  "snow/manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "cloudy/dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "rain/dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "snow/dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "cloudy/atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "rain/atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "snow/atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "cloudy/noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "rain/noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
  },

  "snow/noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.0394],
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

function getMusicSceneMatch(heroImage: string): {
  season: "autumn" | "winter";
  key: string;
} | null {
  const seasons = ["autumn", "winter"] as const;

  for (const season of seasons) {
    const marker = `/experience/music/${season}/`;
    const index = heroImage.indexOf(marker);

    if (index !== -1) {
      return {
        season,
        key: heroImage.slice(index + marker.length),
      };
    }
  }

  return null;
}

function getSceneCalibration(heroImage: string): Calibration {
  const match = getMusicSceneMatch(heroImage);

  if (!match) {
    return BASE_CALIBRATION;
  }

  if (match.season === "autumn") {
    return AUTUMN_CALIBRATIONS[match.key] ?? BASE_CALIBRATION;
  }

  return BASE_CALIBRATION;
}

function getExactSceneCorners(
  heroImage: string,
): ExactCorners | null {
  const match = getMusicSceneMatch(heroImage);

  if (!match) {
    return null;
  }

  if (match.season === "autumn") {
    return EXACT_CORNER_CALIBRATIONS[match.key] ?? null;
  }

  if (match.season === "winter") {
    return WINTER_EXACT_CORNER_CALIBRATIONS[match.key] ?? null;
  }

  return null;
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
    recommendationVideoId,
    recommendationVideoPlaying,
    recommendationVideoTime,
    setRecommendationVideoState,
    setRecommendationVideoTime,
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
  const projectedVideoRef = useRef<HTMLVideoElement>(null);
  const directVideoSyncRef = useRef<(() => void) | null>(null);
  const recommendationVideoPlayingRef = useRef(recommendationVideoPlaying);
  const recommendationVideoTimeRef = useRef(recommendationVideoTime);
  const monitorRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] =
    useState<MonitorGeometry | null>(null);
  const [projectionReadyFor, setProjectionReadyFor] =
    useState<string | null>(null);

  const cover =
    currentTrack?.coverUrl ?? "/brand/vanmotion-mark.webp";

  const activeDirectVideoUrl =
    activeRecommendation?.videoUrl &&
    !activeVimeoId &&
    !activeYouTubeId
      ? activeRecommendation.videoUrl
      : null;

  useEffect(() => {
    recommendationVideoPlayingRef.current = recommendationVideoPlaying;
    recommendationVideoTimeRef.current = recommendationVideoTime;
  }, [recommendationVideoPlaying, recommendationVideoTime]);

  // vanmotion-vimeo-projection
  useEffect(() => {
    if (!activeVimeoId || !recommendationVideoId) return;

    let disposed = false;
    let timer: number | null = null;
    let busy = false;
    let lastSeek = 0;
    let targetReady = false;
    let VimeoPlayerConstructor:
      | typeof import("@vimeo/player").default
      | null = null;
    let source: import("@vimeo/player").default | null = null;
    let target: import("@vimeo/player").default | null = null;
    let sourceFrameRef: HTMLIFrameElement | null = null;
    let connectingFrame: HTMLIFrameElement | null = null;
    let onSourcePlay = () => {};
    let onSourcePause = () => {};
    let onSourceSeek = () => {};
    let onSourceTime = () => {};
    let onTargetPlaying = () => {};
    let onTargetSeeked = () => {};

    const sync = async (force = false) => {
      const sourcePlayer = source;
      const targetPlayer = target;
      if (
        disposed ||
        busy ||
        !targetReady ||
        !sourcePlayer ||
        !targetPlayer ||
        sourceFrameRef !== findSourceFrame()
      ) {
        return;
      }
      busy = true;

      try {
        const [sourcePaused, sourceTime, targetPaused, targetTime] =
          await Promise.all([
            sourcePlayer.getPaused(),
            sourcePlayer.getCurrentTime(),
            targetPlayer.getPaused(),
            targetPlayer.getCurrentTime(),
          ]);
        if (
          disposed ||
          source !== sourcePlayer ||
          !Number.isFinite(sourceTime)
        ) {
          return;
        }

        setRecommendationVideoTime(sourceTime);
        setRecommendationVideoState(recommendationVideoId, !sourcePaused);

        const drift = sourceTime - targetTime;
        const tolerance = sourcePaused ? 0.15 : 0.45;
        if (
          Math.abs(drift) > tolerance &&
          (force || Math.abs(drift) > 1 || performance.now() - lastSeek > 750)
        ) {
          lastSeek = performance.now();
          await targetPlayer.setCurrentTime(Math.max(0, sourceTime));
        }

        if (!sourcePaused && targetPaused) {
          await targetPlayer.play();
        } else if (sourcePaused && !targetPaused) {
          await targetPlayer.pause();
        }
      } catch {
        // Vimeo may reject a command while either iframe is seeking.
      } finally {
        busy = false;
      }
    };

    const findSourceFrame = () => {
      const frames = document.querySelectorAll<HTMLIFrameElement>(
        'iframe[src^="https://player.vimeo.com/video/"]',
      );
      const matchingFrames = Array.from(frames).filter((candidate) => {
        const floatingId =
          candidate.closest<HTMLElement>("aside")?.dataset
            .activeRecommendationId;
        const embeddedId = candidate.closest<HTMLElement>(
          "[data-vanmotion-recommendation]",
        )?.dataset.recommendationId;
        return (
          (floatingId === recommendationVideoId ||
            embeddedId === recommendationVideoId) &&
          candidate.src.includes(`/video/${activeVimeoId}`)
        );
      });
      return (
        matchingFrames.find(
          (candidate) =>
            candidate.closest<HTMLElement>("aside")?.dataset
              .activeRecommendationId === recommendationVideoId,
        ) ??
        matchingFrames.find((candidate) =>
          Boolean(
            candidate.closest<HTMLElement>(
              "[data-vanmotion-recommendation]",
            ),
          ),
        )
      );
    };

    const disconnectSource = () => {
      if (!source) return;
      source.off("play", onSourcePlay);
      source.off("playing", onSourcePlay);
      source.off("pause", onSourcePause);
      source.off("ended", onSourcePause);
      source.off("seeked", onSourceSeek);
      source.off("timeupdate", onSourceTime);
      source = null;
      sourceFrameRef = null;
    };

    const connectSource = (sourceFrame: HTMLIFrameElement) => {
      if (
        disposed ||
        !targetReady ||
        !VimeoPlayerConstructor ||
        sourceFrameRef === sourceFrame ||
        connectingFrame === sourceFrame
      ) {
        return;
      }

      disconnectSource();
      connectingFrame = sourceFrame;
      const Player = VimeoPlayerConstructor;
      const player = new Player(sourceFrame);
      source = player;
      onSourcePlay = () => void sync(true);
      onSourcePause = () => void sync(true);
      onSourceSeek = () => void sync(true);
      onSourceTime = () => void sync(false);

      void player
        .ready()
        .then(async () => {
          await player.setAutopause(false);
          if (disposed || source !== player) return;
          sourceFrameRef = sourceFrame;
          connectingFrame = null;
          player.on("play", onSourcePlay);
          player.on("playing", onSourcePlay);
          player.on("pause", onSourcePause);
          player.on("ended", onSourcePause);
          player.on("seeked", onSourceSeek);
          player.on("timeupdate", onSourceTime);
          await sync(true);
        })
        .catch(() => {
          if (connectingFrame === sourceFrame) connectingFrame = null;
        });
    };

    const connect = () => {
      if (disposed || !targetReady) return;
      const sourceFrame = findSourceFrame();
      if (sourceFrame) connectSource(sourceFrame);
    };

    const handleSourceChange = () => {
      connect();
      void sync(true);
    };

    window.addEventListener(
      "vanmotion:floating-media-state",
      handleSourceChange,
    );
    window.addEventListener(
      "vanmotion:embedded-video-play",
      handleSourceChange,
    );

    void import("@vimeo/player")
      .then(async ({ default: Player }) => {
        if (disposed) return;
        const targetFrame = projectedIframeRef.current;
        if (!targetFrame) return;

        VimeoPlayerConstructor = Player;
        target = new Player(targetFrame);
        try {
          await target.ready();
          await Promise.all([
            target.setAutopause(false),
            target.setMuted(true),
          ]);
          if (disposed) return;

          targetReady = true;
          onTargetPlaying = () => setProjectionReadyFor(recommendationVideoId);
          onTargetSeeked = () => setProjectionReadyFor(recommendationVideoId);
          target.on("playing", onTargetPlaying);
          target.on("seeked", onTargetSeeked);
          connect();
          timer = window.setInterval(() => {
            connect();
            void sync(false);
          }, 250);
        } catch {
          // Keep the rest of the monitor available if Vimeo is unavailable.
        }
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      window.removeEventListener(
        "vanmotion:floating-media-state",
        handleSourceChange,
      );
      window.removeEventListener(
        "vanmotion:embedded-video-play",
        handleSourceChange,
      );
      disconnectSource();
      if (target) {
        target.off("playing", onTargetPlaying);
        target.off("seeked", onTargetSeeked);
        void target.pause().catch(() => {});
      }
    };
  }, [
    activeVimeoId,
    activeRecommendation?.id,
    recommendationVideoId,
    setRecommendationVideoState,
    setRecommendationVideoTime,
  ]);

  useEffect(() => {
    const video = projectedVideoRef.current;
    if (!video || !activeDirectVideoUrl) return;

    video.muted = true;

    const sync = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        const targetTime = recommendationVideoTimeRef.current;
        const playing = recommendationVideoPlayingRef.current;
        const drift = targetTime - video.currentTime;
        const tolerance = playing ? 0.45 : 0.15;
        if (Math.abs(drift) > tolerance) {
          try {
            video.currentTime = Math.max(0, targetTime);
          } catch {
            // The browser may reject a seek until the media is seekable.
          }
        }
      }

      if (recommendationVideoPlayingRef.current) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    directVideoSyncRef.current = sync;
    const markReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setProjectionReadyFor(activeRecommendation?.id ?? null);
      }
    };
    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("canplay", sync);
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("seeked", markReady);
    sync();

    return () => {
      video.removeEventListener("loadedmetadata", sync);
      video.removeEventListener("canplay", sync);
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("seeked", markReady);
      if (directVideoSyncRef.current === sync) {
        directVideoSyncRef.current = null;
      }
      video.pause();
    };
  }, [activeRecommendation?.id, activeDirectVideoUrl]);

  useEffect(() => {
    directVideoSyncRef.current?.();
  }, [recommendationVideoPlaying, recommendationVideoTime]);

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
      data-winter-exact={
        heroImage.startsWith("/experience/music/winter/") &&
        Boolean(geometry?.exactTransform)
          ? "true"
          : undefined
      }
      style={geometryStyle}
      aria-hidden="true"
    >
      {activeYouTubeId ? (
        <>
          {projectionReadyFor !== recommendationVideoId && (
            <Image
              key={`youtube-poster-${recommendationVideoId}`}
              src={cover}
              alt=""
              fill
              sizes="(max-width: 700px) 42vw, 22vw"
              quality={75}
              className={styles.heroMonitorArtwork}
            />
          )}
          <YouTubeRecommendationPlayer
            key={activeYouTubeId}
            videoId={activeYouTubeId}
            title="Proyección musical VANMOTION"
            playing={recommendationVideoPlaying}
            syncRole="projection"
            muted
            controls={false}
            className={styles.heroMonitorVideo}
            onPlaying={() => {
              setProjectionReadyFor(activeRecommendation?.id ?? null);
            }}
            onPaused={() => {}}
            onEnded={() => {}}
            onError={() => {}}
          />
        </>
      ) : activeVimeoId ? (
        <>
          {projectionReadyFor !== recommendationVideoId && (
            <Image
              key={`vimeo-poster-${recommendationVideoId}`}
              src={cover}
              alt=""
              fill
              sizes="(max-width: 700px) 42vw, 22vw"
              quality={75}
              className={styles.heroMonitorArtwork}
            />
          )}
          <iframe
            ref={projectedIframeRef}
            title="Proyección musical VANMOTION"
            src={`https://player.vimeo.com/video/${activeVimeoId}?dnt=1&muted=1&autoplay=0&controls=0&autopause=0`}
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
              opacity: projectionReadyFor === recommendationVideoId ? 1 : 0,
            }}
          />
        </>
      ) : activeDirectVideoUrl ? (
        <video
          key={activeRecommendation?.id}
          ref={projectedVideoRef}
          src={activeDirectVideoUrl}
          poster={cover}
          muted
          playsInline
          preload="auto"
          onPlaying={() => {
            setProjectionReadyFor(activeRecommendation?.id ?? null);
          }}
          className={styles.heroMonitorVideo}
        />
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
