type Section = "vehicles" | "music" | "streetwear";
type Period = "manana" | "dia" | "atardecer" | "noche";
type Atmosphere = "clear" | "cloudy" | "autumn" | "rain" | "snow";

function getMadridHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
}

function getMadridMonth(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      month: "2-digit",
    }).format(new Date())
  );
}

function getPeriod(): Period {
  const hour = getMadridHour();

  if (hour >= 6 && hour < 12) return "manana";
  if (hour >= 12 && hour < 18) return "dia";
  if (hour >= 18 && hour < 21) return "atardecer";

  return "noche";
}

async function getAtmosphere(): Promise<Atmosphere> {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=weather_code,precipitation,rain,snowfall&timezone=Europe%2FMadrid",
      { next: { revalidate: 300 } }
    );

    if (!response.ok) throw new Error("Weather request failed");

    const data = await response.json();
    const current = data.current ?? {};

    const code = Number(current.weather_code ?? 0);
    const rain = Number(current.rain ?? 0);
    const snowfall = Number(current.snowfall ?? 0);
    const precipitation = Number(current.precipitation ?? 0);

    const snowCodes = new Set([71, 73, 75, 77, 85, 86]);

    const rainCodes = new Set([
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82,
      95, 96, 99,
    ]);

    const cloudyCodes = new Set([2, 3]);

    if (snowfall > 0 || snowCodes.has(code)) {
      return "snow";
    }

    if (
      rain > 0 ||
      precipitation > 0 ||
      rainCodes.has(code)
    ) {
      return "rain";
    }

    if (cloudyCodes.has(code)) {
      return "cloudy";
    }

    const month = getMadridMonth();

    if (month >= 9 && month <= 11) {
      return "autumn";
    }

    return "clear";
  } catch {
    const month = getMadridMonth();

    if (month >= 9 && month <= 11) {
      return "autumn";
    }

    return "clear";
  }
}

export async function getExperienceEnvironment(): Promise<{
  period: Period;
  atmosphere: Atmosphere;
}> {
  const period = getPeriod();
  const atmosphere = await getAtmosphere();

  return { period, atmosphere };
}

export async function getExperienceSectionImage(
  section: Section
): Promise<string> {
  const { period, atmosphere } =
    await getExperienceEnvironment();

  if (atmosphere === "clear") {
    return `/experience/${section}/${period}.webp`;
  }

  return `/experience/${section}/${atmosphere}/${period}.webp`;
}
