import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getAdminsCollection } from "@/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { current?: string; next?: string };
  const current = body.current ?? "";
  const next = body.next ?? "";

  if (!current || !next) {
    return NextResponse.json({ ok: false, error: "दोनों फील्ड भरें" }, { status: 400 });
  }
  if (next.length < 8) {
    return NextResponse.json(
      { ok: false, error: "नया पासवर्ड कम से कम 8 अक्षरों का हो" },
      { status: 400 }
    );
  }

  if (!admin.passwordHash || admin.passwordHash.split(":").length !== 3) {
    return NextResponse.json(
      { ok: false, error: "एडमिन अकाउंट में पासवर्ड सेट अप नहीं है — DB में passwordHash चेक करें" },
      { status: 500 }
    );
  }

  const valid = await verifyPassword(current, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "वर्तमान पासवर्ड गलत है" }, { status: 401 });
  }

  const passwordHash = await hashPassword(next);
  const admins = await getAdminsCollection();
  await admins.updateOne(
    { _id: new ObjectId(admin.id) },
    { $set: { passwordHash } }
  );

  return NextResponse.json({ ok: true });
}
