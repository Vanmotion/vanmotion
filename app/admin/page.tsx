import Link from "next/link";

import { getVehicles } from "@/repositories/vehicleRepository";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-light tracking-wide">
            Vehículos
          </h1>

          <p className="mt-2 text-white/50">
            Gestiona el catálogo de Vanmotion.
          </p>
        </div>

        <Link
          href="/admin/vehicles/new"
          className="rounded-lg border border-white/20 px-5 py-3 transition hover:bg-white hover:text-black"
        >
          + Nuevo vehículo
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left">
              <th className="px-6 py-4 font-medium">Marca</th>
              <th className="px-6 py-4 font-medium">Modelo</th>
              <th className="px-6 py-4 font-medium">Año</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 font-medium">Estado</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-white/40"
                >
                  No hay vehículos registrados.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-t border-white/5 transition hover:bg-white/5"
                >
                  <td className="px-6 py-5">
                    {vehicle.brand.name}
                  </td>

                  <td className="px-6 py-5">
                    {vehicle.model}
                  </td>

                  <td className="px-6 py-5">
                    {vehicle.year}
                  </td>

                  <td className="px-6 py-5">
                    {Number(vehicle.price).toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}