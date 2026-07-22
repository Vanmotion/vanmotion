import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "../legal.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/aviso-legal";

const translations = {
  es: {
    metadataTitle: "Aviso legal",
    metadataDescription:
      "Información legal, identificación y condiciones generales de uso de VANMOTION.",

    eyebrow: "Información legal",
    title: "AVISO LEGAL",
    introduction:
      "Información general sobre el titular, el funcionamiento y las condiciones de uso del sitio web VANMOTION.",

    ownerTitle: "1. Titular del sitio web",
    ownerText:
      "En cumplimiento de la normativa aplicable, se informa de que el titular de este sitio web y responsable de VANMOTION es:",

    ownerName: "Titular",
    commercialName: "Nombre comercial",
    taxId: "NIF",
    address: "Domicilio",
    phone: "Teléfono",
    email: "Correo electrónico",
    legalForm: "Condición",
    legalFormValue:
      "Persona física que desarrolla su actividad como trabajador autónomo",

    purposeTitle: "2. Objeto del sitio web",
    purposeText:
      "VANMOTION es un proyecto dedicado a vehículos, música, ropa, diseño y actividades relacionadas. Este sitio permite presentar el proyecto, mostrar productos y vehículos, facilitar el contacto y, cuando corresponda, realizar contrataciones o compras por medios electrónicos.",

    useTitle: "3. Condiciones de uso",
    useText:
      "El acceso y la utilización de este sitio atribuyen la condición de usuario e implican la aceptación de estas condiciones. El usuario se compromete a utilizar el sitio, sus contenidos y servicios de forma lícita, responsable y respetuosa, sin causar daños, interferencias o accesos no autorizados.",

    pricesTitle: "4. Precios e información comercial",
    pricesText:
      "Cuando el sitio muestre precios, se informará de manera clara sobre los impuestos aplicables, los gastos de envío y cualquier otro coste que deba asumir el cliente antes de confirmar una compra.",

    intellectualTitle:
      "5. Propiedad intelectual e industrial",
    intellectualText:
      "Los textos, diseños, fotografías, vídeos, música, marcas, logotipos y demás contenidos propios de VANMOTION están protegidos por la normativa de propiedad intelectual e industrial. No se autoriza su reproducción, distribución, modificación o explotación sin permiso previo, salvo los usos permitidos por la ley.",

    responsibilityTitle: "6. Responsabilidad",
    responsibilityText:
      "VANMOTION procura que la información publicada sea correcta y esté actualizada, pero no puede garantizar la ausencia absoluta de errores, interrupciones, incidencias técnicas o contenidos desactualizados. El titular podrá modificar, suspender o actualizar el sitio cuando resulte necesario.",

    linksTitle: "7. Enlaces externos",
    linksText:
      "Este sitio puede incluir enlaces a páginas o servicios de terceros. VANMOTION no controla esos sitios ni responde de sus contenidos, políticas, disponibilidad o seguridad. La presencia de un enlace no implica necesariamente una relación, aprobación o recomendación.",

    communicationsTitle: "8. Comunicaciones",
    communicationsText:
      "Para consultas relacionadas con este sitio web, sus contenidos, productos o servicios, el usuario puede contactar mediante el correo electrónico o el teléfono indicados en este aviso.",

    lawTitle: "9. Legislación y jurisdicción",
    lawText:
      "Este aviso se rige por la legislación española. Cuando el usuario tenga la condición de consumidor, cualquier controversia se resolverá conforme a las normas imperativas de protección de consumidores y competencia territorial. En los demás casos, y salvo disposición legal obligatoria, las partes se someten a los juzgados y tribunales de Madrid.",

    update: "Última actualización: 22 de julio de 2026",
    back: "Volver a VANMOTION",
  },

  en: {
    metadataTitle: "Legal notice",
    metadataDescription:
      "Legal information, identification and general terms of use for VANMOTION.",

    eyebrow: "Legal information",
    title: "LEGAL NOTICE",
    introduction:
      "General information about the owner, operation and terms of use of the VANMOTION website.",

    ownerTitle: "1. Website owner",
    ownerText:
      "In compliance with the applicable regulations, the owner of this website and the person responsible for VANMOTION is:",

    ownerName: "Owner",
    commercialName: "Trading name",
    taxId: "Tax identification number",
    address: "Address",
    phone: "Telephone",
    email: "Email",
    legalForm: "Legal status",
    legalFormValue:
      "Individual carrying out their professional activity as a self-employed worker",

    purposeTitle: "2. Purpose of the website",
    purposeText:
      "VANMOTION is a project dedicated to vehicles, music, clothing, design and related activities. This website presents the project, displays products and vehicles, facilitates contact and, where applicable, enables purchases or contracts through electronic means.",

    useTitle: "3. Terms of use",
    useText:
      "Accessing and using this website grants the status of user and implies acceptance of these conditions. Users must use the website, its content and services lawfully and responsibly, without causing damage, interference or unauthorised access.",

    pricesTitle: "4. Prices and commercial information",
    pricesText:
      "Whenever prices are displayed, the website will clearly provide information about applicable taxes, shipping costs and any other charges payable by the customer before a purchase is confirmed.",

    intellectualTitle:
      "5. Intellectual and industrial property",
    intellectualText:
      "The texts, designs, photographs, videos, music, trademarks, logos and other original VANMOTION content are protected by intellectual and industrial property laws. Reproduction, distribution, modification or commercial exploitation is not authorised without prior permission, except where permitted by law.",

    responsibilityTitle: "6. Liability",
    responsibilityText:
      "VANMOTION aims to keep the published information accurate and updated but cannot guarantee the complete absence of errors, interruptions, technical incidents or outdated information. The owner may modify, suspend or update the website whenever necessary.",

    linksTitle: "7. External links",
    linksText:
      "This website may contain links to third-party websites or services. VANMOTION does not control those websites and is not responsible for their content, policies, availability or security. A link does not necessarily imply a relationship, approval or recommendation.",

    communicationsTitle: "8. Communications",
    communicationsText:
      "For enquiries about this website, its content, products or services, users may contact the owner using the email address or telephone number stated in this notice.",

    lawTitle: "9. Applicable law and jurisdiction",
    lawText:
      "This notice is governed by Spanish law. Where the user is a consumer, disputes will be handled according to mandatory consumer-protection and territorial-jurisdiction rules. In all other cases, unless mandatory law provides otherwise, the parties submit to the courts of Madrid.",

    update: "Last updated: July 22, 2026",
    back: "Return to VANMOTION",
  },
} as const;

