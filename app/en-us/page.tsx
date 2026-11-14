import type { Metadata } from "next";

import ExperiencePageContent from "@/app/experience/ExperiencePageContent";

const siteUrl = "https://www.vanmotion.es";
const title =
  "VANMOTION | Automotive Culture — Cars, Music & Streetwear";
const description =
  "VANMOTION is an independent automotive culture project from Madrid, bringing together cars, original music, design, and streetwear under one identity.";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: `${siteUrl}/en-us`,
    languages: {
      "es-ES": siteUrl,
      "en-US": `${siteUrl}/en-us`,
      "x-default": siteUrl,
    },
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/en-us`,
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      `${siteUrl}/images/vanmotion-portada-principal.webp`,
    ],
  },
};

export default function EnglishUsHomePage() {
  return <ExperiencePageContent />;
}
