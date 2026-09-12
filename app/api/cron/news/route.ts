import { NextResponse } from "next/server";

import { ingestNews } from "@/app/lib/news";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await ingestNews()) });
  } catch (error) {
    console.error("VANMOTION_NEWS_CRON_ERROR", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ ok: false, error: "News ingestion failed" }, { status: 500 });
  }
}

export const POST = GET;