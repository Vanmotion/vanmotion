import type { Metadata } from "next";
import Image from "next/image";
import { getCurrentLanguage } from "@/app/lib/language";

export const metadata: Metadata = {
  title: "Reconocimientos | VANMOTION Automotive Culture",
  description:
    "Reconocimientos digitales de VANMOTION: WD Awards, CSS Nectar y CSS Winner. Proyecto de cultura automotriz, música y streetwear nacido en Madrid.",
  keywords: [
    "VANMOTION awards",
    "WD Awards",
    "CSS Nectar",
    "CSS Winner",
    "automotive culture",
    "digital experience",
  ],
  alternates: {
    canonical: "https://www.vanmotion.es/reconocimientos",
  },
  openGraph: {
    title: "Reconocimientos | VANMOTION Automotive Culture",
    description:
      "Reconocimientos digitales de VANMOTION: WD Awards, CSS Nectar y CSS Winner. Proyecto de cultura automotriz, música y streetwear nacido en Madrid.",
    type: "website",
    url: "https://www.vanmotion.es/reconocimientos",
    images: [
      {
        url: "/reconocimientos/wd-awards.png",
        alt: "WD Awards Nominee 2026 · VANMOTION Automotive Culture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reconocimientos | VANMOTION Automotive Culture",
    description:
      "WD Awards, CSS Nectar y CSS Winner · Reconocimientos digitales de VANMOTION.",
    images: ["/reconocimientos/wd-awards.png"],
  },
};

const translations = {
  es: {
    label: "Reconocimientos",
    description:
      "VANMOTION es una experiencia digital nacida en Madrid que une cultura automotriz, música original, streetwear e identidad visual.",
    official: "Ver reconocimiento oficial →",
  },
  en: {
    label: "Awards",
    description:
      "VANMOTION is a digital experience born in Madrid combining automotive culture, original music, streetwear and visual identity.",
    official: "View official recognition →",
  },
};

const awards: {
  name: {
    es: string;
    en: string;
  };
  category: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  url: string;
  image: string;
  alt: string;
}[] = [
  {
    name: {
      es: "WD Awards Nominee 2026",
      en: "WD Awards Nominee 2026",
    },
    category: {
      es: "Cultura Automotriz",
      en: "Automotive Culture",
    },
    description: {
      es: "Reconocimiento internacional como proyecto nominado por su experiencia digital, identidad visual y narrativa alrededor de la cultura del automóvil.",
      en: "International recognition as a nominated project for its digital experience, visual identity and automotive culture storytelling.",
    },
    url: "https://wdawards.com/web/vanmotion-automotive-culture",
    image: "/reconocimientos/wd-awards.png",
    alt: "WD Awards Nominee 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Nectar",
      en: "CSS Nectar",
    },
    category: {
      es: "Sitio del Día",
      en: "Site of the Day",
    },
    description: {
      es: "Reconocimiento dentro de una plataforma internacional de inspiración y selección de diseño web.",
      en: "Recognition within an international platform for web design inspiration and selection.",
    },
    url: "https://cssnectar.com/css-gallery-inspiration/vanmotion-cars-%c2%b7-music-%c2%b7-clothing/",
    image: "/reconocimientos/css-nectar.png",
    alt: "CSS Nectar VANMOTION",
  },
  {
    name: {
      es: "CSS Winner",
      en: "CSS Winner",
    },
    category: {
      es: "Reconocimiento Web",
      en: "Website Recognition",
    },
    description: {
      es: "Proyecto seleccionado dentro del ecosistema internacional de diseño y experiencias digitales.",
      en: "Project selected within the international ecosystem of digital design and experiences.",
    },
    url: "https://www.csswinner.com/search/vanmotion",
    image: "/reconocimientos/css-winner.png",
    alt: "CSS Winner VANMOTION",
  },
];

export default async function ReconocimientosPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "VANMOTION — Automotive Culture",
    about: [
      "Automotive culture",
      "Digital experience",
      "Brand identity",
      "Visual storytelling",
    ],
    award: awards.map((award) => award.name),
    image: awards.map((award) => award.image),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <main className="min-h-screen bg-black text-white px-8 py-24">
        <section className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase opacity-70">
            {content.label}
          </p>

          <h1 className="text-5xl font-bold mt-6">
            VANMOTION — Automotive Culture
          </h1>

          <p className="mt-6 text-lg opacity-90 leading-relaxed max-w-3xl">
            {content.description}
          </p>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {awards.map((award) => (
              <article
                key={award.name[language]}
                className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03]"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={award.image}
                    alt={award.alt}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-semibold">{award.name[language]}</h2>

                  <p className="mt-2 uppercase text-xs tracking-widest opacity-60">
                    {award.category[language]}
                  </p>

                  <p className="mt-4 opacity-80 leading-relaxed">
                    {award.description[language]}
                  </p>

                  <a
                    href={award.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-6 underline"
                  >
                    {content.official}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
