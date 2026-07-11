import { createBrand } from "@/actions/brandActions";
import { getBrands } from "@/repositories/brandRepository";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl font-light">Marcas</h1>

        <p className="mt-2 text-white/50">
          Gestiona las marcas disponibles.
        </p>
      </div>

      <form
        action={createBrand}
        className="flex gap-4"
      >
        <input
          name="name"
          placeholder="Mercedes-Benz"
          className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-3"
        />

        <button
          className="rounded-xl bg-white px-6 py-3 text-black"
        >
          Crear
        </button>
      </form>

      <div className="rounded-xl border border-white/10">
        {brands.length === 0 ? (
          <div className="p-8 text-white/40">
            No hay marcas creadas.
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="border-b border-white/10 p-6 last:border-none"
            >
              {brand.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}