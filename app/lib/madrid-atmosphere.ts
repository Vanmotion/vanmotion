import { getMadridLightPhase } from "@/app/lib/madrid-light";

export type MadridAtmosphere =
  | "clear"
  | "autumn"
  | "rain"
  | "snow";

export type ClimateSection =
  | "vehicles"
  | "music"
  | "streetwear";

type Period =
  | "manana"
  | "dia"
  | "atardecer"
  | "noche";

const SNOW_CODES = new Set([
  71, 73, 75, 77, 85, 86,
]);

const RAIN_CODES = new Set([
  51, 53, 55, 56, 57,
  61, 63, 65, 66, 67,
  80, 81, 82,
  95, 96, 99,
]);

function getMadridMonth() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Madrid",
      month: "numeric",
    }).format(new Date()),
  );
}

function getFallbackAtmosphere(): MadridAtmosphere {
  const month = getMadridMonth();

  return month >= 9 && month <= 11
    ? "autumn"
    : "clear";
}

function getPeriod(): Period {
  const phase = getMadridLightPhase();

  if (phase === "morning") return "manana";
  if (phase === "day") return "dia";
  if (phase === "sunset") return "atardecer";

  return "noche";
}

export async function getMadridAtmosphere():
  Promise<MadridAtmosphere> {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast" +
        "?latitude=40.4168" +
        "&longitude=-3.7038" +
        "&current=weather_code,precipitation,rain,snowfall" +
        "&timezone=Europe%2FMadrid",
      {
        next: {
          revalidate: 300,
        },
      },
    );

    if (!response.ok) {
      return getFallbackAtmosphere();
    }

    const data = (await response.json()) as {
      current?: {
        weather_code?: number;
        precipitation?: number;
        rain?: number;
        snowfall?: number;
      };
    };

    const current = data.current;

    const code = current?.weather_code ?? 0;
    const precipitation = current?.precipitation ?? 0;
    const rain = current?.rain ?? 0;
    const snowfall = current?.snowfall ?? 0;

    if (
      snowfall > 0 ||
      SNOW_CODES.has(code)
    ) {
      return "snow";
    }

    if (
      rain > 0 ||
      precipitation > 0 ||
      RAIN_CODES.has(code)
    ) {
      return "rain";
    }

    return getFallbackAtmosphere();
  } catch {
    return getFallbackAtmosphere();
  }
}

export async function getMadridSectionHeroImage(
  section: ClimateSection,
) {
  const period = getPeriod();
  const atmosphere = await getMadridAtmosphere();

  if (atmosphere === "clear") {
    return `/experience/${section}/${period}.webp`;
  }

  return `/experience/${section}/${atmosphere}/${period}.webp`;
}
