"use client";

import { usePathname } from "next/navigation";

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

  return (
    <div
      className={styles.switcher}
      aria-label={selectorLabel}
      role="group"
    >
      <form action={changeLanguage}>
        <input
          type="hidden"
          name="language"
          value="es"
        />

        <input
          type="hidden"
          name="pathname"
          value={pathname}
        />

        <button
          type="submit"
          className={
            currentLanguage === "es"
              ? styles.active
              : ""
          }
          aria-pressed={currentLanguage === "es"}
          title="Español"
        >
          ES
        </button>
      </form>

      <span aria-hidden="true">/</span>

      <form action={changeLanguage}>
        <input
          type="hidden"
          name="language"
          value="en"
        />

        <input
          type="hidden"
          name="pathname"
          value={pathname}
        />

        <button
          type="submit"
          className={
            currentLanguage === "en"
              ? styles.active
              : ""
          }
          aria-pressed={currentLanguage === "en"}
          title="English"
        >
          EN
        </button>
      </form>
    </div>
  );
}