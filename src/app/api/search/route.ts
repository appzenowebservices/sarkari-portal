import { NextResponse } from "next/server";
import { searchServices } from "@/lib/data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(20, Number(url.searchParams.get("limit") ?? "12") || 12);

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchServices(q, limit);
  return NextResponse.json({ results });
}
