"use client";

import { deleteBrand } from "./actions";

type DeleteBrandButtonProps = {
  brandId: string;
  brandName: string;
  vehicleCount: number;
};

export default function DeleteBrandButton({
  brandId,
  brandName,
  vehicleCount,
}: DeleteBrandButtonProps) {
  const deleteBrandWithId = deleteBrand.bind(null, brandId);
  const isDisabled = vehicleCount > 0;

  return (
    <form
      action={deleteBrandWithId}
      onSubmit={(event) => {
        if (isDisabled) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(
          `¿Eliminar definitivamente la marca "${brandName}"?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={isDisabled}
        title={
          isDisabled
            ? "Primero debes eliminar o cambiar los vehículos de esta marca."
            : `Eliminar ${brandName}`
        }
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-500/30 px-4 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/20 disabled:hover:bg-transparent"
      >
        Eliminar
      </button>
    </form>
  );
}