function requireLegalValue(
  variableName: string,
) {
  const value =
    process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `Falta la variable legal ${variableName}.`,
    );
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

export default async function LegalNoticePage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  const legal = {
    ownerName:
      requireLegalValue(
        "LEGAL_OWNER_NAME",
      ),

    nif:
      requireLegalValue(
        "LEGAL_OWNER_NIF",
      ),

    address:
      requireLegalValue(
        "LEGAL_ADDRESS",
      ),

    phone:
      requireLegalValue(
        "LEGAL_PHONE",
      ),

    email:
      requireLegalValue(
        "LEGAL_EMAIL",
      ),
  };

  const telephoneHref =
    legal.phone.replace(/[^\d+]/g, "");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/proximamente"
          className={styles.brand}
        >
          VANMOTION
        </Link>

        <span>
          MADRID · SPAIN
        </span>
      </header>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>
          {content.eyebrow}
        </p>

        <h1>{content.title}</h1>

        <p className={styles.introduction}>
          {content.introduction}
        </p>
      </div>

      <article className={styles.content}>
        <section className={styles.section}>
          <h2>{content.ownerTitle}</h2>

          <p>{content.ownerText}</p>

          <address className={styles.dataGrid}>
            <div>
              <span>{content.ownerName}</span>
              <strong>{legal.ownerName}</strong>
            </div>

            <div>
              <span>{content.commercialName}</span>
              <strong>VANMOTION</strong>
            </div>

            <div>
              <span>{content.taxId}</span>
              <strong>{legal.nif}</strong>
            </div>

            <div>
              <span>{content.legalForm}</span>
              <strong>
                {content.legalFormValue}
              </strong>
            </div>

            <div>
              <span>{content.address}</span>
              <strong>{legal.address}</strong>
            </div>

            <div>
              <span>{content.phone}</span>

              <a href={`tel:${telephoneHref}`}>
                {legal.phone}
              </a>
            </div>

            <div>
              <span>{content.email}</span>

              <a href={`mailto:${legal.email}`}>
                {legal.email}
              </a>
            </div>
          </address>
        </section>

        <section className={styles.section}>
          <h2>{content.purposeTitle}</h2>
          <p>{content.purposeText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.useTitle}</h2>
          <p>{content.useText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.pricesTitle}</h2>
          <p>{content.pricesText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.intellectualTitle}</h2>
          <p>{content.intellectualText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.responsibilityTitle}</h2>
          <p>{content.responsibilityText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.linksTitle}</h2>
          <p>{content.linksText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.communicationsTitle}</h2>
          <p>{content.communicationsText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.lawTitle}</h2>
          <p>{content.lawText}</p>
        </section>
      </article>

      <footer className={styles.footer}>
        <p>{content.update}</p>

        <Link href="/proximamente">
          {content.back} →
        </Link>
      </footer>
    </main>
  );
}