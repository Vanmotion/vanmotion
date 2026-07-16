import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createContactRequest } from "@/actions/contactActions";
import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import VehicleGallery from "./VehicleGallery";

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

const drivetrainLabels: Record<
  Language,
  Record<string, string>
> = {
  es: {
    FWD: "Delantera",
    Delantera: "Delantera",
    RWD: "Trasera",
    Trasera: "Trasera",
    AWD: "Integral AWD",
    "Integral AWD": "Integral AWD",
    "4WD": "4x4",
    "4x4": "4x4",
  },

  en: {
    FWD: "Front-wheel drive",
    Delantera: "Front-wheel drive",
    RWD: "Rear-wheel drive",
    Trasera: "Rear-wheel drive",
    AWD: "All-wheel drive",
    "Integral AWD": "All-wheel drive",
    "4WD": "Four-wheel drive",
    "4x4": "Four-wheel drive",
  },
};

const colorLabels: Record<
  Language,
  Record<string, string>
> = {
  es: {
    White: "Blanco",
    Blanco: "Blanco",
    Black: "Negro",
    Negro: "Negro",
    Grey: "Gris",
    Gray: "Gris",
    Gris: "Gris",
    Silver: "Plata",
    Plata: "Plata",
    Blue: "Azul",
    Azul: "Azul",
    Red: "Rojo",
    Rojo: "Rojo",
    Green: "Verde",
    Verde: "Verde",
    Brown: "Marrón",
    Marrón: "Marrón",
    Beige: "Beige",
    Yellow: "Amarillo",
    Amarillo: "Amarillo",
    Orange: "Naranja",
    Naranja: "Naranja",
  },

  en: {
    White: "White",
    Blanco: "White",
    Black: "Black",
    Negro: "Black",
    Grey: "Grey",
    Gray: "Grey",
    Gris: "Grey",
    Silver: "Silver",
    Plata: "Silver",
    Blue: "Blue",
    Azul: "Blue",
    Red: "Red",
    Rojo: "Red",
    Green: "Green",
    Verde: "Green",
    Brown: "Brown",
    Marrón: "Brown",
    Beige: "Beige",
    Yellow: "Yellow",
    Amarillo: "Yellow",
    Orange: "Orange",
    Naranja: "Orange",
  },
};

const translations = {
  es: {
    metadataDescription:
      "Consulta las fotografías, características y precio de este vehículo disponible en VANMOTION.",

    emblemMetadataDescription:
      "Descubre el vehículo emblema de VANMOTION, una unidad que representa la historia y la identidad de la marca.",

    navigation: {
      home: "Inicio",
      collection: "Colección",
    },

    back: "Volver a la colección",

    success: {
      title: "Solicitud enviada correctamente",
      description:
        "VANMOTION se pondrá en contacto contigo.",
    },

    photoSoon: "Fotografía próximamente",
    imageNotice:
      "Imágenes ilustrativas. La unidad real puede presentar diferencias.",

    details: {
      year: "Año",
      mileage: "Kilómetros",
      fuel: "Combustible",
      transmission: "Transmisión",
      drivetrain: "Tracción",
      power: "Potencia",
      engine: "Motor",
      color: "Color",
      unspecified: "Sin especificar",
    },

    contact: {
      title: "Solicitar información",
      description:
        "Déjanos tus datos y contactaremos contigo.",
      name: "Nombre *",
      namePlaceholder: "Tu nombre",
      email: "Correo electrónico *",
      emailPlaceholder: "correo@ejemplo.com",
      phone: "Teléfono",
      phonePlaceholder: "+34 600 000 000",
      message: "Mensaje *",
      messagePlaceholder:
        "Estoy interesado en el",
      submit: "Enviar solicitud",
    },

    emblem: {
      badge: "Vehículo emblema",
      title: "Vehículo emblema de VANMOTION",
      description:
        "Esta unidad representa la historia, el trabajo y la identidad de VANMOTION. Se muestra como parte de la marca y no está disponible para la venta.",
      notForSale: "No disponible para la venta",
    },

    information: {
      label: "Información",
      title: "Descripción del vehículo",
      fallback:
        "Vehículo seleccionado por VANMOTION. Contacta con nosotros para recibir más información.",
    },
  },

  en: {
    metadataDescription:
      "View the photographs, specifications and price of this vehicle available from VANMOTION.",

    emblemMetadataDescription:
      "Discover the VANMOTION emblem vehicle, a unit that represents the history and identity of the brand.",

    navigation: {
      home: "Home",
      collection: "Collection",
    },

    back: "Back to collection",

    success: {
      title: "Enquiry sent successfully",
      description:
        "VANMOTION will contact you shortly.",
    },

    photoSoon: "Photography coming soon",
    imageNotice:
      "Illustrative images. The actual vehicle may differ.",

    details: {
      year: "Year",
      mileage: "Mileage",
      fuel: "Fuel",
      transmission: "Transmission",
      drivetrain: "Drivetrain",
      power: "Power",
      engine: "Engine",
      color: "Colour",
      unspecified: "Not specified",
    },

    contact: {
      title: "Request information",
      description:
        "Leave your details and we will contact you.",
      name: "Name *",
      namePlaceholder: "Your name",
      email: "Email address *",
      emailPlaceholder: "email@example.com",
      phone: "Phone",
      phonePlaceholder: "+34 600 000 000",
      message: "Message *",
      messagePlaceholder:
        "I am interested in the",
      submit: "Send enquiry",
    },

    emblem: {
      badge: "Emblem vehicle",
      title: "VANMOTION emblem vehicle",
      description:
        "This unit represents the history, work and identity of VANMOTION. It is displayed as part of the brand and is not available for sale.",
      notForSale: "Not available for sale",
    },

    information: {
      label: "Information",
      title: "Vehicle description",
      fallback:
        "Vehicle selected by VANMOTION. Contact us to receive further information.",
    },
  },
} as const;

