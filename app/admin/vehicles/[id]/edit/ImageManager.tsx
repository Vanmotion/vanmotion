"use client";

import {
  deleteVehicleImage,
  moveVehicleImage,
  setVehicleCoverImage,
} from "./actions";

type VehicleImageItem = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type ImageManagerProps = {
  vehicleId: string;
  vehicleName: string;
  images: VehicleImageItem[];
};

export default function ImageManager({
  vehicleId,
  vehicleName,
  images,
}: ImageManagerProps) {
  if (images.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-white/20 bg-white/[0.02] p-12 text-center">
        <p className="text-sm text-white/45">
          Este vehículo todavía no tiene fotografías.
        </p>

        <p className="mt-2 text-xs text-white/25">
          Puedes añadirlas desde el formulario de edición.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <article
          key={image.id}
          className="overflow-hidden border border-white/10 bg-[#101010]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
            <img
              src={image.url}
              alt={image.alt ?? vehicleName}
              className="h-full w-full object-cover"
            />

            <span className="absolute left-3 top-3 border border-white/15 bg-black/75 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
              {index === 0
                ? "Portada"
                : `Fotografía ${index + 1}`}
            </span>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <form action={moveVehicleImage}>
                <input
                  type="hidden"
                  name="vehicleId"
                  value={vehicleId}
                />

                <input
                  type="hidden"
                  name="imageId"
                  value={image.id}
                />

                <input
                  type="hidden"
                  name="direction"
                  value="left"
                />

                <button
                  type="submit"
                  disabled={index === 0}
                  className="min-h-11 w-full border border-white/10 px-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/60 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-20"
                >
                  ← Izquierda
                </button>
              </form>

              <form action={moveVehicleImage}>
                <input
                  type="hidden"
                  name="vehicleId"
                  value={vehicleId}
                />

                <input
                  type="hidden"
                  name="imageId"
                  value={image.id}
                />

                <input
                  type="hidden"
                  name="direction"
                  value="right"
                />

                <button
                  type="submit"
                  disabled={index === images.length - 1}
                  className="min-h-11 w-full border border-white/10 px-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/60 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-20"
                >
                  Derecha →
                </button>
              </form>
            </div>

            <form action={setVehicleCoverImage} className="mt-2">
              <input
                type="hidden"
                name="vehicleId"
                value={vehicleId}
              />

              <input
                type="hidden"
                name="imageId"
                value={image.id}
              />

              <button
                type="submit"
                disabled={index === 0}
                className="min-h-11 w-full border border-white/10 px-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/70 transition hover:bg-white hover:text-black disabled:cursor-default disabled:border-white/5 disabled:bg-white/[0.04] disabled:text-white/30"
              >
                {index === 0
                  ? "Portada actual"
                  : "Convertir en portada"}
              </button>
            </form>

            <form
              action={deleteVehicleImage}
              className="mt-2"
              onSubmit={(event) => {
                const confirmed = window.confirm(
                  `¿Eliminar definitivamente la fotografía ${index + 1}?`,
                );

                if (!confirmed) {
                  event.preventDefault();
                }
              }}
            >
              <input
                type="hidden"
                name="vehicleId"
                value={vehicleId}
              />

              <input
                type="hidden"
                name="imageId"
                value={image.id}
              />

              <button
                type="submit"
                className="min-h-11 w-full border border-red-500/30 px-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                Eliminar fotografía
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}