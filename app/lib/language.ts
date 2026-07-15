import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGE_COOKIE,
  type Language,
} from "@/app/language";

export async function getCurrentLanguage(): Promise<Language> {
  const cookieStore = await cookies();

  const savedLanguage =
    cookieStore.get(LANGUAGE_COOKIE)?.value;

  if (isLanguage(savedLanguage)) {
    return savedLanguage;
  }

  return DEFAULT_LANGUAGE;
}