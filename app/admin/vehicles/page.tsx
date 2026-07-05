import VehicleForm from "@/components/vehicles/VehicleForm";

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-12">

        <h1 className="text-5xl font-light tracking-wide">
          Nuevo vehículo
        </h1>

        <p className="mt-2 text-white/50">
          Añade un vehículo al catálogo de Vanmotion.
        </p>

      </div>

      <VehicleForm />

    </div>
  );
}