import { createHash } from "node:crypto";

import { prisma } from "@/app/lib/prisma";

export const NEWS_LOCALES = ["es", "en"] as const;
export const NEWS_REGIONS = ["ES", "NY"] as const;
export const NEWS_CATEGORIES = [
  "vehicles",
  "music",
  "street",
] as const;

export type NewsLocale = (typeof NEWS_LOCALES)[number];
export type NewsRegion = (typeof NEWS_REGIONS)[number];
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

type Feed = {
  locale: NewsLocale;
  region: NewsRegion;
  category: NewsCategory;
  name: string;
  url: string;
  authority: number;
};

type Candidate = {
  locale: NewsLocale;
  region: NewsRegion;
  category: NewsCategory;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  description: string;
  imageUrl: string | null;
  publishedAt: Date;
  tags: string[];
  sourceAuthority: number;
  categoryAffinity: number;
  vanmotionAffinity: number;
  regionAffinity: number;
  freshness: number;
  culturalImportance: number;
  editorialScore: number;
};

type RejectionReason = "age" | "hard-rejection" | "region-affinity" | "category-affinity" | "vanmotion-affinity" | "editorial-score";

type Evaluation = {
  candidate: Candidate;
  rejectionReason?: RejectionReason;
};

type FeedResult = {
  feed: Feed;
  status: number | "ERROR";
  evaluations: Evaluation[];
};

const feeds: Feed[] = [
  { locale: "es", region: "ES", category: "vehicles", name: "Motor1 España", url: "https://es.motor1.com/rss/", authority: 31 },
  { locale: "es", region: "ES", category: "vehicles", name: "Motor.es", url: "https://www.motor.es/feed/", authority: 31 },
  { locale: "es", region: "ES", category: "vehicles", name: "Top Gear España", url: "https://www.topgear.es/rss", authority: 30 },
  { locale: "es", region: "ES", category: "vehicles", name: "Autobild España", url: "https://www.autobild.es/rss", authority: 29 },
  { locale: "es", region: "ES", category: "music", name: "MondoSonoro", url: "https://www.mondosonoro.com/feed/", authority: 31 },
  { locale: "es", region: "ES", category: "music", name: "JENESAISPOP", url: "https://jenesaispop.com/feed/", authority: 29 },
  { locale: "es", region: "ES", category: "music", name: "Rockdelux", url: "https://www.rockdelux.com/feed", authority: 31 },
  { locale: "es", region: "ES", category: "music", name: "Efe EME", url: "https://www.efeeme.com/feed/", authority: 29 },
  { locale: "es", region: "ES", category: "music", name: "RockZone", url: "https://www.rockzonemag.com/feed/", authority: 28 },
  { locale: "es", region: "ES", category: "street", name: "Neo2", url: "https://www.neo2.com/feed/", authority: 29 },
  { locale: "es", region: "ES", category: "street", name: "Trendencias", url: "https://www.trendencias.com/index.xml", authority: 28 },
  { locale: "en", region: "NY", category: "vehicles", name: "NYC Streetsblog", url: "https://nyc.streetsblog.org/feed/", authority: 29 },
  { locale: "en", region: "NY", category: "vehicles", name: "Road & Track", url: "https://www.roadandtrack.com/rss/all.xml", authority: 31 },
  { locale: "en", region: "NY", category: "vehicles", name: "Car and Driver", url: "https://www.caranddriver.com/rss/all.xml", authority: 31 },
  { locale: "en", region: "NY", category: "vehicles", name: "The Drive", url: "https://www.thedrive.com/feed", authority: 29 },
  { locale: "en", region: "NY", category: "music", name: "The FADER", url: "https://www.thefader.com/feed", authority: 31 },
  { locale: "en", region: "NY", category: "music", name: "Pitchfork", url: "https://pitchfork.com/feed/feed-news/rss", authority: 31 },
  { locale: "en", region: "NY", category: "music", name: "Billboard", url: "https://www.billboard.com/feed/", authority: 30 },
  { locale: "en", region: "NY", category: "music", name: "BrooklynVegan", url: "https://brooklynvegan.com/feed/", authority: 29 },
  { locale: "en", region: "NY", category: "street", name: "Vogue", url: "https://www.vogue.com/feed/rss", authority: 31 },
  { locale: "en", region: "NY", category: "street", name: "GQ", url: "https://www.gq.com/feed/rss", authority: 30 },
  { locale: "en", region: "NY", category: "street", name: "Hypebeast", url: "https://hypebeast.com/feed", authority: 29 },
  { locale: "en", region: "NY", category: "street", name: "Highsnobiety", url: "https://www.highsnobiety.com/feed/", authority: 29 },
];

