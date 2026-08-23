import { NextResponse } from "next/server";
import { getPrivacyRequestByRequestId } from "@/lib/privacy-requests";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    
    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const privacyRequest = await getPrivacyRequestByRequestId(requestId);
    if (!privacyRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const { internalNotes: _internalNotes, ...publicRequest } = privacyRequest;
    return NextResponse.json({ request: publicRequest });
  } catch {
    return NextResponse.json({ error: "Failed to fetch request status" }, { status: 500 });
  }
}
