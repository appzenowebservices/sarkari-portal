import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { createCookieCategory, deleteCookieCategory, getActiveCookieCategories, getCookieCategories, updateCookieCategory } from "@/lib/cookies";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await getCookieCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as Omit<import("@/db/schema").CookieCategory, "id" | "createdAt" | "updatedAt">;
    const category = await createCookieCategory(body);
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { id: string } & Partial<import("@/db/schema").CookieCategory>;
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { id, ...data } = body;
    const category = await updateCookieCategory(id, data);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const deleted = await deleteCookieCategory(id);
    if (!deleted) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
