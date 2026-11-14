"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import styles from "./musica.module.css";
import autumnMonitorCalibration from "./autumn-monitor-calibration.json";
import autumnRainDayCalibration from "./autumn-monitor-calibration-rain-dia.json";
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
    tl: [27.370362, 48.327593],
    tr: [37.175383, 48.401796],
    br: [37.255233, 58.832072],
    bl: [27.492967, 59.796696],
  },
};

const WINTER_EXACT_CORNER_CALIBRATIONS: Record<string, ExactCorners> = {
  "manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "cloudy/manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "rain/manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "snow/manana.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "cloudy/manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "rain/manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
  "snow/manana-dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "cloudy/dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "rain/dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "snow/dia.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "cloudy/atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "rain/atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "snow/atardecer.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "cloudy/noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "rain/noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },

  "snow/noche.webp": {
    tl: [27.5966, 48.4122],
    tr: [38.1630, 48.5648],
    br: [38.8213, 59.7806],
    bl: [28.0152, 60.3194],
  },
};

const BASE_CALIBRATION: Calibration = {
  x: 27.5600,
  y: 48.5400,
  width: 9.7000,
  height: 10.9400,
  rotate: -1.04,
  skewX: 1.01,
  skewY: 0.88,
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
    x: 27.4400,
    y: 48.4300,
    width: 10.3700,
    height: 11.3600,
    rotate: -0.29,
    skewX: 0.04,
    skewY: 0.70,
  },
  "noche.webp": { ...BASE_CALIBRATION },

  "cloudy/atardecer.webp": { ...BASE_CALIBRATION },
  "cloudy/dia.webp": { ...BASE_CALIBRATION },
  "cloudy/manana-dia.webp": { ...BASE_CALIBRATION },
  "cloudy/manana.webp": { ...BASE_CALIBRATION },
  "cloudy/noche.webp": { ...BASE_CALIBRATION },

  "rain/atardecer.webp": { ...BASE_CALIBRATION },
  "rain/dia.webp": {
    x: 27.0900,
    y: 48.2800,
    width: 10.3600,
    height: 11.2800,
    rotate: -0.58,
    skewX: 0.57,
    skewY: 0.88,
  },
  "rain/manana-dia.webp": { ...BASE_CALIBRATION },
  "rain/manana.webp": { ...BASE_CALIBRATION },
  "rain/noche.webp": { ...BASE_CALIBRATION },

  "snow/dia.webp": {
    x: 27.3700,
    y: 48.8100,
    width: 10.2900,
    height: 11.2100,
    rotate: -1.04,
    skewX: 0.39,
    skewY: 0.88,
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
    // VANMOTION_CALIBRADOR_LLUVIA_DIA_V1: esta escena usa su propia calibración.
    if (match.key === "rain/dia.webp" && autumnRainDayCalibration.active) {
      return autumnRainDayCalibration.corners as unknown as ExactCorners;
    }

    // VANMOTION_CALIBRADOR_4_ESQUINAS: si se guarda una calibración,
    // se utiliza para TODAS las fotografías de Música de otoño.
    if (autumnMonitorCalibration.active) {
      return autumnMonitorCalibration.corners as unknown as ExactCorners;
    }
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


type VimeoMirrorFrameProps = {
  videoId: string;
  playing: boolean;
  startTime: number;
  ready: boolean;
  iframeRef: RefObject<HTMLIFrameElement | null>;
};

// Conserva el punto inicial durante la vida del iframe.
// Así cambiar el estado de reproducción no recarga el vídeo.
function VimeoMirrorFrame({
  videoId,
  playing,
  startTime,
  iframeRef,
}: VimeoMirrorFrameProps) {
  const [resume] = useState(() => ({
    playing,
    seconds: Number.isFinite(startTime)
      ? Math.floor(Math.max(0, startTime))
      : 0,
  }));

  return (
    <iframe
      ref={iframeRef}
      title="Proyección musical VANMOTION"
      src={`https://player.vimeo.com/video/${videoId}?dnt=1&muted=1&autoplay=1&controls=0&autopause=0&playsinline=1#t=${resume.seconds}s`}
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
        opacity: 1,
      }}
    />
  );
}

