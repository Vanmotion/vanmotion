"use client";

import { useMemo, useState } from "react";

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
    availableStock: "disponibles",
    pendingStock: "stock por confirmar",
    noStock: "sin stock",
    reserve: "Solicitar reserva",
    availability: "Solicitar disponibilidad",
    soldOut: "Producto agotado",
    unavailable: "No disponible actualmente",
    noteAvailable:
      "Todavía no se realiza ningún cobro. VANMOTION confirmará personalmente la reserva antes de activar el pago seguro.",
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
    pendingStock: "stock to be confirmed",
    noStock: "out of stock",
    reserve: "Request reservation",
    availability: "Ask about availability",
    soldOut: "Product sold out",
    unavailable: "Currently unavailable",
    noteAvailable:
      "No payment is taken yet. VANMOTION will personally confirm the reservation before secure payment is activated.",
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

type SupportedStatus = (typeof supportedStatuses)[number];

function normalizeStatus(status: string): SupportedStatus {
  return supportedStatuses.includes(status as SupportedStatus)
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
  const normalizedStatus = normalizeStatus(status);

  const activeVariants = useMemo(
    () => variants.filter((variant) => variant.active),
    [variants],
  );

  const defaultVariant =
    activeVariants.find(
      (variant) =>
        variant.size === "M" &&
        (normalizedStatus !== "AVAILABLE" || variant.stock > 0),
    ) ??
    activeVariants.find(
      (variant) =>
        normalizedStatus !== "AVAILABLE" || variant.stock > 0,
    ) ??
    activeVariants.find((variant) => variant.size === "M") ??
    activeVariants[0];

  const [selectedSize, setSelectedSize] = useState(
    defaultVariant?.size ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = activeVariants.find(
    (variant) => variant.size === selectedSize,
  );

  const selectedStock = selectedVariant?.stock ?? 0;
  const isComingSoon = normalizedStatus === "COMING_SOON";
  const isAvailable = normalizedStatus === "AVAILABLE";
  const hasAvailableStock = isAvailable && selectedStock > 0;
  const canRequest = isComingSoon
    ? Boolean(selectedVariant)
    : hasAvailableStock;

  const maximumQuantity = isAvailable
    ? Math.max(1, selectedStock)
    : 10;

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat(language === "es" ? "es-ES" : "en-GB", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price),
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
  }, [productName, productSlug, quantity, selectedSize]);

  const statusClass =
    normalizedStatus === "AVAILABLE"
      ? styles.statusAvailable
      : normalizedStatus === "SOLD_OUT"
        ? styles.statusSoldOut
        : normalizedStatus === "HIDDEN" || normalizedStatus === "DRAFT"
          ? styles.statusUnavailable
          : styles.statusComingSoon;

  const buttonText = isAvailable
    ? hasAvailableStock
      ? content.reserve
      : content.soldOut
    : isComingSoon
      ? content.availability
      : normalizedStatus === "SOLD_OUT"
        ? content.soldOut
        : content.unavailable;

  const note = isAvailable
    ? hasAvailableStock
      ? content.noteAvailable
      : content.noteSoldOut
    : isComingSoon
      ? content.noteComingSoon
      : normalizedStatus === "SOLD_OUT"
        ? content.noteSoldOut
        : content.noteUnavailable;

  function selectSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(maximumQuantity, current + 1));
  }

  return (
    <div className={styles.purchasePanel}>
      <div className={`${styles.purchaseStatus} ${statusClass}`}>
        <span aria-hidden="true" />
        {content.statuses[normalizedStatus]}
      </div>

      <div className={styles.priceRow}>
        <span>{content.priceLabel}</span>
        <strong>{formattedPrice}</strong>
      </div>

      <fieldset className={styles.sizeSelector}>
        <legend>{content.sizeLabel}</legend>

        <div>
          {activeVariants.map((variant) => {
            const disabled =
              normalizedStatus === "AVAILABLE"
                ? variant.stock <= 0
                : normalizedStatus === "SOLD_OUT" ||
                  normalizedStatus === "HIDDEN" ||
                  normalizedStatus === "DRAFT";

            const stockText = isComingSoon
              ? content.pendingStock
              : variant.stock > 0
                ? `${variant.stock} ${content.availableStock}`
                : content.noStock;

            return (
              <label
                key={variant.size}
                className={disabled ? styles.sizeDisabled : undefined}
              >
                <input
                  type="radio"
                  name="product-size"
                  value={variant.size}
                  checked={selectedSize === variant.size}
                  disabled={disabled}
                  onChange={() => selectSize(variant.size)}
                />

                <span>
                  <strong>{variant.size}</strong>
                  <small>{stockText}</small>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.quantityRow}>
        <span>{content.quantityLabel}</span>

        <div className={styles.quantityControl}>
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={!canRequest || quantity <= 1}
            aria-label={content.decrease}
          >
            −
          </button>

          <strong>{quantity}</strong>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={!canRequest || quantity >= maximumQuantity}
            aria-label={content.increase}
          >
            +
          </button>
        </div>
      </div>

      {canRequest ? (
        <a href={contactHref} className={styles.purchaseButton}>
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

      <p className={styles.purchaseNote}>{note}</p>
    </div>
  );
}
