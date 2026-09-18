import type { Metadata } from "next";
import Link from "next/link";
import { JobsExplorer } from "@/components/jobs-explorer";
import { resilient } from "@/lib/data";
import { api } from "@/trpc/server";
import type { PublicJob } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Government Jobs — नवीनतम नौकरियां | APPZENO Sarkari Portal",
  description: "Find latest government jobs, private jobs, and recruitment notifications. Check vacancies, eligibility, age limit, important dates and apply online.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string; organizationId?: string; sort?: string }>;
}) {
  const params = await searchParams;
  // Retry once per fetch, then render empty — a DB blip must not 500 the page.
  const validSort = ["latest", "lastDate", "vacancies", "popular"] as const;
  const sort = validSort.includes(params.sort as (typeof validSort)[number])
    ? (params.sort as (typeof validSort)[number])
    : undefined;
  // tRPC/Prisma reads (the raw driver cannot reach the DB from some networks).
  const [tJobs, tStats] = await Promise.all([
    resilient(
      () =>
        api.job.list({
          status: params.status || undefined,
          categoryId: params.categoryId || undefined,
          organizationId: params.organizationId || undefined,
          sort,
          limit: 200,
        }) as unknown as Promise<PublicJob[]>,
      [] as PublicJob[],
    ),
    resilient(() => api.job.stats(), {
      total: 0,
      active: 0,
      featured: 0,
      government: 0,
      private: 0,
      totalVacancies: 0,
    }),
  ]);

  const jobs = tJobs;
  const stats = { totalJobs: tStats.total, totalVacancies: tStats.totalVacancies };

  const flat = jobs.map((j) => {
    const category = (j as any).isGovernment !== false ? "government" : "private";
    const ageParts = [];
    if (j.minimumAge) ageParts.push(`${j.minimumAge}`);
    if (j.maximumAge) ageParts.push(`-${j.maximumAge}`);
    const ageLimit = ageParts.length ? `${ageParts.join("")} yrs` : "";
    const salary = (j as any).minimumSalary && (j as any).maximumSalary
      ? `${(j as any).minimumSalary} - ${(j as any).maximumSalary}`
      : (j as any).payScale || "";
    const location = Array.isArray(j.locationNames) ? j.locationNames.join(", ") : "";
    const feeParts = [];
    if (j.applicationFeeGeneral) feeParts.push(`Gen ₹${j.applicationFeeGeneral}`);
    if (j.applicationFeeOBC) feeParts.push(`OBC ₹${j.applicationFeeOBC}`);
    if (j.applicationFeeSC) feeParts.push(`SC ₹${j.applicationFeeSC}`);
    if (j.applicationFeeST) feeParts.push(`ST ₹${j.applicationFeeST}`);
    const applicationFee = feeParts.join(" / ") || "";
    const qualification = j.minimumQualification || j.maximumQualification || "";
    const clickCount = (j.applyClickCount || 0) + (j.notificationClickCount || 0) + (j.websiteClickCount || 0);

    return {
      ...j,
      category: category as "government" | "private",
      organizationHi: (j as any).organizationNameHi || "",
      organizationEn: (j as any).organizationNameEn || "",
      postNameHi: (j as any).postNameHi || "",
      postNameEn: (j as any).postNameEn || "",
      qualification,
      ageLimit,
      salary,
      location,
      applicationFee,
      startDate: j.applicationStartDate,
      lastDate: j.applicationLastDate,
      isPublished: j.isActive,
      clickCount,
    };
  });

  return (
    <main>
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-navy-100 bg-navy-50/60">
        <div className="bg-grid-ink absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <nav className="mb-5 flex items-center gap-2 text-[13px] font-bold text-ink-soft">
            <Link href="/" className="transition-colors hover:text-navy-800">
              होम
            </Link>
            <span className="text-navy-400">/</span>
            <span className="text-navy-900">नौकरियां</span>
          </nav>
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-5xl">
                नवीनतम नौकरियां
              </h1>
              <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                सरकारी और प्राइवेट भर्तियों की ताज़ा जानकारी — रिक्तियां, योग्यता, आयु सीमा, शुल्क और अंतिम तिथि एक ही जगह।
              </p>
            </div>
            <div className="ml-auto flex gap-3">
              <div className="rounded-xl bg-surface px-4 py-2 text-center shadow-sm ring-1 ring-navy-100">
                <p className="font-display text-2xl font-extrabold text-navy-950 tnum">{stats.totalJobs}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">नौकरियां</p>
              </div>
              <div className="rounded-xl bg-surface px-4 py-2 text-center shadow-sm ring-1 ring-navy-100">
                <p className="font-display text-2xl font-extrabold text-navy-950 tnum">{stats.totalVacancies.toLocaleString("en-IN")}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">रिक्तियां</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <JobsExplorer jobs={flat} />
      </div>
    </main>
  );
}
