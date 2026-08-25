import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./aviso-legal.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://www.vanmotion.es/aviso-legal";

const translations = {
  es: {
    metadataTitle: "Aviso legal",
    metadataDescription:
      "Información esencial sobre el titular, el uso y los contenidos de VANMOTION.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      label: "Información legal · VANMOTION",
      titleFirst: "Información clara.",
      titleSecond: "Uso responsable.",
      caption: "Titular · contenidos · responsabilidades",
      update: "Actualizado · 28 julio 2026",
    },
    owner: {
      eyebrow: "Identificación",
      title: "Quién responde de VANMOTION.",
      ownerName: "Titular",
      commercialName: "Marca",
      taxId: "NIF",
      legalStatus: "Condición",
      legalStatusValue: "Trabajador autónomo",
      phone: "Teléfono",
      email: "Correo",
    },
    legal: {
      eyebrow: "Uso esencial",
      title: "Lo importante, sin letra pequeña.",
      items: [
        {
          title: "Objeto del sitio",
          text:
            "VANMOTION presenta un proyecto propio de vehículos, música, ropa y diseño. La web permite informar, mostrar productos y vehículos, recibir consultas y, cuando proceda, formalizar compras o contrataciones electrónicas.",
        },
        {
          title: "Uso permitido",
          text:
            "La persona usuaria debe navegar y utilizar los servicios de forma lícita, responsable y respetuosa. No se permite dañar la web, intentar accesos no autorizados, introducir código malicioso, falsear datos o utilizar los contenidos para actividades ilegales.",
        },
        {
          title: "Contenido y propiedad",
          text:
            "Los textos, diseños, fotografías, vídeos, música, marcas, logotipos y demás materiales originales pertenecen a VANMOTION o se utilizan con autorización. No pueden copiarse, modificarse, distribuirse ni explotarse comercialmente sin permiso o habilitación legal.",
        },
        {
          title: "Información comercial",
          text:
            "Las fichas, precios, impuestos, disponibilidad, envío y condiciones aplicables se muestran antes de confirmar una compra. Las condiciones específicas aceptadas en cada pedido prevalecen para esa operación.",
        },
        {
          title: "Disponibilidad y enlaces",
          text:
            "VANMOTION procura mantener la información correcta y el servicio disponible, aunque pueden existir actualizaciones, errores puntuales o interrupciones técnicas. Los enlaces externos conducen a servicios de terceros con sus propias condiciones y políticas.",
        },
        {
          title: "Responsabilidad razonable",
          text:
            "VANMOTION responde de sus obligaciones legales y contractuales. No responde de usos contrarios a estas condiciones, daños causados por terceros, incidencias inevitables fuera de su control o decisiones tomadas únicamente con información externa o desactualizada.",
        },
        {
          title: "Ley aplicable y contacto",
          text:
            "El sitio se rige por la legislación española. Los derechos irrenunciables de consumidores y usuarios permanecen plenamente aplicables. Para cualquier consulta, incidencia o comunicación legal deben utilizarse el teléfono o el correo indicados en esta página.",
        },
      ],
    },
    documents: {
      eyebrow: "Documentos relacionados",
      title: "Todo conectado.",
      privacy: "Privacidad",
      purchase: "Condiciones de compra",
      cookies: "Cookies",
      withdrawal: "Desistimiento",
    },
    references: {
      title: "Referencias oficiales",
      lssi: "LSSI-CE · BOE",
      consumers: "Consumidores · BOE",
      intellectualProperty: "Propiedad intelectual · BOE",
      note:
        "Los enlaces oficiales se facilitan como referencia normativa y no implican certificación o respaldo institucional.",
    },
    footer: {
      city: "Madrid · España",
      contact: "Contactar",
      back: "Volver a VANMOTION",
    },
  },
  en: {
    metadataTitle: "Legal notice",
    metadataDescription:
      "Essential information about the owner, use and content of VANMOTION.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      label: "Legal information · VANMOTION",
      titleFirst: "Clear information.",
      titleSecond: "Responsible use.",
      caption: "Owner · content · responsibilities",
      update: "Updated · 28 July 2026",
    },
    owner: {
      eyebrow: "Identification",
      title: "Who is responsible for VANMOTION.",
      ownerName: "Owner",
      commercialName: "Brand",
      taxId: "Tax ID",
      legalStatus: "Status",
      legalStatusValue: "Self-employed professional",
      phone: "Telephone",
      email: "Email",
    },
    legal: {
      eyebrow: "Essential use",
      title: "What matters, without fine print.",
      items: [
        {
          title: "Purpose of the website",
          text:
            "VANMOTION presents an original project involving vehicles, music, clothing and design. The website provides information, displays products and vehicles, receives enquiries and, where applicable, enables electronic purchases or contracts.",
        },
        {
          title: "Permitted use",
          text:
            "Users must browse and use the services lawfully, responsibly and respectfully. Damaging the website, attempting unauthorised access, introducing malicious code, providing false data or using the content for unlawful activities is prohibited.",
        },
        {
          title: "Content and ownership",
          text:
            "Original texts, designs, photographs, videos, music, trademarks, logos and other materials belong to VANMOTION or are used with permission. They may not be copied, modified, distributed or commercially exploited without permission or a legal entitlement.",
        },
        {
          title: "Commercial information",
          text:
            "Product details, prices, taxes, availability, delivery and applicable terms are shown before a purchase is confirmed. The specific terms accepted for each order govern that transaction.",
        },
        {
          title: "Availability and links",
          text:
            "VANMOTION aims to keep information accurate and the service available, although updates, occasional errors or technical interruptions may occur. External links lead to third-party services governed by their own terms and policies.",
        },
        {
          title: "Reasonable liability",
          text:
            "VANMOTION remains responsible for its legal and contractual obligations. It is not responsible for use contrary to these terms, damage caused by third parties, unavoidable incidents outside its control or decisions based solely on external or outdated information.",
        },
        {
          title: "Applicable law and contact",
          text:
            "The website is governed by Spanish law. Mandatory consumer rights remain fully applicable. Any enquiry, incident or legal communication should be sent using the telephone number or email address shown on this page.",
        },
      ],
    },
    documents: {
      eyebrow: "Related documents",
      title: "Everything connected.",
      privacy: "Privacy",
      purchase: "Purchase conditions",
      cookies: "Cookies",
      withdrawal: "Withdrawal",
    },
    references: {
      title: "Official references",
      lssi: "E-commerce law · BOE",
      consumers: "Consumer law · BOE",
      intellectualProperty: "Intellectual property · BOE",
      note:
        "Official links are provided as legal references and do not imply certification or institutional endorsement.",
    },
    footer: {
      city: "Madrid · Spain",
      contact: "Contact",
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

export default async function LegalNoticePage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  const legal = {
    ownerName: requireLegalValue("LEGAL_OWNER_NAME"),
    nif: requireLegalValue("LEGAL_OWNER_NIF"),
    phone: requireLegalValue("LEGAL_PHONE"),
    email: requireLegalValue("LEGAL_EMAIL"),
  };

  const telephoneHref = legal.phone.replace(/[^\d+]/g, "");

  const compact =
    language === "es"
      ? {
          eyebrow: "Información esencial",
          title: "Legal.",
          introduction:
            "Lo imprescindible, claro y accesible, reunido en una sola página.",
          identity: "Identificación",
          owner: "Titular",
          taxId: "NIF",
          phone: "Teléfono",
          email: "Correo electrónico",
          documentsLabel: "Documentación legal",
          documents: [
            {
              href: "/privacidad",
              label: "Privacidad",
              note: "Usamos solo los datos necesarios para responder consultas, gestionar pedidos y mantener la seguridad del servicio. Puedes ejercer tus derechos mediante el correo indicado.",
            },
            {
              href: "/cookies",
              label: "Cookies",
              note: "La navegación pública utiliza únicamente cookies técnicas necesarias. Los servicios externos aplican sus propias políticas cuando se abren.",
            },
            {
              href: "/condiciones-compra",
              label: "Compra",
              note: "Antes del pago se muestran el producto, el precio y las condiciones. El cobro se realiza mediante Stripe y VANMOTION no guarda el número completo de la tarjeta.",
            },
            {
              href: "/desistimiento",
              label: "Desistimiento",
              note: "Las solicitudes de devolución se comunican mediante el formulario de desistimiento y se tramitan conforme a las condiciones de compra.",
            },
          ],
          contact: "Contacto",
          back: "Volver al inicio",
        }
      : {
          eyebrow: "Essential information",
          title: "Legal.",
          introduction:
            "The essentials, clear and accessible, brought together on one page.",
          identity: "Identification",
          owner: "Owner",
          taxId: "Tax ID",
          phone: "Telephone",
          email: "Email",
          documentsLabel: "Legal documentation",
          documents: [
            {
              href: "/privacidad",
              label: "Privacy",
              note: "We use only the data needed to answer enquiries, manage orders and maintain service security. You may exercise your rights through the email shown.",
            },
            {
              href: "/cookies",
              label: "Cookies",
              note: "Public browsing uses only necessary technical cookies. External services apply their own policies when opened.",
            },
            {
              href: "/condiciones-compra",
              label: "Purchases",
              note: "The product, price and terms are shown before payment. Payment is processed through Stripe and VANMOTION does not store the full card number.",
            },
            {
              href: "/desistimiento",
              label: "Withdrawal",
              note: "Return requests are submitted through the withdrawal form and processed according to the purchase conditions.",
            },
          ],
          contact: "Contact",
          back: "Back to home",
        };

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

      <main className={styles.compactMain}>
        <section
          className={styles.compactLegal}
          aria-labelledby="legal-title"
        >
          <div className={styles.compactTopline}>
            <span>VANMOTION · MADRID</span>
            <span>© 2026</span>
          </div>

          <div className={styles.compactHeading}>
            <div>
              <p className={styles.compactEyebrow}>{compact.eyebrow}</p>
              <h1 id="legal-title" className={styles.compactTitle}>
                {compact.title}
              </h1>
            </div>

            <p className={styles.compactIntroduction}>
              {compact.introduction}
            </p>
          </div>

          <div className={styles.compactGrid}>
            <section className={styles.compactIdentity}>
              <h2>{compact.identity}</h2>

              <dl>
                <div>
                  <dt>{compact.owner}</dt>
                  <dd>{legal.ownerName} · VANMOTION</dd>
                </div>

                <div>
                  <dt>{compact.taxId}</dt>
                  <dd>{legal.nif}</dd>
                </div>

                {legal.phone && legal.phone !== "No disponible" && (
                  <div>
                    <dt>{compact.phone}</dt>
                    <dd>
                      <a href={`tel:${telephoneHref}`}>{legal.phone}</a>
                    </dd>
                  </div>
                )}

                <div>
                  <dt>{compact.email}</dt>
                  <dd>
                    <a href={`mailto:${legal.email}`}>{legal.email}</a>
                  </dd>
                </div>
              </dl>
            </section>

            <section
              className={styles.compactDocuments}
              aria-label={compact.documentsLabel}
            >
              {compact.documents.map((document, index) => (
                <article key={document.label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>

                  <div>
                    <strong>{document.label}</strong>
                    <small>{document.note}</small>
                  </div>
                </article>
              ))}
            </section>
          </div>

          <div className={styles.compactActions}>
            <Link href="/contacto">
              {compact.contact}
              <span aria-hidden="true">↗</span>
            </Link>

            <Link href="/">{compact.back}</Link>
          </div>
        </section>
      </main>

      <footer className={styles.compactFooter}>
        <strong>VANMOTION</strong>
        <span>Madrid · España · © 2026</span>
      </footer>
    </div>
  );
}
