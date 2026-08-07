import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";
import { resolveProductImageUrl } from "@/app/lib/product-image-overrides";

import ProductPurchasePanel from "../ProductPurchasePanel";
import { getLocalizedProductText } from "../product-translations";
import styles from "./producto.module.css";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vanmotion.es";
function absoluteUrl(value: string): string {
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

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

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const translations = {
  es: {
    back: "Volver a la colección",
    collection: "Colección inaugural · Drop 01",
    gallery: {
      FRONT: "Frontal",
      BACK: "Espalda",
      DETAIL: "Detalle",
      LIFESTYLE: "Portada con modelo",
    },
    specs: {
      garment: "Prenda",
      color: "Color",
      material: "Material",
      sizes: "Tallas",
    },
    noImage: "Imagen pendiente",
    productTypes: {
      TSHIRT: "Camiseta",
      BOMBER: "Bomber",
    },
    footer: "Madrid · España",
  },
  en: {
    back: "Back to the collection",
    collection: "Inaugural collection · Drop 01",
    gallery: {
      FRONT: "Front",
      BACK: "Back",
      DETAIL: "Detail",
      LIFESTYLE: "Model cover",
    },
    specs: {
      garment: "Garment",
      color: "Colour",
      material: "Material",
      sizes: "Sizes",
    },
    noImage: "Image pending",
    productTypes: {
      TSHIRT: "T-shirt",
      BOMBER: "Bomber",
    },
    footer: "Madrid · Spain",
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

async function getProduct(slug: string) {
  if (
    !MANAGED_PRODUCT_SLUGS.includes(
      slug as (typeof MANAGED_PRODUCT_SLUGS)[number],
    )
  ) {
    return null;
  }

  return prisma.product.findFirst({
    where: {
      slug,
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
  });
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [language, product] = await Promise.all([
    getCurrentLanguage(),
    getProduct(slug),
  ]);

  if (!product) {
    return {
      title: language === "es" ? "Producto no encontrado" : "Product not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productText = getLocalizedProductText(product, language);

  const totalStock = product.variants.reduce(
    (total, variant) => (variant.active ? total + variant.stock : total),
    0,
  );
  const productStatus = getEffectiveProductStatus(
    product.status,
    product.active,
    totalStock,
  );
  const shouldIndex =
    productStatus !== "DRAFT" &&
    productStatus !== "HIDDEN";

  const locale = language === "es" ? "es-ES" : "en-GB";
  const productType =
    product.productType === "BOMBER"
      ? language === "es"
        ? "Bomber"
        : "Bomber jacket"
      : language === "es"
        ? "Camiseta"
        : "T-shirt";
  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(product.price));
  const canonicalUrl = `${SITE_URL}/ropa/${product.slug}`;
  const socialImage = product.images[0]?.url
    ? absoluteUrl(
        resolveProductImageUrl(
          product.slug,
          product.images[0].view,
          product.images[0].url,
        ),
      )
    : undefined;

  const title =
    language === "es"
      ? `${productText.name} · ${productType} urbana`
      : `${productText.name} · ${productType}`;

  const availabilityText =
    language === "es"
      ? productStatus === "AVAILABLE"
        ? `Disponible online desde Madrid por ${price}.`
        : productStatus === "SOLD_OUT"
          ? "Actualmente agotada."
          : productStatus === "COMING_SOON"
            ? "Próximo lanzamiento."
            : "Producto de la colección VANMOTION."
      : productStatus === "AVAILABLE"
        ? `Available online from Madrid for ${price}.`
        : productStatus === "SOLD_OUT"
          ? "Currently sold out."
          : productStatus === "COMING_SOON"
            ? "Coming soon."
            : "Part of the VANMOTION collection.";

  const description =
    language === "es"
      ? `${productText.name}. ${productType} VANMOTION${productText.color ? ` en color ${productText.color}` : ""}. Colección ${productText.collection ?? "Drop 01"}. ${availabilityText}`
      : `${productText.name}. VANMOTION ${productType}${productText.color ? ` in ${productText.color}` : ""}. ${productText.collection ?? "Drop 01"} collection. ${availabilityText}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "VANMOTION",
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: product.images[0]?.alt ?? productText.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const language = await getCurrentLanguage();
  const content = translations[language];
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const productVariants = product.variants.map((variant) => ({
    size: variant.size,
    stock: variant.stock,
    active: variant.active,
  }));

  const totalProductStock = productVariants.reduce(
    (total, variant) =>
      variant.active ? total + variant.stock : total,
    0,
  );

  const productStatus = getEffectiveProductStatus(
    product.status,
    product.active,
    totalProductStock,
  );

  const productText = getLocalizedProductText(product, language);

  const productDescription =
    language === "es"
      ? product.description ?? ""
      : product.descriptionEn ?? product.description ?? "";

  const productType =
    product.productType === "BOMBER"
      ? content.productTypes.BOMBER
      : content.productTypes.TSHIRT;

  const imagesByView = new Map(
    product.images.map((image) => [
      image.view,
      {
        url: resolveProductImageUrl(product.slug, image.view, image.url),
        alt: image.alt ?? productText.name,
      },
    ]),
  );

  const gallerySlots = [
    "LIFESTYLE",
    "FRONT",
    "BACK",
    "DETAIL",
  ] as const;

  const canonicalUrl = `${SITE_URL}/ropa/${product.slug}`;
  const productImages = product.images.map((image) =>
    absoluteUrl(resolveProductImageUrl(product.slug, image.view, image.url)),
  );
  const schemaAvailability =
    productStatus === "AVAILABLE"
      ? "https://schema.org/InStock"
      : productStatus === "COMING_SOON"
        ? "https://schema.org/PreOrder"
        : productStatus === "SOLD_OUT"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/Discontinued";

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productText.name,
    url: canonicalUrl,
    image: productImages.length > 0 ? productImages : undefined,
    description:
      productDescription ||
      productText.subtitle ||
      productText.name,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "VANMOTION",
    },
    category: productType,
    color: productText.color ?? undefined,
    material: productText.material ?? undefined,
    additionalProperty:
      productVariants.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: content.specs.sizes,
              value: productVariants
                .map((variant) => variant.size)
                .join(", "),
            },
          ]
        : undefined,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: product.currency,
      price: Number(product.price),
      availability: schemaAvailability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "VANMOTION",
        url: SITE_URL,
      },
    },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="VANMOTION">
          <Image
            src="/brand/vanmotion-mark.webp"
            alt=""
            width={76}
            height={36}
            priority
            className={styles.brandMark}
          />
          <span>VANMOTION</span>
        </Link>

        <nav className={styles.navigation}>
          <Link href="/coleccion">
            {language === "es" ? "Vehículos" : "Vehicles"}
          </Link>
          <Link href="/musica">
            {language === "es" ? "Música" : "Music"}
          </Link>
          <Link href="/ropa" className={styles.active}>
            {language === "es" ? "Ropa" : "Clothing"}
          </Link>
          <Link
            href="/contacto"
            aria-hidden="true"
            tabIndex={-1}
            style={{ visibility: "hidden", pointerEvents: "none" }}
          >
            {language === "es" ? "Contacto" : "Contact"}
          </Link>
        </nav>
      </header>

      <section className={styles.product}>
        <div className={styles.topline}>
          <Link href="/ropa#coleccion" className={styles.backLink}>
            <span aria-hidden="true">←</span>
            {content.back}
          </Link>

          <span>{content.collection}</span>
        </div>

        <div className={styles.productHeading}>
          <div>
            <p>{productText.collection ?? "Drop 01"}</p>
            <h1>{productText.name}</h1>
            {productText.subtitle ? <h2>{productText.subtitle}</h2> : null}
          </div>

          <strong>
            {new Intl.NumberFormat(
              language === "es" ? "es-ES" : "en-GB",
              {
                style: "currency",
                currency: product.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            ).format(Number(product.price))}
          </strong>
        </div>

        <div className={styles.layout}>
          <div className={styles.gallery}>
            {gallerySlots.map((view) => {
              const image = imagesByView.get(view);

              return (
                <article key={view} className={styles.galleryItem}>
                  <div className={`${styles.imageWrap} ${view === "LIFESTYLE" ? styles.modelImageWrap : ""}`}>
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        className={styles.image}
                        priority={view === "LIFESTYLE"}
                      />
                    ) : (
                      <div className={styles.placeholder}>
                        {content.noImage}
                      </div>
                    )}
                  </div>

                  <span>{content.gallery[view]}</span>
                </article>
              );
            })}
          </div>

          <aside className={styles.information}>
            <div className={styles.description}>
              <p>{productDescription}</p>
            </div>

            <dl className={styles.specifications}>
              <div>
                <dt>{content.specs.garment}</dt>
                <dd>{productType}</dd>
              </div>
              <div>
                <dt>{content.specs.color}</dt>
                <dd>{productText.color ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.specs.material}</dt>
                <dd>{productText.material ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.specs.sizes}</dt>
                <dd>
                  {productVariants
                    .map((variant) => variant.size)
                    .join(" · ")}
                </dd>
              </div>
            </dl>

            <ProductPurchasePanel
              language={language}
              productName={productText.name}
              productSlug={product.slug}
              price={Number(product.price)}
              currency={product.currency}
              status={productStatus}
              variants={productVariants}
            />
          </aside>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>VANMOTION</strong>
        <span>{content.footer}</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
