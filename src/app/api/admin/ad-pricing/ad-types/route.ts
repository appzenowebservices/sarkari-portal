import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdTypes } from "@/lib/ad-types";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adTypes = await getAdTypes();
    return NextResponse.json({ adTypes });
  } catch {
    return NextResponse.json({ error: "Failed to load ad types" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { createAdType } = await import("@/lib/ad-types");
    const adType = await createAdType(body);
    return NextResponse.json({ adType });
  } catch {
    return NextResponse.json({ error: "Failed to create ad type" }, { status: 500 });
  }
}
