import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";
import { getDailyNews } from "@/app/lib/daily-news";

import DatabaseMusicPlayer from "./DatabaseMusicPlayer";
import styles from "./musica.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadataTitle: "Música original y producción musical en Madrid",
    metadataDescription:
      "Música original y producción musical de VANMOTION en Madrid. Escucha temas oficiales, sesiones de estudio y nuevos lanzamientos.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      titleFirst: "Sonido propio.",
      titleSecond: "En nuestra productora.",
      label: "VANMOTION music · sessions",
      caption: "Temas oficiales · estudio · lanzamientos",
    },
    intro: {
      eyebrow: "Música oficial",
      title: "Temas nacidos del estudio.",
      text:
        "Cada lanzamiento forma parte del universo VANMOTION: trabajo, constancia y una identidad que no necesita exceso para sonar fuerte.",
    },
    player: {
      eyebrow: "Discografía",
      title: "Escucha directa.",
      text:
        "Reproduce los temas oficiales desde la web y entra en el sonido propio de VANMOTION.",
    },
    philosophy: {
      eyebrow: "La idea",
      first: "Sin ruido.",
      second: "Con identidad.",
      rows: [
        {
          number: "01",
          title: "Producción propia",
          text: "Cada tema nace del trabajo real en el estudio y se construye con tiempo, intención y verdad.",
        },
        {
          number: "02",
          title: "Lanzamientos reales",
          text: "Cada tema suma identidad, catálogo y recorrido para la marca.",
        },
        {
          number: "03",
          title: "Todo conecta",
          text: "Música, vehículos y ropa forman un mismo lenguaje visual y creativo.",
        },
      ],
    },
    contact: {
      eyebrow: "Contacto directo",
      title: "¿Hablamos?",
      action: "Abrir contacto",
    },
    footer: {
      city: "Madrid · España",
      purchaseConditions: "Condiciones de compra",
      withdrawal: "Desistimiento",
      privacy: "Privacidad",
    },
  },
  en: {
    metadataTitle: "Original music and music production from Madrid",
    metadataDescription:
      "Original music and music production by VANMOTION in Madrid. Listen to official tracks, studio sessions and new releases.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      titleFirst: "Our own sound.",
      titleSecond: "In our production studio.",
      label: "VANMOTION music · sessions",
      caption: "Official tracks · studio · releases",
    },
    intro: {
      eyebrow: "Official music",
      title: "Tracks born in the studio.",
      text:
        "Every release belongs to the VANMOTION universe: work, consistency and an identity that does not need excess to hit hard.",
    },
    player: {
      eyebrow: "Discography",
      title: "Direct listening.",
      text:
        "Play the official tracks directly from the site and step into VANMOTION's own sound.",
    },
    philosophy: {
      eyebrow: "The idea",
      first: "No noise.",
      second: "With identity.",
      rows: [
        {
          number: "01",
          title: "Original production",
          text: "Every track begins with real studio work and is built with time, intention and honesty.",
        },
        {
          number: "02",
          title: "Real releases",
          text: "Every track adds identity, catalogue and direction to the brand.",
        },
        {
          number: "03",
          title: "Everything connects",
          text: "Music, vehicles and clothing speak the same creative language.",
        },
      ],
    },
    contact: {
      eyebrow: "Direct contact",
      title: "Shall we talk?",
      action: "Open contact",
    },
    footer: {
      city: "Madrid · Spain",
      purchaseConditions: "Purchase conditions",
      withdrawal: "Withdrawal",
      privacy: "Privacy",
    },
  },
} satisfies Record<Language, object>;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
    alternates: {
      canonical: "/musica",
    },
    openGraph: {
      title: content.metadataTitle,
      description: content.metadataDescription,
      type: "website",
      url: "/musica",
      images: [
        {
          url: "/uploads/music-covers/vanmotion-1784378515490.png",
          alt:
            language === "es"
              ? "Música original y producción musical de VANMOTION"
              : "Original music and music production by VANMOTION",
        },
      ],
    },
  };
}

export default async function MusicPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];
  const [, musicNews] = await getDailyNews(language);

  return (
    <div className={styles.page}>
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
          <Link href="/musica" aria-current="page">
            {content.navigation.music}
          </Link>
          <Link href="/ropa">{content.navigation.clothing}</Link>
          <Link href="/contacto">{content.navigation.contact}</Link>
        </nav>
      </header>

      <main>
        <section
          className={styles.hero}
          aria-labelledby="music-hero-title"
        >
          <div className={styles.heroMedia} aria-hidden="true">
            <Image
              src="/uploads/music-covers/vanmotion-1784378515490.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className={styles.heroArtwork}
            />
            <div className={styles.heroShade} />
          </div>

          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.navigation.music}</span>
          </div>

          <h1 id="music-hero-title" className={styles.srOnly}>
            {content.metadataTitle}
          </h1>

          {musicNews ? (
            <a
              href={musicNews.url}
              target="_blank"
              rel="noreferrer"
              className={styles.heroNews}
            >
              <span className={styles.heroNewsLabel}>
                {language === "es"
                  ? "Actualidad · Música"
                  : "Latest · Music"}
              </span>

              <strong>{musicNews.title}</strong>

              <small>
                {musicNews.source}
                <span aria-hidden="true"> ↗</span>
              </small>
            </a>
          ) : null}

          <div className={styles.heroFoot}>
            <div className={styles.heroLinks}>
              <Link href="#reproductor">
                {content.navigation.music}
              </Link>
              <Link href="/ropa">
                {content.navigation.clothing}
              </Link>
              <Link href="/contacto">
                {content.navigation.contact}
              </Link>
            </div>
          </div>
        </section>


        <section
          className={styles.playerSection}
          id="reproductor"
        >
            <h2 className={styles.srOnly}>
              {content.navigation.music}
            </h2>

          <DatabaseMusicPlayer language={language} />
        </section>


          <section
            className={styles.contactSection}
            aria-label={content.navigation.contact}
          >
            <Link
              href="/contacto?tema=musica"
              className={styles.contactLink}
            >
              <span>{content.navigation.contact}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav
          className={styles.footerNav}
          aria-label={
            language === "es"
              ? "Enlaces legales"
              : "Legal links"
          }
        >
          <Link href="/aviso-legal">Legal</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
