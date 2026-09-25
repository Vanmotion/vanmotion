import { Seasons } from "astronomy-engine";
import { sceneImage } from "./madrid-weather";
import { seasonalExperienceAssetExists } from "./seasonal-experience-assets";

import type {
  Atmosphere,
  ClimateSection,
  Period,
} from "./madrid-weather";

export type Season = "spring" | "summer" | "autumn" | "winter";

const SEASONS = new Set<Season>([
  "spring",
  "summer",
  "autumn",
  "winter",
]);

export function getMadridSeason(date = new Date()): Season {
  const year = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      year: "numeric",
    }).format(date)
  );

  const events = Seasons(year);
  const now = date.getTime();

  if (now >= events.dec_solstice.date.getTime()) return "winter";
  if (now >= events.sep_equinox.date.getTime()) return "autumn";
  if (now >= events.jun_solstice.date.getTime()) return "summer";
  if (now >= events.mar_equinox.date.getTime()) return "spring";

  return "winter";
}

export function getSeasonOverride(search: string): Season | null {
  const value = new URLSearchParams(search).get("season");
  return SEASONS.has(value as Season) ? (value as Season) : null;
}

export function seasonalSceneImage({
  section,
  period,
  atmosphere,
  season,
  hasAsset = seasonalExperienceAssetExists,
  enabled = true,
}: {
  section: ClimateSection;
  period: Period;
  atmosphere: Atmosphere;
  season: Season;
  hasAsset?: (path: string) => boolean;
  enabled?: boolean;
}): string {
  const original = sceneImage(section, period, atmosphere);

  if (!enabled) return original;

  /*
   * 1. ESTACIÓN + METEOROLOGÍA + MOMENTO DEL DÍA.
   *
   * Ejemplo:
   * /experience/music/autumn/cloudy/dia.webp
   */
  if (atmosphere !== "clear") {
    const exactSeasonWeather =
      `/experience/${section}/${season}/${atmosphere}/${period}.webp`;

    if (hasAsset(exactSeasonWeather)) {
      return exactSeasonWeather;
    }

    /*
     * Por la mañana algunas colecciones meteorológicas estacionales
     * solo disponen de "dia.webp".
     *
     * Preferimos conservar ESTACIÓN + CLIMA antes que caer
     * en una imagen meteorológica genérica de otra estación.
     */
    if (period === "manana") {
      const seasonWeatherDay =
        `/experience/${section}/${season}/${atmosphere}/dia.webp`;

      if (hasAsset(seasonWeatherDay)) {
        return seasonWeatherDay;
      }
    }
  }

  /*
   * 2. ESTACIÓN + MOMENTO DEL DÍA.
   *
   * Ejemplo:
   * /experience/vehicles/autumn/manana.webp
   */
  const exactSeason =
    `/experience/${section}/${season}/${period}.webp`;

  if (hasAsset(exactSeason)) {
    return exactSeason;
  }

  /*
   * 3. Si por la mañana tampoco existe una variante horaria
   * estacional, usamos la base diurna de esa estación.
   */
  if (period === "manana") {
    const seasonDay =
      `/experience/${section}/${season}/dia.webp`;

    if (hasAsset(seasonDay)) {
      return seasonDay;
    }
  }

  /*
   * 4. Invierno conserva el comportamiento anterior:
   * con cielo despejado utiliza la colección de nieve existente
   * si no hay una colección invernal específica.
   */
  if (season === "winter" && atmosphere === "clear") {
    return sceneImage(section, period, "snow");
  }

  /*
   * 5. Último fallback: meteorología original.
   * Nunca inventamos una ruta que no exista.
   */
  return original;
}
