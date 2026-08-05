import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";
import { getDailyNews } from "@/app/lib/daily-news";
import { prisma } from "@/app/lib/prisma";

import { getLocalizedProductText } from "./product-translations";
import styles from "./ropa.module.css";

export const dynamic = "force-dynamic";

const MANAGED_PRODUCT_SLUGS = [
  "carpe-diem-black-edition-drop-01",
  "carpe-diem-hombre-azul-ford-e150-drop-01",
  "carpe-diem-mujer-negra-drop-01",
  "carpe-diem-mujer-azul-ford-e150-drop-01",
  "bomber-hombre-negra-drop-01",
  "bomber-hombre-azul-ford-e150-drop-01",
  "bomber-mujer-negra-drop-01",
  "bomber-mujer-azul-ford-e150-drop-01",
] as const;

const translations = {
  es: {
    metadata: {
      title: "Ropa urbana, camisetas y bomber en Madrid",
      description:
        "Ropa urbana VANMOTION diseñada en Madrid: camisetas CARPE DIEM y bomber para hombre y mujer en negro y azul Ford E-150.",
    },
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      label: "VANMOTION Clothing · Drop 01",
      titleFirst: "MISMA VERDAD.",
      titleSecond: "OTRA FORMA DE LLEVARLA.",
      statement:
        "Madrid y Nueva York. Negro y azul Ford E-150. Sin aparentar.",
      productAction: "Ver colección",
      contactAction: "Contacto",
      location: "Madrid · España",
      year: "2026",
    },
    editorial: {
      eyebrow: "Colección inaugural",
      headingFirst: "DOS COLORES.",
      headingSecond: "UNA IDENTIDAD.",
      intro:
        "La ropa de VANMOTION nace del mismo lugar que los vehículos y la música: trabajo real, detalle y una identidad que no necesita exagerar.",
      blackTitle: "Madrid · Negro",
      blackText:
        "Una presencia limpia y directa. Bomber satinada, camiseta premium y detalles discretos.",
      blueTitle: "Nueva York · Azul Ford E-150",
      blueText:
        "El color de la furgo oficial llevado a la colección sin perder sobriedad ni equilibrio.",
    },
    collection: {
      eyebrow: "Drop 01",
      headingFirst: "LA COLECCIÓN.",
      headingSecond: "HOMBRE Y MUJER.",
      intro:
        "Ocho productos independientes con stock, talla, precio, estado e imágenes propios.",
      noImage: "Imagen pendiente",
      front: "Frontal",
      back: "Espalda",
      detail: "Detalle",
      lifestyle: "Lifestyle",
      empty: "La colección todavía no está preparada para mostrarse.",
      specs: {
        type: "Prenda",
        color: "Color",
        material: "Material",
        sizes: "Tallas",
      },
      productTypes: {
        TSHIRT: "Camiseta",
        BOMBER: "Bomber",
      },
    },
    principles: {
      eyebrow: "Diseño VANMOTION",
      titleFirst: "MENOS RUIDO.",
      titleSecond: "MÁS INTENCIÓN.",
      items: [
        {
          number: "01",
          title: "Frontal limpio",
          text: "Las camisetas no llevan impresión delante. El diseño CARPE DIEM se coloca muy cerca del bajo, en la zona inferior derecha de la espalda, para que pueda verse parcialmente al llevar una bomber.",
        },
        {
          number: "02",
          title: "Bomber limpia",
          text: "La bomber queda completamente limpia por fuera, sin logotipo ni nombre VANMOTION impresos. La marca aparece únicamente en la etiqueta interior.",
        },
        {
          number: "03",
          title: "Color real",
          text: "Negro con cremalleras negras y azul Ford E-150 con cremalleras azules tono sobre tono.",
        },
      ],
    },
    contact: {
      label: "Contacto directo",
      title: "¿HABLAMOS?",
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
      title: "Urban clothing, T-shirts and bomber jackets from Madrid",
      description:
        "VANMOTION urban clothing designed in Madrid: CARPE DIEM T-shirts and bomber jackets for men and women in black and Ford E-150 blue.",
    },
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      label: "VANMOTION Clothing · Drop 01",
      titleFirst: "THE SAME TRUTH.",
      titleSecond: "A DIFFERENT WAY TO WEAR IT.",
      statement:
        "Madrid and New York. Black and Ford E-150 blue. No pretending.",
      productAction: "View collection",
      contactAction: "Contact",
      location: "Madrid · Spain",
      year: "2026",
    },
    editorial: {
      eyebrow: "Inaugural collection",
      headingFirst: "TWO COLOURS.",
      headingSecond: "ONE IDENTITY.",
      intro:
        "VANMOTION clothing comes from the same place as the vehicles and music: real work, detail and an identity that does not need to exaggerate.",
      blackTitle: "Madrid · Black",
      blackText:
        "A clean and direct presence. Satin bomber, premium T-shirt and discreet details.",
      blueTitle: "New York · Ford E-150 Blue",
      blueText:
        "The colour of the official van brought into the collection without losing restraint or balance.",
    },
    collection: {
      eyebrow: "Drop 01",
      headingFirst: "THE COLLECTION.",
      headingSecond: "MEN AND WOMEN.",
      intro:
        "Eight independent products with their own stock, size, price, status and images.",
      noImage: "Image pending",
      front: "Front",
      back: "Back",
      detail: "Detail",
      lifestyle: "Lifestyle",
      empty: "The collection is not ready to be displayed yet.",
      specs: {
        type: "Garment",
        color: "Colour",
        material: "Material",
        sizes: "Sizes",
      },
      productTypes: {
        TSHIRT: "T-shirt",
        BOMBER: "Bomber",
      },
    },
    principles: {
      eyebrow: "VANMOTION design",
      titleFirst: "LESS NOISE.",
      titleSecond: "MORE INTENT.",
      items: [
        {
          number: "01",
          title: "Clean front",
          text: "The T-shirts have no front print. The CARPE DIEM artwork sits very close to the hem on the lower-right back so it can remain partially visible under a bomber.",
        },
        {
          number: "02",
          title: "Clean bomber",
          text: "The bomber has a completely clean exterior, with no VANMOTION logo or name printed. The brand appears only on the inside label.",
        },
        {
          number: "03",
          title: "Real colour",
          text: "Black with black zippers and Ford E-150 blue with matching blue zippers.",
        },
      ],
    },
    contact: {
      label: "Direct contact",
      title: "LET'S TALK.",
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

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: "/ropa",
    },
    openGraph: {
      title: content.metadata.title,
      description: content.metadata.description,
      type: "website",
      url: "/ropa",
      images: [
        {
          url: "/ropa/editorial/vanmotion-portada-pareja.png",
          alt:
            language === "es"
              ? "Colección de ropa urbana VANMOTION en Madrid"
              : "VANMOTION urban clothing collection in Madrid",
        },
      ],
    },
  };
}

