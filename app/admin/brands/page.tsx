import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import DeleteBrandButton from "./DeleteBrandButton";
import { createBrand, updateBrand } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const totalVehicles = brands.reduce(
    (total, brand) => total + brand._count.vehicles,
    0,
  );

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            Organización
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-white">
            Marcas
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/50">
            Gestiona las marcas utilizadas en el inventario de vehículos
            VANMOTION.
          </p>
        </div>

        <Link
          href="/admin/vehicles/nuevo"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold !text-black transition hover:bg-white/80"
        >
          + Añadir vehículo
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/40">
            Marcas registradas
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {brands.length}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/40">
            Vehículos asociados
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {totalVehicles}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/40">
            Marcas sin vehículos
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {
              brands.filter(
                (brand) => brand._count.vehicles === 0,
              ).length
            }
          </p>
        </article>
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div className="border-b border-white/10 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">
            Nueva marca
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Registrar una marca
          </h2>

          <p className="mt-2 text-sm text-white/40">
            También se crean automáticamente cuando registras un vehículo
            con una marca nueva.
          </p>
        </div>

        <form
          action={createBrand}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <label className="flex-1">
            <span className="sr-only">Nombre de la marca</span>

            <input
              type="text"
              name="name"
              required
              placeholder="Ejemplo: Ford"
              className="min-h-14 w-full rounded-xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/80"
          >
            Guardar marca
          </button>
        </form>
      </section>

      <div className="mt-8 flex items-center justify-between gap-5 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">
            Listado actual
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Marcas registradas
          </h2>
        </div>

        <Link
          href="/admin/vehicles"
          className="text-sm text-white/50 transition hover:text-white"
        >
          Ver vehículos →
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">
            No hay marcas registradas
          </p>

          <p className="mt-2 text-sm text-white/40">
            Crea la primera marca utilizando el formulario superior.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {brands.map((brand, index) => {
            const updateBrandWithId = updateBrand.bind(
              null,
              brand.id,
            );

            return (
              <article
                key={brand.id}
                className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 lg:grid-cols-[70px_1fr_200px_auto] lg:items-center"
              >
                <div className="text-sm text-white/25">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <form
                  action={updateBrandWithId}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <label className="flex-1">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      Nombre
                    </span>

                    <input
                      type="text"
                      name="name"
                      defaultValue={brand.name}
                      required
                      className="min-h-12 w-full rounded-lg border border-white/10 bg-[#111111] px-4 text-white outline-none transition focus:border-white/50"
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-4 text-xs font-semibold text-white/70 transition hover:bg-white hover:text-black"
                  >
                    Guardar cambios
                  </button>
                </form>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Vehículos
                  </p>

                  <p className="mt-2 text-lg font-semibold text-white">
                    {brand._count.vehicles}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Ruta: /{brand.slug}
                  </p>
                </div>

                <DeleteBrandButton
                  brandId={brand.id}
                  brandName={brand.name}
                  vehicleCount={brand._count.vehicles}
                />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}