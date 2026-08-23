import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdRequestsCollection, withIds } from "@/db";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adRequests = await getAdRequestsCollection();
  const rows = await adRequests.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ requests: withIds(rows) });
}
