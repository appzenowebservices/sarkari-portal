import { NextResponse } from "next/server";
import { getNewsletterStats, getNewsletterSubscribers } from "@/lib/data";

export async function GET() {
  try {
    const stats = await getNewsletterStats();
    const subscribers = await getNewsletterSubscribers("all", 1000);
    return NextResponse.json({ stats, subscribers });
  } catch {
    return NextResponse.json({ error: "Failed to load newsletter data" }, { status: 500 });
  }
}
