import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import { createWithdrawalRequestAction } from "./actions";
import styles from "./desistimiento.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://vanmotion.es/desistimiento";

type WithdrawalPageProps = {
  searchParams: Promise<{
    enviado?: string;
    referencia?: string;
    error?: string;
  }>;
};

const translations = {
  es: {
    metadataTitle: "Desistimiento",
    metadataDescription:
      "Formulario para comunicar a VANMOTION el desistimiento de una compra online.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    update: "Gestión posventa · VANMOTION",
    hero: {
      eyebrow: "Compra online · Desistimiento",
      first: "Decisión clara.",
      second: "Proceso directo.",
      foot: "14 días · motivo opcional · confirmación registrada",
      action: "Abrir formulario",
    },
    facts: [
      {
        value: "14",
        label: "Días naturales",
        text: "Desde la recepción del pedido.",
      },
      {
        value: "0",
        label: "Motivos obligatorios",
        text: "No necesitas justificar tu decisión.",
      },
      {
        value: "1",
        label: "Referencia",
        text: "Recibirás constancia de la solicitud.",
      },
    ],
    form: {
      eyebrow: "Gestión directa",
      title: "Registra tu desistimiento.",
      description:
        "Usa la referencia del correo de compra y el mismo correo empleado durante el pago.",
      orderReference: "Referencia del pedido *",
      orderPlaceholder: "Ej. ABC1234567",
      orderHelp:
        "Introduce el identificador completo o, como mínimo, sus últimos 8 caracteres.",
      name: "Nombre y apellidos *",
      namePlaceholder: "Nombre de la persona que realizó la compra",
      email: "Correo utilizado en la compra *",
      emailPlaceholder: "correo@ejemplo.com",
      reason: "Motivo · opcional y privado",
      reasonPlaceholder:
        "Talla, cambio de opinión o información útil para gestionar la devolución.",
      reasonHelp:
        "No necesitas indicar ningún motivo. Si lo escribes, se utilizará solo para gestionar la solicitud.",
      declaration:
        "Declaro de forma inequívoca que deseo desistir del contrato de compra correspondiente al pedido identificado en este formulario.",
      submit: "Registrar desistimiento",
      privacy:
        "Los datos se utilizan para verificar el pedido, registrar la solicitud y gestionar la devolución.",
      privacyLink: "Privacidad",
      termsLink: "Condiciones de compra",
    },
    process: {
      eyebrow: "Después del envío",
      title: "Tres pasos. Sin rodeos.",
      rows: [
        {
          number: "01",
          title: "Registro",
          text: "Guardamos la fecha y la referencia de la solicitud.",
        },
        {
          number: "02",
          title: "Confirmación",
          text: "Enviamos la constancia al correo asociado al pedido.",
        },
        {
          number: "03",
          title: "Devolución",
          text: "Te comunicamos las instrucciones para devolver el producto.",
        },
      ],
      notice:
        "El formulario comunica el desistimiento, pero no genera automáticamente el reembolso. La devolución y el reembolso se tramitan conforme a las Condiciones de compra.",
    },
    success: {
      label: "Solicitud registrada",
      title: "Hemos recibido tu desistimiento",
      description:
        "La solicitud está guardada y hemos intentado enviarte una confirmación por correo electrónico.",
      reference: "Referencia",
      keep: "Conserva esta referencia y el correo de confirmación.",
    },
    errors: {
      required:
        "Completa los campos obligatorios y acepta la declaración de desistimiento.",
      invalid_reference:
        "La referencia no es válida. Introduce al menos los últimos 8 caracteres del pedido.",
      invalid_email: "El correo electrónico introducido no es válido.",
      not_found:
        "No hemos podido verificar un pedido pagado con esa referencia y ese correo. Revisa los datos o contacta con VANMOTION.",
      server:
        "No se ha podido registrar la solicitud. Inténtalo de nuevo o contacta con VANMOTION.",
    },
    related: {
      eyebrow: "Documentos relacionados",
      title: "Todo conectado.",
      items: [
        { number: "01", label: "Condiciones de compra", href: "/condiciones-compra" },
        { number: "02", label: "Privacidad", href: "/privacidad" },
        { number: "03", label: "Aviso legal", href: "/aviso-legal" },
        { number: "04", label: "Cookies", href: "/cookies" },
      ],
    },
    footer: {
      city: "Madrid · España",
      contact: "Contactar",
      back: "Volver a VANMOTION",
    },
  },
  en: {
    metadataTitle: "Withdrawal",
    metadataDescription:
      "Form for notifying VANMOTION of withdrawal from an online purchase.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    update: "After-sales management · VANMOTION",
    hero: {
      eyebrow: "Online purchase · Withdrawal",
      first: "Clear decision.",
      second: "Direct process.",
      foot: "14 days · optional reason · recorded confirmation",
      action: "Open form",
    },
    facts: [
      {
        value: "14",
        label: "Calendar days",
        text: "From receipt of the order.",
      },
      {
        value: "0",
        label: "Required reasons",
        text: "You do not need to justify your decision.",
      },
      {
        value: "1",
        label: "Reference",
        text: "You will receive proof of the request.",
      },
    ],
    form: {
      eyebrow: "Direct management",
      title: "Record your withdrawal.",
      description:
        "Use the reference in the purchase email and the same email address used during payment.",
      orderReference: "Order reference *",
      orderPlaceholder: "Example: ABC1234567",
      orderHelp:
        "Enter the full identifier or at least its final 8 characters.",
      name: "Full name *",
      namePlaceholder: "Name of the person who made the purchase",
      email: "Email used for the purchase *",
      emailPlaceholder: "email@example.com",
      reason: "Reason · optional and private",
      reasonPlaceholder:
        "Size, change of mind or information that may help manage the return.",
      reasonHelp:
        "You do not need to give a reason. If supplied, it will only be used to manage the request.",
      declaration:
        "I unequivocally declare that I wish to withdraw from the purchase contract relating to the order identified in this form.",
      submit: "Record withdrawal",
      privacy:
        "The information is used to verify the order, record the request and manage the return.",
      privacyLink: "Privacy",
      termsLink: "Purchase conditions",
    },
    process: {
      eyebrow: "After submission",
      title: "Three steps. No detours.",
      rows: [
        {
          number: "01",
          title: "Record",
          text: "We save the request date and reference.",
        },
        {
          number: "02",
          title: "Confirmation",
          text: "We send proof to the email linked to the order.",
        },
        {
          number: "03",
          title: "Return",
          text: "We send you the instructions for returning the product.",
        },
      ],
      notice:
        "The form communicates withdrawal but does not automatically issue the refund. The return and refund are managed under the Purchase conditions.",
    },
    success: {
      label: "Request recorded",
      title: "We received your withdrawal request",
      description:
        "The request has been saved and we have attempted to send confirmation by email.",
      reference: "Reference",
      keep: "Keep this reference and the confirmation email.",
    },
    errors: {
      required:
        "Complete the required fields and accept the withdrawal declaration.",
      invalid_reference:
        "The reference is not valid. Enter at least the final 8 characters of the order.",
      invalid_email: "The email address entered is not valid.",
      not_found:
        "We could not verify a paid order using that reference and email address. Check the details or contact VANMOTION.",
      server:
        "The request could not be recorded. Try again or contact VANMOTION.",
    },
    related: {
      eyebrow: "Related documents",
      title: "Everything connected.",
      items: [
        { number: "01", label: "Purchase conditions", href: "/condiciones-compra" },
        { number: "02", label: "Privacy", href: "/privacidad" },
        { number: "03", label: "Legal notice", href: "/aviso-legal" },
        { number: "04", label: "Cookies", href: "/cookies" },
      ],
    },
    footer: {
      city: "Madrid · Spain",
      contact: "Contact",
      back: "Return to VANMOTION",
    },
  },
} as const;

