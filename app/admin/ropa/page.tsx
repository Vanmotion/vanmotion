import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import {
  createCarpeDiemProductAction,
  removeProductImageAction,
  saveProductImageAction,
  updateProductAction,
} from "./actions";

import styles from "./ropa.module.css";
import SubmitButton from "./SubmitButton";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG =
  "carpe-diem-black-edition-drop-01";

const statusLabels: Record<
  string,
  string
> = {
  DRAFT: "Borrador",
  COMING_SOON: "Próximamente",
  AVAILABLE: "Disponible",
  SOLD_OUT: "Agotado",
  HIDDEN: "Oculto",
};

const statusClassNames: Record<
  string,
  string
> = {
  DRAFT: styles.statusDraft,
  COMING_SOON:
    styles.statusComingSoon,
  AVAILABLE:
    styles.statusAvailable,
  SOLD_OUT:
    styles.statusSoldOut,
  HIDDEN:
    styles.statusHidden,
};

const productSizes = [
  "S",
  "M",
  "L",
  "XL",
] as const;

const productImageSlots = [
  {
    view: "FRONT",
    title: "Vista frontal",
    description:
      "Imagen limpia de la parte delantera.",
    fallbackUrl:
      "/ropa/carpe-diem-frontal.webp",
    alt:
      "Vista frontal de la camiseta CARPE DIEM Black Edition",
  },
  {
    view: "BACK",
    title: "Vista trasera",
    description:
      "Imagen principal con el diseño CARPE DIEM.",
    fallbackUrl:
      "/ropa/carpe-diem-trasera.webp",
    alt:
      "Vista trasera de la camiseta CARPE DIEM Black Edition",
  },
  {
    view: "DETAIL",
    title: "Detalle del diseño",
    description:
      "Acercamiento del estampado y del acabado.",
    fallbackUrl:
      "/ropa/carpe-diem-diseno.webp",
    alt:
      "Detalle del diseño CARPE DIEM",
  },
] as const;

