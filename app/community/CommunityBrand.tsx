"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import styles from "./community.module.css";

/** Wordmark de VANMOTION siempre visible, sin alterar el estado del foro. */
export default function CommunityBrand() {
  const { language } = useLanguage();
  return (
    <Link
      href={language === "en" ? "/en-us" : "/"}
      className={styles.communityBrand}
      aria-label={language === "es" ? "VANMOTION · Ir a la portada" : "VANMOTION · Go to homepage"}
    >
      <span className={styles.communityBrandEmblem} aria-hidden="true">
        <Image
          src="/brand/vanmotion-mark.webp"
          alt=""
          width={320}
          height={111}
          className={styles.communityBrandIcon}
          priority
        />
      </span>
      <span className={styles.communityBrandWordmark}>VANMOTION</span>
    </Link>
  );
}
