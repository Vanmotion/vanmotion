import type { Metadata } from "next";

import { getCurrentLanguage } from "@/app/lib/language";
import { getPublishedNews } from "@/app/lib/news";

import NewsEdition from "./NewsEdition";
import styles from "./noticias.module.css";

const siteUrl = "https://www.vanmotion.es";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const english = language === "en";
  return {
    title: english ? "News · Vehicles, music and street culture | VANMOTION" : "Noticias · Vehículos, música y street culture | VANMOTION",
    description: english ? "A considered editorial selection of vehicles, music and street culture from New York." : "Una selección editorial de vehículos, música y cultura urbana desde España.",
    alternates: { canonical: `${siteUrl}/noticias` },
    openGraph: { title: english ? "News · Vehicles, music and street culture | VANMOTION" : "Noticias · Vehículos, música y street culture | VANMOTION", url: `${siteUrl}/noticias`, type: "website" },
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