export default function HeroMusicMonitor({
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
  const recommendationVideoTimestampRef = useRef(0);
  const monitorRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const [heroImage, setHeroImage] = useState("");
  const [heroAnchorVersion, setHeroAnchorVersion] = useState(0);
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

  // Keep one projected media player alive in RootLayout. A Next.js route
  // change no longer destroys its iframe. The DOM anchor only supplies the
  // current photo's geometry; the iframe itself is NEVER moved or recreated.
  useEffect(() => {
    const detectAnchor = () => {
      const anchor = document.querySelector<HTMLElement>(
        "[data-vanmotion-music-monitor-anchor]",
      );
      const nextImage = anchor?.dataset.vanmotionMusicMonitorAnchor ?? "";
      setHeroImage((old) => old === nextImage ? old : nextImage);
      if (anchor !== anchorRef.current) {
        anchorRef.current = anchor;
        setHeroAnchorVersion((version) => version + 1);
        setProjectionReadyFor(null);
        if (anchor) {
          // Safari may have suspended an offscreen muted iframe. Each player
          // must realign to the still-running audio source before uncovering.
          window.dispatchEvent(
            new Event("vanmotion:music-projection-return"),
          );
        }
      }
    };
    const observer = new MutationObserver(detectAnchor);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-vanmotion-music-monitor-anchor"],
    });
    detectAnchor();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    recommendationVideoPlayingRef.current = recommendationVideoPlaying;
    recommendationVideoTimeRef.current = recommendationVideoTime;
    recommendationVideoTimestampRef.current = performance.now();
  }, [recommendationVideoPlaying, recommendationVideoTime]);

  // vanmotion-vimeo-projection
  useEffect(() => {
    if (!activeVimeoId || !recommendationVideoId) return;

    let disposed = false;
    let timer: number | null = null;
    let busy = false;
    let lastSeek = 0;
    let seeking = false;
    let starting = false;
    let rateSupported = true;
    let ratePending = false;
    let currentRate = 1;
    let targetReady = false;
    // Never reveal a fresh Vimeo mirror until it follows the source clock.
    // This applies after changing language, route and in every browser.
    let initialAligned = false;

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

        // The floating player keeps playing while the Music page unmounts.
        // On return the projected iframe starts at t=0. Vimeo can reject a
        // seek before its video is playable: a failed seek MUST NOT suppress
        // the play command or leave the monitor permanently hidden.
        if (!sourcePaused && targetPaused && !starting) {
          starting = true;
          void targetPlayer
            .play()
            .then(() => {
              if (
                !disposed &&
                target === targetPlayer &&
                initialAligned
              ) {
                setProjectionReadyFor(recommendationVideoId);
              }
            })
            .catch(() => {
              // Keep retrying: browser policies can delay Vimeo startup.
            })
            .finally(() => {
              starting = false;
            });
        } else if (sourcePaused && !targetPaused) {
          void targetPlayer.pause().catch(() => {});
        }

        // Safari: alinear antes de mostrar la proyección.
        if (!initialAligned) {
          if (!Number.isFinite(targetTime)) return;

          if (!sourcePaused && targetPaused) return;

          const initialDrift = sourceTime - targetTime;

          if (Math.abs(initialDrift) > 0.45) {
            if (
              !seeking &&
              (lastSeek === 0 ||
                performance.now() - lastSeek > 700)
            ) {
              seeking = true;
              lastSeek = performance.now();

              void targetPlayer
                .setCurrentTime(
                  Math.max(
                    0,
                    sourceTime + (!sourcePaused ? 0.12 : 0)
                  )
                )
                .catch(() => {})
                .finally(() => {
                  seeking = false;
                });
            }
            return;
          }

          initialAligned = true;
          setProjectionReadyFor(recommendationVideoId);
        }

        const drift = sourceTime - targetTime;

        // Corregir diferencias moderadas sin saltar fotogramas.
        const smoothCorrection =
          !sourcePaused &&
          !targetPaused &&
          !seeking &&
          Math.abs(drift) > 0.18 &&
          Math.abs(drift) < 0.9;

        const desiredRate = smoothCorrection
          ? drift > 0 ? 1.08 : 0.92
          : 1;

        if (
          rateSupported &&
          !ratePending &&
          Math.abs(currentRate - desiredRate) > 0.01
        ) {
          ratePending = true;

          void targetPlayer.setPlaybackRate(desiredRate)
            .then((actualRate) => {
              if (disposed || target !== targetPlayer) return;

              if (Math.abs(actualRate - desiredRate) > 0.03) {
                rateSupported = false;
              } else {
                currentRate = actualRate;
              }
            })
            .catch(() => {
              // Algunos vídeos de Vimeo no permiten cambiar velocidad.
              rateSupported = false;
              if (currentRate !== 1) {
                void targetPlayer.setPlaybackRate(1).catch(() => {});
              }
            })
            .finally(() => {
              ratePending = false;
            });
        }

        const tolerance = sourcePaused
          ? 0.15
          : rateSupported ? 0.9 : 0.45;
        if (
          !seeking &&
          (sourcePaused || !targetPaused) &&
          Math.abs(drift) > tolerance &&
          (force || Math.abs(drift) > 2 || performance.now() - lastSeek > 1200)
        ) {
          seeking = true;
          lastSeek = performance.now();
          void targetPlayer
            .setCurrentTime(Math.max(0, sourceTime))
            .then(() => {
              if (!disposed && source === sourcePlayer && target === targetPlayer) {
                setProjectionReadyFor(recommendationVideoId);
              }
            })
            .catch(() => {
              // Retry the seek after playback becomes available.
            })
            .finally(() => {
              seeking = false;
            });
        }

        if (!disposed && source === sourcePlayer && target === targetPlayer && !targetPaused) {
          setProjectionReadyFor(recommendationVideoId);
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
          // Autopause is best-effort: an SDK rejection must not prevent
          // reconnecting this source after returning to the Music page.
          await player.setAutopause(false).catch(() => {});
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
    const handleProjectionReturn = () => {
      initialAligned = false;
      setProjectionReadyFor(null);
      connect();
      void sync(true);
    };
    window.addEventListener(
      "vanmotion:music-projection-return",
      handleProjectionReturn,
    );

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
          // The monitor must continue initializing even if an optional
          // Vimeo configuration command fails during route remount.
          await Promise.allSettled([
            target.setAutopause(false),
            target.setMuted(true),
          ]);
          if (disposed) return;

          targetReady = true;
          onTargetPlaying = () => {
            if (initialAligned) {
              setProjectionReadyFor(recommendationVideoId);
            }
          };
          onTargetSeeked = () => {
            if (initialAligned) {
              setProjectionReadyFor(recommendationVideoId);
            }
          };
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
      window.removeEventListener(
        "vanmotion:music-projection-return",
        handleProjectionReturn,
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

    let lastHardSeek = 0;

    const sync = () => {
      const playing = recommendationVideoPlayingRef.current;

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        const elapsed = playing
          ? Math.min(
              0.5,
              Math.max(
                0,
                (performance.now() -
                  recommendationVideoTimestampRef.current) / 1000
              )
            )
          : 0;

        const targetTime =
          recommendationVideoTimeRef.current + elapsed;

        const drift = targetTime - video.currentTime;
        const difference = Math.abs(drift);
        const now = performance.now();

        if (
          (!playing && difference > 0.12) ||
          (playing &&
            difference > 0.8 &&
            (lastHardSeek === 0 || now - lastHardSeek > 1300))
        ) {
          try {
            video.playbackRate = 1;
            video.currentTime = Math.max(0, targetTime);
            lastHardSeek = now;
          } catch {
            // Esperar a que el navegador permita el seek.
          }
        } else if (playing && difference > 0.14 && difference <= 0.8) {
          video.playbackRate = drift > 0 ? 1.08 : 0.92;
        } else {
          video.playbackRate = 1;
        }
      }

      if (playing) {
        if (video.paused) {
          void video.play().catch(() => {});
        }
      } else {
        video.playbackRate = 1;
        if (!video.paused) video.pause();
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

  useEffect(() => {
    const resume = () => {
      directVideoSyncRef.current?.();
      const video = projectedVideoRef.current;
      if (
        video &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        Math.abs(video.currentTime - recommendationVideoTimeRef.current) < 0.5
      ) {
        setProjectionReadyFor(activeRecommendation?.id ?? null);
      }
    };
    window.addEventListener("vanmotion:music-projection-return", resume);
    return () => window.removeEventListener(
      "vanmotion:music-projection-return", resume,
    );
  }, [activeRecommendation?.id]);

  useLayoutEffect(() => {
    const hero = anchorRef.current;

    if (!hero) {
      setGeometry(null);
      return;
    }

    const updateGeometry = () => {
      if (!hero.isConnected) {
        setGeometry(null);
        return;
      }
      const rect = hero.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      // Document coordinates are stable while scrolling. CSS paints the
      // persistent projection with the photo without JS scroll updates.
      const documentLeft = rect.left + window.scrollX;
      const documentTop = rect.top + window.scrollY;

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
          left: documentLeft + imageLeft + minX,
          top: documentTop + imageTop + minY,
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
        left: documentLeft + baseLeft,
        top: documentTop + baseTop,
        width: baseWidth,
        height: baseHeight,
        calibration,
      });
    };

    updateGeometry();

    const observer = new ResizeObserver(updateGeometry);
    observer.observe(hero);
    window.addEventListener("resize", updateGeometry);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateGeometry);
    };
  }, [heroImage, heroAnchorVersion]);

  const geometryStyle: CSSProperties = geometry
    ? {
        position: "absolute",
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
        position: "absolute",
        visibility: "hidden",
      };

  return (
    <div
      className={styles.page}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        minHeight: 0,
        zIndex: 5,
        overflow: "visible",
        background: "transparent",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
    <div
      ref={monitorRef}
      data-autumn-calibrated={
        heroImage.startsWith("/experience/music/autumn/") &&
        autumnMonitorCalibration.active ? "true" : undefined
      }
      data-autumn-monitor={heroImage.startsWith("/experience/music/autumn/") ? "true" : undefined}
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
            key={`${recommendationVideoId}:${activeYouTubeId}`}
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
          <VimeoMirrorFrame
            key={`${recommendationVideoId}:${activeVimeoId}`}
            videoId={activeVimeoId}
            playing={recommendationVideoPlaying}
            startTime={recommendationVideoTime}
            ready={projectionReadyFor === recommendationVideoId}
            iframeRef={projectedIframeRef}
          />
          {projectionReadyFor !== recommendationVideoId && (
            <Image
              key={`vimeo-poster-${recommendationVideoId}`}
              src={cover}
              alt=""
              fill
              sizes="(max-width: 700px) 42vw, 22vw"
              quality={75}
              className={styles.heroMonitorArtwork}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          )}
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
    </div>
  );
}
