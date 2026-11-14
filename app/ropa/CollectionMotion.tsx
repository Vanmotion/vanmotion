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

    if (reducedMotion) {
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

    if (compactViewport) {
      const cardAnimations = new Map<HTMLElement, Animation>();
      const imageAnimations = new Map<HTMLElement, Animation>();

      const resetCard = (card: HTMLElement) => {
        cardAnimations.get(card)?.cancel();
        cardAnimations.delete(card);

        const image =
          card.querySelector<HTMLElement>(
            `.${styles.collectionImage}`,
          );

        if (image) {
          imageAnimations.get(image)?.cancel();
          imageAnimations.delete(image);

          image.style.transform = "scale(1.08)";
          image.style.filter = "brightness(.94)";
        }

        const index = cards.indexOf(card);
        const direction = index % 2 === 0 ? -1 : 1;

        card.style.opacity = "0";
        card.style.transform =
          `translate3d(${direction * 14}px, 60px, 0) scale(.96)`;
      };

      cards.forEach(resetCard);

      const mobileObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const card = entry.target as HTMLElement;

            if (entry.isIntersecting) {
              if (card.dataset.vmAnimated === "1") {
                return;
              }

              card.dataset.vmAnimated = "1";

              const index = cards.indexOf(card);
              const direction = index % 2 === 0 ? -1 : 1;
              const delay = (index % 2) * 130;

              cardAnimations.get(card)?.cancel();

              const cardAnimation = card.animate(
                [
                  {
                    opacity: 0,
                    transform:
                      `translate3d(${direction * 14}px, 60px, 0) scale(.96)`,
                  },
                  {
                    opacity: 1,
                    transform:
                      "translate3d(0, 0, 0) scale(1)",
                  },
                ],
                {
                  duration: 900,
                  delay,
                  easing: "cubic-bezier(.16,.76,.2,1)",
                  fill: "forwards",
                },
              );

              cardAnimations.set(card, cardAnimation);

              const image =
                card.querySelector<HTMLElement>(
                  `.${styles.collectionImage}`,
                );

              if (image) {
                imageAnimations.get(image)?.cancel();

                const imageAnimation = image.animate(
                  [
                    {
                      transform: "scale(1.08)",
                      filter: "brightness(.94)",
                    },
                    {
                      transform: "scale(1)",
                      filter: "brightness(1)",
                    },
                  ],
                  {
                    duration: 1100,
                    delay,
                    easing: "cubic-bezier(.16,.76,.2,1)",
                    fill: "forwards",
                  },
                );

                imageAnimations.set(
                  image,
                  imageAnimation,
                );
              }

              mobileObserver.unobserve(card);
            }
          });
        },
        {
          threshold: [0, 0.08, 0.22],
          rootMargin: "0px 0px -6% 0px",
        },
      );

      cards.forEach((card) => {
        mobileObserver.observe(card);
      });

      return () => {
        mobileObserver.disconnect();

        cardAnimations.forEach((animation) =>
          animation.cancel()
        );

        imageAnimations.forEach((animation) =>
          animation.cancel()
        );

        cards.forEach((card) => {
          card.style.opacity = "";
          card.style.transform = "";

          const image =
            card.querySelector<HTMLElement>(
              `.${styles.collectionImage}`,
            );

          if (image) {
            image.style.transform = "";
            image.style.filter = "";
          }
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            card.classList.add(
              styles.collectionCardVisible,
            );
          } else {
            card.classList.remove(
              styles.collectionCardVisible,
            );
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
