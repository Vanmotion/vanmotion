import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import styles from "./contacto.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadata: {
      title: "Contacto",
      description:
        "Contacta directamente con VANMOTION para solicitar información sobre vehículos, música, ropa y proyectos.",
    },

    navigation: {
      home: "Inicio",
      collection: "Colección",
      contact: "Contacto",
      vehicles: "Ver vehículos",
    },

    hero: {
      eyebrow: "Contacto directo · Madrid",
      titleFirst: "Hablemos del",
      titleSecond: "próximo movimiento.",
      description:
        "Vehículos, producción musical, diseño y proyectos con identidad. Contacta directamente con VANMOTION para recibir información.",
      visualFirst: "REAL",
      visualSecond: "CONTACTO",
    },

    contactCards: {
      email: "Correo electrónico",
      phone: "Teléfono",
      whatsapp: "WhatsApp",
      location: "Ubicación",
      pending: "Pendiente de configurar",
      writeEmail: "Escribir correo",
      callNow: "Llamar ahora",
      openWhatsapp: "Abrir WhatsApp",
      emailSubject:
        "Contacto desde la web de VANMOTION",
      whatsappMessage:
        "me gustaría solicitar información",
      locationFallback:
        "Mejorada del Campo · Madrid",
      appointment:
        "Atención y visitas mediante contacto o cita previa.",
    },

    schedule: {
      label: "Horario de atención",
      title: "Estamos al otro lado.",
      fallback:
        "Contacta con nosotros para confirmar disponibilidad y concertar una visita.",
    },

    social: {
      label: "Redes y contenido",
      title: "Sigue el movimiento.",
      comingSoon: "Próximamente",
    },

    collection: {
      label: "Colección VANMOTION",
      titleFirst: "¿Buscas un vehículo",
      titleSecond: "con personalidad?",
      description:
        "Consulta los vehículos disponibles y utiliza el formulario de cada ficha para solicitar información concreta.",
      action: "Explorar colección",
    },

    footer:
      "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    metadata: {
      title: "Contact",
      description:
        "Contact VANMOTION directly for information about vehicles, music, clothing and future projects.",
    },

    navigation: {
      home: "Home",
      collection: "Collection",
      contact: "Contact",
      vehicles: "View vehicles",
    },

    hero: {
      eyebrow: "Direct contact · Madrid",
      titleFirst: "Let us discuss the",
      titleSecond: "next movement.",
      description:
        "Vehicles, music production, design and projects with identity. Contact VANMOTION directly to receive further information.",
      visualFirst: "REAL",
      visualSecond: "CONTACT",
    },

    contactCards: {
      email: "Email address",
      phone: "Phone",
      whatsapp: "WhatsApp",
      location: "Location",
      pending: "Pending configuration",
      writeEmail: "Send email",
      callNow: "Call now",
      openWhatsapp: "Open WhatsApp",
      emailSubject:
        "Contact from the VANMOTION website",
      whatsappMessage:
        "I would like to request information",
      locationFallback:
        "Mejorada del Campo · Madrid",
      appointment:
        "Assistance and visits are available by prior contact or appointment.",
    },

    schedule: {
      label: "Opening hours",
      title: "We are here for you.",
      fallback:
        "Contact us to confirm availability and arrange a visit.",
    },

    social: {
      label: "Social media and content",
      title: "Follow the movement.",
      comingSoon: "Coming soon",
    },

    collection: {
      label: "VANMOTION Collection",
      titleFirst: "Looking for a vehicle",
      titleSecond: "with personality?",
      description:
        "Browse the available vehicles and use the form on each listing to request specific information.",
      action: "Explore collection",
    },

    footer:
      "Vehicles · Music · Design · Madrid",
  },
} as const;

function externalUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function ContactoPage() {
  const [settings, language] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: {
        id: "main",
      },
    }),

    getCurrentLanguage(),
  ]);

  const content = translations[language];

  const businessName =
    settings?.businessName ?? "VANMOTION";

  const location = [
    settings?.address,
    settings?.postalCode,
    settings?.city,
  ]
    .filter(Boolean)
    .join(" · ");

  const whatsappNumber =
    settings?.whatsapp?.replace(/\D/g, "") ?? "";

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `${
          language === "es" ? "Hola" : "Hello"
        } ${businessName}, ${
          content.contactCards.whatsappMessage
        }.`,
      )}`
    : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          {businessName}
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

          <Link
            href="/contacto"
            className={styles.active}
            aria-current="page"
          >
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
      </header>

      <section className={styles.hero}>
        <div>
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
        </div>

        <div className={styles.heroWord}>
          <span>
            {content.hero.visualFirst}
          </span>

          <strong>
            {content.hero.visualSecond}
          </strong>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.contactGrid}>
          <article className={styles.contactCard}>
            <span className={styles.number}>
              01
            </span>

            <p className={styles.label}>
              {content.contactCards.email}
            </p>

            {settings?.email ? (
              <a
                href={`mailto:${settings.email}`}
                className={styles.contactValue}
              >
                {settings.email}
              </a>
            ) : (
              <p className={styles.emptyValue}>
                {content.contactCards.pending}
              </p>
            )}

            {settings?.email && (
              <a
                href={`mailto:${
                  settings.email
                }?subject=${encodeURIComponent(
                  content.contactCards
                    .emailSubject,
                )}`}
                className={styles.cardButton}
              >
                {
                  content.contactCards
                    .writeEmail
                }
                <span>→</span>
              </a>
            )}
          </article>

          <article className={styles.contactCard}>
            <span className={styles.number}>
              02
            </span>

            <p className={styles.label}>
              {content.contactCards.phone}
            </p>

            {settings?.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className={styles.contactValue}
              >
                {settings.phone}
              </a>
            ) : (
              <p className={styles.emptyValue}>
                {content.contactCards.pending}
              </p>
            )}

            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className={styles.cardButton}
              >
                {content.contactCards.callNow}
                <span>→</span>
              </a>
            )}
          </article>

          <article className={styles.contactCard}>
            <span className={styles.number}>
              03
            </span>

            <p className={styles.label}>
              {content.contactCards.whatsapp}
            </p>

            {settings?.whatsapp ? (
              <p className={styles.contactValue}>
                {settings.whatsapp}
              </p>
            ) : (
              <p className={styles.emptyValue}>
                {content.contactCards.pending}
              </p>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={
                  styles.primaryCardButton
                }
              >
                {
                  content.contactCards
                    .openWhatsapp
                }
                <span>→</span>
              </a>
            )}
          </article>

          <article className={styles.contactCard}>
            <span className={styles.number}>
              04
            </span>

            <p className={styles.label}>
              {content.contactCards.location}
            </p>

            {location ? (
              <p className={styles.contactValue}>
                {location}
              </p>
            ) : (
              <p className={styles.emptyValue}>
                {
                  content.contactCards
                    .locationFallback
                }
              </p>
            )}

            <p className={styles.cardNote}>
              {
                content.contactCards
                  .appointment
              }
            </p>
          </article>
        </div>

        <div className={styles.informationGrid}>
          <section className={styles.schedule}>
            <p className={styles.sectionLabel}>
              {content.schedule.label}
            </p>

            <h2>{content.schedule.title}</h2>

            <p className={styles.scheduleText}>
              {settings?.openingHours ??
                content.schedule.fallback}
            </p>
          </section>

          <section className={styles.social}>
            <p className={styles.sectionLabel}>
              {content.social.label}
            </p>

            <h2>{content.social.title}</h2>

            <div className={styles.socialLinks}>
              {settings?.instagram ? (
                <a
                  href={externalUrl(
                    settings.instagram,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram <span>↗</span>
                </a>
              ) : (
                <div>
                  Instagram
                  <span>
                    {content.social.comingSoon}
                  </span>
                </div>
              )}

              {settings?.youtube ? (
                <a
                  href={externalUrl(
                    settings.youtube,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube <span>↗</span>
                </a>
              ) : (
                <div>
                  YouTube
                  <span>
                    {content.social.comingSoon}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className={styles.collectionCallout}>
          <div>
            <p className={styles.sectionLabel}>
              {content.collection.label}
            </p>

            <h2>
              {content.collection.titleFirst}
              <br />
              {content.collection.titleSecond}
            </h2>
          </div>

          <div>
            <p>
              {content.collection.description}
            </p>

            <Link href="/coleccion">
              {content.collection.action}
              <span>→</span>
            </Link>
          </div>
        </section>
      </section>

      <footer className={styles.footer}>
        <strong>{businessName}</strong>

        <span>{content.footer}</span>

        <span>© 2026 VANMOTION</span>
      </footer>
    </main>
  );
}