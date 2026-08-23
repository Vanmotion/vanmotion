"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import styles from "./vehicle.module.css";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

type VehicleGalleryProps = {
  images: GalleryImage[];
  vehicleName: string;
  emptyLabel: string;
  selectImageLabel: string;
};

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, button, a, [contenteditable='true']",
    ),
  );
}

export default function VehicleGallery({
  images,
  vehicleName,
  emptyLabel,
  selectImageLabel,
}: VehicleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const safeSelectedIndex = selectedIndex < images.length ? selectedIndex : 0;

  const showPrevious = useCallback(() => {
    if (images.length === 0) {
      return;
    }

    setSelectedIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    if (images.length === 0) {
      return;
    }

    setSelectedIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  }, [images.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isInteractiveElement(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNext, showPrevious]);

  if (images.length === 0) {
    return <div className={styles.emptyGallery}>{emptyLabel}</div>;
  }

  const selectedImage = images[safeSelectedIndex];
  const previousIndex =
    safeSelectedIndex === 0 ? images.length - 1 : safeSelectedIndex - 1;
  const nextIndex =
    safeSelectedIndex === images.length - 1 ? 0 : safeSelectedIndex + 1;

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageFrame}>
        <Image
          key={selectedImage.id}
          src={selectedImage.url}
          alt={selectedImage.alt ?? vehicleName}
          fill
          sizes="(max-width: 980px) 100vw, 58vw"
          className={styles.mainImage}
          loading="eager"
          fetchPriority="high"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label={`${selectImageLabel} ${previousIndex + 1}`}
              className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
            >
              ←
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label={`${selectImageLabel} ${nextIndex + 1}`}
              className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
            >
              →
            </button>

            <span className={styles.imageCounter}>
              {String(safeSelectedIndex + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnailGrid}>
          {images.map((image, index) => {
            const isSelected = index === safeSelectedIndex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`${selectImageLabel} ${index + 1}`}
                aria-pressed={isSelected}
                className={`${styles.thumbnailButton} ${
                  isSelected ? styles.thumbnailSelected : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? `${vehicleName} ${index + 1}`}
                  fill
                  sizes="(max-width: 760px) 31vw, 14vw"
                  className={styles.thumbnailImage}
                  loading="lazy"
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