const categoryAffinityTerms: Record<NewsCategory, string[]> = {
  vehicles: ["car", "cars", "coche", "coches", "vehicle", "vehiculo", "automotive", "automocion", "mobility", "movilidad", "motor", "classic", "clasico", "restomod", "concept", "concepto", "van", "furgoneta", "engineering", "ingenieria", "motorsport", "pedestrian", "transit", "transportation", "motorsport"],
  music: ["music", "musica", "album", "single", "artist", "artista", "concert", "concierto", "festival", "hip hop", "rap", "r&b", "electronic", "electronica", "alternative", "alternativa", "producer", "productor", "production", "produccion", "studio", "estudio", "label", "sello", "scene", "escena", "tour", "gira"],
  street: ["streetwear", "sneaker", "zapatilla", "fashion", "moda", "designer", "disenador", "collection", "coleccion", "collaboration", "colaboracion", "capsule", "capsula", "fashion week", "semana de la moda", "urban", "urbana", "nyfw", "photography", "fotografia", "design", "diseno", "clothing", "ropa"],
};

const vanmotionAffinityTerms: Record<NewsCategory, string[]> = {
  vehicles: ["car culture", "cultura del automovil", "automotive design", "diseno automovilistico", "car", "coche", "automovil", "classic", "clasico", "restomod", "custom", "preparacion", "special edition", "edicion especial", "special vehicle", "vehiculo especial", "iconic", "iconico", "van", "furgoneta", "engineering", "ingenieria", "urban mobility", "movilidad urbana", "pedestrian", "transit", "transportation", "motorsport", "concept car", "lanzamiento"],
  music: ["hip hop", "hip-hop", "rap", "r&b", "electronic", "electronica", "alternative", "alternativa", "producer", "productor", "production", "produccion", "studio", "estudio", "label", "sello", "underground", "escena musical", "music scene", "album", "single", "artista", "artist", "singer", "cantante", "new york", "nyc", "brooklyn", "manhattan"],
  street: ["streetwear", "sneaker", "zapatilla", "fashion", "moda", "ropa", "collection", "coleccion", "designer", "disenador", "collaboration", "colaboracion", "capsule", "capsula", "fashion week", "semana de la moda", "urban culture", "cultura urbana", "nyfw", "automotive", "automovil", "music", "musica", "photography", "fotografia", "new york", "nyc", "brooklyn", "manhattan"],
};

const blockedTerms = [
  "clickbait", "sponsored", "sponsored content", "advertorial", "affiliate", "gossip", "celebrity gossip", "celebrity", "rumor", "rumour", "accident", "crash", "traffic death", "killed", "deadly", "injured", "sexual assault", "sued", "lawsuit", "court", "trial", "charges", "murder-for-hire", "demanda", "juicio", "acusado", "detenido", "asesinato", "muerte", "suceso", "cotilleo", "oferta", "discount", "coupon", "sale", "descuento", "rebaja", "chollo", "shopping guide", "buying guide", "best gifts", "top 10", "best of", "ranking", "embarazo", "embarazada", "pregnant", "pregnancy", "baby", "bebe", "birth", "parto", "divorce", "divorcio", "wedding", "boda", "breakup", "break-up", "boyfriend", "girlfriend", "husband", "wife", "relationship", "relacion", "dating", "vida privada", "private life", "revela a su bebe",
];

