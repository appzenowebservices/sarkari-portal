import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getNewsletterCampaignsCollection, getNewsletterSubscribersCollection } from "@/db";
import { ObjectId } from "mongodb";
import type { NewsletterContentBlock } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const col = await getNewsletterCampaignsCollection();
    const c = await col.findOne({ _id: new ObjectId(id) });
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      campaign: {
        id: c._id.toString(),
        title: c.title,
        subject: c.subject,
        previewText: c.previewText,
        status: c.status,
        contentBlocks: c.contentBlocks || [],
        audience: c.audience,
        scheduledAt: c.scheduledAt,
        sentAt: c.sentAt,
        sentCount: c.sentCount,
        deliveredCount: c.deliveredCount,
        openedCount: c.openedCount,
        clickedCount: c.clickedCount,
        bouncedCount: c.bouncedCount,
        unsubscribedCount: c.unsubscribedCount,
        templateVersion: c.templateVersion,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  } catch (error) {
    console.error("Newsletter campaign GET error:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const patch: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.subject === "string") patch.subject = body.subject;
    if (typeof body.previewText === "string") patch.previewText = body.previewText;
    if (Array.isArray(body.contentBlocks)) patch.contentBlocks = body.contentBlocks;
    if (typeof body.audience === "string") patch.audience = body.audience;
    if (body.scheduledAt !== undefined) {
      patch.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt as string) : null;
      if (patch.scheduledAt && !(patch as Record<string, unknown>).status) {
        patch.status = "scheduled";
      }
    }
    if (typeof body.status === "string") patch.status = body.status;

    const col = await getNewsletterCampaignsCollection();
    const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: patch });
    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter campaign PATCH error:", error);
    const message = error instanceof Error ? error.message : "Database error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const col = await getNewsletterCampaignsCollection();
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter campaign DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete campaign" }, { status: 500 });
  }
}
