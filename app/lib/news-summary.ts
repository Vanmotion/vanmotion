/** VANMOTION_REAL_NEWS_SUMMARIES_V1
 * No redactar plantillas editoriales ni inventar datos.
 * Aceptar solamente un extracto descriptivo de la fuente original.
 */
const genericPatterns = [
  /\b(?:pone el foco en|destaca la noticia|destaca con el titular)\b/i,
  /\b(?:una lectura breve para|una gu[ií]a concisa para|para seguir el debate general)\b/i,
  /\b(?:cultura del motor, la m[uú]sica y el dise[nñ]o urbano|el contexto original y la mirada editorial)\b/i,
  /\b(?:un medio especializado|de un medio especializado|la ciudad en torno a los veh[ií]culos)\b/i,
  /\b(?:leads with|a concise pointer for|the city.s wider conversation|keeping the original reporting|editorial context in view)\b/i,
  /\b(?:a quick look at the story|for readers following the city|the original reporting and its editorial context)\b/i,
];

function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '\"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_match, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function comparable(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Para la ficha pública y para guardar textos RSS/OG. Null significa sin resumen fiable. */
export function sourceNewsSummary(title: string, raw: string | null | undefined): string | null {
  let value = plainText(raw ?? "");
  if (!value) return null;
  if (genericPatterns.some((pattern) => pattern.test(value))) return null;
  const sourceTitle = plainText(title);
  if (sourceTitle && value.toLocaleLowerCase().startsWith(sourceTitle.toLocaleLowerCase())) {
    value = value.slice(sourceTitle.length).replace(/^[\s\-–—:;,.!]+/, "").trim();
  }
  value = value.replace(/\s*(?:\.\.\.|…)\s*(?:Leer m[aá]s|Read more).*$/i, "").trim();
  const normalizedTitle = comparable(sourceTitle);
  const normalizedValue = comparable(value);
  if (!normalizedValue || normalizedValue === normalizedTitle) return null;
  const tokens = normalizedValue.split(" ").filter(Boolean);
  // Evita una paráfrasis del título sin hechos adicionales.
  if (tokens.length < 8 || value.length < 45) return null;
  if (normalizedTitle && tokens.length <= normalizedTitle.split(" ").length + 3) {
    const a = new Set(normalizedTitle.split(" ").filter((word) => word.length > 3));
    const overlap = tokens.filter((word) => a.has(word)).length / Math.max(1, tokens.length);
    if (overlap > 0.72) return null;
  }
  if (value.length <= 250) return value;
  // Máximo de 250 caracteres, sin empezar una tercera frase ni cortar palabras.
  const start = value.slice(0, 250);
  const sentenceEnd = Math.max(start.lastIndexOf(". "), start.lastIndexOf("! "), start.lastIndexOf("? "));
  if (sentenceEnd >= 95) return start.slice(0, sentenceEnd + 1).trim();
  return start.slice(0, Math.max(1, start.lastIndexOf(" "))).replace(/[\s,;:—-]+$/, "").trim() + "…";
}
