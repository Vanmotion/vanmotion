"use client";

import { useCallback, useEffect, useState } from "react";

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

export default function VehicleGallery({
  images,
  vehicleName,
  emptyLabel,
  selectImageLabel,
}: VehicleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const safeSelectedIndex =
    selectedIndex < images.length ? selectedIndex : 0;

  const showPrevious = useCallback(() => {
    if (images.length === 0) {
      return;
    }

    setSelectedIndex((currentIndex) =>
      currentIndex === 0
        ? images.length - 1
        : currentIndex - 1,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    if (images.length === 0) {
      return;
    }

    setSelectedIndex((currentIndex) =>
      currentIndex === images.length - 1
        ? 0
        : currentIndex + 1,
    );
  }, [images.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNext, showPrevious]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] text-white/35">
        {emptyLabel}
      </div>
    );
  }

  const selectedImage = images[safeSelectedIndex];

  return (
    <div>
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={selectedImage.id}
          src={selectedImage.url}
          alt={selectedImage.alt ?? vehicleName}
          className="aspect-[16/10] w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Fotografía anterior"
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-xl text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
            >
              ←
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Fotografía siguiente"
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-xl text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
            >
              →
            </button>

            <span className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/70 px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-white/80 backdrop-blur-sm">
              {safeSelectedIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image, index) => {
            const isSelected = index === safeSelectedIndex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`${selectImageLabel} ${index + 1}`}
                aria-pressed={isSelected}
                className={`group relative overflow-hidden rounded-2xl border bg-white/[0.03] text-left transition ${
                  isSelected
                    ? "border-amber-300/70 ring-2 ring-amber-300/20"
                    : "border-white/10 hover:border-white/35"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt ?? `${vehicleName} ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />

                <span className="absolute bottom-2 right-2 rounded-full border border-white/15 bg-black/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/75 backdrop-blur-sm">
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}