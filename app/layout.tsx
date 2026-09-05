import type { Metadata } from "next";
import type { ReactNode } from "react";

import PublicAnalytics from "@/app/components/analytics/PublicAnalytics";
import LanguageSwitcher from "@/app/components/language/LanguageSwitcher";
import RouteAwareMusicPlayer from "@/app/components/layout/RouteAwareMusicPlayer";
import GlobalMusicPlayer from "@/app/components/music/GlobalMusicPlayer";
import MusicPlayerProvider from "@/app/components/music/MusicPlayerContext";
import { getCurrentLanguage } from "@/app/lib/language";
import {
  getPublicMusicRecommendations,
  getPublicMusicTracks,
} from "@/app/lib/music-library";

import "./globals.css";

export const dynamic = "force-dynamic";

const siteUrl = "https://www.vanmotion.es";

const metadataTranslations = {
  es: {
    title: "VANMOTION | Automotive Culture · Madrid",
    description:
      "VANMOTION es un proyecto independiente de cultura automotriz nacido en Madrid: vehículos, música, diseño y ropa urbana bajo una misma identidad.",
    openGraphDescription:
      "Vehículos seleccionados, ropa urbana y música con identidad propia desde Madrid.",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    languageTag: "es-ES",
  },

  en: {
    title: "VANMOTION | Automotive Culture · Cars, Music & Streetwear",
    description:
      "VANMOTION is an independent automotive culture project from Madrid, bringing together cars, original music, design and streetwear under one identity.",
    openGraphDescription:
      "Cars, music, design and street culture from Madrid. Built under one independent identity.",
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
  const [language, tracks, recommendations] =
    await Promise.all([
      getCurrentLanguage(),
      getPublicMusicTracks(),
      getPublicMusicRecommendations(),
    ]);
  const content = metadataTranslations[language];

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "VANMOTION",
    alternateName: [
      "VANMOTION Madrid",
      "VANMOTION Automotive Culture",
    ],
    url: siteUrl,
    inLanguage: content.languageTag,
    description: content.description,

    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "VANMOTION",
      alternateName: [
        "VANMOTION Madrid",
        "VANMOTION Automotive Culture",
      ],
      url: siteUrl,

      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/vanmotion-mark.webp`,
      },

      sameAs: [
        "https://www.instagram.com/vanmotion_madrid/",
        "https://www.tiktok.com/@www.vanmotion.es",
        "https://www.youtube.com/@vanmotionoficial",
      ],

      address: {
        "@type": "PostalAddress",
        addressLocality: "Madrid",
        addressCountry: "ES",
      },

      brand: {
        "@type": "Brand",
        name: "VANMOTION",
      },

      knowsAbout: [
        "Vehículos seleccionados",
        "Automoción",
        "Cultura del motor",
        "Automotive culture",
        "Ropa urbana",
        "Streetwear",
        "Música independiente",
        "Digital experiences",
        "Visual storytelling",
      ],

      award: [
        "WD Awards Nominee 2026 — VANMOTION Automotive Culture",
        "CSS Nectar Site of the Day 2026 — VANMOTION Cars · Music · Clothing",
        "CSS Winner — VANMOTION Cars · Music · Clothing",
        "CSS Design Awards Nominee 2026 — VANMOTION",
        "WebsiteAwards.es Nominee 2026 — VANMOTION · E-commerce",
      ],

      subjectOf: [
        {
          "@type": "CreativeWork",
          name: "VANMOTION — Automotive Culture",
          url: "https://wdawards.com/web/vanmotion-automotive-culture",
        },
        {
          "@type": "CreativeWork",
          name: "VANMOTION — Cars · Music · Clothing",
          url: "https://cssnectar.com/css-gallery-inspiration/vanmotion-cars-%c2%b7-music-%c2%b7-clothing/",
        },
        {
          "@type": "CreativeWork",
          name: "VANMOTION — Cars · Music · Clothing",
          url: "https://www.csswinner.com/details/vanmotion-cars-music-clothing/19355",
        },
        {
          "@type": "CreativeWork",
          name: "VANMOTION — CSS Design Awards Nominee 2026",
          url: "https://www.cssdesignawards.com/sites/vanmotion/50065/",
        },
      ],
    },
  };


  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "VANMOTION",
    alternateName: [
      "VANMOTION Madrid",
      "VANMOTION Automotive Culture",
    ],
    image: `${siteUrl}/brand/vanmotion-mark.webp`,
    url: siteUrl,
    description:
      language === "es"
        ? "VANMOTION es un proyecto independiente de Automotive Culture nacido en Madrid que une vehículos seleccionados, música original y ropa urbana."
        : "VANMOTION is an independent Automotive Culture project from Madrid combining selected vehicles, original music and streetwear.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
    areaServed: {
      "@type": "City",
      name: "Madrid",
    },
    brand: {
      "@type": "Brand",
      name: "VANMOTION",
    },
    sameAs: [
      "https://www.instagram.com/vanmotion_madrid",
      "https://www.youtube.com/@vanmotionoficial",
      "https://www.tiktok.com/@www.vanmotion.es",
    ],
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />

        <MusicPlayerProvider tracks={tracks}>
          {children}

          <LanguageSwitcher currentLanguage={language} />

          <RouteAwareMusicPlayer>
            <GlobalMusicPlayer
              language={language}
              recommendations={recommendations}
            />
          </RouteAwareMusicPlayer>

          <PublicAnalytics />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
