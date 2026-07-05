import BasicInformation from "./BasicInformation";

export default function VehicleForm() {
  return (
    <form className="space-y-10">

      <BasicInformation />

      <div className="flex justify-end">

        <button
          type="submit"
          className="rounded-xl bg-white px-8 py-4 text-black transition hover:opacity-80"
        >
          Guardar vehículo
        </button>

      </div>

    </form>
  );
}