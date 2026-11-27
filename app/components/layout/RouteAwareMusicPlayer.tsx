"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";

type RouteAwareMusicPlayerProps = { children: ReactNode };

const HIDDEN_PATHS = [
  "/admin", "/login-admin", "/aviso-legal", "/privacidad",
  "/cookies", "/condiciones-compra", "/desistimiento",
  "/reconocimientos", "/en-us/reconocimientos",
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
  const isHome =
    pathname === "/" ||
    pathname === "/en-us" ||
    pathname === "/en-us/" ||
    matchesPath(pathname, "/reconocimientos") ||
    matchesPath(pathname, "/en-us/reconocimientos") ||
    matchesPath(pathname, "/contacto") ||
    [
      "/aviso-legal",
      "/privacidad",
      "/cookies",
      "/condiciones-compra",
      "/desistimiento",
    ].some((path) => matchesPath(pathname, path));
  // COMMUNITY utiliza el mismo modo compacto que Colección; conserva la radio global.
  const isExperience = matchesPath(pathname, "/experience");
  const isCommunity =
    matchesPath(pathname, "/community") ||
    matchesPath(pathname, "/en-us/community");

  // VM VIDEO DOCK V1: only public editorial/product routes; the source stays mounted.
  const publicPath = pathname.replace(/^\/en-us(?=\/|$)/, "") || "/";
  const dockRoute = ["/coleccion", "/ropa", "/musica", "/noticias", "/ford-lab", "/ford-lab-3d", "/community"]
    .some((path) => matchesPath(publicPath, path));

  // V03: transfer scroll position when the mobile content viewport changes.
  const savedScroll = useRef(0);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const viewport = document.querySelector<HTMLElement>("[data-vm-page-viewport]");
    if (!viewport) return;
    const narrow = window.matchMedia("(max-width: 1023px)");
    const isNested = () => getComputedStyle(viewport).overflowY === "auto";
    let wasNested = isNested();
    const onWindowScroll = () => { if (!isNested()) savedScroll.current = window.scrollY; };
    const onViewportScroll = () => { if (isNested()) savedScroll.current = viewport.scrollTop; };
    const transfer = () => {
      const nested = isNested();
      if (nested === wasNested) return;
      wasNested = nested;
      if (nested) viewport.scrollTop = savedScroll.current;
      else window.scrollTo({ top: savedScroll.current, behavior: "instant" });
    };
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      savedScroll.current = 0;
      if (wasNested) viewport.scrollTop = 0;
    } else if (wasNested && viewport.scrollTop === 0 && savedScroll.current > 0) {
      viewport.scrollTop = savedScroll.current;
    }
    if (!wasNested && window.scrollY > 0) savedScroll.current = window.scrollY;
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    viewport.addEventListener("scroll", onViewportScroll, { passive: true });
    narrow.addEventListener("change", transfer);
    const observer = new MutationObserver(transfer);
    const player = document.querySelector("[data-vm-video-dock]");
    if (player) observer.observe(player, { subtree: true, attributes: true, attributeFilter: ["data-vm-video-expanded", "data-music-video-active"] });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onWindowScroll);
      viewport.removeEventListener("scroll", onViewportScroll);
      narrow.removeEventListener("change", transfer);
    };
  }, [pathname]);

  // Never conditionally remove children: doing so destroys the YouTube iframe.
  // A selected video remains available on public pages, including legal pages.
  // Without video, preserve the existing route visibility policy.
  return (
    <div
      hidden={shouldHide && !videoSessionActive && !isHome}
      aria-hidden={isHome ? true : undefined}
      style={
        isHome
          ? {
              opacity: 0,
              pointerEvents: "none",
            }
          : undefined
      }
      data-music-player-mode={isExperience ? "experience" : "compact"}
      data-vanmotion-community-player={isCommunity ? "true" : "false"}
      data-vm-video-dock={dockRoute ? (isCommunity ? "community" : "standard") : undefined}
      data-music-video-active={videoSessionActive ? "true" : "false"}
    >
      {children}
    </div>
  );
}
