"use client";

import { useEffect } from "react";

/**
 * Desplaza horizontalmente una fotografía de cabecera con un gesto táctil.
 * No cambia su escala ni arrastra la página, los textos o los enlaces.
 * La foto sigue usando object-fit: cover, mostrando sus extremos al deslizar.
 */
export default function MobileHeroPan() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(
      "[data-vanmotion-mobile-hero-pan]",
    );
    const image = hero?.querySelector<HTMLImageElement>(
      "[data-vanmotion-mobile-hero-pan-image]",
    );
    if (!hero || !image) return;

    const mobile = window.matchMedia("(max-width: 720px)");
    let startX = 0;
    let startY = 0;
    let originalPositionX = 50;
    let verticalPosition = "center";
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
      // Mantener la proyección de vídeo en el monitor de la foto de Música.
      window.dispatchEvent(new Event("vanmotion:hero-image-pan"));
      if (event.cancelable) event.preventDefault();
    };

    const end = () => { gesture = "idle"; };
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
  }, []);
  return null;
}
