import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdvertisementByRequestId, updateAdvertisement } from "@/lib/advertisements";

export async function PATCH(req: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { requestId } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    const existing = await getAdvertisementByRequestId(requestId);
    if (!existing) return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });

    const updated = await updateAdvertisement(requestId, body);
    if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json({ ok: true, advertisement: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}
