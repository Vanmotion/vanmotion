import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import styles from "./coleccion.module.css";

export const dynamic = "force-dynamic";

const fuelLabels: Record<Language, Record<string, string>> = {
  es: {
    Diesel: "Diésel",
    Diésel: "Diésel",
    Gasoline: "Gasolina",
    Petrol: "Gasolina",
    Gasolina: "Gasolina",
    Hybrid: "Híbrido",
    Híbrido: "Híbrido",
    Electric: "Eléctrico",
    Eléctrico: "Eléctrico",
    LPG: "GLP",
    GLP: "GLP",
  },
  en: {
    Diesel: "Diesel",
    Diésel: "Diesel",
    Gasoline: "Petrol",
    Petrol: "Petrol",
    Gasolina: "Petrol",
    Hybrid: "Hybrid",
    Híbrido: "Hybrid",
    Electric: "Electric",
    Eléctrico: "Electric",
    LPG: "LPG",
    GLP: "LPG",
  },
};

const transmissionLabels: Record<Language, Record<string, string>> = {
  es: {
    Manual: "Manual",
    Automatic: "Automática",
    Automática: "Automática",
    "Semi-automatic": "Semiautomática",
    Semiautomática: "Semiautomática",
  },
  en: {
    Manual: "Manual",
    Automatic: "Automatic",
    Automática: "Automatic",
    "Semi-automatic": "Semi-automatic",
    Semiautomática: "Semi-automatic",
  },
};

const translations = {
  es: {
    metadataTitle: "Colección de vehículos",
    metadataDescription:
      "Vehículos seleccionados por VANMOTION. Información clara, fotografías reales y atención directa.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    hero: {
      location: "Madrid · España",
      label: "VANMOTION vehicles · collection",
      titleFirst: "Vehículos reales.",
      titleSecond: "Movimiento propio.",
      caption: "Selección · historia · atención directa",
      inventory: "Inventario activo",
      count: (total: number) => `${total} vehículo${total === 1 ? "" : "s"}`,
    },
    collection: {
      eyebrow: "Colección VANMOTION",
      title: "Cada unidad cuenta su historia.",
      text:
        "Datos claros, imágenes reales y una selección construida con criterio. Sin adornar lo que no hace falta.",
    },
    card: {
      featured: "Destacado",
      reserved: "RESERVADO",
      sold: "VENDIDO",
      emblem: "Emblema VANMOTION",
      notForSale: "No disponible para la venta",
      photoSoon: "Fotografía próximamente",
      year: "Año",
      mileage: "Kilómetros",
      fuel: "Combustible",
      transmission: "Transmisión",
      viewDetails: "Ver vehículo",
      unspecified: "Sin especificar",
    },
    empty: {
      eyebrow: "Inventario VANMOTION",
      title: "Próximamente nuevas unidades.",
      text:
        "Estamos preparando nuevas incorporaciones. Cuéntanos qué vehículo estás buscando.",
      action: "Abrir contacto",
    },
    philosophy: {
      eyebrow: "La idea",
      first: "Sin aparentar.",
      second: "Con criterio.",
      rows: [
        {
          number: "01",
          title: "Información clara",
          text: "Datos directos para entender cada vehículo sin rodeos.",
        },
        {
          number: "02",
          title: "Fotografías reales",
          text: "La unidad se muestra como es, con sus detalles y su historia.",
        },
        {
          number: "03",
          title: "Atención directa",
          text: "Una conversación real antes, durante y después del proceso.",
        },
      ],
    },
    contact: {
      eyebrow: "¿Buscas algo concreto?",
      title: "Hablemos.",
      action: "Abrir contacto",
    },
    footer: {
      city: "Madrid · España",
      purchaseConditions: "Condiciones de compra",
      withdrawal: "Desistimiento",
      privacy: "Privacidad",
    },
  },
  en: {
    metadataTitle: "Vehicle collection",
    metadataDescription:
      "Vehicles selected by VANMOTION. Clear information, real photographs and direct attention.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    hero: {
      location: "Madrid · Spain",
      label: "VANMOTION vehicles · collection",
      titleFirst: "Real vehicles.",
      titleSecond: "Our own movement.",
      caption: "Selection · history · direct attention",
      inventory: "Active inventory",
      count: (total: number) => `${total} vehicle${total === 1 ? "" : "s"}`,
    },
    collection: {
      eyebrow: "VANMOTION Collection",
      title: "Every vehicle has a story.",
      text:
        "Clear facts, real images and a selection built with purpose. No unnecessary decoration.",
    },
    card: {
      featured: "Featured",
      reserved: "RESERVED",
      sold: "SOLD",
      emblem: "VANMOTION emblem",
      notForSale: "Not available for sale",
      photoSoon: "Photography coming soon",
      year: "Year",
      mileage: "Mileage",
      fuel: "Fuel",
      transmission: "Transmission",
      viewDetails: "View vehicle",
      unspecified: "Not specified",
    },
    empty: {
      eyebrow: "VANMOTION Inventory",
      title: "New vehicles coming soon.",
      text: "We are preparing new additions. Tell us what vehicle you are looking for.",
      action: "Open contact",
    },
    philosophy: {
      eyebrow: "The idea",
      first: "No pretending.",
      second: "Only purpose.",
      rows: [
        {
          number: "01",
          title: "Clear information",
          text: "Direct facts to understand every vehicle without detours.",
        },
        {
          number: "02",
          title: "Real photographs",
          text: "The vehicle is shown as it is, with its details and history.",
        },
        {
          number: "03",
          title: "Direct attention",
          text: "A real conversation before, during and after the process.",
        },
      ],
    },
    contact: {
      eyebrow: "Looking for something specific?",
      title: "Let us talk.",
      action: "Open contact",
    },
    footer: {
      city: "Madrid · Spain",
      purchaseConditions: "Purchase conditions",
      withdrawal: "Withdrawal",
      privacy: "Privacy",
    },
  },
} as const;

