/* VANMOTION_NEWS_BRAND_SAME_AS_HOME_V2 */
"use client";
/* eslint-disable @next/next/no-img-element -- Marca original, misma imagen y estilos que la portada. */
import Link from "next/link";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import homeStyles from "@/app/home.module.css";

export default function NewsBrand() {
  const { language } = useLanguage();
  const english = language === "en";
  return (
    <Link
      href={english ? "/en-us" : "/"}
      className={homeStyles.brand}
      aria-label={english ? "VANMOTION — Back to homepage" : "VANMOTION — Ir a la portada"}
    >
      <img
        src="/brand/vanmotion-mark.webp"
        className={homeStyles.brandMark}
        alt=""
        width={54}
        height={54}
        loading="eager"
      />
      <span>VANMOTION</span>
    </Link>
  );
}