interface PublicVehiclePageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    enviado?: string;
  }>;
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

export async function generateMetadata({
  params,
}: Pick<
  PublicVehiclePageProps,
  "params"
>): Promise<Metadata> {
  const { id } = await params;

  const [language, vehicle] =
    await Promise.all([
      getCurrentLanguage(),

      prisma.vehicle.findFirst({
        where: {
          id,
          status: {
            in: ["AVAILABLE", "EMBLEM"],
          },
        },

        select: {
          model: true,
          version: true,
          status: true,

          brand: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

  if (!vehicle) {
    return {
      title:
        language === "es"
          ? "Vehículo no disponible"
          : "Vehicle unavailable",
    };
  }

  const vehicleName = [
    vehicle.brand.name,
    vehicle.model,
    vehicle.version,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: vehicleName,
    description:
      vehicle.status === "EMBLEM"
        ? translations[language]
            .emblemMetadataDescription
        : translations[language]
            .metadataDescription,
  };
}

export default async function PublicVehiclePage({
  params,
  searchParams,
}: PublicVehiclePageProps) {
  const [
    { id },
    { enviado },
    language,
  ] = await Promise.all([
    params,
    searchParams,
    getCurrentLanguage(),
  ]);

  const content =
    translations[language];

  const locale =
    language === "es"
      ? "es-ES"
      : "en-GB";

  const vehicle =
    await prisma.vehicle.findFirst({
      where: {
        id,
        status: {
          in: ["AVAILABLE", "EMBLEM"],
        },
      },

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
        },
      },
    });

  if (!vehicle) {
    notFound();
  }

  const isEmblem =
    vehicle.status === "EMBLEM";

  const vehicleName = [
    vehicle.brand.name,
    vehicle.model,
    vehicle.version,
  ]
    .filter(Boolean)
    .join(" ");

  const formattedMileage =
    vehicle.mileage.toLocaleString(
      locale,
    );

  const translatedFuel =
    translateValue(
      fuelLabels[language],
      vehicle.fuel,
      content.details.unspecified,
    );

  const translatedTransmission =
    translateValue(
      transmissionLabels[language],
      vehicle.transmission,
      content.details.unspecified,
    );

  const translatedDrivetrain =
    translateValue(
      drivetrainLabels[language],
      vehicle.drivetrain,
      content.details.unspecified,
    );

  const translatedColor =
    translateValue(
      colorLabels[language],
      vehicle.color,
      content.details.unspecified,
    );

  const messagePlaceholder =
    `${content.contact.messagePlaceholder} ${vehicleName}.`;

  const vehicleDescription =
    language === "en"
      ? vehicle.descriptionEn ??
        vehicle.description ??
        content.information.fallback
      : vehicle.description ??
        content.information.fallback;

  return (
    <main className="min-h-screen bg-black pb-36 text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-[0.35em] text-white"
          >
            VANMOTION
          </Link>

          <nav
            className="flex items-center gap-5 text-sm"
            aria-label={
              language === "es"
                ? "Navegación principal"
                : "Main navigation"
            }
          >
            <Link
              href="/"
              className="text-white/60 transition hover:text-white"
            >
              {content.navigation.home}
            </Link>

            <Link
              href="/coleccion"
              className="font-semibold text-white"
            >
              {
                content.navigation
                  .collection
              }
            </Link>
          </nav>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/coleccion"
            className="inline-flex text-sm font-semibold text-white/60 transition hover:text-white"
          >
            ← {content.back}
          </Link>

          {!isEmblem && enviado === "1" && (
            <div
              className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5"
              role="status"
            >
              <p className="font-semibold text-green-300">
                {content.success.title}
              </p>

              <p className="mt-1 text-sm text-green-200/70">
                {
                  content.success
                    .description
                }
              </p>
            </div>
          )}

          <section className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <div
                className="mb-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100"
                role="note"
              >
                {content.imageNotice}
              </div>

              <VehicleGallery
                images={vehicle.images.map((image) => ({
                  id: image.id,
                  url: image.url,
                  alt: image.alt,
                }))}
                vehicleName={vehicleName}
                emptyLabel={content.photoSoon}
                selectImageLabel={
                  language === "es"
                    ? "Mostrar fotografía"
                    : "Show photograph"
                }
              />
            </div>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <p className="text-sm uppercase tracking-[0.25em] text-white/40">
                {vehicle.brand.name}
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
                {vehicle.model}
              </h1>

              {vehicle.version && (
                <p className="mt-2 text-xl text-white/55">
                  {vehicle.version}
                </p>
              )}

              {isEmblem ? (
                <div className="mt-8">
                  <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
                    {content.emblem.badge}
                  </span>

                  <p className="mt-5 text-3xl font-bold text-white">
                    {content.emblem.notForSale}
                  </p>
                </div>
              ) : (
                <p className="mt-8 text-4xl font-bold">
                  {formatPrice(
                    vehicle.price,
                    locale,
                  )}
                </p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <VehicleDetail
                  label={
                    content.details.year
                  }
                  value={vehicle.year}
                />

                <VehicleDetail
                  label={
                    content.details.mileage
                  }
                  value={`${formattedMileage} km`}
                />

                <VehicleDetail
                  label={
                    content.details.fuel
                  }
                  value={translatedFuel}
                />

                <VehicleDetail
                  label={
                    content.details
                      .transmission
                  }
                  value={
                    translatedTransmission
                  }
                />

                <VehicleDetail
                  label={
                    content.details
                      .drivetrain
                  }
                  value={
                    translatedDrivetrain
                  }
                />

                <VehicleDetail
                  label={
                    content.details.power
                  }
                  value={
                    vehicle.power !== null
                      ? `${vehicle.power} CV`
                      : content.details
                          .unspecified
                  }
                />

                <VehicleDetail
                  label={
                    content.details.engine
                  }
                  value={
                    vehicle.engine ??
                    content.details
                      .unspecified
                  }
                />

                <VehicleDetail
                  label={
                    content.details.color
                  }
                  value={translatedColor}
                />
              </div>

              {isEmblem ? (
                <section className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100/70">
                    {content.emblem.badge}
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold">
                    {content.emblem.title}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-white/55">
                    {content.emblem.description}
                  </p>

                  <p className="mt-5 border-t border-amber-300/15 pt-5 text-sm font-semibold text-amber-100">
                    {content.emblem.notForSale}
                  </p>
                </section>
              ) : (
                <form
                  action={createContactRequest}
                  className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <input
                    type="hidden"
                    name="vehicleId"
                    value={vehicle.id}
                  />

                  <h2 className="text-2xl font-semibold">
                    {content.contact.title}
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    {
                      content.contact
                        .description
                    }
                  </p>

                  <div className="mt-6 space-y-4">
                    <ContactField
                      id="name"
                      label={
                        content.contact.name
                      }
                      type="text"
                      placeholder={
                        content.contact
                          .namePlaceholder
                      }
                    />

                    <ContactField
                      id="email"
                      label={
                        content.contact.email
                      }
                      type="email"
                      placeholder={
                        content.contact
                          .emailPlaceholder
                      }
                    />

                    <ContactField
                      id="phone"
                      label={
                        content.contact.phone
                      }
                      type="tel"
                      placeholder={
                        content.contact
                          .phonePlaceholder
                      }
                      required={false}
                    />

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm text-white/60"
                      >
                        {
                          content.contact
                            .message
                        }
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder={
                          messagePlaceholder
                        }
                        className="w-full resize-y rounded-xl border border-white/10 bg-black p-4 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-bold transition hover:opacity-80"
                    style={{
                      color: "#000000",
                    }}
                  >
                    {content.contact.submit}
                  </button>
                </form>
              )}
            </aside>
          </section>

          <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10">
            <p className="text-sm uppercase tracking-[0.25em] text-white/40">
              {content.information.label}
            </p>

            <h2 className="mt-3 text-3xl font-semibold">
              {content.information.title}
            </h2>

            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-white/60">
              {vehicleDescription}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function VehicleDetail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border-b border-white/10 pb-4">
      <p className="text-sm text-white/35">
        {label}
      </p>

      <p className="mt-1 font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function ContactField({
  id,
  label,
  type,
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm text-white/60"
      >
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
      />
    </div>
  );
}