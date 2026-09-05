"use client";

import { useEffect, useRef } from "react";

import styles from "./GlobalMusicPlayer.module.css";

type YouTubePlayerInstance = {
  destroy?: () => void;
  playVideo?: () => void;
  pauseVideo?: () => void;
};

type YouTubeStateChangeEvent = {
  data: number;
};

type YouTubeReadyEvent = {
  target: YouTubePlayerInstance;
};

type YouTubeApi = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events?: {
        onReady?: (
          event: YouTubeReadyEvent,
        ) => void;
        onStateChange?: (
          event: YouTubeStateChangeEvent,
        ) => void;
      };
    },
  ) => YouTubePlayerInstance;
};

type YouTubeWindow = Window &
  typeof globalThis & {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  };

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const youtubeWindow = window as YouTubeWindow;

  if (youtubeWindow.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady =
      youtubeWindow.onYouTubeIframeAPIReady;

    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
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
};

export default function YouTubeRecommendationPlayer({
  videoId,
  title,
  playing,
  onPlaying,
  onPaused,
  onEnded,
}: YouTubeRecommendationPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef =
    useRef<YouTubePlayerInstance | null>(null);
  const playingRef = useRef(playing);
  const onEndedRef = useRef(onEnded);
  const onPlayingRef = useRef(onPlaying);
  const onPausedRef = useRef(onPaused);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onPlayingRef.current = onPlaying;
    onPausedRef.current = onPaused;
  }, [onEnded, onPaused, onPlaying]);

  useEffect(() => {
    let cancelled = false;

    void loadYouTubeIframeApi().then(() => {
      if (cancelled || !iframeRef.current) {
        return;
      }

      const youtubeWindow = window as YouTubeWindow;
      const api = youtubeWindow.YT;

      if (!api?.Player) {
        return;
      }

      const player = new api.Player(
        iframeRef.current,
        {
          events: {
            onReady: (event) => {
              playerRef.current = event.target;

              if (playingRef.current) {
                event.target.playVideo?.();
              }
            },
            onStateChange: (event) => {
              if (event.data === 1) {
                onPlayingRef.current();
              }

              if (event.data === 2) {
                onPausedRef.current();
              }

              if (event.data === 0) {
                onEndedRef.current();
              }
            },
          },
        },
      );

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (playing) {
      player.playVideo?.();
    } else {
      player.pauseVideo?.();
    }
  }, [playing]);

  return (
    <iframe
      ref={iframeRef}
      className={styles.youtubeEmbed}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&enablejsapi=1&playsinline=1&controls=1&disablekb=0&fs=1&origin=https%3A%2F%2Fwww.vanmotion.es`}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      style={{ pointerEvents: "auto" }}
    />
  );
}
