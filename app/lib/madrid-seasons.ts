import { Seasons } from "astronomy-engine";
import { sceneImage } from "./madrid-weather";
import type {
  Atmosphere,
  ClimateSection,
  Period,
} from "./madrid-weather";

export type Season = "spring" | "summer" | "autumn" | "winter";

const SEASONS = new Set<Season>([
  "spring", "summer", "autumn", "winter",
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
  return SEASONS.has(value as Season) ? value as Season : null;
}

export function seasonalSceneImage({
  section,
  period,
  atmosphere,
  season,
  hasAsset,
}: {
  section: ClimateSection;
  period: Period;
  atmosphere: Atmosphere;
  season: Season;
  hasAsset: (path: string) => boolean;
}): string {
  const original = sceneImage(section, period, atmosphere);

  // La meteorología observada tiene prioridad sobre la estación.
  if (atmosphere !== "clear") return original;

  // Invierno reutiliza las fotos originales de nieve; no crea una
  // colección invernal adicional.
  if (season === "winter") return sceneImage(section, period, "snow");

  // Primavera permanece en su selección original y verano usa las bases.
  if (season !== "autumn") return original;

  const seasonal = `/experience/${section}/${season}/${period}.webp`;

  // No se permite seleccionar una imagen que no esté disponible.
  return hasAsset(seasonal) ? seasonal : original;
}
