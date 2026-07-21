"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./ropa.module.css";

type ProductVariant = {
  size: string;
  stock: number;
  active: boolean;
};

type ProductPurchasePanelProps = {
  language: "es" | "en";
  productName: string;
  productSlug: string;
  price: number;
  currency: string;
  status: string;
  variants: readonly ProductVariant[];
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

const MAX_CHECKOUT_QUANTITY = 5;

const translations = {
  es: {
    statuses: {
      DRAFT: "Producto en preparación",
      COMING_SOON: "Próximamente",
      AVAILABLE: "Disponible",
      SOLD_OUT: "Agotado",
      HIDDEN: "No disponible",
    },

    priceLabel: "Precio",
    sizeLabel: "Selecciona tu talla",
    quantityLabel: "Cantidad",
    availableStock: "disponible",
    availableStockPlural: "disponibles",
    noStock: "sin stock",

    checkout: "Comprar ahora",
    redirecting: "Abriendo pago seguro...",
    reserve: "Solicitar reserva",
    availability: "Solicitar disponibilidad",
    soldOut: "Producto agotado",
    unavailable: "No disponible actualmente",

    checkoutError:
      "No se ha podido abrir el pago. Inténtalo de nuevo.",

    noteAvailable:
      "El pago se realizará de forma segura mediante Stripe. Podrás revisar el pedido antes de confirmarlo.",

    noteComingSoon:
      "La venta está en preparación. Puedes indicar tu talla y cantidad para consultar las primeras unidades.",

    noteSoldOut:
      "No quedan unidades disponibles en este momento.",

    noteUnavailable:
      "Este producto todavía no está disponible para solicitudes.",

    decrease: "Reducir cantidad",
    increase: "Aumentar cantidad",
  },

  en: {
    statuses: {
      DRAFT: "Product in preparation",
      COMING_SOON: "Coming soon",
      AVAILABLE: "Available",
      SOLD_OUT: "Sold out",
      HIDDEN: "Unavailable",
    },

    priceLabel: "Price",
    sizeLabel: "Choose your size",
    quantityLabel: "Quantity",
    availableStock: "available",
    availableStockPlural: "available",
    noStock: "out of stock",

    checkout: "Buy now",
    redirecting: "Opening secure checkout...",
    reserve: "Request reservation",
    availability: "Ask about availability",
    soldOut: "Product sold out",
    unavailable: "Currently unavailable",

    checkoutError:
      "Checkout could not be opened. Please try again.",

    noteAvailable:
      "Payment will be processed securely through Stripe. You can review your order before confirming it.",

    noteComingSoon:
      "The sale is being prepared. Choose your size and quantity to ask about the first units.",

    noteSoldOut:
      "There are no units available at this time.",

    noteUnavailable:
      "This product is not currently available for requests.",

    decrease: "Decrease quantity",
    increase: "Increase quantity",
  },
} as const;

const supportedStatuses = [
  "DRAFT",
  "COMING_SOON",
  "AVAILABLE",
  "SOLD_OUT",
  "HIDDEN",
] as const;

type SupportedStatus =
  (typeof supportedStatuses)[number];

function normalizeStatus(
  status: string,
): SupportedStatus {
  return supportedStatuses.includes(
    status as SupportedStatus,
  )
    ? (status as SupportedStatus)
    : "COMING_SOON";
}

export default function ProductPurchasePanel({
  language,
  productName,
  productSlug,
  price,
  currency,
  status,
  variants,
}: ProductPurchasePanelProps) {
  const content = translations[language];

  const normalizedStatus =
    normalizeStatus(status);

  const activeVariants = useMemo(
    () =>
      variants.filter(
        (variant) => variant.active,
      ),
    [variants],
  );

  const firstAvailableVariant = useMemo(
    () =>
      activeVariants.find(
        (variant) =>
          variant.size.toUpperCase() === "S" &&
          variant.stock > 0,
      ) ??
      activeVariants.find(
        (variant) => variant.stock > 0,
      ),
    [activeVariants],
  );

  const [selectedSize, setSelectedSize] =
    useState(
      firstAvailableVariant?.size ?? "",
    );

  const [quantity, setQuantity] =
    useState(1);

  const [
    checkoutPending,
    setCheckoutPending,
  ] = useState(false);

  const [
    checkoutError,
    setCheckoutError,
  ] = useState("");

  useEffect(() => {
    const currentVariant =
      activeVariants.find(
        (variant) =>
          variant.size === selectedSize,
      );

    if (
      currentVariant &&
      currentVariant.stock > 0
    ) {
      return;
    }

    setSelectedSize(
      firstAvailableVariant?.size ?? "",
    );

    setQuantity(1);
  }, [
    activeVariants,
    firstAvailableVariant,
    selectedSize,
  ]);

  useEffect(() => {
    setCheckoutError("");
  }, [selectedSize, quantity]);

  const selectedVariant =
    activeVariants.find(
      (variant) =>
        variant.size === selectedSize,
    );

  const selectedStock =
    selectedVariant?.stock ?? 0;

  const isComingSoon =
    normalizedStatus === "COMING_SOON";

  const isAvailable =
    normalizedStatus === "AVAILABLE";

  const statusAllowsRequests =
    isComingSoon || isAvailable;

  const hasAvailableStock =
    selectedStock > 0;

  const canRequest =
    statusAllowsRequests &&
    Boolean(selectedVariant) &&
    hasAvailableStock;

  const maximumQuantity =
    hasAvailableStock
      ? Math.min(
          selectedStock,
          MAX_CHECKOUT_QUANTITY,
        )
      : 1;

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat(
        language === "es"
          ? "es-ES"
          : "en-GB",
        {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ).format(price),
    [currency, language, price],
  );

  const contactHref = useMemo(() => {
    const params = new URLSearchParams({
      motivo: "ropa",
      producto: productSlug,
      nombreProducto: productName,
      talla: selectedSize,
      cantidad: String(quantity),
    });

    return `/contacto?${params.toString()}#formulario`;
  }, [
    productName,
    productSlug,
    quantity,
    selectedSize,
  ]);

  const statusClass =
    normalizedStatus === "AVAILABLE"
      ? styles.statusAvailable
      : normalizedStatus === "SOLD_OUT"
        ? styles.statusSoldOut
        : normalizedStatus === "HIDDEN" ||
            normalizedStatus === "DRAFT"
          ? styles.statusUnavailable
          : styles.statusComingSoon;

  const buttonText = isAvailable
    ? hasAvailableStock
      ? checkoutPending
        ? content.redirecting
        : content.checkout
      : content.soldOut
    : isComingSoon
      ? hasAvailableStock
        ? content.availability
        : content.soldOut
      : normalizedStatus === "SOLD_OUT"
        ? content.soldOut
        : content.unavailable;

  const note = isAvailable
    ? hasAvailableStock
      ? content.noteAvailable
      : content.noteSoldOut
    : isComingSoon
      ? hasAvailableStock
        ? content.noteComingSoon
        : content.noteSoldOut
      : normalizedStatus === "SOLD_OUT"
        ? content.noteSoldOut
        : content.noteUnavailable;

  function selectSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        maximumQuantity,
        current + 1,
      ),
    );
  }

  async function startCheckout() {
    if (
      !isAvailable ||
      !canRequest ||
      checkoutPending
    ) {
      return;
    }

    setCheckoutPending(true);
    setCheckoutError("");

    try {
      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productSlug,
            size: selectedSize,
            quantity,
          }),
        },
      );

      let data: CheckoutResponse = {};

      try {
        data =
          (await response.json()) as CheckoutResponse;
      } catch {
        data = {};
      }

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ??
            content.checkoutError,
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : content.checkoutError,
      );

      setCheckoutPending(false);
    }
  }

  return (
    <div className={styles.purchasePanel}>
      <div
        className={`${styles.purchaseStatus} ${statusClass}`}
      >
        <span aria-hidden="true" />

        {
          content.statuses[
            normalizedStatus
          ]
        }
      </div>

      <div className={styles.priceRow}>
        <span>{content.priceLabel}</span>

        <strong>{formattedPrice}</strong>
      </div>

      <fieldset
        className={styles.sizeSelector}
      >
        <legend>{content.sizeLabel}</legend>

        <div>
          {activeVariants.map(
            (variant) => {
              const statusDisabled =
                normalizedStatus ===
                  "SOLD_OUT" ||
                normalizedStatus ===
                  "HIDDEN" ||
                normalizedStatus ===
                  "DRAFT";

              const disabled =
                statusDisabled ||
                variant.stock <= 0;

              const stockText =
                variant.stock === 1
                  ? `1 ${content.availableStock}`
                  : variant.stock > 1
                    ? `${variant.stock} ${content.availableStockPlural}`
                    : content.noStock;

              return (
                <label
                  key={variant.size}
                  className={
                    disabled
                      ? styles.sizeDisabled
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name="product-size"
                    value={variant.size}
                    checked={
                      selectedSize ===
                      variant.size
                    }
                    disabled={disabled}
                    onChange={() =>
                      selectSize(
                        variant.size,
                      )
                    }
                  />

                  <span>
                    <strong>
                      {variant.size}
                    </strong>

                    <small>
                      {stockText}
                    </small>
                  </span>
                </label>
              );
            },
          )}
        </div>
      </fieldset>

      <div
        className={styles.quantityRow}
      >
        <span>
          {content.quantityLabel}
        </span>

        <div
          className={
            styles.quantityControl
          }
        >
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={
              !canRequest ||
              checkoutPending ||
              quantity <= 1
            }
            aria-label={
              content.decrease
            }
          >
            −
          </button>

          <strong>{quantity}</strong>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              !canRequest ||
              checkoutPending ||
              quantity >= maximumQuantity
            }
            aria-label={
              content.increase
            }
          >
            +
          </button>
        </div>
      </div>

      {isAvailable && canRequest ? (
        <button
          type="button"
          onClick={startCheckout}
          disabled={checkoutPending}
          className={styles.purchaseButton}
          aria-busy={checkoutPending}
        >
          {buttonText}

          <span>
            {checkoutPending
              ? "…"
              : "→"}
          </span>
        </button>
      ) : isComingSoon && canRequest ? (
        <a
          href={contactHref}
          className={
            styles.purchaseButton
          }
        >
          {buttonText}

          <span>→</span>
        </a>
      ) : (
        <span
          className={`${styles.purchaseButton} ${styles.purchaseButtonDisabled}`}
          aria-disabled="true"
        >
          {buttonText}

          <span>—</span>
        </span>
      )}

      {checkoutError ? (
        <p
          className={styles.purchaseNote}
          role="alert"
        >
          {checkoutError}
        </p>
      ) : null}

      <p
        className={styles.purchaseNote}
      >
        {note}
      </p>
    </div>
  );
}