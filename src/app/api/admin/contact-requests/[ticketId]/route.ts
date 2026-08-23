import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getContactRequestByTicketId, updateContactRequest } from "@/lib/contact-requests";

export async function PATCH(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    const existing = await getContactRequestByTicketId(ticketId);
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const updated = await updateContactRequest(ticketId, body);
    if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update contact request" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId } = await params;
    const existing = await getContactRequestByTicketId(ticketId);
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const updated = await updateContactRequest(ticketId, { status: "CLOSED", closedAt: new Date() });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Failed to delete contact request" }, { status: 500 });
  }
}
