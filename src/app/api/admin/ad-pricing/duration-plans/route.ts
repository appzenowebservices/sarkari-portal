import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getDurationPlans } from "@/lib/duration-plans";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const durationPlans = await getDurationPlans();
    return NextResponse.json({ durationPlans });
  } catch {
    return NextResponse.json({ error: "Failed to load duration plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { createDurationPlan } = await import("@/lib/duration-plans");
    const durationPlan = await createDurationPlan(body);
    return NextResponse.json({ durationPlan });
  } catch {
    return NextResponse.json({ error: "Failed to create duration plan" }, { status: 500 });
  }
}
