"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [googleAnalyticsReady, setGoogleAnalyticsReady] =
    useState(false);

  useEffect(() => {
    if (privateRoute) {
      return;
    }

    let timer = 0;

    const scheduleAnalytics = () => {
      timer = window.setTimeout(() => {
        setGoogleAnalyticsReady(true);
      }, 8000);
    };

    if (document.readyState === "complete") {
      scheduleAnalytics();
    } else {
      window.addEventListener("load", scheduleAnalytics, {
        once: true,
      });
    }

    return () => {
      window.removeEventListener("load", scheduleAnalytics);

      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [privateRoute]);

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

      {!privateRoute && googleAnalyticsReady && (
        <GoogleAnalytics gaId="G-MS0JKQN4EG" />
      )}
    </>
  );
}
