import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";
import ExperienceClient from "./ExperienceClient";

export default async function ExperiencePage() {
  const language = await getCurrentLanguage();

  const settings = await prisma.siteSettings.findFirst({
    select: {
      instagram: true,
      tiktok: true,
      youtube: true,
    },
  });

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
    />
  );
}
