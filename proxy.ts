import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "vanmotion_admin_session";
const OPENING_DATE = new Date("2026-09-01T00:00:00+02:00");

function hasValidAdminSession(request: NextRequest) {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  const currentToken = request.cookies.get(
    SESSION_COOKIE_NAME,
  )?.value;

  return Boolean(
    expectedToken &&
      currentToken === expectedToken,
  );
}

function isPublicSiteOpen() {
  const manualSetting =
    process.env.PUBLIC_SITE_ENABLED?.trim().toLowerCase();

  if (manualSetting === "true") {
    return true;
  }

  if (manualSetting === "false") {
    return false;
  }

  return Date.now() >= OPENING_DATE.getTime();
}

function isPrelaunchRoute(pathname: string) {
  return (
    pathname === "/proximamente" ||
    pathname.startsWith("/login-admin")
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adminSessionIsValid =
    hasValidAdminSession(request);

  if (
    pathname.startsWith("/admin") &&
    !adminSessionIsValid
  ) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login-admin";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  if (adminSessionIsValid) {
    return NextResponse.next();
  }

  if (
    !isPublicSiteOpen() &&
    !isPrelaunchRoute(pathname)
  ) {
    const comingSoonUrl = request.nextUrl.clone();

    comingSoonUrl.pathname = "/proximamente";
    comingSoonUrl.search = "";

    return NextResponse.redirect(comingSoonUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
