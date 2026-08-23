import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdsCollection, withId } from "@/db";
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

  if (typeof body.variant === "string") patch.variant = body.variant;
  if (typeof body.placement === "string") patch.placement = body.placement;
  if (typeof body.titleHi === "string") patch.titleHi = body.titleHi.trim();
  if (typeof body.titleEn === "string") patch.titleEn = body.titleEn.trim();
  if (typeof body.descriptionHi === "string") patch.descriptionHi = body.descriptionHi.trim();
  if (typeof body.descriptionEn === "string") patch.descriptionEn = body.descriptionEn.trim();
  if (typeof body.linkUrl === "string") {
    try {
      patch.linkUrl = body.linkUrl ? new URL(String(body.linkUrl)).href : "";
    } catch {
      patch.linkUrl = String(body.linkUrl).trim();
    }
  }
  if (typeof body.imageUrl === "string") patch.imageUrl = body.imageUrl.trim();
  if (typeof body.buttonTextHi === "string") patch.buttonTextHi = body.buttonTextHi.trim();
  if (typeof body.buttonTextEn === "string") patch.buttonTextEn = body.buttonTextEn.trim();
  if (typeof body.bgColor === "string") patch.bgColor = body.bgColor;
  if (typeof body.textColor === "string") patch.textColor = body.textColor;
  if (typeof body.isPublished === "boolean") patch.isPublished = body.isPublished;
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;
  if (body.publishAt !== undefined) patch.publishAt = body.publishAt ? new Date(String(body.publishAt)) : null;
  if (body.expiresAt !== undefined) patch.expiresAt = body.expiresAt ? new Date(String(body.expiresAt)) : null;

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ ok: false, error: "No changes" }, { status: 400 });

  const ads = await getAdsCollection();
  const updated = await ads.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  const ad = updated ? withId(updated) : null;
  if (!ad) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, ad });
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const ads = await getAdsCollection();
  await ads.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
