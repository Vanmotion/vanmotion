import "server-only";

type OriginalLocale = "es" | "en";

type SourceArticle = {
  sourceUrl: string;
  locale: OriginalLocale;
  title: string;
  summary: string;
};

type Translation = { title: string; summary: string };

type DeepLResponse = { translations?: Array<{ text?: string }> };

export async function translateNewsBatch(
  articles: SourceArticle[],
): Promise<Map<string, Translation>> {
  const translated = new Map<string, Translation>();
  if (articles.length === 0) return translated;

  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey) {
    console.warn("VANMOTION_NEWS_TRANSLATION: DEEPL_API_KEY no configurada; se mantiene el texto original.");
    return translated;
  }

  const baseUrl = process.env.DEEPL_API_URL?.trim().replace(/\/$/, "")
    || (apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com");

  for (const locale of ["es", "en"] as const) {
    const group = articles.filter((article) => article.locale === locale);
    // Evita peticiones masivas cuando el archivo histórico crezca.
    for (let offset = 0; offset < group.length; offset += 20) {
      const chunk = group.slice(offset, offset + 20);
      const texts = chunk.flatMap(({ title, summary }) => [title, summary]);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch(`${baseUrl}/v2/translate`, {
          method: "POST",
          headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: texts,
            source_lang: locale === "es" ? "ES" : "EN",
            target_lang: locale === "es" ? "EN-GB" : "ES",
            preserve_formatting: true,
          }),
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`DeepL HTTP ${response.status}`);
        const data = await response.json() as DeepLResponse;
        const values = data.translations ?? [];
        if (values.length !== texts.length) throw new Error("DeepL devolvió una cantidad inesperada de traducciones");
        for (const [index, article] of chunk.entries()) {
          const title = values[index * 2]?.text?.trim();
          const summary = values[index * 2 + 1]?.text?.trim();
          if (title && summary) translated.set(article.sourceUrl, { title, summary });
        }
      } catch (error) {
        console.error("VANMOTION_NEWS_TRANSLATION_ERROR", error instanceof Error ? error.message : String(error));
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return translated;
}
