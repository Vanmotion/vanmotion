import type { Language } from "@/app/language";

type MusicTrackIdentity = {
  title: string;
};

const englishTitles: Record<string, string> = {
  "the-cool-ashtray": "The Cool Ashtray",
  "built-in-the-dark": "Built in the Dark",
  "san-miguel": "San Miguel",
  "suenos-prestados": "Borrowed Dreams",
  "solo-en-mi-mente": "Only in My Mind",
  "solo-con-mi-mente": "Only in My Mind",
  vanmotion: "Vanmotion",
  "volvere-por-ti": "I'll Come Back for You",
  "cero-dramas": "No Drama",
};

function normalizeTrackKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocalizedTrackTitle(
  track: MusicTrackIdentity,
  language: Language,
): string {
  if (language !== "en") {
    return track.title;
  }

  const titleKey = normalizeTrackKey(track.title);

  return englishTitles[titleKey] ?? track.title;
}
