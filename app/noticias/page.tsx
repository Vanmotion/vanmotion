import type { Metadata } from "next";

import { getCurrentLanguage } from "@/app/lib/language";
import { getPublishedNews } from "@/app/lib/news";

import NewsEdition from "./NewsEdition";
import styles from "./noticias.module.css";

const siteUrl = "https://www.vanmotion.es";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const english = language === "en";
  const title = english
    ? "News · Vehicles, music and street culture"
    : "Noticias · Vehículos, música y cultura urbana";
  const description = english
    ? "An editorial selection of vehicles, music and street culture from Spain and New York."
    : "Una selección editorial de vehículos, música y cultura urbana desde España y Nueva York.";
  const socialImage =
    `${siteUrl}/images/vanmotion-portada-principal.webp`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/noticias`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/noticias`,
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1672,
          height: 941,
          alt: "VANMOTION Automotive Culture",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [spain, newYork] = await Promise.all([
    getPublishedNews("es", "ES"),
    getPublishedNews("en", "NY"),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VANMOTION Noticias",
    url: `${siteUrl}/noticias`,
    isPartOf: { "@type": "WebSite", name: "VANMOTION", url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [...spain, ...newYork].map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: article.sourceUrl,
        name: article.title,
      })),
    },
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className={styles.header}>
        <p className={styles.kicker}>VANMOTION / EDITORIAL</p>
        <h1>NOTICIAS</h1>
        <p className={styles.intro}>Una mirada a lo que está pasando ahora.</p>
      </header>
      <NewsEdition spain={spain} newYork={newYork} />
    </main>
  );
}