import type { Metadata } from "next";
import { getCurrentLanguage } from "@/app/lib/language";
import { ensurePublishedNewsTranslations, getPublishedNews } from "@/app/lib/news";
import NewsEdition from "./NewsEdition";
import styles from "./noticias.module.css";

const siteUrl = "https://www.vanmotion.es";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const english = language === "en";
  const title = english ? "News · Vehicles, music and street culture" : "Noticias · Vehículos, música y cultura urbana";
  const description = english
    ? "An editorial selection of vehicles, music and street culture from Spain and New York."
    : "Una selección editorial de vehículos, música y cultura urbana desde España y Nueva York.";
  const canonical = `${siteUrl}${english ? "/en-us/noticias" : "/noticias"}`;
  const socialImage = `${siteUrl}/images/vanmotion-portada-principal.webp`;
  return {
    title, description,
    alternates: {
      canonical,
      languages: { "es-ES": `${siteUrl}/noticias`, "en-US": `${siteUrl}/en-us/noticias` },
    },
    openGraph: { title, description, url: canonical, type: "website", images: [{ url: socialImage, width: 1672, height: 941, alt: "VANMOTION Automotive Culture" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [language, spain, newYork] = await Promise.all([
    getCurrentLanguage(), getPublishedNews("es", "ES"), getPublishedNews("en", "NY"),
  ]);
  // Traducciones pendientes: se generan al abrir la página y se guardan una sola vez.
  const ready = await ensurePublishedNewsTranslations([...spain, ...newYork]);
  const translatedSpain = ready.filter((article) => article.region === "ES");
  const translatedNewYork = ready.filter((article) => article.region === "NY");
  const english = language === "en";
  const pageUrl = `${siteUrl}${english ? "/en-us/noticias" : "/noticias"}`;
  const structuredData = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: english ? "VANMOTION News" : "VANMOTION Noticias",
    url: pageUrl,
    isPartOf: { "@type": "WebSite", name: "VANMOTION", url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ready.map((article, index) => ({
        "@type": "ListItem", position: index + 1,
        url: article.sourceUrl,
        name: article.locale === language ? article.title : (article.translatedTitle || article.title),
      })),
    },
  };
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <NewsEdition spain={translatedSpain} newYork={translatedNewYork} />
    </main>
  );
}
