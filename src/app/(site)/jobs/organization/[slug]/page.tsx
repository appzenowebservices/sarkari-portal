import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { JobCard } from "@/components/job-card";
import { getPublicJobs, getJobOrganizations } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const orgs = await getJobOrganizations();
  const org = orgs.find((o) => o.slug === slug);
  if (!org) return { title: "Organization Not Found" };
  return {
    title: `${org.nameEn} Jobs — ${org.nameHi} | APPZENO Sarkari Portal`,
    description: org.descriptionEn || `Latest jobs and recruitment notifications from ${org.nameEn}`,
  };
}

export default async function JobOrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const orgs = await getJobOrganizations();
  const org = orgs.find((o) => o.slug === slug);
  if (!org) return notFound();

  const jobs = await getPublicJobs({ organizationId: org.id, limit: 50 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
            <Bi hi={org.nameHi} en={org.nameEn} />
          </span>
        </nav>
      </Reveal>

      <Reveal>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            <Bi hi={org.nameHi} en={org.nameEn} />
          </h1>
          {org.abbreviation && (
            <p className="mt-1 text-sm font-semibold text-ink-soft">({org.abbreviation})</p>
          )}
          {org.descriptionHi || org.descriptionEn ? (
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              <Bi hi={org.descriptionHi} en={org.descriptionEn} />
            </p>
          ) : null}
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <Bi hi={`कुल ${jobs.length} नौकरियां`} en={`${jobs.length} jobs found`} />
          </p>
        </div>
      </Reveal>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-300 bg-surface p-10 text-center">
          <Icon name="inbox" size={40} className="mx-auto text-navy-300" />
          <h2 className="mt-4 text-lg font-extrabold text-navy-900">
            <Bi hi="इस संस्था में कोई नौकरी नहीं" en="No jobs from this organization" />
          </h2>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <Reveal key={job.id} delay={(i % 3) * 70}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
