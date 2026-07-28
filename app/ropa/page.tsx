import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import ProductPurchasePanel from "./ProductPurchasePanel";
import styles from "./ropa.module.css";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG = "carpe-diem-black-edition-drop-01";
const FALLBACK_SIZES = ["S", "M", "L", "XL"] as const;

function getEffectiveProductStatus(
  storedStatus: string,
  active: boolean,
  totalStock: number,
): string {
  if (!active) {
    return "HIDDEN";
  }

  if (
    storedStatus === "DRAFT" ||
    storedStatus === "COMING_SOON" ||
    storedStatus === "HIDDEN"
  ) {
    return storedStatus;
  }

  return totalStock > 0 ? "AVAILABLE" : "SOLD_OUT";
}

const translations = {
  es: {
    metadata: {
      title: "Ropa · CARPE DIEM Drop 01",
      description:
        "CARPE DIEM Black Edition · Drop 01. La primera prenda oficial de VANMOTION.",
    },
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      label: "VANMOTION Clothing · Drop 01",
      titleFirst: "CARPE DIEM.",
      titleSecond: "BLACK EDITION.",
      statement: "Frente limpio. Mensaje en la espalda.",
      location: "Madrid · España",
      year: "2026",
      productAction: "Ver producto",
      contactAction: "Contacto",
    },
    product: {
      eyebrow: "Primera tirada",
      headingFirst: "Una prenda.",
      headingSecond: "Una idea.",
      intro:
        "Negra, directa y sin exceso. La identidad aparece al moverse, no al intentar llamar la atención.",
      name: "Camiseta CARPE DIEM",
      edition: "Black Edition · Drop 01",
      description:
        "Una camiseta de uso diario con el frontal completamente limpio y el diseño CARPE DIEM situado en la esquina inferior derecha de la espalda.",
      galleryBack: "Espalda",
      galleryFront: "Frontal",
      galleryDetail: "Diseño",
      backAlt:
        "Parte trasera de la camiseta negra con diseño CARPE DIEM en la esquina inferior derecha",
      frontAlt:
        "Parte frontal limpia de la camiseta negra CARPE DIEM VANMOTION",
      designAlt:
        "Diseño CARPE DIEM con logotipo VANMOTION preparado para impresión",
      specs: [
        { label: "Edición", value: "Drop 01" },
        { label: "Tallas", value: "S · M · L · XL" },
        { label: "Impresión", value: "Serigrafía" },
      ],
    },
    manifesto: {
      eyebrow: "La idea",
      titleFirst: "Sin aparentar.",
      titleSecond: "Con intención.",
      principles: [
        {
          number: "01",
          title: "Frontal limpio",
          text: "La prenda no necesita demostrar nada de frente.",
        },
        {
          number: "02",
          title: "Mensaje real",
          text: "CARPE DIEM recuerda que el tiempo se utiliza, no se espera.",
        },
        {
          number: "03",
          title: "Unidades reales",
          text: "El pago permanece activo únicamente mientras existe stock.",
        },
      ],
    },
    contact: {
      label: "Contacto directo",
      title: "¿Hablamos?",
      action: "Abrir contacto",
    },
    footer: {
      identity: "Madrid · España",
      purchaseConditions: "Condiciones de compra",
      withdrawal: "Desistimiento",
      privacy: "Privacidad",
    },
  },
  en: {
    metadata: {
      title: "Clothing · CARPE DIEM Drop 01",
      description:
        "CARPE DIEM Black Edition · Drop 01. The first official VANMOTION garment.",
    },
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      label: "VANMOTION Clothing · Drop 01",
      titleFirst: "CARPE DIEM.",
      titleSecond: "BLACK EDITION.",
      statement: "Clean front. Message on the back.",
      location: "Madrid · Spain",
      year: "2026",
      productAction: "View product",
      contactAction: "Contact",
    },
    product: {
      eyebrow: "First run",
      headingFirst: "One garment.",
      headingSecond: "One idea.",
      intro:
        "Black, direct and free from excess. Identity comes through in movement, without trying to attract attention.",
      name: "CARPE DIEM T-shirt",
      edition: "Black Edition · Drop 01",
      description:
        "An everyday T-shirt with a completely clean front and the CARPE DIEM design placed at the lower right of the back.",
      galleryBack: "Back",
      galleryFront: "Front",
      galleryDetail: "Design",
      backAlt:
        "Back of the black T-shirt with the CARPE DIEM design in the lower-right corner",
      frontAlt:
        "Clean front of the black VANMOTION CARPE DIEM T-shirt",
      designAlt:
        "CARPE DIEM design with VANMOTION logo prepared for printing",
      specs: [
        { label: "Edition", value: "Drop 01" },
        { label: "Sizes", value: "S · M · L · XL" },
        { label: "Print", value: "Screen print" },
      ],
    },
    manifesto: {
      eyebrow: "The idea",
      titleFirst: "No pretending.",
      titleSecond: "Built with intent.",
      principles: [
        {
          number: "01",
          title: "Clean front",
          text: "The garment does not need to prove anything from the front.",
        },
        {
          number: "02",
          title: "Real message",
          text: "CARPE DIEM is a reminder to use time rather than wait for it.",
        },
        {
          number: "03",
          title: "Real units",
          text: "Secure payment remains active only while stock exists.",
        },
      ],
    },
    contact: {
      label: "Direct contact",
      title: "Let’s talk.",
      action: "Open contact",
    },
    footer: {
      identity: "Madrid · Spain",
      purchaseConditions: "Purchase conditions",
      withdrawal: "Withdrawal",
      privacy: "Privacy",
    },
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function RopaPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  const databaseProduct = await prisma.product.findUnique({
    where: {
      slug: PRODUCT_SLUG,
    },
    include: {
      variants: {
        where: {
          active: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      images: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
    },
  });

  const imagesByView = new Map(
    databaseProduct?.images.map((image) => [image.view, image.url]) ?? [],
  );

  const frontImage =
    imagesByView.get("FRONT") ?? "/ropa/carpe-diem-frontal.webp";
  const backImage =
    imagesByView.get("BACK") ?? "/ropa/carpe-diem-trasera.webp";
  const detailImage =
    imagesByView.get("DETAIL") ?? "/ropa/carpe-diem-diseno.webp";

  const productName = databaseProduct?.name ?? content.product.name;
  const productDescription =
    language === "es"
      ? databaseProduct?.description ?? content.product.description
      : databaseProduct?.descriptionEn ??
        databaseProduct?.description ??
        content.product.description;

  const productVariants = databaseProduct
    ? databaseProduct.variants.map((variant) => ({
        size: variant.size,
        stock: variant.stock,
        active: variant.active,
      }))
    : FALLBACK_SIZES.map((size) => ({
        size,
        stock: 0,
        active: true,
      }));

  const totalProductStock = productVariants.reduce(
    (total, variant) => (variant.active ? total + variant.stock : total),
    0,
  );

  const productStatus = getEffectiveProductStatus(
    databaseProduct?.status ?? "COMING_SOON",
    databaseProduct?.active ?? true,
    totalProductStock,
  );

  return (
    <main className={styles.page}>
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
          aria-label={
            language === "es" ? "Navegación principal" : "Main navigation"
          }
        >
          <Link href="/coleccion">{content.navigation.vehicles}</Link>
          <Link href="/musica">{content.navigation.music}</Link>
          <Link href="/ropa" className={styles.active} aria-current="page">
            {content.navigation.clothing}
          </Link>
          <Link href="/contacto">{content.navigation.contact}</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="clothing-title">
        <Image
          src="/ropa/carpe-diem-black-edition.webp"
          alt={`${content.product.name} · ${content.product.edition}`}
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} aria-hidden="true" />

        <div className={styles.heroTopline}>
          <span>{content.hero.location}</span>
          <span>{content.hero.year}</span>
        </div>

        <div className={styles.heroCopy}>
          <p>{content.hero.label}</p>
          <h1 id="clothing-title">
            <span>{content.hero.titleFirst}</span>
            <span>{content.hero.titleSecond}</span>
          </h1>
        </div>

        <div className={styles.heroFoot}>
          <span>{content.hero.statement}</span>
          <div>
            <Link href="#producto">{content.hero.productAction}</Link>
            <Link href="/contacto?motivo=ropa#formulario">
              {content.hero.contactAction}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.productSection} id="producto">
        <div className={styles.productHeading}>
          <p>{content.product.eyebrow}</p>
          <h2>
            <span>{content.product.headingFirst}</span>
            <span>{content.product.headingSecond}</span>
          </h2>
          <p className={styles.productIntro}>{content.product.intro}</p>
        </div>

        <div className={styles.productLayout}>
          <div className={styles.productGallery}>
            <figure className={styles.galleryMain}>
              <Image
                src={backImage}
                alt={content.product.backAlt}
                fill
                sizes="(max-width: 980px) 100vw, 48vw"
              />
              <figcaption>{content.product.galleryBack}</figcaption>
            </figure>

            <div className={styles.gallerySecondary}>
              <figure>
                <Image
                  src={frontImage}
                  alt={content.product.frontAlt}
                  fill
                  sizes="(max-width: 720px) 50vw, 23vw"
                />
                <figcaption>{content.product.galleryFront}</figcaption>
              </figure>

              <figure className={styles.designFigure}>
                <Image
                  src={detailImage}
                  alt={content.product.designAlt}
                  fill
                  sizes="(max-width: 720px) 50vw, 23vw"
                />
                <figcaption>{content.product.galleryDetail}</figcaption>
              </figure>
            </div>
          </div>

          <div className={styles.productInformation}>
            <p className={styles.productLabel}>{content.product.edition}</p>
            <h3>{productName}</h3>
            <p className={styles.productDescription}>{productDescription}</p>

            <dl className={styles.productSpecs}>
              {content.product.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>

            <ProductPurchasePanel
              language={language}
              productName={productName}
              productSlug={databaseProduct?.slug ?? PRODUCT_SLUG}
              price={Number(databaseProduct?.price ?? 34.9)}
              currency={databaseProduct?.currency ?? "EUR"}
              status={productStatus}
              variants={productVariants}
            />
          </div>
        </div>
      </section>

      <section className={styles.manifesto}>
        <div className={styles.manifestoTitle}>
          <p>{content.manifesto.eyebrow}</p>
          <h2>
            <span>{content.manifesto.titleFirst}</span>
            <span>{content.manifesto.titleSecond}</span>
          </h2>
        </div>

        <div className={styles.principles}>
          {content.manifesto.principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contact}>
        <div>
          <p>{content.contact.label}</p>
          <h2>{content.contact.title}</h2>
        </div>

        <Link href="/contacto?motivo=ropa#formulario">
          {content.contact.action}
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Vanmotion</strong>
          <span>{content.footer.identity}</span>
        </div>

        <nav aria-label={language === "es" ? "Enlaces legales" : "Legal links"}>
          <Link href="/condiciones-compra">
            {content.footer.purchaseConditions}
          </Link>
          <Link href="/desistimiento">{content.footer.withdrawal}</Link>
          <Link href="/privacidad">{content.footer.privacy}</Link>
        </nav>

        <span>© 2026</span>
      </footer>
    </main>
  );
}
