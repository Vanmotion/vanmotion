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
    (path) => matchesPath(pathname, path),
  );

  return (
    <div
      data-music-player-mode="compact"
      data-music-player-hidden={shouldHide ? "true" : "false"}
      aria-hidden={shouldHide}
      style={
        shouldHide
          ? {
              position: "fixed",
              left: "-10000px",
              top: 0,
              width: "1px",
              height: "1px",
              overflow: "hidden",
              opacity: 0,
              pointerEvents: "none",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
