import type { Metadata } from "next";
import type { ReactNode } from "react";

import LanguageSwitcher from "@/app/components/language/LanguageSwitcher";
import GlobalMusicPlayerServer from "@/app/components/music/GlobalMusicPlayerServer";
import { getCurrentLanguage } from "@/app/lib/language";

import "./globals.css";

export const dynamic = "force-dynamic";

const metadataTranslations = {
  es: {
    description:
      "Vehículos, música, diseño y proyectos con identidad. Trabajo real y movimiento real.",
    openGraphDescription:
      "Vehículos, música, diseño y proyectos con identidad.",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },

  en: {
    description:
      "Vehicles, music, design and projects with identity. Real work and real movement.",
    openGraphDescription:
      "Vehicles, music, design and projects with identity.",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = metadataTranslations[language];

  return {
    title: {
      default: "VANMOTION",
      template: "%s | VANMOTION",
    },

    description: content.description,

    keywords: [
      "VANMOTION",
      "vehículos",
      "vehicles",
      "música",
      "music",
      "diseño",
      "design",
      "Madrid",
      "Mejorada del Campo",
    ],

    authors: [
      {
        name: "VANMOTION",
      },
    ],

    creator: "VANMOTION",
    publisher: "VANMOTION",

    openGraph: {
      title: "VANMOTION",
      description: content.openGraphDescription,
      type: "website",
      locale: content.locale,
      alternateLocale: [...content.alternateLocale],
      siteName: "VANMOTION",
    },
  };
}

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const language = await getCurrentLanguage();

  return (
    <html lang={language}>
      <body>
        {children}

        <LanguageSwitcher currentLanguage={language} />

        <GlobalMusicPlayerServer />
      </body>
    </html>
  );
}
