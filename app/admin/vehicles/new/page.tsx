import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { createVehicle } from "@/actions/vehicleActions";

export default async function NewVehiclePage() {
  const brands = await prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-white/50">
              Panel de administración
            </p>

            <h1 className="text-4xl font-bold">Nuevo vehículo</h1>

            <p className="mt-3 text-white/60">
              Añade un vehículo al catálogo de Vanmotion.
            </p>
          </div>

          <Link
            href="/admin/vehicles"
            className="w-fit rounded-xl border border-white/15 px-5 py-3 text-sm font-medium transition hover:bg-white hover:text-black"
          >
            Volver a vehículos
          </Link>
        </div>

        {brands.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold">
              No existen marcas
            </h2>

            <p className="mt-2 text-white/60">
              Primero debes crear al menos una marca.
            </p>

            <Link
              href="/admin/brands"
              className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black"
            >
              Ir a marcas
            </Link>
          </div>
        ) : (
          <form
            action={createVehicle}
            className="space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10"
          >
            <section>
              <h2 className="mb-6 text-xl font-semibold">
                Información general
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="brandId"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Marca *
                  </label>

                  <select
                    id="brandId"
                    name="brandId"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  >
                    <option value="" disabled>
                      Selecciona una marca
                    </option>

                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="model"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Modelo *
                  </label>

                  <input
                    id="model"
                    name="model"
                    type="text"
                    required
                    placeholder="Sprinter"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="version"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Versión
                  </label>

                  <input
                    id="version"
                    name="version"
                    type="text"
                    placeholder="516 CDI"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Año *
                  </label>

                  <input
                    id="year"
                    name="year"
                    type="number"
                    required
                    min="1900"
                    max="2100"
                    step="1"
                    placeholder="2020"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mileage"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Kilómetros *
                  </label>

                  <input
                    id="mileage"
                    name="mileage"
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="85000"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="color"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Color
                  </label>

                  <input
                    id="color"
                    name="color"
                    type="text"
                    placeholder="Negro"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-white/10 pt-8">
              <h2 className="mb-6 text-xl font-semibold">
                Información técnica
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="fuel"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Combustible *
                  </label>

                  <select
                    id="fuel"
                    name="fuel"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  >
                    <option value="" disabled>
                      Selecciona el combustible
                    </option>

                    <option value="Diesel">Diésel</option>
                    <option value="Gasoline">Gasolina</option>
                    <option value="Hybrid">Híbrido</option>
                    <option value="Electric">Eléctrico</option>
                    <option value="LPG">GLP</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="transmission"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Transmisión *
                  </label>

                  <select
                    id="transmission"
                    name="transmission"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  >
                    <option value="" disabled>
                      Selecciona la transmisión
                    </option>

                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automática</option>
                    <option value="Semi-automatic">
                      Semiautomática
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="drivetrain"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Tracción
                  </label>

                  <select
                    id="drivetrain"
                    name="drivetrain"
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  >
                    <option value="">Sin especificar</option>
                    <option value="FWD">Delantera</option>
                    <option value="RWD">Trasera</option>
                    <option value="AWD">Integral AWD</option>
                    <option value="4WD">4x4</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="engine"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Motor
                  </label>

                  <input
                    id="engine"
                    name="engine"
                    type="text"
                    placeholder="2.2 CDI"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="power"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Potencia en CV
                  </label>

                  <input
                    id="power"
                    name="power"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="190"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />

                  <p className="mt-2 text-xs text-white/40">
                    Introduce solamente el número, por ejemplo: 190.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t border-white/10 pt-8">
              <h2 className="mb-6 text-xl font-semibold">
                Precio y publicación
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Precio *
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="25000"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Estado *
                  </label>

                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue="AVAILABLE"
                    className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="SOLD">Vendido</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm text-white/60"
                >
                  URL de la imagen
                </label>

                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://ejemplo.com/vehiculo.jpg"
                  className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm text-white/60"
                >
                  Descripción
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={7}
                  placeholder="Describe el estado, equipamiento y características del vehículo..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black p-4 text-white"
                />
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  value="true"
                  className="h-5 w-5"
                />

                <span className="text-sm text-white/70">
                  Mostrar como vehículo destacado
                </span>
              </label>
            </section>

            <div className="flex flex-col-reverse gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-end">
              <Link
                href="/admin/vehicles"
                className="rounded-xl border border-white/15 px-6 py-3 text-center font-semibold transition hover:bg-white/10"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-white/80"
              >
                Crear vehículo
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}