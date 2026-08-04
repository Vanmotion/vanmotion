import { unstable_cache } from "next/cache";

export type DailyNewsItem = {
  title: string;
  source: string;
  url: string;
};

type Language = "es" | "en";

type UnknownRecord = Record<string, unknown>;

type DailyNewsResult = [
  DailyNewsItem | null,
  DailyNewsItem | null,
  DailyNewsItem | null,
];

const DAILY_SECONDS = 60 * 60 * 24;

const SPANISH_QUERY = [
  "(",
  "(",
  "coche OR coches OR automovil OR automocion OR vehiculo OR motor OR ",
  "tesla OR ford OR volkswagen OR bmw OR mercedes OR audi OR porsche",
  ")",
  " OR ",
  "(",
  "musica OR cantante OR album OR concierto OR festival OR spotify OR ",
  "rap OR trap",
  ")",
  " OR ",
  "(",
  "moda OR ropa OR disenador OR fashion OR streetwear OR textil OR pasarela",
  ")",
  ")",
  " sourcelang:spanish sourcecountry:spain",
].join("");

const ENGLISH_QUERY = [
  "(",
  "(",
  "car OR cars OR automotive OR vehicle OR motor OR tesla OR ford OR ",
  "volkswagen OR bmw OR mercedes OR audi OR porsche",
  ")",
  " OR ",
  "(",
  "music OR singer OR album OR concert OR festival OR spotify OR rap OR trap",
  ")",
  " OR ",
  "(",
  "fashion OR clothing OR designer OR streetwear OR textile OR runway",
  ")",
  ")",
  " sourcelang:english",
].join("");

const VEHICLE_PATTERN =
  /\b(coche|coches|automovil|automoviles|automocion|vehiculo|vehiculos|motor|motores|car|cars|automotive|vehicle|vehicles|tesla|ford|volkswagen|bmw|mercedes|audi|porsche|ferrari|renault|peugeot|citroen|seat|cupra)\b/i;

const MUSIC_PATTERN =
  /\b(musica|cantante|cantantes|album|disco|cancion|canciones|concierto|conciertos|festival|festivales|gira|artista|artistas|music|singer|song|concert|spotify|grammy|billboard|rap|trap)\b/i;

const CLOTHING_PATTERN =
  /\b(moda|ropa|disenador|disenadora|disenadores|coleccion|pasarela|textil|prenda|prendas|vestido|vestidos|costura|fashion|clothing|designer|streetwear|runway)\b/i;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function cleanText(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim()
    : "";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSource(
  article: UnknownRecord,
  articleUrl: string,
): string {
  const suppliedDomain = cleanText(article.domain)
    .replace(/^www\./i, "");

  if (suppliedDomain) {
    return suppliedDomain;
  }

  try {
    return new URL(articleUrl).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function toNewsItem(
  article: UnknownRecord,
  language: Language,
): DailyNewsItem | null {
  const title = cleanText(article.title);
  const url = cleanText(article.url);

  if (
    title.length < 15 ||
    (!url.startsWith("https://") &&
      !url.startsWith("http://"))
  ) {
    return null;
  }

  return {
    title,
    source:
      getSource(article, url) ||
      (language === "es"
        ? "Medio de comunicación"
        : "News source"),
    url,
  };
}

function selectArticle(
  articles: UnknownRecord[],
  pattern: RegExp,
  usedUrls: Set<string>,
  language: Language,
): DailyNewsItem | null {
  for (const article of articles) {
    const newsItem = toNewsItem(article, language);

    if (!newsItem || usedUrls.has(newsItem.url)) {
      continue;
    }

    const searchableText = normalizeText(
      [
        newsItem.title,
        newsItem.source,
        newsItem.url,
      ].join(" "),
    );

    if (!pattern.test(searchableText)) {
      continue;
    }

    usedUrls.add(newsItem.url);
    return newsItem;
  }

  return null;
}

async function fetchDailyNewsOnce(
  language: Language,
): Promise<DailyNewsResult> {
  const endpoint = new URL(
    "https://api.gdeltproject.org/api/v2/doc/doc",
  );

  endpoint.searchParams.set(
    "query",
    language === "es"
      ? SPANISH_QUERY
      : ENGLISH_QUERY,
  );
  endpoint.searchParams.set("mode", "artlist");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("maxrecords", "100");
  endpoint.searchParams.set("timespan", "7d");
  endpoint.searchParams.set("sort", "hybridrel");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    10000,
  );

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "VANMOTION/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `GDELT respondió con estado ${response.status}`,
      );
    }

    const data = (await response.json()) as unknown;

    if (!isRecord(data) || !Array.isArray(data.articles)) {
      throw new Error(
        "GDELT no devolvió una lista válida de artículos",
      );
    }

    const articles = data.articles.filter(isRecord);

    if (articles.length === 0) {
      throw new Error("GDELT no devolvió artículos");
    }

    const usedUrls = new Set<string>();

    return [
      selectArticle(
        articles,
        VEHICLE_PATTERN,
        usedUrls,
        language,
      ),
      selectArticle(
        articles,
        MUSIC_PATTERN,
        usedUrls,
        language,
      ),
      selectArticle(
        articles,
        CLOTHING_PATTERN,
        usedUrls,
        language,
      ),
    ];
  } finally {
    clearTimeout(timeout);
  }
}

const getCachedDailyNews = unstable_cache(
  async (language: Language) =>
    fetchDailyNewsOnce(language),
  ["vanmotion-daily-news-v2"],
  {
    revalidate: DAILY_SECONDS,
    tags: ["vanmotion-daily-news"],
  },
);

export async function getDailyNews(
  language: Language,
): Promise<DailyNewsResult> {
  try {
    return await getCachedDailyNews(language);
  } catch (error) {
    console.error(
      "VANMOTION_DAILY_NEWS_ERROR",
      error instanceof Error
        ? error.message
        : String(error),
    );

    return [null, null, null];
  }
}
