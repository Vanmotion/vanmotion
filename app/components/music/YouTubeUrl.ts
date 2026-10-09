export function getYouTubeVideoId(value: string | null): string | null {
  if (!value) return null;

  const input = value.trim();

  if (/^[A-Za-z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);

    let id: string | null = null;

    if (host === "youtu.be") {
      id = parts[0] ?? null;
    } else if ([
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com"
    ].includes(host)) {
      id = url.searchParams.get("v");

      if (!id && ["embed", "shorts", "live"].includes(parts[0])) {
        id = parts[1] ?? null;
      }
    }

    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
