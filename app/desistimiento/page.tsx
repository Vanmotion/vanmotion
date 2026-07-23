import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import {
  createWithdrawalRequestAction,
} from "./actions";
import styles from "./desistimiento.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/desistimiento";

type WithdrawalPageProps = {
  searchParams: Promise<{
    enviado?: string;
    referencia?: string;
    error?: string;
  }>;
};

const translations = {
  es: {
    metadataTitle:
      "Desistir del contrato",
    metadataDescription:
      "Formulario electrónico para comunicar a VANMOTION el desistimiento de una compra online.",

    navigation: {
      home: "VANMOTION",
      terms: "Condiciones de compra",
      contact: "Contacto",
    },

    hero: {
      eyebrow:
        "Compra online · Gestión posventa",
      titleFirst:
        "Desistir del",
      titleSecond:
        "contrato.",
      description:
        "Utiliza esta función para comunicar de forma inequívoca tu decisión de desistir de una compra online realizada en VANMOTION.",
      visualNumber: "14",
      visualWord: "DÍAS",
    },

    success: {
      label: "Solicitud registrada",
      title:
        "Hemos recibido tu desistimiento",
      description:
        "La solicitud ha quedado guardada y hemos intentado enviarte una confirmación por correo electrónico.",
      reference:
        "Referencia de la solicitud",
      keep:
        "Conserva esta referencia y el correo de confirmación.",
    },

    errors: {
      required:
        "Debes completar los campos obligatorios y aceptar la declaración de desistimiento.",
      invalid_reference:
        "La referencia del pedido no es válida. Introduce al menos los últimos 8 caracteres.",
      invalid_email:
        "El correo electrónico introducido no es válido.",
      not_found:
        "No hemos podido verificar un pedido pagado con esa referencia y ese correo. Revisa los datos o contacta con VANMOTION.",
      server:
        "No se ha podido registrar la solicitud en este momento. Inténtalo de nuevo o contacta con VANMOTION.",
    },

    form: {
      label:
        "Función electrónica de desistimiento",
      titleFirst:
        "Identifica",
      titleSecond:
        "tu pedido.",
      description:
        "Introduce la referencia que aparece en el correo de confirmación y el mismo correo utilizado durante el pago.",

      orderReference:
        "Referencia del pedido *",
      orderPlaceholder:
        "Ej. ABC1234567",
      orderHelp:
        "Puedes escribir el identificador completo o sus últimos caracteres.",

      name:
        "Nombre y apellidos *",
      namePlaceholder:
        "Nombre de la persona que realizó la compra",

      email:
        "Correo utilizado en la compra *",
      emailPlaceholder:
        "correo@ejemplo.com",

      message:
        "Mensaje adicional",
      messagePlaceholder:
        "Este campo es opcional. No tienes que explicar el motivo de tu decisión.",

      declaration:
        "Declaro de forma inequívoca que deseo desistir del contrato de compra correspondiente al pedido identificado en este formulario.",

      submit:
        "Desistir del contrato",

      privacy:
        "Los datos se utilizarán para verificar el pedido, registrar la solicitud, enviar la confirmación y gestionar la devolución.",
      privacyLink:
        "Política de Privacidad",
      termsLink:
        "Condiciones de compra",
    },

    information: {
      label:
        "Cómo funciona",
      title:
        "Un proceso claro y verificable.",

      steps: [
        {
          number: "01",
          title:
            "Identificación",
          text:
            "Indica la referencia del pedido, tu nombre y el correo utilizado durante el pago.",
        },
        {
          number: "02",
          title:
            "Declaración",
          text:
            "Marca la declaración y envía el formulario. No es necesario explicar el motivo.",
        },
        {
          number: "03",
          title:
            "Confirmación",
          text:
            "VANMOTION guarda la fecha de recepción y envía una confirmación al correo del pedido.",
        },
        {
          number: "04",
          title:
            "Devolución",
          text:
            "Revisaremos la solicitud y te comunicaremos las instrucciones para devolver el producto.",
        },
      ],

      noticeTitle:
        "Información importante",
      noticeText:
        "El envío de este formulario registra la comunicación de desistimiento, pero no realiza automáticamente el reembolso. La devolución y el reembolso se gestionarán según las Condiciones de compra.",
    },

    footer:
      "HUMILDAD · TRABAJO · MOVIMIENTO",
  },

  en: {
    metadataTitle:
      "Withdraw from the contract",
    metadataDescription:
      "Electronic form for notifying VANMOTION of withdrawal from an online purchase.",

    navigation: {
      home: "VANMOTION",
      terms: "Purchase terms",
      contact: "Contact",
    },

    hero: {
      eyebrow:
        "Online purchase · After-sales service",
      titleFirst:
        "Withdraw from",
      titleSecond:
        "the contract.",
      description:
        "Use this function to communicate unequivocally your decision to withdraw from an online purchase made through VANMOTION.",
      visualNumber: "14",
      visualWord: "DAYS",
    },

    success: {
      label: "Request recorded",
      title:
        "We received your withdrawal request",
      description:
        "The request has been stored and we have attempted to send confirmation by email.",
      reference:
        "Request reference",
      keep:
        "Keep this reference and the confirmation email.",
    },

    errors: {
      required:
        "Complete all required fields and accept the withdrawal declaration.",
      invalid_reference:
        "The order reference is not valid. Enter at least its final 8 characters.",
      invalid_email:
        "The email address entered is not valid.",
      not_found:
        "We could not verify a paid order using that reference and email address. Check the details or contact VANMOTION.",
      server:
        "The request could not be recorded at this time. Try again or contact VANMOTION.",
    },

    form: {
      label:
        "Electronic withdrawal function",
      titleFirst:
        "Identify",
      titleSecond:
        "your order.",
      description:
        "Enter the reference shown in the confirmation email and the same email address used during payment.",

      orderReference:
        "Order reference *",
      orderPlaceholder:
        "Example: ABC1234567",
      orderHelp:
        "You may enter the full identifier or its final characters.",

      name:
        "Full name *",
      namePlaceholder:
        "Name of the person who made the purchase",

      email:
        "Email used for the purchase *",
      emailPlaceholder:
        "email@example.com",

      message:
        "Additional message",
      messagePlaceholder:
        "This field is optional. You do not have to explain the reason for your decision.",

      declaration:
        "I unequivocally declare that I wish to withdraw from the purchase contract relating to the order identified in this form.",

      submit:
        "Withdraw from the contract",

      privacy:
        "The information is used to verify the order, record the request, send confirmation and manage the return.",
      privacyLink:
        "Privacy Policy",
      termsLink:
        "Purchase terms",
    },

    information: {
      label:
        "How it works",
      title:
        "A clear and verifiable process.",

      steps: [
        {
          number: "01",
          title:
            "Identification",
          text:
            "Enter the order reference, your name and the email address used during payment.",
        },
        {
          number: "02",
          title:
            "Declaration",
          text:
            "Accept the declaration and submit the form. You do not need to give a reason.",
        },
        {
          number: "03",
          title:
            "Confirmation",
          text:
            "VANMOTION records the receipt date and sends confirmation to the order email.",
        },
        {
          number: "04",
          title:
            "Return",
          text:
            "We will review the request and send you instructions for returning the product.",
        },
      ],

      noticeTitle:
        "Important information",
      noticeText:
        "Submitting this form records the withdrawal notice but does not automatically issue a refund. The return and refund will be managed under the Purchase terms.",
    },

    footer:
      "HUMILITY · WORK · MOVEMENT",
  },
} as const;