const NYC_TERMS = ["new york", "new york city", "nyc", "manhattan", "brooklyn", "queens", "bronx", "staten island"];

const spanishFeeds = new Set([
  "Motor1 España", "Motor.es", "Top Gear España", "Autobild España", "MondoSonoro", "JENESAISPOP", "Rockdelux", "Efe EME", "RockZone", "Neo2", "Trendencias",
]);

const nycFeeds = new Set(["NYC Streetsblog", "BrooklynVegan"]);

const categoryBlockedTerms: Record<NewsCategory, string[]> = {
  vehicles: ["for sale", "en venta", "concesionario", "dealership", "insurance", "seguro"],
  music: ["reality tv", "talent show", "red carpet", "alfombra roja"],
  street: ["restaurant", "restaurante", "architecture", "arquitectura", "interior design", "interiorismo", "hotel", "travel"],
};

function matchesTerm(text: string, term: string): boolean {
  const normalizedTerm = normalize(term);
  return text === normalizedTerm || text.startsWith(`${normalizedTerm} `) || text.endsWith(` ${normalizedTerm}`) || text.includes(` ${normalizedTerm} `);
}

function cleanText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? cleanText(match[1]) : "";
}

function attribute(block: string, name: string): string {
  const match = block.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match?.[1] ?? "";
}

function categories(block: string): string[] {
  return [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)].map((match) => cleanText(match[1]));
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function validUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function words(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((word) => word.length > 3));
}

function duplicateOf(candidate: Candidate, existing: Candidate[]): boolean {
  const candidateWords = words(candidate.title);
  return existing.some((item) => {
    const intersection = [...candidateWords].filter((word) => words(item.title).has(word)).length;
    const denominator = Math.max(candidateWords.size, words(item.title).size, 1);
    return normalize(candidate.sourceUrl) === normalize(item.sourceUrl) || intersection / denominator >= 0.72;
  });
}

function summaryFor(feed: Feed, title: string): string {
  if (feed.locale === "es") {
    return `${feed.name} pone el foco en ${title}. Una lectura breve para seguir de cerca la cultura del motor, la música y el diseño urbano, con el contexto original y la mirada editorial de un medio especializado.`;
  }

  return `${feed.name} leads with ${title}. A concise pointer for following the city’s wider conversation around vehicles, music, design and street culture, keeping the original reporting and its editorial context in view.`;
}

function countMatches(text: string, terms: string[]): number {
  return terms.filter((term) => matchesTerm(text, term)).length;
}

function scoreCandidate(candidate: Omit<Candidate, "sourceAuthority" | "categoryAffinity" | "vanmotionAffinity" | "regionAffinity" | "freshness" | "culturalImportance" | "editorialScore">, feed: Feed): Omit<Candidate, "tags" | "description" | "summary" | "imageUrl" | "publishedAt" | "sourceUrl" | "source" | "title" | "category" | "locale" | "region"> {
  const text = normalize(`${candidate.title} ${candidate.description} ${candidate.tags.join(" ")}`);
  const categoryMatches = countMatches(text, categoryAffinityTerms[candidate.category]);
  const vanmotionMatches = countMatches(text, vanmotionAffinityTerms[candidate.category]);
  const sourceAuthority = Math.round((feed.authority / 31) * 100);
  const categoryContext = feed.category === candidate.category ? 62 : 0;
  const categoryAffinity = Math.min(100, categoryContext + Math.min(38, categoryMatches * 8));
  const sourceRegionContext = candidate.region === "ES" && spanishFeeds.has(feed.name) || candidate.region === "NY" && nycFeeds.has(feed.name);
  const explicitRegion = NYC_TERMS.some((term) => matchesTerm(text, term));
  const regionAffinity = candidate.region === "ES" ? (sourceRegionContext ? 88 : explicitRegion ? 75 : 0) : (sourceRegionContext ? 88 : explicitRegion ? 100 : 0);
  const vanmotionAffinity = Math.min(100, 48 + Math.min(52, vanmotionMatches * 10));
  const ageDays = Math.max(0, (Date.now() - candidate.publishedAt.getTime()) / 86_400_000);
  const freshness = Math.max(0, Math.round(100 - Math.min(100, (ageDays / 14) * 100)));
  const culturalImportance = Math.min(100, 42 + vanmotionMatches * 10 + (categoryMatches >= 2 ? 10 : 0));
  const presentation = candidate.title.length >= 20 && candidate.title.length <= 140 && candidate.description.length >= 30 ? 100 : 55;
  const affinity = (categoryAffinity + vanmotionAffinity + regionAffinity) / 3;
  const editorialScore = Math.round(sourceAuthority * 0.35 + affinity * 0.30 + freshness * 0.20 + culturalImportance * 0.10 + presentation * 0.05);
  return { sourceAuthority, categoryAffinity, vanmotionAffinity, regionAffinity, freshness, culturalImportance, editorialScore };
}

