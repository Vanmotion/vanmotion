"use server";

import { cookies } from "next/headers";

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGE_COOKIE,
  type Language,
} from "@/app/language";

export async function getSavedLanguage(): Promise<Language> {
  const savedLanguage = (await cookies())
    .get(LANGUAGE_COOKIE)?.value;

  return isLanguage(savedLanguage)
    ? savedLanguage
    : DEFAULT_LANGUAGE;
}

export async function changeLanguage(
  language: Language,
): Promise<void> {
  if (!isLanguage(language)) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: LANGUAGE_COOKIE,
    value: language,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV ===
      "production",
    httpOnly: true,
  });
}
