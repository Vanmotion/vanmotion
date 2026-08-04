export type DailyNewsItem = {
  title: string;
  source: string;
  url: string;
};

type Language = "es" | "en";

type UnknownRecord = Record<string, unknown>;

const DAILY_SECONDS = 60 * 60 * 24;

const TOPICS = [
  '("automotive industry" OR "electric vehicle" OR automaker OR carmaker OR motorsport)',
  '("music industry" OR musician OR singer OR album OR concert OR festival)',
  '("fashion industry" OR fashion OR clothing OR streetwear OR designer)',
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function cleanText(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim()
    : "";
}

function getSource(article: UnknownRecord, articleUrl: string): string {
  const suppliedDomain = cleanText(article.domain).replace(/^www\./i, "");

  if (suppliedDomain) {
    return suppliedDomain;
  }

  try {
    return new URL(articleUrl).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

async function fetchTopic(
  topic: string,
  language: Language,
): Promise<DailyNewsItem | null> {
  const sourceLanguage = language === "es" ? "spanish" : "english";
  const countryFilter =
    language === "es" ? " sourcecountry:spain" : "";

  const endpoint = new URL(
    "https://api.gdeltproject.org/api/v2/doc/doc",
  );

  endpoint.searchParams.set(
    "query",
    `${topic} sourcelang:${sourceLanguage}${countryFilter}`,
  );
  endpoint.searchParams.set("mode", "artlist");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("maxrecords", "10");
  endpoint.searchParams.set("timespan", "24h");
  endpoint.searchParams.set("sort", "hybridrel");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: DAILY_SECONDS,
        tags: ["vanmotion-daily-news"],
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as unknown;

    if (!isRecord(data) || !Array.isArray(data.articles)) {
      return null;
    }

    for (const candidate of data.articles) {
      if (!isRecord(candidate)) {
        continue;
      }

      const title = cleanText(candidate.title);
      const url = cleanText(candidate.url);

      if (
        title.length < 15 ||
        (!url.startsWith("https://") && !url.startsWith("http://"))
      ) {
        continue;
      }

      const source = getSource(candidate, url);

      return {
        title,
        source:
          source ||
          (language === "es" ? "Medio de comunicación" : "News source"),
        url,
      };
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getDailyNews(
  language: Language,
): Promise<Array<DailyNewsItem | null>> {
  return Promise.all(
    TOPICS.map((topic) => fetchTopic(topic, language)),
  );
}
