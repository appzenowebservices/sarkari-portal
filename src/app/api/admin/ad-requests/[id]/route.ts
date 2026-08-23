import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdRequestsCollection, withId } from "@/db";
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

  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.adminNotes === "string") patch.adminNotes = body.adminNotes.trim();

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ ok: false, error: "No changes" }, { status: 400 });

  const adRequests = await getAdRequestsCollection();
  const updated = await adRequests.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  const request = updated ? withId(updated) : null;
  if (!request) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, request });
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const adRequests = await getAdRequestsCollection();
  await adRequests.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
