"use client";

import { useEffect } from "react";
import VimeoPlayer from "@vimeo/player";

type YouTubePlayer = {
  pauseVideo: () => void;
  destroy: () => void;
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
  PlayerState: { PLAYING: number };
};

type YouTubeWindow = Window & {
  YT?: YouTubeAPI;
  onYouTubeIframeAPIReady?: () => void;
};

export default function ExclusiveMediaCoordinator() {
  useEffect(() => {
    const vimeoPlayers = new Map<
      HTMLIFrameElement,
      { player: VimeoPlayer; handlePlay: () => void }
    >();

    const youtubePlayers = new Map<
      HTMLIFrameElement,
      YouTubePlayer
    >();

    const ytWindow = window as YouTubeWindow;
    let disposed = false;

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
        pauseOthers(source);
      }
    };

    document.addEventListener("play", handleNativePlay, true);

    const discoverPlayers = () => {
      if (disposed) return;

      for (const [frame, managed] of vimeoPlayers) {
        if (!frame.isConnected) {
          managed.player.off("play", managed.handlePlay);
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
          const handlePlay = () => pauseOthers(frame);

          vimeoPlayers.set(frame, { player, handlePlay });
          player.on("play", handlePlay);
        });

      const yt = ytWindow.YT;
      if (!yt?.Player || !yt.PlayerState) return;

      for (const [frame, player] of youtubePlayers) {
        if (!frame.isConnected) {
          youtubePlayers.delete(frame);
          try {
            player.destroy();
          } catch {
            // El iframe ya no existe.
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
            !isPlaybackSource(frame)
          ) return;

          try {
            const player = new yt.Player(frame, {
              events: {
                onStateChange: (event) => {
                  if (event.data === yt.PlayerState.PLAYING) {
                    pauseOthers(frame);
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

    observer.observe(document.body, {
      childList: true,
      subtree: true,
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

      document.removeEventListener(
        "play",
        handleNativePlay,
        true
      );

      if (
        ytWindow.onYouTubeIframeAPIReady ===
        handleYouTubeReady
      ) {
        ytWindow.onYouTubeIframeAPIReady = previousReady;
      }

      for (const managed of vimeoPlayers.values()) {
        managed.player.off("play", managed.handlePlay);
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
  }, []);

  return null;
}
