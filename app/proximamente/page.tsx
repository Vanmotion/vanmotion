import type { Metadata } from "next";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./proximamente.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/proximamente";

const translations = {
  es: {
    metadataTitle: "Próximamente",
    metadataDescription:
      "VANMOTION reúne vehículos, música y ropa con identidad propia. Apertura oficial en Madrid el 1 de septiembre de 2026.",
    socialTitle:
      "VANMOTION · Apertura el 1 de septiembre de 2026",
    brandCaption:
      "VEHÍCULOS · MÚSICA · ROPA",
    eyebrow: "Proyecto en desarrollo",
    titleFirst: "TRABAJO REAL.",
    titleSecond: "MOVIMIENTO REAL.",
    introduction:
      "Estamos construyendo VANMOTION: vehículos, música y ropa reunidos dentro de un proyecto con identidad propia.",
    openingLabel: "Apertura oficial",
    openingDate: "1 de septiembre de 2026",
    status: "Seguimos trabajando.",
    contact: "Contacto",
    location: "Madrid · España",
  },

  en: {
    metadataTitle: "Coming soon",
    metadataDescription:
      "VANMOTION brings together vehicles, music and clothing with its own identity. Official opening in Madrid on September 1, 2026.",
    socialTitle:
      "VANMOTION · Opening September 1, 2026",
    brandCaption:
      "VEHICLES · MUSIC · CLOTHING",
    eyebrow: "Project in development",
    titleFirst: "REAL WORK.",
    titleSecond: "REAL MOVEMENT.",
    introduction:
      "We are building VANMOTION: vehicles, music and clothing brought together in one project with its own identity.",
    openingLabel: "Official opening",
    openingDate: "September 1, 2026",
    status: "Work is still moving.",
    contact: "Contact",
    location: "Madrid · Spain",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,

    alternates: {
      canonical: CANONICAL_URL,
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
      title: content.socialTitle,
      description: content.metadataDescription,
    },

    twitter: {
      card: "summary",
      title: content.socialTitle,
      description: content.metadataDescription,
    },
  };
}

export default async function ComingSoonPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return (
    <main className={styles.page}>
      <div
        className={styles.texture}
        aria-hidden="true"
      />

      <header className={styles.header}>
        <div>
          <p className={styles.brand}>
            VANMOTION
          </p>

          <p className={styles.brandCaption}>
            {content.brandCaption}
          </p>
        </div>

        <p className={styles.location}>
          {content.location}
        </p>
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            {content.eyebrow}
          </p>

          <h1 className={styles.title}>
            <span>{content.titleFirst}</span>
            <span>{content.titleSecond}</span>
          </h1>

          <p className={styles.introduction}>
            {content.introduction}
          </p>
        </div>

        <aside className={styles.openingCard}>
          <p>{content.openingLabel}</p>

          <strong>
            <time dateTime="2026-09-01">
              {content.openingDate}
            </time>
          </strong>

          <div className={styles.rule} />

          <span>{content.status}</span>
        </aside>
      </section>

      <footer className={styles.footer}>
        <a href="mailto:vanmotion@hotmail.com">
          {content.contact} · vanmotion@hotmail.com
        </a>

        <p>© 2026 VANMOTION</p>
      </footer>
    </main>
  );
}