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
      "CSS Design Awards, WD Awards, CSS Nectar, CSS Winner y WebsiteAwards.es · Reconocimientos digitales de VANMOTION.",
    images: ["/reconocimientos/wd-awards.png"],
  },
};

const translations = {
  es: {
    label: "Reconocimientos",
    description:
      "VANMOTION es una experiencia digital nacida en Madrid que une cultura automotriz, música original, streetwear e identidad visual.",
    official: "Ver reconocimiento oficial →",
    certificate: "Ver certificado oficial →",
  },
  en: {
    label: "Awards",
    description:
      "VANMOTION is a digital experience born in Madrid combining automotive culture, original music, streetwear and visual identity.",
    official: "View official recognition →",
    certificate: "View official certificate →",
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
  certificateUrl?: string;
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
    certificateUrl: "/reconocimientos/wd-awards-nominee-certificate.pdf",
    image: "/reconocimientos/wd-awards.png",
    alt: "WD Awards Nominee 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Nectar — Website of the Day Winner 2026",
      en: "CSS Nectar — Website of the Day Winner 2026",
    },
    category: {
      es: "Website of the Day · Ganadora",
      en: "Website of the Day · Winner",
    },
    description: {
      es: "VANMOTION fue reconocida oficialmente por CSS Nectar como ganadora de Website of the Day el 23 de agosto de 2026.",
      en: "VANMOTION was officially recognized by CSS Nectar as a Website of the Day winner on August 23, 2026.",
    },
    url: "https://cssnectar.com/css-gallery-inspiration/vanmotion-cars-%c2%b7-music-%c2%b7-clothing/",
    certificateUrl: "/referencias/cssnectar/vanmotion-sotd-cert.pdf",
    image: "/reconocimientos/css-nectar.png",
    alt: "CSS Nectar Website of the Day Winner 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Winner — Site of the Day Nominee 2026",
      en: "CSS Winner — Site of the Day Nominee 2026",
    },
    category: {
      es: "Site of the Day · Nominada",
      en: "Site of the Day · Nominee",
    },
    description: {
      es: "VANMOTION fue nominada oficialmente por CSS Winner al Site of the Day Award el 10 de agosto de 2026. Certificado oficial #CSSW19355.",
      en: "VANMOTION was officially nominated by CSS Winner for the Site of the Day Award on August 10, 2026. Official certificate #CSSW19355.",
    },
    url: "https://www.csswinner.com/search/vanmotion",
    certificateUrl: "/reconocimientos/css-winner-site-of-the-day-nominee-2026.pdf",
    image: "/reconocimientos/css-winner.png",
    alt: "CSS Winner Site of the Day Nominee 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Design Awards — Website of the Day Nominee 2026",
      en: "CSS Design Awards — Website of the Day Nominee 2026",
    },
    category: {
      es: "UI Design · UX Design · Innovation",
      en: "UI Design · UX Design · Innovation",
    },
    description: {
      es: "VANMOTION fue nominada oficialmente por CSS Design Awards el 30 de agosto de 2026 para Website of the Day y participa también en los Public Vote Awards de UI Design, UX Design e Innovation.",
      en: "VANMOTION was officially nominated by CSS Design Awards on August 30, 2026 for Website of the Day and is also competing in the UI Design, UX Design and Innovation Public Vote Awards.",
    },
    url: "https://www.cssdesignawards.com/sites/vanmotion/50065/",
    image: "/reconocimientos/css-design-awards-2026.png",
    alt: "CSS Design Awards Website of the Day Nominee 2026 VANMOTION",
  },
  {
    name: {
      es: "WebsiteAwards.es — Nominada 2026",
      en: "WebsiteAwards.es — Nominee 2026",
    },
    category: {
      es: "E-commerce · Circuito Master",
      en: "E-commerce · Master Circuit",
    },
    description: {
      es: "VANMOTION ha sido seleccionada y publicada como nominada en la convocatoria Mejor Web 2026 de WebsiteAwards.es, dentro de la categoría E-commerce y el circuito Master.",
      en: "VANMOTION has been selected and published as a nominee in the WebsiteAwards.es Best Website 2026 competition, in the E-commerce category and Master circuit.",
    },
    url: "https://www.websiteawards.es/sitios/96e548ac-3e0b-4595-954e-6eb856453a16",
    image: "/reconocimientos/websiteawards-2026.png",
    alt: "WebsiteAwards.es Nominada 2026 VANMOTION",
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

                  <div className="mt-6 flex flex-col items-start gap-3">
                    <a
                      href={award.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {content.official}
                    </a>

                    {award.certificateUrl && (
                      <a
                        href={award.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {content.certificate}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
