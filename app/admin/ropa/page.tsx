import Link from "next/link";

import { prisma } from "@/app/lib/prisma";
import { resolveProductImageUrl } from "@/app/lib/product-image-overrides";

import {
  createCarpeDiemProductAction,
  removeProductImageAction,
  updateProductAction,
} from "./actions";

import styles from "./ropa.module.css";
import DirectProductImageUpload from "./DirectProductImageUpload";
import SubmitButton from "./SubmitButton";

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

const SIZE_ORDER = ["XS", "S", "M", "L"] as const;

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  COMING_SOON: "Próximamente",
  AVAILABLE: "Disponible",
  SOLD_OUT: "Agotado",
  HIDDEN: "Oculto",
};

const statusClassNames: Record<string, string> = {
  DRAFT: styles.statusDraft,
  COMING_SOON: styles.statusComingSoon,
  AVAILABLE: styles.statusAvailable,
  SOLD_OUT: styles.statusSoldOut,
  HIDDEN: styles.statusHidden,
};

const productImageSlots = [
  {
    view: "LIFESTYLE",
    number: "1",
    title: "Portada con modelo",
    description:
      "Imagen principal de la ficha: el modelo debe llevar la prenda correspondiente.",
    alt: "Modelo llevando la prenda VANMOTION",
  },
  {
    view: "FRONT",
    number: "2",
    title: "Imagen frontal de la prenda",
    description: "Vista limpia de la parte delantera de la prenda.",
    alt: "Vista frontal del producto VANMOTION",
  },
  {
    view: "BACK",
    number: "3",
    title: "Imagen espalda",
    description: "Vista trasera completa respetando el diseño original.",
    alt: "Vista trasera del producto VANMOTION",
  },
  {
    view: "DETAIL",
    number: "4",
    title: "Imagen detalle",
    description: "Acercamiento del tejido, la cremallera o el estampado.",
    alt: "Detalle del producto VANMOTION",
  },
] as const;

function formatPrice(price: unknown): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function getProductStock(
  variants: Array<{
    stock: number;
    active: boolean;
  }>,
): number {
  return variants.reduce(
    (total, variant) => (variant.active ? total + variant.stock : total),
    0,
  );
}

function getStockAwareStatus(
  storedStatus: string,
  productStock: number,
): string {
  if (
    storedStatus === "DRAFT" ||
    storedStatus === "COMING_SOON" ||
    storedStatus === "HIDDEN"
  ) {
    return storedStatus;
  }

  return productStock > 0 ? "AVAILABLE" : "SOLD_OUT";
}

function getEffectiveStatus(
  storedStatus: string,
  active: boolean,
  productStock: number,
): string {
  if (!active) {
    return "HIDDEN";
  }

  return getStockAwareStatus(storedStatus, productStock);
}

