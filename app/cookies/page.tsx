import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./cookies.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://vanmotion.es/cookies";

const translations = {
  es: {
    metadataTitle: "Política de cookies",
    metadataDescription:
      "Información esencial sobre las cookies técnicas utilizadas por VANMOTION.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      label: "Cookies · VANMOTION",
      titleFirst: "Solo lo",
      titleSecond: "necesario.",
      caption: "2 técnicas · 0 publicitarias · 0 perfiles",
      update: "Actualizado · 28 julio 2026",
      action: "Ver configuración",
    },
    summary: {
      eyebrow: "Configuración actual",
      title: "Nada oculto. Nada de seguimiento.",
      technicalCount: "2",
      technicalLabel: "cookies técnicas",
      advertisingCount: "0",
      advertisingLabel: "cookies publicitarias",
      profilingCount: "0",
      profilingLabel: "perfiles de navegación",
    },
    details: {
      eyebrow: "Uso esencial",
      title: "Funciones necesarias. Sin ruido comercial.",
      items: [
        {
          title: "Sin seguimiento comercial",
          text:
            "No utilizamos cookies publicitarias, de medición de audiencia, redes sociales ni elaboración de perfiles. La navegación pública instala únicamente las funciones técnicas descritas en esta página.",
        },
        {
          title: "vanmotion-language",
          text:
            "Recuerda el idioma elegido mediante el selector ES / EN. Es una cookie propia de personalización solicitada por el usuario y puede permanecer hasta 1 año.",
        },
        {
          title: "vanmotion_admin_session",
          text:
            "Protege y mantiene la sesión del panel privado. Solo afecta a personas administradoras autorizadas, dura hasta 8 horas y no se instala durante la navegación pública ordinaria.",
        },
        {
          title: "Consentimiento",
          text:
            "Estas cookies son técnicas y necesarias para funciones solicitadas por el usuario o para la seguridad del servicio, por lo que no requieren aceptación previa. Si se incorporan cookies no necesarias, se ofrecerán opciones equivalentes para aceptar, rechazar o configurar antes de instalarlas.",
        },
        {
          title: "Control desde el navegador",
          text:
            "Puedes consultar, bloquear o eliminar cookies desde la configuración de privacidad de tu navegador. Al eliminar la cookie de idioma se perderá esa preferencia; al bloquear la cookie administrativa, el panel privado no podrá mantener la sesión.",
        },
        {
          title: "Servicios externos",
          text:
            "Stripe Checkout, plataformas musicales, redes sociales y otras páginas externas pueden utilizar sus propias cookies cuando el usuario accede a sus dominios. Esas cookies se rigen por las políticas de cada proveedor.",
        },
      ],
    },
    documents: {
      eyebrow: "Documentos relacionados",
      title: "Todo conectado.",
      privacy: "Privacidad",
      purchase: "Condiciones de compra",
      withdrawal: "Desistimiento",
      legal: "Aviso legal",
    },
    references: {
      title: "Referencias oficiales",
      aepd: "Guía de cookies · AEPD",
      boe: "LSSI · BOE",
      note:
        "Los enlaces oficiales se facilitan como referencia normativa y no implican certificación o respaldo institucional.",
    },
    footer: {
      city: "Madrid · España",
      contact: "Consulta sobre cookies",
      back: "Volver a VANMOTION",
    },
  },
  en: {
    metadataTitle: "Cookie policy",
    metadataDescription:
      "Essential information about the technical cookies used by VANMOTION.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      label: "Cookies · VANMOTION",
      titleFirst: "Only what is",
      titleSecond: "necessary.",
      caption: "2 technical · 0 advertising · 0 profiles",
      update: "Updated · 28 July 2026",
      action: "View configuration",
    },
    summary: {
      eyebrow: "Current configuration",
      title: "Nothing hidden. No tracking.",
      technicalCount: "2",
      technicalLabel: "technical cookies",
      advertisingCount: "0",
      advertisingLabel: "advertising cookies",
      profilingCount: "0",
      profilingLabel: "browsing profiles",
    },
    details: {
      eyebrow: "Essential use",
      title: "Necessary functions. No commercial noise.",
      items: [
        {
          title: "No commercial tracking",
          text:
            "We do not use advertising, audience-measurement, social-media or profiling cookies. Public browsing installs only the technical functions described on this page.",
        },
        {
          title: "vanmotion-language",
          text:
            "Remembers the language selected through the ES / EN selector. It is a first-party personalisation cookie requested by the user and may remain for up to 1 year.",
        },
        {
          title: "vanmotion_admin_session",
          text:
            "Protects and maintains the private administration-panel session. It affects authorised administrators only, lasts up to 8 hours and is not installed during ordinary public browsing.",
        },
        {
          title: "Consent",
          text:
            "These cookies are technical and necessary for user-requested functions or service security, so prior acceptance is not required. If non-essential cookies are introduced, equivalent options to accept, reject or configure them will be provided before installation.",
        },
        {
          title: "Browser controls",
          text:
            "You can view, block or delete cookies through your browser privacy settings. Deleting the language cookie removes that preference; blocking the administration cookie prevents the private panel from maintaining its session.",
        },
        {
          title: "External services",
          text:
            "Stripe Checkout, music platforms, social networks and other external websites may use their own cookies when users access their domains. Those cookies are governed by each provider's policies.",
        },
      ],
    },
    documents: {
      eyebrow: "Related documents",
      title: "Everything connected.",
      privacy: "Privacy",
      purchase: "Purchase conditions",
      withdrawal: "Withdrawal",
      legal: "Legal notice",
    },
    references: {
      title: "Official references",
      aepd: "Cookie guide · AEPD",
      boe: "LSSI · BOE",
      note:
        "Official links are provided as legal references and do not imply certification or institutional endorsement.",
    },
    footer: {
      city: "Madrid · Spain",
      contact: "Cookie enquiry",
      back: "Return to VANMOTION",
    },
  },
} as const;

