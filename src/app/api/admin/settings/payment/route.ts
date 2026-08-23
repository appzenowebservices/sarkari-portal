import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPaymentSettings, upsertPaymentSettings } from "@/lib/payment-settings";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await getPaymentSettings();
    return NextResponse.json({ settings: settings || null });
  } catch {
    return NextResponse.json({ error: "Failed to load payment settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const settings = await upsertPaymentSettings(body);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to save payment settings" }, { status: 500 });
  }
}
