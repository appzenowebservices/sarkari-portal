import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { getSettingsCollection } from "@/db";

const ALLOWED_KEYS = ["ticker", "helpline", "email", "about", "footerNote", "facebook", "twitter", "instagram", "youtube", "linkedin", "telegram", "whatsapp"];

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const values = await getSettings();
  return NextResponse.json({ settings: values });
}

export async function PUT(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  const settings = await getSettingsCollection();

  for (const key of ALLOWED_KEYS) {
    if (typeof body[key] === "string") {
      const value = (body[key] as string).trim();
      await settings.updateOne(
        { key },
        { $set: { key, value } },
        { upsert: true }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
