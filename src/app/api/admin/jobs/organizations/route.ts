import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobOrganizationsCollection, withId, withIds } from "@/db";
import { slugify } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizations = await getJobOrganizationsCollection();
  const rows = await organizations.find({}).sort({ sortOrder: 1, _id: 1 }).toArray();
  return NextResponse.json({ organizations: withIds(rows) });
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

  const nameHi = String(body.nameHi ?? "").trim();
  const nameEn = String(body.nameEn ?? "").trim();
  if (!nameHi || !nameEn) {
    return NextResponse.json({ ok: false, error: "nameHi और nameEn ज़रूरी हैं" }, { status: 400 });
  }

  const slug = slugify(String(body.slug ?? "").trim()) || slugify(nameEn) || `job-org-${Date.now()}`;

  const organizations = await getJobOrganizationsCollection();
  const existing = await organizations.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `Slug "job-organization/${slug}" पहले से मौजूद है` },
      { status: 409 }
    );
  }

  const all = await organizations.find({}).sort({ sortOrder: -1 }).limit(1).toArray();
  const maxSort = all.length > 0 ? all[0].sortOrder : -1;
  const sortOrder = maxSort + 1;

  const doc = {
    slug,
    nameHi,
    nameEn,
    abbreviation: String(body.abbreviation ?? "").trim(),
    website: String(body.website ?? "").trim(),
    descriptionHi: String(body.descriptionHi ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? "").trim(),
    isActive: body.isActive !== false,
    sortOrder,
    createdAt: new Date(),
  };

  const result = await organizations.insertOne(doc);
  const organization = withId({ ...doc, _id: result.insertedId });
  return NextResponse.json({ ok: true, organization });
}
