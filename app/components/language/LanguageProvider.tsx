"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { getSavedLanguage } from "@/actions/languageActions";
import type { Language } from "@/app/language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  initialLanguage: Language;
  children: ReactNode;
};

export function LanguageProvider({
  initialLanguage,
  children,
}: LanguageProviderProps) {
  const pathname = usePathname();
  const [language, setLanguage] =
    useState<Language>(initialLanguage);
  const syncRequestRef = useRef(0);
  const activeLanguage =
    pathname === "/"
      ? "es"
      : pathname === "/en-us" ||
          pathname.startsWith("/en-us/")
        ? "en"
        : language;

  useEffect(() => {
    document.documentElement.lang =
      activeLanguage === "en" ? "en-US" : "es";
  }, [activeLanguage]);

  useEffect(() => {
    const requestId = ++syncRequestRef.current;

    if (
      pathname === "/" ||
      pathname === "/en-us" ||
      pathname.startsWith("/en-us/")
    ) {
      return;
    }

    void getSavedLanguage()
      .then((savedLanguage) => {
        if (syncRequestRef.current === requestId) {
          setLanguage(savedLanguage);
        }
      })
      .catch((error: unknown) => {
        console.error(
          "VANMOTION_LANGUAGE_SYNC_ERROR:",
          error,
        );
      });
  }, [pathname]);

  return (
    <LanguageContext.Provider
      value={{
        language: activeLanguage,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage debe utilizarse dentro de LanguageProvider.",
    );
  }

  return context;
}
