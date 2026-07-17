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

const translations = {
  es: {
    metadata: {
      title: "Ropa · CARPE DIEM Drop 01",
      description:
        "Primer producto VANMOTION: camiseta CARPE DIEM Black Edition, Drop 01.",
    },

    navigation: {
      home: "Inicio",
      collection: "Colección",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
      contactAction: "Contactar",
    },

    hero: {
      eyebrow: "VANMOTION Clothing · Drop 01",
      titleFirst: "CARPE DIEM",
      titleSecond: "BLACK EDITION.",
      description:
        "La primera prenda oficial de VANMOTION. Una camiseta negra, limpia por delante y con el mensaje colocado de forma intencionada en la espalda.",
      primaryAction: "Ver producto",
      secondaryAction: "Consultar disponibilidad",
      visualTopLeft: "PRIMER PRODUCTO",
      visualTopRight: "2026",
      visualBottomLeft: "BLACK EDITION",
      visualBottomRight: "DROP 01",
    },

    product: {
      eyebrow: "Primera tirada",
      name: "Camiseta CARPE DIEM",
      edition: "Black Edition · Drop 01",
      description:
        "Una prenda sencilla con un mensaje directo. El frontal se mantiene completamente limpio y el diseño aparece en la esquina inferior derecha de la espalda, respetando una identidad discreta y reconocible.",
      galleryFront: "Vista frontal",
      galleryBack: "Vista trasera",
      galleryDetail: "Diseño de impresión",
      frontAlt:
        "Parte frontal de la camiseta negra CARPE DIEM VANMOTION, sin impresión",
      backAlt:
        "Parte trasera de la camiseta negra con diseño CARPE DIEM en la esquina inferior derecha",
      designAlt:
        "Diseño CARPE DIEM con logotipo VANMOTION preparado para impresión",
    },

    details: {
      eyebrow: "Especificaciones del producto",
      titleFirst: "Diseñado para",
      titleSecond: "llevarlo de verdad.",
      intro:
        "El primer drop se plantea como una prenda cotidiana: resistente, cómoda y producida con una impresión profesional que conserve el contraste del blanco, amarillo y gris oscuro.",
      cards: [
        {
          number: "01",
          title: "Colocación",
          text:
            "Espalda, esquina inferior derecha. Separación aproximada de 4–6 cm del borde inferior y 3–4 cm de la costura lateral.",
        },
        {
          number: "02",
          title: "Tamaño",
          text:
            "Diseño de 18 × 20 cm para M, L y XL. En talla S se adapta a 15 × 17 cm.",
        },
        {
          number: "03",
          title: "Tallas",
          text:
            "Primera selección prevista: S, M, L y XL. El stock real se configurará antes de activar el pago.",
        },
        {
          number: "04",
          title: "Impresión",
          text:
            "Serigrafía profesional para mantener durabilidad, definición y consistencia entre unidades.",
        },
      ],
      colorTitle: "Paleta oficial",
      colors: [
        { name: "CARPE", value: "#FFFFFF" },
        { name: "DIEM", value: "#FFD200" },
        { name: "Letras DIEM", value: "#000000" },
        { name: "Logo VANMOTION", value: "#3A3A3A" },
      ],
    },

    philosophy: {
      eyebrow: "Filosofía VANMOTION",
      titleFirst: "Sin aparentar.",
      titleSecond: "Con intención.",
      principles: [
        {
          number: "01",
          title: "Frontal limpio",
          description:
            "La parte delantera no necesita demostrar nada. La identidad aparece cuando la persona se mueve.",
        },
        {
          number: "02",
          title: "Mensaje real",
          description:
            "CARPE DIEM no se utiliza como decoración: representa aprovechar el tiempo y seguir construyendo.",
        },
        {
          number: "03",
          title: "Producción responsable",
          description:
            "Primero se confirmarán calidad, tallaje, coste y unidades. Después se activará el pago seguro.",
        },
      ],
    },

    contact: {
      eyebrow: "Drop 01 · primeras unidades",
      titleFirst: "¿Quieres reservar",
      titleSecond: "la primera camiseta?",
      description:
        "Selecciona talla y cantidad en la ficha. La solicitud llegará al panel privado de VANMOTION y confirmaremos personalmente disponibilidad y condiciones antes del pago.",
      action: "Hablar con VANMOTION",
    },

    footer: "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    metadata: {
      title: "Clothing · CARPE DIEM Drop 01",
      description:
        "VANMOTION's first product: the CARPE DIEM Black Edition T-shirt, Drop 01.",
    },

    navigation: {
      home: "Home",
      collection: "Collection",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
      contactAction: "Get in touch",
    },

    hero: {
      eyebrow: "VANMOTION Clothing · Drop 01",
      titleFirst: "CARPE DIEM",
      titleSecond: "BLACK EDITION.",
      description:
        "The first official VANMOTION garment. A black T-shirt, completely clean on the front, with the message intentionally placed on the back.",
      primaryAction: "View product",
      secondaryAction: "Ask about availability",
      visualTopLeft: "FIRST PRODUCT",
      visualTopRight: "2026",
      visualBottomLeft: "BLACK EDITION",
      visualBottomRight: "DROP 01",
    },

    product: {
      eyebrow: "First run",
      name: "CARPE DIEM T-shirt",
      edition: "Black Edition · Drop 01",
      description:
        "A simple garment with a direct message. The front remains completely clean and the design sits in the lower-right corner of the back, creating a discreet and recognisable identity.",
      galleryFront: "Front view",
      galleryBack: "Back view",
      galleryDetail: "Print design",
      frontAlt:
        "Front of the black VANMOTION CARPE DIEM T-shirt without a print",
      backAlt:
        "Back of the black T-shirt with the CARPE DIEM design in the lower-right corner",
      designAlt:
        "CARPE DIEM design with VANMOTION logo prepared for printing",
    },

    details: {
      eyebrow: "Product specifications",
      titleFirst: "Designed to",
      titleSecond: "be worn for real.",
      intro:
        "The first drop is designed as an everyday garment: durable, comfortable and professionally printed to preserve the contrast between white, yellow and dark grey.",
      cards: [
        {
          number: "01",
          title: "Placement",
          text:
            "Back, lower-right corner. Approximately 4–6 cm from the bottom edge and 3–4 cm from the side seam.",
        },
        {
          number: "02",
          title: "Size",
          text:
            "18 × 20 cm design for M, L and XL. Adapted to 15 × 17 cm for size S.",
        },
        {
          number: "03",
          title: "Sizes",
          text:
            "Initial selection: S, M, L and XL. Actual stock will be configured before payment is activated.",
        },
        {
          number: "04",
          title: "Printing",
          text:
            "Professional screen printing to maintain durability, definition and consistency across all units.",
        },
      ],
      colorTitle: "Official palette",
      colors: [
        { name: "CARPE", value: "#FFFFFF" },
        { name: "DIEM", value: "#FFD200" },
        { name: "DIEM letters", value: "#000000" },
        { name: "VANMOTION logo", value: "#3A3A3A" },
      ],
    },

    philosophy: {
      eyebrow: "VANMOTION Philosophy",
      titleFirst: "No pretending.",
      titleSecond: "Built with intent.",
      principles: [
        {
          number: "01",
          title: "Clean front",
          description:
            "The front does not need to prove anything. The identity appears when the person moves.",
        },
        {
          number: "02",
          title: "Real message",
          description:
            "CARPE DIEM is not used as decoration: it represents making use of time and continuing to build.",
        },
        {
          number: "03",
          title: "Responsible production",
          description:
            "Quality, sizing, cost and quantities will be confirmed first. Secure payment will then be activated.",
        },
      ],
    },

    contact: {
      eyebrow: "Drop 01 · first units",
      titleFirst: "Would you like to reserve",
      titleSecond: "the first T-shirt?",
      description:
        "Choose your size and quantity on the product card. The request will reach the private VANMOTION panel and we will personally confirm availability and conditions before payment.",
      action: "Talk to VANMOTION",
    },

    footer: "Vehicles · Music · Design · Madrid",
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

  const productStatus =
    databaseProduct?.active === false
      ? "HIDDEN"
      : databaseProduct?.status ?? "COMING_SOON";

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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          VANMOTION
        </Link>

        <nav
          className={styles.navigation}
          aria-label={
            language === "es"
              ? "Navegación principal"
              : "Main navigation"
          }
        >
          <Link href="/">{content.navigation.home}</Link>
          <Link href="/coleccion">
            {content.navigation.collection}
          </Link>
          <Link href="/musica">
            {content.navigation.music}
          </Link>
          <Link
            href="/ropa"
            className={styles.active}
            aria-current="page"
          >
            {content.navigation.clothing}
          </Link>
          <Link href="/contacto">
            {content.navigation.contact}
          </Link>
        </nav>

        <Link href="/contacto" className={styles.headerButton}>
          {content.navigation.contactAction}
          <span>→</span>
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{content.hero.eyebrow}</p>

          <h1>
            {content.hero.titleFirst}
            <br />
            {content.hero.titleSecond}
          </h1>

          <p className={styles.description}>
            {content.hero.description}
          </p>

          <div className={styles.heroActions}>
            <Link href="#producto" className={styles.primaryButton}>
              {content.hero.primaryAction}
              <span>↓</span>
            </Link>

            <Link href="/contacto" className={styles.secondaryButton}>
              {content.hero.secondaryAction}
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.visualTop}>
            <span>{content.hero.visualTopLeft}</span>
            <span>{content.hero.visualTopRight}</span>
          </div>

          <div className={styles.heroImage}>
            <Image
              src="/ropa/carpe-diem-black-edition.webp"
              alt={`${content.product.name} · ${content.product.edition}`}
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 1050px) 100vw, 48vw"
            />
          </div>

          <div className={styles.visualBottom}>
            <span>{content.hero.visualBottomLeft}</span>
            <span>{content.hero.visualBottomRight}</span>
          </div>
        </div>
      </section>

      <section className={styles.productSection} id="producto">
        <div className={styles.productGallery}>
          <figure className={styles.galleryMain}>
            <Image
              src={backImage}
              alt={content.product.backAlt}
              width={768}
              height={1024}
              sizes="(max-width: 900px) 100vw, 44vw"
            />
            <figcaption>{content.product.galleryBack}</figcaption>
          </figure>

          <div className={styles.gallerySecondary}>
            <figure>
              <Image
                src={frontImage}
                alt={content.product.frontAlt}
                width={768}
                height={1024}
                sizes="(max-width: 700px) 50vw, 22vw"
              />
              <figcaption>{content.product.galleryFront}</figcaption>
            </figure>

            <figure className={styles.designFigure}>
              <Image
                src={detailImage}
                alt={content.product.designAlt}
                width={1024}
                height={1536}
                sizes="(max-width: 700px) 50vw, 22vw"
              />
              <figcaption>{content.product.galleryDetail}</figcaption>
            </figure>
          </div>
        </div>

        <div className={styles.productInformation}>
          <p className={styles.eyebrow}>{content.product.eyebrow}</p>

          <h2>{productName}</h2>
          <p className={styles.productEdition}>
            {content.product.edition}
          </p>

          <p className={styles.productDescription}>
            {productDescription}
          </p>

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
      </section>

      <section className={styles.detailsSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{content.details.eyebrow}</p>
            <h2>
              {content.details.titleFirst}
              <br />
              {content.details.titleSecond}
            </h2>
          </div>

          <p>{content.details.intro}</p>
        </div>

        <div className={styles.specificationGrid}>
          {content.details.cards.map((card) => (
            <article key={card.number}>
              <span>{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>

        <div className={styles.palettePanel}>
          <div>
            <p className={styles.eyebrow}>
              {content.details.colorTitle}
            </p>
            <strong>CARPE / DIEM / VANMOTION</strong>
          </div>

          <div className={styles.colorList}>
            {content.details.colors.map((color) => (
              <div key={color.name}>
                <span
                  className={styles.colorSwatch}
                  style={{ background: color.value }}
                  aria-hidden="true"
                />
                <div>
                  <strong>{color.name}</strong>
                  <small>{color.value}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.philosophySection}>
        <div className={styles.philosophyTitle}>
          <p className={styles.eyebrow}>{content.philosophy.eyebrow}</p>
          <h2>
            {content.philosophy.titleFirst}
            <br />
            {content.philosophy.titleSecond}
          </h2>
        </div>

        <div className={styles.principles}>
          {content.philosophy.principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contactSection}>
        <div>
          <p className={styles.eyebrow}>{content.contact.eyebrow}</p>
          <h2>
            {content.contact.titleFirst}
            <br />
            {content.contact.titleSecond}
          </h2>
        </div>

        <div className={styles.contactCopy}>
          <p>{content.contact.description}</p>
          <Link href="/contacto?motivo=ropa#formulario">
            {content.contact.action}
            <span>→</span>
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>VANMOTION</strong>
        <span>{content.footer}</span>
        <span>© 2026 VANMOTION</span>
      </footer>
    </main>
  );
}
