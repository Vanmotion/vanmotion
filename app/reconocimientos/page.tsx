import type { Metadata } from "next";
import Image from "next/image";
import { getCurrentLanguage } from "@/app/lib/language";
import styles from "./reconocimientos.module.css";

export const metadata: Metadata = {
  title: "Reconocimientos | VANMOTION Automotive Culture",
  description:
    "Reconocimientos digitales de VANMOTION: CSS Design Awards, WD Awards, CSS Nectar, CSS Winner y WebsiteAwards.es. Proyecto de cultura automotriz, música y streetwear nacido en Madrid.",
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
      "Reconocimientos digitales de VANMOTION: CSS Design Awards, WD Awards, CSS Nectar, CSS Winner y WebsiteAwards.es. Proyecto de cultura automotriz, música y streetwear nacido en Madrid.",
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
      es: "CSS Design Awards — Special Kudos 2026",
      en: "CSS Design Awards — Special Kudos 2026",
    },
    category: {
      es: "Special Kudos",
      en: "Special Kudos",
    },
    description: {
      es: "VANMOTION recibió el 3 de septiembre de 2026 el reconocimiento Special Kudos de CSS Design Awards.",
      en: "VANMOTION received the CSS Design Awards Special Kudos on September 3, 2026.",
    },
    url: "https://www.cssdesignawards.com/sites/vanmotion/50065/",
    certificateUrl: "/reconocimientos/CSSDA-Special-Kudos-VANMOTION-2026.pdf",
    image: "/reconocimientos/css-design-awards-2026.png",
    alt: "CSS Design Awards Special Kudos 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Design Awards — Best UI Design 2026",
      en: "CSS Design Awards — Best UI Design 2026",
    },
    category: {
      es: "Best UI Design · Ganadora",
      en: "Best UI Design · Winner",
    },
    description: {
      es: "VANMOTION recibió el premio Best UI Design de CSS Design Awards el 3 de septiembre de 2026.",
      en: "VANMOTION received the CSS Design Awards Best UI Design award on September 3, 2026.",
    },
    url: "https://www.cssdesignawards.com/sites/vanmotion/50065/",
    certificateUrl: "/reconocimientos/cssda-ui-VANMOTION.pdf",
    image: "/reconocimientos/cssda-best-ui-purple.svg",
    alt: "CSS Design Awards Best UI Design 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Design Awards — Best UX Design 2026",
      en: "CSS Design Awards — Best UX Design 2026",
    },
    category: {
      es: "Best UX Design · Ganadora",
      en: "Best UX Design · Winner",
    },
    description: {
      es: "VANMOTION recibió el premio Best UX Design de CSS Design Awards el 3 de septiembre de 2026.",
      en: "VANMOTION received the CSS Design Awards Best UX Design award on September 3, 2026.",
    },
    url: "https://www.cssdesignawards.com/sites/vanmotion/50065/",
    certificateUrl: "/reconocimientos/cssda-ux-VANMOTION.pdf",
    image: "/reconocimientos/cssda-best-ux-orange.svg",
    alt: "CSS Design Awards Best UX Design 2026 VANMOTION",
  },
  {
    name: {
      es: "CSS Design Awards — Best Innovation 2026",
      en: "CSS Design Awards — Best Innovation 2026",
    },
    category: {
      es: "Best Innovation · Ganadora",
      en: "Best Innovation · Winner",
    },
    description: {
      es: "VANMOTION recibió el premio Best Innovation de CSS Design Awards el 3 de septiembre de 2026.",
      en: "VANMOTION received the CSS Design Awards Best Innovation award on September 3, 2026.",
    },
    url: "https://www.cssdesignawards.com/sites/vanmotion/50065/",
    certificateUrl: "/reconocimientos/cssda-inn-VANMOTION.pdf",
    image: "/reconocimientos/cssda-best-inn-green.svg",
    alt: "CSS Design Awards Best Innovation 2026 VANMOTION",
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

  const certificates = [
    awards[3], // CSSDA Special Kudos
    awards[4], // CSSDA Best UI
    awards[5], // CSSDA Best UX
    awards[6], // CSSDA Best Innovation
    awards[1], // CSS Nectar Winner
    awards[0], // WD Awards Nominee
    awards[2], // CSS Winner Nominee
  ].filter(
    (award): award is (typeof awards)[number] & {
      certificateUrl: string;
    } => Boolean(award.certificateUrl),
  );

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

      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{content.label}</p>

            <h1>
              VANMOTION
              <span>Recognition Archive</span>
            </h1>
          </div>

          <p className={styles.counter}>
            2026 · {String(certificates.length).padStart(2, "0")}
          </p>
        </header>

        <section
          className={styles.wall}
          aria-label={content.label}
        >
          {certificates.map((award, index) => (
            <article
              key={award.name[language]}
              className={`${styles.certificate} ${
                index === 0 ? styles.featured : ""
              }`}
            >
              <div className={styles.document}>
                <Image
                  src={award.certificateUrl.replace(/\.pdf$/i, ".png")}
                  alt={award.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  priority={index < 4}
                  className={styles.certificatePreview}
                />
              </div>

              <footer className={styles.certificateMeta}>
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <strong>{award.name[language]}</strong>
                  <small>{award.category[language]}</small>
                </div>


              </footer>
            </article>
          ))}
        </section>

        <footer className={styles.footer}>
          <span>VANMOTION</span>
          <span>MADRID · 2026</span>
        </footer>
      </main>
    </>
  );
}
