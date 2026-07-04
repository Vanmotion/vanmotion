import es from "./locales/es";
import en from "./locales/en";

export const languages = {
  es,
  en,
};

export type Language = keyof typeof languages;