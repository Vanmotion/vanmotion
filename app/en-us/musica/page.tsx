import type { Metadata } from "next";

import MusicPage from "@/app/musica/page";

const siteUrl = "https://www.vanmotion.es";
const pageUrl = `${siteUrl}/en-us/musica`;
const title = "Original music and music production from Madrid";
const description =
  "Original music and music production by VANMOTION in Madrid. Listen to official tracks, studio sessions and new releases.";
const image = "/musica/editorial/vanmotion-portada-musica.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pageUrl,
    languages: {
      "es-ES": `${siteUrl}/musica`,
      "en-US": pageUrl,
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
        url: image,
        alt: "Original music and music production by VANMOTION",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default function EnglishMusicPage() {
  return <MusicPage />;
}
