import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getContactRequestStats, getContactRequests, updateContactRequest } from "@/lib/contact-requests";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [requests, stats] = await Promise.all([
      getContactRequests(200),
      getContactRequestStats(),
    ]);
    return NextResponse.json({ requests, stats });
  } catch {
    return NextResponse.json({ error: "Failed to load contact requests" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { ticketId: string } & Record<string, unknown>;
    if (!body.ticketId) return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });

    const { ticketId, ...data } = body;
    const updated = await updateContactRequest(ticketId, data);
    if (!updated) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update contact request" }, { status: 500 });
  }
}
