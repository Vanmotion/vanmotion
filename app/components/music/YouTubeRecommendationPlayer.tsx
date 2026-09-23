"use client";

import { useEffect, useRef } from "react";
import styles from "./GlobalMusicPlayer.module.css";

export type YouTubePlayerHandle = {
  destroy?: () => void;
  playVideo?: () => void;
  pauseVideo?: () => void;
  stopVideo?: () => void;
  mute?: () => void;
  getIframe?: () => HTMLIFrameElement;
};

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
}: YouTubeRecommendationPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playingRef = useRef(playing);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator && document.visibilityState === "visible") {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Some browsers/devices may deny wake lock.
    }
  };

  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      // Ignore release errors.
    } finally {
      wakeLockRef.current = null;
    }
  };
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
            if (externalPlayerRef) externalPlayerRef.current = event.target;
            if (muted) event.target.mute?.();
            callbacksRef.current.onReady?.();
            if (playingRef.current) event.target.playVideo?.();
          },
          onStateChange: (event) => {
            if (cancelled) return;
            if (event.data === 1) {
              void requestWakeLock();
              callbacksRef.current.onPlaying();
            } else if (event.data === 2) {
              void releaseWakeLock();
              callbacksRef.current.onPaused();
            } else if (event.data === 0) {
              void releaseWakeLock();
              callbacksRef.current.onEnded();
            }
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
      if (externalPlayerRef && externalPlayerRef.current === instance) {
        externalPlayerRef.current = null;
      }
      if (playerRef.current === instance) playerRef.current = null;
      void releaseWakeLock();
      instance?.destroy?.();
      // React owns the host; YouTube owns its children.
      host.replaceChildren();
    };
  }, [videoId, externalPlayerRef, muted, controls]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.playVideo?.();
    else player.pauseVideo?.();
  }, [playing]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && playingRef.current) {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
