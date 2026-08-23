import { NextResponse } from "next/server";
import { getAdvertisementByRequestId } from "@/lib/advertisements";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const advertisement = await getAdvertisementByRequestId(requestId);
    if (!advertisement) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    const { internalNotes, ...publicAd } = advertisement;
    return NextResponse.json({ advertisement: publicAd });
  } catch {
    return NextResponse.json({ error: "Failed to fetch advertisement status" }, { status: 500 });
  }
}
