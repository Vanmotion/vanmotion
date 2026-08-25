import type { Metadata } from "next";

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
};

const awards = [
  {
    name: "WD Awards Nominee 2026",
    category: "Automotive Culture",
    description:
      "Reconocimiento internacional como proyecto nominado por su experiencia digital, identidad visual y narrativa alrededor de la cultura del automóvil.",
    url: "https://wdawards.com/web/vanmotion-automotive-culture",
  },
  {
    name: "CSS Nectar",
    category: "Site of the Day",
    description:
      "Reconocimiento dentro de una plataforma internacional de inspiración y selección de diseño web.",
    url: "https://cssnectar.com",
  },
  {
    name: "CSS Winner",
    category: "Website Recognition",
    description:
      "Proyecto seleccionado dentro del ecosistema internacional de diseño y experiencias digitales.",
    url: "https://www.csswinner.com",
  },
];

export default function ReconocimientosPage() {
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
        <section className="max-w-4xl mx-auto">

          <p className="text-xs tracking-[0.3em] uppercase opacity-70">
            Reconocimientos
          </p>

          <h1 className="text-5xl font-bold mt-6">
            VANMOTION — Automotive Culture
          </h1>

          <p className="mt-6 text-lg opacity-90 leading-relaxed">
            VANMOTION es una experiencia digital nacida en Madrid que une
            cultura automotriz, música original, streetwear e identidad visual.
          </p>

          <div className="mt-16 space-y-8">
            {awards.map((award) => (
              <article
                key={award.name}
                className="border border-white/20 p-8 rounded-xl"
              >
                <h2 className="text-2xl font-semibold">
                  {award.name}
                </h2>

                <p className="mt-2 uppercase text-xs tracking-widest opacity-60">
                  {award.category}
                </p>

                <p className="mt-4 opacity-80">
                  {award.description}
                </p>

                <a
                  href={award.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 underline"
                >
                  Ver reconocimiento oficial →
                </a>
              </article>
            ))}
          </div>

        </section>
      </main>
    </>
  );
}
