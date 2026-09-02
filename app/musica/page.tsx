import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";
import { getDailyNews } from "@/app/lib/daily-news";
import { getPublicMusicRecommendations } from "@/app/lib/music-library";

import DatabaseMusicPlayer from "./DatabaseMusicPlayer";
import styles from "./musica.module.css";
import { getMadridLightPhase } from "@/app/lib/madrid-light";


export const dynamic = "force-dynamic";

function getMadridHeroImage() {
  const phase = getMadridLightPhase();

  if (phase === "morning") {
    return "/musica/horario/vanmotion-musica-manana.webp";
  }

  if (phase === "day") {
    return "/musica/horario/vanmotion-musica-dia.webp";
  }

  if (phase === "sunset") {
    return "/musica/horario/vanmotion-musica-atardecer.webp";
  }

  return "/musica/horario/vanmotion-musica-noche.webp";
}


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
          url: "/musica/editorial/vanmotion-portada-musica.png",
          alt:
            language === "es"
              ? "Música original y producción musical de VANMOTION"
              : "Original music and music production by VANMOTION",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadataTitle,
      description: content.metadataDescription,
      images: ["/musica/editorial/vanmotion-portada-musica.png"],
    },
  };
}

export default async function MusicPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];
  const [, musicNews] = await getDailyNews(language);
  const recommendations =
    await getPublicMusicRecommendations();

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
          <Link
            href="/contacto"
            aria-hidden="true"
            tabIndex={-1}
            style={{ visibility: "hidden", pointerEvents: "none" }}
          >
            {content.navigation.contact}
          </Link>
        </nav>
      </header>

      <main>
        <section
          className={styles.hero}
          aria-labelledby="music-hero-title"
        >
          <div className={styles.heroMedia} aria-hidden="true">
            <Image
              src={getMadridHeroImage()}
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


        {recommendations.length > 0 && (
          <section
            className={styles.recommendSection}
            id="vanmotion-recomienda"
            aria-labelledby="vanmotion-recomienda-title"
          >
            <div className={styles.recommendHeader}>
              <div>
                <span className={styles.recommendEyebrow}>
                  {language === "es"
                    ? "Selección editorial"
                    : "Editorial selection"}
                </span>

                <h2 id="vanmotion-recomienda-title">
                  {language === "es"
                    ? "VANMOTION RECOMIENDA"
                    : "VANMOTION RECOMMENDS"}
                </h2>
              </div>

              <p>
                {language === "es"
                  ? "Música que seguimos escuchando. Una selección que forma parte de nuestras referencias."
                  : "Music we keep listening to. A selection that remains part of our references."}
              </p>
            </div>

            <div className={styles.recommendGrid}>
              {recommendations.map(
                (recommendation, index) => (
                  <a
                    key={recommendation.id}
                    href={`https://www.youtube.com/watch?v=${recommendation.youtubeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.recommendCard}
                    aria-label={`${recommendation.title} · ${recommendation.artist} · YouTube`}
                  >
                    <span className={styles.recommendNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className={styles.recommendCardBody}>
                      <span className={styles.recommendBadge}>
                        {language === "es"
                          ? "VANMOTION RECOMIENDA"
                          : "VANMOTION RECOMMENDS"}
                      </span>

                      <h3>{recommendation.title}</h3>

                      <p className={styles.recommendArtist}>
                        {recommendation.artist}
                      </p>

                      {recommendation.documentAuthentic &&
                      recommendation.documentImageUrl ? (
                        <figure
                          className={styles.recommendDocument}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              recommendation.documentImageUrl
                            }
                            alt={
                              language === "es"
                                ? `Documento original asociado a ${recommendation.title}`
                                : `Original document associated with ${recommendation.title}`
                            }
                          />

                          {(recommendation.editorialHeading ||
                            recommendation.editorialCredit) && (
                            <figcaption>
                              {recommendation.editorialHeading && (
                                <span>
                                  {
                                    recommendation.editorialHeading
                                  }
                                </span>
                              )}

                              {recommendation.editorialCredit && (
                                <small>
                                  {
                                    recommendation.editorialCredit
                                  }
                                </small>
                              )}
                            </figcaption>
                          )}
                        </figure>
                      ) : recommendation.editorialTextEs ||
                        recommendation.editorialTextEn ? (
                        <div
                          className={
                            recommendation.editorialStyle ===
                            "memo"
                              ? styles.recommendFoundMemo
                              : styles.recommendFoundPaper
                          }
                        >
                          {recommendation.editorialHeading && (
                            <span>
                              {
                                recommendation.editorialHeading
                              }
                            </span>
                          )}

                          <p>
                            {language === "es"
                              ? recommendation.editorialTextEs ??
                                recommendation.editorialTextEn
                              : recommendation.editorialTextEn ??
                                recommendation.editorialTextEs}
                          </p>

                          {recommendation.editorialCredit && (
                            <small>
                              {recommendation.editorialCredit}
                            </small>
                          )}
                        </div>
                      ) : (
                        <p className={styles.recommendNote}>
                          {language === "es"
                            ? "Una referencia seleccionada por VANMOTION."
                            : "A reference selected by VANMOTION."}
                        </p>
                      )}
                    </div>

                    <span className={styles.recommendAction}>
                      {language === "es"
                        ? "Ver videoclip en YouTube"
                        : "Watch on YouTube"}
                      <span aria-hidden="true"> ↗</span>
                    </span>
                  </a>
                ),
              )}
            </div>
          </section>
        )}


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
