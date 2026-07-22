import type { Metadata } from "next";
import Link from "next/link";

import { createContactRequest } from "@/actions/contactActions";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import styles from "./contacto.module.css";

export const dynamic = "force-dynamic";

type ContactoPageProps = {
  searchParams: Promise<{
    enviado?: string;
    motivo?: string;
    producto?: string;
    nombreProducto?: string;
    talla?: string;
    cantidad?: string;
  }>;
};

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

    success: {
      title: "Mensaje enviado correctamente",
      description:
        "Hemos recibido tu consulta. VANMOTION se pondrá en contacto contigo.",
    },

    form: {
      label: "Formulario general",
      titleFirst: "Cuéntanos",
      titleSecond: "qué necesitas.",
      description:
        "Utiliza este formulario para consultas sobre vehículos, música, ropa, colaboraciones o cualquier proyecto relacionado con VANMOTION.",
      topic: "Motivo de contacto *",
      name: "Nombre *",
      namePlaceholder: "Tu nombre",
      email: "Correo electrónico *",
      emailPlaceholder: "correo@ejemplo.com",
      phone: "Teléfono",
      phonePlaceholder: "+34 600 000 000",
      message: "Mensaje *",
      messagePlaceholder:
        "Cuéntanos con claridad en qué podemos ayudarte.",
      submit: "Enviar mensaje",
      privacy:
        "Responsable: VANMOTION. Finalidad: responder y gestionar tu solicitud. Legitimación: medidas precontractuales o interés legítimo, según la consulta.",
      privacyLink:
        "Más información y derechos en la Política de Privacidad.",
      topics: [
        {
          value: "GENERAL",
          label: "Consulta general",
        },
        {
          value: "VEHICLES",
          label: "Vehículos",
        },
        {
          value: "MUSIC",
          label: "Música",
        },
        {
          value: "CLOTHING",
          label: "Ropa",
        },
        {
          value: "PROJECTS",
          label: "Proyectos y colaboraciones",
        },
      ],
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
        "Consulta nuestra colección. Los vehículos disponibles incluyen un formulario específico para solicitar información.",
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

    success: {
      title: "Message sent successfully",
      description:
        "We received your enquiry. VANMOTION will contact you shortly.",
    },

    form: {
      label: "General contact form",
      titleFirst: "Tell us",
      titleSecond: "what you need.",
      description:
        "Use this form for enquiries about vehicles, music, clothing, collaborations or any project related to VANMOTION.",
      topic: "Reason for contact *",
      name: "Name *",
      namePlaceholder: "Your name",
      email: "Email address *",
      emailPlaceholder: "email@example.com",
      phone: "Phone",
      phonePlaceholder: "+34 600 000 000",
      message: "Message *",
      messagePlaceholder:
        "Tell us clearly how we can help.",
      submit: "Send message",
      privacy:
        "Controller: VANMOTION. Purpose: to respond to and manage your request. Legal basis: pre-contractual steps or legitimate interests, depending on the enquiry.",
      privacyLink:
        "Further information and rights in the Privacy Policy.",
      topics: [
        {
          value: "GENERAL",
          label: "General enquiry",
        },
        {
          value: "VEHICLES",
          label: "Vehicles",
        },
        {
          value: "MUSIC",
          label: "Music",
        },
        {
          value: "CLOTHING",
          label: "Clothing",
        },
        {
          value: "PROJECTS",
          label: "Projects and collaborations",
        },
      ],
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
        "Browse our collection. Available vehicles include a dedicated form for requesting information.",
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

export default async function ContactoPage({
  searchParams,
}: ContactoPageProps) {
  const [
    settings,
    language,
    contactParams,
  ] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: {
        id: "main",
      },
    }),

    getCurrentLanguage(),

    searchParams,
  ]);

  const content = translations[language];

  const {
    enviado,
    motivo,
    nombreProducto,
    talla,
    cantidad,
  } = contactParams;

  const defaultTopic =
    motivo === "ropa"
      ? "CLOTHING"
      : "GENERAL";

  const defaultMessage =
    motivo === "ropa"
      ? language === "es"
        ? [
            `Hola VANMOTION, estoy interesado en ${
              nombreProducto || "la camiseta CARPE DIEM"
            }.`,
            talla ? `Talla: ${talla}.` : "",
            cantidad ? `Cantidad: ${cantidad}.` : "",
            "Me gustaría confirmar disponibilidad, precio y condiciones de compra.",
          ]
            .filter(Boolean)
            .join("\n")
        : [
            `Hello VANMOTION, I am interested in ${
              nombreProducto || "the CARPE DIEM T-shirt"
            }.`,
            talla ? `Size: ${talla}.` : "",
            cantidad ? `Quantity: ${cantidad}.` : "",
            "I would like to confirm availability, price and purchase conditions.",
          ]
            .filter(Boolean)
            .join("\n")
      : "";

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

        <section
          className={styles.formSection}
          id="formulario"
        >
          <div className={styles.formIntro}>
            <p className={styles.sectionLabel}>
              {content.form.label}
            </p>

            <h2>
              {content.form.titleFirst}
              <br />
              {content.form.titleSecond}
            </h2>

            <p>
              {content.form.description}
            </p>
          </div>

          <div>
            {enviado === "1" && (
              <div
                className={styles.success}
                role="status"
              >
                <strong>
                  {content.success.title}
                </strong>

                <p>
                  {content.success.description}
                </p>
              </div>
            )}

            <form
              action={createContactRequest}
              className={styles.form}
            >
              <div className={styles.formFieldFull}>
                <label htmlFor="topic">
                  {content.form.topic}
                </label>

                <select
                  id="topic"
                  name="topic"
                  required
                  defaultValue={defaultTopic}
                >
                  {content.form.topics.map(
                    (topic) => (
                      <option
                        key={topic.value}
                        value={topic.value}
                      >
                        {topic.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="name">
                    {content.form.name}
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder={
                      content.form
                        .namePlaceholder
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="email">
                    {content.form.email}
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={180}
                    autoComplete="email"
                    placeholder={
                      content.form
                        .emailPlaceholder
                    }
                  />
                </div>
              </div>

              <div className={styles.formFieldFull}>
                <label htmlFor="phone">
                  {content.form.phone}
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={40}
                  autoComplete="tel"
                  placeholder={
                    content.form
                      .phonePlaceholder
                  }
                />
              </div>

              <div className={styles.formFieldFull}>
                <label htmlFor="message">
                  {content.form.message}
                </label>

                <textarea
                  id="message"
                  name="message"
                  required
                  maxLength={3000}
                  rows={7}
                  defaultValue={defaultMessage}
                  placeholder={
                    content.form
                      .messagePlaceholder
                  }
                />
              </div>

              <div className={styles.formFooter}>
                <p>
                  {content.form.privacy}{" "}

                  <Link href="/privacidad">
                    {content.form.privacyLink}
                  </Link>
                </p>

                <button type="submit">
                  {content.form.submit}
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </section>

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

              {settings?.tiktok ? (
                <a
                  href={externalUrl(
                    settings.tiktok,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  TikTok <span>↗</span>
                </a>
              ) : (
                <div>
                  TikTok
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