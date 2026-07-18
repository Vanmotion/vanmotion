"use client";

import { useTransition } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { changeLanguage } from "@/actions/languageActions";
import type { Language } from "@/app/language";

import styles from "./LanguageSwitcher.module.css";

type LanguageSwitcherProps = {
  currentLanguage: Language;
};

export default function LanguageSwitcher({
  currentLanguage,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] =
    useTransition();

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login-admin");

  if (hidden) {
    return null;
  }

  const selectorLabel =
    currentLanguage === "es"
      ? "Seleccionar idioma"
      : "Select language";

  function selectLanguage(
    language: Language,
  ): void {
    if (
      language === currentLanguage ||
      isPending
    ) {
      return;
    }

    startTransition(async () => {
      await changeLanguage(language);
      router.refresh();
    });
  }

  return (
    <div
      className={styles.switcher}
      aria-label={selectorLabel}
      role="group"
      aria-busy={isPending}
    >
      <button
        type="button"
        onClick={() => selectLanguage("es")}
        disabled={isPending}
        className={
          currentLanguage === "es"
            ? styles.active
            : ""
        }
        aria-label="Español"
        aria-pressed={currentLanguage === "es"}
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
          currentLanguage === "en"
            ? styles.active
            : ""
        }
        aria-label="English"
        aria-pressed={currentLanguage === "en"}
        title="English"
      >
        <span aria-hidden="true">🇬🇧</span>
      </button>
    </div>
  );
}
