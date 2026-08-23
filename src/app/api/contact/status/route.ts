import { NextResponse } from "next/server";
import { getContactRequestByTicketId } from "@/lib/contact-requests";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const contactRequest = await getContactRequestByTicketId(ticketId);
    if (!contactRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const { internalNotes: _internalNotes, ...publicRequest } = contactRequest;
    return NextResponse.json({ request: publicRequest });
  } catch {
    return NextResponse.json({ error: "Failed to fetch request status" }, { status: 500 });
  }
}
