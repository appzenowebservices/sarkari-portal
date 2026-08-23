import { NextResponse } from "next/server";
import { getAdRequestsCollection } from "@/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "नाम और ईमेल ज़रूरी है" }, { status: 400 });
  }

  const adRequests = await getAdRequestsCollection();
  await adRequests.insertOne({
    _id: new ObjectId(),
    name,
    email,
    phone: String(body.phone ?? "").trim(),
    company: String(body.company ?? "").trim(),
    adType: String(body.adType ?? "banner"),
    preferredPlacement: String(body.preferredPlacement ?? "hero_below"),
    duration: String(body.duration ?? "").trim(),
    budget: String(body.budget ?? "").trim(),
    message: String(body.message ?? "").trim(),
    status: "pending",
    adminNotes: "",
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
