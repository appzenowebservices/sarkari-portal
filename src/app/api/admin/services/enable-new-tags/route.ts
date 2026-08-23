import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getServicesCollection } from "@/db";

export async function POST() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const services = await getServicesCollection();
    const result = await services.updateMany(
      { isNew: false, clickCount: { $lt: 50 } },
      { $set: { isNew: true } }
    );

    return NextResponse.json({ ok: true, modified: result.modifiedCount });
  } catch {
    return NextResponse.json({ error: "Failed to enable new tags" }, { status: 500 });
  }
}
