import "server-only";

type DeepLTranslationResponse = {
  translations?: Array<{
    text?: string;
  }>;
};

type DeepLErrorResponse = {
  message?: string;
};

function getDeepLApiUrl(apiKey: string): string {
  const configuredUrl =
    process.env.DEEPL_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
}

export async function translateVehicleDescriptionToEnglish(
  description: string | null | undefined,
): Promise<string | null> {
  const normalizedDescription =
    description?.trim() ?? "";

  if (!normalizedDescription) {
    return null;
  }

  const apiKey =
    process.env.DEEPL_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Falta configurar DEEPL_API_KEY para traducir automáticamente la descripción al inglés.",
    );
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    15_000,
  );

  try {
    const response = await fetch(
      `${getDeepLApiUrl(apiKey)}/v2/translate`,
      {
        method: "POST",

        headers: {
          Authorization:
            `DeepL-Auth-Key ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          text: [
            normalizedDescription,
          ],

          source_lang: "ES",
          target_lang: "EN-GB",
          preserve_formatting: true,
        }),

        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      let serviceMessage = "";

      try {
        const errorPayload =
          await response.json() as
            DeepLErrorResponse;

        serviceMessage =
          errorPayload.message?.trim() ??
          "";
      } catch {
        serviceMessage = "";
      }

      throw new Error(
        serviceMessage
          ? `DeepL no pudo traducir la descripción: ${serviceMessage}`
          : `DeepL no pudo traducir la descripción (código ${response.status}).`,
      );
    }

    const payload =
      await response.json() as
        DeepLTranslationResponse;

    const translatedDescription =
      payload.translations?.[0]?.text?.trim();

    if (!translatedDescription) {
      throw new Error(
        "DeepL no devolvió una traducción válida.",
      );
    }

    return translatedDescription;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "La traducción automática tardó demasiado. Vuelve a guardar el vehículo.",
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
