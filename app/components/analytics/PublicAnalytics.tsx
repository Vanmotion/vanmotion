"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";
import { usePathname } from "next/navigation";

function isPrivatePath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login-admin" ||
    pathname.startsWith("/login-admin/")
  );
}

export default function PublicAnalytics() {
  const pathname = usePathname();
  const privateRoute = isPrivatePath(pathname);

  return (
    <>
      <Analytics
        beforeSend={(event: BeforeSendEvent) => {
          const url = new URL(
            event.url,
            window.location.origin,
          );

          if (isPrivatePath(url.pathname)) {
            return null;
          }

          return event;
        }}
      />

      {!privateRoute && (
        <GoogleAnalytics gaId="G-MS0JKQN4EG" />
      )}
    </>
  );
}
