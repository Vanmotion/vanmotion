"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";

type RouteAwareMusicPlayerProps = { children: ReactNode };

const HIDDEN_PATHS = [
  "/admin", "/login-admin", "/aviso-legal", "/privacidad",
  "/cookies", "/condiciones-compra", "/desistimiento",
  "/reconocimientos",
];

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function RouteAwareMusicPlayer({
  children,
}: RouteAwareMusicPlayerProps) {
  const pathname = usePathname();
  const { videoSessionActive } = useMusicPlayer();
  const shouldHide = HIDDEN_PATHS.some((path) => matchesPath(pathname, path));
  const isExperience = matchesPath(pathname, "/experience");

  // Never conditionally remove children: doing so destroys the YouTube iframe.
  // A selected video remains available on public pages, including legal pages.
  // Without video, preserve the existing route visibility policy.
  return (
    <div
      hidden={shouldHide && !videoSessionActive}
      data-music-player-mode={isExperience ? "experience" : "compact"}
      data-music-video-active={videoSessionActive ? "true" : "false"}
    >
      {children}
    </div>
  );
}
