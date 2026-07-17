import type { Metadata } from "next";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./proximamente.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadataTitle: "Próximamente",
    metadataDescription:
      "VANMOTION abrirá oficialmente el 1 de septiembre de 2026.",
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
      "VANMOTION will officially open on September 1, 2026.",
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
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ComingSoonPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return (
    <main className={styles.page}>
      <div className={styles.texture} aria-hidden="true" />

      <header className={styles.header}>
        <div>
          <p className={styles.brand}>VANMOTION</p>
          <p className={styles.brandCaption}>
            VEHÍCULOS · MÚSICA · ROPA
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
          <strong>{content.openingDate}</strong>

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
