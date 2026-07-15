import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

export const dynamic = "force-dynamic";

const translations = {
  es: {
    eyebrow: "Error 404",
    titleFirst: "Esta ruta",
    titleSecond: "no existe.",
    description:
      "La página que buscas ha sido eliminada, ha cambiado de dirección o ya no está disponible.",
    home: "Volver al inicio",
    collection: "Ver vehículos",
    navigationLabel: "Navegación de error",
    footer: "Vehículos · Música · Diseño · Madrid",
  },

  en: {
    eyebrow: "Error 404",
    titleFirst: "This route",
    titleSecond: "does not exist.",
    description:
      "The page you are looking for has been removed, moved or is no longer available.",
    home: "Back to home",
    collection: "View vehicles",
    navigationLabel: "Error navigation",
    footer: "Vehicles · Music · Design · Madrid",
  },
} as const;

export default async function NotFound() {
  const language = await getCurrentLanguage();
  const content = translations[language];

  return (
    <main className="flex min-h-screen flex-col bg-[#080808] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-[76px] w-full max-w-[1600px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-lg font-bold tracking-[0.34em] text-white"
          >
            VANMOTION
          </Link>

          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
            404
          </span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1600px] flex-1 items-center border-x border-white/10 px-6 py-20 lg:px-14">
        <div className="w-full">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-12 bg-white/30" />

            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
              {content.eyebrow}
            </p>
          </div>

          <h1 className="max-w-6xl text-[clamp(58px,10vw,150px)] font-semibold uppercase leading-[0.8] tracking-[-0.075em]">
            {content.titleFirst}
            <br />

            <span className="text-white/20">
              {content.titleSecond}
            </span>
          </h1>

          <p className="mt-10 max-w-xl text-sm leading-7 text-white/45">
            {content.description}
          </p>

          <nav
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            aria-label={content.navigationLabel}
          >
            <Link
              href="/"
              className="flex min-h-14 items-center justify-between border border-white bg-white px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-transparent hover:text-white"
            >
              {content.home}
              <span>→</span>
            </Link>

            <Link
              href="/coleccion"
              className="flex min-h-14 items-center justify-between border border-white/20 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
            >
              {content.collection}
              <span>→</span>
            </Link>
          </nav>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-[1600px] border-x border-t border-white/10">
        <div className="flex flex-col gap-5 px-6 py-8 text-[9px] uppercase tracking-[0.16em] text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-14">
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