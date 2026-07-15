"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  isLanguage,
  LANGUAGE_COOKIE,
} from "@/app/language";

function safePathname(
  value: FormDataEntryValue | null,
): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }

  return value;
}

export async function changeLanguage(
  formData: FormData,
): Promise<void> {
  const language =
    formData.get("language");

  if (!isLanguage(language)) {
    redirect("/");
  }

  const pathname = safePathname(
    formData.get("pathname"),
  );

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

  redirect(pathname);
}