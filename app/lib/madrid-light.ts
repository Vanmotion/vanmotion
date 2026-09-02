import * as SunCalc from "suncalc";

export type MadridLightPhase = "morning" | "day" | "sunset" | "night";

const MADRID_LATITUDE = 40.4168;
const MADRID_LONGITUDE = -3.7038;

/**
 * Fase de luz astronómica real para Madrid.
 *
 * morning:
 *   crepúsculo civil de mañana + salida del sol + golden hour.
 *
 * day:
 *   luz diurna plena.
 *
 * sunset:
 *   golden hour de tarde + puesta de sol + crepúsculo civil.
 *
 * night:
 *   desde el final del crepúsculo hasta el amanecer siguiente.
 */
export function getMadridLightPhase(date = new Date()): MadridLightPhase {
  const times = SunCalc.getTimes(
    date,
    MADRID_LATITUDE,
    MADRID_LONGITUDE
  );

  const dawn = times.dawn;
  const goldenHourEnd = times.goldenHourEnd;
  const goldenHour = times.goldenHour;
  const dusk = times.dusk;

  // Protección por tipos de SunCalc.
  // En Madrid estos cuatro eventos existen durante todo el año.
  if (!dawn || !goldenHourEnd || !goldenHour || !dusk) {
    return "day";
  }

  if (date >= dawn && date < goldenHourEnd) {
    return "morning";
  }

  if (date >= goldenHourEnd && date < goldenHour) {
    return "day";
  }

  if (date >= goldenHour && date < dusk) {
    return "sunset";
  }

  return "night";
}

export function getMadridSolarTimes(date = new Date()) {
  return SunCalc.getTimes(
    date,
    MADRID_LATITUDE,
    MADRID_LONGITUDE
  );
}
