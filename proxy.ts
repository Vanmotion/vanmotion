import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const OPENING_DATE = new Date(
  "2026-09-01T00:00:00+02:00",
);

const PRELAUNCH_PUBLIC_ROUTES = [
  "/proximamente",
  "/login-admin",
  "/aviso-legal",
  "/privacidad",
  "/cookies",
  "/condiciones-compra",
  "/desistimiento",
] as const;

function hasValidAdminSession(
  request: NextRequest,
): boolean {
  /*
   * Normalizamos el token de Vercel para que
   * coincida con el guardado por authActions.ts
   * y con las Server Actions administrativas.
   */
  const expectedToken =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  const currentToken =
    request.cookies.get(
      SESSION_COOKIE_NAME,
    )?.value;

  return Boolean(
    expectedToken &&
      currentToken &&
      currentToken === expectedToken,
  );
}

function isPublicSiteOpen(): boolean {
  const manualSetting =
    process.env.PUBLIC_SITE_ENABLED
      ?.trim()
      .toLowerCase();

  if (manualSetting === "true") {
    return true;
  }

  if (manualSetting === "false") {
    return false;
  }

  return (
    Date.now() >=
    OPENING_DATE.getTime()
  );
}

function matchesRoute(
  pathname: string,
  route: string,
): boolean {
  return (
    pathname === route ||
    pathname.startsWith(
      `${route}/`,
    )
  );
}

function isPrelaunchPublicRoute(
  pathname: string,
): boolean {
  return PRELAUNCH_PUBLIC_ROUTES.some(
    (route) =>
      matchesRoute(
        pathname,
        route,
      ),
  );
}

/*
 * Stripe no utiliza sesión administrativa.
 * El webhook debe llegar directamente a su
 * Route Handler, donde se valida la firma.
 */
function isStripeWebhookRoute(
  pathname: string,
): boolean {
  return matchesRoute(
    pathname,
    "/api/stripe/webhook",
  );
}

export function proxy(
  request: NextRequest,
) {
  const pathname =
    request.nextUrl.pathname;

  /*
   * Esta comprobación debe ejecutarse antes
   * de cualquier redirección administrativa
   * o de preapertura.
   */
  if (
    isStripeWebhookRoute(pathname)
  ) {
    return NextResponse.next();
  }

  const adminSessionIsValid =
    hasValidAdminSession(request);

  /*
   * Protege todas las rutas administrativas.
   */
  if (
    pathname.startsWith("/admin") &&
    !adminSessionIsValid
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname =
      "/login-admin";

    loginUrl.search = "";

    return NextResponse.redirect(
      loginUrl,
    );
  }

  /*
   * Una sesión administrativa válida puede
   * navegar por toda la web durante el desarrollo.
   */
  if (adminSessionIsValid) {
    return NextResponse.next();
  }

  /*
   * Mientras la web pública esté cerrada,
   * solamente se permiten las rutas indicadas.
   */
  if (
    !isPublicSiteOpen() &&
    !isPrelaunchPublicRoute(
      pathname,
    )
  ) {
    const comingSoonUrl =
      request.nextUrl.clone();

    comingSoonUrl.pathname =
      "/proximamente";

    comingSoonUrl.search = "";

    return NextResponse.redirect(
      comingSoonUrl,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};