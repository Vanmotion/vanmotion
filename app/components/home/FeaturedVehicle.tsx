import Image from "next/image";
import Link from "next/link";

import { getCurrentLanguage } from "../../lib/language";
import { prisma } from "../../lib/prisma";
import styles from "../../home.module.css";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    collection: "Colección VANMOTION",
    inventory: "Inventario",
    comingSoon: "Próximamente",
    preparing: "Estamos preparando nuevos vehículos",
    featured: "Vehículo destacado",
    available: "Vehículo disponible",
    emblem: "Vehículo emblema",
    notForSale: "No disponible para la venta",
  },

  en: {
    collection: "VANMOTION Collection",
    inventory: "Inventory",
    comingSoon: "Coming soon",
    preparing: "We are preparing new vehicles",
    featured: "Featured vehicle",
    available: "Available vehicle",
    emblem: "Emblem vehicle",
    notForSale: "Not available for sale",
  },
} as const;

export default async function FeaturedVehicle() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  const locale = language === "es" ? "es-ES" : "en-GB";

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      status: {
        in: ["AVAILABLE", "EMBLEM"],
      },
    },

    orderBy: [
      {
        featured: "desc",
      },
      {
        createdAt: "desc",
      },
    ],

    include: {
      brand: true,

      images: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],

        take: 1,
      },
    },
  });

  if (!vehicle) {
    return (
      <Link
        href="/coleccion"
        className={styles.vehicleCard}
        aria-label={content.preparing}
      >
        <div className={styles.vehicleCardTop}>
          <span>{content.collection}</span>

          <span>{content.inventory}</span>
        </div>

        <div className={styles.vehicleWord}>
          <span>VAN</span>

          <strong>MOTION</strong>
        </div>

        <div className={styles.vehicleCardBottom}>
          <div>
            <h3>{content.comingSoon}</h3>

            <p>{content.preparing}</p>
          </div>

          <span
            className={styles.roundArrow}
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </Link>
    );
  }

  const vehicleName = `${vehicle.brand.name} ${vehicle.model}`;
  const isEmblem = vehicle.status === "EMBLEM";

  const mileage = new Intl.NumberFormat(locale).format(
    vehicle.mileage,
  );

  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(vehicle.price));

  const imageUrl = vehicle.images[0]?.url;

  const vehicleStatus = isEmblem
    ? content.emblem
    : vehicle.featured
      ? content.featured
      : content.available;

  const commercialText = isEmblem
    ? content.notForSale
    : price;

  return (
    <Link
      href={`/coleccion/${vehicle.id}`}
      className={styles.vehicleCard}
      aria-label={`${vehicleStatus}: ${vehicleName}`}
    >
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 58vw"
            quality={75}
            className={styles.vehicleCardImage}
          />

          <span
            className={styles.vehicleCardOverlay}
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className={styles.vehicleCardTop}>
        <span>{vehicleStatus}</span>

        <span>{vehicle.year}</span>
      </div>

      <div className={styles.vehicleWord}>
        <span>{vehicle.brand.name.toUpperCase()}</span>

        <strong>{vehicle.model.toUpperCase()}</strong>
      </div>

      <div className={styles.vehicleCardBottom}>
        <div>
          <h3>{vehicleName}</h3>

          <p>
            {vehicle.year} · {mileage} km · {commercialText}
          </p>
        </div>

        <span
          className={styles.roundArrow}
          aria-hidden="true"
        >
          →
        </span>
      </div>
    </Link>
  );
}