export default async function RopaPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];
  const [, , clothingNews] = await getDailyNews(language);

  const products = await prisma.product.findMany({
    where: {
      slug: {
        in: [...MANAGED_PRODUCT_SLUGS],
      },
      category: "CLOTHING",
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
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

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

      <section className={styles.hero} aria-labelledby="clothing-title">
        <Image
          src="/ropa/editorial/vanmotion-portada-pareja.png"
          alt="Colección negra VANMOTION en Madrid"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} aria-hidden="true" />

        <div className={styles.heroTopline}>
          <span>{content.hero.location}</span>
          <span>{content.navigation.clothing}</span>
        </div>

        <h1 id="clothing-title" className={styles.srOnly}>
          {content.metadata.title}
        </h1>

        <a
          href={clothingNews.url}
          target="_blank"
          rel="noreferrer"
          className={styles.heroNews}
        >
          <span className={styles.heroNewsLabel}>
            {language === "es"
              ? "Actualidad · Moda y textil"
              : "Latest · Fashion and clothing"}
          </span>

          <strong>{clothingNews.title}</strong>

          <small>
            {clothingNews.source}
            <span aria-hidden="true"> ↗</span>
          </small>
        </a>

        <div className={styles.heroFoot}>
          <div>
            <Link href="#coleccion">{content.hero.productAction}</Link>
            <Link href="/contacto?motivo=ropa#formulario">
              {content.hero.contactAction}
            </Link>
          </div>
        </div>
      </section>


      <section className={styles.collectionSection} id="coleccion">
          <h2 className={styles.srOnly}>
            {content.navigation.clothing}
          </h2>

        {products.length === 0 ? (
          <p className={styles.collectionEmpty}>{content.collection.empty}</p>
        ) : (
          <div className={styles.collectionGrid}>
            {products.map((product) => {
              const productText = getLocalizedProductText(product, language);
              const imagesByView = new Map(
                product.images.map((image) => [image.view, image.url]),
              );

              const primaryImage =
                imagesByView.get("LIFESTYLE") ??
                imagesByView.get("FRONT") ??
                imagesByView.get("BACK");

              const productType =
                product.productType === "BOMBER"
                  ? content.collection.productTypes.BOMBER
                  : content.collection.productTypes.TSHIRT;

              const formattedPrice = new Intl.NumberFormat(
                language === "es" ? "es-ES" : "en-US",
                {
                  style: "currency",
                  currency: product.currency,
                },
              ).format(Number(product.price));

              return (
                <article key={product.id} className={styles.collectionCard}>
                  <Link
                    href={`/ropa/${product.slug}`}
                    aria-label={`${language === "es" ? "Ver" : "View"} ${productText.name}`}
                    style={{
                      display: "block",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <div className={styles.collectionMedia}>
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={productText.name}
                          fill
                          sizes="(max-width: 620px) 50vw, (max-width: 1200px) 50vw, 25vw"
                          className={styles.collectionImage}
                        />
                      ) : (
                        <div className={styles.collectionPlaceholder}>
                          <span>{content.collection.noImage}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className={styles.collectionInformation}>

                    <h3>
                      <Link
                        href={`/ropa/${product.slug}`}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {productText.name}
                      </Link>
                    </h3>

                    <div className={styles.collectionSummary}>
                      <span>
                        {productType} · {productText.color ?? "VANMOTION"}
                      </span>
                      <strong>{formattedPrice}</strong>
                    </div>

                    <Link
                      href={`/ropa/${product.slug}`}
                      className={styles.collectionAction}
                    >
                      {language === "es" ? "Ver producto" : "View product"}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>


        <section
          className={styles.contact}
          aria-label={content.navigation.contact}
        >
          <Link href="/contacto?motivo=ropa#formulario">
            <span>{content.navigation.contact}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </section>

      <footer className={styles.footer}>
        <div>
          <strong>Vanmotion</strong>
          <span>{content.footer.identity}</span>
        </div>

        <nav aria-label={language === "es" ? "Enlaces legales" : "Legal links"}>
          <Link href="/aviso-legal">Legal</Link>
        </nav>

        <span>© 2026</span>
      </footer>
    </main>
  );
}
