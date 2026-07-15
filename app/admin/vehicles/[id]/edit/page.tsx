import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

import { updateVehicle } from "./actions";
import DirectVehicleImageUpload from "./DirectVehicleImageUpload";

export const dynamic = "force-dynamic";

type EditVehiclePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SelectOption = {
  value: string;
  label: string;
};

const fuelOptions: SelectOption[] = [
  {
    value: "DIESEL",
    label: "Diésel",
  },
  {
    value: "GASOLINE",
    label: "Gasolina",
  },
  {
    value: "HYBRID",
    label: "Híbrido",
  },
  {
    value: "PLUG_IN_HYBRID",
    label: "Híbrido enchufable",
  },
  {
    value: "ELECTRIC",
    label: "Eléctrico",
  },
  {
    value: "LPG",
    label: "GLP",
  },
];

const transmissionOptions: SelectOption[] = [
  {
    value: "MANUAL",
    label: "Manual",
  },
  {
    value: "AUTOMATIC",
    label: "Automática",
  },
];

const drivetrainOptions: SelectOption[] = [
  {
    value: "FRONT",
    label: "Delantera",
  },
  {
    value: "REAR",
    label: "Trasera",
  },
  {
    value: "AWD",
    label: "Tracción total AWD",
  },
  {
    value: "FOUR_WHEEL_DRIVE",
    label: "4x4",
  },
];

const statusOptions: SelectOption[] = [
  {
    value: "AVAILABLE",
    label: "Disponible",
  },
  {
    value: "RESERVED",
    label: "Reservado",
  },
  {
    value: "SOLD",
    label: "Vendido",
  },
];

function optionsWithCurrentValue(
  options: SelectOption[],
  currentValue: string | null,
): SelectOption[] {
  if (
    !currentValue ||
    options.some(
      (option) => option.value === currentValue,
    )
  ) {
    return options;
  }

  return [
    {
      value: currentValue,
      label: currentValue,
    },
    ...options,
  ];
}

