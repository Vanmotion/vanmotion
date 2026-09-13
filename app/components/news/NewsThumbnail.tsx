"use client";

import { useState } from "react";

type NewsThumbnailProps = {
  imageUrl: string | null;
  fallbackImageUrl?: string;
  className: string;
};

export default function NewsThumbnail({
  imageUrl,
  fallbackImageUrl,
  className,
}: NewsThumbnailProps) {
  const [failed, setFailed] = useState(false);

  const resolvedImageUrl =
    failed || !imageUrl
      ? fallbackImageUrl
      : imageUrl;

  return (
    <span
      className={className}
      aria-hidden="true"
    >
      {resolvedImageUrl ? (
        <img
          src={resolvedImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>VM</span>
      )}
    </span>
  );
}