"use client";

import { useEffect } from "react";
import VimeoPlayer from "@vimeo/player";

type ManagedPlayer = {
  player: VimeoPlayer;
  handlePlay: () => void;
};

export default function ExclusiveMediaCoordinator() {
  useEffect(() => {
    const players = new Map<
      HTMLIFrameElement,
      ManagedPlayer
    >();

    const isPlaybackSource = (element: Element) =>
      element.tagName.toLowerCase() === "audio" ||
      Boolean(
        element.closest(
          "aside, [data-vanmotion-recommendation]"
        )
      );

    const pauseOthers = (origin: Element) => {
      // Radio VANMOTION y vídeos MP4.
      document
        .querySelectorAll<HTMLMediaElement>(
          "audio, video"
        )
        .forEach((media) => {
          if (
            media !== origin &&
            isPlaybackSource(media) &&
            !media.paused
          ) {
            media.pause();
          }
        });

      // Vídeos Vimeo de las tarjetas y del
      // reproductor flotante.
      for (const [frame, managed] of players) {
        if (
          frame === origin ||
          !frame.isConnected
        ) {
          continue;
        }

        void managed.player.pause().catch(() => {});
      }
    };

    // Captura también el evento play de audio/video,
    // que normalmente no se propaga.
    const handleNativePlay = (event: Event) => {
      const source = event.target;

      if (
        source instanceof HTMLMediaElement &&
        isPlaybackSource(source)
      ) {
        pauseOthers(source);
      }
    };

    document.addEventListener(
      "play",
      handleNativePlay,
      true
    );

    const discoverPlayers = () => {
      for (const [frame, managed] of players) {
        if (!frame.isConnected) {
          managed.player.off(
            "play",
            managed.handlePlay
          );
          players.delete(frame);
        }
      }

      document
        .querySelectorAll<HTMLIFrameElement>(
          'iframe[src^="https://player.vimeo.com/video/"]'
        )
        .forEach((frame) => {
          // Ignorar el iframe del monitor del estudio:
          // su reproducción es decorativa y está silenciada.
          if (
            players.has(frame) ||
            !isPlaybackSource(frame)
          ) {
            return;
          }

          const player = new VimeoPlayer(frame);

          const handlePlay = () => {
            pauseOthers(frame);
          };

          players.set(frame, {
            player,
            handlePlay,
          });

          player.on("play", handlePlay);
        });
    };

    discoverPlayers();

    // Detectar vídeos flotantes que aparecen después.
    const observer = new MutationObserver(
      discoverPlayers
    );

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();

      document.removeEventListener(
        "play",
        handleNativePlay,
        true
      );

      for (const managed of players.values()) {
        managed.player.off(
          "play",
          managed.handlePlay
        );
      }

      players.clear();
    };
  }, []);

  return null;
}
