import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import {
  createCarpeDiemProductAction,
  updateProductAction,
} from "./actions";
import styles from "./ropa.module.css";
import SubmitButton from "./SubmitButton";

export const dynamic = "force-dynamic";

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

const productSizes = ["S", "M", "L", "XL"] as const;

function formatPrice(price: unknown): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
}

export default async function ClothingAdminPage() {
  const products = await prisma.product.findMany({
    include: {
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
      variants: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const totalProducts = products.length;
  const availableProducts = products.filter(
    (product) => product.status === "AVAILABLE" && product.active,
  ).length;
  const comingSoonProducts = products.filter(
    (product) => product.status === "COMING_SOON" && product.active,
  ).length;
  const totalUnits = products.reduce(
    (total, product) =>
      total +
      product.variants.reduce(
        (productTotal, variant) => productTotal + variant.stock,
        0,
      ),
    0,
  );

  const statistics = [
    {
      label: "Productos totales",
      value: totalProducts,
    },
    {
      label: "Disponibles",
      value: availableProducts,
    },
    {
      label: "Próximamente",
      value: comingSoonProducts,
    },
    {
      label: "Unidades en stock",
      value: totalUnits,
    },
  ];

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Tienda</p>

          <h1 className={styles.pageTitle}>Ropa VANMOTION</h1>

          <p className={styles.pageDescription}>
            Gestiona el precio, el estado y el stock por talla de los productos
            de ropa de VANMOTION.
          </p>
        </div>

        <Link href="/ropa" className={styles.publicStoreLink}>
          Ver tienda pública
        </Link>
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
            Crea automáticamente la primera camiseta CARPE DIEM Black Edition,
            con precio de lanzamiento de 34,90 € y tallas S, M, L y XL.
          </p>

          <form action={createCarpeDiemProductAction} className={styles.emptyForm}>
            <SubmitButton
              idleText="Crear CARPE DIEM · Drop 01"
              pendingText="Creando producto..."
              className={styles.primaryButton}
            />
          </form>
        </div>
      ) : (
        <div className={styles.productsList}>
          {products.map((product) => {
            const primaryImage = product.images[0];
            const variantsBySize = new Map(
              product.variants.map((variant) => [variant.size, variant]),
            );
            const productStock = product.variants.reduce(
              (total, variant) => total + variant.stock,
              0,
            );
            const statusLabel =
              statusLabels[product.status] ?? product.status;
            const statusClass =
              statusClassNames[product.status] ?? styles.statusDefault;

            return (
              <article key={product.id} className={styles.productCard}>
                <div className={styles.productLayout}>
                  <aside className={styles.productMedia}>
                    <div className={styles.imageFrame}>
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={primaryImage.alt ?? product.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.noImage}>Sin imagen</div>
                      )}
                    </div>

                    <div className={styles.mediaFooter}>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        {statusLabel}
                      </span>

                      <span className={styles.stockSummary}>
                        {productStock} unidades
                      </span>
                    </div>
                  </aside>

                  <form
                    action={updateProductAction}
                    className={styles.productForm}
                  >
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />

                    <div className={styles.productHeading}>
                      <div>
                        <p className={styles.collectionLabel}>
                          {product.collection ?? "Colección VANMOTION"}
                        </p>

                        <h2 className={styles.productName}>{product.name}</h2>

                        {product.subtitle && (
                          <p className={styles.productSubtitle}>
                            {product.subtitle}
                          </p>
                        )}
                      </div>

                      <p className={styles.currentPrice}>
                        {formatPrice(product.price)}
                      </p>
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
                          defaultValue={product.status}
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
                                defaultValue={variant?.stock ?? 0}
                                className={styles.stockInput}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.formFooter}>
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
