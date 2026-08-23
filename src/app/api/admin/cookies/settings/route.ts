import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getCookieSettings, saveCookieSettings } from "@/lib/cookies";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getCookieSettings();
  return NextResponse.json({ settings: settings || null });
}

export async function PUT(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const settings = await saveCookieSettings({
      settingId: "COOKIE-SETTINGS-001",
      updatedBy: admin.id,
      ...body,
    });
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ error: "Failed to save cookie settings" }, { status: 500 });
  }
}