function formatPrice(
  price: unknown,
): string {
  return new Intl.NumberFormat(
    "es-ES",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(Number(price));
}

function getProductStock(
  variants: Array<{
    stock: number;
    active: boolean;
  }>,
): number {
  return variants.reduce(
    (total, variant) =>
      variant.active
        ? total + variant.stock
        : total,
    0,
  );
}

function getStockAwareStatus(
  storedStatus: string,
  productStock: number,
): string {
  /*
   * Estos estados son manuales y deben
   * conservarse independientemente del stock.
   */
  if (
    storedStatus === "DRAFT" ||
    storedStatus === "COMING_SOON" ||
    storedStatus === "HIDDEN"
  ) {
    return storedStatus;
  }

  /*
   * Disponible y Agotado dependen siempre
   * del número real de unidades activas.
   */
  return productStock > 0
    ? "AVAILABLE"
    : "SOLD_OUT";
}

function getEffectiveStatus(
  storedStatus: string,
  active: boolean,
  productStock: number,
): string {
  if (!active) {
    return "HIDDEN";
  }

  return getStockAwareStatus(
    storedStatus,
    productStock,
  );
}

export default async function ClothingAdminPage() {
  /*
   * Este panel administra exclusivamente el primer
   * producto de ropa, igual que sus Server Actions.
   */
  const product =
    await prisma.product.findUnique({
      where: {
        slug: PRODUCT_SLUG,
      },

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
    });

  const products = product
    ? [product]
    : [];

  const totalProducts =
    products.length;

  const availableProducts =
    products.filter((product) => {
      const productStock =
        getProductStock(
          product.variants,
        );

      const effectiveStatus =
        getEffectiveStatus(
          product.status,
          product.active,
          productStock,
        );

      return (
        product.active &&
        effectiveStatus ===
          "AVAILABLE"
      );
    }).length;

  const comingSoonProducts =
    products.filter((product) => {
      const productStock =
        getProductStock(
          product.variants,
        );

      const effectiveStatus =
        getEffectiveStatus(
          product.status,
          product.active,
          productStock,
        );

      return (
        product.active &&
        effectiveStatus ===
          "COMING_SOON"
      );
    }).length;

  const totalUnits =
    products.reduce(
      (total, product) =>
        total +
        getProductStock(
          product.variants,
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
      <div
        className={
          styles.pageHeader
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Tienda
          </p>

          <h1
            className={
              styles.pageTitle
            }
          >
            Ropa VANMOTION
          </h1>

          <p
            className={
              styles.pageDescription
            }
          >
            Gestiona el precio, el
            estado, el stock por talla
            y las imágenes de CARPE DIEM · Drop 01.
          </p>
        </div>

        <Link
          href="/ropa"
          className={
            styles.publicStoreLink
          }
        >
          Ver tienda pública
        </Link>
      </div>

      <div
        className={
          styles.statisticsGrid
        }
      >
        {statistics.map((item) => (
          <article
            key={item.label}
            className={
              styles.statisticCard
            }
          >
            <p
              className={
                styles.statisticLabel
              }
            >
              {item.label}
            </p>

            <p
              className={
                styles.statisticValue
              }
            >
              {item.value}
            </p>
          </article>
        ))}
      </div>

      {products.length === 0 ? (
        <div
          className={
            styles.emptyState
          }
        >
          <div
            className={
              styles.emptyIcon
            }
          >
            +
          </div>

          <h2
            className={
              styles.emptyTitle
            }
          >
            Todavía no hay productos
            registrados
          </h2>

          <p
            className={
              styles.emptyDescription
            }
          >
            Crea automáticamente la
            primera camiseta CARPE DIEM
            Black Edition, con precio de
            lanzamiento de 34,90 € y
            tallas S, M, L y XL.
          </p>

          <form
            action={
              createCarpeDiemProductAction
            }
            className={
              styles.emptyForm
            }
          >
            <SubmitButton
              idleText="Crear CARPE DIEM · Drop 01"
              pendingText="Creando producto..."
              className={
                styles.primaryButton
              }
            />
          </form>
        </div>
      ) : (
        <div
          className={
            styles.productsList
          }
        >
          {products.map((product) => {
            const imagesByView =
              new Map(
                product.images.map(
                  (image) => [
                    image.view,
                    image,
                  ],
                ),
              );

            const primaryImage =
              imagesByView.get("FRONT");

            const primaryImageUrl =
              primaryImage?.url ??
              "/ropa/carpe-diem-frontal.webp";

            const variantsBySize =
              new Map(
                product.variants.map(
                  (variant) => [
                    variant.size,
                    variant,
                  ],
                ),
              );

            const productStock =
              getProductStock(
                product.variants,
              );

            const effectiveStatus =
              getEffectiveStatus(
                product.status,
                product.active,
                productStock,
              );

            const editableStatus =
              getStockAwareStatus(
                product.status,
                productStock,
              );

            const statusLabel =
              statusLabels[
                effectiveStatus
              ] ?? effectiveStatus;

            const statusClass =
              statusClassNames[
                effectiveStatus
              ] ??
              styles.statusDefault;

            return (
              <article
                key={product.id}
                className={
                  styles.productCard
                }
              >
                <div
                  className={
                    styles.productLayout
                  }
                >
                  <aside
                    className={
                      styles.productMedia
                    }
                  >
                    <div
                      className={
                        styles.imageFrame
                      }
                    >
                      <img
                        src={primaryImageUrl}
                        alt={
                          primaryImage?.alt ??
                          product.name
                        }
                        className={
                          styles.productImage
                        }
                      />
                    </div>

                    <div
                      className={
                        styles.mediaFooter
                      }
                    >
                      <span
                        className={`${styles.statusBadge} ${statusClass}`}
                      >
                        {statusLabel}
                      </span>

                      <span
                        className={
                          styles.stockSummary
                        }
                      >
                        {productStock}{" "}
                        unidades
                      </span>
                    </div>
                  </aside>

                  <form
                    action={
                      updateProductAction
                    }
                    className={
                      styles.productForm
                    }
                  >
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />

                    <div
                      className={
                        styles.productHeading
                      }
                    >
                      <div>
                        <p
                          className={
                            styles.collectionLabel
                          }
                        >
                          {product.collection ??
                            "Colección VANMOTION"}
                        </p>

                        <h2
                          className={
                            styles.productName
                          }
                        >
                          {product.name}
                        </h2>

                        {product.subtitle && (
                          <p
                            className={
                              styles.productSubtitle
                            }
                          >
                            {
                              product.subtitle
                            }
                          </p>
                        )}
                      </div>

                      <p
                        className={
                          styles.currentPrice
                        }
                      >
                        {formatPrice(
                          product.price,
                        )}
                      </p>
                    </div>

                    <div
                      className={
                        styles.mainFieldsGrid
                      }
                    >
                      <label
                        className={
                          styles.field
                        }
                      >
                        <span
                          className={
                            styles.fieldLabel
                          }
                        >
                          Precio
                        </span>

                        <div
                          className={
                            styles.priceInputWrap
                          }
                        >
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={Number(
                              product.price,
                            ).toFixed(2)}
                            required
                            className={
                              styles.input
                            }
                          />

                          <span
                            className={
                              styles.currency
                            }
                          >
                            €
                          </span>
                        </div>
                      </label>

                      <label
                        className={
                          styles.field
                        }
                      >
                        <span
                          className={
                            styles.fieldLabel
                          }
                        >
                          Estado
                        </span>

                        <select
                          name="status"
                          defaultValue={
                            editableStatus
                          }
                          className={
                            styles.select
                          }
                        >
                          <option value="DRAFT">
                            Borrador
                          </option>

                          <option value="COMING_SOON">
                            Próximamente
                          </option>

                          <option value="AVAILABLE">
                            Disponible
                          </option>

                          <option value="SOLD_OUT">
                            Agotado
                          </option>

                          <option value="HIDDEN">
                            Oculto
                          </option>
                        </select>
                      </label>
                    </div>

                    <div
                      className={
                        styles.stockSection
                      }
                    >
                      <p
                        className={
                          styles.fieldLabel
                        }
                      >
                        Stock por talla
                      </p>

                      <div
                        className={
                          styles.sizesGrid
                        }
                      >
                        {productSizes.map(
                          (size) => {
                            const variant =
                              variantsBySize.get(
                                size,
                              );

                            return (
                              <label
                                key={size}
                                className={
                                  styles.sizeCard
                                }
                              >
                                <span
                                  className={
                                    styles.sizeHeader
                                  }
                                >
                                  <span
                                    className={
                                      styles.sizeName
                                    }
                                  >
                                    Talla{" "}
                                    {size}
                                  </span>

                                  <span
                                    className={
                                      styles.sku
                                    }
                                  >
                                    {variant?.sku ??
                                      "Sin SKU"}
                                  </span>
                                </span>

                                <input
                                  name={`stock_${size}`}
                                  type="number"
                                  min="0"
                                  step="1"
                                  required
                                  defaultValue={
                                    variant?.stock ??
                                    0
                                  }
                                  className={
                                    styles.stockInput
                                  }
                                />
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <div
                      className={
                        styles.formFooter
                      }
                    >
                      <div
                        className={
                          styles.checkboxGroup
                        }
                      >
                        <label
                          className={
                            styles.checkboxLabel
                          }
                        >
                          <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                              product.active
                            }
                            className={
                              styles.checkbox
                            }
                          />

                          Visible en la tienda
                        </label>

                        <label
                          className={
                            styles.checkboxLabel
                          }
                        >
                          <input
                            name="featured"
                            type="checkbox"
                            defaultChecked={
                              product.featured
                            }
                            className={
                              styles.checkbox
                            }
                          />

                          Producto destacado
                        </label>
                      </div>

                      <SubmitButton
                        idleText="Guardar cambios"
                        pendingText="Guardando..."
                        className={
                          styles.primaryButton
                        }
                      />
                    </div>
                  </form>
                </div>

                <section
                  className={
                    styles.imageManager
                  }
                >
                  <div
                    className={
                      styles.imageManagerHeading
                    }
                  >
                    <div>
                      <p
                        className={
                          styles.fieldLabel
                        }
                      >
                        Imágenes del producto
                      </p>

                      <h3>
                        Galería de la tienda
                      </h3>

                      <p>
                        Sube cada vista por separado.
                        Las imágenes se guardan de forma
                        permanente y se actualizan
                        directamente en la tienda pública.
                      </p>
                    </div>

                    <span>
                      JPG · PNG · WEBP · AVIF
                    </span>
                  </div>

                  <div
                    className={
                      styles.productImagesGrid
                    }
                  >
                    {productImageSlots.map(
                      (slot) => {
                        const image =
                          imagesByView.get(
                            slot.view,
                          );

                        const displayUrl =
                          image?.url ??
                          slot.fallbackUrl;

                        const isCustomImage =
                          Boolean(
                            image?.url.startsWith(
                              "http",
                            ),
                          );

                        return (
                          <article
                            key={slot.view}
                            className={
                              styles.productImageCard
                            }
                          >
                            <div
                              className={
                                styles.productImagePreview
                              }
                            >
                              <img
                                src={displayUrl}
                                alt={
                                  image?.alt ??
                                  slot.alt
                                }
                              />

                              <span>
                                {isCustomImage
                                  ? "Personalizada"
                                  : "Predeterminada"}
                              </span>
                            </div>

                            <div
                              className={
                                styles.productImageInformation
                              }
                            >
                              <h4>
                                {slot.title}
                              </h4>

                              <p>
                                {
                                  slot.description
                                }
                              </p>
                            </div>

                            <form
                              action={
                                saveProductImageAction
                              }
                              className={
                                styles.productImageUploadForm
                              }
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

                              <input
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                required
                                className={
                                  styles.productImageFile
                                }
                              />

                              <SubmitButton
                                idleText={
                                  isCustomImage
                                    ? "Sustituir imagen"
                                    : "Subir imagen"
                                }
                                pendingText="Subiendo..."
                                className={
                                  styles.productImageUploadButton
                                }
                              />
                            </form>

                            {isCustomImage && (
                              <form
                                action={
                                  removeProductImageAction
                                }
                                className={
                                  styles.productImageRestoreForm
                                }
                              >
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={
                                    product.id
                                  }
                                />

                                <input
                                  type="hidden"
                                  name="view"
                                  value={
                                    slot.view
                                  }
                                />

                                <SubmitButton
                                  idleText="Restaurar predeterminada"
                                  pendingText="Restaurando..."
                                  className={
                                    styles.productImageRestoreButton
                                  }
                                />
                              </form>
                            )}
                          </article>
                        );
                      },
                    )}
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
