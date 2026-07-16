"use client";

import { useMemo, useState } from "react";

import styles from "./ropa.module.css";

type ProductPurchasePanelProps = {
  language: "es" | "en";
  productName: string;
  productSlug: string;
  sizes: readonly string[];
};

const translations = {
  es: {
    status: "Venta en preparación",
    priceLabel: "Precio",
    price: "Pendiente de confirmar",
    sizeLabel: "Selecciona tu talla",
    quantityLabel: "Cantidad",
    reserve: "Solicitar disponibilidad",
    note:
      "Todavía no se realiza ningún cobro. La reserva se confirmará personalmente antes de activar el pago seguro.",
    decrease: "Reducir cantidad",
    increase: "Aumentar cantidad",
  },

  en: {
    status: "Sale being prepared",
    priceLabel: "Price",
    price: "To be confirmed",
    sizeLabel: "Choose your size",
    quantityLabel: "Quantity",
    reserve: "Ask about availability",
    note:
      "No payment is taken yet. The reservation will be confirmed personally before secure payment is activated.",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
  },
} as const;

export default function ProductPurchasePanel({
  language,
  productName,
  productSlug,
  sizes,
}: ProductPurchasePanelProps) {
  const content = translations[language];
  const [selectedSize, setSelectedSize] = useState(
    sizes.includes("M") ? "M" : sizes[0] ?? "",
  );
  const [quantity, setQuantity] = useState(1);

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

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(10, current + 1));
  }

  return (
    <div className={styles.purchasePanel}>
      <div className={styles.purchaseStatus}>
        <span aria-hidden="true" />
        {content.status}
      </div>

      <div className={styles.priceRow}>
        <span>{content.priceLabel}</span>
        <strong>{content.price}</strong>
      </div>

      <fieldset className={styles.sizeSelector}>
        <legend>{content.sizeLabel}</legend>

        <div>
          {sizes.map((size) => (
            <label key={size}>
              <input
                type="radio"
                name="product-size"
                value={size}
                checked={selectedSize === size}
                onChange={() => setSelectedSize(size)}
              />

              <span>{size}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.quantityRow}>
        <span>{content.quantityLabel}</span>

        <div className={styles.quantityControl}>
          <button
            type="button"
            onClick={decreaseQuantity}
            aria-label={content.decrease}
          >
            −
          </button>

          <strong>{quantity}</strong>

          <button
            type="button"
            onClick={increaseQuantity}
            aria-label={content.increase}
          >
            +
          </button>
        </div>
      </div>

      <a href={contactHref} className={styles.purchaseButton}>
        {content.reserve}
        <span>→</span>
      </a>

      <p className={styles.purchaseNote}>{content.note}</p>
    </div>
  );
}
