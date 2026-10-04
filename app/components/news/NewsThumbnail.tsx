"use client";

import Image from "next/image";
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
      <Image
        src={imageUrl}
        alt=""
        width={160}
        height={160}
        sizes="(max-width: 720px) 64px, 80px"
        quality={60}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
