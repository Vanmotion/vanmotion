import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./privacidad.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://www.vanmotion.es/privacidad";

const translations = {
  es: {
    metadataTitle: "Política de privacidad",
    metadataDescription:
      "Política de privacidad de VANMOTION: datos tratados, finalidades, bases jurídicas, conservación y derechos.",
    nav: {
      home: "Inicio",
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
    },
    document: {
      kicker: "Documento legal · Protección de datos",
      title: "Política de privacidad",
      subtitle:
        "Información clara sobre el uso y la protección de los datos personales en VANMOTION.",
      updated: "Última actualización: 5 de agosto de 2026",
      legalFramework: "RGPD · LOPDGDD",
    },
    summary: {
      title: "Información esencial",
      controllerLabel: "Responsable",
      controllerValue: "VANMOTION",
      contactLabel: "Canal de contacto",
      contactValue: "Formulario de contacto",
      legalLabel: "Identificación legal",
      legalValue: "Disponible en el aviso legal",
    },
    sections: [
      {
        title: "Datos que tratamos",
        text:
          "Podemos tratar los datos que facilites al realizar una consulta o una compra: nombre, datos de contacto, dirección de entrega, información del pedido y comunicaciones relacionadas. También pueden tratarse datos técnicos necesarios para la seguridad y el funcionamiento de la web. VANMOTION no recibe ni almacena el número completo de tu tarjeta bancaria.",
      },
      {
        title: "Finalidades y bases jurídicas",
        text:
          "Usamos los datos para responder consultas y solicitudes precontractuales, gestionar pedidos, pagos, entregas y atención posterior, cumplir obligaciones legales y proteger la web frente a fraude o usos indebidos. Las bases jurídicas son la aplicación de medidas precontractuales, la ejecución del contrato, el cumplimiento de obligaciones legales, el interés legítimo en la seguridad y, cuando corresponda, tu consentimiento.",
      },
      {
        title: "Destinatarios y proveedores",
        text:
          "Los datos estrictamente necesarios pueden ser tratados por proveedores de alojamiento e infraestructura, base de datos, correo transaccional, pagos, transporte, soporte técnico, asesoramiento profesional y autoridades competentes cuando exista obligación legal. VANMOTION no vende datos personales ni los comunica para publicidad de terceros.",
      },
      {
        title: "Transferencias internacionales",
        text:
          "Algunos proveedores tecnológicos pueden prestar servicios desde países situados fuera del Espacio Económico Europeo. Cuando resulte aplicable, el tratamiento se amparará en una decisión de adecuación, cláusulas contractuales tipo u otras garantías reconocidas por la normativa de protección de datos.",
      },
      {
        title: "Conservación y seguridad",
        text:
          "Los datos se conservarán durante el tiempo necesario para atender la finalidad correspondiente y, después, durante los plazos exigidos para cumplir obligaciones legales o atender posibles responsabilidades. Se aplican medidas razonables de control de acceso, confidencialidad, integridad y seguridad de pagos.",
      },
      {
        title: "Tus derechos",
        text:
          "Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad, así como retirar el consentimiento cuando esa sea la base del tratamiento. Puedes ejercerlos mediante el formulario de contacto. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos.",
      },
      {
        title: "Decisiones automatizadas y menores",
        text:
          "No se adoptan decisiones con efectos jurídicos basadas únicamente en tratamientos automatizados ni se elaboran perfiles publicitarios a partir de consultas o pedidos. Los menores deberán utilizar los servicios con la intervención de sus representantes legales cuando sea necesario.",
      },
    ],
    closing: {
      title: "Control y transparencia",
      text:
        "Esta política podrá actualizarse cuando cambien los servicios, los proveedores o la normativa aplicable. La versión publicada en esta página será la vigente.",
      contact: "Ejercer derechos",
      legal: "Consultar aviso legal",
      cookies: "Política de cookies",
      aepd: "Agencia Española de Protección de Datos",
      back: "Volver a VANMOTION",
    },
  },
  en: {
    metadataTitle: "Privacy policy",
    metadataDescription:
      "VANMOTION privacy policy: data processed, purposes, legal bases, retention and rights.",
    nav: {
      home: "Home",
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
    },
    document: {
      kicker: "Legal document · Data protection",
      title: "Privacy policy",
      subtitle:
        "Clear information about the use and protection of personal data at VANMOTION.",
      updated: "Last updated: 5 August 2026",
      legalFramework: "GDPR · Spanish data protection law",
    },
    summary: {
      title: "Essential information",
      controllerLabel: "Controller",
      controllerValue: "VANMOTION",
      contactLabel: "Contact channel",
      contactValue: "Contact form",
      legalLabel: "Legal identification",
      legalValue: "Available in the legal notice",
    },
    sections: [
      {
        title: "Data we process",
        text:
          "We may process the data you provide when making an enquiry or purchase: name, contact details, delivery address, order information and related communications. Technical data required for website security and operation may also be processed. VANMOTION does not receive or store your full card number.",
      },
      {
        title: "Purposes and legal bases",
        text:
          "We use data to answer enquiries and pre-contractual requests, manage orders, payments, deliveries and after-sales support, comply with legal obligations and protect the website against fraud or misuse. The legal bases are pre-contractual steps, performance of a contract, compliance with legal obligations, legitimate interests in security and, where applicable, your consent.",
      },
      {
        title: "Recipients and providers",
        text:
          "Strictly necessary data may be processed by hosting and infrastructure, database, transactional email, payment, transport, technical support and professional advisory providers, and by competent authorities where legally required. VANMOTION does not sell personal data or disclose it for third-party advertising.",
      },
      {
        title: "International transfers",
        text:
          "Some technology providers may deliver services from countries outside the European Economic Area. Where applicable, processing will rely on an adequacy decision, standard contractual clauses or other safeguards recognised by data protection law.",
      },
      {
        title: "Retention and security",
        text:
          "Data will be kept for as long as necessary for the relevant purpose and then for the periods required to comply with legal obligations or address potential liabilities. Reasonable access control, confidentiality, integrity and payment-security measures are applied.",
      },
      {
        title: "Your rights",
        text:
          "You may request access, rectification, erasure, objection, restriction and portability, and withdraw consent where consent is the legal basis. You may exercise these rights through the contact form. You may also lodge a complaint with the Spanish Data Protection Agency.",
      },
      {
        title: "Automated decisions and children",
        text:
          "No decisions producing legal effects are made solely through automated processing, and enquiry or order data is not used to create advertising profiles. Children must use the services with the involvement of their legal representatives where required.",
      },
    ],
    closing: {
      title: "Control and transparency",
      text:
        "This policy may be updated when services, providers or applicable law change. The version published on this page will be the current version.",
      contact: "Exercise your rights",
      legal: "View legal notice",
      cookies: "Cookie policy",
      aepd: "Spanish Data Protection Agency",
      back: "Return to VANMOTION",
    },
  },
} as const;

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
      images: [
        {
          url: "/vehiculos/portada-inicio-vehiculos.webp",
          alt: "VANMOTION · Madrid",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadataTitle,
      description: content.metadataDescription,
      images: ["/vehiculos/portada-inicio-vehiculos.webp"],
    },
  };
}

