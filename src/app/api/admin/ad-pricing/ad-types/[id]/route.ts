import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { updateAdType, deleteAdType, getAdTypes } from "@/lib/ad-types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const adType = await updateAdType(id, body);
    if (!adType) return NextResponse.json({ error: "Ad type not found" }, { status: 404 });
    return NextResponse.json({ adType });
  } catch {
    return NextResponse.json({ error: "Failed to update ad type" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteAdType(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete ad type" }, { status: 500 });
  }
}
