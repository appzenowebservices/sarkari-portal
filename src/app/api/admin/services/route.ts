import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getCategoriesCollection } from "@/db";
import { getServicesCollection, withId } from "@/db";
import { normalizeUrl, generateTags } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await getCategoriesCollection();
    const services = await getServicesCollection();

    const rows = await services.find({}).sort({ createdAt: -1, _id: -1 }).toArray();
    const results = [];
    for (const svc of rows) {
      let catIds: string[];
      if (Array.isArray(svc.categoryIds)) {
        catIds = svc.categoryIds.map((id: ObjectId | string) => id.toString());
      } else if (svc.categoryId) {
        catIds = [svc.categoryId.toString()];
      } else {
        catIds = [];
      }
      const cats = await categories.find({ _id: { $in: catIds.map((id) => new ObjectId(id)) } }).toArray();
      results.push({
        id: svc._id.toString(),
        categoryIds: catIds,
        titleHi: svc.titleHi,
        titleEn: svc.titleEn,
        url: svc.url,
        descriptionHi: svc.descriptionHi,
        descriptionEn: svc.descriptionEn,
        tags: svc.tags,
        isFeatured: svc.isFeatured,
        isNew: svc.isNew,
        isActive: svc.isActive,
        sortOrder: svc.sortOrder,
        clickCount: svc.clickCount,
        createdAt: svc.createdAt,
        categories: cats.map((c) => ({
          slug: c.slug,
          titleHi: c.titleHi,
          titleEn: c.titleEn,
          color: c.color,
          icon: c.icon,
        })),
      });
    }

    return NextResponse.json({ services: results });
  } catch (error) {
    console.error("Admin services GET error:", error);
    return NextResponse.json({ error: "Failed to fetch services", services: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;

  const titleHi = String(body.titleHi ?? "").trim();
  const titleEn = String(body.titleEn ?? "").trim();
  const url = normalizeUrl(String(body.url ?? ""));
  const rawCategoryIds = Array.isArray(body.categoryIds)
    ? body.categoryIds.map((id) => String(id).trim())
    : typeof body.categoryIds === "string"
      ? [body.categoryIds.trim()]
      : [];

  if (!titleHi || !titleEn || !url) {
    return NextResponse.json({ ok: false, error: "नाम और URL ज़रूरी हैं" }, { status: 400 });
  }

  const validCategoryIds = rawCategoryIds.filter((id) => ObjectId.isValid(id));
  if (!validCategoryIds.length) {
    return NextResponse.json({ ok: false, error: "कम से कम एक श्रेणी चुनें" }, { status: 400 });
  }

  const services = await getServicesCollection();

  const doc = {
    categoryIds: validCategoryIds.map((id) => new ObjectId(id)),
    titleHi,
    titleEn,
    url,
    descriptionHi: String(body.descriptionHi ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? "").trim(),
    tags: String(body.tags ?? "").trim() || generateTags(titleHi, titleEn, String(body.descriptionHi ?? "").trim(), String(body.descriptionEn ?? "").trim(), url),
    isFeatured: body.isFeatured === true,
    isNew: body.isNew !== false,
    isActive: body.isActive !== false,
    sortOrder: 0,
    clickCount: 0,
    createdAt: new Date(),
  };

  try {
    const result = await services.insertOne(doc);
    const service = withId({ ...doc, _id: result.insertedId });
    return NextResponse.json({ ok: true, service });
  } catch (e) {
    const message = e instanceof Error ? e.message : "डेटाबेस त्रुटि";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