export default async function PrivacyPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return (
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <Link href="/" className={styles.brand} aria-label={content.nav.home}>
          <Image
            src="/brand/vanmotion-mark.webp"
            alt=""
            width={76}
            height={36}
            priority
            className={styles.brandMark}
          />
          <span>VANMOTION</span>
        </Link>

        <nav className={styles.navigation} aria-label={content.nav.home}>
          <Link href="/coleccion">{content.nav.vehicles}</Link>
          <Link href="/musica">{content.nav.music}</Link>
          <Link href="/ropa">{content.nav.clothing}</Link>
        </nav>
      </header>

      <main className={styles.workspace}>
        <article className={styles.sheet} aria-labelledby="privacy-title">
          <header className={styles.documentHeader}>
            <div className={styles.documentIdentity}>
              <Image
                src="/brand/vanmotion-mark.webp"
                alt=""
                width={90}
                height={44}
                className={styles.documentMark}
              />
              <div>
                <strong>VANMOTION</strong>
                <span>{content.document.legalFramework}</span>
              </div>
            </div>

            <div className={styles.documentMeta}>
              <span>VM · PRIVACY · 01</span>
              <span>{content.document.updated}</span>
            </div>
          </header>

          <section className={styles.titleBlock}>
            <p>{content.document.kicker}</p>
            <h1 id="privacy-title">{content.document.title}</h1>
            <p className={styles.subtitle}>{content.document.subtitle}</p>
          </section>

          <section className={styles.summary} aria-labelledby="summary-title">
            <h2 id="summary-title">{content.summary.title}</h2>
            <dl>
              <div>
                <dt>{content.summary.controllerLabel}</dt>
                <dd>{content.summary.controllerValue}</dd>
              </div>
              <div>
                <dt>{content.summary.contactLabel}</dt>
                <dd>
                  <Link href="/contacto">{content.summary.contactValue}</Link>
                </dd>
              </div>
              <div>
                <dt>{content.summary.legalLabel}</dt>
                <dd>
                  <Link href="/aviso-legal">{content.summary.legalValue}</Link>
                </dd>
              </div>
            </dl>
          </section>

          <ol className={styles.sections}>
            {content.sections.map((section, index) => (
              <li key={section.title}>
                <span className={styles.sectionNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className={styles.closing}>
            <div>
              <span>VANMOTION · PRIVACIDAD</span>
              <h2>{content.closing.title}</h2>
              <p>{content.closing.text}</p>
            </div>

            <nav className={styles.documentLinks} aria-label={content.closing.title}>
              <Link href="/contacto">{content.closing.contact}</Link>
              <Link href="/aviso-legal">{content.closing.legal}</Link>
              <Link href="/cookies">{content.closing.cookies}</Link>
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noreferrer"
              >
                {content.closing.aepd}
              </a>
            </nav>
          </section>

          <footer className={styles.documentFooter}>
            <span>© 2026 VANMOTION · Madrid · España</span>
            <Link href="/">{content.closing.back}</Link>
          </footer>
        </article>
      </main>
    </div>
  );
}
