import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getCategoriesCollection, withId } from "@/db";
import { getServicesCollection } from "@/db";
import { slugify } from "@/lib/utils";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  const existingColl = await getCategoriesCollection();
  const existing = await existingColl.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "श्रेणी नहीं मिली" }, { status: 404 });
  }

  if (typeof body.titleHi === "string" && body.titleHi.trim()) patch.titleHi = body.titleHi.trim();
  if (typeof body.titleEn === "string" && body.titleEn.trim()) patch.titleEn = body.titleEn.trim();
  if (typeof body.descriptionHi === "string") patch.descriptionHi = body.descriptionHi.trim();
  if (typeof body.descriptionEn === "string") patch.descriptionEn = body.descriptionEn.trim();
  if (typeof body.icon === "string" && body.icon) patch.icon = body.icon;
  if (typeof body.color === "string" && body.color) patch.color = body.color;
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;

  const titleHi = patch.titleHi ?? existing.titleHi;
  const titleEn = patch.titleEn ?? existing.titleEn;
  const descriptionHi = patch.descriptionHi ?? existing.descriptionHi;
  const descriptionEn = patch.descriptionEn ?? existing.descriptionEn;
  const slug = patch.slug ?? existing.slug;

  if (typeof body.seoTitle === "string" && body.seoTitle.trim()) {
    patch.seoTitle = body.seoTitle.trim();
  } else if (!existing.seoTitle) {
    patch.seoTitle = titleEn || titleHi;
  }
  if (typeof body.metaDescription === "string" && body.metaDescription.trim()) {
    patch.metaDescription = body.metaDescription.trim();
  } else if (!existing.metaDescription) {
    patch.metaDescription = String(descriptionEn || descriptionHi).slice(0, 160);
  }
  if (typeof body.focusKeyword === "string" && body.focusKeyword.trim()) {
    patch.focusKeyword = body.focusKeyword.trim();
  } else if (!existing.focusKeyword) {
    patch.focusKeyword = String(slug).replace(/-/g, " ").trim();
  }
  if (typeof body.ogTitle === "string" && body.ogTitle.trim()) {
    patch.ogTitle = body.ogTitle.trim();
  } else if (!existing.ogTitle) {
    patch.ogTitle = titleEn || titleHi;
  }
  if (typeof body.ogDescription === "string" && body.ogDescription.trim()) {
    patch.ogDescription = body.ogDescription.trim();
  } else if (!existing.ogDescription) {
    patch.ogDescription = String(descriptionEn || descriptionHi).slice(0, 160);
  }
  if (typeof body.ogImage === "string" && body.ogImage.trim()) {
    patch.ogImage = body.ogImage.trim();
  } else if (!existing.ogImage) {
    patch.ogImage = "";
  }
  if (typeof body.canonicalUrl === "string" && body.canonicalUrl.trim()) {
    patch.canonicalUrl = body.canonicalUrl.trim();
  } else if (!existing.canonicalUrl) {
    patch.canonicalUrl = `/category/${slug}`;
  }
  if (typeof body.robots === "string" && body.robots.trim()) {
    patch.robots = body.robots.trim();
  } else if (!existing.robots) {
    patch.robots = "index, follow";
  }
  if (typeof body.schemaType === "string" && body.schemaType.trim()) {
    patch.schemaType = body.schemaType.trim();
  } else if (!existing.schemaType) {
    patch.schemaType = "WebPage";
  }

  if (typeof body.slug === "string" && body.slug.trim()) {
    const slugVal = slugify(body.slug);
    const dup = await existingColl.findOne({ slug: slugVal });
    if (dup && dup._id.toString() !== id) {
      return NextResponse.json({ ok: false, error: "यह slug पहले से मौजूद है" }, { status: 409 });
    }
    patch.slug = slugVal;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "कोई बदलाव नहीं" }, { status: 400 });
  }

  const updated = await existingColl.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  const category = updated ? withId(updated) : null;
  if (!category) return NextResponse.json({ ok: false, error: "श्रेणी नहीं मिली" }, { status: 404 });

  return NextResponse.json({ ok: true, category });
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const categories = await getCategoriesCollection();
  const others = await categories.find({ _id: { $ne: new ObjectId(id) } }).limit(1).toArray();
  if (others.length === 0) {
    return NextResponse.json(
      { ok: false, error: "कम से कम एक श्रेणी ज़रूरी है" },
      { status: 400 }
    );
  }

  await categories.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
