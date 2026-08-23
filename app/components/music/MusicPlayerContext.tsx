"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { PublicMusicTrack } from "@/app/lib/music-library";

type PlaybackError = "activation" | "missing-audio" | null;

type MusicPlayerContextValue = {
  tracks: PublicMusicTrack[];
  currentTrack: PublicMusicTrack | undefined;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackError: PlaybackError;
  togglePlayback: () => Promise<void>;
  selectTrack: (index: number, autoplay?: boolean) => void;
  playPrevious: () => void;
  playNext: () => void;
  changeProgress: (value: number) => void;
  changeVolume: (value: number) => void;
  clearPlaybackError: () => void;
  setLastTrackEndedHandler: (
    handler: (() => void) | null,
  ) => void;
};

type MusicPlayerProviderProps = {
  tracks: PublicMusicTrack[];
  children: ReactNode;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export default function MusicPlayerProvider({
  tracks,
  children,
}: MusicPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeAfterChangeRef = useRef(false);
  const initializedRef = useRef(false);
  const restoreTimeRef = useRef<number | null>(null);
  const restorePlayingRef = useRef(false);
  const restoreTrackRef = useRef<number | null>(null);
  const restoreVolumeRef = useRef<number | null>(null);
  const lastTrackEndedHandlerRef =
    useRef<(() => void) | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [playbackError, setPlaybackError] =
    useState<PlaybackError>(null);

  const currentTrack = tracks[currentIndex] ?? tracks[0];

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const savedTrack = window.localStorage.getItem(
      "vanmotion-global-track",
    );
    const savedVolume = window.localStorage.getItem(
      "vanmotion-global-volume",
    );

    restoreTrackRef.current = 0;

    const savedTime = window.sessionStorage.getItem(
      "vanmotion-global-time",
    );
    const savedPlaying = window.sessionStorage.getItem(
      "vanmotion-global-playing",
    );

    if (savedTime !== null) {
      const parsedTime = Number(savedTime);

      if (Number.isFinite(parsedTime) && parsedTime >= 0) {
        restoreTimeRef.current = parsedTime;
      }
    }

    restorePlayingRef.current = savedPlaying === "1";

    if (savedTrack !== null) {
      const index = Number(savedTrack);

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < tracks.length
      ) {
        restoreTrackRef.current = index;
      }
    }

    if (savedVolume !== null) {
      const parsedVolume = Number(savedVolume);

      if (
        Number.isFinite(parsedVolume) &&
        parsedVolume >= 0 &&
        parsedVolume <= 1
      ) {
          restoreVolumeRef.current = parsedVolume;
      }
    }
  }, [tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    const shouldResume = resumeAfterChangeRef.current;
    resumeAfterChangeRef.current = false;

    setCurrentTime(0);
    setDuration(0);
    setPlaybackError(null);

    window.localStorage.setItem(
      "vanmotion-global-track",
      String(currentIndex),
    );

    const shouldRestore =
      restoreTimeRef.current !== null &&
      restoreTrackRef.current === currentIndex;

    if (shouldRestore) {
      audio.load();
      return;
    }

    if (!shouldResume) {
      return;
    }

    audio.load();

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
        setPlaybackError("activation");
      });
  }, [currentIndex, currentTrack?.src]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      const restoredVolume = restoreVolumeRef.current;
      audio.volume =
        restoredVolume ?? volume;

      restoreVolumeRef.current = null;
    }

    window.localStorage.setItem(
      "vanmotion-global-volume",
      String(volume),
    );
  }, [volume]);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        setPlaybackError(null);
      } catch {
        setIsPlaying(false);
        setPlaybackError("activation");
      }

      return;
    }

    window.sessionStorage.setItem(
      "vanmotion-global-playing",
      "0",
    );

    audio.pause();
    setIsPlaying(false);
  }

  function selectTrack(
    index: number,
    autoplay = isPlaying,
  ) {
    if (index < 0 || index >= tracks.length) {
      return;
    }

    if (index === currentIndex) {
      if (autoplay && audioRef.current?.paused) {
        void togglePlayback();
      }
      return;
    }

    window.sessionStorage.setItem(
      "vanmotion-global-time",
      "0",
    );

    resumeAfterChangeRef.current = autoplay;
    setCurrentIndex(index);
  }

  function playPrevious() {
    if (tracks.length === 0) {
      return;
    }

    const previousIndex =
      currentIndex === 0
        ? tracks.length - 1
        : currentIndex - 1;

    selectTrack(previousIndex, true);
  }

  function playNext() {
    if (tracks.length === 0) {
      return;
    }

    const nextIndex =
      currentIndex === tracks.length - 1
        ? 0
        : currentIndex + 1;

    selectTrack(nextIndex, true);
  }

  function changeProgress(value: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeVolume(value: number) {
    const normalizedVolume = Math.min(
      1,
      Math.max(0, value),
    );

    setVolume(normalizedVolume);
  }

  const setLastTrackEndedHandler = useCallback(
    (handler: (() => void) | null) => {
      lastTrackEndedHandlerRef.current = handler;
    },
    [],
  );

  function handleAudioEnded() {
    const isLastTrack =
      currentIndex === tracks.length - 1;

    if (
      isLastTrack &&
      lastTrackEndedHandlerRef.current
    ) {
      setIsPlaying(false);
      lastTrackEndedHandlerRef.current();
      return;
    }

    playNext();
  }

  const contextValue: MusicPlayerContextValue = {
    tracks,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackError,
    togglePlayback,
    selectTrack,
    playPrevious,
    playNext,
    changeProgress,
    changeVolume,
    clearPlaybackError: () => {
      setPlaybackError(null);
    },
    setLastTrackEndedHandler,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="none"
        onLoadedMetadata={(event) => {
          const audioDuration = event.currentTarget.duration;

          setDuration(
            Number.isFinite(audioDuration)
              ? audioDuration
              : 0,
          );

          if (
            restoreTimeRef.current !== null &&
            restoreTrackRef.current === currentIndex
          ) {
            const savedTime = restoreTimeRef.current;
            const duration = event.currentTarget.duration;

            const safeTime =
              Number.isFinite(duration) && duration > 0
                ? Math.min(savedTime, duration)
                : savedTime;

            event.currentTarget.currentTime = safeTime;
            setCurrentTime(safeTime);

            const shouldPlay = restorePlayingRef.current;

            restoreTimeRef.current = null;
            restorePlayingRef.current = false;
            restoreTrackRef.current = null;

            if (shouldPlay) {
              void event.currentTarget
                .play()
                .then(() => {
                  setIsPlaying(true);
                  setPlaybackError(null);
                })
                .catch(() => {
                  setIsPlaying(false);
                  setPlaybackError("activation");
                });
            }
          }
        }}
        onTimeUpdate={(event) => {
          const time = event.currentTarget.currentTime;

          setCurrentTime(time);

          window.sessionStorage.setItem(
            "vanmotion-global-time",
            String(time),
          );
        }}
        onPlay={() => {
          window.sessionStorage.setItem(
            "vanmotion-global-playing",
            "1",
          );

          setIsPlaying(true);
          setPlaybackError(null);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={handleAudioEnded}
        onError={() => {
          setIsPlaying(false);
          setPlaybackError("missing-audio");
        }}
      />

      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer(): MusicPlayerContextValue {
  const context = useContext(MusicPlayerContext);

  if (!context) {
    throw new Error(
      "useMusicPlayer debe utilizarse dentro de MusicPlayerProvider.",
    );
  }

  return context;
}
