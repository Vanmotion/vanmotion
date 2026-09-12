import { sceneImage } from "./madrid-weather";
import type {
  Atmosphere,
  ClimateSection,
  Period,
} from "./madrid-weather";
import type { Season } from "./madrid-seasons";

/**
 * Otoño: bases originales y variantes meteorológicas verificadas de día.
 * Los otros períodos y estaciones mantienen sus imágenes anteriores.
 * La selección estacional se limita a los assets aprobados disponibles.
 */
export function autumnExperienceImage(
  section: ClimateSection,
  period: Period,
  atmosphere: Atmosphere,
  season: Season,
  enabled: boolean
): string {
  const original = sceneImage(section, period, atmosphere);

  if (!enabled) return original;

  if (season === "winter" && atmosphere === "clear") {
    return sceneImage(section, period, "snow");
  }

  if (season !== "autumn") return original;

  if (atmosphere === "clear") {
    return sceneImage(section, period, "autumn");
  }

  if (
    period === "dia" &&
    (atmosphere === "cloudy" ||
      atmosphere === "rain" ||
      atmosphere === "snow")
  ) {
    return `/experience/${section}/autumn/${atmosphere}/dia.webp`;
  }

  return original;
}
