import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { AdSection } from "@/components/ad-slot";
import { getJobBySlug, getRelatedJobs, getJobCategories, getSettings } from "@/lib/data";
import { JobCard } from "@/components/job-card";
import { JobBlockRenderer } from "@/components/job-block-renderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.titleEn} — ${job.titleHi} | APPZENO Sarkari Portal`,
    description: job.metaDescription || job.shortDescriptionEn || job.shortDescriptionHi,
    keywords: job.focusKeyword || job.tags,
    openGraph: {
      title: job.ogTitle || job.titleEn,
      description: job.ogDescription || job.shortDescriptionEn,
      images: job.ogImage ? [job.ogImage] : [],
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return notFound();

  const related = await getRelatedJobs(job.id, 6);
  const categories = await getJobCategories();
  const settings = await getSettings();

  const lastDate = job.applicationLastDate ? new Date(job.applicationLastDate) : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const last = lastDate ? new Date(lastDate) : null;
  if (last) last.setHours(0, 0, 0, 0);
  const diffMs = last ? last.getTime() - now.getTime() : 0;
  const daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

  const isExpired = job.status === "expired" || (lastDate && new Date(lastDate) < now);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.titleEn,
    description: job.shortDescriptionEn || job.shortDescriptionHi,
    hiringOrganization: {
      "@type": "Organization",
      name: job.organizationNameEn,
    },
    datePosted: job.createdAt.toISOString(),
    validThrough: job.applicationLastDate ? new Date(job.applicationLastDate).toISOString() : undefined,
    employmentType: job.jobType || "FULL_TIME",
    jobLocation: {
      "@type": "Place",
      address: job.locationNames?.join(", ") || job.state || "",
    },
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Reveal>
        <nav className="mb-5 flex items-center gap-2 text-[13px] font-bold text-ink-soft">
          <Link href="/" className="transition-colors hover:text-navy-800">
            <Bi hi="होम" en="Home" />
          </Link>
          <Icon name="chevronLeft" size={13} className="rotate-180" />
          <Link href="/jobs" className="transition-colors hover:text-navy-800">
            <Bi hi="नौकरियां" en="Jobs" />
          </Link>
          <Icon name="chevronLeft" size={13} className="rotate-180" />
          <span className="text-navy-900">
            <Bi hi={job.titleHi} en={job.titleEn} />
          </span>
        </nav>
      </Reveal>

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-surface shadow-sm">
          <div className="border-b border-navy-100 bg-navy-50/60 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                  <Bi hi={job.titleHi} en={job.titleEn} />
                </h1>
                <p className="mt-1 text-sm font-semibold text-ink-soft">
                  <Bi hi={job.organizationNameHi} en={job.organizationNameEn} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                {job.isFeatured && (
                  <span className="rounded-full bg-saffron-100 px-3 py-1 text-xs font-extrabold text-saffron-800">
                    <Bi hi="चुनिंदा" en="Featured" />
                  </span>
                )}
                {job.isUrgent && (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800">
                    <Bi hi="जरूरी" en="Urgent" />
                  </span>
                )}
                {!isExpired && job.applicationLastDate && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      daysRemaining <= 3
                        ? "bg-rose-100 text-rose-800"
                        : daysRemaining <= 7
                          ? "bg-orange-100 text-orange-800"
                          : "bg-leaf-100 text-leaf-800"
                    }`}
                  >
                    {daysRemaining === 0 ? (
                      <Bi hi="आज समाप्त" en="Ends today" />
                    ) : (
                      <>
                        <span className="tnum">{daysRemaining}</span> <Bi hi="दिन बाकी" en="days left" />
                      </>
                    )}
                  </span>
                )}
                {isExpired && (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-600">
                    <Bi hi="समाप्त" en="Expired" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-navy-100 sm:grid-cols-3 lg:grid-cols-4">
            {job.totalVacancies > 0 && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-2xl font-display font-bold text-navy-950 tnum">{job.totalVacancies.toLocaleString("en-IN")}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="कुल पद" en="Total Vacancies" />
                </p>
              </div>
            )}
            {job.minimumQualification && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-sm font-extrabold text-navy-950">
                  <Bi hi={job.minimumQualification} en={job.minimumQualification} />
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="योग्यता" en="Qualification" />
                </p>
              </div>
            )}
            {(job.minimumAge || job.maximumAge) && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-sm font-extrabold text-navy-950">
                  {job.minimumAge && job.maximumAge
                    ? `${job.minimumAge}-${job.maximumAge}`
                    : job.minimumAge
                      ? `${job.minimumAge}+`
                      : `Upto ${job.maximumAge}`}
                  {" "}<Bi hi="वर्ष" en="yrs" />
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="आयु सीमा" en="Age Limit" />
                </p>
              </div>
            )}
            {job.state && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-sm font-extrabold text-navy-950">{job.state}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="राज्य" en="State" />
                </p>
              </div>
            )}
            {(job as any).salaryNotDisclose && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-sm font-extrabold text-navy-950">
                  <Bi hi="गोपनीय" en="Not Disclosed" />
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="वेतन" en="Salary" />
                </p>
              </div>
            )}
            {job.applicationStartDate && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-sm font-extrabold text-navy-950 tnum">
                  {new Date(job.applicationStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="शुरू" en="Start Date" />
                </p>
              </div>
            )}
            {job.applicationLastDate && (
              <div className="bg-surface px-4 py-3 text-center">
                <p className="text-sm font-extrabold text-navy-950 tnum">
                  {lastDate!.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  <Bi hi="अंतिम तारीख" en="Last Date" />
                </p>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {(job as any).jobType === "private" && ((job as any).companyWebsite || (job as any).companyIndustry || (job as any).companySize || (job as any).companyLocation || (job as any).recruiterName || (job as any).recruiterEmail || (job as any).recruiterPhone) && (() => {
        const j = job as any;
        const companyWebsite = j.companyWebsite || "";
        const websiteUrl = companyWebsite.startsWith("http") ? companyWebsite : "https://" + companyWebsite;

        const rows: Array<{ hi: string; en: string; value: React.ReactNode }> = [];
        if (j.companyWebsite) rows.push({ hi: "वेबसाइट", en: "Website", value: <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-saffron-600 hover:underline break-all"><Bi hi={companyWebsite} en={companyWebsite} /></a> });
        if (j.companyIndustry) rows.push({ hi: "उद्योग", en: "Industry", value: <Bi hi={j.companyIndustry} en={j.companyIndustry} /> });
        if (j.companySize) rows.push({ hi: "कंपनी आकार", en: "Company Size", value: <Bi hi={j.companySize} en={j.companySize} /> });
        if (j.companyLocation) rows.push({ hi: "स्थान", en: "Location", value: <Bi hi={j.companyLocation} en={j.companyLocation} /> });
        if (j.recruiterName) rows.push({ hi: "भर्ती व्यक्ति", en: "Recruiter", value: <Bi hi={j.recruiterName} en={j.recruiterName} /> });
        if (j.recruiterEmail) rows.push({ hi: "ईमेल", en: "Email", value: <a href={`mailto:${j.recruiterEmail}`} className="text-saffron-600 hover:underline"><Bi hi={j.recruiterEmail} en={j.recruiterEmail} /></a> });
        if (j.recruiterPhone) rows.push({ hi: "फोन", en: "Phone", value: <a href={`tel:${j.recruiterPhone}`} className="text-saffron-600 hover:underline"><Bi hi={j.recruiterPhone} en={j.recruiterPhone} /></a> });

        return (
          <Reveal>
            <div className="mt-6 rounded-2xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-navy-950">
                <Bi hi="कंपनी की जानकारी" en="Company Information" />
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rows.map((r, i) => (
                  <FactRow key={i} hi={r.hi} en={r.en} value={r.value} />
                ))}
              </div>
            </div>
          </Reveal>
        );
      })()}

      <AdSection ads={undefined} className="mt-6" />

      <JobBlockRenderer blocks={job.blocks || []} />

      {related.length > 0 && (
        <section className="mt-12">
          <Reveal>
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-ink-soft">
              <Bi hi="संबंधित नौकरियां" en="Related Jobs" />
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 70}>
                <JobCard job={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function FactRow({ hi, en, value }: { hi: string; en: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
        <Bi hi={hi} en={en} />
      </span>
      <span className="text-sm font-extrabold text-navy-900">
        {value}
      </span>
    </div>
  );
}