function imageFromHtml(value: string): string | null {
  if (!value) return null;

  const cleaned = value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/&amp;/g, "&");

  const srcMatch =
    cleaned.match(
      /<img\b[^>]*\b(?:src|data-src)=["']([^"']+)["'][^>]*>/i,
    );

  if (srcMatch?.[1]) {
    const url = validUrl(srcMatch[1]);
    if (url) return url;
  }

  const srcsetMatch =
    cleaned.match(
      /<img\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/i,
    );

  if (srcsetMatch?.[1]) {
    const firstCandidate =
      srcsetMatch[1].split(",")[0]?.trim().split(/\s+/)[0] ?? "";

    const url = validUrl(firstCandidate);
    if (url) return url;
  }

  return null;
}

function rawTag(block: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(
    new RegExp(
      `<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`,
      "i",
    ),
  );

  return match?.[1] ?? "";
}

function imageUrlFor(block: string): string | null {
  const direct = validUrl(
    attribute(
      block.match(
        /<(?:media:content|enclosure)\b[^>]*>/i,
      )?.[0] ?? "",
      "url",
    ) ||
      attribute(
        block.match(/<media:thumbnail\b[^>]*>/i)?.[0] ?? "",
        "url",
      ),
  );

  if (direct) return direct;

  return (
    imageFromHtml(rawTag(block, "content:encoded")) ||
    imageFromHtml(rawTag(block, "description")) ||
    imageFromHtml(rawTag(block, "summary")) ||
    null
  );
}

function parseFeed(xml: string, feed: Feed): Evaluation[] {
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/(item|entry)>/gi) ?? [];
  return blocks.flatMap((block) => {
    const title = tag(block, "title");
    const sourceUrl = validUrl(tag(block, "link") || attribute(block.match(/<link\b[^>]*>/i)?.[0] ?? "", "href"));
    const published = tag(block, "pubDate") || tag(block, "published") || tag(block, "updated");
    const publishedAt = new Date(published);
    const description = tag(block, "description") || tag(block, "summary");
    const tags = categories(block);
    const imageUrl = imageUrlFor(block);

    if (!title || !sourceUrl || Number.isNaN(publishedAt.getTime())) return [];
    const candidate = {
      locale: feed.locale,
      region: feed.region,
      category: feed.category,
      title: title.replace(/\s+-\s+[^-]+$/, "").trim(),
      summary: summaryFor(feed, title),
      source: feed.name,
      sourceUrl,
      description,
      tags,
      imageUrl,
      publishedAt,
    } satisfies Omit<Candidate, "sourceAuthority" | "categoryAffinity" | "vanmotionAffinity" | "regionAffinity" | "freshness" | "culturalImportance" | "editorialScore">;
    const searchable = normalize(`${candidate.title} ${description} ${tags.join(" ")}`);
    const scored = scoreCandidate(candidate, feed);
    let rejectionReason: RejectionReason | undefined;
    if (candidate.publishedAt.getTime() < Date.now() - 14 * 86_400_000) rejectionReason = "age";
    else if (blockedTerms.some((term) => matchesTerm(searchable, term)) || categoryBlockedTerms[feed.category].some((term) => matchesTerm(searchable, term))) rejectionReason = "hard-rejection";
    else if (scored.regionAffinity < 55) rejectionReason = "region-affinity";
    else if (scored.categoryAffinity < 55) rejectionReason = "category-affinity";
    else if (scored.vanmotionAffinity < 45) rejectionReason = "vanmotion-affinity";
    else if (scored.editorialScore < 70) rejectionReason = "editorial-score";
    return [{ candidate: { ...candidate, ...scored }, rejectionReason }];
  });
}

