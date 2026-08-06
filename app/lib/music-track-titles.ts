import type { Language } from "@/app/language";

type MusicTrackIdentity = {
  id: string;
  title: string;
};

const englishTitles: Record<string, string> = {
  "the-cool-ashtray": "The Cool Ashtray",
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

  const idKey = normalizeTrackKey(track.id);
  const titleKey = normalizeTrackKey(track.title);

  return (
    englishTitles[idKey] ??
    englishTitles[titleKey] ??
    track.title
  );
}
