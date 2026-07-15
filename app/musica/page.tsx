import type { Metadata } from "next";
import Link from "next/link";

import type { Language } from "@/app/language";
import { getCurrentLanguage } from "@/app/lib/language";

import DatabaseMusicPlayer from "./DatabaseMusicPlayer";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    metadataTitle: "Música",
    metadataDescription:
      "Escucha los temas oficiales de VANMOTION. Música propia, trabajo real e identidad.",

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
      eyebrow: "VANMOTION Studio · Madrid",
      first: "Música",
      second: "que deja",
      third: "huella.",
      description:
        "Temas creados desde la verdad, la constancia y muchas horas de trabajo. Cada canción forma parte del universo VANMOTION.",
    },

    universe: {
      eyebrow: "VANMOTION Music",
      titleFirst: "Sonido propio.",
      titleSecond: "Identidad real.",
      background: "Real",
      foreground: "Sound",
    },

    discography: {
      eyebrow: "Discografía oficial",
      title: "VANMOTION Sessions",
      description:
        "Selecciona un tema, controla el volumen y escucha la música directamente dentro de la web.",
    },

    values: [
      {
        number: "01",
        title: "Música propia",
        description:
          "Producción original creada dentro del universo creativo de VANMOTION.",
      },
      {
        number: "02",
        title: "Sin atajos",
        description:
          "Cada tema representa constancia, aprendizaje y trabajo real.",
      },
      {
        number: "03",
        title: "Todo conecta",
        description:
          "Vehículos, producción musical, diseño y movimiento unidos bajo una misma marca.",
      },
    ],

    closing: {
      eyebrow: "VANMOTION · Madrid",
      first: "Trabajo real.",
      second: "Movimiento real.",
      contact: "Contactar",
    },

    footer: "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    metadataTitle: "Music",
    metadataDescription:
      "Listen to the official VANMOTION tracks. Original music, real work and identity.",

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
      eyebrow: "VANMOTION Studio · Madrid",
      first: "Music",
      second: "that leaves",
      third: "a mark.",
      description:
        "Tracks created from truth, consistency and countless hours of work. Every song is part of the VANMOTION universe.",
    },

    universe: {
      eyebrow: "VANMOTION Music",
      titleFirst: "Original sound.",
      titleSecond: "Real identity.",
      background: "Real",
      foreground: "Sound",
    },

    discography: {
      eyebrow: "Official discography",
      title: "VANMOTION Sessions",
      description:
        "Choose a track, control the volume and listen to the music directly on the website.",
    },

    values: [
      {
        number: "01",
        title: "Original music",
        description:
          "Original production created inside the VANMOTION creative universe.",
      },
      {
        number: "02",
        title: "No shortcuts",
        description:
          "Every track represents consistency, learning and real work.",
      },
      {
        number: "03",
        title: "Everything connects",
        description:
          "Vehicles, music production, design and movement united under one brand.",
      },
    ],

    closing: {
      eyebrow: "VANMOTION · Madrid",
      first: "Real work.",
      second: "Real movement.",
      contact: "Get in touch",
    },

    footer: "Vehicles · Music · Design · Madrid",
  },
} satisfies Record<Language, object>;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
  };
}

export default async function MusicPage() {
  const language = await getCurrentLanguage();
  const content = translations[language];

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
    <main className="min-h-screen bg-[#080808] text-white">
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
              const active = item.href === "/musica";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
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
            <span>→</span>
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

        <div className="relative mx-auto grid min-h-[520px] w-full max-w-[1600px] border-x border-white/10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-end border-b border-white/10 px-6 py-16 lg:border-b-0 lg:border-r lg:px-14 lg:py-20">
            <div className="mb-9 flex items-center gap-4">
              <span className="h-px w-12 bg-white/30" />

              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                {content.hero.eyebrow}
              </p>
            </div>

            <h1 className="max-w-4xl text-[clamp(64px,9vw,150px)] font-semibold uppercase leading-[0.78] tracking-[-0.075em]">
              {content.hero.first}
              <br />

              <span className="text-white/20">
                {content.hero.second}
              </span>

              <br />
              {content.hero.third}
            </h1>

            <p className="mt-10 max-w-2xl text-sm leading-7 text-white/45">
              {content.hero.description}
            </p>
          </div>

          <div className="relative flex min-h-[390px] flex-col justify-between bg-white/[0.015] p-6 lg:p-14">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-white/30">
                  {content.universe.eyebrow}
                </p>

                <h2 className="mt-6 text-3xl font-medium leading-tight md:text-5xl">
                  {content.universe.titleFirst}
                  <br />
                  {content.universe.titleSecond}
                </h2>
              </div>

              <span className="rounded-full border border-white/15 px-5 py-3 text-[9px] font-bold tracking-[0.18em] text-white/65">
                2026
              </span>
            </div>

            <div className="mt-20">
              <p className="text-[clamp(70px,10vw,145px)] font-bold uppercase leading-[0.75] tracking-[-0.07em] text-white/[0.055]">
                {content.universe.background}
              </p>

              <p className="text-[clamp(60px,8vw,120px)] font-semibold uppercase leading-[0.8] tracking-[-0.07em]">
                {content.universe.foreground}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] border-x border-white/10">
        <div className="border-b border-white/10 px-6 py-12 lg:px-14">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
                {content.discography.eyebrow}
              </p>

              <h2 className="mt-4 text-4xl font-semibold uppercase tracking-[-0.045em] md:text-6xl">
                {content.discography.title}
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/40">
              {content.discography.description}
            </p>
          </div>
        </div>

        <DatabaseMusicPlayer language={language} />
      </section>

      <section className="mx-auto grid w-full max-w-[1600px] border-x border-b border-white/10 md:grid-cols-3">
        {content.values.map((value, index) => (
          <article
            key={value.number}
            className={`min-h-56 p-8 lg:p-12 ${
              index < 2
                ? "border-b border-white/10 md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <span className="text-[9px] font-bold tracking-[0.18em] text-white/25">
              {value.number}
            </span>

            <h3 className="mt-12 text-xl font-semibold">
              {value.title}
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {value.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1600px] border-x border-b border-white/10 px-6 py-16 lg:px-14 lg:py-24">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
              {content.closing.eyebrow}
            </p>

            <h2 className="mt-6 max-w-5xl text-[clamp(46px,7vw,105px)] font-semibold uppercase leading-[0.83] tracking-[-0.065em]">
              {content.closing.first}
              <br />
              {content.closing.second}
            </h2>
          </div>

          <Link
            href="/contacto"
            className="flex min-h-14 min-w-60 items-center justify-between border border-white/20 px-6 text-[9px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
          >
            {content.closing.contact}
            <span>→</span>
          </Link>
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