async function fetchFeed(feed: Feed): Promise<FeedResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7_000);
  try {
    const response = await fetch(feed.url, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" } });
    if (!response.ok) return { feed, status: response.status, evaluations: [] };
    return { feed, status: response.status, evaluations: parseFeed(await response.text(), feed) };
  } catch (error) {
    console.error("VANMOTION_NEWS_FEED_ERROR", feed.name, error instanceof Error ? error.message : String(error));
    return { feed, status: "ERROR", evaluations: [] };
  } finally {
    clearTimeout(timeout);
  }
}

function slugFor(title: string, sourceUrl: string): string {
  const base = normalize(title).replace(/\s+/g, "-").slice(0, 80) || "noticia";
  return `${base}-${createHash("sha1").update(sourceUrl).digest("hex").slice(0, 10)}`;
}

const rejectionLabels: Record<RejectionReason, string> = {
  age: "demasiado antigua",
  "hard-rejection": "regla dura de calidad",
  "region-affinity": "sin afinidad territorial suficiente",
  "category-affinity": "sin afinidad de categoría suficiente",
  "vanmotion-affinity": "sin afinidad VANMOTION suficiente",
  "editorial-score": "editorialScore inferior a 70",
};

function emptyDiagnostic() {
  return {
    total: 0,
    valid: [] as Candidate[],
    rejected: {
      age: 0,
      "hard-rejection": 0,
      "region-affinity": 0,
      "category-affinity": 0,
      "vanmotion-affinity": 0,
      "editorial-score": 0,
    } satisfies Record<RejectionReason, number>,
    topRejected: [] as Array<Candidate & { rejectionReason: string }>,
  };
}

export async function dryRunNews() {
  const results = await Promise.all(feeds.map(fetchFeed));
  const editions: Array<[NewsLocale, NewsRegion]> = [["es", "ES"], ["en", "NY"]];
  const categories = Object.fromEntries(
    editions.flatMap(([locale, region]) => NEWS_CATEGORIES.map((category) => [`${locale}/${region}/${category}`, emptyDiagnostic()])),
  ) as Record<string, ReturnType<typeof emptyDiagnostic>>;

  for (const result of results) {
    for (const evaluation of result.evaluations) {
      const key = `${result.feed.locale}/${result.feed.region}/${result.feed.category}`;
      const diagnostic = categories[key];
      diagnostic.total += 1;
      if (!evaluation.rejectionReason) diagnostic.valid.push(evaluation.candidate);
      else diagnostic.rejected[evaluation.rejectionReason] += 1;
    }
  }

  for (const diagnostic of Object.values(categories)) {
    diagnostic.valid.sort((first, second) => second.editorialScore - first.editorialScore || second.publishedAt.getTime() - first.publishedAt.getTime());
  }

  for (const result of results) {
    for (const evaluation of result.evaluations) {
      if (!evaluation.rejectionReason) continue;
      const key = `${result.feed.locale}/${result.feed.region}/${result.feed.category}`;
      categories[key].topRejected.push({ ...evaluation.candidate, rejectionReason: rejectionLabels[evaluation.rejectionReason] });
    }
  }

  for (const diagnostic of Object.values(categories)) {
    diagnostic.topRejected.sort((first, second) => second.editorialScore - first.editorialScore || second.publishedAt.getTime() - first.publishedAt.getTime());
    diagnostic.topRejected = diagnostic.topRejected.slice(0, 5);
  }

  return {
    feeds: results.map((result) => ({ source: result.feed.name, url: result.feed.url, status: result.status, read: result.evaluations.length })),
    categories,
  };
}

