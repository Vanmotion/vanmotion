import Input from "@/components/ui/Input";

export default function BasicInformation() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">

      <h2 className="mb-8 text-2xl font-light">
        Información básica
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <Input
          label="Marca"
          name="brand"
          placeholder="Mercedes-Benz"
        />

        <Input
          label="Modelo"
          name="model"
          placeholder="Sprinter 319 CDI"
        />

        <Input
          label="Año"
          name="year"
          type="number"
        />

        <Input
          label="Kilómetros"
          name="mileage"
          type="number"
        />

      </div>

    </section>
  );
}