import Link from "next/link";
import { getVehicles } from "@/repositories/vehicleRepository";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
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
          className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition"
        >
          + Nuevo vehículo
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-4">Marca</th>
              <th className="text-left p-4">Modelo</th>
              <th className="text-left p-4">Año</th>
              <th className="text-left p-4">Precio</th>
              <th className="text-left p-4">Estado</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-white/40"
                >
                  No hay vehículos registrados.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-4">{vehicle.brand.name}</td>
                  <td className="p-4">{vehicle.model}</td>
                  <td className="p-4">{vehicle.year}</td>
                  <td className="p-4">
                    {Number(vehicle.price).toLocaleString("es-ES")} €
                  </td>
                  <td className="p-4">{vehicle.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}