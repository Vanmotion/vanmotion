"use client";

type ConfirmVehicleImageDeleteButtonProps = {
  isPrimary: boolean;
};

export default function ConfirmVehicleImageDeleteButton({
  isPrimary,
}: ConfirmVehicleImageDeleteButtonProps) {
  function confirmDeletion(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    const message = isPrimary
      ? "Vas a eliminar la imagen principal. La siguiente fotografía pasará a ser la portada del vehículo. ¿Continuar?"
      : "¿Seguro que quieres eliminar esta fotografía del vehículo?";

    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={confirmDeletion}
      className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
    >
      Eliminar
    </button>
  );
}
