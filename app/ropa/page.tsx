import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./ropa.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadata: {
      title: "Ropa",
      description:
        "Diseño, ropa y filosofía VANMOTION. Prendas sencillas con identidad, trabajo y mensaje.",
    },

    navigation: {
      home: "Inicio",
      collection: "Colección",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
      contactAction: "Contactar",
    },

    hero: {
      eyebrow: "VANMOTION Clothing · Drop 01",
      titleFirst: "Vestir una",
      titleSecond: "forma de vivir.",
      description:
        "Diseños sencillos con un mensaje real. Sin aparentar, sin seguir tendencias vacías y sin olvidar de dónde venimos.",
      primaryAction: "Descubrir Drop 01",
      secondaryAction: "Solicitar información",
      blackEdition: "BLACK EDITION",
    },

    drop: {
      eyebrow: "Primera colección",
      titleFirst: "CARPE DIEM",
      titleSecond: "DROP 01.",
      description:
        "Una camiseta negra construida alrededor de una idea sencilla: aprovechar el tiempo, avanzar y trabajar sin dejar que otros decidan tu camino.",

      products: [
        {
          number: "01",
          label: "Parte trasera",
          description:
            "Diseño principal colocado en la espalda. Limpio, visible y con fuerza, respetando la estética oscura de VANMOTION.",
        },
        {
          number: "02",
          label: "Identidad",
          description:
            "Logotipo utilizado de forma sutil para que el mensaje sea el protagonista.",
        },
        {
          number: "03",
          label: "Prenda",
          description:
            "Base pensada para impresión profesional y uso cotidiano, con tacto cómodo y construcción resistente.",
        },
      ],

      cotton: "ALGODÓN",
      garment:
        "NEGRO · MANGA CORTA",
      identity:
        "Real work · Real motion",
    },

    philosophy: {
      eyebrow: "Filosofía VANMOTION",
      titleFirst: "Menos ruido.",
      titleSecond: "Más mensaje.",

      principles: [
        {
          number: "01",
          title: "Sin aparentar",
          description:
            "La identidad no depende del lujo. Depende de lo que representas y de cómo trabajas.",
        },
        {
          number: "02",
          title: "Mensaje real",
          description:
            "Cada diseño nace de una experiencia, una idea y una manera de entender el camino.",
        },
        {
          number: "03",
          title: "Producción cuidada",
          description:
            "Prendas sencillas, resistentes y pensadas para utilizarse cada día.",
        },
      ],
    },

    production: {
      workshop: "WORKSHOP",
      location: "MADRID",
      visualFirst: "REAL",
      visualSecond: "WORK",
      eyebrow: "Desarrollo del producto",
      titleFirst: "Diseñado desde",
      titleSecond: "el trabajo real.",
      description:
        "Cada prenda se desarrolla dentro del mismo universo donde nacen los vehículos, la música y los proyectos de VANMOTION. No son mundos separados: todos representan la misma forma de avanzar.",
    },

    contact: {
      eyebrow:
        "Información y disponibilidad",
      titleFirst:
        "¿Quieres formar parte",
      titleSecond:
        "del primer drop?",
      description:
        "La venta online se activará más adelante. Mientras tanto puedes contactar directamente para consultar tallas, disponibilidad y próximas unidades.",
      action:
        "Contactar con VANMOTION",
    },

    footer:
      "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    metadata: {
      title: "Clothing",
      description:
        "VANMOTION design, clothing and philosophy. Simple garments with identity, hard work and meaning.",
    },

    navigation: {
      home: "Home",
      collection: "Collection",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
      contactAction: "Get in touch",
    },

    hero: {
      eyebrow: "VANMOTION Clothing · Drop 01",
      titleFirst: "Wear a",
      titleSecond: "way of life.",
      description:
        "Simple designs with a real message. No pretending, no empty trends and no forgetting where we came from.",
      primaryAction: "Discover Drop 01",
      secondaryAction: "Request information",
      blackEdition: "BLACK EDITION",
    },

    drop: {
      eyebrow: "First collection",
      titleFirst: "CARPE DIEM",
      titleSecond: "DROP 01.",
      description:
        "A black T-shirt built around a simple idea: make the most of your time, keep moving forward and work without allowing others to choose your path.",

      products: [
        {
          number: "01",
          label: "Back design",
          description:
            "The main design is placed on the back. Clean, visible and powerful while respecting the dark VANMOTION aesthetic.",
        },
        {
          number: "02",
          label: "Identity",
          description:
            "The logo is used subtly so the message remains the main focus.",
        },
        {
          number: "03",
          label: "Garment",
          description:
            "A base designed for professional printing and everyday use, with a comfortable feel and durable construction.",
        },
      ],

      cotton: "COTTON",
      garment:
        "BLACK · SHORT SLEEVE",
      identity:
        "Real work · Real motion",
    },

    philosophy: {
      eyebrow: "VANMOTION Philosophy",
      titleFirst: "Less noise.",
      titleSecond: "More meaning.",

      principles: [
        {
          number: "01",
          title: "No pretending",
          description:
            "Identity does not depend on luxury. It depends on what you represent and how you work.",
        },
        {
          number: "02",
          title: "Real message",
          description:
            "Every design begins with an experience, an idea and a particular way of understanding the journey.",
        },
        {
          number: "03",
          title: "Careful production",
          description:
            "Simple and durable garments designed to be worn every day.",
        },
      ],
    },

    production: {
      workshop: "WORKSHOP",
      location: "MADRID",
      visualFirst: "REAL",
      visualSecond: "WORK",
      eyebrow: "Product development",
      titleFirst: "Designed through",
      titleSecond: "real work.",
      description:
        "Every garment is developed inside the same universe where VANMOTION vehicles, music and projects are created. They are not separate worlds: they all represent the same way of moving forward.",
    },

    contact: {
      eyebrow:
        "Information and availability",
      titleFirst:
        "Do you want to be part",
      titleSecond:
        "of the first drop?",
      description:
        "Online sales will be activated later. In the meantime, contact us directly to ask about sizes, availability and upcoming units.",
      action:
        "Contact VANMOTION",
    },

    footer:
      "Vehicles · Music · Design · Madrid",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return {
    title: content.metadata.title,
    description:
      content.metadata.description,
  };
}

