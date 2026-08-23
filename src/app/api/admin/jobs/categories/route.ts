import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobCategoriesCollection, withId, withIds } from "@/db";
import { slugify } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await getJobCategoriesCollection();
  const rows = await categories.find({}).sort({ sortOrder: 1, _id: 1 }).toArray();
  return NextResponse.json({ categories: withIds(rows) });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const titleHi = String(body.titleHi ?? "").trim();
  const titleEn = String(body.titleEn ?? "").trim();
  if (!titleHi || !titleEn) {
    return NextResponse.json({ ok: false, error: "titleHi और titleEn ज़रूरी हैं" }, { status: 400 });
  }

  const slug = slugify(String(body.slug ?? "").trim()) || slugify(titleEn) || `job-category-${Date.now()}`;

  const categories = await getJobCategoriesCollection();
  const existing = await categories.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `Slug "job-category/${slug}" पहले से मौजूद है` },
      { status: 409 }
    );
  }

  const all = await categories.find({}).sort({ sortOrder: -1 }).limit(1).toArray();
  const maxSort = all.length > 0 ? all[0].sortOrder : -1;
  const sortOrder = maxSort + 1;

  const descriptionHi = String(body.descriptionHi ?? "").trim();
  const descriptionEn = String(body.descriptionEn ?? "").trim();

  const doc = {
    slug,
    titleHi,
    titleEn,
    descriptionHi,
    descriptionEn,
    icon: String(body.icon ?? "dots").trim(),
    color: String(body.color ?? "navy").trim(),
    sortOrder,
    isActive: body.isActive !== false,
    seoTitle: String(body.seoTitle ?? titleEn ?? titleHi).trim(),
    metaDescription: String(body.metaDescription ?? descriptionEn ?? descriptionHi).slice(0, 160),
    focusKeyword: String(body.focusKeyword ?? slug.replace(/-/g, " ")).trim(),
    ogTitle: String(body.ogTitle ?? titleEn ?? titleHi).trim(),
    ogDescription: String(body.ogDescription ?? descriptionEn ?? descriptionHi).slice(0, 160),
    ogImage: String(body.ogImage ?? "").trim(),
    canonicalUrl: String(body.canonicalUrl ?? `/job-category/${slug}`).trim(),
    robots: String(body.robots ?? "index, follow").trim(),
    schemaType: String(body.schemaType ?? "WebPage").trim(),
    createdAt: new Date(),
  };

  const result = await categories.insertOne(doc);
  const category = withId({ ...doc, _id: result.insertedId });
  return NextResponse.json({ ok: true, category });
}
