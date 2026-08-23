import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { updateDurationPlan, deleteDurationPlan } from "@/lib/duration-plans";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const durationPlan = await updateDurationPlan(id, body);
    if (!durationPlan) return NextResponse.json({ error: "Duration plan not found" }, { status: 404 });
    return NextResponse.json({ durationPlan });
  } catch {
    return NextResponse.json({ error: "Failed to update duration plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteDurationPlan(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete duration plan" }, { status: 500 });
  }
}
