"use client";

import { useState } from "react";

import type { getPublishedNews } from "@/app/lib/news";

import styles from "./noticias.module.css";

type Article = Awaited<ReturnType<typeof getPublishedNews>>[number];

const labels = {
  es: { region: "ESPAÑA", updated: "Actualizado", categories: { vehicles: "VEHÍCULOS", music: "MÚSICA", street: "ROPA / STREET" }, read: "LEER FUENTE" },
  en: { region: "NEW YORK", updated: "Updated", categories: { vehicles: "VEHICLES", music: "MUSIC", street: "STREET / FASHION" }, read: "READ SOURCE" },
} as const;

function formatDate(date: Date, locale: "es" | "en") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

function Edition({ locale, articles }: { locale: "es" | "en"; articles: Article[] }) {
  const copy = labels[locale];
  return (
    <section className={styles.edition} aria-labelledby={`${locale}-edition`}>
      <div className={styles.editionHeader}>
        <div><p className={styles.eyebrow}>EDICIÓN</p><h2 id={`${locale}-edition`}>{copy.region}</h2></div>
        <p className={styles.updated}>{copy.updated} · {new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</p>
      </div>
      <div className={styles.sections}>
        {(["vehicles", "music", "street"] as const).map((category) => {
          const categoryArticles = articles.filter((article) => article.category === category).slice(0, 3);
          return <section className={styles.category} key={category} aria-labelledby={`${locale}-${category}`}>
            <div className={styles.categoryHeader}><h3 id={`${locale}-${category}`}>{copy.categories[category]}</h3><span>{String(categoryArticles.length).padStart(2, "0")}</span></div>
            <div className={styles.grid}>
              {categoryArticles.length === 0 ? <p className={styles.empty}>{locale === "es" ? "La selección se está preparando." : "This selection is being prepared."}</p> : categoryArticles.map((article) => (
                <article className={styles.card} key={article.id}>
                  {article.imageUrl ? <div className={styles.imageFrame}><img src={article.imageUrl} alt="" loading="lazy" /></div> : null}
                  <div className={styles.cardBody}>
                    <p className={styles.cardCategory}>{copy.categories[category]}</p>
                    <h4>{article.title}</h4>
                    <p className={styles.summary}>{article.summary}</p>
                    <div className={styles.meta}><span>{article.source}</span><time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt, locale)}</time></div>
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>{copy.read}<span aria-hidden="true">↗</span></a>
                  </div>
                </article>
              ))}
            </div>
          </section>;
        })}
      </div>
    </section>
  );
}

export default function NewsEdition({ spain, newYork }: { spain: Article[]; newYork: Article[] }) {
  const [edition, setEdition] = useState<"es" | "en">("es");
  return <>
    <div className={styles.switcher} role="tablist" aria-label="News edition">
      <button type="button" role="tab" aria-selected={edition === "es"} className={edition === "es" ? styles.selected : ""} onClick={() => setEdition("es")}>ESPAÑA</button>
      <button type="button" role="tab" aria-selected={edition === "en"} className={edition === "en" ? styles.selected : ""} onClick={() => setEdition("en")}>NEW YORK</button>
    </div>
    <Edition key={edition} locale={edition} articles={edition === "es" ? spain : newYork} />
  </>;
}