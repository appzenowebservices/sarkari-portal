import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getCategoriesCollection } from "@/db";
import { getServicesCollection, withId } from "@/db";
import { normalizeUrl, generateTags } from "@/lib/utils";
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

  const services = await getServicesCollection();
  const current = await services.findOne({ _id: new ObjectId(id) });
  if (!current) {
    return NextResponse.json({ ok: false, error: "सेवा नहीं मिली" }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.titleHi === "string" && body.titleHi.trim()) patch.titleHi = body.titleHi.trim();
  if (typeof body.titleEn === "string" && body.titleEn.trim()) patch.titleEn = body.titleEn.trim();
  if (typeof body.descriptionHi === "string") patch.descriptionHi = body.descriptionHi.trim();
  if (typeof body.descriptionEn === "string") patch.descriptionEn = body.descriptionEn.trim();

  const finalTitleHi = patch.titleHi ?? current.titleHi;
  const finalTitleEn = patch.titleEn ?? current.titleEn;
  const finalDescHi = patch.descriptionHi ?? current.descriptionHi;
  const finalDescEn = patch.descriptionEn ?? current.descriptionEn;

  let url = typeof body.url === "string" ? normalizeUrl(body.url) : undefined;
  const finalUrl = url ?? current.url;
  if (url) patch.url = url;

  if (typeof body.tags === "string" && body.tags.trim()) {
    patch.tags = body.tags.trim();
  } else {
    patch.tags = generateTags(finalTitleHi, finalTitleEn, finalDescHi, finalDescEn, finalUrl);
  }

  if (typeof body.isFeatured === "boolean") patch.isFeatured = body.isFeatured;
  if (typeof body.isNew === "boolean") patch.isNew = body.isNew;
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (Array.isArray(body.categoryIds)) {
    const validIds = body.categoryIds.filter((id: unknown) => typeof id === "string" && ObjectId.isValid(id));
    if (validIds.length) {
      patch.categoryIds = validIds.map((id: string) => new ObjectId(id));
    } else {
      delete (patch as Record<string, unknown>).categoryIds;
    }
  }
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "कोई बदलाव नहीं" }, { status: 400 });
  }

  try {
    const updated = await services.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const service = updated ? withId(updated) : null;
    if (!service) return NextResponse.json({ ok: false, error: "सेवा नहीं मिली" }, { status: 404 });

    return NextResponse.json({ ok: true, service });
  } catch (e) {
    const message = e instanceof Error ? e.message : "डेटाबेस त्रुटि";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const services = await getServicesCollection();
  await services.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
