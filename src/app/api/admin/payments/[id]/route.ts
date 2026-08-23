import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPaymentById, updatePayment } from "@/lib/payments";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    const payment = await getPaymentById(id);
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const updated = await updatePayment(id, body);
    if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json({ ok: true, payment: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
