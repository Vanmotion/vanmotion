"use client";

import { useEffect, useRef } from "react";
import VimeoPlayer from "@vimeo/player";
import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";

type YouTubePlayer = {
  pauseVideo: () => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
};

type YouTubeAPI = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events: {
        onStateChange: (event: { data: number }) => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

type YouTubeWindow = Window & {
  YT?: YouTubeAPI;
  onYouTubeIframeAPIReady?: () => void;
};

type VimeoTimeUpdate = {
  seconds: number;
};

type VimeoHandlers = {
  play: () => void;
  pause: () => void;
  ended: () => void;
  timeupdate: (data: VimeoTimeUpdate) => void;
};

export default function ExclusiveMediaCoordinator() {
  const activeSourceRef = useRef<Element | null>(null);
  const { setRecommendationVideoState, setRecommendationVideoTime } =
    useMusicPlayer();

  useEffect(() => {
    const vimeoPlayers = new Map<
      HTMLIFrameElement,
      { player: VimeoPlayer; handlers: VimeoHandlers }
    >();

    const youtubePlayers = new Map<
      HTMLIFrameElement,
      YouTubePlayer
    >();
    const pendingYoutubeFrames = new WeakSet<HTMLIFrameElement>();

    const ytWindow = window as YouTubeWindow;
    let disposed = false;

    const getRecommendationId = (element: Element) =>
      element.closest<HTMLElement>("[data-vanmotion-recommendation]")
        ?.dataset.recommendationId ??
      element.closest<HTMLElement>("aside")?.dataset.activeRecommendationId ??
      null;

    const publishYouTubeSync = (
      player: YouTubePlayer,
      videoId: string,
    ) => {
      try {
        const seconds = player.getCurrentTime();
        const state = player.getPlayerState();
        if (!Number.isFinite(seconds) || !Number.isFinite(state)) return;

        window.dispatchEvent(
          new CustomEvent("vanmotion:youtube-monitor-sync", {
            detail: {
              videoId,
              seconds,
              playing: state === ytWindow.YT?.PlayerState.PLAYING,
              sentAt: performance.now(),
            },
          }),
        );
      } catch {
        // YouTube can be temporarily unavailable while its iframe initializes.
      }
    };

    const isPlaybackSource = (element: Element) =>
      element.tagName.toLowerCase() === "audio" ||
      Boolean(
        element.closest(
          "aside, [data-vanmotion-recommendation]"
        )
      );

    const pauseOthers = (origin: Element) => {
      document
        .querySelectorAll<HTMLMediaElement>("audio, video")
        .forEach((media) => {
          if (
            media !== origin &&
            isPlaybackSource(media) &&
            !media.paused
          ) {
            media.pause();
          }
        });

      for (const [frame, managed] of vimeoPlayers) {
        if (frame !== origin && frame.isConnected) {
          void managed.player.pause().catch(() => {});
        }
      }

      for (const [frame, player] of youtubePlayers) {
        if (frame !== origin && frame.isConnected) {
          try {
            player.pauseVideo();
          } catch {
            // Reproductor todavía no preparado.
          }
        }
      }
    };

    const handleNativePlay = (event: Event) => {
      const source = event.target;
      if (
        source instanceof HTMLMediaElement &&
        isPlaybackSource(source)
      ) {
        const recommendationId = getRecommendationId(source);
        if (source instanceof HTMLVideoElement && recommendationId) {
          activeSourceRef.current = source;
          pauseOthers(source);
          if (!source.closest("aside")) {
            window.dispatchEvent(
              new CustomEvent("vanmotion:embedded-video-play", {
                detail: { recommendationId },
              }),
            );
          }
          setRecommendationVideoState(recommendationId, true);
          setRecommendationVideoTime(source.currentTime);
        } else {
          activeSourceRef.current = null;
          setRecommendationVideoState(null, false);
          pauseOthers(source);
        }
      }
    };

    const handleNativeVideoState = (event: Event) => {
      const source = event.target;
      if (
        !(source instanceof HTMLVideoElement) ||
        activeSourceRef.current !== source
      ) {
        return;
      }

      const recommendationId = getRecommendationId(source);
      if (!recommendationId) return;

      setRecommendationVideoTime(source.currentTime);
      setRecommendationVideoState(
        recommendationId,
        !source.paused && !source.ended,
      );
    };

    document.addEventListener("play", handleNativePlay, true);
    document.addEventListener("timeupdate", handleNativeVideoState, true);
    document.addEventListener("seeking", handleNativeVideoState, true);
    document.addEventListener("pause", handleNativeVideoState, true);
    document.addEventListener("ended", handleNativeVideoState, true);

    const handleFloatingVideoPlay = () => {
      activeSourceRef.current = null;
      pauseOthers(document.body);
    };
    window.addEventListener("vanmotion:floating-video-play", handleFloatingVideoPlay);

    const handleVimeoPlay = (frame: HTMLIFrameElement) => {
      const recommendationId = getRecommendationId(frame);
      activeSourceRef.current = frame;
      pauseOthers(frame);

      if (recommendationId) {
        setRecommendationVideoState(recommendationId, true);
        if (frame.closest("aside")) {
          window.dispatchEvent(
            new CustomEvent("vanmotion:floating-media-state", {
              detail: { playing: true },
            }),
          );
        } else {
          window.dispatchEvent(
            new CustomEvent("vanmotion:embedded-video-play", {
              detail: { recommendationId },
            }),
          );
        }
      }
    };

    const handleVimeoPause = (frame: HTMLIFrameElement) => {
      if (activeSourceRef.current !== frame) return;

      const recommendationId = getRecommendationId(frame);
      if (recommendationId) {
        setRecommendationVideoState(recommendationId, false);
        if (frame.closest("aside")) {
          window.dispatchEvent(
            new CustomEvent("vanmotion:floating-media-state", {
              detail: { playing: false },
            }),
          );
        }
      }
    };

    const handleVimeoTime = (
      frame: HTMLIFrameElement,
      data: VimeoTimeUpdate,
    ) => {
      if (activeSourceRef.current !== frame || !Number.isFinite(data.seconds)) {
        return;
      }

      const recommendationId = getRecommendationId(frame);
      if (recommendationId) setRecommendationVideoTime(data.seconds);
    };

    const handleYouTubeState = (
      frame: HTMLIFrameElement,
      player: YouTubePlayer,
      videoId: string,
      state: number,
    ) => {
      const yt = ytWindow.YT;
      if (!yt) return;
      const recommendationId = getRecommendationId(frame);

      if (state === yt.PlayerState.PLAYING && recommendationId) {
        activeSourceRef.current = frame;
        pauseOthers(frame);
        window.dispatchEvent(
          new CustomEvent("vanmotion:embedded-video-play", {
            detail: { recommendationId },
          }),
        );
        setRecommendationVideoState(recommendationId, true);
      } else if (
        (state === yt.PlayerState.PAUSED ||
          state === yt.PlayerState.ENDED) &&
        activeSourceRef.current === frame &&
        recommendationId
      ) {
        setRecommendationVideoState(recommendationId, false);
      }

      publishYouTubeSync(player, videoId);
    };

    const discoverPlayers = () => {
      if (disposed) return;

      for (const [frame, managed] of vimeoPlayers) {
        if (!frame.isConnected) {
          managed.player.off("play", managed.handlers.play);
          managed.player.off("pause", managed.handlers.pause);
          managed.player.off("ended", managed.handlers.ended);
          managed.player.off("timeupdate", managed.handlers.timeupdate);
          vimeoPlayers.delete(frame);
        }
      }

      document
        .querySelectorAll<HTMLIFrameElement>(
          'iframe[src^="https://player.vimeo.com/video/"]'
        )
        .forEach((frame) => {
          if (
            vimeoPlayers.has(frame) ||
            !isPlaybackSource(frame)
          ) return;

          const player = new VimeoPlayer(frame);
          const handlers: VimeoHandlers = {
            play: () => handleVimeoPlay(frame),
            pause: () => handleVimeoPause(frame),
            ended: () => {
              handleVimeoPause(frame);
              void player
                .getCurrentTime()
                .then((seconds) => {
                  handleVimeoTime(frame, { seconds });
                })
                .catch(() => {});
            },
            timeupdate: (data) => handleVimeoTime(frame, data),
          };

          vimeoPlayers.set(frame, { player, handlers });
          player.on("play", handlers.play);
          player.on("pause", handlers.pause);
          player.on("ended", handlers.ended);
          player.on("timeupdate", handlers.timeupdate);
        });

      const yt = ytWindow.YT;
      document
        .querySelectorAll<HTMLIFrameElement>(
          'iframe[src*="youtube-nocookie.com/embed/"][src*="enablejsapi=1"]'
        )
        .forEach((frame) => {
          if (frame.closest("aside") || !isPlaybackSource(frame)) return;

          const url = new URL(frame.src);
          if (url.searchParams.get("origin") !== window.location.origin) {
            url.searchParams.set("origin", window.location.origin);
            pendingYoutubeFrames.add(frame);
            frame.addEventListener(
              "load",
              () => {
                pendingYoutubeFrames.delete(frame);
                discoverPlayers();
              },
              { once: true },
            );
            frame.src = url.toString();
          }
        });

      if (!yt?.Player || !yt.PlayerState) return;

      for (const [frame, player] of youtubePlayers) {
        if (!frame.isConnected) {
          youtubePlayers.delete(frame);
          try {
            player.destroy();
          } catch {
            // The iframe has already been removed.
          }
        }
      }

      document
        .querySelectorAll<HTMLIFrameElement>(
          'iframe[src*="youtube-nocookie.com/embed/"][src*="enablejsapi=1"]'
        )
        .forEach((frame) => {
          if (
            youtubePlayers.has(frame) ||
            pendingYoutubeFrames.has(frame) ||
            !isPlaybackSource(frame) ||
            Boolean(frame.closest("aside"))
          ) return;

          try {
            const player = new yt.Player(frame, {
              events: {
                onStateChange: (event) => {
                  const videoId = new URL(frame.src).pathname
                    .split("/")
                    .filter(Boolean)
                    .pop();
                  if (videoId) {
                    handleYouTubeState(frame, player, videoId, event.data);
                  }
                },
              },
            });

            youtubePlayers.set(frame, player);
          } catch {
            // Continuar con los demás reproductores.
          }
        });
    };

    const observer = new MutationObserver(discoverPlayers);
    const youtubeDiscoveryTimer = window.setInterval(() => {
      discoverPlayers();
      if (ytWindow.YT?.Player) {
        window.clearInterval(youtubeDiscoveryTimer);
      }
    }, 500);

    const youtubeSyncTimer = window.setInterval(() => {
      const frame = activeSourceRef.current;
      if (!(frame instanceof HTMLIFrameElement)) return;

      const player = youtubePlayers.get(frame);
      const videoId = new URL(frame.src).pathname
        .split("/")
        .filter(Boolean)
        .pop();
      const recommendationId = getRecommendationId(frame);

      if (!player || !videoId || !recommendationId) return;

      try {
        const seconds = player.getCurrentTime();
        const playing =
          player.getPlayerState() === ytWindow.YT?.PlayerState.PLAYING;
        if (Number.isFinite(seconds)) {
          setRecommendationVideoTime(seconds);
          setRecommendationVideoState(recommendationId, playing);
          publishYouTubeSync(player, videoId);
        }
      } catch {
        // YouTube can be temporarily unavailable between state changes.
      }
    }, 250);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    const previousReady = ytWindow.onYouTubeIframeAPIReady;

    const handleYouTubeReady = () => {
      previousReady?.();
      discoverPlayers();
    };

    ytWindow.onYouTubeIframeAPIReady = handleYouTubeReady;

    if (!ytWindow.YT?.Player) {
      if (!document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }

    discoverPlayers();

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(youtubeDiscoveryTimer);
      window.clearInterval(youtubeSyncTimer);
      window.removeEventListener("vanmotion:floating-video-play", handleFloatingVideoPlay);

      document.removeEventListener(
        "play",
        handleNativePlay,
        true
      );
      document.removeEventListener("timeupdate", handleNativeVideoState, true);
      document.removeEventListener("seeking", handleNativeVideoState, true);
      document.removeEventListener("pause", handleNativeVideoState, true);
      document.removeEventListener("ended", handleNativeVideoState, true);

      if (
        ytWindow.onYouTubeIframeAPIReady ===
        handleYouTubeReady
      ) {
        ytWindow.onYouTubeIframeAPIReady = previousReady;
      }

      for (const managed of vimeoPlayers.values()) {
        managed.player.off("play", managed.handlers.play);
        managed.player.off("pause", managed.handlers.pause);
        managed.player.off("ended", managed.handlers.ended);
        managed.player.off("timeupdate", managed.handlers.timeupdate);
      }

      for (const player of youtubePlayers.values()) {
        try {
          player.destroy();
        } catch {
          // Limpieza segura.
        }
      }

      vimeoPlayers.clear();
      youtubePlayers.clear();
    };
  }, [setRecommendationVideoState, setRecommendationVideoTime]);

  return null;
}
