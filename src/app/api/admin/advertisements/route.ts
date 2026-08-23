import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdvertisements, getAdvertisementStats } from "@/lib/advertisements";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [ads, stats] = await Promise.all([
      getAdvertisements(200),
      getAdvertisementStats(),
    ]);
    return NextResponse.json({ ads, stats });
  } catch {
    return NextResponse.json({ error: "Failed to load advertisements" }, { status: 500 });
  }
}
