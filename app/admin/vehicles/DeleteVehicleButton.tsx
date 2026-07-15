"use client";

import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { deleteVehicle } from "@/actions/vehicleActions";

interface DeleteVehicleButtonProps {
  vehicleId: string;
  vehicleName: string;
}

export default function DeleteVehicleButton({
  vehicleId,
  vehicleName,
}: DeleteVehicleButtonProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${vehicleName}"?\n\nEsta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteVehicle} onSubmit={handleSubmit}>
      <input
        type="hidden"
        name="vehicleId"
        value={vehicleId}
      />

      <DeleteButton />
    </form>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}