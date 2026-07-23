import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "../legal.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/cookies";

const translations = {
  es: {
    metadataTitle: "Política de cookies",
    metadataDescription:
      "Información sobre las cookies técnicas utilizadas por VANMOTION y la forma de gestionarlas.",

    location: "Madrid · España",
    eyebrow: "Información sobre cookies",
    title: "POLÍTICA DE COOKIES",
    introduction:
      "Esta política explica qué cookies utiliza actualmente VANMOTION, para qué sirven, cuánto tiempo permanecen activas y cómo puede gestionarlas el usuario.",

    definitionTitle:
      "1. Qué son las cookies",
    definitionText:
      "Las cookies son pequeños archivos o identificadores que un sitio web puede guardar en el navegador del usuario. Permiten recordar determinada información, mantener sesiones, conservar preferencias o habilitar funciones necesarias para prestar un servicio.",

    currentUseTitle:
      "2. Cookies utilizadas actualmente",
    currentUseText:
      "La configuración actual de VANMOTION utiliza únicamente cookies propias de carácter técnico o de preferencia. No se utilizan actualmente cookies publicitarias, de seguimiento comercial, de elaboración de perfiles ni de medición de audiencia.",

    languageCookieTitle:
      "Cookie de preferencia de idioma",
    adminCookieTitle:
      "Cookie de sesión administrativa",

    cookieName: "Nombre",
    provider: "Responsable",
    purpose: "Finalidad",
    type: "Tipo",
    duration: "Duración",
    scope: "Usuarios afectados",

    ownerValue: "VANMOTION",

    languageCookieName:
      "vanmotion-language",
    languagePurpose:
      "Recuerda el idioma elegido directamente por el usuario para mostrar el contenido público en español o en inglés.",
    languageType:
      "Cookie propia, técnica y de personalización solicitada por el usuario.",
    languageDuration:
      "Hasta 1 año desde su creación o actualización.",
    languageScope:
      "Usuarios que utilizan el selector ES / EN.",

    adminCookieName:
      "vanmotion_admin_session",
    adminPurpose:
      "Mantiene protegida la sesión del panel privado y permite verificar que el acceso corresponde a una persona administradora autorizada.",
    adminType:
      "Cookie propia, técnica, de seguridad y sesión.",
    adminDuration:
      "Hasta 8 horas desde el inicio de sesión o hasta que la persona administradora cierre la sesión.",
    adminScope:
      "Exclusivamente personas administradoras. No se instala por la navegación pública ordinaria.",

    securityTitle:
      "3. Medidas aplicadas a las cookies",
    securityText:
      "Las cookies utilizadas por VANMOTION se configuran con medidas orientadas a limitar su utilización indebida. Cuando corresponde, se emplean atributos como HttpOnly, Secure en producción, SameSite y un ámbito de ruta definido para el sitio.",

    consentTitle:
      "4. Consentimiento",
    consentText:
      "Las cookies utilizadas actualmente son necesarias para prestar funciones expresamente solicitadas, conservar la preferencia de idioma o proteger el acceso administrativo. Por ello, no se solicita consentimiento previo para estas cookies técnicas.",

    futureText:
      "Si en el futuro VANMOTION incorpora cookies analíticas, publicitarias, de redes sociales o cualquier otra cookie no necesaria, se actualizará esta política y se habilitará un sistema para aceptar, rechazar o configurar esas cookies antes de instalarlas.",

    thirdPartiesTitle:
      "5. Servicios y sitios de terceros",
    thirdPartiesText:
      "El sitio puede dirigir al usuario a servicios externos, como la plataforma de pago Stripe, redes sociales, plataformas musicales u otras páginas de terceros. Al abandonar VANMOTION, esos servicios pueden utilizar sus propias cookies conforme a sus respectivas políticas y configuraciones.",

    stripeText:
      "El pago se realiza en el entorno seguro de Stripe Checkout. Las cookies que Stripe pueda utilizar dentro de su propia plataforma son gestionadas por Stripe y no constituyen cookies instaladas directamente por VANMOTION en su dominio.",

    managementTitle:
      "6. Cómo gestionar o eliminar cookies",
    managementText:
      "El usuario puede consultar, bloquear o eliminar cookies desde la configuración de privacidad de su navegador. Los pasos concretos dependen del navegador y del dispositivo utilizado.",

    consequencesText:
      "Bloquear o eliminar las cookies técnicas puede provocar que el idioma seleccionado no se recuerde o que una sesión administrativa deje de funcionar. La navegación pública básica debería continuar disponible siempre que no dependa de una función técnica concreta.",

    changesTitle:
      "7. Cambios en esta política",
    changesText:
      "VANMOTION podrá actualizar esta política cuando cambien las cookies utilizadas, se incorporen nuevos servicios o resulte necesario adaptar la información a cambios técnicos o normativos. La versión vigente será siempre la publicada en esta página.",

    contactTitle:
      "8. Contacto",
    contactText:
      "Para cualquier consulta relacionada con esta Política de Cookies puede contactar con VANMOTION mediante el siguiente correo electrónico:",

    update:
      "Última actualización: 23 de julio de 2026",
    legalNotice: "Aviso legal",
    privacy: "Privacidad",
    back: "Volver a VANMOTION",
  },

  en: {
    metadataTitle: "Cookie policy",
    metadataDescription:
      "Information about the technical cookies used by VANMOTION and how users can manage them.",

    location: "Madrid · Spain",
    eyebrow: "Cookie information",
    title: "COOKIE POLICY",
    introduction:
      "This policy explains which cookies VANMOTION currently uses, their purposes, how long they remain active and how users can manage them.",

    definitionTitle:
      "1. What cookies are",
    definitionText:
      "Cookies are small files or identifiers that a website may store in a user's browser. They can remember certain information, maintain sessions, preserve preferences or enable functions required to provide a service.",

    currentUseTitle:
      "2. Cookies currently used",
    currentUseText:
      "VANMOTION's current configuration uses only first-party technical or preference cookies. It does not currently use advertising cookies, commercial tracking cookies, profiling cookies or audience-measurement cookies.",

    languageCookieTitle:
      "Language preference cookie",
    adminCookieTitle:
      "Administration session cookie",

    cookieName: "Name",
    provider: "Provider",
    purpose: "Purpose",
    type: "Type",
    duration: "Duration",
    scope: "Affected users",

    ownerValue: "VANMOTION",

    languageCookieName:
      "vanmotion-language",
    languagePurpose:
      "Remembers the language directly selected by the user so that public content can be displayed in Spanish or English.",
    languageType:
      "First-party technical and user-requested personalisation cookie.",
    languageDuration:
      "Up to 1 year from its creation or renewal.",
    languageScope:
      "Users who operate the ES / EN language selector.",

    adminCookieName:
      "vanmotion_admin_session",
    adminPurpose:
      "Maintains the protected administration-panel session and verifies that access belongs to an authorised administrator.",
    adminType:
      "First-party technical, security and session cookie.",
    adminDuration:
      "Up to 8 hours from login or until the administrator signs out.",
    adminScope:
      "Administrators only. It is not installed during ordinary public browsing.",

    securityTitle:
      "3. Security measures applied to cookies",
    securityText:
      "VANMOTION cookies are configured with measures intended to limit improper use. Where appropriate, attributes such as HttpOnly, Secure in production, SameSite and a defined website path are applied.",

    consentTitle:
      "4. Consent",
    consentText:
      "The cookies currently used are required to provide expressly requested functions, retain the selected language or protect administration access. Prior consent is therefore not requested for these technical cookies.",

    futureText:
      "If VANMOTION introduces analytics, advertising, social-media or any other non-essential cookies in the future, this policy will be updated and a system will be provided to accept, reject or configure those cookies before they are installed.",

    thirdPartiesTitle:
      "5. Third-party services and websites",
    thirdPartiesText:
      "The website may direct users to external services such as the Stripe payment platform, social networks, music platforms or other third-party websites. After leaving VANMOTION, those services may use their own cookies in accordance with their respective policies and settings.",

    stripeText:
      "Payments are completed within the secure Stripe Checkout environment. Cookies that Stripe may use within its own platform are managed by Stripe and are not cookies directly installed by VANMOTION on its domain.",

    managementTitle:
      "6. Managing or deleting cookies",
    managementText:
      "Users can view, block or delete cookies through their browser privacy settings. The specific procedure depends on the browser and device being used.",

    consequencesText:
      "Blocking or deleting technical cookies may prevent the selected language from being remembered or cause an administration session to stop working. Basic public browsing should remain available whenever it does not depend on a specific technical function.",

    changesTitle:
      "7. Changes to this policy",
    changesText:
      "VANMOTION may update this policy when the cookies used change, new services are introduced or the information must be adapted to technical or regulatory developments. The current version will always be the version published on this page.",

    contactTitle:
      "8. Contact",
    contactText:
      "For any enquiry concerning this Cookie Policy, users may contact VANMOTION at the following email address:",

    update:
      "Last updated: July 23, 2026",
    legalNotice: "Legal notice",
    privacy: "Privacy",
    back: "Return to VANMOTION",
  },
} as const;

