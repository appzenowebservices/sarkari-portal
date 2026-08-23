import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { searchCompanies, saveCompany } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));

  if (!q.trim()) {
    return NextResponse.json({ companies: [] });
  }

  try {
    const companies = await searchCompanies(q, limit);
    return NextResponse.json({ companies });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const company = await saveCompany({
      name: body.name || "",
      website: body.website || "",
      industry: body.industry || "",
      size: body.size || "",
      location: body.location || "",
      recruiterName: body.recruiterName || "",
      recruiterEmail: body.recruiterEmail || "",
      recruiterPhone: body.recruiterPhone || "",
    });
    return NextResponse.json({ ok: true, company });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
