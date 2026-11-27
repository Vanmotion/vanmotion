import { NextRequest, NextResponse } from "next/server";
import { LANGUAGE_COOKIE, isLanguage } from "@/app/language";

/** Persistir idioma sin Server Action y sin perder scroll de Noticias. */
export async function POST(request: NextRequest) {
  let language: unknown;
  try {
    language = (await request.json()).language;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!isLanguage(language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: LANGUAGE_COOKIE,
    value: language,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return response;
}
