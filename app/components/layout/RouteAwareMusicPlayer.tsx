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
  "/aviso-legal",
  "/privacidad",
  "/cookies",
  "/condiciones-compra",
  "/desistimiento",
];

function matchesPath(
  pathname: string,
  path: string,
) {
  return (
    pathname === path ||
    pathname.startsWith(`${path}/`)
  );
}

export default function RouteAwareMusicPlayer({
  children,
}: RouteAwareMusicPlayerProps) {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATHS.some(
    (path) =>
      matchesPath(pathname, path),
  );

  if (shouldHide) {
    return null;
  }

  return (
    <div data-music-player-mode="compact">
      {children}
    </div>
  );
}
