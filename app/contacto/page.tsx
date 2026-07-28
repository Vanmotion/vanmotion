import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { createContactRequest } from "@/actions/contactActions";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import styles from "./contacto.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://vanmotion.es/contacto";

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
    metadataTitle: "Contacto directo",
    metadataDescription:
      "Contacta directamente con VANMOTION para consultas sobre vehículos, música, ropa y colaboraciones.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      label: "Contacto directo · VANMOTION",
      first: "Hablemos.",
      second: "Sin rodeos.",
      foot: "Vehículos · música · ropa · colaboraciones",
    },
    intro: {
      eyebrow: "Un punto de contacto",
      title: "Una conversación real.",
      text:
        "Cuéntanos qué necesitas. Las consultas se revisan directamente desde VANMOTION y respondemos de forma personal.",
    },
    channels: {
      eyebrow: "Canales directos",
      email: "Correo",
      phone: "Teléfono",
      whatsapp: "WhatsApp",
      pending: "Pendiente de configurar",
      noteTitle: "Atención directa",
      note:
        "Las visitas y reuniones se coordinan siempre mediante contacto previo.",
      social: "Redes",
      comingSoon: "Próximamente",
    },
    form: {
      eyebrow: "Envía tu consulta",
      title: "Dinos lo necesario.",
      description:
        "Selecciona el área y facilita solo los datos imprescindibles para poder responderte.",
      successTitle: "Mensaje recibido",
      successDescription:
        "Tu consulta se ha registrado correctamente. VANMOTION se pondrá en contacto contigo.",
      topic: "Motivo de contacto *",
      name: "Nombre y apellidos *",
      namePlaceholder: "Nombre de la persona de contacto",
      email: "Correo electrónico *",
      emailPlaceholder: "correo@ejemplo.com",
      phone: "Teléfono",
      phonePlaceholder: "+34 600 000 000",
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
    metadataTitle: "Direct contact",
    metadataDescription:
      "Contact VANMOTION directly about vehicles, music, clothing and collaborations.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      label: "Direct contact · VANMOTION",
      first: "Let's talk.",
      second: "Straight to the point.",
      foot: "Vehicles · music · clothing · collaborations",
    },
    intro: {
      eyebrow: "One contact point",
      title: "A real conversation.",
      text:
        "Tell us what you need. Every enquiry is reviewed directly by VANMOTION and answered personally.",
    },
    channels: {
      eyebrow: "Direct channels",
      email: "Email",
      phone: "Telephone",
      whatsapp: "WhatsApp",
      pending: "Pending configuration",
      noteTitle: "Direct assistance",
      note:
        "Visits and meetings are always arranged through prior contact.",
      social: "Social media",
      comingSoon: "Coming soon",
    },
    form: {
      eyebrow: "Send your enquiry",
      title: "Tell us what matters.",
      description:
        "Choose the relevant area and provide only the details we need to answer.",
      successTitle: "Message received",
      successDescription:
        "Your enquiry has been registered successfully. VANMOTION will contact you.",
      topic: "Reason for contact *",
      name: "Full name *",
      namePlaceholder: "Name of the contact person",
      email: "Email address *",
      emailPlaceholder: "email@example.com",
      phone: "Telephone",
      phonePlaceholder: "+34 600 000 000",
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
          <Link href="/contacto" aria-current="page">
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

        <section className={styles.pathsSection}>
          <div>
            <p>{content.paths.eyebrow}</p>
            <h2>{content.paths.title}</h2>
          </div>

          <nav className={styles.pathLinks}>
            <Link href="/coleccion">
              <span>01</span>
              <strong>{content.paths.vehicles}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/musica">
              <span>02</span>
              <strong>{content.paths.music}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/ropa">
              <span>03</span>
              <strong>{content.paths.clothing}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
          </nav>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav className={styles.footerNav} aria-label={language === "es" ? "Enlaces legales" : "Legal links"}>
          <Link href="/aviso-legal">{content.footer.legalNotice}</Link>
          <Link href="/privacidad">{content.footer.privacy}</Link>
          <Link href="/cookies">{content.footer.cookies}</Link>
          <Link href="/condiciones-compra">{content.footer.purchaseConditions}</Link>
          <Link href="/desistimiento">{content.footer.withdrawal}</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
