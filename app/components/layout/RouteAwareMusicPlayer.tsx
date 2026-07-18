"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type RouteAwareMusicPlayerProps = {
  children: ReactNode;
};

const HIDDEN_PATHS = [
  "/admin",
  "/login-admin",
  "/proximamente",
  "/musica",
];

const COMPACT_PATHS = [
  "/ropa",
];

export default function RouteAwareMusicPlayer({
  children,
}: RouteAwareMusicPlayerProps) {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );

  if (shouldHide) {
    return null;
  }

  const shouldUseCompactMode = COMPACT_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );

  return (
    <div
      data-music-player-mode={
        shouldUseCompactMode
          ? "compact"
          : "default"
      }
    >
      {children}
    </div>
  );
}