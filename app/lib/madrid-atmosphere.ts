import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  fetchMadridWeather,
  getMadridPeriod,
  type ClimateSection,
  type WeatherState,
} from "@/app/lib/madrid-weather";

import {
  getMadridSeason,
  seasonalSceneImage,
} from "@/app/lib/madrid-seasons";

export type { ClimateSection } from "@/app/lib/madrid-weather";
export type MadridAtmosphere = WeatherState["atmosphere"];

export async function getMadridWeather(): Promise<WeatherState> {
  return fetchMadridWeather({ next: { revalidate: 300 } });
}

export async function getMadridAtmosphere(): Promise<MadridAtmosphere> {
  return (await getMadridWeather()).atmosphere;
}

function publicAssetExists(assetPath: string): boolean {
  return existsSync(
    join(process.cwd(), "public", assetPath.replace(/^\//, ""))
  );
}

export async function getMadridSectionHeroImage(
  section: ClimateSection
): Promise<string> {

  // VANMOTION_PREVIEW_START
  // Vista temporal: solo desarrollo local.
  if (
    process.env.NODE_ENV === "development" &&
    section === "music" &&
    process.env.VANMOTION_MUSIC_PREVIEW === "winter-manana"
  ) {
    return "/experience/music/winter/manana.webp";
  }
  // VANMOTION_PREVIEW_END
  const period = getMadridPeriod();
  const atmosphere = await getMadridAtmosphere();
  const season = getMadridSeason();

  return seasonalSceneImage({
    section,
    period,
    atmosphere,
    season,
    hasAsset: publicAssetExists,
  });
}
