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
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <span
      className={className}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={imageUrl ?? undefined}
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