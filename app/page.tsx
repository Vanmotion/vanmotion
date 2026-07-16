import type { Metadata } from "next";
import Link from "next/link";

import FeaturedVehicle from "./components/home/FeaturedVehicle";
import { getCurrentLanguage } from "./lib/language";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadata: {
      title: "VANMOTION",
      description:
        "Vehículos, música, diseño y proyectos con identidad. Trabajo real y movimiento real.",
    },

    navigation: {
      home: "Inicio",
      collection: "Colección",
      history: "Historia",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
      vehicles: "Ver vehículos",
    },

    hero: {
      location: "Mejorada del Campo · Madrid",
      titleFirst: "Trabajo",
      titleMiddle: "que deja",
      titleLast: "huella.",
      description:
        "VANMOTION une vehículos, producción musical y diseño dentro de un mismo espacio. Una marca construida con humildad, creatividad y muchas horas de trabajo real.",
      primaryAction: "Explorar colección",
      secondaryAction: "Conocer VANMOTION",
      universe: "Universo VANMOTION",
      visualFirst: "Desde abajo.",
      visualSecond: "Sin atajos.",
      real: "REAL",
      motion: "MOTION",
      vehicles: "Vehículos",
      music: "Música",
      design: "Diseño",
    },

    areas: {
      label: "Tres caminos. Una identidad.",
      titleFirst: "Todo forma parte",
      titleSecond: "de la misma historia.",
      introduction:
        "VANMOTION no es solamente una tienda de vehículos. Es un espacio donde se cruzan el motor, la música, el diseño y una forma concreta de entender el trabajo.",

      items: [
        {
          number: "01",
          title: "Vehículos",
          text:
            "Coches y furgonetas seleccionados con información clara, fotografías reales y atención directa.",
          href: "/coleccion",
          action: "Ver colección",
        },
        {
          number: "02",
          title: "Música",
          text:
            "Producción musical con identidad propia, construida desde el trabajo, la constancia y la verdad.",
          href: "/musica",
          action: "Escuchar lanzamientos",
        },
        {
          number: "03",
          title: "Diseño y ropa",
          text:
            "Ropa y conceptos visuales sencillos, con personalidad y sin necesidad de aparentar.",
          href: "/ropa",
          action: "Descubrir Drop 01",
        },
      ],
    },

    vehicles: {
      label: "Colección VANMOTION",
      titleFirst: "Vehículos",
      titleSecond: "con historia.",
      description:
        "Seleccionamos coches y furgonetas con personalidad. Cada unidad dispone de una ficha completa y fotografías reales; cuando está disponible, puedes solicitar información directamente.",
      action: "Ver colección de vehículos",
    },

    studio: {
      visualLocation: "Madrid",
      visualFirst: "Música",
      visualSecond: "con verdad.",
      label: "Producción musical",
      titleFirst: "El estudio",
      titleSecond: "también es",
      titleThird: "VANMOTION.",
      description:
        "En la parte superior de la nave nace la música de la marca. Un estudio real, creativo y construido poco a poco, sin fórmulas vacías y sin perder la esencia.",
      action: "Escuchar música",
    },

    clothing: {
      label: "VANMOTION Clothing",
      titleFirst: "Vestir una",
      titleSecond: "forma de vivir.",
      designLabel: "Diseño",
      designFirst: "Menos ruido.",
      designSecond: "Más mensaje.",
      philosophyLabel: "Filosofía",
      philosophy:
        "Avanzar sin olvidar de dónde venimos.",
      action: "Descubrir Drop 01",
    },

    story: {
      label: "Nuestra historia",
      titleFirst: "Empezar",
      titleSecond: "desde cero.",
      paragraphOne:
        "VANMOTION nace de una idea sencilla: construir algo propio respetando el esfuerzo, la identidad y a las personas que estuvieron desde el principio.",
      paragraphTwo:
        "No queremos mostrar un mundo perfecto. Queremos mostrar un lugar real: herramientas, vehículos, cables, música, ropa, errores, aprendizaje y trabajo diario.",

      values: [
        {
          number: "01",
          title: "Trabajo real",
          text:
            "Cada proyecto nace de muchas horas, decisiones difíciles y constancia.",
        },
        {
          number: "02",
          title: "Humildad",
          text:
            "No buscamos aparentar. Queremos que el resultado hable por nosotros.",
        },
        {
          number: "03",
          title: "Lealtad",
          text:
            "Respeto por las personas, por la palabra y por el trabajo bien hecho.",
        },
      ],
    },

    contact: {
      label: "Contacto directo",
      titleFirst: "Hablemos del próximo",
      titleSecond: "movimiento.",
      description:
        "Contacta con VANMOTION para solicitar información sobre vehículos, música, ropa o futuros proyectos.",
      action: "Abrir contacto",
    },

    footer:
      "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    metadata: {
      title: "VANMOTION",
      description:
        "Vehicles, music, design and projects with identity. Real work and real movement.",
    },

    navigation: {
      home: "Home",
      collection: "Collection",
      history: "Story",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
      vehicles: "View vehicles",
    },

    hero: {
      location: "Mejorada del Campo · Madrid",
      titleFirst: "Work",
      titleMiddle: "that leaves",
      titleLast: "a mark.",
      description:
        "VANMOTION brings vehicles, music production and design together in one space. A brand built with humility, creativity and countless hours of real work.",
      primaryAction: "Explore collection",
      secondaryAction: "Discover VANMOTION",
      universe: "VANMOTION Universe",
      visualFirst: "From the ground up.",
      visualSecond: "No shortcuts.",
      real: "REAL",
      motion: "MOTION",
      vehicles: "Vehicles",
      music: "Music",
      design: "Design",
    },

    areas: {
      label: "Three paths. One identity.",
      titleFirst: "Everything is part",
      titleSecond: "of the same story.",
      introduction:
        "VANMOTION is more than a vehicle business. It is a space where engines, music, design and a particular way of understanding work come together.",

      items: [
        {
          number: "01",
          title: "Vehicles",
          text:
            "Carefully selected cars and vans with clear information, real photographs and direct personal assistance.",
          href: "/coleccion",
          action: "View collection",
        },
        {
          number: "02",
          title: "Music",
          text:
            "Music production with its own identity, built through work, consistency and truth.",
          href: "/musica",
          action: "Listen to releases",
        },
        {
          number: "03",
          title: "Design and clothing",
          text:
            "Simple clothing and visual concepts with personality, without the need to pretend.",
          href: "/ropa",
          action: "Discover Drop 01",
        },
      ],
    },

    vehicles: {
      label: "VANMOTION Collection",
      titleFirst: "Vehicles",
      titleSecond: "with a story.",
      description:
        "We select cars and vans with personality. Every vehicle includes a complete listing and real photographs; when available, you can request information directly.",
      action: "View vehicle collection",
    },

    studio: {
      visualLocation: "Madrid",
      visualFirst: "Music",
      visualSecond: "with truth.",
      label: "Music production",
      titleFirst: "The studio",
      titleSecond: "is also",
      titleThird: "VANMOTION.",
      description:
        "The music of the brand is created on the upper floor of our workspace. A real and creative studio, built step by step without empty formulas or losing its essence.",
      action: "Listen to music",
    },

    clothing: {
      label: "VANMOTION Clothing",
      titleFirst: "Wear a",
      titleSecond: "way of life.",
      designLabel: "Design",
      designFirst: "Less noise.",
      designSecond: "More meaning.",
      philosophyLabel: "Philosophy",
      philosophy:
        "Moving forward without forgetting where we came from.",
      action: "Discover Drop 01",
    },

    story: {
      label: "Our story",
      titleFirst: "Starting",
      titleSecond: "from zero.",
      paragraphOne:
        "VANMOTION began with a simple idea: to build something of our own while respecting effort, identity and the people who were there from the beginning.",
      paragraphTwo:
        "We do not want to show a perfect world. We want to show a real place: tools, vehicles, cables, music, clothing, mistakes, learning and everyday work.",

      values: [
        {
          number: "01",
          title: "Real work",
          text:
            "Every project comes from long hours, difficult decisions and consistency.",
        },
        {
          number: "02",
          title: "Humility",
          text:
            "We are not here to pretend. We want the result to speak for itself.",
        },
        {
          number: "03",
          title: "Loyalty",
          text:
            "Respect for people, for our word and for work done properly.",
        },
      ],
    },

    contact: {
      label: "Direct contact",
      titleFirst: "Let us discuss the next",
      titleSecond: "movement.",
      description:
        "Contact VANMOTION for information about vehicles, music, clothing or future projects.",
      action: "Open contact",
    },

    footer:
      "Vehicles · Music · Design · Madrid",
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
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            VANMOTION
          </Link>

          <nav
            className={styles.nav}
            aria-label={
              language === "es"
                ? "Navegación principal"
                : "Main navigation"
            }
          >
            <Link href="/">
              {content.navigation.home}
            </Link>

            <Link href="/coleccion">
              {content.navigation.collection}
            </Link>

            <Link href="#historia">
              {content.navigation.history}
            </Link>

            <Link href="/musica">
              {content.navigation.music}
            </Link>

            <Link href="/ropa">
              {content.navigation.clothing}
            </Link>

            <Link href="/contacto">
              {content.navigation.contact}
            </Link>
          </nav>

          <Link
            href="/coleccion"
            className={styles.headerButton}
          >
            {content.navigation.vehicles}
            <span>→</span>
          </Link>
        </div>
      </header>

      <main>
        {/* PORTADA */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span />
                {content.hero.location}
              </p>

              <h1 className={styles.heroTitle}>
                {content.hero.titleFirst}

                <span>
                  {content.hero.titleMiddle}
                </span>

                {content.hero.titleLast}
              </h1>

              <p className={styles.heroDescription}>
                {content.hero.description}
              </p>

              <div className={styles.heroActions}>
                <Link
                  href="/coleccion"
                  className={styles.primaryButton}
                >
                  {content.hero.primaryAction}
                  <span>→</span>
                </Link>

                <Link
                  href="#historia"
                  className={styles.secondaryButton}
                >
                  {content.hero.secondaryAction}
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.visualTop}>
                <div>
                  <p>{content.hero.universe}</p>

                  <h2>
                    {content.hero.visualFirst}
                    <br />
                    {content.hero.visualSecond}
                  </h2>
                </div>

                <span className={styles.year}>
                  2026
                </span>
              </div>

              <div className={styles.motionTitle}>
                <span>{content.hero.real}</span>
                <strong>
                  {content.hero.motion}
                </strong>
              </div>

              <div className={styles.heroStats}>
                <div>
                  <strong>01</strong>
                  <span>
                    {content.hero.vehicles}
                  </span>
                </div>

                <div>
                  <strong>02</strong>
                  <span>
                    {content.hero.music}
                  </span>
                </div>

                <div>
                  <strong>03</strong>
                  <span>
                    {content.hero.design}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ÁREAS DE VANMOTION */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionLabel}>
                  {content.areas.label}
                </p>

                <h2>
                  {content.areas.titleFirst}
                  <br />
                  {content.areas.titleSecond}
                </h2>
              </div>

              <p className={styles.sectionIntro}>
                {content.areas.introduction}
              </p>
            </div>

            <div className={styles.areaGrid}>
              {content.areas.items.map(
                (area) => (
                  <article
                    className={styles.areaCard}
                    key={area.number}
                  >
                    <span
                      className={
                        styles.areaNumber
                      }
                    >
                      {area.number}
                    </span>

                    <h3>{area.title}</h3>

                    <p>{area.text}</p>

                    <Link href={area.href}>
                      {area.action}
                      <span>→</span>
                    </Link>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* COLECCIÓN DE VEHÍCULOS */}
        <section className={styles.vehicleSection}>
          <div className={styles.container}>
            <div className={styles.vehicleGrid}>
              <div>
                <p className={styles.sectionLabel}>
                  {content.vehicles.label}
                </p>

                <h2 className={styles.largeTitle}>
                  {content.vehicles.titleFirst}
                  <br />
                  {content.vehicles.titleSecond}
                </h2>

                <p className={styles.normalText}>
                  {content.vehicles.description}
                </p>

                <Link
                  href="/coleccion"
                  className={styles.secondaryButton}
                >
                  {content.vehicles.action}
                  <span>→</span>
                </Link>
              </div>

              <FeaturedVehicle />
            </div>
          </div>
        </section>

        {/* ESTUDIO MUSICAL */}
        <section
          className={styles.section}
          id="estudio"
        >
          <div className={styles.container}>
            <div className={styles.splitSection}>
              <div className={styles.studioVisual}>
                <div className={styles.studioTop}>
                  <span>VANMOTION Studio</span>

                  <span>
                    {content.studio.visualLocation}
                  </span>
                </div>

                <div className={styles.soundBars}>
                  {[
                    32,
                    58,
                    42,
                    82,
                    54,
                    94,
                    38,
                    70,
                    48,
                    86,
                  ].map((height, index) => (
                    <span
                      key={`${height}-${index}`}
                      style={{
                        height: `${height}px`,
                      }}
                    />
                  ))}
                </div>

                <h2>
                  {content.studio.visualFirst}
                  <br />
                  {content.studio.visualSecond}
                </h2>
              </div>

              <div className={styles.splitCopy}>
                <p className={styles.sectionLabel}>
                  {content.studio.label}
                </p>

                <h2 className={styles.largeTitle}>
                  {content.studio.titleFirst}
                  <br />
                  {content.studio.titleSecond}
                  <br />
                  {content.studio.titleThird}
                </h2>

                <p className={styles.normalText}>
                  {content.studio.description}
                </p>

                <Link
                  href="/musica"
                  className={styles.secondaryButton}
                >
                  {content.studio.action}
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ROPA */}
        <section
          className={styles.clothingSection}
          id="ropa"
        >
          <div className={styles.container}>
            <p className={styles.darkLabel}>
              {content.clothing.label}
            </p>

            <h2>
              {content.clothing.titleFirst}
              <br />
              {content.clothing.titleSecond}
            </h2>

            <div className={styles.clothingGrid}>
              <div
                className={
                  styles.blackClothingCard
                }
              >
                <span>CARPE</span>
                <span>DIEM</span>
              </div>

              <div
                className={
                  styles.lightClothingCard
                }
              >
                <small>
                  {
                    content.clothing
                      .designLabel
                  }
                </small>

                <strong>
                  {
                    content.clothing
                      .designFirst
                  }
                  <br />
                  {
                    content.clothing
                      .designSecond
                  }
                </strong>
              </div>

              <div
                className={
                  styles.greyClothingCard
                }
              >
                <small>
                  {
                    content.clothing
                      .philosophyLabel
                  }
                </small>

                <strong>
                  {
                    content.clothing
                      .philosophy
                  }
                </strong>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link
                href="/ropa"
                className={styles.primaryButton}
              >
                {content.clothing.action}
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* HISTORIA */}
        <section
          className={styles.section}
          id="historia"
        >
          <div className={styles.container}>
            <div className={styles.storyGrid}>
              <div>
                <p className={styles.sectionLabel}>
                  {content.story.label}
                </p>

                <h2 className={styles.largeTitle}>
                  {content.story.titleFirst}
                  <br />
                  {content.story.titleSecond}
                </h2>
              </div>

              <div className={styles.storyText}>
                <p>
                  {content.story.paragraphOne}
                </p>

                <p>
                  {content.story.paragraphTwo}
                </p>
              </div>
            </div>

            <div className={styles.valuesGrid}>
              {content.story.values.map(
                (value) => (
                  <article key={value.number}>
                    <span>{value.number}</span>

                    <h3>{value.title}</h3>

                    <p>{value.text}</p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section
          className={styles.contactSection}
          id="contacto"
        >
          <div className={styles.container}>
            <div className={styles.contactBox}>
              <div>
                <p className={styles.sectionLabel}>
                  {content.contact.label}
                </p>

                <h2>
                  {content.contact.titleFirst}
                  <br />
                  {content.contact.titleSecond}
                </h2>
              </div>

              <div className={styles.contactCopy}>
                <p>
                  {content.contact.description}
                </p>

                <Link
                  href="/contacto"
                  className={styles.primaryButton}
                >
                  {content.contact.action}
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <strong>VANMOTION</strong>

          <span>{content.footer}</span>

          <span>© 2026 VANMOTION</span>
        </div>
      </footer>
    </div>
  );
}