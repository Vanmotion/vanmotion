import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createContactRequest } from "@/actions/contactActions";
import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";
import { prisma } from "@/app/lib/prisma";

import VehicleGallery from "./VehicleGallery";
import styles from "./vehicle.module.css";

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

const drivetrainLabels: Record<Language, Record<string, string>> = {
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

const colorLabels: Record<Language, Record<string, string>> = {
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
      "Consulta fotografías, características y precio de este vehículo disponible en VANMOTION.",
    emblemMetadataDescription:
      "Descubre el vehículo emblema de VANMOTION, una unidad que representa la historia y la identidad de la marca.",
    navigation: {
      vehicles: "Vehículos",
      music: "Música",
      clothing: "Ropa",
      contact: "Contacto",
    },
    back: "Volver a la colección",
    success: {
      title: "Solicitud enviada correctamente",
      description: "VANMOTION se pondrá en contacto contigo.",
    },
    photoSoon: "Fotografía próximamente",
    imageNotice: "Imágenes ilustrativas. La unidad real puede presentar diferencias.",
    selectImage: "Mostrar fotografía",
    detailsLabel: "Datos del vehículo",
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
      eyebrow: "Contacto directo",
      title: "Solicitar información",
      description: "Déjanos tus datos y contactaremos contigo.",
      name: "Nombre *",
      namePlaceholder: "Tu nombre",
      email: "Correo electrónico *",
      emailPlaceholder: "correo@ejemplo.com",
      phone: "Teléfono",
      phonePlaceholder: "+34 600 000 000",
      message: "Mensaje *",
      messagePlaceholder: "Estoy interesado en el",
      submit: "Enviar solicitud",
      privacy:
        "Responsable: VANMOTION. Utilizaremos tus datos para responder y gestionar esta solicitud.",
      privacyLink: "Consulta la Política de Privacidad.",
    },
    emblem: {
      badge: "Vehículo emblema",
      title: "Parte de nuestra historia.",
      description:
        "Esta unidad representa el trabajo, el recorrido y la identidad de VANMOTION. Se muestra como parte de la marca y no está disponible para la venta.",
      notForSale: "No disponible para la venta",
    },
    information: {
      eyebrow: "Información real",
      titleFirst: "Sin adornar.",
      titleSecond: "Sin esconder.",
      heading: "Descripción del vehículo",
      fallback:
        "Vehículo seleccionado por VANMOTION. Contacta con nosotros para recibir más información.",
    },
    footer: {
      city: "Madrid · España",
      purchaseConditions: "Condiciones de compra",
      withdrawal: "Desistimiento",
      privacy: "Privacidad",
    },
  },
  en: {
    metadataDescription:
      "View photographs, specifications and price for this vehicle available from VANMOTION.",
    emblemMetadataDescription:
      "Discover the VANMOTION emblem vehicle, a unit representing the history and identity of the brand.",
    navigation: {
      vehicles: "Vehicles",
      music: "Music",
      clothing: "Clothing",
      contact: "Contact",
    },
    back: "Back to collection",
    success: {
      title: "Enquiry sent successfully",
      description: "VANMOTION will contact you shortly.",
    },
    photoSoon: "Photography coming soon",
    imageNotice: "Illustrative images. The actual vehicle may differ.",
    selectImage: "Show photograph",
    detailsLabel: "Vehicle details",
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
      eyebrow: "Direct contact",
      title: "Request information",
      description: "Leave your details and we will contact you.",
      name: "Name *",
      namePlaceholder: "Your name",
      email: "Email address *",
      emailPlaceholder: "email@example.com",
      phone: "Phone",
      phonePlaceholder: "+34 600 000 000",
      message: "Message *",
      messagePlaceholder: "I am interested in the",
      submit: "Send enquiry",
      privacy:
        "Controller: VANMOTION. We will use your details to respond to and manage this request.",
      privacyLink: "Read the Privacy Policy.",
    },
    emblem: {
      badge: "Emblem vehicle",
      title: "Part of our story.",
      description:
        "This unit represents the work, journey and identity of VANMOTION. It is shown as part of the brand and is not available for sale.",
      notForSale: "Not available for sale",
    },
    information: {
      eyebrow: "Real information",
      titleFirst: "No dressing up.",
      titleSecond: "Nothing hidden.",
      heading: "Vehicle description",
      fallback:
        "Vehicle selected by VANMOTION. Contact us to receive further information.",
    },
    footer: {
      city: "Madrid · Spain",
      purchaseConditions: "Purchase conditions",
      withdrawal: "Withdrawal",
      privacy: "Privacy",
    },
  },
} as const;

