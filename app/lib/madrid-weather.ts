/** Shared, browser-safe weather selection for VANMOTION. */
export type Period = "manana" | "dia" | "atardecer" | "noche";
export type Atmosphere = "clear" | "cloudy" | "autumn" | "rain" | "snow";
export type ClimateSection = "vehicles" | "music" | "streetwear";
export type WeatherState = {
  atmosphere: Atmosphere;
  source: "model" | "fallback" | "override";
  weatherCode: number | null;
  cloudCover: number | null;
  observedAt: string | null;
};

const CODES = new Set([0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);
const SNOW = new Set([71, 73, 75, 77, 85, 86]);
const RAIN = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
const CLOUDY = new Set([2, 3, 45, 48]);
const ATMOSPHERES = new Set<Atmosphere>(["clear", "cloudy", "autumn", "rain", "snow"]);
const URL = "https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=weather_code,cloud_cover,precipitation,rain,snowfall&timezone=Europe%2FMadrid&timeformat=unixtime";

export function getMadridPeriod(date = new Date()): Period {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", hour: "2-digit", hour12: false,
  }).format(date));
  if (hour >= 6 && hour < 12) return "manana";
  if (hour >= 12 && hour < 18) return "dia";
  if (hour >= 18 && hour < 21) return "atardecer";
  return "noche";
}

export function sceneImage(section: ClimateSection, period: Period, atmosphere: Atmosphere): string {
  if (atmosphere === "clear") return `/experience/${section}/${period}.webp`;
  return `/experience/${section}/${atmosphere}/${period}.webp`;
}

export function getWeatherOverride(search: string): Atmosphere | null {
  const value = new URLSearchParams(search).get("weather");
  return ATMOSPHERES.has(value as Atmosphere) ? value as Atmosphere : null;
}

export function fallbackWeather(): WeatherState {
  // Neutral artwork, not a claim that the sky is actually clear.
  return { atmosphere: "clear", source: "fallback", weatherCode: null, cloudCover: null, observedAt: null };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function precipitation(value: unknown): number | null {
  if (value === undefined || value === null) return 0;
  const n = number(value);
  return n !== null && n >= 0 ? n : null;
}

export function parseMadridWeather(raw: unknown, now = new Date()): WeatherState | null {
  const data = record(raw);
  const current = record(data?.current);
  const code = number(current?.weather_code);
  const timestamp = number(current?.time);
  if (!data || !current || code === null || !Number.isInteger(code) || !CODES.has(code) || timestamp === null) return null;
  if (data.timezone !== "Europe/Madrid") return null;
  // UNIX timestamps are UTC seconds. Never reinterpret them as local Madrid time.
  const age = now.getTime() - timestamp * 1000;
  if (!Number.isFinite(age) || age > 90 * 60_000 || age < -30 * 60_000) return null;
  const cover = current.cloud_cover == null ? null : number(current.cloud_cover);
  if (cover !== null && (cover < 0 || cover > 100)) return null;
  if (current.cloud_cover != null && cover === null) return null;
  const rain = precipitation(current.rain);
  const snow = precipitation(current.snowfall);
  const total = precipitation(current.precipitation);
  if (rain === null || snow === null || total === null) return null;

  let atmosphere: Atmosphere;
  if (snow > 0 || SNOW.has(code)) atmosphere = "snow";
  else if (rain > 0 || total > 0 || RAIN.has(code)) atmosphere = "rain";
  // A single cloudy artwork represents both partial and heavy cloud cover.
  // When present, actual model cloud cover refines the WMO code's broad category.
  else if (code === 45 || code === 48) atmosphere = "cloudy";
  else if (cover !== null) atmosphere = cover >= 80 ? "cloudy" : "clear";
  else atmosphere = CLOUDY.has(code) ? "cloudy" : "clear";
  return { atmosphere, source: "model", weatherCode: code, cloudCover: cover, observedAt: new Date(timestamp * 1000).toISOString() };
}

export async function fetchMadridWeather(init: RequestInit & { next?: { revalidate?: number } } = {}): Promise<WeatherState> {
  try {
    const response = await fetch(URL, { ...init, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return fallbackWeather();
    return parseMadridWeather(await response.json()) ?? fallbackWeather();
  } catch {
    return fallbackWeather();
  }
}