function metaImageUrl(html: string): string | null {
  const patterns = [
    /<meta\b[^>]*property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta\b[^>]*name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      const imageUrl = validUrl(
        match[1].replace(/&amp;/g, "&"),
      );

      if (imageUrl) return imageUrl;
    }
  }

  return null;
}

async function enrichCandidateImage(
  candidate: Candidate,
): Promise<Candidate> {
  if (candidate.imageUrl) {
    return candidate;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    3500,
  );

  try {
    const response = await fetch(candidate.sourceUrl, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 VANMOTION/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return candidate;
    }

    const imageUrl = metaImageUrl(
      await response.text(),
    );

    if (!imageUrl) {
      return candidate;
    }

    return {
      ...candidate,
      imageUrl,
    };
  } catch {
    return candidate;
  } finally {
    clearTimeout(timeout);
  }
}

export async function ingestNews(): Promise<{ fetched: number; saved: number; active: number }> {
  const fetched = (await Promise.all(feeds.map(fetchFeed))).flatMap((result) => result.evaluations);
  const selected: Candidate[] = [];
  for (const evaluation of fetched.sort((first, second) => second.candidate.editorialScore - first.candidate.editorialScore || second.candidate.publishedAt.getTime() - first.candidate.publishedAt.getTime())) {
    const candidate = evaluation.candidate;
    if (!evaluation.rejectionReason && candidate.editorialScore >= 70 && !duplicateOf(candidate, selected)) selected.push(candidate);
  }

  const selectedWithImages = await Promise.all(
    selected.map(enrichCandidateImage),
  );

  let saved = 0;
  for (const candidate of selectedWithImages) {
    await prisma.newsArticle.upsert({
      where: { sourceUrl: candidate.sourceUrl },
      create: {
        locale: candidate.locale,
        region: candidate.region,
        category: candidate.category,
        title: candidate.title,
        summary: candidate.summary,
        source: candidate.source,
        sourceUrl: candidate.sourceUrl,
        imageUrl: candidate.imageUrl,
        publishedAt: candidate.publishedAt,
        editorialScore: candidate.editorialScore,
        slug: slugFor(candidate.title, candidate.sourceUrl),
      },
      update: { title: candidate.title, summary: candidate.summary, imageUrl: candidate.imageUrl, publishedAt: candidate.publishedAt, fetchedAt: new Date(), editorialScore: candidate.editorialScore },
    });
    saved += 1;
  }

  let active = 0;
  for (const locale of NEWS_LOCALES) for (const region of NEWS_REGIONS) for (const category of NEWS_CATEGORIES) {
    const ranked = await prisma.newsArticle.findMany({ where: { locale, region, category, editorialScore: { gte: 70 } }, orderBy: [{ editorialScore: "desc" }, { publishedAt: "desc" }], take: 3, select: { id: true } });
    const ids = ranked.map((item) => item.id);
    if (ids.length) {
      await prisma.newsArticle.updateMany({ where: { locale, region, category }, data: { isActive: false } });
      await prisma.newsArticle.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
      active += ids.length;
    }
  }
  return { fetched: fetched.length, saved, active };
}

export async function getPublishedNews(locale: NewsLocale, region: NewsRegion) {
  return prisma.newsArticle.findMany({ where: { locale, region, isActive: true, editorialScore: { gte: 70 } }, orderBy: [{ category: "asc" }, { editorialScore: "desc" }, { publishedAt: "desc" }] });
}

export async function setNewsActive(id: string, isActive: boolean) {
  return prisma.newsArticle.update({ where: { id }, data: { isActive } });
}