interface PublicVehiclePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enviado?: string }>;
}

function formatPrice(price: unknown, locale: string): string {
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
}: Pick<PublicVehiclePageProps, "params">): Promise<Metadata> {
  const { id } = await params;

  const [language, vehicle] = await Promise.all([
    getCurrentLanguage(),
    prisma.vehicle.findFirst({
      where: {
        id,
        status: { in: ["AVAILABLE", "EMBLEM"] },
      },
      select: {
        model: true,
        version: true,
        status: true,
        brand: { select: { name: true } },
      },
    }),
  ]);

  if (!vehicle) {
    return {
      title: language === "es" ? "Vehículo no disponible" : "Vehicle unavailable",
    };
  }

  const vehicleName = [vehicle.brand.name, vehicle.model, vehicle.version]
    .filter(Boolean)
    .join(" ");

  return {
    title: vehicleName,
    description:
      vehicle.status === "EMBLEM"
        ? translations[language].emblemMetadataDescription
        : translations[language].metadataDescription,
  };
}

export default async function PublicVehiclePage({
  params,
  searchParams,
}: PublicVehiclePageProps) {
  const [{ id }, { enviado }, language] = await Promise.all([
    params,
    searchParams,
    getCurrentLanguage(),
  ]);

  const content = translations[language];
  const locale = language === "es" ? "es-ES" : "en-GB";

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id,
      status: { in: ["AVAILABLE", "EMBLEM"] },
    },
    include: {
      brand: true,
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  const isEmblem = vehicle.status === "EMBLEM";
  const vehicleName = [vehicle.brand.name, vehicle.model, vehicle.version]
    .filter(Boolean)
    .join(" ");

  const translatedFuel = translateValue(
    fuelLabels[language],
    vehicle.fuel,
    content.details.unspecified,
  );
  const translatedTransmission = translateValue(
    transmissionLabels[language],
    vehicle.transmission,
    content.details.unspecified,
  );
  const translatedDrivetrain = translateValue(
    drivetrainLabels[language],
    vehicle.drivetrain,
    content.details.unspecified,
  );
  const translatedColor = translateValue(
    colorLabels[language],
    vehicle.color,
    content.details.unspecified,
  );

  const messagePlaceholder = `${content.contact.messagePlaceholder} ${vehicleName}.`;
  const vehicleDescription =
    language === "en"
      ? vehicle.descriptionEn ??
        vehicle.description ??
        content.information.fallback
      : vehicle.description ?? content.information.fallback;

  const details = [
    { label: content.details.year, value: vehicle.year },
    {
      label: content.details.mileage,
      value: `${vehicle.mileage.toLocaleString(locale)} km`,
    },
    { label: content.details.fuel, value: translatedFuel },
    { label: content.details.transmission, value: translatedTransmission },
    { label: content.details.drivetrain, value: translatedDrivetrain },
    {
      label: content.details.power,
      value:
        vehicle.power !== null
          ? `${vehicle.power} CV`
          : content.details.unspecified,
    },
    {
      label: content.details.engine,
      value: vehicle.engine ?? content.details.unspecified,
    },
    { label: content.details.color, value: translatedColor },
  ];

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
          <Link href="/coleccion" aria-current="page">
            {content.navigation.vehicles}
          </Link>
          <Link href="/musica">{content.navigation.music}</Link>
          <Link href="/ropa">{content.navigation.clothing}</Link>
          <Link href="/contacto">{content.navigation.contact}</Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroTopline}>
            <span>Madrid · España</span>
            <span>{isEmblem ? content.emblem.badge : content.detailsLabel}</span>
          </div>

          <Link href="/coleccion" className={styles.backLink}>
            ← {content.back}
          </Link>

          <div className={styles.heroCopy}>
            <p>{vehicle.brand.name}</p>
            <h1>{vehicle.model}</h1>
            {vehicle.version && <span>{vehicle.version}</span>}
          </div>

          <div className={styles.heroMeta}>
            <span>{vehicle.year}</span>
            <span>{translatedFuel}</span>
            <span>{translatedTransmission}</span>
          </div>
        </section>

        {!isEmblem && enviado === "1" && (
          <div className={styles.successMessage} role="status">
            <strong>{content.success.title}</strong>
            <span>{content.success.description}</span>
          </div>
        )}

        <section className={styles.productSection}>
          <div className={styles.galleryColumn}>
            <div className={styles.imageNotice} role="note">
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
              selectImageLabel={content.selectImage}
            />
          </div>

          <aside className={styles.infoPanel}>
            <div className={styles.infoHeading}>
              <p>{vehicle.brand.name}</p>
              <h2>{vehicle.model}</h2>
              {vehicle.version && <span>{vehicle.version}</span>}
            </div>

            <div className={styles.priceBlock}>
              {isEmblem ? (
                <>
                  <span>{content.emblem.badge}</span>
                  <strong>{content.emblem.notForSale}</strong>
                </>
              ) : (
                <>
                  <span>{language === "es" ? "Precio" : "Price"}</span>
                  <strong>{formatPrice(vehicle.price, locale)}</strong>
                </>
              )}
            </div>

            <div className={styles.detailGrid}>
              {details.map((detail) => (
                <VehicleDetail
                  key={detail.label}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </div>

            {isEmblem ? (
              <section className={styles.emblemPanel}>
                <p>{content.emblem.badge}</p>
                <h3>{content.emblem.title}</h3>
                <span>{content.emblem.description}</span>
              </section>
            ) : (
              <form action={createContactRequest} className={styles.contactForm}>
                <input type="hidden" name="vehicleId" value={vehicle.id} />

                <div className={styles.formHeading}>
                  <p>{content.contact.eyebrow}</p>
                  <h3>{content.contact.title}</h3>
                  <span>{content.contact.description}</span>
                </div>

                <div className={styles.formGrid}>
                  <ContactField
                    id="name"
                    label={content.contact.name}
                    type="text"
                    placeholder={content.contact.namePlaceholder}
                  />
                  <ContactField
                    id="email"
                    label={content.contact.email}
                    type="email"
                    placeholder={content.contact.emailPlaceholder}
                  />
                  <ContactField
                    id="phone"
                    label={content.contact.phone}
                    type="tel"
                    placeholder={content.contact.phonePlaceholder}
                    required={false}
                  />
                  <div className={styles.messageField}>
                    <label htmlFor="message">{content.contact.message}</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder={messagePlaceholder}
                    />
                  </div>
                </div>

                <p className={styles.privacyText}>
                  {content.contact.privacy}{" "}
                  <Link href="/privacidad">{content.contact.privacyLink}</Link>
                </p>

                <button type="submit" className={styles.submitButton}>
                  {content.contact.submit}
                  <span aria-hidden="true">↗</span>
                </button>
              </form>
            )}
          </aside>
        </section>

        <section className={styles.descriptionSection}>
          <div className={styles.descriptionTitle}>
            <p>{content.information.eyebrow}</p>
            <h2>
              <span>{content.information.titleFirst}</span>
              <span>{content.information.titleSecond}</span>
            </h2>
          </div>

          <div className={styles.descriptionCopy}>
            <h3>{content.information.heading}</h3>
            <p>{vehicleDescription}</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>Vanmotion</strong>
          <span>{content.footer.city}</span>
        </div>

        <nav className={styles.footerNav}>
          <Link href="/condiciones-compra">
            {content.footer.purchaseConditions}
          </Link>
          <Link href="/desistimiento">{content.footer.withdrawal}</Link>
          <Link href="/privacidad">{content.footer.privacy}</Link>
        </nav>

        <span className={styles.copyright}>© 2026</span>
      </footer>
    </div>
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
    <div className={styles.detailItem}>
      <span>{label}</span>
      <strong>{value}</strong>
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
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}
