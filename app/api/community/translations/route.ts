import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

type Kind = "topic-title" | "topic-body" | "reply-body";
type Entry = { kind: Kind; id: string };
type Part = Entry & { source: string; hash: string };
type Result = Entry & { text: string; sourceLanguage: string | null };

const KINDS: Kind[] = ["topic-title", "topic-body", "reply-body"];
const MAX_ENTRIES = 6;
const MAX_CHARS = 12000;
const MAX_BODY_BYTES = 3000;

// MyMemory es únicamente un piloto: 500 bytes por consulta y cuota anónima limitada.
// Nunca enviamos dos párrafos en una sola petición.
function splitForMyMemory(source: string): string[] {
  const chunks: string[] = [];
  for (const paragraph of source.split(/(\n+)/u)) {
    if (!paragraph) continue;
    if (/^\s+$/u.test(paragraph)) {
      chunks.push(paragraph);
      continue;
    }
    let current = "";
    const tokens = paragraph.match(/\S+\s*|\s+/gu) ?? [paragraph];
    for (const token of tokens) {
      if (Buffer.byteLength(token, "utf8") <= 450) {
        if (current && Buffer.byteLength(current + token, "utf8") > 450) {
          chunks.push(current);
          current = "";
        }
        current += token;
      } else {
        for (const character of token) {
          if (current && Buffer.byteLength(current + character, "utf8") > 450) {
            chunks.push(current);
            current = "";
          }
          current += character;
        }
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

// Limite global y atomico por dia UTC, compartido entre instancias de Vercel.
const DAILY_TRANSLATION_CHARACTER_LIMIT = 4000;

function isEntry(input: unknown): input is Entry {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const item = input as Record<string, unknown>;
  return typeof item.kind === "string" && KINDS.includes(item.kind as Kind) &&
    typeof item.id === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(item.id);
}

function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

// Solo se aceptan IDs de publicaciones públicas que autorizan la traducción.
export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) return NextResponse.json({ error: "Too large" }, { status: 413 });

  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const data = input as Record<string, unknown>;
  if ((data.target !== "es" && data.target !== "en") ||
      !Array.isArray(data.entries) || data.entries.length < 1 || data.entries.length > MAX_ENTRIES ||
      !data.entries.every(isEntry)) {
    return NextResponse.json({ error: "Invalid translation request" }, { status: 400 });
  }
  const target = data.target as "es" | "en";
  const requested = data.entries as Entry[];
  const unique = [...new Map(requested.map((e) => [`${e.kind}:${e.id}`, e])).values()];

  try {
    const topicIds = [...new Set(unique.filter((e) => e.kind !== "reply-body").map((e) => e.id))];
    const replyIds = [...new Set(unique.filter((e) => e.kind === "reply-body").map((e) => e.id))];

    const [topics, replies] = await Promise.all([
      topicIds.length ? prisma.communityTopic.findMany({
        where: { id: { in: topicIds }, status: { not: "HIDDEN" } },
        select: { id: true, title: true, body: true, allowAutoTranslation: true },
      }) : Promise.resolve([]),
      replyIds.length ? prisma.communityReply.findMany({
        where: { id: { in: replyIds }, topic: { is: { status: { not: "HIDDEN" } } } },
        select: { id: true, body: true, allowAutoTranslation: true },
      }) : Promise.resolve([]),
    ]);

    const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
    const repliesById = new Map(replies.map((reply) => [reply.id, reply]));
    const parts: Part[] = [];
    for (const entry of unique) {
      const topic = topicsById.get(entry.id);
      const reply = repliesById.get(entry.id);
      // Nunca traducir publicaciones antiguas ni contenidos sin autorización del autor.
      if (entry.kind === "reply-body" ? !reply?.allowAutoTranslation : !topic?.allowAutoTranslation) continue;
      const source = entry.kind === "topic-title" ? topic?.title :
        entry.kind === "topic-body" ? topic?.body : reply?.body;
      if (source) parts.push({ ...entry, source, hash: hash(source) });
    }
    if (parts.reduce((n, part) => n + part.source.length, 0) > MAX_CHARS) {
      return NextResponse.json({ error: "Translation batch too long" }, { status: 413 });
    }
    if (!parts.length) return NextResponse.json({ translations: [] });

    const cached = await prisma.communityTranslation.findMany({
      where: { OR: parts.map((p) => ({
        resourceType: p.kind, resourceId: p.id, targetLanguage: target,
      })) },
    });
    const cachedByKey = new Map(cached.map((row) => [`${row.resourceType}:${row.resourceId}`, row]));
    const results: Result[] = [];
    const pending: Part[] = [];
    for (const part of parts) {
      const row = cachedByKey.get(`${part.kind}:${part.id}`);
      if (row?.sourceHash === part.hash) {
        results.push({ kind: part.kind, id: part.id, text: row.translatedText,
          sourceLanguage: row.detectedLanguage });
      } else {
        pending.push(part);
      }
    }
    if (!pending.length) return NextResponse.json({ translations: results });

    // Reservamos cuota ANTES de llamar a MyMemory. Si la tabla o la BD fallan,
    // la peticion se detiene: no se gasta cuota sin control.
    const requestedCharacters = pending.reduce((sum, part) => sum + part.source.length, 0);
    if (requestedCharacters > DAILY_TRANSLATION_CHARACTER_LIMIT) {
      return NextResponse.json({ error: "Daily translation limit reached" }, { status: 429 });
    }
    const day = new Date().toISOString().slice(0, 10);
    const reserved = await prisma.$executeRaw`
      INSERT INTO "CommunityTranslationBudget" ("day", "usedCharacters", "updatedAt")
      VALUES (${day}, ${requestedCharacters}, NOW())
      ON CONFLICT ("day") DO UPDATE SET
        "usedCharacters" = "CommunityTranslationBudget"."usedCharacters" + EXCLUDED."usedCharacters",
        "updatedAt" = NOW()
      WHERE "CommunityTranslationBudget"."usedCharacters" + EXCLUDED."usedCharacters" <= ${DAILY_TRANSLATION_CHARACTER_LIMIT}
    `;
    if (reserved !== 1) {
      return NextResponse.json({ error: "Daily translation limit reached" }, { status: 429 });
    }

    // MyMemory: solo mensajes públicos; no se envían nombres, correos ni sesiones.
    // Prototipo sin clave. Si falla, se muestra el texto original.
    const entries: { text: string; detected_source_language: null }[] = [];
    for (const part of pending) {
      const translatedChunks: string[] = [];
      for (const chunk of splitForMyMemory(part.source)) {
        if (!chunk.trim()) {
          translatedChunks.push(chunk);
          continue;
        }
        const leading = chunk.match(/^\s*/u)?.[0] ?? "";
        const trailing = chunk.match(/\s*$/u)?.[0] ?? "";
        const query = new URL("https://api.mymemory.translated.net/get");
        query.searchParams.set("q", chunk.trim());
        query.searchParams.set("langpair", `autodetect|${target}`);
        const response = await fetch(query.toString(), {
          signal: AbortSignal.timeout(12000),
          cache: "no-store",
        });
        if (!response.ok) {
          console.error("COMMUNITY_TRANSLATION_PROVIDER_ERROR", response.status);
          return NextResponse.json({ error: "Translation unavailable" }, { status: 503 });
        }
        const data: unknown = await response.json();
        const parsed = data as {
          responseStatus?: unknown;
          responseData?: { translatedText?: unknown };
        } | null;
        const translated = parsed?.responseData?.translatedText;
        if (Number(parsed?.responseStatus) !== 200 ||
            typeof translated !== "string" ||
            /^MYMEMORY WARNING/i.test(translated)) {
          return NextResponse.json({ error: "Translation unavailable" }, { status: 503 });
        }
        translatedChunks.push(leading + translated + trailing);
      }
      entries.push({ text: translatedChunks.join(""), detected_source_language: null });
    }
    const updates: Promise<unknown>[] = [];
    for (let i = 0; i < pending.length; i++) {
      const part = pending[i];
      const translated = entries[i] as { text?: unknown; detected_source_language?: unknown };
      if (typeof translated?.text !== "string") {
        return NextResponse.json({ error: "Invalid translation response" }, { status: 502 });
      }
      const detected = typeof translated.detected_source_language === "string"
        ? translated.detected_source_language : null;
      // Si el texto ya está en el idioma del lector, no se altera.
      const text = detected?.toLowerCase() === target ? part.source : translated.text;
      results.push({ kind: part.kind, id: part.id, text, sourceLanguage: detected });
      updates.push(prisma.communityTranslation.upsert({
        where: { resourceType_resourceId_targetLanguage: {
          resourceType: part.kind, resourceId: part.id, targetLanguage: target,
        } },
        create: { resourceType: part.kind, resourceId: part.id, targetLanguage: target,
          sourceHash: part.hash, translatedText: text, detectedLanguage: detected },
        update: { sourceHash: part.hash, translatedText: text, detectedLanguage: detected },
      }));
    }
    // Si la cache falla, la traducción se puede seguir mostrando en esta sesión.
    await Promise.allSettled(updates);
    return NextResponse.json({ translations: results }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("COMMUNITY_TRANSLATION_ERROR", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Translation unavailable" }, { status: 503 });
  }
}
