import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection, withId } from "@/db";
import { ObjectId } from "mongodb";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  try {
    const jobs = await getJobsCollection();
    const original = await jobs.findOne({ _id: new ObjectId(id) });
    if (!original) {
      return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    }

    const { _id, ...rest } = original;
    const newSlug = `${slugify(rest.titleEn || rest.titleHi || "job")}-${Date.now()}`;

    const duplicate = {
      ...rest,
      slug: newSlug,
      status: "draft",
      isActive: false,
      isFeatured: false,
      isUrgent: false,
      publishedAt: null,
      expiredAt: null,
      viewCount: 0,
      applyClickCount: 0,
      notificationClickCount: 0,
      websiteClickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await jobs.insertOne(duplicate);
    const job = withId({ ...duplicate, _id: result.insertedId });

    return NextResponse.json({ ok: true, job });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Duplicate failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
