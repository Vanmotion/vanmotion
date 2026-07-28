import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./privacidad.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://vanmotion.es/privacidad";

const translations = {
  es: {
    metadataTitle: "Política de privacidad",
    metadataDescription:
      "Información esencial sobre el tratamiento y la protección de datos personales en VANMOTION.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      label: "Protección de datos · VANMOTION",
      titleFirst: "Tus datos.",
      titleSecond: "Bajo control.",
      caption: "Uso necesario · protección · derechos",
      update: "Actualizado · 28 julio 2026",
    },
    owner: {
      eyebrow: "Responsable",
      title: "Quién cuida la información.",
      ownerName: "Titular",
      commercialName: "Marca",
      taxId: "NIF",
      phone: "Teléfono",
      email: "Correo",
    },
    privacy: {
      eyebrow: "Tratamiento esencial",
      title: "Solo lo necesario. Nada más.",
      items: [
        {
          title: "Qué datos utilizamos",
          text:
            "Datos de identificación y contacto, consultas, pedidos, envío, identificadores de pago y datos técnicos de seguridad. VANMOTION no recibe ni almacena el número completo de la tarjeta.",
        },
        {
          title: "Para qué y con qué base",
          text:
            "Atendemos consultas y medidas precontractuales, ejecutamos compras y entregas, cumplimos obligaciones legales y protegemos la web frente a fraude o usos indebidos. No enviamos publicidad sin una base válida.",
        },
        {
          title: "Proveedores y destinatarios",
          text:
            "Los datos necesarios pueden ser tratados por Vercel, el proveedor de base de datos, Resend, Stripe, transportistas, asesores y autoridades cuando proceda. VANMOTION no vende datos personales ni los cede para publicidad ajena.",
        },
        {
          title: "Transferencias internacionales",
          text:
            "Algunos proveedores tecnológicos pueden tratar datos fuera del Espacio Económico Europeo. Cuando sea necesario, se aplicarán decisiones de adecuación, cláusulas contractuales tipo u otras garantías reconocidas por el RGPD.",
        },
        {
          title: "Conservación y seguridad",
          text:
            "Los datos se conservan solo durante la gestión solicitada y los plazos legales aplicables. Se utilizan medidas de acceso privado, pago seguro mediante Stripe y controles técnicos destinados a evitar pérdida, alteración o acceso no autorizado.",
        },
        {
          title: "Tus derechos",
          text:
            "Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad, o retirar un consentimiento cuando corresponda. Escribe al correo indicado; si la respuesta no es adecuada, puedes reclamar ante la AEPD.",
        },
        {
          title: "Información adicional",
          text:
            "No se adoptan decisiones con efectos jurídicos basadas únicamente en procesos automatizados ni se elaboran perfiles publicitarios con formularios o pedidos. Los menores deben actuar con la intervención de sus representantes legales.",
        },
      ],
    },
    documents: {
      eyebrow: "Documentos relacionados",
      title: "Todo conectado.",
      cookies: "Cookies",
      purchase: "Condiciones de compra",
      legal: "Aviso legal",
      withdrawal: "Desistimiento",
    },
    references: {
      title: "Referencias oficiales",
      aepd: "Derechos · AEPD",
      rgpd: "RGPD · EUR-Lex",
      transfers: "Transferencias · AEPD",
      note:
        "Los enlaces oficiales se facilitan como referencia normativa y no implican certificación o respaldo institucional.",
    },
    footer: {
      city: "Madrid · España",
      contact: "Ejercer derechos",
      back: "Volver a VANMOTION",
    },
  },
  en: {
    metadataTitle: "Privacy policy",
    metadataDescription:
      "Essential information about the processing and protection of personal data at VANMOTION.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      label: "Data protection · VANMOTION",
      titleFirst: "Your data.",
      titleSecond: "Under control.",
      caption: "Necessary use · protection · rights",
      update: "Updated · 28 July 2026",
    },
    owner: {
      eyebrow: "Controller",
      title: "Who looks after the information.",
      ownerName: "Owner",
      commercialName: "Brand",
      taxId: "Tax ID",
      phone: "Telephone",
      email: "Email",
    },
    privacy: {
      eyebrow: "Essential processing",
      title: "Only what is needed. Nothing more.",
      items: [
        {
          title: "Data we use",
          text:
            "Identification and contact details, enquiries, orders, delivery information, payment identifiers and technical security data. VANMOTION does not receive or store the full card number.",
        },
        {
          title: "Purposes and legal bases",
          text:
            "We handle enquiries and pre-contractual steps, perform purchases and deliveries, comply with legal obligations and protect the website against fraud or misuse. We do not send advertising without a valid legal basis.",
        },
        {
          title: "Providers and recipients",
          text:
            "Necessary data may be processed by Vercel, the database provider, Resend, Stripe, carriers, advisers and authorities where appropriate. VANMOTION does not sell personal data or disclose it for unrelated advertising.",
        },
        {
          title: "International transfers",
          text:
            "Some technology providers may process data outside the European Economic Area. Where required, adequacy decisions, standard contractual clauses or other safeguards recognised by the GDPR will apply.",
        },
        {
          title: "Retention and security",
          text:
            "Data is kept only for the requested service and the applicable statutory periods. Private access, secure Stripe payments and technical controls are used to prevent loss, alteration or unauthorised access.",
        },
        {
          title: "Your rights",
          text:
            "You may request access, rectification, erasure, objection, restriction and portability, or withdraw consent where applicable. Write to the email shown; if the response is inadequate, you may complain to the Spanish Data Protection Agency.",
        },
        {
          title: "Additional information",
          text:
            "No decisions producing legal effects are made solely through automated processing, and enquiry or order data is not used to create advertising profiles. Children must act with the involvement of their legal representatives.",
        },
      ],
    },
    documents: {
      eyebrow: "Related documents",
      title: "Everything connected.",
      cookies: "Cookies",
      purchase: "Purchase conditions",
      legal: "Legal notice",
      withdrawal: "Withdrawal",
    },
    references: {
      title: "Official references",
      aepd: "Rights · AEPD",
      rgpd: "GDPR · EUR-Lex",
      transfers: "Transfers · AEPD",
      note:
        "Official links are provided as legal references and do not imply certification or institutional endorsement.",
    },
    footer: {
      city: "Madrid · Spain",
      contact: "Exercise rights",
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

export default async function PrivacyPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  const legal = {
    ownerName: requireLegalValue("LEGAL_OWNER_NAME"),
    nif: requireLegalValue("LEGAL_OWNER_NIF"),
    phone: requireLegalValue("LEGAL_PHONE"),
    email: requireLegalValue("LEGAL_EMAIL"),
  };

  const telephoneHref = legal.phone.replace(/[^\d+]/g, "");

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
          <Link href="/contacto">{content.navigation.contact}</Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="privacy-title">
          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.hero.update}</span>
          </div>

          <div className={styles.heroCopy}>
            <p>{content.hero.label}</p>
            <h1 id="privacy-title">
              <span>{content.hero.titleFirst}</span>
              <span>{content.hero.titleSecond}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.caption}</span>
            <a href={`mailto:${legal.email}`}>{content.footer.contact}</a>
          </div>
        </section>

        <section className={styles.ownerSection}>
          <div className={styles.ownerHeading}>
            <p className={styles.sectionLabel}>{content.owner.eyebrow}</p>
            <h2>{content.owner.title}</h2>
          </div>

          <dl className={styles.ownerGrid}>
            <div>
              <dt>{content.owner.ownerName}</dt>
              <dd>{legal.ownerName}</dd>
            </div>
            <div>
              <dt>{content.owner.commercialName}</dt>
              <dd>VANMOTION</dd>
            </div>
            <div>
              <dt>{content.owner.taxId}</dt>
              <dd>{legal.nif}</dd>
            </div>
            <div>
              <dt>{content.owner.phone}</dt>
              <dd>
                <a href={`tel:${telephoneHref}`}>{legal.phone}</a>
              </dd>
            </div>
            <div className={styles.ownerWide}>
              <dt>{content.owner.email}</dt>
              <dd>
                <a href={`mailto:${legal.email}`}>{legal.email}</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.privacySection}>
          <div className={styles.privacyHeading}>
            <p className={styles.sectionLabel}>{content.privacy.eyebrow}</p>
            <h2>{content.privacy.title}</h2>
          </div>

          <ol className={styles.privacyList}>
            {content.privacy.items.map((item, index) => (
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
            <Link href="/cookies">
              <span>01</span>
              <strong>{content.documents.cookies}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/condiciones-compra">
              <span>02</span>
              <strong>{content.documents.purchase}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/aviso-legal">
              <span>03</span>
              <strong>{content.documents.legal}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <Link href="/desistimiento">
              <span>04</span>
              <strong>{content.documents.withdrawal}</strong>
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
              href="https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.aepd}
            </a>
            <a
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.rgpd}
            </a>
            <a
              href="https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/garantias-transferencias-datos-personales"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.transfers}
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <div className={styles.footerLinks}>
          <a href={`mailto:${legal.email}`}>{content.footer.contact}</a>
          <Link href="/">{content.footer.back}</Link>
        </div>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
