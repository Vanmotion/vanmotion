/* VANMOTION_MOBILE_EDITORIAL_MOTION_V1 — carrusel accesible para Noticias. */
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./noticias.module.css";

type Language = "es" | "en";

type NewsCarouselProps = {
  label: string;
  language: Language;
  count: number;
  children: ReactNode;
};

/**
 * En escritorio conserva la rejilla existente. En móvil se convierte en una
 * pista scroll-snap nativa: arrastrar no abre artículos ni bloquea el scroll vertical.
 */
export default function NewsCarousel({ label, language, count, children }: NewsCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActive = useCallback(() => {
    const viewport = track.current;
    if (!viewport || count < 2) return;
    const cards = Array.from(viewport.querySelectorAll<HTMLElement>(":scope > article"));
    const viewportRect = viewport.getBoundingClientRect();
    const middle = viewportRect.left + viewportRect.width / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const next = Math.abs(rect.left + rect.width / 2 - middle);
      if (next < distance) {
        distance = next;
        nearest = index;
      }
    });
    setActiveIndex((previous) => previous === nearest ? previous : nearest);
  }, [count]);

  useEffect(() => {
    updateActive();
    const viewport = track.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateActive);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [updateActive]);

  function navigateTo(index: number) {
    const viewport = track.current;
    const card = viewport?.querySelectorAll<HTMLElement>(":scope > article")[index];
    if (!viewport || !card) return;
    const viewportRect = viewport.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const destination = viewport.scrollLeft + cardRect.left - viewportRect.left
      - (viewport.clientWidth - cardRect.width) / 2;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollTo({ left: destination, behavior: reducedMotion ? "auto" : "smooth" });
    setActiveIndex(index);
  }

  return (
    <>
      <div
        ref={track}
        className={styles.grid}
        data-active-index={activeIndex}
        aria-label={label}
        onScroll={updateActive}
      >
        {children}
      </div>
      {count > 1 ? (
        <div
          className={styles.mobilePagination}
          role="group"
          aria-label={language === "es" ? `Navegación de noticias: ${label}` : `News navigation: ${label}`}
        >
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              className={index === activeIndex ? styles.mobilePaginationActive : styles.mobilePaginationButton}
              onClick={() => navigateTo(index)}
              aria-label={language === "es"
                ? `Mostrar noticia ${index + 1} de ${count}`
                : `Show story ${index + 1} of ${count}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
