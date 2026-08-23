import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { runNewsletterCron } from "@/lib/newsletter-cron";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "";

  let isAdmin = false;
  try {
    const admin = await getAdmin();
    isAdmin = Boolean(admin);
  } catch {
    isAdmin = false;
  }

  const isAuthorized =
    isAdmin ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runNewsletterCron();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Newsletter cron API error:", error);
    const message = error instanceof Error ? error.message : "Cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
