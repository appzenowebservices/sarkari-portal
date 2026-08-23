import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getNewsletterSubscribersCollection, getNewsletterSendLogsCollection } from "@/db";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || null;
    const search = url.searchParams.get("q") || null;
    const source = url.searchParams.get("source") || null;
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 50)));
    const skip = (page - 1) * limit;

    const col = await getNewsletterSubscribersCollection();

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const [total, rows] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    ]);

    const subscribers = rows.map((s) => ({
      id: s._id.toString(),
      email: s.email,
      name: s.name,
      status: s.status,
      source: s.source,
      isVerified: s.isVerified,
      lastEmailAt: s.lastEmailAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ subscribers, total, page, limit });
  } catch (error) {
    console.error("Admin newsletter subscribers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers", subscribers: [], total: 0 }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const status = String(body.status ?? "active") as "active" | "unsubscribed" | "bounced" | "blocked";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    }

    const col = await getNewsletterSubscribersCollection();
    const existing = await col.findOne({ email });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already subscribed" }, { status: 409 });
    }

    const result = await col.insertOne({
      email,
      name,
      status,
      source: "admin",
      preferences: { jobs: true, schemes: true, results: true, updates: true },
      isVerified: true,
      verificationToken: null,
      verifiedAt: new Date(),
      lastEmailAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString(), email, name, status });
  } catch (error) {
    console.error("Admin newsletter subscribers POST error:", error);
    const message = error instanceof Error ? error.message : "Database error";
    if (message.includes("unique")) {
      return NextResponse.json({ ok: false, error: "Email already subscribed" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
