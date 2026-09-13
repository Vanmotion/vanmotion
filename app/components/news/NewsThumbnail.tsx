"use client";

import { useState } from "react";

type NewsThumbnailProps = {
  imageUrl: string | null;
  className: string;
};

export default function NewsThumbnail({
  imageUrl,
  className,
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
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}