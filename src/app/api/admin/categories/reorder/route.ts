import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getCategoriesCollection } from "@/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { ids?: string[] };
  const ids = (body.ids ?? [])
    .filter((id): id is string => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "ids required" }, { status: 400 });
  }

  const categories = await getCategoriesCollection();
  const bulkOps = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder: index } },
    },
  }));

  await categories.bulkWrite(bulkOps);
  return NextResponse.json({ ok: true });
}
