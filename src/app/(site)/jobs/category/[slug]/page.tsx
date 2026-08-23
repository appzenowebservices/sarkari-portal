import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { JobCard } from "@/components/job-card";
import { getPublicJobs, getJobCategories, getSettings } from "@/lib/data";
import type { JobCategory, Job } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const categories = await getJobCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return { title: "Category Not Found" };
    return {
      title: `${category.titleEn} Jobs — ${category.titleHi} | APPZENO Sarkari Portal`,
      description: category.metaDescription || category.descriptionEn || `Latest ${category.titleEn} jobs and recruitment notifications`,
    };
  } catch {
    return { title: "Category Not Found" };
  }
}

export default async function JobCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let categories: JobCategory[] = [];
  let jobs: Job[] = [];
  let category: JobCategory | undefined;

  try {
    categories = await getJobCategories();
    category = categories.find((c) => c.slug === slug);
    if (!category) return notFound();
    jobs = await getPublicJobs({ categoryId: category.id, limit: 50 });
  } catch {
    return notFound();
  }

  if (!category) return notFound();

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
            <Bi hi={category.titleHi} en={category.titleEn} />
          </span>
        </nav>
      </Reveal>

      <Reveal>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            <Bi hi={category.titleHi} en={category.titleEn} />
          </h1>
          {category.descriptionHi || category.descriptionEn ? (
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              <Bi hi={category.descriptionHi} en={category.descriptionEn} />
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
            <Bi hi="इस श्रेणी में कोई नौकरी नहीं" en="No jobs in this category" />
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
