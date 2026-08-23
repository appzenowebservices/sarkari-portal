import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdsCollection, withId, withIds } from "@/db";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ads = await getAdsCollection();
  const rows = await ads.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ ads: withIds(rows) });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  const normalizeUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.href;
    } catch {
      return url;
    }
  };

  const doc = {
    variant: String(body.variant ?? "banner"),
    placement: String(body.placement ?? "hero_below"),
    titleHi: String(body.titleHi ?? "").trim(),
    titleEn: String(body.titleEn ?? "").trim(),
    descriptionHi: String(body.descriptionHi ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? "").trim(),
    linkUrl: body.linkUrl ? normalizeUrl(String(body.linkUrl)) : "",
    imageUrl: String(body.imageUrl ?? "").trim(),
    buttonTextHi: String(body.buttonTextHi ?? "").trim(),
    buttonTextEn: String(body.buttonTextEn ?? "").trim(),
    bgColor: String(body.bgColor ?? "#1f3b6e"),
    textColor: String(body.textColor ?? "#ffffff"),
    isPublished: body.isPublished === true,
    publishAt: body.publishAt ? new Date(String(body.publishAt)) : null,
    expiresAt: body.expiresAt ? new Date(String(body.expiresAt)) : null,
    sortOrder: Number(body.sortOrder) || 0,
    clickCount: 0,
    impressionCount: 0,
    createdAt: new Date(),
  };

  const ads = await getAdsCollection();
  const result = await ads.insertOne(doc);
  const ad = withId({ ...doc, _id: result.insertedId });
  return NextResponse.json({ ok: true, ad });
}
