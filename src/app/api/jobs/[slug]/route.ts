import { NextResponse } from "next/server";
import { getJobsCollection } from "@/db";
import {
  getJobVacanciesCollection,
  getJobDatesCollection,
  getJobEligibilitiesCollection,
  getJobFeesCollection,
  getJobLinksCollection,
  getJobDocumentsCollection,
  getJobSelectionProcessCollection,
  getJobFAQsCollection,
  getJobCategoriesCollection,
  getJobOrganizationsCollection,
  getJobLocationsCollection,
  getJobTagsCollection,
  withId,
} from "@/db";
import { ObjectId } from "mongodb";
import type { JobWithDetails } from "@/db/schema";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const jobs = await getJobsCollection();

  const job = await jobs.findOne({ slug });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await jobs.findOneAndUpdate(
    { slug },
    { $inc: { viewCount: 1 } }
  );

  const [
    jobCategories,
    jobOrganizations,
    jobVacancies,
    jobDates,
    jobEligibilities,
    jobFees,
    jobLinks,
    jobDocuments,
    jobSelectionProcess,
    jobFaqs,
    jobTags,
    jobLocations,
  ] = await Promise.all([
    getJobCategoriesCollection(),
    getJobOrganizationsCollection(),
    getJobVacanciesCollection(),
    getJobDatesCollection(),
    getJobEligibilitiesCollection(),
    getJobFeesCollection(),
    getJobLinksCollection(),
    getJobDocumentsCollection(),
    getJobSelectionProcessCollection(),
    getJobFAQsCollection(),
    getJobTagsCollection(),
    getJobLocationsCollection(),
  ]);

  const [cat, org, vacancies, dates, eligDocs, fees, links, documents, selectionProcess, faqs] = await Promise.all([
    jobCategories.findOne({ _id: job.categoryId }),
    jobOrganizations.findOne({ _id: job.organizationId }),
    jobVacancies.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobDates.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobEligibilities.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobFees.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobLinks.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobDocuments.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobSelectionProcess.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
    jobFaqs.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray(),
  ]);

  const tagIds = (job.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);
  const tags = tagIds.length
    ? await jobTags.find({ _id: { $in: tagIds.map((id: string) => new ObjectId(id)) } }).toArray()
    : [];

  const locationIds = (job.locationIds ?? []).map((id: string) => new ObjectId(id));
  const locations = locationIds.length
    ? await jobLocations.find({ _id: { $in: locationIds } }).toArray()
    : [];

  const result: JobWithDetails = {
    ...withId(job),
    vacancies: vacancies.map(withId),
    dates: dates.map(withId),
    eligibility: eligDocs.map(withId),
    fees: fees.map(withId),
    links: links.map(withId),
    documents: documents.map(withId),
    selectionProcess: selectionProcess.map(withId),
    faqs: faqs.map(withId),
    categories: cat ? [{ slug: cat.slug, titleHi: cat.titleHi, titleEn: cat.titleEn, color: cat.color, icon: cat.icon }] : [],
    organizations: org ? [{ slug: org.slug, nameHi: org.nameHi, nameEn: org.nameEn }] : [],
    locations: locations.map((l) => ({ slug: l.slug, titleHi: l.titleHi, titleEn: l.titleEn })),
    tagsList: tags.map((t) => ({ nameHi: t.nameHi, nameEn: t.nameEn, slug: t.slug })),
  };

  return NextResponse.json(result);
}
