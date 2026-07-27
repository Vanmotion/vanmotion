import type { Metadata } from "next";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./proximamente.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/proximamente";

const translations = {
  es: {
    metadataTitle: "Próximamente | VANMOTION",
    metadataDescription:
      "VANMOTION reúne vehículos, música y ropa con identidad propia. Apertura oficial en Madrid el 1 de septiembre de 2026.",

    socialTitle:
      "VANMOTION · Apertura el 1 de septiembre de 2026",

    brandCaption:
      "VEHÍCULOS · MÚSICA · ROPA",

    eyebrow:
      "Proyecto independiente en desarrollo",

    titleFirst:
      "TRABAJO REAL.",

    titleSecond:
      "MOVIMIENTO REAL.",

    introduction:
      "Estamos construyendo VANMOTION desde Madrid: vehículos con historia, música con verdad y ropa con identidad propia. Sin atajos y sin aparentar.",

    openingLabel:
      "Apertura oficial",

    openingDate:
      "1 de septiembre de 2026",

    status:
      "Seguimos trabajando.",

    progressLabel:
      "Proyecto en marcha",

    contact:
      "Contacto",

    location:
      "Mejorada del Campo · Madrid",

    pillars: [
      {
        number: "01",
        title: "Vehículos",
        text:
          "Selección, preparación y venta con información clara y fotografías reales.",
      },
      {
        number: "02",
        title: "Música",
        text:
          "Producción musical construida desde el trabajo, la experiencia y la verdad.",
      },
      {
        number: "03",
        title: "Ropa",
        text:
          "Diseños limitados con mensaje, personalidad y una identidad reconocible.",
      },
    ],
  },

  en: {
    metadataTitle: "Coming soon | VANMOTION",
    metadataDescription:
      "VANMOTION brings together vehicles, music and clothing with its own identity. Official opening in Madrid on September 1, 2026.",

    socialTitle:
      "VANMOTION · Opening September 1, 2026",

    brandCaption:
      "VEHICLES · MUSIC · CLOTHING",

    eyebrow:
      "Independent project in development",

    titleFirst:
      "REAL WORK.",

    titleSecond:
      "REAL MOVEMENT.",

    introduction:
      "We are building VANMOTION from Madrid: vehicles with history, music with truth and clothing with its own identity. No shortcuts and no pretending.",

    openingLabel:
      "Official opening",

    openingDate:
      "September 1, 2026",

    status:
      "The work continues.",

    progressLabel:
      "Project in motion",

    contact:
      "Contact",

    location:
      "Mejorada del Campo · Madrid",

    pillars: [
      {
        number: "01",
        title: "Vehicles",
        text:
          "Selection, preparation and sales with clear information and real photographs.",
      },
      {
        number: "02",
        title: "Music",
        text:
          "Music production built through work, experience and truth.",
      },
      {
        number: "03",
        title: "Clothing",
        text:
          "Limited designs with meaning, personality and a recognisable identity.",
      },
    ],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return {
    title:
      content.metadataTitle,

    description:
      content.metadataDescription,

    alternates: {
      canonical:
        CANONICAL_URL,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "website",
      url: CANONICAL_URL,
      siteName: "VANMOTION",

      locale:
        language === "es"
          ? "es_ES"
          : "en_US",

      title:
        content.socialTitle,

      description:
        content.metadataDescription,
    },

    twitter: {
      card: "summary",
      title:
        content.socialTitle,
      description:
        content.metadataDescription,
    },
  };
}

export default async function ComingSoonPage() {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return (
    <main className={styles.page}>
      <div
        className={styles.texture}
        aria-hidden="true"
      />

      <div
        className={styles.glow}
        aria-hidden="true"
      />

      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <p className={styles.brand}>
            VANMOTION
          </p>

          <p className={styles.brandCaption}>
            {content.brandCaption}
          </p>
        </div>

        <div className={styles.headerStatus}>
          <span
            className={styles.statusDot}
            aria-hidden="true"
          />

          <p>
            {content.progressLabel}
          </p>
        </div>

        <p className={styles.location}>
          {content.location}
        </p>
      </header>

      <section className={styles.hero}>
        <div className={styles.mainContent}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              {content.eyebrow}
            </p>

            <h1 className={styles.title}>
              <span>
                {content.titleFirst}
              </span>

              <span>
                {content.titleSecond}
              </span>
            </h1>

            <p className={styles.introduction}>
              {content.introduction}
            </p>
          </div>

          <div className={styles.pillars}>
            {content.pillars.map(
              (pillar) => (
                <article
                  className={styles.pillar}
                  key={pillar.number}
                >
                  <span
                    className={
                      styles.pillarNumber
                    }
                  >
                    {pillar.number}
                  </span>

                  <h2>
                    {pillar.title}
                  </h2>

                  <p>
                    {pillar.text}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>

        <aside className={styles.openingCard}>
          <div className={styles.cardTop}>
            <p>
              {content.openingLabel}
            </p>

            <span>2026</span>
          </div>

          <strong>
            <time dateTime="2026-09-01">
              {content.openingDate}
            </time>
          </strong>

          <div className={styles.brandGraphic}>
            <span>REAL</span>
            <span>MOTION</span>
          </div>

          <div className={styles.rule} />

          <div className={styles.cardStatus}>
            <span
              className={styles.statusDot}
              aria-hidden="true"
            />

            <p>
              {content.status}
            </p>
          </div>
        </aside>
      </section>

      <footer className={styles.footer}>
        <a href="mailto:vanmotion@hotmail.com">
          {content.contact}
          <span> · </span>
          vanmotion@hotmail.com
        </a>

        <p>
          {content.location}
        </p>

        <p>
          © 2026 VANMOTION
        </p>
      </footer>
    </main>
  );
}