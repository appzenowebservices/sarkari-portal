import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { updatePlacement, deletePlacement } from "@/lib/placements";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const placement = await updatePlacement(id, body);
    if (!placement) return NextResponse.json({ error: "Placement not found" }, { status: 404 });
    return NextResponse.json({ placement });
  } catch {
    return NextResponse.json({ error: "Failed to update placement" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deletePlacement(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete placement" }, { status: 500 });
  }
}
