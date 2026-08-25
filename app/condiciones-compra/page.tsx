import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "./condiciones-compra.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://vanmotion.es/condiciones-compra";

const translations = {
  es: {
    metadataTitle: "Condiciones de compra",
    metadataDescription:
      "Información esencial sobre las compras online realizadas en VANMOTION.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      update: "Actualizado · 28 julio 2026",
      eyebrow: "Compra online · VANMOTION",
      first: "Compra clara.",
      second: "Sin letra pequeña.",
      foot: "Producto · talla · cantidad · precio · entrega",
      action: "Ver condiciones",
    },
    seller: {
      eyebrow: "Responsable",
      title: "Quién responde de cada pedido.",
      ownerName: "Titular",
      commercialName: "Marca",
      taxId: "NIF",
      phone: "Teléfono",
      email: "Correo",
    },
    essentials: {
      eyebrow: "Condiciones esenciales",
      title: "Lo importante, antes de pagar.",
      intro:
        "Estas condiciones se aplican a las compras de productos físicos realizadas en vanmotion.es.",
      rows: [
        {
          title: "Compra y pago",
          text:
            "El cliente revisa producto, talla, cantidad y precio antes de pagar. Stripe procesa el pago y el pedido queda confirmado cuando VANMOTION registra correctamente la operación.",
        },
        {
          title: "Precio y entrega",
          text:
            "Los precios se muestran en euros con los impuestos aplicables. El envío ordinario dentro de España está incluido y el plazo previsto es de 5 a 10 días laborables.",
        },
        {
          title: "Stock e incidencias",
          text:
            "Si una unidad pagada no pudiera entregarse, VANMOTION contactará con el cliente para ofrecer reposición aceptada, cambio de producto o reembolso íntegro.",
        },
        {
          title: "Desistimiento y devolución",
          text:
            "El consumidor dispone de 14 días naturales desde la recepción para desistir. Tras comunicarlo, debe devolver el producto dentro de los 14 días siguientes y asumir el coste directo de la devolución voluntaria.",
        },
        {
          title: "Reembolso y garantía",
          text:
            "El reembolso se realiza por el mismo medio de pago dentro del plazo legal. Los productos nuevos cuentan con tres años de garantía legal frente a faltas de conformidad.",
        },
        {
          title: "Datos y aceptación",
          text:
            "VANMOTION no almacena el número completo de la tarjeta. Al aceptar y continuar con el pago, el cliente confirma que ha leído estas condiciones, la privacidad y la información de desistimiento.",
        },
      ],
    },
    action: {
      eyebrow: "Gestión directa",
      title: "Desistimiento. Claro y directo.",
      text:
        "Utiliza el formulario específico para comunicar el desistimiento y dejar constancia de la solicitud.",
      link: "Abrir desistimiento",
    },
    related: {
      eyebrow: "Documentos relacionados",
      title: "Todo conectado.",
      items: [
        { number: "01", label: "Privacidad", href: "/privacidad" },
        { number: "02", label: "Aviso legal", href: "/aviso-legal" },
        { number: "03", label: "Cookies", href: "/cookies" },
        { number: "04", label: "Desistimiento", href: "/desistimiento" },
      ],
    },
    references: {
      title: "Referencias oficiales",
      note:
        "Los enlaces oficiales se facilitan como referencia normativa y no implican certificación o respaldo institucional.",
      consumers: "Consumidores · BOE",
      ecommerce: "Comercio electrónico · BOE",
      data: "Protección de datos · EUR-Lex",
    },
    footer: {
      city: "Madrid · España",
      contact: "Contactar",
      back: "Volver a VANMOTION",
    },
  },
  en: {
    metadataTitle: "Purchase terms",
    metadataDescription:
      "Essential information about online purchases made through VANMOTION.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      update: "Updated · 28 July 2026",
      eyebrow: "Online purchase · VANMOTION",
      first: "Clear purchase.",
      second: "No fine print.",
      foot: "Product · size · quantity · price · delivery",
      action: "View terms",
    },
    seller: {
      eyebrow: "Responsible seller",
      title: "Who answers for every order.",
      ownerName: "Owner",
      commercialName: "Brand",
      taxId: "Tax ID",
      phone: "Telephone",
      email: "Email",
    },
    essentials: {
      eyebrow: "Essential terms",
      title: "What matters, before payment.",
      intro:
        "These terms apply to purchases of physical products made through vanmotion.es.",
      rows: [
        {
          title: "Purchase and payment",
          text:
            "Customers review the product, size, quantity and price before paying. Stripe processes the payment and the order is confirmed when VANMOTION correctly records the transaction.",
        },
        {
          title: "Price and delivery",
          text:
            "Prices are shown in euros and include applicable taxes. Standard delivery within Spain is included and the expected period is 5 to 10 working days.",
        },
        {
          title: "Stock and incidents",
          text:
            "If a paid item cannot be supplied, VANMOTION will contact the customer to offer an accepted restock, a product change or a full refund.",
        },
        {
          title: "Withdrawal and returns",
          text:
            "Consumers have 14 calendar days from receipt to withdraw. After giving notice, the product must be returned within the following 14 days and the customer bears the direct cost of a voluntary return.",
        },
        {
          title: "Refund and guarantee",
          text:
            "Refunds are made using the same payment method within the statutory period. New products have a three-year statutory guarantee against lack of conformity.",
        },
        {
          title: "Data and acceptance",
          text:
            "VANMOTION does not store the full card number. By accepting and continuing to payment, customers confirm that they have read these terms, the privacy information and the withdrawal information.",
        },
      ],
    },
    action: {
      eyebrow: "Direct action",
      title: "Withdrawal. Clear and direct.",
      text:
        "Use the specific form to communicate withdrawal and create a record of the request.",
      link: "Open withdrawal form",
    },
    related: {
      eyebrow: "Related documents",
      title: "Everything connected.",
      items: [
        { number: "01", label: "Privacy", href: "/privacidad" },
        { number: "02", label: "Legal notice", href: "/aviso-legal" },
        { number: "03", label: "Cookies", href: "/cookies" },
        { number: "04", label: "Withdrawal", href: "/desistimiento" },
      ],
    },
    references: {
      title: "Official references",
      note:
        "Official links are provided as legal references and do not imply certification or institutional endorsement.",
      consumers: "Consumer law · BOE",
      ecommerce: "E-commerce · BOE",
      data: "Data protection · EUR-Lex",
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

export default async function PurchaseTermsPage() {
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
        <section className={styles.hero} aria-labelledby="purchase-title">
          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.hero.update}</span>
          </div>

          <div className={styles.heroCopy}>
            <p>{content.hero.eyebrow}</p>
            <h1 id="purchase-title">
              <span>{content.hero.first}</span>
              <span>{content.hero.second}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.foot}</span>
            <a href="#condiciones">{content.hero.action}</a>
          </div>
        </section>

        <section className={styles.sellerSection}>
          <div className={styles.sellerIntro}>
            <p className={styles.darkLabel}>{content.seller.eyebrow}</p>
            <h2>{content.seller.title}</h2>
          </div>

          <dl className={styles.sellerGrid}>
            <div>
              <dt>{content.seller.ownerName}</dt>
              <dd>{legal.ownerName}</dd>
            </div>
            <div>
              <dt>{content.seller.commercialName}</dt>
              <dd>VANMOTION</dd>
            </div>
            <div>
              <dt>{content.seller.taxId}</dt>
              <dd>{legal.nif}</dd>
            </div>
            {legal.phone && legal.phone !== "No disponible" && (
              <div>
                <dt>{content.seller.phone}</dt>
                <dd>
                  <a href={`tel:${telephoneHref}`}>{legal.phone}</a>
                </dd>
              </div>
            )}
            <div className={styles.fullCell}>
              <dt>{content.seller.email}</dt>
              <dd>
                <a href={`mailto:${legal.email}`}>{legal.email}</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.termsSection} id="condiciones">
          <div className={styles.termsHeading}>
            <p className={styles.lightLabel}>{content.essentials.eyebrow}</p>
            <div>
              <h2>{content.essentials.title}</h2>
              <p>{content.essentials.intro}</p>
            </div>
          </div>

          <ol className={styles.termList}>
            {content.essentials.rows.map((row, index) => (
              <li key={row.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.actionSection}>
          <div>
            <p className={styles.darkLabel}>{content.action.eyebrow}</p>
            <h2>{content.action.title}</h2>
          </div>

          <div className={styles.actionCopy}>
            <p>{content.action.text}</p>
            <Link href="/desistimiento">
              {content.action.link}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className={styles.relatedSection}>
          <div className={styles.relatedTitle}>
            <p className={styles.lightLabel}>{content.related.eyebrow}</p>
            <h2>{content.related.title}</h2>
          </div>

          <nav
            className={styles.relatedList}
            aria-label={content.related.eyebrow}
          >
            {content.related.items.map((item) => (
              <Link href={item.href} key={item.number}>
                <span>{item.number}</span>
                <strong>{item.label}</strong>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </nav>
        </section>

        <section className={styles.referencesSection}>
          <div>
            <p>{content.references.title}</p>
            <span>{content.references.note}</span>
          </div>

          <nav aria-label={content.references.title}>
            <a
              href="https://www.boe.es/eli/es/rdlg/2007/11/16/1/con"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.consumers}
            </a>
            <a
              href="https://www.boe.es/eli/es/l/2002/07/11/34/con"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.ecommerce}
            </a>
            <a
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
              rel="noreferrer"
            >
              {content.references.data}
            </a>
          </nav>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav>
          <a href={`mailto:${legal.email}`}>{content.footer.contact}</a>
          <Link href="/">{content.footer.back}</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}
