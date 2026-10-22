"use client";

import { useTransition } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { changeLanguage } from "@/actions/languageActions";
import type { Language } from "@/app/language";
import { useLanguage } from "./LanguageProvider";

import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { language: currentLanguage, setLanguage } =
    useLanguage();
  const [isPending, startTransition] =
    useTransition();

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login-admin") ||
    pathname.startsWith("/community");
  const isClothingPage =
    pathname.startsWith("/ropa");
  const isSpanishPilotHome =
    pathname === "/";
  const isEnglishPilotHome =
    pathname === "/en-us" ||
    pathname === "/en-us/";
  const isAwardsPage =
    pathname === "/reconocimientos" ||
    pathname === "/en-us/reconocimientos";
  const isEnglishAwardsPage =
    pathname === "/en-us/reconocimientos";
  const isMusicPage =
    pathname === "/musica" ||
    pathname === "/en-us/musica";
  const isEnglishMusicPage =
    pathname === "/en-us/musica";
  const isSpanishCollectionPage =
    pathname === "/coleccion" ||
    pathname.startsWith("/coleccion/");
  const isEnglishCollectionPage =
    pathname === "/en-us/coleccion" ||
    pathname.startsWith("/en-us/coleccion/");
  const isCollectionPage =
    isSpanishCollectionPage ||
    isEnglishCollectionPage;
  const isPilotHome =
    isSpanishPilotHome ||
    isEnglishPilotHome;
  const selectedLanguage =
    isEnglishPilotHome ||
    isEnglishAwardsPage ||
    isEnglishMusicPage ||
    isEnglishCollectionPage
      ? "en"
      : isSpanishPilotHome
        ? "es"
        : currentLanguage;

  const isAwardsHome =
    isPilotHome ||
    pathname.startsWith("/experience");

  if (hidden) {
    return null;
  }

  const selectorLabel =
    selectedLanguage === "es"
      ? "Seleccionar idioma"
      : "Select language";

  function selectLanguage(
    language: Language,
  ): void {
    if (
      language === selectedLanguage ||
      isPending
    ) {
      return;
    }

    startTransition(async () => {
      await changeLanguage(language);
      setLanguage(language);

      if (isPilotHome) {
        router.push(
          language === "es" ? "/" : "/en-us",
          { scroll: false },
        );
        return;
      }

      if (isAwardsPage) {
        router.push(
          language === "es"
            ? "/reconocimientos"
            : "/en-us/reconocimientos",
          { scroll: false },
        );
        return;
      }

      if (isMusicPage) {
        router.push(
          language === "es"
            ? "/musica"
            : "/en-us/musica",
          { scroll: false },
        );
        return;
      }

      if (isCollectionPage) {
        const spanishPath = pathname.replace(
          /^\/en-us(?=\/)/,
          "",
        );
        router.push(
          language === "es"
            ? spanishPath
            : `/en-us${spanishPath}`,
          { scroll: false },
        );
        return;
      }

      router.refresh();
    });
  }

  return (
    <div
      className={`${styles.switcher} ${
        isClothingPage
          ? styles.clothingPage
          : ""
      } ${
        isAwardsHome
          ? styles.awardsHome
          : ""
      }`}
      aria-label={selectorLabel}
      role="group"
      aria-busy={isPending}
    >
      <button
        type="button"
        onClick={() => selectLanguage("es")}
        disabled={isPending}
        className={
          selectedLanguage === "es"
            ? styles.active
            : ""
        }
        aria-label="Español"
        aria-pressed={selectedLanguage === "es"}
        title="Español"
      >
        <span aria-hidden="true">🇪🇸</span>
      </button>

      <span aria-hidden="true">/</span>

      <button
        type="button"
        onClick={() => selectLanguage("en")}
        disabled={isPending}
        className={
          selectedLanguage === "en"
            ? styles.active
            : ""
        }
        aria-label="English"
        aria-pressed={selectedLanguage === "en"}
        title="English"
      >
        <span aria-hidden="true">🇬🇧</span>
      </button>
    </div>
  );
}
