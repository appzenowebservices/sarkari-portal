import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getCategoriesCollection, withId } from "@/db";
import { getServicesCollection } from "@/db";
import { slugify } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await getCategoriesCollection();
    const services = await getServicesCollection();
    const rows = await categories.find({}).sort({ sortOrder: 1, _id: 1 }).toArray();

    const results = [];
    const serviceCategoryQuery = (catId: ObjectId) => ({
      $or: [
        { categoryIds: catId },
        { categoryId: catId },
      ],
    });

    for (const cat of rows) {
      const activeCount = await services.countDocuments({
        ...serviceCategoryQuery(cat._id),
        isActive: true,
      });
      const totalCount = await services.countDocuments(serviceCategoryQuery(cat._id));
      results.push({
        ...withId(cat),
        serviceCount: totalCount,
        activeServiceCount: activeCount,
      });
    }

    return NextResponse.json({ categories: results });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories", categories: [] }, { status: 500 });
  }
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
    return NextResponse.json({ ok: false, error: "नाम ज़रूरी है" }, { status: 400 });
  }

  const slug = slugify(String(body.slug ?? "").trim()) || slugify(titleEn) || `cat-${Date.now()}`;

  const categories = await getCategoriesCollection();
  const existing = await categories.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `Slug "category/${slug}" पहले से मौजूद है` },
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
    icon: String(body.icon ?? "dots"),
    color: String(body.color ?? "navy"),
    sortOrder,
    isActive: body.isActive !== false,
    seoTitle: String(body.seoTitle ?? titleEn ?? titleHi).trim(),
    metaDescription: String(body.metaDescription ?? descriptionEn ?? descriptionHi).slice(0, 160),
    focusKeyword: String(body.focusKeyword ?? slug.replace(/-/g, " ")).trim(),
    ogTitle: String(body.ogTitle ?? titleEn ?? titleHi).trim(),
    ogDescription: String(body.ogDescription ?? descriptionEn ?? descriptionHi).slice(0, 160),
    ogImage: String(body.ogImage ?? "").trim(),
    canonicalUrl: String(body.canonicalUrl ?? `/category/${slug}`).trim(),
    robots: String(body.robots ?? "index, follow").trim(),
    schemaType: String(body.schemaType ?? "WebPage").trim(),
    createdAt: new Date(),
  };

  const result = await categories.insertOne(doc);
  const category = withId({ ...doc, _id: result.insertedId });
  return NextResponse.json({ ok: true, category });
}
