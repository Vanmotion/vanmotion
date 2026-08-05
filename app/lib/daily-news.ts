import { unstable_cache } from "next/cache";

export type DailyNewsItem = {
  title: string;
  source: string;
  url: string;
};

type Language = "es" | "en";

const DAILY_SECONDS = 60 * 60;

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

const QUERIES: Record<
  Language,
  Record<Topic, string>
> = {
  es: {
    vehicles:
      "automoción coches vehículos industria automóvil",
    music:
      "música cantante álbum concierto festival",
    clothing:
      "moda ropa industria textil diseñadores",
  },
  en: {
    vehicles:
      "automotive cars vehicles motor industry",
    music:
      "music singer album concert festival",
    clothing:
      "fashion clothing textile industry designers",
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

  const query = `${QUERIES[language][topic]} when:${period}`;

  endpoint.searchParams.set("q", query);

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

function parseFirstArticle(
  xml: string,
): DailyNewsItem | null {
  const items =
    xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  for (const item of items) {
    let title = extractTag(item, "title");
    const url = extractTag(item, "link");
    const source = extractTag(item, "source");

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

    return {
      title,
      source: source || "Google News",
      url,
    };
  }

  return null;
}

async function fetchTopic(
  topic: Topic,
  language: Language,
  period: "1d" | "7d",
): Promise<DailyNewsItem | null> {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    9000,
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
      return null;
    }

    return parseFirstArticle(
      await response.text(),
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDailyNewsOnce(
  language: Language,
): Promise<DailyNewsResult> {
  const results = await Promise.all(
    TOPICS.map(async (topic) => {
      const today = await fetchTopic(
        topic,
        language,
        "1d",
      );

      if (today) {
        return today;
      }

      const week = await fetchTopic(
        topic,
        language,
        "7d",
      );

      return week ?? fallbackNews(topic, language);
    }),
  );

  return results as DailyNewsResult;
}

const getCachedDailyNews = unstable_cache(
  async (language: Language) =>
    fetchDailyNewsOnce(language),
  ["vanmotion-google-news-v2"],
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

    return [
      fallbackNews("vehicles", language),
      fallbackNews("music", language),
      fallbackNews("clothing", language),
    ];
  }
}
