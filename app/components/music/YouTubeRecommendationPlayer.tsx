"use client";

import { useEffect, useRef } from "react";
import styles from "./GlobalMusicPlayer.module.css";

export type YouTubePlayerHandle = {
  destroy?: () => void;
  playVideo?: () => void;
  pauseVideo?: () => void;
  stopVideo?: () => void;
  mute?: () => void;
  getCurrentTime?: () => number;
  getPlayerState?: () => number;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  getIframe?: () => HTMLIFrameElement;
};

// VANMOTION: una sola fuente sonora; el monitor sigue su posición.
// Los dos iframes son de YouTube: no se puede copiar su imagen al canvas.
type MonitorSync = {
  videoId: string;
  seconds: number;
  playing: boolean;
  sentAt: number;
};

const MONITOR_SYNC_EVENT = "vanmotion:youtube-monitor-sync";

function publishYouTubeSync(player: YouTubePlayerHandle | null, videoId: string) {
  if (!player) return;
  try {
    const seconds = player.getCurrentTime?.();
    const state = player.getPlayerState?.();
    if (typeof seconds !== "number" || !Number.isFinite(seconds) || typeof state !== "number") return;
    window.dispatchEvent(new CustomEvent<MonitorSync>(MONITOR_SYNC_EVENT, {
      detail: { videoId, seconds, playing: state === 1, sentAt: performance.now() },
    }));
  } catch {
    // YouTube puede no estar listo durante un cambio de canción.
  }
}

type YouTubePlayerInstance = YouTubePlayerHandle;
type YouTubeStateChangeEvent = { data: number };
type YouTubeReadyEvent = { target: YouTubePlayerInstance };
type YouTubeErrorEvent = { data: number };
type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (event: YouTubeReadyEvent) => void;
        onStateChange: (event: YouTubeStateChangeEvent) => void;
        onError: (event: YouTubeErrorEvent) => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayerInstance;
};
type YouTubeWindow = Window & typeof globalThis & {
  YT?: YouTubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeIframeApi(): Promise<YouTubeApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube requires a browser."));
  }
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
    let settled = false;
    let created = false;
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    const finish = (api?: YouTubeApi, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script?.removeEventListener("error", fail);
      if (youtubeWindow.onYouTubeIframeAPIReady === ready) {
        youtubeWindow.onYouTubeIframeAPIReady = previousReady;
      }
      if (api) resolve(api);
      else {
        if (created) script?.remove();
        reject(error ?? new Error("YouTube API unavailable."));
      }
    };
    const fail = () => finish(undefined, new Error("YouTube API could not load."));
    const ready = () => {
      try { previousReady?.(); } finally { finish(youtubeWindow.YT); }
    };
    youtubeWindow.onYouTubeIframeAPIReady = ready;
    const timer = setTimeout(fail, 15000);
    if (!script) {
      created = true;
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("error", fail, { once: true });
  }).catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
  });
  return youtubeApiPromise;
}

type YouTubeRecommendationPlayerProps = {
  videoId: string;
  title: string;
  playing: boolean;
  onPlaying: () => void;
  onPaused: () => void;
  onEnded: () => void;
  onError: (message: string) => void;
  onReady?: () => void;
  playerRef?: { current: YouTubePlayerHandle | null };
  muted?: boolean;
  controls?: boolean;
  className?: string;
  syncRole?: "source" | "projection";
};

