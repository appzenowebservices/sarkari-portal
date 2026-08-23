import { NextResponse } from "next/server";
import { createContactRequest } from "@/lib/contact-requests";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      fullName: string;
      email: string;
      requestType: string;
      subject: string;
      message: string;
      agreed: boolean;
    };

    if (!body.fullName || !body.email || !body.requestType || !body.subject || !body.message || !body.agreed) {
      return NextResponse.json({ error: "Missing required fields or consent" }, { status: 400 });
    }

    const contactRequest = await createContactRequest({
      fullName: body.fullName.trim(),
      email: body.email.trim().toLowerCase(),
      requestType: body.requestType,
      subject: body.subject.trim(),
      message: body.message.trim(),
      attachment: "",
      status: "RECEIVED",
      priority: "normal",
      assignedTo: "",
      internalNotes: "",
      reply: "",
      resolution: "",
    });

    return NextResponse.json({ ok: true, ticket: { ticketId: contactRequest.ticketId } });
  } catch {
    return NextResponse.json({ error: "Failed to submit contact request" }, { status: 500 });
  }
}
