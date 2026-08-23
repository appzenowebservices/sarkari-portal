import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getNewsletterCampaignsCollection } from "@/db";
import type { NewsletterContentBlock } from "@/db/schema";

export async function GET(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || null;
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
    const skip = (page - 1) * limit;

    const col = await getNewsletterCampaignsCollection();

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [total, rows] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    ]);

    const campaigns = rows.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      subject: c.subject,
      previewText: c.previewText,
      status: c.status,
      audience: c.audience,
      scheduledAt: c.scheduledAt,
      sentAt: c.sentAt,
      sentCount: c.sentCount,
      deliveredCount: c.deliveredCount,
      openedCount: c.openedCount,
      clickedCount: c.clickedCount,
      bouncedCount: c.bouncedCount,
      unsubscribedCount: c.unsubscribedCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      contentBlocks: c.contentBlocks,
    }));

    return NextResponse.json({ campaigns, total, page, limit });
  } catch (error) {
    console.error("Admin newsletter campaigns GET error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns", campaigns: [], total: 0 }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      title: string;
      subject: string;
      previewText?: string;
      contentBlocks?: NewsletterContentBlock[];
      audience?: "all" | "active";
      scheduledAt?: string | null;
    };

    if (!body.title || !body.subject) {
      return NextResponse.json({ ok: false, error: "Title and subject are required" }, { status: 400 });
    }

    const col = await getNewsletterCampaignsCollection();
    const result = await col.insertOne({
      title: body.title,
      subject: body.subject,
      previewText: body.previewText || "",
      status: body.scheduledAt ? "scheduled" : "draft",
      contentBlocks: body.contentBlocks || [],
      audience: body.audience || "active",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      sentAt: null,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      templateVersion: "1.0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error("Admin newsletter campaigns POST error:", error);
    const message = error instanceof Error ? error.message : "Database error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
