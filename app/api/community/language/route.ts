import { NextRequest, NextResponse } from "next/server";
import { LANGUAGE_COOKIE, isLanguage } from "@/app/language";

/** Guarda el idioma sin revalidación de Server Actions ni recarga del foro. */
export async function POST(request: NextRequest) {
  let value: unknown;
  try {
    value = (await request.json()).language;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!isLanguage(value)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: LANGUAGE_COOKIE,
    value,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return response;
}
