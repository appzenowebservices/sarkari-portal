import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPayments } from "@/lib/payments";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payments = await getPayments(200);
    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}