export default async function EditVehiclePage({
  params,
}: EditVehiclePageProps) {
  const { id } = await params;

  const [vehicle, brands] = await Promise.all([
    prisma.vehicle.findUnique({
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
    }),

    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleName =
    `${vehicle.brand.name} ${vehicle.model}`.trim();

  const vehicleFuelOptions =
    optionsWithCurrentValue(
      fuelOptions,
      vehicle.fuel,
    );

  const vehicleTransmissionOptions =
    optionsWithCurrentValue(
      transmissionOptions,
      vehicle.transmission,
    );

  const vehicleDrivetrainOptions =
    optionsWithCurrentValue(
      drivetrainOptions,
      vehicle.drivetrain,
    );

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              Administración · Vehículos
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Editar vehículo
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
              Actualiza la información, el estado y
              las fotografías de {vehicleName}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/coleccion/${vehicle.id}`}
              target="_blank"
              className="inline-flex min-h-12 items-center justify-center border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-white/5"
            >
              Ver ficha pública ↗
            </Link>

            <Link
              href="/admin/vehicles"
              className="inline-flex min-h-12 items-center justify-center bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-white/85"
            >
              Volver a vehículos
            </Link>
          </div>
        </header>

        <form
          action={updateVehicle}
          className="grid gap-8"
        >
          <input
            type="hidden"
            name="vehicleId"
            value={vehicle.id}
          />

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                01 · Información general
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Identificación del vehículo
              </h2>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Field
                label="Marca"
                htmlFor="brandId"
                required
              >
                <select
                  id="brandId"
                  name="brandId"
                  required
                  defaultValue={vehicle.brandId}
                  className={inputClasses}
                >
                  <option value="">
                    Selecciona una marca
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Modelo"
                htmlFor="model"
                required
              >
                <input
                  id="model"
                  name="model"
                  type="text"
                  required
                  defaultValue={vehicle.model}
                  placeholder="Sprinter"
                  className={inputClasses}
                />
              </Field>

              <Field
                label="Versión"
                htmlFor="version"
              >
                <input
                  id="version"
                  name="version"
                  type="text"
                  defaultValue={
                    vehicle.version ?? ""
                  }
                  placeholder="516 CDI"
                  className={inputClasses}
                />
              </Field>

              <Field
                label="Color"
                htmlFor="color"
              >
                <input
                  id="color"
                  name="color"
                  type="text"
                  defaultValue={
                    vehicle.color ?? ""
                  }
                  placeholder="Blanco"
                  className={inputClasses}
                />
              </Field>

              <Field
                label="Año"
                htmlFor="year"
                required
              >
                <input
                  id="year"
                  name="year"
                  type="number"
                  required
                  min="1886"
                  max={
                    new Date().getFullYear() + 1
                  }
                  defaultValue={vehicle.year}
                  placeholder="2020"
                  className={inputClasses}
                />
              </Field>

              <Field
                label="Kilómetros"
                htmlFor="mileage"
                required
              >
                <input
                  id="mileage"
                  name="mileage"
                  type="number"
                  required
                  min="0"
                  step="1"
                  defaultValue={vehicle.mileage}
                  placeholder="125000"
                  className={inputClasses}
                />
              </Field>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                02 · Información técnica
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Motor y transmisión
              </h2>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Field
                label="Combustible"
                htmlFor="fuel"
                required
              >
                <select
                  id="fuel"
                  name="fuel"
                  required
                  defaultValue={vehicle.fuel}
                  className={inputClasses}
                >
                  {vehicleFuelOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Transmisión"
                htmlFor="transmission"
                required
              >
                <select
                  id="transmission"
                  name="transmission"
                  required
                  defaultValue={
                    vehicle.transmission
                  }
                  className={inputClasses}
                >
                  {vehicleTransmissionOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Tracción"
                htmlFor="drivetrain"
              >
                <select
                  id="drivetrain"
                  name="drivetrain"
                  defaultValue={
                    vehicle.drivetrain ?? ""
                  }
                  className={inputClasses}
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {vehicleDrivetrainOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Motor"
                htmlFor="engine"
              >
                <input
                  id="engine"
                  name="engine"
                  type="text"
                  defaultValue={
                    vehicle.engine ?? ""
                  }
                  placeholder="2.2 CDI"
                  className={inputClasses}
                />
              </Field>

              <Field
                label="Potencia en CV"
                htmlFor="power"
              >
                <input
                  id="power"
                  name="power"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={
                    vehicle.power ?? ""
                  }
                  placeholder="190"
                  className={inputClasses}
                />
              </Field>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                03 · Venta y publicación
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Precio y estado
              </h2>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Field
                label="Precio en euros"
                htmlFor="price"
                required
              >
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={vehicle.price.toString()}
                  placeholder="25000"
                  className={inputClasses}
                />
              </Field>

              <Field
                label="Estado"
                htmlFor="status"
                required
              >
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={vehicle.status}
                  className={inputClasses}
                >
                  {statusOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45"
                >
                  Descripción
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={7}
                  defaultValue={
                    vehicle.description ?? ""
                  }
                  placeholder="Describe el estado, mantenimiento, equipamiento y características del vehículo."
                  className={`${inputClasses} resize-y py-4`}
                />
              </div>

              <label className="flex min-h-16 cursor-pointer items-center gap-4 border border-white/10 bg-black/30 px-5 md:col-span-2">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={
                    vehicle.featured
                  }
                  className="h-5 w-5 accent-white"
                />

                <span>
                  <strong className="block text-sm">
                    Vehículo destacado
                  </strong>

                  <small className="mt-1 block text-xs text-white/35">
                    Aparecerá en una posición
                    principal dentro de VANMOTION.
                  </small>
                </span>
              </label>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                04 · Fotografías
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Añadir nuevas imágenes
              </h2>
            </div>

            <div className="p-6">
              <DirectVehicleImageUpload
                vehicleId={vehicle.id}
                existingImageCount={
                  vehicle.images.length
                }
              />

              {vehicle.images.length > 0 && (
                <div className="mt-7">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Fotografías actuales
                      </h3>

                      <p className="mt-1 text-xs text-white/35">
                        La primera imagen es la portada
                        del vehículo.
                      </p>
                    </div>

                    <Link
                      href={`/admin/vehicles/${vehicle.id}/images`}
                      className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white/5"
                    >
                      Gestionar imágenes →
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {vehicle.images.map(
                      (image, index) => (
                        <article
                          key={image.id}
                          className="overflow-hidden border border-white/10 bg-black/30"
                        >
                          <div className="relative aspect-[4/3] bg-white/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              alt={
                                image.alt ??
                                vehicleName
                              }
                              className="h-full w-full object-cover"
                            />

                            {index === 0 && (
                              <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-black">
                                Portada
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <p className="truncate text-xs text-white/45">
                              {image.alt ??
                                vehicleName}
                            </p>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </div>
              )}

              {vehicle.images.length === 0 && (
                <p className="mt-5 text-sm text-white/35">
                  Este vehículo todavía no tiene
                  fotografías.
                </p>
              )}
            </div>
          </section>

          <div className="sticky bottom-0 z-20 flex flex-col gap-3 border border-white/10 bg-[#0b0b0b]/95 p-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/35">
              Los cambios se guardarán en PostgreSQL
              y se actualizarán en la colección
              pública.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/vehicles"
                className="inline-flex min-h-12 items-center justify-center border border-white/15 px-6 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-white/5"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-8 bg-white px-7 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-white/85"
              >
                Guardar cambios
                <span>→</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClasses =
  "min-h-12 w-full border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/35";

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45"
      >
        {label}
        {required ? " *" : ""}
      </label>

      {children}
    </div>
  );
}