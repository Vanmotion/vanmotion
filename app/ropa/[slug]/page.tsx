import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import ProductPurchasePanel from "../ProductPurchasePanel";
import styles from "./producto.module.css";

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
      LIFESTYLE: "Lifestyle",
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
      LIFESTYLE: "Lifestyle",
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
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Producto no encontrado · VANMOTION",
    };
  }

  const language = await getCurrentLanguage();
  const description =
    language === "es"
      ? product.description ?? product.subtitle ?? product.name
      : product.descriptionEn ??
        product.description ??
        product.subtitle ??
        product.name;

  return {
    title: `${product.name} · VANMOTION`,
    description,
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
        url: image.url,
        alt: image.alt ?? product.name,
      },
    ]),
  );

  const gallerySlots = [
    "FRONT",
    "BACK",
    "DETAIL",
    "LIFESTYLE",
  ] as const;

  return (
    <main className={styles.page}>
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
          <Link href="/contacto">
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
            <p>{product.collection ?? "Drop 01"}</p>
            <h1>{product.name}</h1>
            {product.subtitle ? <h2>{product.subtitle}</h2> : null}
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
                  <div className={styles.imageWrap}>
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        className={styles.image}
                        priority={view === "FRONT"}
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
                <dd>{product.color ?? "—"}</dd>
              </div>
              <div>
                <dt>{content.specs.material}</dt>
                <dd>{product.material ?? "—"}</dd>
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
              productName={product.name}
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
