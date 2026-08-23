import { NextResponse } from "next/server";
import { createPayment } from "@/lib/payments";
import { updateAdvertisement } from "@/lib/advertisements";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId, utrNumber, paymentDate, paymentTime, screenshot } = body;

    if (!requestId || !utrNumber || !paymentDate || !paymentTime || !screenshot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await createPayment({
      advertisementId: "",
      requestId,
      amount: 0,
      method: "UPI",
      utrNumber,
      screenshot,
      status: "PENDING",
      verifiedAt: null,
      verifiedBy: "",
      notes: "",
    });

    await updateAdvertisement(requestId, {
      paymentStatus: "PAID",
      utrNumber,
      paymentScreenshot: screenshot,
      paymentDate,
      paymentTime,
      status: "PAYMENT_VERIFICATION",
    });

    return NextResponse.json({ ok: true, payment: existing });
  } catch {
    return NextResponse.json({ error: "Failed to upload payment proof" }, { status: 500 });
  }
}
