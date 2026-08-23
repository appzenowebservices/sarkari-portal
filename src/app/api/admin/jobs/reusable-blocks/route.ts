import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection } from "@/db";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await getJobsCollection();
  const distinct = await jobs.distinct("blocks.type");
  const blocks: any[] = [];

  for (const type of distinct) {
    const sample = await jobs.findOne({ "blocks.type": type }, { sort: { createdAt: -1 } });
    if (sample?.blocks) {
      const block = sample.blocks.find((b: any) => b.type === type);
      if (block) blocks.push(block);
    }
  }

  return NextResponse.json({ blocks });
}
