import type { Metadata } from "next";

const CANONICAL_URL = "https://www.vanmotion.es/reconocimientos";

export const metadata: Metadata = {
  title: "Reconocimientos | VANMOTION Automotive Culture",
  description:
    "Reconocimientos y nominaciones de VANMOTION. Automotive culture, digital experience, brand identity y visual storytelling.",
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: "Reconocimientos | VANMOTION",
    description:
      "VANMOTION — Automotive Culture. Reconocimientos y nominaciones de diseño digital.",
    url: CANONICAL_URL,
  },
};

const awardsStructuredData = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "VANMOTION — Automotive Culture",
  creator: {
    "@type": "Organization",
    name: "VANMOTION",
    url: "https://www.vanmotion.es",
  },
  award: [
    "WD Awards Nominee 2026",
  ],
  about: [
    "Automotive culture",
    "Digital experience",
    "Brand identity",
    "Visual storytelling",
  ],
  sameAs: [
    "https://wdawards.com/web/vanmotion-automotive-culture",
  ],
};

export default function ReconocimientosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(awardsStructuredData),
        }}
      />

      <main style={{ padding: "80px 24px", maxWidth: "900px", margin: "auto" }}>
        <p style={{ letterSpacing: "0.2em" }}>
          RECONOCIMIENTOS
        </p>

        <h1>
          VANMOTION — Automotive Culture
        </h1>

        <p>
          VANMOTION es una experiencia digital que une cultura del automóvil,
          música original, streetwear e identidad visual.
        </p>

        <section>
          <h2>WD Awards Nominee 2026</h2>

          <p>
            Reconocimiento internacional como proyecto nominado en WD Awards
            dentro de la categoría Automotive Culture.
          </p>

          <ul>
            <li>Automotive culture</li>
            <li>Digital experience</li>
            <li>Brand identity</li>
            <li>Visual storytelling</li>
          </ul>

          <a
            href="https://wdawards.com/web/vanmotion-automotive-culture"
            target="_blank"
            rel="noreferrer"
          >
            Ver ficha oficial WD Awards →
          </a>
        </section>
      </main>
    </>
  );
}
