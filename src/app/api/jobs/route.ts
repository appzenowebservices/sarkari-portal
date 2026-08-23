import { NextResponse } from "next/server";
import { getJobsCollection } from "@/db";
import { withId } from "@/db";
import { ObjectId } from "mongodb";

import type { PublicJob } from "@/db/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const categoryId = url.searchParams.get("categoryId") ?? undefined;
  const organizationId = url.searchParams.get("organizationId") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "50") || 50;
  const sort = url.searchParams.get("sort") ?? "latest";
  const q = (url.searchParams.get("q") ?? "").trim();

  const jobs = await getJobsCollection();
  const filter: Record<string, unknown> = { isActive: true };

  if (status) filter.status = status;
  if (categoryId && ObjectId.isValid(categoryId)) filter.categoryId = new ObjectId(categoryId);
  if (organizationId && ObjectId.isValid(organizationId)) filter.organizationId = new ObjectId(organizationId);

  if (q) {
    filter.$or = [
      { titleHi: { $regex: q, $options: "i" } },
      { titleEn: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { organizationNameHi: { $regex: q, $options: "i" } },
      { organizationNameEn: { $regex: q, $options: "i" } },
    ];
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "lastDate") sortObj = { applicationLastDate: 1 };
  else if (sort === "vacancies") sortObj = { totalVacancies: -1 };
  else if (sort === "popular") sortObj = { viewCount: -1 };

  const rows = await jobs.find(filter).sort(sortObj).limit(limit).toArray();

  return NextResponse.json(
    rows.map((r) => {
      const category = r.isGovernment ? "government" : "private";
      const ageParts = [];
      if (r.minimumAge) ageParts.push(`${r.minimumAge}`);
      if (r.maximumAge) ageParts.push(`-${r.maximumAge}`);
      const ageLimit = ageParts.length ? `${ageParts.join("")} yrs` : "";
      const salary = [r.minimumSalary, r.maximumSalary].filter(Boolean).join(" - ") || r.payScale || "";
      const location = Array.isArray(r.locationNames) ? r.locationNames.join(", ") : "";
      const feeParts = [];
      if (r.applicationFeeGeneral) feeParts.push(`Gen ₹${r.applicationFeeGeneral}`);
      if (r.applicationFeeOBC) feeParts.push(`OBC ₹${r.applicationFeeOBC}`);
      if (r.applicationFeeSC) feeParts.push(`SC ₹${r.applicationFeeSC}`);
      if (r.applicationFeeST) feeParts.push(`ST ₹${r.applicationFeeST}`);
      const applicationFee = feeParts.join(" / ") || "";
      const qualification = r.minimumQualification || r.maximumQualification || "";

       return withId({
         ...r,
         category,
         organizationHi: r.organizationNameHi,
         organizationEn: r.organizationNameEn,
         qualification,
         ageLimit,
         salary,
         location,
         applicationFee,
         startDate: r.applicationStartDate,
         lastDate: r.applicationLastDate,
         isPublished: r.isActive,
         clickCount: r.clickCount + r.applyClickCount + r.notificationClickCount + r.websiteClickCount,
         blocks: Array.isArray(r.blocks) ? r.blocks : [],
       });
    }) as PublicJob[]
  );
}