export default async function ClothingAdminPage() {
  const products = await prisma.product.findMany({
    where: {
      category: "CLOTHING",
      slug: {
        in: [...MANAGED_PRODUCT_SLUGS],
      },
    },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      variants: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const availableProducts = products.filter((product) => {
    const stock = getProductStock(product.variants);
    return (
      product.active &&
      getEffectiveStatus(product.status, product.active, stock) === "AVAILABLE"
    );
  }).length;

  const comingSoonProducts = products.filter((product) => {
    const stock = getProductStock(product.variants);
    return (
      product.active &&
      getEffectiveStatus(product.status, product.active, stock) ===
        "COMING_SOON"
    );
  }).length;

  const totalUnits = products.reduce(
    (total, product) => total + getProductStock(product.variants),
    0,
  );

  const statistics = [
    { label: "Productos totales", value: products.length },
    { label: "Disponibles", value: availableProducts },
    { label: "Próximamente", value: comingSoonProducts },
    { label: "Unidades en stock", value: totalUnits },
  ];

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Tienda</p>
          <h1 className={styles.pageTitle}>Ropa VANMOTION</h1>
          <p className={styles.pageDescription}>
            Gestiona las imágenes, precios, estados, stock por talla y
            visibilidad de la colección inaugural.
          </p>
        </div>

        <div className={styles.headerActions}>
          <form action={createCarpeDiemProductAction}>
            <SubmitButton
              idleText={
                products.length === MANAGED_PRODUCT_SLUGS.length
                  ? "Sincronizar colección"
                  : "Crear colección completa"
              }
              pendingText="Preparando colección..."
              className={styles.primaryButton}
            />
          </form>

          <Link href="/ropa" className={styles.publicStoreLink}>
            Ver tienda pública
          </Link>
        </div>
      </div>

      <div className={styles.statisticsGrid}>
        {statistics.map((item) => (
          <article key={item.label} className={styles.statisticCard}>
            <p className={styles.statisticLabel}>{item.label}</p>
            <p className={styles.statisticValue}>{item.value}</p>
          </article>
        ))}
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>+</div>
          <h2 className={styles.emptyTitle}>
            Todavía no hay productos registrados
          </h2>
          <p className={styles.emptyDescription}>
            Crea la colección completa VANMOTION con camisetas y bomber para
            hombre y mujer en negro y azul Ford E-150.
          </p>

          <form
            action={createCarpeDiemProductAction}
            className={styles.emptyForm}
          >
            <SubmitButton
              idleText="Crear colección VANMOTION"
              pendingText="Creando colección..."
              className={styles.primaryButton}
            />
          </form>
        </div>
      ) : (
        <div className={styles.productsList}>
          {products.map((product) => {
            const imagesByView = new Map(
              product.images.map((image) => [image.view, image]),
            );

            const variantsBySize = new Map(
              product.variants.map((variant) => [variant.size, variant]),
            );

            const productSizes = SIZE_ORDER.filter((size) =>
              variantsBySize.has(size),
            );

            const productStock = getProductStock(product.variants);
            const effectiveStatus = getEffectiveStatus(
              product.status,
              product.active,
              productStock,
            );
            const editableStatus = getStockAwareStatus(
              product.status,
              productStock,
            );
            const statusLabel =
              statusLabels[effectiveStatus] ?? effectiveStatus;
            const statusClass =
              statusClassNames[effectiveStatus] ?? styles.statusDefault;

            return (
              <article key={product.id} className={styles.productCard}>
                <div className={styles.productEditorHeader}>
                  <div>
                    <p className={styles.collectionLabel}>
                      {product.collection ?? "Colección VANMOTION"}
                    </p>
                    <h2 className={styles.productName}>{product.name}</h2>
                    {product.subtitle ? (
                      <p className={styles.productSubtitle}>
                        {product.subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.productEditorMeta}>
                    <span className={`${styles.statusBadge} ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                </div>

                <div className={styles.productEditorLayout}>
                  <section className={styles.editorGallery}>
                    <div className={styles.editorSectionHeading}>
                      <div>
                        <p className={styles.fieldLabel}>Imágenes del producto</p>
                        <h3>Galería de la tienda</h3>
                        <p>
                          Sube imágenes de alta calidad. Formato recomendado:
                          WebP o JPG.
                        </p>
                      </div>

                      <span>JPG · PNG · WEBP · AVIF</span>
                    </div>

                    <div className={styles.editorImagesGrid}>
                      {productImageSlots.map((slot) => {
                        const image = imagesByView.get(slot.view);
                        const displayUrl = image
                          ? resolveProductImageUrl(
                              product.slug,
                              image.view,
                              image.url,
                            )
                          : null;
                        const isCustomImage = Boolean(
                          image?.url.startsWith("http"),
                        );

                        return (
                          <article
                            key={slot.view}
                            className={styles.editorImageCard}
                          >
                            <p className={styles.editorImageLabel}>
                              {slot.number}. {slot.title}
                            </p>

                            <div className={styles.editorImagePreview}>
                              {displayUrl ? (
                                <img
                                  src={displayUrl}
                                  alt={image?.alt ?? slot.alt}
                                />
                              ) : (
                                <div className={styles.noImage}>Sin imagen</div>
                              )}
                            </div>

                            <p className={styles.editorImageDescription}>
                              {slot.description}
                            </p>

                            <DirectProductImageUpload
                              productId={product.id}
                              productName={product.name}
                              view={slot.view}
                              hasImage={Boolean(displayUrl)}
                            />

                            {isCustomImage ? (
                              <form
                                action={removeProductImageAction}
                                className={styles.productImageRestoreForm}
                              >
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={product.id}
                                />
                                <input
                                  type="hidden"
                                  name="view"
                                  value={slot.view}
                                />
                                <SubmitButton
                                  idleText="Eliminar imagen"
                                  pendingText="Eliminando..."
                                  className={styles.productImageRestoreButton}
                                />
                              </form>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>

                    <p className={styles.galleryOrderNote}>
                      La portada siempre será la fotografía del modelo. Después
                      se muestran frontal, espalda y detalle de la prenda.
                    </p>
                  </section>

                  <form
                    action={updateProductAction}
                    className={styles.editorProductForm}
                  >
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />

                    <div className={styles.editorProductTitle}>
                      <div>
                        <p className={styles.collectionLabel}>
                          {product.collection ?? "Colección VANMOTION"}
                        </p>
                        <h3>{product.name}</h3>
                        {product.subtitle ? <p>{product.subtitle}</p> : null}
                      </div>

                      <strong>{formatPrice(product.price)}</strong>
                    </div>

                    <div className={styles.mainFieldsGrid}>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Precio</span>
                        <div className={styles.priceInputWrap}>
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={Number(product.price).toFixed(2)}
                            required
                            className={styles.input}
                          />
                          <span className={styles.currency}>€</span>
                        </div>
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Estado</span>
                        <select
                          name="status"
                          defaultValue={editableStatus}
                          className={styles.select}
                        >
                          <option value="DRAFT">Borrador</option>
                          <option value="COMING_SOON">Próximamente</option>
                          <option value="AVAILABLE">Disponible</option>
                          <option value="SOLD_OUT">Agotado</option>
                          <option value="HIDDEN">Oculto</option>
                        </select>
                      </label>
                    </div>

                    <div className={styles.stockSection}>
                      <p className={styles.fieldLabel}>Stock por talla</p>

                      <div className={styles.sizesGrid}>
                        {productSizes.map((size) => {
                          const variant = variantsBySize.get(size);

                          return (
                            <label key={size} className={styles.sizeCard}>
                              <span className={styles.sizeHeader}>
                                <span className={styles.sizeName}>
                                  Talla {size}
                                </span>
                                <span className={styles.sku}>
                                  {variant?.sku ?? "Sin SKU"}
                                </span>
                              </span>

                              <input
                                name={`stock_${size}`}
                                type="number"
                                min="0"
                                step="1"
                                required
                                defaultValue={variant?.stock ?? 0}
                                className={styles.stockInput}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.visibilitySection}>
                      <p className={styles.fieldLabel}>
                        Opciones de visibilidad
                      </p>

                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                          <input
                            name="active"
                            type="checkbox"
                            defaultChecked={product.active}
                            className={styles.checkbox}
                          />
                          Visible en la tienda
                        </label>

                        <label className={styles.checkboxLabel}>
                          <input
                            name="featured"
                            type="checkbox"
                            defaultChecked={product.featured}
                            className={styles.checkbox}
                          />
                          Producto destacado
                        </label>
                      </div>
                    </div>

                    <div className={styles.editorFormFooter}>
                      <span>
                        {productStock}{" "}
                        {productStock === 1 ? "unidad" : "unidades"} en stock
                      </span>

                      <SubmitButton
                        idleText="Guardar cambios"
                        pendingText="Guardando..."
                        className={styles.primaryButton}
                      />
                    </div>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