function requireLegalValue(variableName: string): string {
  const value = process.env[variableName]?.trim();

  if (!value) {
    throw new Error(`Falta la variable legal ${variableName}.`);
  }

  return value;
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

export default async function CookiePolicyPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];
  const legalEmail = requireLegalValue("LEGAL_EMAIL");

  const summaryItems = [
    {
      value: content.summary.technicalCount,
      label: content.summary.technicalLabel,
    },
    {
      value: content.summary.advertisingCount,
      label: content.summary.advertisingLabel,
    },
    {
      value: content.summary.profilingCount,
      label: content.summary.profilingLabel,
    },
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
        <section className={styles.hero} aria-labelledby="cookies-title">
          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.hero.update}</span>
          </div>

          <div className={styles.heroCopy}>
            <p>{content.hero.label}</p>
            <h1 id="cookies-title">
              <span>{content.hero.titleFirst}</span>
              <span>{content.hero.titleSecond}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.caption}</span>
            <Link href="#configuracion">{content.hero.action}</Link>
          </div>
        </section>

        <section className={styles.summarySection} id="configuracion">
          <div className={styles.summaryHeading}>
            <p className={styles.sectionLabel}>{content.summary.eyebrow}</p>
            <h2>{content.summary.title}</h2>
          </div>

          <div className={styles.summaryGrid}>
            {summaryItems.map((item) => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.detailsSection}>
          <div className={styles.detailsHeading}>
            <p className={styles.sectionLabel}>{content.details.eyebrow}</p>
            <h2>{content.details.title}</h2>
          </div>

          <ol className={styles.detailsList}>
            {content.details.items.map((item, index) => (
              <li key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.documentsSection}>
          <div>
            <p className={styles.documentsLabel}>{content.documents.eyebrow}</p>
            <h2>{content.documents.title}</h2>
          </div>

          <nav className={styles.documentsNav} aria-label={content.documents.eyebrow}>
            <Link href="/privacidad">
              <span>01</span>
              <strong>{content.documents.privacy}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/condiciones-compra">
              <span>02</span>
              <strong>{content.documents.purchase}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/desistimiento">
              <span>03</span>
              <strong>{content.documents.withdrawal}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/aviso-legal">
              <span>04</span>
              <strong>{content.documents.legal}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
          </nav>
        </section>

        <section className={styles.referencesSection}>
          <div>
            <p className={styles.documentsLabel}>{content.references.title}</p>
            <p>{content.references.note}</p>
          </div>

          <div className={styles.referencesLinks}>
            <a
              href="https://www.aepd.es/documento/guia-cookies.pdf"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.aepd}
            </a>
            <a
              href="https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758#a22"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.boe}
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav className={styles.footerLinks} aria-label={language === "es" ? "Enlaces finales" : "Final links"}>
          <a href={`mailto:${legalEmail}`}>{content.footer.contact}</a>
          <Link href="/">{content.footer.back}</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
