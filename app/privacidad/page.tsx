import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "../legal.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/privacidad";

const translations = {
  es: {
    metadataTitle: "Política de privacidad",
    metadataDescription:
      "Información sobre el tratamiento y la protección de los datos personales en VANMOTION.",

    location: "Madrid · España",
    eyebrow: "Protección de datos",
    title: "POLÍTICA DE PRIVACIDAD",
    introduction:
      "Esta política explica qué datos personales trata VANMOTION, para qué se utilizan, con quién pueden compartirse y cómo pueden ejercerse los derechos de protección de datos.",

    controllerTitle:
      "1. Responsable del tratamiento",
    controllerText:
      "El responsable de los datos personales tratados a través de este sitio web es:",

    ownerName: "Responsable",
    commercialName: "Nombre comercial",
    taxId: "NIF",
    address: "Domicilio",
    phone: "Teléfono",
    email: "Correo electrónico",

    dataTitle:
      "2. Datos personales tratados",
    dataText:
      "VANMOTION trata únicamente los datos necesarios para gestionar consultas, compras, pagos, envíos, comunicaciones y la seguridad del sitio.",

    contactDataLabel:
      "Consultas y formularios",
    contactData:
      "Nombre, correo electrónico, teléfono opcional, asunto, mensaje, vehículo consultado y fechas de gestión.",

    orderDataLabel:
      "Compras y pedidos",
    orderData:
      "Nombre, correo, teléfono, dirección de envío, producto, talla, cantidad, importe, moneda, estado del pago, estado de preparación, transportista y seguimiento.",

    stripeDataLabel:
      "Identificadores de pago",
    stripeData:
      "Identificador de la sesión de Stripe Checkout, Payment Intent y, cuando exista, identificador del cliente de Stripe. VANMOTION no recibe ni almacena el número completo de la tarjeta.",

    technicalDataLabel:
      "Datos técnicos",
    technicalData:
      "El proveedor de alojamiento y seguridad puede tratar direcciones IP, cabeceras de solicitud, navegador, dispositivo, registros técnicos y datos necesarios para prestar y proteger el servicio.",

    purposesTitle:
      "3. Finalidades y bases jurídicas",

    enquiriesLabel:
      "Atender consultas",
    enquiriesPurpose:
      "Responder solicitudes sobre vehículos, música, ropa, proyectos, colaboraciones y otros servicios. La base jurídica es la aplicación de medidas precontractuales solicitadas por el usuario y, en consultas generales, el interés legítimo en atender y gestionar las comunicaciones recibidas.",

    ordersLabel:
      "Gestionar compras",
    ordersPurpose:
      "Tramitar el pago, registrar el pedido, preparar el producto, gestionar el envío, comunicar incidencias, devoluciones y atención posventa. La base jurídica es la ejecución del contrato de compraventa.",

    obligationsLabel:
      "Obligaciones legales",
    obligationsPurpose:
      "Conservar documentación comercial, contable, fiscal y de facturación, así como atender requerimientos de autoridades. La base jurídica es el cumplimiento de obligaciones legales.",

    securityLabel:
      "Seguridad y prevención del fraude",
    securityPurpose:
      "Proteger el sitio, comprobar pagos, evitar duplicidades, detectar operaciones fraudulentas y defender los derechos de VANMOTION y de sus clientes. La base jurídica es el interés legítimo y, cuando corresponda, el cumplimiento de obligaciones legales.",

    emailsLabel:
      "Correos transaccionales",
    emailsPurpose:
      "Enviar confirmaciones de consultas, compras, pagos, preparación y envío. Estos mensajes son necesarios para gestionar la solicitud o el pedido y no constituyen una newsletter publicitaria.",

    sourceTitle:
      "4. Procedencia de los datos",
    sourceText:
      "Los datos se obtienen directamente del usuario cuando completa un formulario, contacta con VANMOTION o realiza una compra. La información del pago y de la dirección de envío también puede ser recibida desde Stripe después de que el cliente complete Stripe Checkout.",

    recipientsTitle:
      "5. Destinatarios y proveedores",

    vercelLabel: "Vercel",
    vercelText:
      "Alojamiento, despliegue, entrega del sitio y registros técnicos necesarios para su funcionamiento y seguridad.",

    databaseLabel:
      "Proveedor de base de datos",
    databaseText:
      "Alojamiento de la base de datos PostgreSQL en la que se registran consultas, pedidos y datos necesarios para la actividad.",

    resendLabel: "Resend",
    resendText:
      "Envío de correos transaccionales a VANMOTION y al usuario. Pueden incluir nombre, correo, mensaje, información del pedido y dirección de envío. VANMOTION no tiene activado el seguimiento de aperturas ni de clics.",

    stripeLabel: "Stripe",
    stripeText:
      "Gestión del pago, prevención del fraude y cumplimiento de obligaciones financieras. Stripe puede actuar como encargado del tratamiento y también como responsable independiente para determinados fines regulatorios, de seguridad y prevención del fraude.",

    carriersLabel:
      "Empresas de transporte",
    carriersText:
      "Nombre, dirección, teléfono y demás información necesaria para entregar y realizar el seguimiento de los pedidos.",

    authoritiesLabel:
      "Asesorías y autoridades",
    authoritiesText:
      "Los datos podrán comunicarse a asesores profesionales, administraciones públicas, juzgados o fuerzas de seguridad cuando sea necesario o exista una obligación legal.",

    saleText:
      "VANMOTION no vende datos personales ni los entrega a terceros para publicidad ajena.",

    transfersTitle:
      "6. Transferencias internacionales",
    transfersText:
      "Algunos proveedores tecnológicos, especialmente Stripe, Resend y Vercel, pueden tratar datos fuera del Espacio Económico Europeo o permitir el acceso desde otros países. Cuando resulte necesario, estas transferencias se realizan mediante decisiones de adecuación, cláusulas contractuales tipo u otras garantías reconocidas por la normativa de protección de datos.",

    retentionTitle:
      "7. Conservación de los datos",

    contactRetentionLabel:
      "Consultas",
    contactRetention:
      "Se conservarán mientras se atiende la solicitud y durante el tiempo necesario para gestionar posibles responsabilidades. VANMOTION revisará y eliminará las consultas cerradas que hayan dejado de ser necesarias, salvo que deban conservarse bloqueadas por una obligación legal o una reclamación.",

    orderRetentionLabel:
      "Pedidos y facturación",
    orderRetention:
      "Se conservarán durante la relación contractual y posteriormente durante los plazos legales comerciales, contables, fiscales y de defensa de reclamaciones. Como regla general, la documentación del negocio puede conservarse durante seis años, sin perjuicio de otros plazos aplicables.",

    providerRetentionLabel:
      "Proveedores tecnológicos",
    providerRetention:
      "Los proveedores conservarán los datos y registros conforme a sus contratos, obligaciones legales y políticas de retención, limitándolos al tiempo necesario para prestar sus servicios.",

    rightsTitle:
      "8. Derechos de las personas",
    rightsText:
      "El usuario puede solicitar el acceso a sus datos, su rectificación, supresión, limitación, portabilidad u oposición al tratamiento. También puede retirar un consentimiento cuando el tratamiento dependa de él, sin que ello afecte a los tratamientos anteriores.",

    exerciseText:
      "Para ejercer estos derechos puede escribir al correo indicado en esta política, señalando el derecho que desea ejercer e incluyendo la información necesaria para verificar su identidad. El ejercicio es gratuito, salvo solicitudes manifiestamente infundadas o excesivas.",

    complaintText:
      "Si considera que sus datos no se han tratado correctamente, puede presentar una reclamación ante la Agencia Española de Protección de Datos.",

    securityTitle:
      "9. Seguridad",
    securityText:
      "VANMOTION aplica medidas técnicas y organizativas orientadas a proteger los datos frente a accesos no autorizados, pérdida, alteración o divulgación. El panel administrativo está protegido mediante sesión privada, los pagos se realizan en Stripe Checkout y los webhooks verifican la firma enviada por Stripe.",

    decisionsTitle:
      "10. Decisiones automatizadas",
    decisionsText:
      "VANMOTION no adopta decisiones que produzcan efectos jurídicos sobre el usuario basándose únicamente en tratamientos automatizados y no elabora perfiles comerciales con los datos recogidos en los formularios o pedidos.",

    minorsTitle:
      "11. Menores de edad",
    minorsText:
      "El sitio no está dirigido específicamente a menores de edad. Los menores no deben facilitar datos personales ni realizar compras sin la intervención de sus padres o representantes legales.",

    cookiesTitle:
      "12. Cookies y tecnologías similares",
    cookiesText:
      "El uso de cookies y tecnologías similares se explicará de forma independiente en la Política de Cookies. Las cookies no necesarias, si se incorporan, requerirán la configuración o autorización correspondiente.",

    changesTitle:
      "13. Cambios en esta política",
    changesText:
      "VANMOTION podrá actualizar esta política cuando cambien sus servicios, proveedores o tratamientos de datos. La versión vigente será la publicada en esta página, indicando su fecha de actualización.",

    update:
      "Última actualización: 22 de julio de 2026",
    legalNotice: "Aviso legal",
    back: "Volver a VANMOTION",
  },

  en: {
    metadataTitle: "Privacy policy",
    metadataDescription:
      "Information about the processing and protection of personal data at VANMOTION.",

    location: "Madrid · Spain",
    eyebrow: "Data protection",
    title: "PRIVACY POLICY",
    introduction:
      "This policy explains what personal data VANMOTION processes, why it is used, who may receive it and how data-protection rights can be exercised.",

    controllerTitle:
      "1. Data controller",
    controllerText:
      "The controller responsible for personal data processed through this website is:",

    ownerName: "Controller",
    commercialName: "Trading name",
    taxId: "Tax identification number",
    address: "Address",
    phone: "Telephone",
    email: "Email",

    dataTitle:
      "2. Personal data processed",
    dataText:
      "VANMOTION processes only the data required to manage enquiries, purchases, payments, deliveries, communications and website security.",

    contactDataLabel:
      "Enquiries and forms",
    contactData:
      "Name, email address, optional telephone number, subject, message, vehicle enquired about and management dates.",

    orderDataLabel:
      "Purchases and orders",
    orderData:
      "Name, email, telephone number, delivery address, product, size, quantity, amount, currency, payment status, fulfilment status, carrier and tracking information.",

    stripeDataLabel:
      "Payment identifiers",
    stripeData:
      "Stripe Checkout Session, Payment Intent and, where available, Stripe Customer identifiers. VANMOTION does not receive or store the full payment-card number.",

    technicalDataLabel:
      "Technical data",
    technicalData:
      "Hosting and security providers may process IP addresses, request headers, browser, device, technical logs and other data required to provide and protect the service.",

    purposesTitle:
      "3. Purposes and legal bases",

    enquiriesLabel:
      "Handling enquiries",
    enquiriesPurpose:
      "Responding to requests about vehicles, music, clothing, projects, collaborations and other services. The legal basis is taking pre-contractual steps requested by the user and, for general enquiries, the legitimate interest in handling communications received.",

    ordersLabel:
      "Managing purchases",
    ordersPurpose:
      "Processing payment, registering and preparing the order, arranging delivery, handling incidents, returns and after-sales support. The legal basis is performance of the sales contract.",

    obligationsLabel:
      "Legal obligations",
    obligationsPurpose:
      "Keeping commercial, accounting, tax and invoicing documentation and responding to lawful requests from authorities. The legal basis is compliance with legal obligations.",

    securityLabel:
      "Security and fraud prevention",
    securityPurpose:
      "Protecting the website, verifying payments, preventing duplicates, detecting fraudulent transactions and defending the rights of VANMOTION and its customers. The legal basis is legitimate interest and, where applicable, compliance with legal obligations.",

    emailsLabel:
      "Transactional emails",
    emailsPurpose:
      "Sending confirmations concerning enquiries, purchases, payments, preparation and delivery. These messages are required to manage the request or order and are not advertising newsletters.",

    sourceTitle:
      "4. Source of the data",
    sourceText:
      "Data is obtained directly from users when they submit a form, contact VANMOTION or make a purchase. Payment and delivery-address information may also be received from Stripe after the customer completes Stripe Checkout.",

    recipientsTitle:
      "5. Recipients and providers",

    vercelLabel: "Vercel",
    vercelText:
      "Website hosting, deployment, delivery and technical logs required for operation and security.",

    databaseLabel:
      "Database provider",
    databaseText:
      "Hosting of the PostgreSQL database in which enquiries, orders and information required for the activity are recorded.",

    resendLabel: "Resend",
    resendText:
      "Sending transactional emails to VANMOTION and users. These may contain names, email addresses, messages, order information and delivery addresses. VANMOTION has not enabled open or click tracking.",

    stripeLabel: "Stripe",
    stripeText:
      "Payment management, fraud prevention and financial compliance. Stripe may act as a processor and also as an independent controller for certain regulatory, security and fraud-prevention purposes.",

    carriersLabel:
      "Delivery companies",
    carriersText:
      "Name, address, telephone number and other information required to deliver and track orders.",

    authoritiesLabel:
      "Advisers and authorities",
    authoritiesText:
      "Data may be disclosed to professional advisers, public authorities, courts or law-enforcement bodies when required or legally necessary.",

    saleText:
      "VANMOTION does not sell personal data or disclose it to third parties for unrelated advertising.",

    transfersTitle:
      "6. International transfers",
    transfersText:
      "Some technology providers, particularly Stripe, Resend and Vercel, may process data outside the European Economic Area or permit access from other countries. Where required, these transfers rely on adequacy decisions, standard contractual clauses or other safeguards recognised under data-protection law.",

    retentionTitle:
      "7. Data retention",

    contactRetentionLabel:
      "Enquiries",
    contactRetention:
      "Data will be kept while the request is handled and for the time required to manage possible liabilities. VANMOTION will review and delete closed enquiries that are no longer necessary unless they must remain restricted due to a legal obligation or claim.",

    orderRetentionLabel:
      "Orders and invoicing",
    orderRetention:
      "Data will be kept throughout the contractual relationship and afterwards for applicable commercial, accounting, tax and claims-related periods. As a general rule, business documentation may need to be kept for six years, without prejudice to other applicable periods.",

    providerRetentionLabel:
      "Technology providers",
    providerRetention:
      "Providers retain data and logs in accordance with their contracts, legal obligations and retention policies, limited to the period required to provide their services.",

    rightsTitle:
      "8. Individual rights",
    rightsText:
      "Users may request access, rectification, erasure, restriction, portability or object to the processing of their data. They may also withdraw consent where processing depends on consent, without affecting earlier processing.",

    exerciseText:
      "To exercise these rights, users may write to the email address stated in this policy, identifying the right requested and supplying the information required to verify their identity. Exercising these rights is free of charge, except for manifestly unfounded or excessive requests.",

    complaintText:
      "Users who believe their data has not been processed correctly may lodge a complaint with the Spanish Data Protection Agency.",

    securityTitle:
      "9. Security",
    securityText:
      "VANMOTION applies technical and organisational measures intended to protect data against unauthorised access, loss, alteration or disclosure. The administration panel is protected by a private session, payments are completed through Stripe Checkout and webhooks verify Stripe signatures.",

    decisionsTitle:
      "10. Automated decisions",
    decisionsText:
      "VANMOTION does not make decisions producing legal effects solely through automated processing and does not create commercial profiles using the data collected through forms or orders.",

    minorsTitle:
      "11. Children",
    minorsText:
      "The website is not specifically directed at children. Minors should not provide personal data or make purchases without the involvement of a parent or legal guardian.",

    cookiesTitle:
      "12. Cookies and similar technologies",
    cookiesText:
      "The use of cookies and similar technologies will be explained separately in the Cookie Policy. Non-essential cookies, if introduced, will require the appropriate settings or permission.",

    changesTitle:
      "13. Changes to this policy",
    changesText:
      "VANMOTION may update this policy when its services, providers or data processing activities change. The current version will be the version published on this page with its update date.",

    update:
      "Last updated: July 22, 2026",
    legalNotice: "Legal notice",
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

export default async function PrivacyPage() {
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

        <span>{content.location}</span>
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
          <h2>{content.controllerTitle}</h2>

          <div>
            <p>{content.controllerText}</p>

            <address className={styles.dataGrid}>
              <div>
                <span>{content.ownerName}</span>
                <strong>{legal.ownerName}</strong>
              </div>

              <div>
                <span>
                  {content.commercialName}
                </span>
                <strong>VANMOTION</strong>
              </div>

              <div>
                <span>{content.taxId}</span>
                <strong>{legal.nif}</strong>
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
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.dataTitle}</h2>

          <div>
            <p>{content.dataText}</p>

            <div className={styles.dataGrid}>
              <div>
                <span>
                  {content.contactDataLabel}
                </span>
                <strong>
                  {content.contactData}
                </strong>
              </div>

              <div>
                <span>
                  {content.orderDataLabel}
                </span>
                <strong>
                  {content.orderData}
                </strong>
              </div>

              <div>
                <span>
                  {content.stripeDataLabel}
                </span>
                <strong>
                  {content.stripeData}
                </strong>
              </div>

              <div>
                <span>
                  {content.technicalDataLabel}
                </span>
                <strong>
                  {content.technicalData}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.purposesTitle}</h2>

          <div className={styles.dataGrid}>
            <div>
              <span>
                {content.enquiriesLabel}
              </span>
              <strong>
                {content.enquiriesPurpose}
              </strong>
            </div>

            <div>
              <span>{content.ordersLabel}</span>
              <strong>
                {content.ordersPurpose}
              </strong>
            </div>

            <div>
              <span>
                {content.obligationsLabel}
              </span>
              <strong>
                {content.obligationsPurpose}
              </strong>
            </div>

            <div>
              <span>{content.securityLabel}</span>
              <strong>
                {content.securityPurpose}
              </strong>
            </div>

            <div>
              <span>{content.emailsLabel}</span>
              <strong>
                {content.emailsPurpose}
              </strong>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.sourceTitle}</h2>
          <p>{content.sourceText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.recipientsTitle}</h2>

          <div>
            <div className={styles.dataGrid}>
              <div>
                <span>{content.vercelLabel}</span>
                <strong>
                  {content.vercelText}
                </strong>
              </div>

              <div>
                <span>
                  {content.databaseLabel}
                </span>
                <strong>
                  {content.databaseText}
                </strong>
              </div>

              <div>
                <span>{content.resendLabel}</span>
                <strong>
                  {content.resendText}
                </strong>
              </div>

              <div>
                <span>{content.stripeLabel}</span>
                <strong>
                  {content.stripeText}
                </strong>
              </div>

              <div>
                <span>
                  {content.carriersLabel}
                </span>
                <strong>
                  {content.carriersText}
                </strong>
              </div>

              <div>
                <span>
                  {content.authoritiesLabel}
                </span>
                <strong>
                  {content.authoritiesText}
                </strong>
              </div>
            </div>

            <p>{content.saleText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.transfersTitle}</h2>
          <p>{content.transfersText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.retentionTitle}</h2>

          <div className={styles.dataGrid}>
            <div>
              <span>
                {content.contactRetentionLabel}
              </span>
              <strong>
                {content.contactRetention}
              </strong>
            </div>

            <div>
              <span>
                {content.orderRetentionLabel}
              </span>
              <strong>
                {content.orderRetention}
              </strong>
            </div>

            <div>
              <span>
                {content.providerRetentionLabel}
              </span>
              <strong>
                {content.providerRetention}
              </strong>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.rightsTitle}</h2>

          <div>
            <p>{content.rightsText}</p>
            <p>{content.exerciseText}</p>
            <p>{content.complaintText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.securityTitle}</h2>
          <p>{content.securityText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.decisionsTitle}</h2>
          <p>{content.decisionsText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.minorsTitle}</h2>
          <p>{content.minorsText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.cookiesTitle}</h2>
          <p>{content.cookiesText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.changesTitle}</h2>
          <p>{content.changesText}</p>
        </section>
      </article>

      <footer className={styles.footer}>
        <p>{content.update}</p>

        <Link href="/aviso-legal">
          {content.legalNotice}
        </Link>

        <Link href="/proximamente">
          {content.back} →
        </Link>
      </footer>
    </main>
  );
}