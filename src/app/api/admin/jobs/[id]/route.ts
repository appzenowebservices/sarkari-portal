import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection, withId } from "@/db";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ id: string }> };

function generateJobSEO(opts: {
  titleHi: string;
  titleEn: string;
  shortDescriptionHi: string;
  shortDescriptionEn: string;
  descriptionHi: string;
  descriptionEn: string;
  categoryNameHi: string;
  categoryNameEn: string;
  organizationNameHi: string;
  organizationNameEn: string;
  slug: string;
  state: string;
  minimumQualification: string;
  totalVacancies: number;
  applicationLastDate: string;
}): {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  schemaType: string;
  robots: string;
} {
  const raw = [
    opts.titleEn,
    opts.titleHi,
    opts.organizationNameEn,
    opts.categoryNameEn,
    opts.state,
    opts.minimumQualification,
    opts.totalVacancies > 0 ? `${opts.totalVacancies} vacancies` : "",
    opts.applicationLastDate ? `Apply before ${opts.applicationLastDate}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stopWords = new Set([
    "the","and","for","with","from","this","that","have","has","been","will","can","are","was","were","not","but","you","your","our","their","his","her","its","all","any","each","every","both","few","more","most","other","some","such","than","too","very","just","because","but","or","if","while","about","into","through","during","before","after","above","below","between","under","again","further","then","once","here","there","when","where","why","how","what","which","who","whom","also","now","today","new","old","best","top","free","full","online","official","website","home","page","click","here","visit","open","use","using","used","one","two","make","made","get","got","like","know","see","look","come","way","need","want","good","great","right","still","thing","things","something","anything","everything","nothing",
    "का","के","की","में","से","पर","को","ने","या","है","हैं","था","थे","थी","कर","करे","किया","किए","करें","करता","करती","करते","ले","लिया","लिए","पानी","पाया","पाएं","जाए","जाएं","जा","हो","हों","होता","होती","होते","सकता","सकती","सकते","रहा","रहे","रही","रहें","दो","दे","दिया","दिए","दें","बन","बना","बने","बनाए","बनाना","लग","लगा","लगे","लगी","आ","आए","आएं","आता","आती","आते","चाहिए","चाहते","चाहता","सक","सके","पड़","पड़ा","पड़े","हुआ","हुई","हुए","हुआ","होना","होने","किया","की","करेगा","करेंगे","करेंगी","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें"
  ]);

  const words = raw
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const unique = Array.from(new Set(words));
  const focusKeyword = unique.slice(0, 3).join(", ") || opts.slug.replace(/-/g, " ");
  const keywords = unique.slice(0, 10).join(", ");

  const seoTitle = `${opts.titleEn} – Vacancy, Eligibility & Apply Online | APPZENO Sarkari Portal`;
  const metaDescription = [
    opts.shortDescriptionEn || opts.descriptionEn || `Check ${opts.titleEn} details including vacancies, eligibility, age limit, important dates, application process and official notification.`,
    opts.totalVacancies > 0 ? `${opts.totalVacancies} vacancies.` : "",
    opts.minimumQualification ? `Qualification: ${opts.minimumQualification}.` : "",
    opts.applicationLastDate ? `Last date: ${opts.applicationLastDate}.` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 160);

  const ogTitle = seoTitle;
  const ogDescription = metaDescription;
  const canonicalUrl = `/job/${opts.slug}`;

  return {
    seoTitle,
    metaDescription,
    focusKeyword,
    ogTitle,
    ogDescription,
    canonicalUrl,
    schemaType: "JobPosting",
    robots: "index, follow",
  };
}

export async function GET(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  try {
    const jobs = await getJobsCollection();
    const job = await jobs.findOne({ _id: new ObjectId(id) });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, job: withId(job) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const jobs = await getJobsCollection();
  const current = await jobs.findOne({ _id: new ObjectId(id) });
  if (!current) {
    return NextResponse.json({ ok: false, error: "नौकरी नहीं मिली" }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.titleHi === "string" && body.titleHi.trim()) patch.titleHi = body.titleHi.trim();
  if (typeof body.titleEn === "string" && body.titleEn.trim()) patch.titleEn = body.titleEn.trim();
  if (typeof body.shortDescriptionHi === "string") patch.shortDescriptionHi = body.shortDescriptionHi.trim();
  if (typeof body.shortDescriptionEn === "string") patch.shortDescriptionEn = body.shortDescriptionEn.trim();
  if (typeof body.descriptionHi === "string") patch.descriptionHi = body.descriptionHi.trim();
  if (typeof body.descriptionEn === "string") patch.descriptionEn = body.descriptionEn.trim();
  if (typeof body.department === "string") patch.department = body.department.trim();
  if (typeof body.postNameHi === "string") patch.postNameHi = body.postNameHi.trim();
  if (typeof body.postNameEn === "string") patch.postNameEn = body.postNameEn.trim();
  if (typeof body.jobType === "string" && body.jobType.trim()) patch.jobType = body.jobType.trim();
  if (typeof body.employmentType === "string" && body.employmentType.trim()) patch.employmentType = body.employmentType.trim();
  if (typeof body.sector === "string") patch.sector = body.sector.trim();
  if (typeof body.isGovernment === "boolean") patch.isGovernment = body.isGovernment;
  if (typeof body.recruitmentBoard === "string") patch.recruitmentBoard = body.recruitmentBoard.trim();
  if (typeof body.advertisementNumber === "string") patch.advertisementNumber = body.advertisementNumber.trim();
  if (typeof body.totalVacancies === "number") patch.totalVacancies = body.totalVacancies;
  if (typeof body.maleVacancies === "number") patch.maleVacancies = body.maleVacancies;
  if (typeof body.femaleVacancies === "string") patch.femaleVacancies = body.femaleVacancies.trim();
  if (typeof body.generalVacancies === "number") patch.generalVacancies = body.generalVacancies;
  if (typeof body.obcVacancies === "number") patch.obcVacancies = body.obcVacancies;
  if (typeof body.scVacancies === "number") patch.scVacancies = body.scVacancies;
  if (typeof body.stVacancies === "number") patch.stVacancies = body.stVacancies;
  if (typeof body.ewsVacancies === "number") patch.ewsVacancies = body.ewsVacancies;
  if (typeof body.pwdVacancies === "number") patch.pwdVacancies = body.pwdVacancies;
  if (typeof body.exServicemenVacancies === "number") patch.exServicemenVacancies = body.exServicemenVacancies;
  if (typeof body.otherReservationVacancies === "string") patch.otherReservationVacancies = body.otherReservationVacancies.trim();
  if (typeof body.minimumQualification === "string") patch.minimumQualification = body.minimumQualification.trim();
  if (typeof body.maximumQualification === "string") patch.maximumQualification = body.maximumQualification.trim();
  if (typeof body.minimumAge === "number") patch.minimumAge = body.minimumAge;
  if (typeof body.maximumAge === "number") patch.maximumAge = body.maximumAge;
  if (typeof body.applicationFeeGeneral === "number") patch.applicationFeeGeneral = body.applicationFeeGeneral;
  if (typeof body.applicationFeeOBC === "number") patch.applicationFeeOBC = body.applicationFeeOBC;
  if (typeof body.applicationFeeSC === "number") patch.applicationFeeSC = body.applicationFeeSC;
  if (typeof body.applicationFeeST === "number") patch.applicationFeeST = body.applicationFeeST;
  if (typeof body.applicationStartDate === "string") patch.applicationStartDate = body.applicationStartDate.trim();
  if (typeof body.applicationLastDate === "string") patch.applicationLastDate = body.applicationLastDate.trim();
  if (typeof body.notificationDate === "string") patch.notificationDate = body.notificationDate.trim();
  if (typeof body.status === "string" && body.status.trim()) patch.status = body.status.trim();
  if (typeof body.isFeatured === "boolean") patch.isFeatured = body.isFeatured;
  if (typeof body.isUrgent === "boolean") patch.isUrgent = body.isUrgent;
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.state === "string") patch.state = body.state.trim();
  if (Array.isArray(body.locationNames)) {
    patch.locationNames = body.locationNames.map((ln: unknown) => String(ln).trim());
  }
  if (typeof body.applyUrl === "string") patch.applyUrl = body.applyUrl.trim();
  if (typeof body.notificationUrl === "string") patch.notificationUrl = body.notificationUrl.trim();
  if (typeof body.tags === "string") patch.tags = body.tags.trim();
  if (typeof body.template === "string") patch.template = body.template.trim();
  if (Array.isArray(body.blocks)) {
    patch.blocks = body.blocks;
  }
  if (typeof body.seoTitle === "string" && body.seoTitle.trim()) patch.seoTitle = body.seoTitle.trim();
  if (typeof body.metaDescription === "string") patch.metaDescription = body.metaDescription.trim();
  if (typeof body.focusKeyword === "string") patch.focusKeyword = body.focusKeyword.trim();
  if (typeof body.ogTitle === "string" && body.ogTitle.trim()) patch.ogTitle = body.ogTitle.trim();
  if (typeof body.ogDescription === "string") patch.ogDescription = body.ogDescription.trim();
  if (typeof body.ogImage === "string") patch.ogImage = body.ogImage.trim();
  if (typeof body.canonicalUrl === "string" && body.canonicalUrl.trim()) patch.canonicalUrl = body.canonicalUrl.trim();
  if (typeof body.robots === "string" && body.robots.trim()) patch.robots = body.robots.trim();
  if (typeof body.schemaType === "string" && body.schemaType.trim()) patch.schemaType = body.schemaType.trim();
  if (typeof body.publishedAt === "string" && body.publishedAt.trim()) patch.publishedAt = new Date(body.publishedAt);
  if (typeof body.expiredAt === "string" && body.expiredAt.trim()) patch.expiredAt = new Date(body.expiredAt);

  // Private job fields
  if (typeof body.companyNameEn === "string") patch.companyNameEn = body.companyNameEn.trim();
  if (typeof body.companyNameHi === "string") patch.companyNameHi = body.companyNameHi.trim();
  if (typeof body.companyLogo === "string") patch.companyLogo = body.companyLogo.trim();
  if (typeof body.companyWebsite === "string") patch.companyWebsite = body.companyWebsite.trim();
  if (typeof body.companyIndustry === "string") patch.companyIndustry = body.companyIndustry.trim();
  if (typeof body.companySize === "string") patch.companySize = body.companySize.trim();
  if (typeof body.companyLocation === "string") patch.companyLocation = body.companyLocation.trim();
  if (typeof body.recruiterName === "string") patch.recruiterName = body.recruiterName.trim();
  if (typeof body.recruiterEmail === "string") patch.recruiterEmail = body.recruiterEmail.trim();
  if (typeof body.recruiterPhone === "string") patch.recruiterPhone = body.recruiterPhone.trim();
  if (typeof body.employmentType === "string") patch.employmentType = body.employmentType.trim();
  if (typeof body.workMode === "string") patch.workMode = body.workMode.trim();
  if (typeof body.vacancies === "number") patch.vacancies = body.vacancies;
  if (typeof body.experienceFrom === "number") patch.experienceFrom = body.experienceFrom;
  if (typeof body.experienceTo === "number") patch.experienceTo = body.experienceTo;
  if (Array.isArray(body.qualifications)) patch.qualifications = body.qualifications.map((q: unknown) => String(q));
  if (typeof body.salaryType === "string") patch.salaryType = body.salaryType.trim();
  if (typeof body.salaryMin === "number") patch.salaryMin = body.salaryMin;
  if (typeof body.salaryMax === "number") patch.salaryMax = body.salaryMax;
  if (typeof body.salaryPeriod === "string") patch.salaryPeriod = body.salaryPeriod.trim();
  if (body.salaryNotDisclose !== undefined) patch.salaryNotDisclose = body.salaryNotDisclose === true;
  if (body.salaryNegotiable !== undefined) patch.salaryNegotiable = body.salaryNegotiable === true;
  if (typeof body.incentives === "string") patch.incentives = body.incentives.trim();
  if (Array.isArray(body.benefits)) patch.benefits = body.benefits.map((b: unknown) => String(b));
  if (typeof body.applyMethod === "string") patch.applyMethod = body.applyMethod.trim();
  if (typeof body.externalUrl === "string") patch.externalUrl = body.externalUrl.trim();
  if (typeof body.applicationEmail === "string") patch.applicationEmail = body.applicationEmail.trim();
  if (typeof body.applicationInstructions === "string") patch.applicationInstructions = body.applicationInstructions.trim();
  if (typeof body.walkInDate === "string") patch.walkInDate = body.walkInDate.trim();
  if (typeof body.walkInStartTime === "string") patch.walkInStartTime = body.walkInStartTime.trim();
  if (typeof body.walkInEndTime === "string") patch.walkInEndTime = body.walkInEndTime.trim();
  if (typeof body.walkInVenue === "string") patch.walkInVenue = body.walkInVenue.trim();
  if (typeof body.walkInAddress === "string") patch.walkInAddress = body.walkInAddress.trim();
  if (typeof body.walkInContactPerson === "string") patch.walkInContactPerson = body.walkInContactPerson.trim();
  if (typeof body.walkInContactNumber === "string") patch.walkInContactNumber = body.walkInContactNumber.trim();
  if (typeof body.walkInDocuments === "string") patch.walkInDocuments = body.walkInDocuments.trim();
  if (typeof body.walkInInstructions === "string") patch.walkInInstructions = body.walkInInstructions.trim();
  if (typeof body.genderPreference === "string") patch.genderPreference = body.genderPreference.trim();
  if (typeof body.ageFrom === "number") patch.ageFrom = body.ageFrom;
  if (typeof body.ageTo === "number") patch.ageTo = body.ageTo;
  if (typeof body.languageRequirement === "string") patch.languageRequirement = body.languageRequirement.trim();
  if (body.travelRequired !== undefined) patch.travelRequired = body.travelRequired === true;
  if (body.willingToRelocate !== undefined) patch.willingToRelocate = body.willingToRelocate === true;
  if (body.drivingLicenseRequired !== undefined) patch.drivingLicenseRequired = body.drivingLicenseRequired === true;
  if (body.vehicleRequired !== undefined) patch.vehicleRequired = body.vehicleRequired === true;
  if (typeof body.shiftType === "string") patch.shiftType = body.shiftType.trim();
  if (typeof body.workingHours === "string") patch.workingHours = body.workingHours.trim();
  if (typeof body.applicationLimit === "number") patch.applicationLimit = body.applicationLimit;

  const seoFields = ["titleHi", "titleEn", "shortDescriptionHi", "shortDescriptionEn", "descriptionHi", "descriptionEn", "categoryNameHi", "categoryNameEn", "organizationNameHi", "organizationNameEn", "state", "minimumQualification", "totalVacancies", "applicationLastDate"];
  const needsSeoUpdate = seoFields.some((f) => f in patch);
  if (needsSeoUpdate) {
    const seo = generateJobSEO({
      titleHi: (patch.titleHi as string) || current.titleHi,
      titleEn: (patch.titleEn as string) || current.titleEn,
      shortDescriptionHi: (patch.shortDescriptionHi as string) || current.shortDescriptionHi || "",
      shortDescriptionEn: (patch.shortDescriptionEn as string) || current.shortDescriptionEn || "",
      descriptionHi: (patch.descriptionHi as string) || current.descriptionHi || "",
      descriptionEn: (patch.descriptionEn as string) || current.descriptionEn || "",
      categoryNameHi: (patch.categoryNameHi as string) || current.categoryNameHi || "",
      categoryNameEn: (patch.categoryNameEn as string) || current.categoryNameEn || "",
      organizationNameHi: (patch.organizationNameHi as string) || current.organizationNameHi || "",
      organizationNameEn: (patch.organizationNameEn as string) || current.organizationNameEn || "",
      slug: current.slug,
      state: (patch.state as string) || current.state || "",
      minimumQualification: (patch.minimumQualification as string) || current.minimumQualification || "",
      totalVacancies: (patch.totalVacancies as number) ?? current.totalVacancies ?? 0,
      applicationLastDate: (patch.applicationLastDate as string) || current.applicationLastDate || "",
    });
    if (!("seoTitle" in patch)) patch.seoTitle = seo.seoTitle;
    if (!("metaDescription" in patch)) patch.metaDescription = seo.metaDescription;
    if (!("focusKeyword" in patch)) patch.focusKeyword = seo.focusKeyword;
    if (!("ogTitle" in patch)) patch.ogTitle = seo.ogTitle;
    if (!("ogDescription" in patch)) patch.ogDescription = seo.ogDescription;
    if (!("canonicalUrl" in patch)) patch.canonicalUrl = seo.canonicalUrl;
    if (!("schemaType" in patch)) patch.schemaType = seo.schemaType;
    if (!("robots" in patch)) patch.robots = seo.robots;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "कोई बदलाव नहीं" }, { status: 400 });
  }

  patch.updatedAt = new Date();

  try {
    const updated = await jobs.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const job = updated ? withId(updated) : null;
    if (!job) return NextResponse.json({ ok: false, error: "नौकरी नहीं मिली" }, { status: 404 });

    return NextResponse.json({ ok: true, job });
  } catch (e) {
    const message = e instanceof Error ? e.message : "डेटाबेस त्रुटि";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  }

  const {
    getJobVacanciesCollection,
    getJobDatesCollection,
    getJobEligibilitiesCollection,
    getJobFeesCollection,
    getJobLinksCollection,
    getJobDocumentsCollection,
    getJobSelectionProcessCollection,
    getJobFAQsCollection,
    getJobClicksCollection,
    getJobViewsCollection,
    getJobHistoryCollection,
    getJobSocialPostsCollection,
  } = await import("@/db");

  const jobs = await getJobsCollection();
  const targetId = new ObjectId(id);

  await Promise.all([
    (await getJobVacanciesCollection()).deleteMany({ jobId: targetId }),
    (await getJobDatesCollection()).deleteMany({ jobId: targetId }),
    (await getJobEligibilitiesCollection()).deleteMany({ jobId: targetId }),
    (await getJobFeesCollection()).deleteMany({ jobId: targetId }),
    (await getJobLinksCollection()).deleteMany({ jobId: targetId }),
    (await getJobDocumentsCollection()).deleteMany({ jobId: targetId }),
    (await getJobSelectionProcessCollection()).deleteMany({ jobId: targetId }),
    (await getJobFAQsCollection()).deleteMany({ jobId: targetId }),
    (await getJobClicksCollection()).deleteMany({ jobId: targetId }),
    (await getJobViewsCollection()).deleteMany({ jobId: targetId }),
    (await getJobHistoryCollection()).deleteMany({ jobId: targetId }),
    (await getJobSocialPostsCollection()).deleteMany({ jobId: targetId }),
  ]);

  await jobs.deleteOne({ _id: targetId });
  return NextResponse.json({ ok: true });
}
