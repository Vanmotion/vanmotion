"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Permite explorar las cabeceras con el dedo sin desplazar textos ni enlaces.
 * Conserva el encuadre al navegar entre /seccion y /en-us/seccion.
 * Solo restaura una posición si se trata de LA MISMA fotografía.
 */
export default function MobileHeroPan() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const hero = document.querySelector<HTMLElement>(
      "[data-vanmotion-mobile-hero-pan]",
    );
    const image = hero?.querySelector<HTMLImageElement>(
      "[data-vanmotion-mobile-hero-pan-image]",
    );
    if (!hero || !image) return;

    const mobile = window.matchMedia("(max-width: 720px)");
    const section = pathname.replace(/^\/en-us(?=\/|$)/, "");
    const storageKey = `vanmotion:mobile-hero-pan:v2:${section}`;
    const rawSource = image.getAttribute("src") || "";
    const imageSource = (() => {
      try {
        const url = new URL(rawSource, window.location.origin);
        // Next/Image puede cambiar el ancho optimizado entre idiomas;
        // usamos la ruta de la fotografía original para identificarla.
        return url.searchParams.get("url") || url.pathname;
      } catch {
        return rawSource;
      }
    })();

    // Antes del primer pintado, recuperar el desplazamiento de esta sección.
    // Si la estación, el clima o la hora han cambiado la escena, no forzarlo.
    if (mobile.matches) {
      try {
        const savedRaw = window.sessionStorage.getItem(storageKey);
        if (savedRaw) {
          const saved = JSON.parse(savedRaw) as {
            src?: unknown;
            x?: unknown;
            y?: unknown;
            savedAt?: unknown;
          };
          const fresh = typeof saved.savedAt === "number" &&
            Date.now() >= saved.savedAt &&
            Date.now() - saved.savedAt < 10 * 60 * 1000;
          if (
            fresh && saved.src === imageSource &&
            typeof saved.x === "number" &&
            Number.isFinite(saved.x) &&
            saved.x >= 0 && saved.x <= 100 &&
            typeof saved.y === "string" &&
            /^(?:center|top|bottom|\d+(?:\.\d+)?%)$/.test(saved.y)
          ) {
            image.style.objectPosition = `${saved.x}% ${saved.y}`;
            // Mantiene la sincronización ya conseguida con el monitor musical.
            window.dispatchEvent(new Event("vanmotion:hero-image-pan"));
          }
        }
      } catch {
        // El deslizamiento sigue funcionando aunque sessionStorage no exista.
      }
    }

    let startX = 0;
    let startY = 0;
    let originalPositionX = 50;
    let verticalPosition = "center";
    let lastPositionX: number | null = null;
    let moved = false;
    let gesture: "idle" | "pending" | "horizontal" | "vertical" = "idle";

    const start = (event: TouchEvent) => {
      if (!mobile.matches || event.touches.length !== 1) return;
      const target = event.target;
      if (target instanceof Element && target.closest("a, button")) return;

      const position = window.getComputedStyle(image).objectPosition
        .trim().split(/\s+/);
      const parsed = Number.parseFloat(position[0] ?? "");
      originalPositionX = Number.isFinite(parsed)
        ? Math.max(0, Math.min(100, parsed))
        : 50;
      verticalPosition = position[1] || "center";
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      lastPositionX = null;
      moved = false;
      gesture = "pending";
    };

    const move = (event: TouchEvent) => {
      if (!mobile.matches || gesture === "idle" || gesture === "vertical") return;
      if (event.touches.length !== 1) return;

      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (gesture === "pending") {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
        gesture = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        if (gesture !== "horizontal") return;
      }

      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) return;
      const bounds = hero.getBoundingClientRect();
      const scale = Math.max(bounds.width / width, bounds.height / height);
      const hiddenWidth = width * scale - bounds.width;
      if (hiddenWidth <= 1) return;

      // Un dedo que viaja 100 px desplaza la fotografía 100 px reales.
      const x = Math.max(0, Math.min(100,
        originalPositionX - (dx / hiddenWidth) * 100,
      ));
      image.style.objectPosition = `${x}% ${verticalPosition}`;
      lastPositionX = x;
      moved = true;
      // La proyección del vídeo de Música se mueve simultáneamente.
      window.dispatchEvent(new Event("vanmotion:hero-image-pan"));
      if (event.cancelable) event.preventDefault();
    };

    const end = () => {
      if (mobile.matches && gesture === "horizontal" && moved &&
        lastPositionX !== null) {
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify({
            src: imageSource,
            x: lastPositionX,
            y: verticalPosition,
            savedAt: Date.now(),
          }));
        } catch {
          // Las cookies, el idioma y el reproductor son independientes.
        }
      }
      gesture = "idle";
      moved = false;
    };

    hero.addEventListener("touchstart", start, { passive: true });
    hero.addEventListener("touchmove", move, { passive: false });
    hero.addEventListener("touchend", end, { passive: true });
    hero.addEventListener("touchcancel", end, { passive: true });

    return () => {
      hero.removeEventListener("touchstart", start);
      hero.removeEventListener("touchmove", move);
      hero.removeEventListener("touchend", end);
      hero.removeEventListener("touchcancel", end);
    };
  }, [pathname]);

  return null;
}
