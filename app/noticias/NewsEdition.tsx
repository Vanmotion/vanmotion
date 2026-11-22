/* eslint-disable @next/next/no-img-element -- Raw img is intentional here for dynamic/external/preview media. */
"use client";

import { useEffect, useState } from "react";
import type { getPublishedNews } from "@/app/lib/news";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import NewsBrand from "./NewsBrand";
import NewsCarousel from "./NewsCarousel";
import styles from "./noticias.module.css";

type Article = Awaited<ReturnType<typeof getPublishedNews>>[number];
type Language = "es" | "en";
type Region = "ES" | "NY";

const labels = {
  es: { edition: "EDICIÓN", updated: "Actualizado", empty: "La selección se está preparando.",
    categories: { vehicles: "VEHÍCULOS", music: "MÚSICA", street: "ROPA / STREET" }, read: "LEER FUENTE" },
  en: { edition: "EDITION", updated: "Updated", empty: "This selection is being prepared.",
    categories: { vehicles: "VEHICLES", music: "MUSIC", street: "STREET / FASHION" }, read: "READ SOURCE" },
} as const;

function formatDate(date: Date, language: Language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

function Edition({ region, language, articles }: { region: Region; language: Language; articles: Article[] }) {
  const copy = labels[language];
  const regionName = region === "NY" ? "NEW YORK" : language === "es" ? "ESPAÑA" : "SPAIN";
  return (
    <section className={styles.edition} aria-labelledby={`${region}-edition`}>
      <div className={styles.editionHeader}>
        <div><p className={styles.eyebrow}>{copy.edition}</p><h2 id={`${region}-edition`}>{regionName}</h2></div>
        <p className={styles.updated}>{copy.updated} · {new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</p>
      </div>
      <div className={styles.sections}>
        {(["vehicles", "music", "street"] as const).map((category) => {
          const categoryArticles = articles.filter((article) => article.category === category).slice(0, 3);
          return <section className={styles.category} key={category} aria-labelledby={`${region}-${category}`}>
            <div className={styles.categoryHeader}><h3 id={`${region}-${category}`}>{copy.categories[category]}</h3><span>{String(categoryArticles.length).padStart(2, "0")}</span></div>
            {/* VANMOTION_MOBILE_EDITORIAL_MOTION_V1 */}
            <NewsCarousel label={copy.categories[category]} language={language} count={categoryArticles.length}>
              {categoryArticles.length === 0 ? <p className={styles.empty}>{copy.empty}</p> : categoryArticles.map((article) => {
                const translated = article.locale !== language;
                const title = (translated ? article.translatedTitle : article.title) || article.title;
                const summary = (translated ? article.translatedSummary : article.summary) || article.summary;
                return <article className={styles.card} key={article.id}>
                  {article.imageUrl ? <div className={styles.imageFrame}><img src={article.imageUrl} alt="" loading="lazy" /></div> : null}
                  <div className={styles.cardBody}>
                    <p className={styles.cardCategory}>{copy.categories[category]}</p>
                    <h4>{title}</h4>
                    <p className={styles.summary}>{summary}</p>
                    <div className={styles.meta}><span>{article.source}</span><time dateTime={new Date(article.publishedAt).toISOString()}>{formatDate(article.publishedAt, language)}</time></div>
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>{copy.read}<span aria-hidden="true">↗</span></a>
                  </div>
                </article>;
              })}
            </NewsCarousel>
          </section>;
        })}
      </div>
    </section>
  );
}

export default function NewsEdition({ spain, newYork }: { spain: Article[]; newYork: Article[] }) {
  const { language } = useLanguage();
  const [edition, setEdition] = useState<Region>("ES");
  useEffect(() => {
    try {
      const previous = window.sessionStorage.getItem("vanmotion:news-edition");
      if (previous === "NY" || previous === "ES") setEdition(previous);
    } catch { /* La navegación sigue funcionando sin sessionStorage. */ }
  }, []);

  function changeEdition(region: Region) {
    setEdition(region);
    try { window.sessionStorage.setItem("vanmotion:news-edition", region); } catch { /* sin persistencia */ }
  }

  return <>
    {/* VANMOTION_NEWS_BRAND_SAME_AS_HOME_V2: mismo emblema y animación de portada */}
    <div className={styles.brandBar}>
      <NewsBrand />
    </div>
    <header className={styles.header}>
      <p className={styles.kicker}>VANMOTION / EDITORIAL</p>
      <h1>{language === "en" ? "NEWS" : "NOTICIAS"}</h1>
      <p className={styles.intro}>{language === "en" ? "A look at what is happening right now." : "Una mirada a lo que está pasando ahora."}</p>
    </header>
    <div className={styles.switcher} role="tablist" aria-label={language === "es" ? "Edición de noticias" : "News edition"}>
      <button type="button" role="tab" aria-selected={edition === "ES"} className={edition === "ES" ? styles.selected : ""} onClick={() => changeEdition("ES")}>{language === "es" ? "ESPAÑA" : "SPAIN"}</button>
      <button type="button" role="tab" aria-selected={edition === "NY"} className={edition === "NY" ? styles.selected : ""} onClick={() => changeEdition("NY")}>NEW YORK</button>
    </div>
    <Edition key={edition} region={edition} language={language} articles={edition === "ES" ? spain : newYork} />
  </>;
}
