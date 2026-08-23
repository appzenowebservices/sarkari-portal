import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPlacements } from "@/lib/placements";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const placements = await getPlacements();
    return NextResponse.json({ placements });
  } catch {
    return NextResponse.json({ error: "Failed to load placements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { createPlacement } = await import("@/lib/placements");
    const placement = await createPlacement(body);
    return NextResponse.json({ placement });
  } catch {
    return NextResponse.json({ error: "Failed to create placement" }, { status: 500 });
  }
}
