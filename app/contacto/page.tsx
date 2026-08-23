import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { createContactRequest } from "@/actions/contactActions";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import styles from "./contacto.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://www.vanmotion.es/contacto";

type ContactoPageProps = {
  searchParams: Promise<{
    enviado?: string;
    error?: string;
    motivo?: string;
    producto?: string;
    nombreProducto?: string;
    talla?: string;
    cantidad?: string;
  }>;
};

const translations = {
  es: {
    metadataTitle: "Contacto para vehículos, ropa y música en Madrid",
    metadataDescription:
      "Contacta con VANMOTION en Madrid para consultas sobre vehículos, ropa urbana, música, compras y colaboraciones. Atención directa y personal.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      label: "Contacto · VANMOTION",
      first: "Estamos aquí.",
      second: "Para ayudarte.",
      foot: "Vehículos · música · ropa · colaboraciones",
    },
    intro: {
      eyebrow: "Contacto",
      title: "Cuéntanos en qué podemos ayudarte.",
      text:
        "Leemos cada mensaje con atención y respondemos personalmente, con calma y cercanía.",
    },
    channels: {
      eyebrow: "Formas de contacto",
      email: "Correo",
      phone: "Teléfono",
      whatsapp: "WhatsApp",
      pending: "Pendiente de configurar",
      noteTitle: "Atención personal",
      note:
        "Las visitas y reuniones se coordinan previamente para poder atenderte bien.",
      social: "Redes",
      comingSoon: "Próximamente",
    },
    form: {
      eyebrow: "Envíanos tu mensaje",
      title: "Cuéntanos lo que necesites.",
      description:
        "Elige el área y comparte solo la información que consideres necesaria. Te responderemos personalmente.",
      successTitle: "Mensaje recibido",
      successDescription:
        "Tu consulta se ha registrado correctamente. VANMOTION se pondrá en contacto contigo.",
      deliveryWarningTitle: "Consulta registrada",
      deliveryWarningDescription:
        "Tu mensaje está guardado en VANMOTION, pero no hemos podido enviar la confirmación automática. No es necesario que vuelvas a enviarlo.",
      topic: "Motivo de contacto *",
      name: "Nombre y apellidos *",
      namePlaceholder: "Nombre de la persona de contacto",
      email: "Correo electrónico *",
      emailPlaceholder: "contacto@vanmotion.es",
      phone: "Teléfono",
      phonePlaceholder: "+34 648 254 959",
      message: "Mensaje *",
      messagePlaceholder: "Explica brevemente en qué podemos ayudarte.",
      submit: "Enviar mensaje",
      privacy:
        "Usaremos estos datos únicamente para responder y gestionar tu solicitud.",
      privacyLink: "Política de privacidad",
      topics: [
        { value: "GENERAL", label: "Consulta general" },
        { value: "VEHICLES", label: "Vehículos" },
        { value: "MUSIC", label: "Música" },
        { value: "CLOTHING", label: "Ropa" },
        { value: "PROJECTS", label: "Proyectos y colaboraciones" },
      ],
    },
    paths: {
      eyebrow: "Explora VANMOTION",
      title: "Tres caminos. Una identidad.",
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
    },
    footer: {
      city: "Madrid · España",
      legalNotice: "Aviso legal",
      privacy: "Privacidad",
      cookies: "Cookies",
      purchaseConditions: "Condiciones de compra",
      withdrawal: "Desistimiento",
    },
  },
  en: {
    metadataTitle: "Contact for vehicles, clothing and music in Madrid",
    metadataDescription:
      "Contact VANMOTION in Madrid about vehicles, urban clothing, music, purchases and collaborations. Direct and personal assistance.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      label: "Contact · VANMOTION",
      first: "We are here.",
      second: "To help.",
      foot: "Vehicles · music · clothing · collaborations",
    },
    intro: {
      eyebrow: "Contact",
      title: "Tell us how we can help.",
      text:
        "We read every message carefully and reply personally, with time and care.",
    },
    channels: {
      eyebrow: "Ways to contact us",
      email: "Email",
      phone: "Telephone",
      whatsapp: "WhatsApp",
      pending: "Pending configuration",
      noteTitle: "Personal attention",
      note:
        "Visits and meetings are arranged in advance so we can give you proper attention.",
      social: "Social media",
      comingSoon: "Coming soon",
    },
    form: {
      eyebrow: "Send us a message",
      title: "Tell us what you need.",
      description:
        "Choose the area and share only the information you consider necessary. We will reply personally.",
      successTitle: "Message received",
      successDescription:
        "Your enquiry has been registered successfully. VANMOTION will contact you.",
      deliveryWarningTitle: "Enquiry registered",
      deliveryWarningDescription:
        "Your message is safely stored by VANMOTION, but we could not send the automatic confirmation. You do not need to submit it again.",
      topic: "Reason for contact *",
      name: "Full name *",
      namePlaceholder: "Name of the contact person",
      email: "Email address *",
      emailPlaceholder: "contacto@vanmotion.es",
      phone: "Telephone",
      phonePlaceholder: "+34 648 254 959",
      message: "Message *",
      messagePlaceholder: "Briefly explain how we can help.",
      submit: "Send message",
      privacy:
        "We will use this information only to respond to and manage your request.",
      privacyLink: "Privacy policy",
      topics: [
        { value: "GENERAL", label: "General enquiry" },
        { value: "VEHICLES", label: "Vehicles" },
        { value: "MUSIC", label: "Music" },
        { value: "CLOTHING", label: "Clothing" },
        { value: "PROJECTS", label: "Projects and collaborations" },
      ],
    },
    paths: {
      eyebrow: "Explore VANMOTION",
      title: "Three paths. One identity.",
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
    },
    footer: {
      city: "Madrid · Spain",
      legalNotice: "Legal notice",
      privacy: "Privacy",
      cookies: "Cookies",
      purchaseConditions: "Purchase conditions",
      withdrawal: "Withdrawal",
    },
  },
} as const;

function externalUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function topicFromReason(reason?: string): string {
  switch (reason?.toLowerCase()) {
    case "ropa":
    case "clothing":
      return "CLOTHING";
    case "vehiculo":
    case "vehículos":
    case "vehiculos":
    case "vehicle":
      return "VEHICLES";
    case "musica":
    case "música":
    case "music":
      return "MUSIC";
    case "proyecto":
    case "colaboracion":
    case "colaboración":
    case "projects":
      return "PROJECTS";
    default:
      return "GENERAL";
  }
}

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
      title: content.metadataTitle,
      description: content.metadataDescription,
      type: "website",
      url: CANONICAL_URL,
      siteName: "VANMOTION",
    },
  };
}

export default async function ContactoPage({
  searchParams,
}: ContactoPageProps) {
  const [settings, language, contactParams] = await Promise.all([
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
    error,
    motivo,
    producto,
    nombreProducto,
    talla,
    cantidad,
  } = contactParams;

  const defaultTopic = topicFromReason(motivo);
  const productName =
    nombreProducto ||
    producto ||
    (language === "es" ? "la prenda VANMOTION" : "the VANMOTION garment");

  const defaultMessage =
    defaultTopic === "CLOTHING"
      ? language === "es"
        ? [
            `Hola VANMOTION, estoy interesado en ${productName}.`,
            talla ? `Talla: ${talla}.` : "",
            cantidad ? `Cantidad: ${cantidad}.` : "",
            "Me gustaría confirmar disponibilidad, precio y condiciones de compra.",
          ]
            .filter(Boolean)
            .join("\n")
        : [
            `Hello VANMOTION, I am interested in ${productName}.`,
            talla ? `Size: ${talla}.` : "",
            cantidad ? `Quantity: ${cantidad}.` : "",
            "I would like to confirm availability, price and purchase conditions.",
          ]
            .filter(Boolean)
            .join("\n")
      : "";

  const businessName = settings?.businessName ?? "VANMOTION";
  const whatsappNumber = settings?.whatsapp?.replace(/\D/g, "") ?? "";
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        language === "es"
          ? `Hola ${businessName}, me gustaría solicitar información.`
          : `Hello ${businessName}, I would like to request information.`,
      )}`
    : null;

  const socialLinks = [
    { label: "Instagram", value: settings?.instagram },
    { label: "YouTube", value: settings?.youtube },
    { label: "TikTok", value: settings?.tiktok },
  ];

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
          aria-label={language === "es" ? "Navegación principal" : "Main navigation"}
        >
          <Link href="/coleccion">{content.navigation.vehicles}</Link>
          <Link href="/musica">{content.navigation.music}</Link>
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
        <section className={styles.hero} aria-labelledby="contact-hero-title">
          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.hero.label}</span>
          </div>

          <div
            className={`${styles.heroCopy} ${language === "en" ? styles.heroCopyEnglish : ""}`}
          >
            <p>{content.hero.label}</p>
            <h1 id="contact-hero-title">
              <span>{content.hero.first}</span>
              <span>{content.hero.second}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.foot}</span>
            <Link href="#formulario">↓</Link>
          </div>
        </section>

        <section className={styles.introSection}>
          <p className={styles.sectionLabel}>{content.intro.eyebrow}</p>
          <div className={styles.introGrid}>
            <h2>{content.intro.title}</h2>
            <p>{content.intro.text}</p>
          </div>
        </section>

        <section className={styles.contactSection} id="formulario">
          <aside className={styles.channelsPanel}>
            <p className={styles.sectionLabel}>{content.channels.eyebrow}</p>

            <dl className={styles.contactList}>
              <div>
                <dt>{content.channels.email}</dt>
                <dd>
                  {settings?.email ? (
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  ) : (
                    content.channels.pending
                  )}
                </dd>
              </div>

              <div>
                <dt>{content.channels.phone}</dt>
                <dd>
                  {settings?.phone ? (
                    <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                  ) : (
                    content.channels.pending
                  )}
                </dd>
              </div>

              <div>
                <dt>{content.channels.whatsapp}</dt>
                <dd>
                  {whatsappUrl && settings?.whatsapp ? (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      {settings.whatsapp} ↗
                    </a>
                  ) : (
                    content.channels.pending
                  )}
                </dd>
              </div>
            </dl>

            <div className={styles.channelNote}>
              <strong>{content.channels.noteTitle}</strong>
              <p>{content.channels.note}</p>
            </div>

            <div className={styles.socialBlock}>
              <strong>{content.channels.social}</strong>
              <div>
                {socialLinks.map((social) =>
                  social.value ? (
                    <a
                      key={social.label}
                      href={externalUrl(social.value)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {social.label} ↗
                    </a>
                  ) : (
                    <span key={social.label}>
                      {social.label} · {content.channels.comingSoon}
                    </span>
                  ),
                )}
              </div>
            </div>
          </aside>

          <section className={styles.formPanel}>
            <div className={styles.formHeading}>
              <div>
                <p className={styles.sectionLabel}>{content.form.eyebrow}</p>
                <h2>{content.form.title}</h2>
              </div>
              <p>{content.form.description}</p>
            </div>

            {enviado === "1" && (
              <div className={styles.success} role="status">
                <strong>{content.form.successTitle}</strong>
                <p>{content.form.successDescription}</p>
              </div>
            )}

            {enviado === "0" && error === "correo" && (
              <div
                className={styles.success}
                role="alert"
                style={{
                  borderColor: "rgba(217, 120, 39, 0.65)",
                  background: "rgba(217, 120, 39, 0.09)",
                  color: "#f4d7bd",
                }}
              >
                <strong>{content.form.deliveryWarningTitle}</strong>
                <p>{content.form.deliveryWarningDescription}</p>
              </div>
            )}

            <form action={createContactRequest} className={styles.form}>
              <div className={styles.fieldFull}>
                <label htmlFor="topic">{content.form.topic}</label>
                <select id="topic" name="topic" required defaultValue={defaultTopic}>
                  {content.form.topics.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="contactName">{content.form.name}</label>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder={content.form.namePlaceholder}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">{content.form.email}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={180}
                    autoComplete="email"
                    placeholder={content.form.emailPlaceholder}
                  />
                </div>
              </div>

              <div className={styles.fieldFull}>
                <label htmlFor="phone">{content.form.phone}</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={40}
                  autoComplete="tel"
                  placeholder={content.form.phonePlaceholder}
                />
              </div>

              <div className={styles.fieldFull}>
                <label htmlFor="message">{content.form.message}</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  maxLength={3000}
                  rows={6}
                  defaultValue={defaultMessage}
                  placeholder={content.form.messagePlaceholder}
                />
              </div>

              <div className={styles.formFooter}>
                <p>
                  {content.form.privacy}{" "}
                  <Link href="/privacidad">{content.form.privacyLink}</Link>
                </p>
                <button type="submit">
                  {content.form.submit}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </section>
        </section>

        <nav
          className={styles.pathStrip}
          aria-label={
            language === "es"
              ? "Áreas de VANMOTION"
              : "VANMOTION areas"
          }
        >
          <Link href="/coleccion">
            {content.navigation.vehicles}
          </Link>
          <Link href="/musica">
            {content.navigation.music}
          </Link>
          <Link href="/ropa">
            {content.navigation.clothing}
          </Link>
        </nav>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav className={styles.footerNav} aria-label={language === "es" ? "Enlaces legales" : "Legal links"}>
          <Link href="/aviso-legal">Legal</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}

// CONTACTO HUMANO VANMOTION
