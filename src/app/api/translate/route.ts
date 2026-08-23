import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_CACHE = new Map<string, { data: string; expires: number }>();
const API_TTL = 1000 * 60 * 5; // 5 minutes

async function callMyMemory(text: string, source: string, target: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
    responseDetails?: string;
  };

  if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
    throw new Error(data.responseDetails ?? "Translation failed");
  }

  return data.responseData.translatedText;
}

async function callLingva(text: string, source: string, target: string): Promise<string> {
  const url = `https://lingva.ml/api/v1/${source}/${target}/${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as { translation?: string };
  if (!data.translation) {
    throw new Error("No translation from Lingva");
  }

  return data.translation;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const source = url.searchParams.get("source") ?? "hi";
  const target = url.searchParams.get("target") ?? "en";

  const text = q.trim();
  if (!text) {
    return NextResponse.json({ translated: "" });
  }

  const cacheKey = `${source}|${target}|${text}`;
  const cached = API_CACHE.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ translated: cached.data, cached: true });
  }

  try {
    let translated = text;
    let used = "none";

    try {
      translated = await callMyMemory(text, source, target);
      used = "mymemory";
    } catch (myMemoryError) {
      try {
        translated = await callLingva(text, source, target);
        used = "lingva";
      } catch {
        return NextResponse.json(
          { translated: text, error: "Translation service unavailable. Please try again later.", used: "none" },
          { status: 200 }
        );
      }
    }

    if (API_CACHE.size > 300) {
      const first = API_CACHE.keys().next().value;
      if (first) API_CACHE.delete(first);
    }
    API_CACHE.set(cacheKey, { data: translated, expires: Date.now() + API_TTL });

    return NextResponse.json({ translated, used });
  } catch {
    return NextResponse.json({ translated: text }, { status: 200 });
  }
}
