import { NextResponse } from "next/server";
import { getAdminsCollection } from "@/db";
import { createSession, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const username = (body.username ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "यूज़रनेम और पासवर्ड भरें" },
      { status: 400 }
    );
  }

  const admins = await getAdminsCollection();
  const admin = (await admins.findOne({ username })) as any;
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return NextResponse.json(
      { ok: false, error: "गलत यूज़रनेम या पासवर्ड" },
      { status: 401 }
    );
  }

  const token = await createSession(admin._id);
  const res = NextResponse.json({ ok: true, name: admin.name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
