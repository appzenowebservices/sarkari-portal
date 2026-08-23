const HINDI_REGEX = /[\u0900-\u097F]/;

const CACHE = new Map<string, string>();
const MAX_CACHE = 500;

function cacheKey(source: "hi" | "en", target: "hi" | "en", text: string): string {
  return `${source}|${target}|${text}`;
}

export function detectLanguage(text: string): "hi" | "en" {
  if (HINDI_REGEX.test(text)) {
    return "hi";
  }
  return "en";
}

async function cachedTranslate(text: string, source: "hi" | "en", target: "hi" | "en"): Promise<string> {
  const key = cacheKey(source, target, text);
  const hit = CACHE.get(key);
  if (hit !== undefined) return hit;

  if (!text.trim()) return text;
  try {
    const res = await fetch(
      `/api/translate?q=${encodeURIComponent(text)}&source=${source}&target=${target}`
    );
    if (!res.ok) return text;
    const data = (await res.json()) as { translated?: string; error?: string };
    if (data.error) return text;
    const translated = data.translated ?? text;
    if (CACHE.size > MAX_CACHE) {
      const first = CACHE.keys().next().value;
      if (first) CACHE.delete(first);
    }
    CACHE.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}

export async function translateToHindi(text: string): Promise<string> {
  return cachedTranslate(text, "en", "hi");
}

export async function translateToEnglish(text: string): Promise<string> {
  return cachedTranslate(text, "hi", "en");
}

export function useTranslate() {
  const translateAndSync = async (
    value: string,
    lang: "hi" | "en",
    hiSetter: (v: string) => void,
    enSetter: (v: string) => void
  ) => {
    if (lang === "hi") {
      const translated = await translateToEnglish(value);
      if (translated !== value) {
        enSetter(translated);
      }
    } else {
      const translated = await translateToHindi(value);
      if (translated !== value) {
        hiSetter(translated);
      }
    }
  };

  return { translateAndSync };
}
