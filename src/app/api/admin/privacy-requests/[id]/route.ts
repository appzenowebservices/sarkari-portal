import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPrivacyRequestByRequestId, updatePrivacyRequest } from "@/lib/privacy-requests";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    
    const existing = await getPrivacyRequestByRequestId(id);
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const updated = await updatePrivacyRequest(id, body);
    if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update privacy request" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getPrivacyRequestByRequestId(id);
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    // Soft delete by marking as cancelled
    const updated = await updatePrivacyRequest(id, { status: "CANCELLED", closedAt: new Date() });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Failed to delete privacy request" }, { status: 500 });
  }
}
