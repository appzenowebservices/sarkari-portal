import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getNewsletterSubscribersCollection } from "@/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      action: "delete" | "subscribe" | "unsubscribe";
      ids: string[];
    };

    const { action, ids } = body;
    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing action or ids" }, { status: 400 });
    }

    const validIds = ids.filter((id) => ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid ids" }, { status: 400 });
    }

    const col = await getNewsletterSubscribersCollection();
    const objectIds = validIds.map((id) => new ObjectId(id));

    let modified = 0;

    switch (action) {
      case "delete":
        const delResult = await col.deleteMany({ _id: { $in: objectIds } });
        modified = delResult.deletedCount;
        break;
      case "subscribe":
        const subResult = await col.updateMany(
          { _id: { $in: objectIds } },
          { $set: { status: "active", updatedAt: new Date() } }
        );
        modified = subResult.modifiedCount;
        break;
      case "unsubscribe":
        const unsubResult = await col.updateMany(
          { _id: { $in: objectIds } },
          { $set: { status: "unsubscribed", updatedAt: new Date() } }
        );
        modified = unsubResult.modifiedCount;
        break;
    }

    return NextResponse.json({ ok: true, modified });
  } catch (error) {
    console.error("Newsletter bulk operation error:", error);
    const message = error instanceof Error ? error.message : "Database error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
