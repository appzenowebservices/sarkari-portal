import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getNewsletterSubscribersCollection } from "@/db";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const col = await getNewsletterSubscribersCollection();
    const sub = await col.findOne({ _id: new ObjectId(id) });
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      subscriber: {
        id: sub._id.toString(),
        email: sub.email,
        name: sub.name,
        status: sub.status,
        source: sub.source,
        isVerified: sub.isVerified,
        lastEmailAt: sub.lastEmailAt,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      },
    });
  } catch (error) {
    console.error("Newsletter subscriber GET error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriber" }, { status: 500 });
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

    if (typeof body.email === "string") patch.email = body.email.trim().toLowerCase();
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (typeof body.status === "string") patch.status = body.status;
    if (typeof body.source === "string") patch.source = body.source;
    if (typeof body.isVerified === "boolean") patch.isVerified = body.isVerified;

    const col = await getNewsletterSubscribersCollection();
    const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: patch });
    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscriber PATCH error:", error);
    const message = error instanceof Error ? error.message : "Database error";
    if (message.includes("unique")) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }
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

    const col = await getNewsletterSubscribersCollection();
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscriber DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete subscriber" }, { status: 500 });
  }
}
