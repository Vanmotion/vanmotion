import { getBrands } from "@/repositories/brandRepository";

export default async function NewVehiclePage() {
  const brands = await getBrands();

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="text-5xl font-light tracking-wide">
          Nuevo vehículo
        </h1>

        <p className="mt-2 text-white/50">
          Añade un vehículo premium al catálogo Vanmotion.
        </p>
      </div>

      <form className="space-y-10">

        {/* INFORMACIÓN GENERAL */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-2xl mb-8">Información general</h2>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 text-sm text-white/60">
                Marca
              </label>

              <select className="w-full rounded-xl bg-black border border-white/10 p-4">
                <option>Seleccionar marca</option>

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-white/60">
                Modelo
              </label>

              <input
                className="w-full rounded-xl bg-black border border-white/10 p-4"
                placeholder="Sprinter 319 CDI"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-white/60">
                Versión
              </label>

              <input
                className="w-full rounded-xl bg-black border border-white/10 p-4"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-white/60">
                Año
              </label>

              <input
                type="number"
                className="w-full rounded-xl bg-black border border-white/10 p-4"
              />
            </div>

          </div>
        </section>

        {/* PRECIO */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-2xl mb-8">
            Precio
          </h2>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 text-sm text-white/60">
                Precio (€)
              </label>

              <input
                type="number"
                className="w-full rounded-xl bg-black border border-white/10 p-4"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-white/60">
                Kilómetros
              </label>

              <input
                type="number"
                className="w-full rounded-xl bg-black border border-white/10 p-4"
              />
            </div>

          </div>
        </section>

        {/* BOTONES */}

        <div className="flex gap-4">

          <button
            type="submit"
            className="rounded-xl bg-white text-black px-8 py-4 font-semibold hover:bg-neutral-200 transition"
          >
            Guardar vehículo
          </button>

          <button
            type="button"
            className="rounded-xl border border-white/20 px-8 py-4 hover:bg-white/10 transition"
          >
            Cancelar
          </button>

        </div>

      </form>
    </div>
  );
}