import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection } from "@/db";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await getJobsCollection();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const todayStr = startOfToday.toISOString().split("T")[0];
  const tomorrowStr = endOfToday.toISOString().split("T")[0];

  const [
    total,
    active,
    featured,
    urgent,
    expired,
    draft,
    vacanciesAgg,
    addedToday,
    publishedToday,
    expiringToday,
  ] = await Promise.all([
    jobs.countDocuments({}),
    jobs.countDocuments({ isActive: true }),
    jobs.countDocuments({ isFeatured: true }),
    jobs.countDocuments({ isUrgent: true }),
    jobs.countDocuments({ status: "expired" }),
    jobs.countDocuments({ status: "draft" }),
    jobs
      .aggregate([{ $group: { _id: null, total: { $sum: "$totalVacancies" } } }])
      .toArray(),
    jobs.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } }),
    jobs.countDocuments({ publishedAt: { $gte: startOfToday, $lt: endOfToday } }),
    jobs.countDocuments({
      applicationLastDate: { $gte: todayStr, $lt: tomorrowStr },
      status: { $ne: "expired" },
    }),
  ]);

  return NextResponse.json({
    total,
    active,
    featured,
    urgent,
    expired,
    draft,
    totalVacancies: vacanciesAgg[0]?.total ?? 0,
    addedToday,
    publishedToday,
    expiringToday,
  });
}
