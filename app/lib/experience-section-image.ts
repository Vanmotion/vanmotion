import { getMadridPeriod, sceneImage, type Atmosphere, type Period, type ClimateSection, type WeatherState } from "@/app/lib/madrid-weather";
import { getMadridWeather } from "@/app/lib/madrid-atmosphere";

export async function getExperienceEnvironment(): Promise<{
  period: Period;
  atmosphere: Atmosphere;
  weather: WeatherState;
}> {
  const period = getMadridPeriod();
  const weather = await getMadridWeather();
  return { period, atmosphere: weather.atmosphere, weather };
}

export async function getExperienceSectionImage(section: ClimateSection): Promise<string> {
  const { period, atmosphere } = await getExperienceEnvironment();
  return sceneImage(section, period, atmosphere);
}
