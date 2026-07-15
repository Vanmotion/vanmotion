import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "vanmotion_admin_session";

export function proxy(request: NextRequest) {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  const currentToken = request.cookies.get(
    SESSION_COOKIE_NAME,
  )?.value;

  if (!expectedToken || currentToken !== expectedToken) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login-admin";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
