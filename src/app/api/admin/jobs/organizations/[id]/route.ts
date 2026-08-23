import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobOrganizationsCollection, withId, getJobsCollection } from "@/db";
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

  const organizations = await getJobOrganizationsCollection();
  const existing = await organizations.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "संस्थान नहीं मिला" }, { status: 404 });
  }

  if (typeof body.nameHi === "string" && body.nameHi.trim()) patch.nameHi = body.nameHi.trim();
  if (typeof body.nameEn === "string" && body.nameEn.trim()) patch.nameEn = body.nameEn.trim();
  if (typeof body.abbreviation === "string") patch.abbreviation = body.abbreviation.trim();
  if (typeof body.website === "string") patch.website = body.website.trim();
  if (typeof body.descriptionHi === "string") patch.descriptionHi = body.descriptionHi.trim();
  if (typeof body.descriptionEn === "string") patch.descriptionEn = body.descriptionEn.trim();
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;

  const nameHi = patch.nameHi ?? existing.nameHi;
  const nameEn = patch.nameEn ?? existing.nameEn;

  if (typeof body.slug === "string" && body.slug.trim()) {
    const slugVal = slugify(body.slug);
    const dup = await organizations.findOne({ slug: slugVal });
    if (dup && dup._id.toString() !== id) {
      return NextResponse.json({ ok: false, error: "यह slug पहले से मौजूद है" }, { status: 409 });
    }
    patch.slug = slugVal;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "कोई बदलाव नहीं" }, { status: 400 });
  }

  const updated = await organizations.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  const organization = updated ? withId(updated) : null;
  if (!organization) return NextResponse.json({ ok: false, error: "संस्थान नहीं मिला" }, { status: 404 });

  return NextResponse.json({ ok: true, organization });
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const organizations = await getJobOrganizationsCollection();
  const jobs = await getJobsCollection();

  const targetId = new ObjectId(id);
  const referenced = await jobs.findOne({ organizationId: targetId });
  if (referenced) {
    return NextResponse.json(
      { ok: false, error: "इस संस्थान से जुड़ी नौकरियां हैं, संस्थान हटाया नहीं जा सकता" },
      { status: 400 }
    );
  }

  const others = await organizations.find({ _id: { $ne: targetId } }).limit(1).toArray();
  if (others.length === 0) {
    return NextResponse.json(
      { ok: false, error: "कम से कम एक नौकरी संस्थान ज़रूरी है" },
      { status: 400 }
    );
  }

  await organizations.deleteOne({ _id: targetId });
  return NextResponse.json({ ok: true });
}
