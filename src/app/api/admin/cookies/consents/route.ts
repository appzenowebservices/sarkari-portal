import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAllCookieConsents, getCookieConsentStats } from "@/lib/cookies";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [consents, stats] = await Promise.all([
      getAllCookieConsents(200),
      getCookieConsentStats(),
    ]);
    return NextResponse.json({ consents, stats });
  } catch {
    return NextResponse.json({ error: "Failed to load consents" }, { status: 500 });
  }
}