type ErrorCode = keyof typeof translations.es.errors;

function isErrorCode(value: string | undefined): value is ErrorCode {
  return (
    value === "required" ||
    value === "invalid_reference" ||
    value === "invalid_email" ||
    value === "not_found" ||
    value === "server"
  );
}

function safeReference(value: string | undefined): string {
  return (value ?? "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40);
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
    alternates: { canonical: CANONICAL_URL },
    robots: { index: true, follow: true },
  };
}

export default async function WithdrawalPage({
  searchParams,
}: WithdrawalPageProps) {
  const [language, parameters] = await Promise.all([
    getCurrentLanguage(),
    searchParams,
  ]);

  const content = translations[language];
  const errorMessage = isErrorCode(parameters.error)
    ? content.errors[parameters.error]
    : null;
  const reference = safeReference(parameters.referencia);
  const wasSent = parameters.enviado === "1";

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
        <section className={styles.hero}>
          <div className={styles.heroTopline}>
            <span>Madrid · España</span>
            <span>{content.update}</span>
          </div>

          <div className={styles.heroCopy}>
            <p>{content.hero.eyebrow}</p>
            <h1>
              <span>{content.hero.first}</span>
              <span>{content.hero.second}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.foot}</span>
            <Link href="#formulario">{content.hero.action}</Link>
          </div>
        </section>

        <section className={styles.factsSection}>
          {content.facts.map((fact) => (
            <article key={fact.label}>
              <strong>{fact.value}</strong>
              <div>
                <h2>{fact.label}</h2>
                <p>{fact.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.formSection} id="formulario">
          <div className={styles.formHeading}>
            <p>{content.form.eyebrow}</p>
            <h2>{content.form.title}</h2>
            <span>{content.form.description}</span>
          </div>

          <div className={styles.formPanel}>
            {wasSent && (
              <div className={styles.success} role="status">
                <span>{content.success.label}</span>
                <strong>{content.success.title}</strong>
                <p>{content.success.description}</p>
                {reference && (
                  <div className={styles.referenceBox}>
                    <span>{content.success.reference}</span>
                    <code>{reference}</code>
                  </div>
                )}
                <small>{content.success.keep}</small>
              </div>
            )}

            {errorMessage && (
              <div className={styles.error} role="alert">
                {errorMessage}
              </div>
            )}

            <form action={createWithdrawalRequestAction} className={styles.form}>
              <div className={styles.formFieldFull}>
                <label htmlFor="orderReference">
                  {content.form.orderReference}
                </label>
                <input
                  id="orderReference"
                  name="orderReference"
                  type="text"
                  required
                  minLength={8}
                  maxLength={120}
                  autoComplete="off"
                  placeholder={content.form.orderPlaceholder}
                  aria-describedby="order-reference-help"
                />
                <small id="order-reference-help">
                  {content.form.orderHelp}
                </small>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="customerName">{content.form.name}</label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder={content.form.namePlaceholder}
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="customerEmail">{content.form.email}</label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    maxLength={180}
                    autoComplete="email"
                    placeholder={content.form.emailPlaceholder}
                  />
                </div>
              </div>

              <div className={styles.formFieldFull}>
                <label htmlFor="customerMessage">{content.form.reason}</label>
                <textarea
                  id="customerMessage"
                  name="customerMessage"
                  maxLength={2000}
                  rows={5}
                  placeholder={content.form.reasonPlaceholder}
                  aria-describedby="withdrawal-reason-help"
                />
                <small id="withdrawal-reason-help">
                  {content.form.reasonHelp}
                </small>
              </div>

              <label className={styles.declaration}>
                <input
                  type="checkbox"
                  name="acceptedDeclaration"
                  value="yes"
                  required
                />
                <span>{content.form.declaration}</span>
              </label>

              <div className={styles.formFooter}>
                <p>
                  {content.form.privacy}{" "}
                  <Link href="/privacidad">{content.form.privacyLink}</Link>
                  {" · "}
                  <Link href="/condiciones-compra">{content.form.termsLink}</Link>
                </p>

                <button type="submit">
                  {content.form.submit}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={styles.processSection}>
          <div className={styles.processTitle}>
            <p>{content.process.eyebrow}</p>
            <h2>{content.process.title}</h2>
            <span>{content.process.notice}</span>
          </div>

          <div className={styles.processList}>
            {content.process.rows.map((row) => (
              <article key={row.number}>
                <span>{row.number}</span>
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.relatedSection}>
          <div className={styles.relatedTitle}>
            <p>{content.related.eyebrow}</p>
            <h2>{content.related.title}</h2>
          </div>

          <div className={styles.relatedList}>
            {content.related.items.map((item) => (
              <Link key={item.number} href={item.href}>
                <span>{item.number}</span>
                <strong>{item.label}</strong>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>
        <nav>
          <Link href="/contacto">{content.footer.contact}</Link>
          <Link href="/">{content.footer.back}</Link>
        </nav>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
