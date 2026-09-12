import {
  fetchMadridWeather,
  getMadridPeriod,
  sceneImage,
  type ClimateSection,
  type WeatherState,
} from "@/app/lib/madrid-weather";

export type { ClimateSection } from "@/app/lib/madrid-weather";
export type MadridAtmosphere = WeatherState["atmosphere"];

export async function getMadridWeather(): Promise<WeatherState> {
  return fetchMadridWeather({ next: { revalidate: 300 } });
}

export async function getMadridAtmosphere(): Promise<MadridAtmosphere> {
  return (await getMadridWeather()).atmosphere;
}

export async function getMadridSectionHeroImage(section: ClimateSection): Promise<string> {
  const period = getMadridPeriod();
  const atmosphere = await getMadridAtmosphere();
  return sceneImage(section, period, atmosphere);
}