function translateValue(
  dictionary: Record<string, string>,
  value: string | null,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }

  return dictionary[value] ?? value;
}

function formatPrice(price: unknown, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
  };
}

export default async function CollectionPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];
  const locale = language === "es" ? "es-ES" : "en-GB";

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: {
        in: ["AVAILABLE", "RESERVED", "SOLD", "EMBLEM"],
      },
    },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      brand: true,
      images: {
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
      },
    },
  });

  return (
    <div className={styles.page}>
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
          aria-label={language === "es" ? "Navegación principal" : "Main navigation"}
        >
          <Link href="/coleccion" aria-current="page">{content.navigation.vehicles}</Link>
          <Link href="/musica">{content.navigation.music}</Link>
          <Link href="/ropa">{content.navigation.clothing}</Link>
          <Link href="/contacto">{content.navigation.contact}</Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="collection-hero-title">
          <Image
            src="/brand/vanmotion-ford-hero.webp"
            alt="Ford E-150, vehículo emblema de VANMOTION"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} aria-hidden="true" />

          <div className={styles.heroTopline}>
            <span>{content.hero.location}</span>
            <span>{content.hero.label}</span>
          </div>

          <div className={styles.heroCopy}>
            <p>{content.hero.label}</p>
            <h1 id="collection-hero-title">
              <span>{content.hero.titleFirst}</span>
              <span>{content.hero.titleSecond}</span>
            </h1>
          </div>

          <div className={styles.heroFoot}>
            <span>{content.hero.caption}</span>
            <div className={styles.inventoryCount}>
              <strong>{String(vehicles.length).padStart(2, "0")}</strong>
              <span>{content.hero.count(vehicles.length)}</span>
            </div>
          </div>
        </section>

        <section className={styles.collectionIntro}>
          <p className={styles.sectionLabel}>{content.collection.eyebrow}</p>
          <div className={styles.introGrid}>
            <h2>{content.collection.title}</h2>
            <p>{content.collection.text}</p>
          </div>
        </section>

        <section className={styles.vehiclesSection}>
          {vehicles.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.sectionLabel}>{content.empty.eyebrow}</p>
              <h2>{content.empty.title}</h2>
              <p>{content.empty.text}</p>
              <Link href="/contacto" className={styles.emptyAction}>
                {content.empty.action}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          ) : (
            <div className={styles.vehicleGrid}>
              {vehicles.map((vehicle, index) => {
                const vehicleName = [
                  vehicle.brand.name,
                  vehicle.model,
                  vehicle.version,
                ]
                  .filter(Boolean)
                  .join(" ");

                const image = vehicle.images[0];
                const fuel = translateValue(
                  fuelLabels[language],
                  vehicle.fuel,
                  content.card.unspecified,
                );
                const transmission = translateValue(
                  transmissionLabels[language],
                  vehicle.transmission,
                  content.card.unspecified,
                );
                const mileage = vehicle.mileage.toLocaleString(locale);
                const isEmblem = vehicle.status === "EMBLEM";
                const price = isEmblem
                  ? content.card.notForSale
                  : formatPrice(vehicle.price, locale);
                const primaryBadge = isEmblem
                  ? content.card.emblem
                  : vehicle.featured
                    ? content.card.featured
                    : null;
                const saleStatus =
                  vehicle.status === "RESERVED"
                    ? content.card.reserved
                    : vehicle.status === "SOLD"
                      ? content.card.sold
                      : null;
                const saleStatusStyle =
                  vehicle.status === "RESERVED"
                    ? {
                        background: "rgba(24, 92, 57, 0.9)",
                        border: "1px solid rgba(121, 214, 158, 0.38)",
                        color: "#f2fff7",
                        letterSpacing: "0.12em",
                      }
                    : vehicle.status === "SOLD"
                      ? {
                          background: "rgba(132, 31, 31, 0.92)",
                          border: "1px solid rgba(239, 126, 126, 0.4)",
                          color: "#fff5f5",
                          letterSpacing: "0.12em",
                        }
                      : undefined;

                return (
                  <article
                    key={vehicle.id}
                    className={`${styles.vehicleCard} ${index === 0 ? styles.vehicleCardFeatured : ""}`}
                  >
                    <Link
                      href={`/coleccion/${vehicle.id}`}
                      className={styles.vehicleLink}
                      aria-label={`${content.card.viewDetails}: ${vehicleName}`}
                    >
                      <div className={styles.vehicleMedia}>
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.url}
                            alt={image.alt ?? vehicleName}
                            className={styles.vehicleImage}
                          />
                        ) : (
                          <div className={styles.photoSoon}>{content.card.photoSoon}</div>
                        )}

                        <div className={styles.vehicleOverlay} aria-hidden="true" />

                        <div className={styles.vehicleBadges}>
                          {primaryBadge && <span>{primaryBadge}</span>}
                          <span>{vehicle.year}</span>
                          {saleStatus && (
                            <span style={saleStatusStyle}>
                              {saleStatus}
                            </span>
                          )}
                        </div>

                      </div>

                      <div className={styles.vehicleContent}>
                        <div>
                          <p className={styles.vehicleBrand}>{vehicle.brand.name}</p>
                          <h2>{vehicle.model}</h2>
                          {vehicle.version && <p className={styles.vehicleVersion}>{vehicle.version}</p>}
                        </div>

                        <div className={styles.vehicleDetails}>
                          <VehicleCardDetail label={content.card.year} value={String(vehicle.year)} />
                          <VehicleCardDetail label={content.card.mileage} value={`${mileage} km`} />
                          <VehicleCardDetail label={content.card.fuel} value={fuel} />
                          <VehicleCardDetail label={content.card.transmission} value={transmission} />
                        </div>

                        <div className={styles.vehicleBottom}>
                          <strong>{price}</strong>
                          <span className={styles.vehicleAction} aria-hidden="true">↗</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.manifestoSection}>
          <div className={styles.manifestoTitle}>
            <p className={styles.sectionLabel}>{content.philosophy.eyebrow}</p>
            <h2>
              <span>{content.philosophy.first}</span>
              <span>{content.philosophy.second}</span>
            </h2>
          </div>

          <div className={styles.manifestoList}>
            {content.philosophy.rows.map((row) => (
              <article key={row.number} className={styles.manifestoRow}>
                <span>{row.number}</span>
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.contactSection}>
          <div>
            <p className={styles.contactLabel}>{content.contact.eyebrow}</p>
            <h2>{content.contact.title}</h2>
          </div>

          <Link href="/contacto" className={styles.contactLink}>
            {content.contact.action}
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav className={styles.footerNav} aria-label={language === "es" ? "Enlaces legales" : "Legal links"}>
          <Link href="/condiciones-compra">{content.footer.purchaseConditions}</Link>
          <Link href="/desistimiento">{content.footer.withdrawal}</Link>
          <Link href="/privacidad">{content.footer.privacy}</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
  );
}

function VehicleCardDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.detailItem}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
