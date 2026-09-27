"use client";

import { useEffect } from "react";
import styles from "./ropa.module.css";

export default function CollectionMotion() {
  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(
        `.${styles.collectionCard}`,
      ),
    );

    if (!cards.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const compactViewport = window.matchMedia(
      "(max-width: 760px)",
    ).matches;

    if (reducedMotion || compactViewport) {
      cards.forEach((card) => {
        card.classList.add(styles.collectionCardVisible);
      });
      return;
    }

    cards.forEach((card, index) => {
      card.style.setProperty(
        "--vm-card-index",
        String(index % 4),
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            card.classList.add(styles.collectionCardVisible);
          } else {
            card.classList.remove(styles.collectionCardVisible);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      observer.observe(card);

      const media =
        card.querySelector<HTMLElement>(
          `.${styles.collectionMedia}`,
        );

      if (!media) return;

      const handlePointerMove = (
        event: PointerEvent,
      ) => {
        const rect = media.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) / rect.width - 0.5;

        const y =
          (event.clientY - rect.top) / rect.height - 0.5;

        media.style.setProperty(
          "--vm-x",
          String(x * 2),
        );

        media.style.setProperty(
          "--vm-y",
          String(y * 2),
        );
      };

      const handlePointerLeave = () => {
        media.style.setProperty("--vm-x", "0");
        media.style.setProperty("--vm-y", "0");
      };

      media.addEventListener(
        "pointermove",
        handlePointerMove,
      );

      media.addEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      cleanups.push(() => {
        media.removeEventListener(
          "pointermove",
          handlePointerMove,
        );

        media.removeEventListener(
          "pointerleave",
          handlePointerLeave,
        );
      });
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
