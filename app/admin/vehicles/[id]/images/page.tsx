import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  addVehicleImage,
  deleteVehicleImage,
  setPrimaryVehicleImage,
} from "@/actions/vehicleActions";
import { prisma } from "@/app/lib/prisma";

interface VehicleImagesPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    subida?: string;
    principal?: string;
    eliminada?: string;
  }>;
}

export default async function VehicleImagesPage({
  params,
  searchParams,
}: VehicleImagesPageProps) {
  const [
    { id },
    {
      subida,
      principal,
      eliminada,
    },
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const vehicle =
    await prisma.vehicle.findUnique({
      where: {
        id,
      },

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
        },
      },
    });

  if (!vehicle) {
    notFound();
  }

  const vehicleName = [
    vehicle.brand.name,
    vehicle.model,
    vehicle.version,
  ]
    .filter(Boolean)
    .join(" ");

  const primaryImage =
    vehicle.images[0];

  const successMessage =
    subida === "1"
      ? "La fotografía se ha subido correctamente."
      : principal === "1"
        ? "La imagen principal se ha actualizado."
        : eliminada === "1"
          ? "La fotografía se ha eliminado."
          : null;

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Link
            href={`/admin/vehicles/${vehicle.id}`}
            className="text-sm text-white/40 transition hover:text-white"
          >
            ← Volver a la ficha
          </Link>

          <p className="mt-7 text-sm uppercase tracking-[0.3em] text-white/40">
            Galería del vehículo
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-white">
            Fotografías
          </h1>

          <p className="mt-3 text-white/50">
            Gestiona las imágenes de {vehicleName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/coleccion/${vehicle.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Ver página pública
          </Link>

          <Link
            href={`/admin/vehicles/${vehicle.id}/edit`}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Editar vehículo
          </Link>
        </div>
      </div>

      {successMessage && (
        <div
          className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-200"
          role="status"
        >
          {successMessage}
        </div>
      )}

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-6">
          <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {primaryImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt ?? vehicleName}
                  className="aspect-[4/3] w-full object-cover"
                />

                <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  Imagen principal
                </span>
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center bg-white/[0.02] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/40">
                  +
                </div>

                <p className="mt-4 text-sm text-white/40">
                  Este vehículo todavía no tiene fotografías.
                </p>
              </div>
            )}

            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">
                Vehículo
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {vehicle.brand.name} {vehicle.model}
              </h2>

              {vehicle.version && (
                <p className="mt-2 text-sm text-white/40">
                  {vehicle.version}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm text-white/40">
                  Fotografías
                </span>

                <span className="text-sm font-medium text-white">
                  {vehicle.images.length}
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">
              Recomendaciones
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-6 text-white/40">
              <p>
                Utiliza imágenes horizontales, claras y con buena
                iluminación.
              </p>

              <p>
                La primera imagen será la fotografía principal del
                vehículo.
              </p>

              <p>
                Formatos permitidos: JPG, PNG y WebP.
              </p>

              <p>
                Tamaño máximo por fotografía: 8 MB.
              </p>
            </div>
          </article>
        </aside>

        <div className="space-y-6">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <div className="border-b border-white/10 pb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">
                Nueva imagen
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Subir fotografía
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Selecciona una imagen directamente desde la carpeta
                Descargas de tu Mac.
              </p>
            </div>

            <form
              action={addVehicleImage}
              encType="multipart/form-data"
              className="mt-7 space-y-6"
            >
              <input
                type="hidden"
                name="vehicleId"
                value={vehicle.id}
              />

              <Field label="Archivo de imagen *">
                <input
                  id="image"
                  name="image"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  className={`${inputClasses} cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black`}
                />
              </Field>

              <Field label="Descripción de la imagen">
                <input
                  id="alt"
                  name="alt"
                  type="text"
                  placeholder="Ejemplo: vista frontal del vehículo"
                  className={inputClasses}
                />
              </Field>

              <div className="flex justify-end border-t border-white/10 pt-6">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold !text-black transition hover:bg-white/80"
                >
                  Subir fotografía
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>

      <article className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-7 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Contenido visual
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Galería
            </h2>
          </div>

          <p className="text-sm text-white/40">
            {vehicle.images.length}{" "}
            {vehicle.images.length === 1
              ? "fotografía"
              : "fotografías"}
          </p>
        </div>

        {vehicle.images.length === 0 ? (
          <div className="px-7 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/40">
              +
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No hay fotografías
            </h3>

            <p className="mt-2 text-sm text-white/40">
              Añade la primera imagen utilizando el formulario
              superior.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 p-7 sm:grid-cols-2 xl:grid-cols-3">
            {vehicle.images.map((image, index) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
              >
                <div className="group relative aspect-[4/3] overflow-hidden bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt ?? vehicleName}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                  <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white/70 backdrop-blur">
                    Foto {index + 1}
                  </span>

                  {index === 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold !text-black">
                      Principal
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="min-h-10 text-sm leading-5 text-white/50">
                    {image.alt || "Sin descripción"}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                    {index !== 0 && (
                      <form action={setPrimaryVehicleImage}>
                        <input
                          type="hidden"
                          name="imageId"
                          value={image.id}
                        />

                        <button
                          type="submit"
                          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white hover:!text-black"
                        >
                          Hacer principal
                        </button>
                      </form>
                    )}

                    <form action={deleteVehicleImage}>
                      <input
                        type="hidden"
                        name="imageId"
                        value={image.id}
                      />

                      <button
                        type="submit"
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-black/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/60">
        {label}
      </span>

      {children}
    </label>
  );
}