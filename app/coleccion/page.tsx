import type { Metadata } from "next";
import Link from "next/link";

import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

const fuelLabels: Record<
  Language,
  Record<string, string>
> = {
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

const transmissionLabels: Record<
  Language,
  Record<string, string>
> = {
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
      "Descubre los coches y furgonetas disponibles y el vehículo emblema de VANMOTION. Vehículos seleccionados, imágenes ilustrativas e información clara.",

    navigation: {
      home: "Inicio",
      collection: "Colección",
      history: "Historia",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
      vehicles: "Ver vehículos",
    },

    hero: {
      eyebrow: "Colección VANMOTION · Madrid",
      titleFirst: "Vehículos",
      titleSecond: "con historia.",
      description:
        "Coches y furgonetas seleccionados con personalidad, información clara e imágenes ilustrativas. Sin aparentar, sin atajos y con atención directa.",
      inventory: "Inventario disponible",
      count: (total: number) =>
        `${total} vehículo${total === 1 ? "" : "s"}`,
    },

    card: {
      featured: "Destacado",
      available: "Disponible",
      emblem: "Vehículo emblema",
      notForSale: "No disponible para la venta",
      photoSoon: "Fotografía próximamente",
      year: "Año",
      mileage: "Kilómetros",
      fuel: "Combustible",
      transmission: "Transmisión",
      viewDetails: "Ver vehículo",
      unspecified: "Sin especificar",
      illustrativeImages: "Imágenes ilustrativas",
    },

    empty: {
      eyebrow: "Inventario VANMOTION",
      title: "Próximamente nuevos vehículos.",
      description:
        "Estamos preparando nuevas incorporaciones. Vuelve pronto o contacta con nosotros para contarnos qué vehículo estás buscando.",
      action: "Contactar con VANMOTION",
    },

    closing: {
      eyebrow: "¿Buscas algo concreto?",
      titleFirst: "Hablemos del próximo",
      titleSecond: "movimiento.",
      description:
        "Cuéntanos qué coche o furgoneta necesitas y estudiaremos cómo ayudarte.",
      action: "Abrir contacto",
    },

    footer: "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    metadataTitle: "Vehicle collection",
    metadataDescription:
      "Discover the cars and vans available from VANMOTION and the VANMOTION emblem vehicle. Selected vehicles, illustrative images and clear information.",

    navigation: {
      home: "Home",
      collection: "Collection",
      history: "Story",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
      vehicles: "View vehicles",
    },

    hero: {
      eyebrow: "VANMOTION Collection · Madrid",
      titleFirst: "Vehicles",
      titleSecond: "with a story.",
      description:
        "Cars and vans selected for their personality, with clear information and illustrative images. No pretending, no shortcuts and direct personal assistance.",
      inventory: "Available inventory",
      count: (total: number) =>
        `${total} vehicle${total === 1 ? "" : "s"}`,
    },

    card: {
      featured: "Featured",
      available: "Available",
      emblem: "Emblem vehicle",
      notForSale: "Not available for sale",
      photoSoon: "Photography coming soon",
      year: "Year",
      mileage: "Mileage",
      fuel: "Fuel",
      transmission: "Transmission",
      viewDetails: "View vehicle",
      unspecified: "Not specified",
      illustrativeImages: "Illustrative images",
    },

    empty: {
      eyebrow: "VANMOTION Inventory",
      title: "New vehicles coming soon.",
      description:
        "We are preparing new additions. Check back soon or contact us and tell us what type of vehicle you are looking for.",
      action: "Contact VANMOTION",
    },

    closing: {
      eyebrow: "Looking for something specific?",
      titleFirst: "Let us discuss the next",
      titleSecond: "movement.",
      description:
        "Tell us what car or van you need and we will explore how we can help.",
      action: "Open contact",
    },

    footer: "Vehicles · Music · Design · Madrid",
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

function formatPrice(
  price: unknown,
  locale: string,
): string {
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

  const locale =
    language === "es" ? "es-ES" : "en-GB";

  const vehicles = await prisma.vehicle.findMany({
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

  const navigation = [
    {
      label: content.navigation.home,
      href: "/",
    },
    {
      label: content.navigation.collection,
      href: "/coleccion",
    },
    {
      label: content.navigation.history,
      href: "/#historia",
    },
    {
      label: content.navigation.music,
      href: "/musica",
    },
    {
      label: content.navigation.clothing,
      href: "/ropa",
    },
    {
      label: content.navigation.contact,
      href: "/contacto",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080808] pb-36 text-white">
      <header className="border-b border-white/10 bg-[#080808]">
        <div className="mx-auto flex min-h-[76px] w-full max-w-[1600px] items-center justify-between gap-8 px-6 lg:px-10">
          <Link
            href="/"
            className="text-lg font-bold tracking-[0.34em] text-white"
          >
            VANMOTION
          </Link>

          <nav
            className="hidden items-center gap-9 lg:flex"
            aria-label={
              language === "es"
                ? "Navegación principal"
                : "Main navigation"
            }
          >
            {navigation.map((item) => {
              const active =
                item.href === "/coleccion";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                    active
                      ? "text-white"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/coleccion"
            className="hidden min-h-11 items-center justify-between gap-10 border border-white/20 px-5 text-[9px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black sm:flex"
          >
            {content.navigation.vehicles}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        >
          <div className="absolute right-[-180px] top-[-220px] h-[600px] w-[600px] rounded-full bg-white/[0.05] blur-[130px]" />
          <div className="absolute bottom-[-300px] left-[-200px] h-[600px] w-[600px] rounded-full bg-white/[0.025] blur-[140px]" />
        </div>

        <div className="relative mx-auto grid min-h-0 w-full max-w-[1600px] border-x border-white/10 lg:min-h-[360px] lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col justify-end border-b border-white/10 px-6 py-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-12 bg-white/30" />

              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                {content.hero.eyebrow}
              </p>
            </div>

            <h1 className="max-w-5xl text-[clamp(52px,6.6vw,104px)] font-semibold uppercase leading-[0.82] tracking-[-0.065em]">
              {content.hero.titleFirst}
              <br />
              <span className="text-white/20">
                {content.hero.titleSecond}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-6 text-white/45">
              {content.hero.description}
            </p>
          </div>

          <div className="flex min-h-[180px] flex-col justify-between bg-white/[0.015] p-5 sm:min-h-[200px] sm:p-6 lg:min-h-0 lg:p-10">
            <div className="flex items-start justify-between gap-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-white/30">
                {content.hero.inventory}
              </p>

              <span className="rounded-full border border-white/15 px-5 py-3 text-[9px] font-bold tracking-[0.18em] text-white/65">
                2026
              </span>
            </div>

            <div className="mt-8 sm:mt-10 lg:mt-0">
              <strong className="block text-[clamp(74px,9vw,128px)] font-semibold leading-[0.78] tracking-[-0.075em]">
                {String(vehicles.length).padStart(
                  2,
                  "0",
                )}
              </strong>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                {content.hero.count(vehicles.length)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] border-x border-white/10">
        {vehicles.length === 0 ? (
          <div className="flex min-h-[520px] flex-col items-start justify-center border-b border-white/10 px-6 py-20 lg:px-14">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
              {content.empty.eyebrow}
            </p>

            <h2 className="mt-6 max-w-4xl text-[clamp(42px,6vw,90px)] font-semibold uppercase leading-[0.86] tracking-[-0.055em]">
              {content.empty.title}
            </h2>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/45">
              {content.empty.description}
            </p>

            <Link
              href="/contacto"
              className="mt-10 flex min-h-14 min-w-64 items-center justify-between border border-white/20 px-6 text-[9px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
            >
              {content.empty.action}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div
            className={
              vehicles.length === 1
                ? "grid w-full grid-cols-1"
                : "grid md:grid-cols-2 xl:grid-cols-3"
            }
          >
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

              const mileage =
                vehicle.mileage.toLocaleString(locale);

              const isEmblem =
                vehicle.status === "EMBLEM";

              const price = isEmblem
                ? content.card.notForSale
                : formatPrice(
                    vehicle.price,
                    locale,
                  );

              const status = isEmblem
                ? content.card.emblem
                : vehicle.featured
                  ? content.card.featured
                  : content.card.available;

              const rightBorder =
                index % 3 !== 2
                  ? "xl:border-r"
                  : "";

              return (
                <article
                  key={vehicle.id}
                  className={
                    vehicles.length === 1
                      ? "border-b border-white/10"
                      : `border-b border-white/10 ${rightBorder} md:[&:nth-child(odd)]:border-r md:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(odd)]:border-r-0`
                  }
                >
                  <Link
                    href={`/coleccion/${vehicle.id}`}
                    className={
                      vehicles.length === 1
                        ? "group grid h-full lg:grid-cols-[3fr_2fr]"
                        : "group flex h-full flex-col"
                    }
                    aria-label={`${content.card.viewDetails}: ${vehicleName}`}
                  >
                    <div
                      className={
                        vehicles.length === 1
                          ? "relative min-h-[320px] overflow-hidden border-b border-white/10 bg-white/[0.025] sm:min-h-[440px] lg:min-h-[560px] lg:border-b-0 lg:border-r"
                          : "relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-white/[0.025]"
                      }
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt={image.alt ?? vehicleName}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                          {content.card.photoSoon}
                        </div>
                      )}

                      <div className="absolute left-5 top-5 flex items-center gap-2">
                        <span className="border border-white/20 bg-black/70 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
                          {status}
                        </span>

                        <span className="border border-white/20 bg-black/70 px-3 py-2 text-[8px] font-bold tracking-[0.18em] backdrop-blur-sm">
                          {vehicle.year}
                        </span>
                      </div>

                      {image && (
                        <span className="absolute bottom-5 left-5 border border-amber-300/30 bg-black/75 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur-sm">
                          {
                            content.card
                              .illustrativeImages
                          }
                        </span>
                      )}
                    </div>

                    <div
                      className={
                        vehicles.length === 1
                          ? "flex flex-1 flex-col p-6 sm:p-10 lg:p-12"
                          : "flex flex-1 flex-col p-6 lg:p-8"
                      }
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                        {vehicle.brand.name}
                      </p>

                      <h2
                        className={`mt-4 font-semibold uppercase leading-[0.95] tracking-[-0.04em] ${
                          vehicles.length === 1
                            ? "text-4xl lg:text-5xl"
                            : "text-3xl"
                        }`}
                      >
                        {vehicle.model}
                      </h2>

                      {vehicle.version && (
                        <p className="mt-3 min-h-6 text-sm text-white/45">
                          {vehicle.version}
                        </p>
                      )}

                      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/10 py-6">
                        <VehicleCardDetail
                          label={content.card.year}
                          value={String(vehicle.year)}
                        />

                        <VehicleCardDetail
                          label={content.card.mileage}
                          value={`${mileage} km`}
                        />

                        <VehicleCardDetail
                          label={content.card.fuel}
                          value={fuel}
                        />

                        <VehicleCardDetail
                          label={
                            content.card.transmission
                          }
                          value={transmission}
                        />
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-6 pt-8">
                        <strong className="text-2xl font-semibold tracking-[-0.035em]">
                          {price}
                        </strong>

                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-lg transition group-hover:bg-white group-hover:text-black">
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-[1600px] border-x border-b border-white/10 px-6 py-16 lg:px-14 lg:py-24">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
              {content.closing.eyebrow}
            </p>

            <h2 className="mt-6 max-w-5xl text-[clamp(46px,7vw,105px)] font-semibold uppercase leading-[0.83] tracking-[-0.065em]">
              {content.closing.titleFirst}
              <br />
              {content.closing.titleSecond}
            </h2>
          </div>

          <div>
            <p className="text-sm leading-7 text-white/40">
              {content.closing.description}
            </p>

            <Link
              href="/contacto"
              className="mt-8 flex min-h-14 w-full items-center justify-between border border-white/20 px-6 text-[9px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
            >
              {content.closing.action}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-[1600px] border-x border-white/10">
        <div className="flex flex-col gap-6 px-6 py-8 text-[9px] uppercase tracking-[0.16em] text-white/30 md:flex-row md:items-center md:justify-between lg:px-14">
          <strong className="text-white">
            VANMOTION
          </strong>

          <span>{content.footer}</span>

          <span>© 2026 VANMOTION</span>
        </div>
      </footer>
    </main>
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
    <div>
      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-sm text-white/70">
        {value}
      </p>
    </div>
  );
}