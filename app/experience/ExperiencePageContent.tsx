import type { Metadata } from "next";
import { getCurrentLanguage } from "@/app/lib/language";
import { getExperienceEnvironment } from "@/app/lib/experience-section-image";
import ExperienceClient from "./ExperienceClient";
import { getMadridSeason, seasonalSceneImage } from "@/app/lib/madrid-seasons";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();

  const title =
    language === "es"
      ? "VANMOTION Experience | Cultura automotriz, música y streetwear"
      : "VANMOTION Experience | Automotive culture, music and streetwear";

  const description =
    language === "es"
      ? "VANMOTION Experience conecta cultura automotriz, música, streetwear y el entorno de Madrid en una experiencia digital."
      : "VANMOTION Experience connects automotive culture, music, streetwear and the Madrid environment in a digital experience.";

  return {
    title,
    description,
    alternates: {
      canonical: "/experience",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/experience",
    },
  };
}

export default async function ExperiencePage() {
  const language = await getCurrentLanguage();

  const environment = await getExperienceEnvironment();

  const initialVehicleImage = seasonalSceneImage({
    section: "vehicles",
    period: environment.period,
    atmosphere: environment.weather.atmosphere,
    season: getMadridSeason(),
    enabled: true,
  });

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={initialVehicleImage}
        fetchPriority="high"
      />

      <ExperienceClient
        language={language}
        initialPeriod={environment.period}
        initialWeather={environment.weather}
      />
    </>
  );
}
