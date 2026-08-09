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
      '"coches de segunda mano" OR "mercado del automóvil" OR "vehículos clásicos" OR furgonetas OR importación OR homologación OR mantenimiento automóvil',
    music:
      '"producción musical" OR "música independiente" OR "estudio de grabación" OR "mezcla musical" OR masterización OR beatmaking OR "plugins de audio" OR "software musical" OR "distribución musical" OR trap OR "música urbana" OR productores musicales',
    clothing:
      'streetwear OR "moda urbana" OR "diseño independiente" OR fabricación textil OR materiales textiles OR "marcas independientes"',
  },
  en: {
    vehicles:
      '"used cars" OR "car market" OR "classic cars" OR vans OR vehicle import OR homologation OR car maintenance',
    music:
      '"music production" OR "independent music" OR "recording studio" OR mixing OR mastering OR beatmaking OR "audio plugins" OR "music software" OR "music distribution" OR trap OR "urban music" OR music producers',
    clothing:
      'streetwear OR "urban fashion" OR "independent fashion" OR textile manufacturing OR clothing materials OR "independent brands"',
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

const POSITIVE_TERMS: Record<
  Language,
  Record<Topic, string[]>
> = {
  es: {
    vehicles: [
      "segunda mano",
      "mercado",
      "clasico",
      "clasicos",
      "furgoneta",
      "furgonetas",
      "importacion",
      "homologacion",
      "mantenimiento",
      "taller",
      "vehiculo",
      "automovil",
      "motor",
    ],
    music: [
      "produccion",
      "productor",
      "estudio",
      "grabacion",
      "independiente",
      "trap",
      "urbana",
      "artista",
      "lanzamiento",
      "audio",
      "musica",
    ],
    clothing: [
      "streetwear",
      "urbana",
      "textil",
      "tejido",
      "material",
      "fabricacion",
      "diseno",
      "independiente",
      "marca",
      "ropa",
    ],
  },
  en: {
    vehicles: [
      "used car",
      "market",
      "classic",
      "van",
      "vans",
      "import",
      "homologation",
      "maintenance",
      "workshop",
      "vehicle",
      "automotive",
    ],
    music: [
      "production",
      "producer",
      "studio",
      "recording",
      "independent",
      "trap",
      "urban",
      "artist",
      "release",
      "audio",
      "music",
    ],
    clothing: [
      "streetwear",
      "urban",
      "textile",
      "fabric",
      "material",
      "manufacturing",
      "design",
      "independent",
      "brand",
      "clothing",
    ],
  },
};

const NEGATIVE_TERMS: Record<
  Language,
  Record<Topic, string[]>
> = {
  es: {
    vehicles: [
      "formula 1",
      "f1",
      "motogp",
      "rally",
      "futbol",
      "celebridad",
    ],
    music: [
      "cotilleo",
      "novio",
      "novia",
      "romance",
      "reality",
      "television",
      "alfombra roja",
      "famosos",
    ],
    clothing: [
      "alfombra roja",
      "celebridad",
      "famosos",
      "realeza",
      "boda",
      "reality",
      "television",
    ],
  },
  en: {
    vehicles: [
      "formula 1",
      "f1",
      "motogp",
      "rally",
      "football",
      "celebrity",
    ],
    music: [
      "gossip",
      "boyfriend",
      "girlfriend",
      "romance",
      "reality tv",
      "red carpet",
      "celebrity",
    ],
    clothing: [
      "red carpet",
      "celebrity",
      "royal",
      "wedding",
      "reality tv",
      "gossip",
    ],
  },
};

function editorialScore(
  candidate: NewsCandidate,
  topic: Topic,
  language: Language,
): number {
  const title = normalizeTitle(candidate.title);

  const priorityTerms: Record<
    Language,
    Record<Topic, Array<[string, number]>>
  > = {
    es: {
      vehicles: [
        ["segunda mano", 10],
        ["coches de ocasion", 10],
        ["vehiculos de ocasion", 10],
        ["importacion", 9],
        ["homologacion", 9],
        ["itv", 9],
        ["dgt", 9],
        ["furgoneta", 8],
        ["furgonetas", 8],
        ["clasico", 7],
        ["clasicos", 7],
        ["mantenimiento", 7],
        ["taller", 6],
        ["mercado", 5],
        ["automovil", 4],
        ["vehiculo", 4],
      ],
      music: [
        ["produccion musical", 10],
        ["productor musical", 9],
        ["productores musicales", 9],
        ["estudio de grabacion", 10],
        ["grabacion", 7],
        ["mezcla", 7],
        ["masterizacion", 7],
        ["musica independiente", 9],
        ["artista independiente", 8],
        ["trap", 7],
        ["musica urbana", 7],
        ["beat", 6],
        ["audio", 5],
        ["lanzamiento", 4],
      ],
      clothing: [
        ["streetwear", 10],
        ["bomber", 10],
        ["bombers", 10],
        ["diseno independiente", 9],
        ["marca independiente", 9],
        ["marcas independientes", 9],
        ["fabricacion textil", 9],
        ["tejido", 8],
        ["tejidos", 8],
        ["materiales", 7],
        ["moda urbana", 8],
        ["textil", 6],
        ["reciclaje textil", 5],
        ["sostenibilidad", 4],
      ],
    },
    en: {
      vehicles: [
        ["used car", 10],
        ["used cars", 10],
        ["vehicle import", 9],
        ["import", 8],
        ["homologation", 9],
        ["inspection", 8],
        ["van", 8],
        ["vans", 8],
        ["classic car", 7],
        ["classic cars", 7],
        ["maintenance", 7],
        ["workshop", 6],
        ["car market", 5],
        ["automotive", 4],
      ],
      music: [
        ["music production", 10],
        ["music producer", 9],
        ["recording studio", 10],
        ["recording", 7],
        ["mixing", 7],
        ["mastering", 7],
        ["independent music", 9],
        ["independent artist", 8],
        ["trap", 7],
        ["urban music", 7],
        ["beat", 6],
        ["audio", 5],
        ["release", 4],
      ],
      clothing: [
        ["streetwear", 10],
        ["bomber", 10],
        ["independent design", 9],
        ["independent brand", 9],
        ["textile manufacturing", 9],
        ["fabric", 8],
        ["fabrics", 8],
        ["materials", 7],
        ["urban fashion", 8],
        ["textile", 6],
        ["textile recycling", 5],
        ["sustainability", 4],
      ],
    },
  };

  const localTerms =
    language === "es"
      ? ["espana", "madrid", "espanol", "espanola"]
      : ["spain", "madrid", "spanish"];

  const negativeTerms: Record<Topic, string[]> = {
    vehicles: [
      "formula 1",
      "f1",
      "motogp",
      "rally",
      "futbol",
      "football",
      "celebridad",
      "celebrity",
      "riesgo de muerte",
      "muerte",
      "mortal",
    ],
    music: [
      "cotilleo",
      "gossip",
      "novio",
      "novia",
      "boyfriend",
      "girlfriend",
      "romance",
      "reality",
      "alfombra roja",
      "red carpet",
      "famosos",
      "celebrity",
    ],
    clothing: [
      "alfombra roja",
      "red carpet",
      "celebridad",
      "celebrity",
      "realeza",
      "royal",
      "boda",
      "wedding",
      "reality",
      "gossip",
    ],
  };

  let score = 0;

  for (const [term, weight] of priorityTerms[language][topic]) {
    if (title.includes(normalizeTitle(term))) {
      score += weight;
    }
  }

  for (const term of localTerms) {
    if (title.includes(normalizeTitle(term))) {
      score += 4;
    }
  }

  for (const term of negativeTerms[topic]) {
    if (title.includes(normalizeTitle(term))) {
      score -= 12;
    }
  }

  // Música VANMOTION: producción y creación musical, no arquitectura de estudios.
  if (topic === "music") {
    const musicOffTopicTerms = [
      "galeria",
      "arquitectura",
      "arquitectonico",
      "arquitectonica",
      "interiorismo",
      "edificio",
      "architecture",
      "architectural",
      "interior design",
    ];

    for (const term of musicOffTopicTerms) {
      if (title.includes(normalizeTitle(term))) {
        score -= 14;
      }
    }

    const source = normalizeTitle(candidate.source);

    if (
      source.includes("archdaily") ||
      source.includes("dezeen") ||
      source.includes("designboom")
    ) {
      score -= 18;
    }
  }

  // Los titulares más cortos funcionan mejor en los bloques editoriales.
  if (candidate.title.length > 165) {
    score -= 10;
  } else if (candidate.title.length > 135) {
    score -= 6;
  } else if (candidate.title.length > 110) {
    score -= 3;
  } else if (candidate.title.length <= 90) {
    score += 2;
  }

  return score;
}

function filterEditorialCandidates(
  candidates: NewsCandidate[],
  topic: Topic,
  language: Language,
): NewsCandidate[] {
  return candidates
    .map((candidate) => ({
      candidate,
      score: editorialScore(candidate, topic, language),
    }))
    .filter(({ score }) =>
      score >= (topic === "music" ? 3 : 5),
    )
    .sort(
      (first, second) =>
        second.score - first.score ||
        second.candidate.publishedAt -
          first.candidate.publishedAt,
    )
    .map(({ candidate }) => candidate)
    .slice(0, MAX_ROTATION_ITEMS);
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

  const editorialToday =
    filterEditorialCandidates(
      today,
      topic,
      language,
    );

  if (editorialToday.length >= 2) {
    return (
      selectHourlyArticle(
        editorialToday,
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

  const editorialCandidates =
    filterEditorialCandidates(
      candidates,
      topic,
      language,
    );

  return (
    selectHourlyArticle(
      editorialCandidates,
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
  ["vanmotion-google-news-v7-music-editorial-hourly"],
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
