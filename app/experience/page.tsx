import type { Metadata } from "next";
import { getCurrentLanguage } from "@/app/lib/language";
import { getExperienceEnvironment } from "@/app/lib/experience-section-image";
import { prisma } from "@/app/lib/prisma";
import ExperienceClient from "./ExperienceClient";

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

  const [settings, environment] = await Promise.all([
    prisma.siteSettings.findFirst({
      select: {
        instagram: true,
        tiktok: true,
        youtube: true,
      },
    }),
    getExperienceEnvironment(),
  ]);

  const socials = [
    {
      label: "Instagram",
      handle: "@vanmotion_madrid",
      href: settings?.instagram,
    },
    {
      label: "TikTok",
      handle: "@www.vanmotion.es",
      href: settings?.tiktok,
    },
    {
      label: "YouTube",
      handle: "@vanmotionoficial",
      href: settings?.youtube,
    },
  ].filter(
    (social): social is {
      label: string;
      handle: string;
      href: string;
    } => Boolean(social.href),
  );

  return (
    <ExperienceClient
      language={language}
      socials={socials}
      initialPeriod={environment.period}
      initialWeather={environment.weather}
    />
  );
}
