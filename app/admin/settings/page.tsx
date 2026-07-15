import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import { saveSiteSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: {
      id: "main",
    },
  });

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            Administración
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-white">
            Configuración
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/50">
            Gestiona la información pública y los datos de contacto de
            VANMOTION.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-white/60 transition hover:bg-white hover:text-black"
        >
          Ver página pública →
        </Link>
      </div>

      <form
        action={saveSiteSettings}
        className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
      >
        <section className="p-6 sm:p-8">
          <div className="grid gap-5 border-b border-white/10 pb-7 sm:grid-cols-[60px_1fr]">
            <span className="text-sm text-white/25">
              01
            </span>

            <div>
              <h2 className="text-2xl font-semibold text-white">
                Identidad del negocio
              </h2>

              <p className="mt-2 text-sm leading-7 text-white/40">
                Nombre comercial y datos principales de la empresa.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Nombre comercial *
              </span>

              <input
                type="text"
                name="businessName"
                defaultValue={
                  settings?.businessName ?? "VANMOTION"
                }
                required
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Correo electrónico
              </span>

              <input
                type="email"
                name="email"
                defaultValue={settings?.email ?? ""}
                placeholder="contacto@vanmotion.es"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Teléfono
              </span>

              <input
                type="text"
                name="phone"
                defaultValue={settings?.phone ?? ""}
                placeholder="+34 600 000 000"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                WhatsApp
              </span>

              <input
                type="text"
                name="whatsapp"
                defaultValue={settings?.whatsapp ?? ""}
                placeholder="+34 600 000 000"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-white/10 p-6 sm:p-8">
          <div className="grid gap-5 border-b border-white/10 pb-7 sm:grid-cols-[60px_1fr]">
            <span className="text-sm text-white/25">
              02
            </span>

            <div>
              <h2 className="text-2xl font-semibold text-white">
                Ubicación
              </h2>

              <p className="mt-2 text-sm leading-7 text-white/40">
                Dirección pública de las instalaciones de VANMOTION.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-3 md:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Dirección
              </span>

              <input
                type="text"
                name="address"
                defaultValue={settings?.address ?? ""}
                placeholder="Calle, número y nave"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Ciudad
              </span>

              <input
                type="text"
                name="city"
                defaultValue={
                  settings?.city ?? "Mejorada del Campo"
                }
                placeholder="Mejorada del Campo"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Código postal
              </span>

              <input
                type="text"
                name="postalCode"
                defaultValue={settings?.postalCode ?? ""}
                placeholder="28840"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3 md:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Horario de atención
              </span>

              <textarea
                name="openingHours"
                rows={4}
                defaultValue={settings?.openingHours ?? ""}
                placeholder={`Lunes a viernes: 09:00–18:00\nSábados: con cita previa`}
                className="rounded-xl border border-white/10 bg-[#111111] p-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-white/10 p-6 sm:p-8">
          <div className="grid gap-5 border-b border-white/10 pb-7 sm:grid-cols-[60px_1fr]">
            <span className="text-sm text-white/25">
              03
            </span>

            <div>
              <h2 className="text-2xl font-semibold text-white">
                Redes sociales
              </h2>

              <p className="mt-2 text-sm leading-7 text-white/40">
                Enlaces que aparecerán posteriormente en la web pública.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Instagram
              </span>

              <input
                type="text"
                name="instagram"
                defaultValue={settings?.instagram ?? ""}
                placeholder="https://instagram.com/vanmotion"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                YouTube
              </span>

              <input
                type="text"
                name="youtube"
                defaultValue={settings?.youtube ?? ""}
                placeholder="https://youtube.com/@vanmotion"
                className="min-h-14 rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col justify-between gap-4 border-t border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:p-8">
          <p className="text-sm text-white/35">
            Los datos se guardarán en PostgreSQL.
          </p>

          <button
            type="submit"
            className="inline-flex min-h-14 items-center justify-center gap-10 rounded-xl bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/80"
          >
            Guardar configuración
            <span>→</span>
          </button>
        </div>
      </form>
    </section>
  );
}