type ErrorCode =
  keyof typeof translations.es.errors;

function isErrorCode(
  value: string | undefined,
): value is ErrorCode {
  return (
    value === "required" ||
    value === "invalid_reference" ||
    value === "invalid_email" ||
    value === "not_found" ||
    value === "server"
  );
}

function safeReference(
  value: string | undefined,
): string {
  return (value ?? "")
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "",
    )
    .slice(0, 40);
}

export async function generateMetadata(): Promise<Metadata> {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return {
    title:
      content.metadataTitle,
    description:
      content.metadataDescription,

    alternates: {
      canonical:
        CANONICAL_URL,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WithdrawalPage({
  searchParams,
}: WithdrawalPageProps) {
  const [
    language,
    parameters,
  ] = await Promise.all([
    getCurrentLanguage(),
    searchParams,
  ]);

  const content =
    translations[language];

  const errorMessage =
    isErrorCode(
      parameters.error,
    )
      ? content.errors[
          parameters.error
        ]
      : null;

  const reference =
    safeReference(
      parameters.referencia,
    );

  const wasSent =
    parameters.enviado === "1";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/proximamente"
          className={styles.logo}
        >
          {content.navigation.home}
        </Link>

        <nav
          className={styles.navigation}
          aria-label={
            language === "es"
              ? "Navegación legal"
              : "Legal navigation"
          }
        >
          <Link href="/condiciones-compra">
            {content.navigation.terms}
          </Link>

          <Link href="/contacto">
            {content.navigation.contact}
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            {content.hero.eyebrow}
          </p>

          <h1>
            {content.hero.titleFirst}
            <br />
            {content.hero.titleSecond}
          </h1>

          <p className={styles.description}>
            {content.hero.description}
          </p>
        </div>

        <div
          className={styles.heroVisual}
          aria-hidden="true"
        >
          <strong>
            {content.hero.visualNumber}
          </strong>

          <span>
            {content.hero.visualWord}
          </span>
        </div>
      </section>

      <section className={styles.content}>
        <section
          className={styles.formSection}
          id="formulario"
        >
          <div className={styles.formIntro}>
            <p className={styles.sectionLabel}>
              {content.form.label}
            </p>

            <h2>
              {content.form.titleFirst}
              <br />
              {content.form.titleSecond}
            </h2>

            <p>
              {content.form.description}
            </p>
          </div>

          <div>
            {wasSent && (
              <div
                className={styles.success}
                role="status"
              >
                <p className={styles.noticeLabel}>
                  {content.success.label}
                </p>

                <strong>
                  {content.success.title}
                </strong>

                <p>
                  {content.success.description}
                </p>

                {reference && (
                  <div
                    className={
                      styles.referenceBox
                    }
                  >
                    <span>
                      {content.success.reference}
                    </span>

                    <code>
                      {reference}
                    </code>
                  </div>
                )}

                <small>
                  {content.success.keep}
                </small>
              </div>
            )}

            {errorMessage && (
              <div
                className={styles.error}
                role="alert"
              >
                <strong>
                  {errorMessage}
                </strong>
              </div>
            )}

            <form
              action={
                createWithdrawalRequestAction
              }
              className={styles.form}
            >
              <div
                className={
                  styles.formFieldFull
                }
              >
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
                  placeholder={
                    content.form
                      .orderPlaceholder
                  }
                  aria-describedby="order-reference-help"
                />

                <small id="order-reference-help">
                  {content.form.orderHelp}
                </small>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="customerName">
                    {content.form.name}
                  </label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder={
                      content.form
                        .namePlaceholder
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="customerEmail">
                    {content.form.email}
                  </label>

                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    maxLength={180}
                    autoComplete="email"
                    placeholder={
                      content.form
                        .emailPlaceholder
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.formFieldFull
                }
              >
                <label htmlFor="customerMessage">
                  {content.form.message}
                </label>

                <textarea
                  id="customerMessage"
                  name="customerMessage"
                  maxLength={2000}
                  rows={6}
                  placeholder={
                    content.form
                      .messagePlaceholder
                  }
                />
              </div>

              <label
                className={
                  styles.declaration
                }
              >
                <input
                  type="checkbox"
                  name="acceptedDeclaration"
                  value="yes"
                  required
                />

                <span>
                  {content.form.declaration}
                </span>
              </label>

              <div className={styles.formFooter}>
                <p>
                  {content.form.privacy}{" "}

                  <Link href="/privacidad">
                    {content.form.privacyLink}
                  </Link>

                  {" · "}

                  <Link href="/condiciones-compra">
                    {content.form.termsLink}
                  </Link>
                </p>

                <button type="submit">
                  {content.form.submit}
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={styles.information}>
          <div className={styles.informationHeader}>
            <p className={styles.sectionLabel}>
              {content.information.label}
            </p>

            <h2>
              {content.information.title}
            </h2>
          </div>

          <div className={styles.steps}>
            {content.information.steps.map(
              (step) => (
                <article key={step.number}>
                  <span>{step.number}</span>

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>
                </article>
              ),
            )}
          </div>

          <aside className={styles.notice}>
            <strong>
              {content.information.noticeTitle}
            </strong>

            <p>
              {content.information.noticeText}
            </p>
          </aside>
        </section>
      </section>

      <footer className={styles.footer}>
        <strong>VANMOTION</strong>

        <span>{content.footer}</span>

        <div>
          <Link href="/aviso-legal">
            {language === "es"
              ? "Aviso legal"
              : "Legal notice"}
          </Link>

          <Link href="/privacidad">
            {language === "es"
              ? "Privacidad"
              : "Privacy"}
          </Link>

          <Link href="/cookies">
            Cookies
          </Link>
        </div>
      </footer>
    </main>
  );
}