import { NextResponse } from "next/server";
import { getActiveAdTypes } from "@/lib/ad-types";
import { getActivePlacements } from "@/lib/placements";
import { getActiveDurationPlans } from "@/lib/duration-plans";
import { getPaymentSettings } from "@/lib/payment-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [adTypes, placements, durationPlans, paymentSettings] = await Promise.all([
      getActiveAdTypes(),
      getActivePlacements(),
      getActiveDurationPlans(),
      getPaymentSettings(),
    ]);

    return NextResponse.json({
      adTypes,
      placements,
      durationPlans,
      paymentSettings: paymentSettings || {
        upiEnabled: false,
        upiId: "",
        payeeName: "",
        merchantName: "",
        paymentInstructions: "",
        gstPercent: 0,
        whatsappNumber: "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load pricing data" }, { status: 500 });
  }
}
