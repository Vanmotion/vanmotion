import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "./lib/language";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadata: {
      title: "Vanmotion",
      description:
        "Vehículos, música y ropa. Trabajo real, identidad propia y movimiento.",
    },
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      title: "Vanmotion",
      statementFirst: "Trabajo real.",
      statementSecond: "Movimiento propio.",
      vehicle: "Ford E-150 · Emblema VANMOTION",
      year: "Est. 2026",
    },
    paths: {
      eyebrow: "Tres caminos · Una identidad",
      title: "Lo que hacemos habla por nosotros.",
      items: [
        {
          number: "01",
          title: "Vehículos",
          note: "Seleccionados con criterio.",
          action: "Ver colección",
          href: "/coleccion",
          image: "/brand/vanmotion-ford-hero.webp",
          alt: "Ford E-150 azul, vehículo emblema de VANMOTION",
          imageClass: "vehicleImage",
        },
        {
          number: "02",
          title: "Música",
          note: "Producida desde dentro.",
          action: "Escuchar",
          href: "/musica",
          image: "/music/covers/cero-dramas.webp",
          alt: "Portada musical de VANMOTION",
          imageClass: "musicImage",
        },
        {
          number: "03",
          title: "Ropa",
          note: "Diseñada sin aparentar.",
          action: "Ver Drop 01",
          href: "/ropa",
          image: "/ropa/carpe-diem-black-edition.webp",
          alt: "Camiseta negra CARPE DIEM de VANMOTION",
          imageClass: "clothingImage",
        },
      ],
    },
    contact: {
      label: "Contacto directo",
      title: "Hablemos.",
      action: "Abrir contacto",
    },
    footer: {
      identity: "Madrid · España",
      legalNotice: "Aviso legal",
      privacy: "Privacidad",
      cookies: "Cookies",
      purchaseConditions: "Condiciones de compra",
      withdrawal: "Desistimiento",
    },
  },
  en: {
    metadata: {
      title: "Vanmotion",
      description:
        "Vehicles, music and clothing. Real work, original identity and movement.",
    },
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      title: "Vanmotion",
      statementFirst: "Real work.",
      statementSecond: "Our own movement.",
      vehicle: "Ford E-150 · VANMOTION emblem",
      year: "Est. 2026",
    },
    paths: {
      eyebrow: "Three paths · One identity",
      title: "What we do speaks for us.",
      items: [
        {
          number: "01",
          title: "Vehicles",
          note: "Selected with purpose.",
          action: "View collection",
          href: "/coleccion",
          image: "/brand/vanmotion-ford-hero.webp",
          alt: "Blue Ford E-150, VANMOTION emblem vehicle",
          imageClass: "vehicleImage",
        },
        {
          number: "02",
          title: "Music",
          note: "Produced from within.",
          action: "Listen",
          href: "/musica",
          image: "/music/covers/cero-dramas.webp",
          alt: "VANMOTION music artwork",
          imageClass: "musicImage",
        },
        {
          number: "03",
          title: "Clothing",
          note: "Designed without pretending.",
          action: "View Drop 01",
          href: "/ropa",
          image: "/ropa/carpe-diem-black-edition.webp",
          alt: "Black CARPE DIEM VANMOTION T-shirt",
          imageClass: "clothingImage",
        },
      ],
    },
    contact: {
      label: "Direct contact",
      title: "Let’s talk.",
      action: "Open contact",
    },
    footer: {
      identity: "Madrid · Spain",
      legalNotice: "Legal notice",
      privacy: "Privacy",
      cookies: "Cookies",
      purchaseConditions: "Purchase conditions",
      withdrawal: "Withdrawal",
    },
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function Home() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return (
    <div className={styles.page} id="inicio">
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Vanmotion">
          <Image
            src="/brand/vanmotion-mark.webp"
            alt=""
            width={76}
            height={36}
            priority
            className={styles.brandMark}
          />
          <span>Vanmotion</span>
        </Link>

        <nav
          className={styles.navigation}
          aria-label={
            language === "es"
              ? "Navegación principal"
              : "Main navigation"
          }
        >
          <Link href="/coleccion">{content.navigation.vehicles}</Link>
          <Link href="/musica">{content.navigation.music}</Link>
          <Link href="/ropa">{content.navigation.clothing}</Link>
          <Link href="/contacto">{content.navigation.contact}</Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <Image
            src="/brand/vanmotion-ford-hero.webp"
            alt={content.hero.vehicle}
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />

          <div className={styles.heroShade} aria-hidden="true" />

          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.hero.year}</span>
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>{content.hero.title}</p>
            <h1 id="hero-title">
              <span>{content.hero.statementFirst}</span>
              <span>{content.hero.statementSecond}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.vehicle}</span>
            <div className={styles.heroLinks}>
              <Link href="/coleccion">{content.navigation.vehicles}</Link>
              <Link href="/musica">{content.navigation.music}</Link>
              <Link href="/ropa">{content.navigation.clothing}</Link>
            </div>
          </div>
        </section>

        <section className={styles.paths} aria-labelledby="paths-title">
          <div className={styles.pathsIntro}>
            <p>{content.paths.eyebrow}</p>
            <h2 id="paths-title">{content.paths.title}</h2>
          </div>

          <div className={styles.pathGrid}>
            {content.paths.items.map((item) => (
              <Link
                href={item.href}
                className={styles.pathCard}
                key={item.number}
              >
                <div className={styles.pathMedia}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 820px) 100vw, 33vw"
                    className={`${styles.pathImage} ${styles[item.imageClass]}`}
                  />
                  <div className={styles.pathShade} aria-hidden="true" />
                </div>

                <div className={styles.pathNumber}>{item.number}</div>

                <div className={styles.pathContent}>
                  <p>{item.note}</p>
                  <h3>{item.title}</h3>
                  <span>
                    {item.action}
                    <b aria-hidden="true">↗</b>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.contact} id="contacto">
          <div>
            <p>{content.contact.label}</p>
            <h2>{content.contact.title}</h2>
          </div>

          <Link href="/contacto" className={styles.contactLink}>
            {content.contact.action}
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.identity}</span>
        </div>

        <nav
          className={styles.legal}
          aria-label={language === "es" ? "Enlaces legales" : "Legal links"}
        >
          <Link href="/aviso-legal">{content.footer.legalNotice}</Link>
          <Link href="/privacidad">{content.footer.privacy}</Link>
          <Link href="/cookies">{content.footer.cookies}</Link>
          <Link href="/condiciones-compra">
            {content.footer.purchaseConditions}
          </Link>
          <Link href="/desistimiento">{content.footer.withdrawal}</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
