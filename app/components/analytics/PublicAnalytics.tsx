"use client";

import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";

export default function PublicAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        const url = new URL(
          event.url,
          window.location.origin,
        );

        if (
          url.pathname === "/admin" ||
          url.pathname.startsWith("/admin/")
        ) {
          return null;
        }

        return event;
      }}
    />
  );
}