export default function YouTubeRecommendationPlayer({
  videoId,
  title,
  playing,
  onPlaying,
  onPaused,
  onEnded,
  onError,
  onReady,
  playerRef: externalPlayerRef,
  muted = false,
  controls = true,
  className,
  syncRole,
}: YouTubeRecommendationPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playerReadyRef = useRef(false);
  const lastProjectionSeekRef = useRef(0);
  const playingRef = useRef(playing);
  const callbacksRef = useRef({
    onPlaying,
    onPaused,
    onEnded,
    onError,
    onReady,
  });
  useEffect(() => {
    playingRef.current = playing;
    callbacksRef.current = {
      onPlaying,
      onPaused,
      onEnded,
      onError,
      onReady,
    };
  });

  useEffect(() => {
    let cancelled = false;
    let instance: YouTubePlayerInstance | null = null;
    const host = hostRef.current;
    if (!host) return;

    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      callbacksRef.current.onError("Invalid YouTube video ID.");
      return;
    }

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || !host.isConnected) return;
      const mount = document.createElement("div");
      host.appendChild(mount);
      instance = new api.Player(mount, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: controls ? 1 : 0,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            playerRef.current = event.target;
            playerReadyRef.current = true;
            if (syncRole === "source") publishYouTubeSync(event.target, videoId);
            if (externalPlayerRef) externalPlayerRef.current = event.target;
            if (muted) event.target.mute?.();
            callbacksRef.current.onReady?.();
            if (playingRef.current && syncRole !== "projection") event.target.playVideo?.();
          },
          onStateChange: (event) => {
            if (cancelled) return;
            if (syncRole === "source") publishYouTubeSync(playerRef.current, videoId);
            if (event.data === 1) callbacksRef.current.onPlaying();
            else if (event.data === 2) callbacksRef.current.onPaused();
            else if (event.data === 0) callbacksRef.current.onEnded();
          },
          onError: (event) => {
            if (cancelled) return;
            const unavailable = [100, 101, 150].includes(event.data);
            callbacksRef.current.onError(unavailable
              ? "This video is unavailable or cannot be embedded."
              : "YouTube could not play this video.");
          },
          onAutoplayBlocked: () => {
            if (!cancelled) callbacksRef.current.onError(
              "Press play to allow video playback.",
            );
          },
        },
      });
      playerRef.current = instance;
      if (externalPlayerRef) externalPlayerRef.current = instance;
    }).catch(() => {
      if (!cancelled) callbacksRef.current.onError(
        "YouTube could not load. Check your connection and try again.",
      );
    });

    return () => {
      cancelled = true;
      playerReadyRef.current = false;
      if (externalPlayerRef && externalPlayerRef.current === instance) {
        externalPlayerRef.current = null;
      }
      if (playerRef.current === instance) playerRef.current = null;
      instance?.destroy?.();
      // React owns the host; YouTube owns its children.
      host.replaceChildren();
    };
  }, [videoId, externalPlayerRef, muted, controls, syncRole]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || syncRole === "projection") return;
    if (playing) player.playVideo?.();
    else player.pauseVideo?.();
  }, [playing, syncRole]);

  // Fuente: anuncia estado y tiempo incluso después de saltar dentro del vídeo.
  useEffect(() => {
    if (syncRole !== "source") return;
    const tick = () => {
      if (playerReadyRef.current) publishYouTubeSync(playerRef.current, videoId);
    };
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [syncRole, videoId]);

  // Proyección: siempre silenciada; sigue al flotante y corrige el desfase.
  useEffect(() => {
    if (syncRole !== "projection") return;
    const follow = (event: Event) => {
      const sync = (event as CustomEvent<MonitorSync>).detail;
      if (!sync || sync.videoId !== videoId || !playerReadyRef.current) return;
      if (!Number.isFinite(sync.seconds) || !Number.isFinite(sync.sentAt)) return;
      if (performance.now() - sync.sentAt > 1800) return;
      const player = playerRef.current;
      if (!player) return;
      try {
        const state = player.getPlayerState?.();
        const actual = player.getCurrentTime?.();
        const target = Math.max(0, sync.seconds + (sync.playing
          ? Math.max(0, (performance.now() - sync.sentAt) / 1000)
          : 0));
        // Alinear la proyección ANTES de iniciar su reproducción evita
        // que arranque desde el segundo cero mientras el flotante ya avanza.
        if (typeof actual === "number" && Number.isFinite(actual)) {
          const difference = Math.abs(target - actual);
          const now = performance.now();
          const tolerance = sync.playing ? 0.42 : 0.2;
          const enoughTime = lastProjectionSeekRef.current === 0 ||
            now - lastProjectionSeekRef.current > 1250;

          if (difference > tolerance && (difference > 2.5 || enoughTime)) {
            lastProjectionSeekRef.current = now;
            player.seekTo?.(target, true);
          }
        }

        if (sync.playing) {
          if (state !== 1 && state !== 3) player.playVideo?.();
        } else if (state === 1 || state === 3) {
          player.pauseVideo?.();
        }
      } catch {
        // En Safari/Firefox el iframe puede tardar en admitir comandos.
      }
    };
    window.addEventListener(MONITOR_SYNC_EVENT, follow);
    return () => window.removeEventListener(MONITOR_SYNC_EVENT, follow);
  }, [syncRole, videoId]);

  return (
    <div
      ref={hostRef}
      className={`${styles.youtubeEmbed}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={title}
      data-youtube-video-id={videoId}
    />
  );
}
