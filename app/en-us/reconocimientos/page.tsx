import type { Metadata } from "next";

import { ReconocimientosContent } from "@/app/reconocimientos/page";

const siteUrl = "https://www.vanmotion.es";
const pageUrl = `${siteUrl}/en-us/reconocimientos`;
const title = "Awards | VANMOTION Automotive Culture";
const description =
  "Digital recognition for VANMOTION from CSS Design Awards, WD Awards, CSS Nectar, CSS Winner and WebsiteAwards.es. An automotive culture, music and streetwear project born in Madrid.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "VANMOTION awards",
    "Awwwards",
    "Awwwards Nominee 2026",
    "CSS Design Awards",
    "Special Kudos",
    "Best UI Design",
    "Best UX Design",
    "Best Innovation",
    "WD Awards",
    "CSS Nectar",
    "CSS Winner",
    "automotive culture",
    "digital experience",
  ],
  alternates: {
    canonical: pageUrl,
    languages: {
      "es-ES": `${siteUrl}/reconocimientos`,
      "en-US": pageUrl,
      "x-default": `${siteUrl}/reconocimientos`,
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pageUrl,
    locale: "en_US",
    alternateLocale: ["es_ES"],
    images: [
      {
        url: "/reconocimientos/css-design-awards-2026.png",
        alt: "VANMOTION CSS Design Awards 2026 recognition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/reconocimientos/css-design-awards-2026.png"],
  },
};

export default function EnglishAwardsPage() {
  return <ReconocimientosContent englishRoute />;
}
