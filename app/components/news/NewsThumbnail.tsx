/* eslint-disable @next/next/no-img-element -- Raw img is intentional here for dynamic/external/preview media. */
"use client";

import { useState } from "react";

type NewsThumbnailProps = {
  imageUrl: string | null;
  className: string;
  lightweightMobile?: boolean;
};

export default function NewsThumbnail({
  imageUrl,
  className,
  lightweightMobile = false,
}: NewsThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return null;
  }

  return (
    <span
      className={className}
      aria-hidden="true"
    >
      {lightweightMobile ? (
        <picture>
          <source
            media="(max-width: 720px)"
            srcSet="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
          />
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setFailed(true)}
          />
        </picture>
      ) : (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}