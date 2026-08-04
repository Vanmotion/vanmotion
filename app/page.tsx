import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "./lib/language";
import { prisma } from "./lib/prisma";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadata: {
      title: "Vanmotion",
      description:
        "Vehículos, música y ropa de VANMOTION en Madrid.",
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
        "VANMOTION vehicles, music and clothing in Madrid.",
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

function SocialIcon({ name }: { name: string }) {
  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.4 7.2a2.8 2.8 0 0 0-2-2C17.7 4.7 12 4.7 12 4.7s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.1 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.8 29 29 0 0 0-.5-4.8ZM10 15.3V8.7l5.8 3.3L10 15.3Z" />
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.8 3c.3 2.2 1.6 3.6 3.8 3.9v3.2a8 8 0 0 1-3.8-1.2v6.4a5.8 5.8 0 1 1-5-5.7v3.3a2.6 2.6 0 1 0 1.8 2.4V3h3.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm10.1 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

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

  const settings = await prisma.siteSettings.findFirst({
    select: {
      instagram: true,
      youtube: true,
      tiktok: true,
    },
  });

  const socialLinks = [
    {
      label: "Instagram",
      handle: "@vanmotion_madrid",
      href: settings?.instagram,
      icon: "instagram",
    },
    {
      label: "TikTok",
      handle: "@vanmotion_madrid",
      href: settings?.tiktok,
      icon: "tiktok",
    },
    {
      label: "YouTube",
      handle: "@Vanmotion-s2d",
      href: settings?.youtube,
      icon: "youtube",
    },
  ].filter(
    (
      social,
    ): social is {
      label: string;
      handle: string;
      href: string;
      icon: string;
    } => Boolean(social.href),
  );

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

          <h1 id="hero-title" className={styles.srOnly}>
            {content.hero.title}
          </h1>

          <div className={styles.heroFoot}>
            <span>{content.hero.vehicle}</span>
            <div
                className={styles.heroSocials}
                aria-label={
                  language === "es"
                    ? "Redes sociales de VANMOTION"
                    : "VANMOTION social media"
                }
              >
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label} ${social.handle}`}
                    title={`${social.label} · ${social.handle}`}
                  >
                    <SocialIcon name={social.icon} />
                    <span>{social.handle}</span>
                  </a>
                ))}
              </div>
          </div>
        </section>

        <section className={styles.paths} aria-labelledby="paths-title">
          <h2 id="paths-title" className={styles.srOnly}>
            {language === "es" ? "Áreas" : "Areas"}
          </h2>

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

        <section
          className={styles.contact}
          id="contacto"
          aria-label={content.navigation.contact}
        >
          <Link href="/contacto" className={styles.contactLink}>
            <span>{content.navigation.contact}</span>
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
          <Link href="/aviso-legal">Legal</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
