const VERCEL_ANALYTICS_API =
  "https://api.vercel.com/v1/query/web-analytics";

const TEAM_ID =
  "team_aUJkd76QzH24raOnR3j8qMjn";

const PROJECT_ID =
  "prj_33zn3CUoOsY07MxOm8HrOXZ1WPbZ";

const ANALYTICS_START =
  "2026-08-04T00:00:00.000Z";

const PRODUCTION_FILTER =
  "environment eq 'production'";

type CountResponse = {
  data?: {
    visitors?: number;
    pageviews?: number;
  };
};

type AggregateRow = {
  country?: string;
  deviceType?: string;
  requestPath?: string;
  visitors?: number;
  pageviews?: number;
};

type AggregateResponse = {
  data?: AggregateRow[];
};

export type AnalyticsCountry = {
  code: string;
  flag: string;
  name: string;
  visitors: number;
  pageviews: number;
};

export type AnalyticsDevice = {
  type: string;
  label: string;
  symbol: string;
  visitors: number;
  pageviews: number;
};

export type AnalyticsPage = {
  path: string;
  label: string;
  visitors: number;
  pageviews: number;
};

export type VercelAnalytics = {
  available: boolean;
  visitors: number;
  pageviews: number;
  countries: AnalyticsCountry[];
  devices: AnalyticsDevice[];
  pages: AnalyticsPage[];
};

const emptyAnalytics: VercelAnalytics = {
  available: false,
  visitors: 0,
  pageviews: 0,
  countries: [],
  devices: [
    {
      type: "desktop",
      label: "Ordenador",
      symbol: "▰",
      visitors: 0,
      pageviews: 0,
    },
    {
      type: "mobile",
      label: "Móvil",
      symbol: "▯",
      visitors: 0,
      pageviews: 0,
    },
    {
      type: "tablet",
      label: "Tableta",
      symbol: "▭",
      visitors: 0,
      pageviews: 0,
    },
  ],
  pages: [],
};

function tomorrowUtc(): string {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + 1);
  date.setUTCHours(0, 0, 0, 0);

  return date.toISOString();
}

async function queryVercel<T>(
  endpoint: "visits/count" | "visits/aggregate",
  token: string,
  extraParameters: Record<string, string> = {},
): Promise<T> {
  const url = new URL(
    `${VERCEL_ANALYTICS_API}/${endpoint}`,
  );

  url.searchParams.set("teamId", TEAM_ID);
  url.searchParams.set("projectId", PROJECT_ID);
  url.searchParams.set("since", ANALYTICS_START);
  url.searchParams.set("until", tomorrowUtc());
  url.searchParams.set("filter", PRODUCTION_FILTER);

  for (const [key, value] of Object.entries(
    extraParameters,
  )) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Vercel Analytics respondió ${response.status}.`,
    );
  }

  return (await response.json()) as T;
}

function countryFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...Array.from(code).map(
      (character) =>
        127397 + character.charCodeAt(0),
    ),
  );
}

function countryName(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  try {
    const names = new Intl.DisplayNames(["es"], {
      type: "region",
    });

    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

function pageLabel(path: string): string {
  const labels: Record<string, string> = {
    "/": "Inicio",
    "/coleccion": "Vehículos",
    "/ropa": "Ropa",
    "/musica": "Música",
    "/contacto": "Contacto",
    "/aviso-legal": "Aviso legal",
    "/condiciones-compra": "Condiciones de compra",
    "/cookies": "Cookies",
    "/desistimiento": "Desistimiento",
    "/privacidad": "Privacidad",
  };

  if (labels[path]) {
    return labels[path];
  }

  if (path.startsWith("/ropa/")) {
    return "Producto de ropa";
  }

  if (path.startsWith("/coleccion/")) {
    return "Ficha de vehículo";
  }

  return path;
}

function normalizeDevices(
  rows: AggregateRow[],
): AnalyticsDevice[] {
  const totals = new Map(
    rows.map((row) => [
      row.deviceType ?? "unknown",
      {
        visitors: row.visitors ?? 0,
        pageviews: row.pageviews ?? 0,
      },
    ]),
  );

  return emptyAnalytics.devices.map((device) => {
    const data = totals.get(device.type);

    return {
      ...device,
      visitors: data?.visitors ?? 0,
      pageviews: data?.pageviews ?? 0,
    };
  });
}

export async function getVercelAnalytics(): Promise<VercelAnalytics> {
  const token =
    process.env.VERCEL_ANALYTICS_TOKEN?.trim();

  if (!token) {
    return emptyAnalytics;
  }

  try {
    const count = await queryVercel<CountResponse>(
      "visits/count",
      token,
    );

    const [countriesResult, devicesResult, pagesResult] =
      await Promise.allSettled([
        queryVercel<AggregateResponse>(
          "visits/aggregate",
          token,
          {
            by: "country",
            limit: "10",
          },
        ),
        queryVercel<AggregateResponse>(
          "visits/aggregate",
          token,
          {
            by: "deviceType",
            limit: "10",
          },
        ),
        queryVercel<AggregateResponse>(
          "visits/aggregate",
          token,
          {
            by: "requestPath",
            limit: "10",
          },
        ),
      ]);

    const countryRows =
      countriesResult.status === "fulfilled"
        ? countriesResult.value.data ?? []
        : [];

    const deviceRows =
      devicesResult.status === "fulfilled"
        ? devicesResult.value.data ?? []
        : [];

    const pageRows =
      pagesResult.status === "fulfilled"
        ? pagesResult.value.data ?? []
        : [];

    return {
      available: true,
      visitors: count.data?.visitors ?? 0,
      pageviews: count.data?.pageviews ?? 0,
      countries: countryRows.map((row) => {
        const code = row.country ?? "";

        return {
          code: code || "unknown",
          flag: countryFlag(code),
          name: countryName(code),
          visitors: row.visitors ?? 0,
          pageviews: row.pageviews ?? 0,
        };
      }),
      devices: normalizeDevices(deviceRows),
      pages: pageRows.map((row) => {
        const path = row.requestPath ?? "/";

        return {
          path,
          label: pageLabel(path),
          visitors: row.visitors ?? 0,
          pageviews: row.pageviews ?? 0,
        };
      }),
    };
  } catch (error) {
    console.error(
      "VANMOTION_ANALYTICS_LOAD_ERROR",
      error,
    );

    return emptyAnalytics;
  }
}
