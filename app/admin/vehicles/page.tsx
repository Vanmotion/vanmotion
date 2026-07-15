import Link from "next/link";

import { prisma } from "@/app/lib/prisma";
import DeleteVehicleButton from "./DeleteVehicleButton";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

const statusClasses: Record<string, string> = {
  AVAILABLE: "border-green-500/20 bg-green-500/10 text-green-400",
  RESERVED: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  SOLD: "border-red-500/20 bg-red-500/10 text-red-400",
};

function formatPrice(price: unknown): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      brand: true,

      images: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        take: 1,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const totalVehicles = vehicles.length;

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "AVAILABLE",
  ).length;

  const reservedVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "RESERVED",
  ).length;

  const soldVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "SOLD",
  ).length;

  const statistics = [
    {
      label: "Vehículos totales",
      value: totalVehicles,
    },
    {
      label: "Disponibles",
      value: availableVehicles,
    },
    {
      label: "Reservados",
      value: reservedVehicles,
    },
    {
      label: "Vendidos",
      value: soldVehicles,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            Catálogo
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-white">
            Vehículos
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Gestiona el inventario, las fotografías, la información y el
            estado de los vehículos de VANMOTION.
          </p>
        </div>

        <Link
          href="/admin/vehicles/nuevo"
          className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-black transition hover:bg-white/80"
        >
          + Nuevo vehículo
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm text-white/40">{item.label}</p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-white">Inventario actual</h2>

          <p className="mt-1 text-sm text-white/40">
            {totalVehicles === 1
              ? "1 vehículo registrado"
              : `${totalVehicles} vehículos registrados`}
          </p>
        </div>

        <Link
          href="/coleccion"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          Ver catálogo público
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl">
            +
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No hay vehículos registrados
          </h2>

          <p className="mt-2 text-white/40">
            Añade el primer vehículo al catálogo de VANMOTION.
          </p>

          <Link
            href="/admin/vehicles/nuevo"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-black transition hover:bg-white/80"
          >
            Crear vehículo
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Vehículo
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Año
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Kilómetros
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Precio
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/40">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => {
                  const primaryImage = vehicle.images[0];

                  const vehicleName = [
                    vehicle.brand.name,
                    vehicle.model,
                    vehicle.version,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const statusLabel =
                    statusLabels[vehicle.status] ?? vehicle.status;

                  const statusClass =
                    statusClasses[vehicle.status] ??
                    "border-white/10 bg-white/5 text-white/50";

                  return (
                    <tr
                      key={vehicle.id}
                      className="border-b border-white/10 transition last:border-b-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          {primaryImage ? (
                            <Link
                              href={`/coleccion/${vehicle.id}`}
                              className="block h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >
                              <img
                                src={primaryImage.url}
                                alt={primaryImage.alt ?? vehicleName}
                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              />
                            </Link>
                          ) : (
                            <Link
                              href={`/admin/vehicles/${vehicle.id}/edit`}
                              className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-center text-xs text-white/30 transition hover:border-white/30 hover:text-white/60"
                            >
                              Añadir foto
                            </Link>
                          )}

                          <div className="min-w-0">
                            <Link
                              href={`/coleccion/${vehicle.id}`}
                              className="font-semibold text-white transition hover:text-white/70"
                            >
                              {vehicle.brand.name} {vehicle.model}
                            </Link>

                            {vehicle.version && (
                              <p className="mt-1 text-sm text-white/40">
                                {vehicle.version}
                              </p>
                            )}

                            {vehicle.featured && (
                              <span className="mt-2 inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400">
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-white/70">
                        {vehicle.year}
                      </td>

                      <td className="px-5 py-5 text-sm text-white/70">
                        {vehicle.mileage.toLocaleString("es-ES")} km
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {formatPrice(vehicle.price)}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/coleccion/${vehicle.id}`}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                          >
                            Ficha pública
                          </Link>

                          <Link
                            href={`/admin/vehicles/${vehicle.id}/edit`}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                          >
                            Editar
                          </Link>

                          <DeleteVehicleButton
                            vehicleId={vehicle.id}
                            vehicleName={vehicleName}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}