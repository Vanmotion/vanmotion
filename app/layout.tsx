import type { Metadata } from "next";
import type { ReactNode } from "react";

import PublicAnalytics from "@/app/components/analytics/PublicAnalytics";
import LanguageSwitcher from "@/app/components/language/LanguageSwitcher";
import RouteAwareMusicPlayer from "@/app/components/layout/RouteAwareMusicPlayer";
import GlobalMusicPlayer from "@/app/components/music/GlobalMusicPlayer";
import MusicPlayerProvider from "@/app/components/music/MusicPlayerContext";
import { getCurrentLanguage } from "@/app/lib/language";
import { getPublicMusicTracks } from "@/app/lib/music-library";

import "./globals.css";

export const dynamic = "force-dynamic";

const siteUrl = "https://www.vanmotion.es";

const metadataTranslations = {
  es: {
    title: "VANMOTION | Vehículos, ropa y música en Madrid",
    description:
      "VANMOTION une vehículos seleccionados, ropa urbana y música con identidad propia desde Madrid. Trabajo real, humildad y movimiento.",
    openGraphDescription:
      "Vehículos seleccionados, ropa urbana y música con identidad propia desde Madrid.",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    languageTag: "es-ES",
  },

  en: {
    title: "VANMOTION | Vehicles, clothing and music from Madrid",
    description:
      "VANMOTION brings together selected vehicles, urban clothing and original music from Madrid. Real work, humility and movement.",
    openGraphDescription:
      "Selected vehicles, urban clothing and original music with identity from Madrid.",
    locale: "en_US",
    alternateLocale: ["es_ES"],
    languageTag: "en-US",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = metadataTranslations[language];

  return {
    metadataBase: new URL(siteUrl),

    applicationName: "VANMOTION",

    title: {
      default: content.title,
      template: "%s | VANMOTION",
    },

    description: content.description,

    authors: [
      {
        name: "VANMOTION",
        url: siteUrl,
      },
    ],

    creator: "VANMOTION",
    publisher: "VANMOTION",

    category: "Automoción, moda y música",

    referrer: "origin-when-cross-origin",

    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: content.title,
      description: content.openGraphDescription,
      type: "website",
      locale: content.locale,
      alternateLocale: [...content.alternateLocale],
      siteName: "VANMOTION",
    },

    twitter: {
      card: "summary",
      title: content.title,
      description: content.openGraphDescription,
    },
  };
}

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const [language, tracks] = await Promise.all([
    getCurrentLanguage(),
    getPublicMusicTracks(),
  ]);
  const content = metadataTranslations[language];

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VANMOTION",
    alternateName: "Vanmotion",
    url: siteUrl,
    inLanguage: content.languageTag,
    description: content.description,
    publisher: {
      "@type": "Organization",
      name: "VANMOTION",
      url: siteUrl,
    },
  };

  return (
    <html lang={language}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />

        <MusicPlayerProvider tracks={tracks}>
          {children}

          <LanguageSwitcher currentLanguage={language} />

          <RouteAwareMusicPlayer>
            <GlobalMusicPlayer language={language} />
          </RouteAwareMusicPlayer>

          <PublicAnalytics />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