export default async function RopaPage() {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.logo}
        >
          VANMOTION
        </Link>

        <nav
          className={styles.navigation}
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

          <Link href="/musica">
            {content.navigation.music}
          </Link>

          <Link
            href="/ropa"
            className={styles.active}
            aria-current="page"
          >
            {content.navigation.clothing}
          </Link>

          <Link href="/contacto">
            {content.navigation.contact}
          </Link>
        </nav>

        <Link
          href="/contacto"
          className={styles.headerButton}
        >
          {
            content.navigation
              .contactAction
          }
          <span>→</span>
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            {content.hero.eyebrow}
          </p>

          <h1>
            {content.hero.titleFirst}
            <br />
            {content.hero.titleSecond}
          </h1>

          <p className={styles.description}>
            {content.hero.description}
          </p>

          <div className={styles.heroActions}>
            <Link
              href="#drop-01"
              className={styles.primaryButton}
            >
              {content.hero.primaryAction}
              <span>↓</span>
            </Link>

            <Link
              href="/contacto"
              className={styles.secondaryButton}
            >
              {
                content.hero
                  .secondaryAction
              }
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.visualTop}>
            <span>CARPE DIEM</span>
            <span>2026</span>
          </div>

          <div className={styles.shirt}>
            <div className={styles.shirtBody}>
              <span className={styles.neck} />

              <div
                className={
                  styles.shirtMessage
                }
              >
                <strong>CARPE</strong>
                <strong>DIEM</strong>
              </div>

              <small>VANMOTION</small>
            </div>
          </div>

          <div className={styles.visualBottom}>
            <span>
              {content.hero.blackEdition}
            </span>

            <span>DROP 01</span>
          </div>
        </div>
      </section>

      <section
        className={styles.dropSection}
        id="drop-01"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              {content.drop.eyebrow}
            </p>

            <h2>
              {content.drop.titleFirst}
              <br />
              {content.drop.titleSecond}
            </h2>
          </div>

          <p>{content.drop.description}</p>
        </div>

        <div className={styles.productGrid}>
          <article className={styles.productMain}>
            <div className={styles.productLabel}>
              <span>
                {
                  content.drop.products[0]
                    .number
                }
              </span>

              <span>
                {
                  content.drop.products[0]
                    .label
                }
              </span>
            </div>

            <div className={styles.backDesign}>
              <span>CARPE</span>
              <strong>DIEM</strong>
            </div>

            <p>
              {
                content.drop.products[0]
                  .description
              }
            </p>
          </article>

          <article
            className={styles.productDetail}
          >
            <div className={styles.productLabel}>
              <span>
                {
                  content.drop.products[1]
                    .number
                }
              </span>

              <span>
                {
                  content.drop.products[1]
                    .label
                }
              </span>
            </div>

            <div className={styles.smallLogo}>
              <strong>VANMOTION</strong>

              <span>
                {content.drop.identity}
              </span>
            </div>

            <p>
              {
                content.drop.products[1]
                  .description
              }
            </p>
          </article>

          <article
            className={styles.productDetail}
          >
            <div className={styles.productLabel}>
              <span>
                {
                  content.drop.products[2]
                    .number
                }
              </span>

              <span>
                {
                  content.drop.products[2]
                    .label
                }
              </span>
            </div>

            <div className={styles.material}>
              <span>100%</span>

              <strong>
                {content.drop.cotton}
              </strong>

              <small>
                {content.drop.garment}
              </small>
            </div>

            <p>
              {
                content.drop.products[2]
                  .description
              }
            </p>
          </article>
        </div>
      </section>

      <section
        className={
          styles.philosophySection
        }
      >
        <div className={styles.philosophyTitle}>
          <p className={styles.eyebrow}>
            {content.philosophy.eyebrow}
          </p>

          <h2>
            {
              content.philosophy
                .titleFirst
            }
            <br />
            {
              content.philosophy
                .titleSecond
            }
          </h2>
        </div>

        <div className={styles.principles}>
          {content.philosophy.principles.map(
            (principle) => (
              <article
                key={principle.number}
              >
                <span>
                  {principle.number}
                </span>

                <h3>{principle.title}</h3>

                <p>
                  {principle.description}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        className={
          styles.productionSection
        }
      >
        <div
          className={styles.productionVisual}
        >
          <div className={styles.productionTop}>
            <span>
              {content.production.workshop}
            </span>

            <span>
              {content.production.location}
            </span>
          </div>

          <div
            className={
              styles.productionWord
            }
          >
            <span>
              {
                content.production
                  .visualFirst
              }
            </span>

            <strong>
              {
                content.production
                  .visualSecond
              }
            </strong>
          </div>

          <div
            className={
              styles.productionLines
            }
          >
            {[
              35,
              80,
              50,
              95,
              42,
              72,
              58,
              88,
              45,
              68,
            ].map((height, index) => (
              <span
                key={`${height}-${index}`}
                style={{
                  height: `${height}px`,
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.productionCopy}>
          <p className={styles.eyebrow}>
            {content.production.eyebrow}
          </p>

          <h2>
            {content.production.titleFirst}
            <br />
            {
              content.production
                .titleSecond
            }
          </h2>

          <p>
            {content.production.description}
          </p>
        </div>
      </section>

      <section
        className={styles.contactSection}
      >
        <div>
          <p className={styles.eyebrow}>
            {content.contact.eyebrow}
          </p>

          <h2>
            {content.contact.titleFirst}
            <br />
            {content.contact.titleSecond}
          </h2>
        </div>

        <div className={styles.contactCopy}>
          <p>{content.contact.description}</p>

          <Link href="/contacto">
            {content.contact.action}
            <span>→</span>
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>VANMOTION</strong>

        <span>{content.footer}</span>

        <span>© 2026 VANMOTION</span>
      </footer>
    </main>
  );
}