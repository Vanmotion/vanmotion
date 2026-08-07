import { unstable_cache } from "next/cache";

export type DailyNewsItem = {
  title: string;
  source: string;
  url: string;
};

type Language = "es" | "en";

const NEWS_REFRESH_SECONDS = 60 * 60;
const MAX_ROTATION_ITEMS = 12;

const TOPICS = [
  "vehicles",
  "music",
  "clothing",
] as const;

type Topic = (typeof TOPICS)[number];

type DailyNewsResult = [
  DailyNewsItem,
  DailyNewsItem,
  DailyNewsItem,
];

type NewsCandidate = DailyNewsItem & {
  publishedAt: number;
};

const QUERIES: Record<
  Language,
  Record<Topic, string>
> = {
  es: {
    vehicles:
      'automoción OR coches OR vehículos OR automóvil OR motor',
    music:
      'música OR cantante OR álbum OR concierto OR festival',
    clothing:
      'moda OR ropa OR textil OR diseñadores OR tendencias',
  },
  en: {
    vehicles:
      'automotive OR cars OR vehicles OR motoring OR auto industry',
    music:
      'music OR singer OR album OR concert OR festival',
    clothing:
      'fashion OR clothing OR textile OR designers OR trends',
  },
};

const FALLBACK_TITLES: Record<
  Language,
  Record<Topic, string>
> = {
  es: {
    vehicles: "Últimas noticias de vehículos",
    music: "Últimas noticias de música",
    clothing: "Últimas noticias de moda y ropa",
  },
  en: {
    vehicles: "Latest vehicle news",
    music: "Latest music news",
    clothing: "Latest fashion and clothing news",
  },
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(
  block: string,
  tag: string,
): string {
  const expression = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i",
  );

  const match = block.match(expression);

  return match ? decodeXml(match[1]) : "";
}

function buildRssUrl(
  topic: Topic,
  language: Language,
  period: "1d" | "7d",
): string {
  const endpoint = new URL(
    "https://news.google.com/rss/search",
  );

  endpoint.searchParams.set(
    "q",
    `${QUERIES[language][topic]} when:${period}`,
  );

  if (language === "es") {
    endpoint.searchParams.set("hl", "es");
    endpoint.searchParams.set("gl", "ES");
    endpoint.searchParams.set("ceid", "ES:es");
  } else {
    endpoint.searchParams.set("hl", "en-US");
    endpoint.searchParams.set("gl", "US");
    endpoint.searchParams.set("ceid", "US:en");
  }

  return endpoint.toString();
}

function buildSearchUrl(
  topic: Topic,
  language: Language,
): string {
  const endpoint = new URL(
    "https://news.google.com/search",
  );

  endpoint.searchParams.set(
    "q",
    QUERIES[language][topic],
  );

  if (language === "es") {
    endpoint.searchParams.set("hl", "es");
    endpoint.searchParams.set("gl", "ES");
    endpoint.searchParams.set("ceid", "ES:es");
  } else {
    endpoint.searchParams.set("hl", "en-US");
    endpoint.searchParams.set("gl", "US");
    endpoint.searchParams.set("ceid", "US:en");
  }

  return endpoint.toString();
}

function fallbackNews(
  topic: Topic,
  language: Language,
): DailyNewsItem {
  return {
    title: FALLBACK_TITLES[language][topic],
    source: "Google News",
    url: buildSearchUrl(topic, language),
  };
}

function normalizeTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseArticles(
  xml: string,
): NewsCandidate[] {
  const items =
    xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  const candidates: NewsCandidate[] = [];
  const seenTitles = new Set<string>();

  for (const item of items) {
    let title = extractTag(item, "title");
    const url = extractTag(item, "link");
    const source = extractTag(item, "source");
    const publicationDate = extractTag(
      item,
      "pubDate",
    );

    if (
      title.length < 10 ||
      (!url.startsWith("https://") &&
        !url.startsWith("http://"))
    ) {
      continue;
    }

    if (
      source &&
      title.toLowerCase().endsWith(
        ` - ${source.toLowerCase()}`,
      )
    ) {
      title = title.slice(
        0,
        -(source.length + 3),
      );
    }

    const normalizedTitle = normalizeTitle(title);

    if (
      !normalizedTitle ||
      seenTitles.has(normalizedTitle)
    ) {
      continue;
    }

    seenTitles.add(normalizedTitle);

    const parsedDate = Date.parse(publicationDate);

    candidates.push({
      title,
      source: source || "Google News",
      url,
      publishedAt: Number.isNaN(parsedDate)
        ? 0
        : parsedDate,
    });
  }

  return candidates
    .sort(
      (first, second) =>
        second.publishedAt - first.publishedAt,
    )
    .slice(0, MAX_ROTATION_ITEMS);
}

function mergeCandidates(
  first: NewsCandidate[],
  second: NewsCandidate[],
): NewsCandidate[] {
  const merged: NewsCandidate[] = [];
  const seenTitles = new Set<string>();

  for (const candidate of [...first, ...second]) {
    const normalizedTitle = normalizeTitle(
      candidate.title,
    );

    if (seenTitles.has(normalizedTitle)) {
      continue;
    }

    seenTitles.add(normalizedTitle);
    merged.push(candidate);
  }

  return merged
    .sort(
      (firstItem, secondItem) =>
        secondItem.publishedAt -
        firstItem.publishedAt,
    )
    .slice(0, MAX_ROTATION_ITEMS);
}

function selectHourlyArticle(
  candidates: NewsCandidate[],
  topic: Topic,
  language: Language,
): DailyNewsItem | null {
  if (candidates.length === 0) {
    return null;
  }

  const hourlySlot = Math.floor(
    Date.now() /
      (NEWS_REFRESH_SECONDS * 1000),
  );

  const topicOffset =
    TOPICS.indexOf(topic) * 3;

  const languageOffset =
    language === "en" ? 1 : 0;

  const selectedIndex =
    (hourlySlot +
      topicOffset +
      languageOffset) %
    candidates.length;

  const selected = candidates[selectedIndex];

  return {
    title: selected.title,
    source: selected.source,
    url: selected.url,
  };
}

async function fetchTopicCandidates(
  topic: Topic,
  language: Language,
  period: "1d" | "7d",
): Promise<NewsCandidate[]> {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    2500,
  );

  try {
    const response = await fetch(
      buildRssUrl(topic, language, period),
      {
        headers: {
          Accept:
            "application/rss+xml, application/xml, text/xml",
          "User-Agent":
            "Mozilla/5.0 VANMOTION/1.0",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return [];
    }

    return parseArticles(
      await response.text(),
    );
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTopic(
  topic: Topic,
  language: Language,
): Promise<DailyNewsItem> {
  const today = await fetchTopicCandidates(
    topic,
    language,
    "1d",
  );

  if (today.length >= 2) {
    return (
      selectHourlyArticle(
        today,
        topic,
        language,
      ) ?? fallbackNews(topic, language)
    );
  }

  const week = await fetchTopicCandidates(
    topic,
    language,
    "7d",
  );

  const candidates = mergeCandidates(
    today,
    week,
  );

  return (
    selectHourlyArticle(
      candidates,
      topic,
      language,
    ) ?? fallbackNews(topic, language)
  );
}

async function fetchDailyNewsOnce(
  language: Language,
): Promise<DailyNewsResult> {
  const results = await Promise.all(
    TOPICS.map((topic) =>
      fetchTopic(topic, language),
    ),
  );

  return results as DailyNewsResult;
}

const getCachedDailyNews = unstable_cache(
  async (language: Language) =>
    fetchDailyNewsOnce(language),
  ["vanmotion-google-news-v3-hourly"],
  {
    revalidate: NEWS_REFRESH_SECONDS,
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

    return [
      fallbackNews("vehicles", language),
      fallbackNews("music", language),
      fallbackNews("clothing", language),
    ];
  }
}