function requireLegalValue(
  variableName: string,
): string {
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
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return {
    title: content.metadataTitle,
    description:
      content.metadataDescription,

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
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  const legalEmail =
    requireLegalValue(
      "LEGAL_EMAIL",
    );

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
          <h2>{content.definitionTitle}</h2>

          <p>{content.definitionText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.currentUseTitle}</h2>

          <div>
            <p>{content.currentUseText}</p>

            <div className={styles.dataGrid}>
              <div>
                <span>
                  {content.languageCookieTitle}
                </span>

                <strong>
                  {content.languageCookieName}
                </strong>
              </div>

              <div>
                <span>{content.provider}</span>

                <strong>
                  {content.ownerValue}
                </strong>
              </div>

              <div>
                <span>{content.purpose}</span>

                <strong>
                  {content.languagePurpose}
                </strong>
              </div>

              <div>
                <span>{content.type}</span>

                <strong>
                  {content.languageType}
                </strong>
              </div>

              <div>
                <span>{content.duration}</span>

                <strong>
                  {content.languageDuration}
                </strong>
              </div>

              <div>
                <span>{content.scope}</span>

                <strong>
                  {content.languageScope}
                </strong>
              </div>
            </div>

            <div className={styles.dataGrid}>
              <div>
                <span>
                  {content.adminCookieTitle}
                </span>

                <strong>
                  {content.adminCookieName}
                </strong>
              </div>

              <div>
                <span>{content.provider}</span>

                <strong>
                  {content.ownerValue}
                </strong>
              </div>

              <div>
                <span>{content.purpose}</span>

                <strong>
                  {content.adminPurpose}
                </strong>
              </div>

              <div>
                <span>{content.type}</span>

                <strong>
                  {content.adminType}
                </strong>
              </div>

              <div>
                <span>{content.duration}</span>

                <strong>
                  {content.adminDuration}
                </strong>
              </div>

              <div>
                <span>{content.scope}</span>

                <strong>
                  {content.adminScope}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.securityTitle}</h2>

          <p>{content.securityText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.consentTitle}</h2>

          <div>
            <p>{content.consentText}</p>
            <p>{content.futureText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.thirdPartiesTitle}</h2>

          <div>
            <p>{content.thirdPartiesText}</p>
            <p>{content.stripeText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.managementTitle}</h2>

          <div>
            <p>{content.managementText}</p>
            <p>{content.consequencesText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.changesTitle}</h2>

          <p>{content.changesText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.contactTitle}</h2>

          <div>
            <p>{content.contactText}</p>

            <div className={styles.dataGrid}>
              <div>
                <span>
                  {content.cookieName === "Nombre"
                    ? "Correo electrónico"
                    : "Email"}
                </span>

                <a href={`mailto:${legalEmail}`}>
                  {legalEmail}
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>

      <footer className={styles.footer}>
        <p>{content.update}</p>

        <Link href="/aviso-legal">
          {content.legalNotice}
        </Link>

        <Link href="/privacidad">
          {content.privacy}
        </Link>

        <Link href="/proximamente">
          {content.back} →
        </Link>
      </footer>
    </main>
  );
}