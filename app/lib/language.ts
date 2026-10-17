import "server-only";

import { cookies, headers } from "next/headers";

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGE_COOKIE,
  ROUTE_LANGUAGE_HEADER,
  type Language,
} from "@/app/language";

export async function getCurrentLanguage(): Promise<Language> {
  const routeLanguage = (await headers()).get(
    ROUTE_LANGUAGE_HEADER,
  );

  if (isLanguage(routeLanguage)) {
    return routeLanguage;
  }

  const cookieStore = await cookies();

  const savedLanguage =
    cookieStore.get(LANGUAGE_COOKIE)?.value;

  if (isLanguage(savedLanguage)) {
    return savedLanguage;
  }

  return DEFAULT_LANGUAGE;
}