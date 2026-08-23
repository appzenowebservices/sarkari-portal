import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPrivacyRequestStats, getPrivacyRequests, updatePrivacyRequest } from "@/lib/privacy-requests";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [requests, stats] = await Promise.all([
      getPrivacyRequests(200),
      getPrivacyRequestStats(),
    ]);
    return NextResponse.json({ requests, stats });
  } catch {
    return NextResponse.json({ error: "Failed to load privacy requests" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { id: string } & Record<string, unknown>;
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { id, ...data } = body;
    const updated = await updatePrivacyRequest(id, data);
    if (!updated) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update privacy request" }, { status: 500 });
  }
}
