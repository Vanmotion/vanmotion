import type { Language } from "@/app/language";

export function localizedVehicleModel(
  model: string,
  language: Language,
): string {
  if (language !== "en") return model;

  const names: Record<string, string> = {
    "Clase G": "G-Class",
    "Serie 1": "1 Series",
    Cabrio: "Convertible",
  };

  return names[model] ?? model;
}

export function localizedVehicleVersion(
  version: string | null,
  language: Language,
): string | null {
  if (!version || language !== "en") return version;

  return version
    .replaceAll("Automático", "Automatic")
    .replaceAll("Furgón de carga", "Cargo van")
    .replaceAll("3 plazas", "3 seats");
}

export function localizedVehicleImageAlt(
  alt: string,
  language: Language,
): string {
  if (language !== "en") return alt;

  const rules: Array<[RegExp, string]> = [
    [/Clase G/g, "G-Class"],
    [/Serie 1/g, "1 Series"],
    [/Cabrio/g, "Convertible"],
    [/Automático/g, "Automatic"],
    [/Furgón de carga/gi, "Cargo van"],
    [/3 plazas/gi, "3 seats"],
    [/vista exterior delantera izquierda/gi, "front-left exterior view"],
    [/vista exterior delantera derecha/gi, "front-right exterior view"],
    [/vista lateral y trasera de la furgoneta/gi, "side and rear view of the van"],
    [/vista trasera con puertas de carga cerradas/gi, "rear view with cargo doors closed"],
    [/salpicadero, volante, cambio manual y equipo multimedia/gi, "dashboard, steering wheel, manual gearbox and multimedia system"],
    [/mandos de climatización y controles de la consola central/gi, "climate controls and centre console"],
    [/interior de la zona de carga con puertas traseras abiertas/gi, "cargo area interior with rear doors open"],
    [/compartimento del motor diésel/gi, "diesel engine bay"],
  ];

  return rules.reduce(
    (result, [pattern, translation]) =>
      result.replace(pattern, translation),
    alt,
  );
}
