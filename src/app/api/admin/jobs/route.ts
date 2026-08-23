import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection, withId } from "@/db";
import { slugify } from "@/lib/utils";
import { ObjectId } from "mongodb";

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
    "का","के","की","में","से","पर","को","ने","या","है","हैं","था","थे","थी","कर","करे","किया","किए","करें","करता","करती","करते","ले","लिया","लिए","पानी","पाया","पाएं","जाए","जाएं","जा","हो","हों","होता","होती","होते","सकता","सकती","सकते","रहा","रहे","रही","रहें","दो","दे","दिया","दिए","दें","बन","बना","बने","बनाए","बनाना","लग","लगा","लगे","लगी","आ","आए","आएं","आता","आती","आते","चाहिए","चाहते","चाहता","सक","सके","पड़","पड़ा","पड़े","हुआ","हुई","हुए","हुआ","होना","होने","किया","की","करेगा","करेंगे","करेंगी","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें",
    "अपना","अपनी","अपने","हम","हमारा","हमारी","हमारे","तुम","तुम्हारा","तुम्हारी","तुम्हारे","वह","वो","उसका","उसकी","उसके","इसका","इसकी","इसके","जो","जिस","जिसे","जहां","जैसे","तो","क्योंकि","कि","ही","भी","तक","फिर","बाद","पहले","साथ","सामने","नीचे","ऊपर","बाईं","दाईं","पूरे","सिर्फ","केवल","हर","किसी","किस","कुछ","बहुत","थोड़ा","ज्यादा","कम","अधिक","सारा","सारी","सारे","पूरा","पूरी","पूरे","नया","नई","नए","पुराना","पुरानी","पुराने","बड़ा","बड़ी","बड़े","छोटा","छोटी","छोटे","अच्छा","अच्छी","अच्छे","बुरा","बुरी","बुरे","सरल","आसान","कठिन","जरूरी","महत्वपूर्ण","जरूर","अवश्य","शायद","होना","है","था","था","होगा","होगी","होंगे","हुआ","हुई","हुए","होता","होती","होते","हों","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें"
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

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await getJobsCollection();
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limitParam = url.searchParams.get("limit") || "20";
  const limit = limitParam === "all" ? 0 : Math.min(200, Math.max(1, parseInt(limitParam, 10) || 20));
  const skip = limit > 0 ? (page - 1) * limit : 0;
  const sort = url.searchParams.get("sort") || "newest";

  let sortObj: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };
  if (sort === "lastdate") sortObj = { applicationLastDate: 1, _id: -1 };
  else if (sort === "vacancies") sortObj = { totalVacancies: -1, _id: -1 };
  else if (sort === "title") sortObj = { titleEn: 1, _id: -1 };

  const [total, rows] = await Promise.all([
    jobs.countDocuments({}),
    limit > 0
      ? jobs.find({}).sort(sortObj).skip(skip).limit(limit).toArray()
      : jobs.find({}).sort(sortObj).toArray(),
  ]);

  const results = rows.map((job) => ({
    id: job._id.toString(),
    slug: job.slug,
    titleHi: job.titleHi,
    titleEn: job.titleEn,
    categoryId: job.categoryId?.toString?.() || job.categoryId,
    organizationId: job.organizationId?.toString?.() || job.organizationId,
    categoryNameHi: job.categoryNameHi,
    categoryNameEn: job.categoryNameEn,
    organizationNameHi: job.organizationNameHi,
    organizationNameEn: job.organizationNameEn,
    jobType: job.jobType,
    status: job.status,
    isActive: job.isActive,
    isPublished: job.isActive,
    isFeatured: job.isFeatured,
    isUrgent: job.isUrgent,
    applicationStartDate: job.applicationStartDate,
    applicationLastDate: job.applicationLastDate,
    sortOrder: job.sortOrder,
    totalVacancies: job.totalVacancies,
    minimumQualification: job.minimumQualification,
    minimumAge: job.minimumAge,
    maximumAge: job.maximumAge,
    locationNames: job.locationNames,
    applicationFeeGeneral: job.applicationFeeGeneral,
    applicationFeeOBC: job.applicationFeeOBC,
    applicationFeeSC: job.applicationFeeSC,
    applicationFeeST: job.applicationFeeST,
    applyUrl: job.applyUrl,
    notificationUrl: job.notificationUrl,
    tags: job.tags,
    viewCount: job.viewCount,
    clickCount: job.clickCount + job.applyClickCount + job.notificationClickCount + job.websiteClickCount,
    createdAt: job.createdAt,
  }));

  return NextResponse.json({ jobs: results, total, page, limit });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const titleHi = String(body.titleHi ?? "").trim();
  const titleEn = String(body.titleEn ?? "").trim();
  const categoryId = String(body.categoryId ?? "").trim();
  const organizationId = String(body.organizationId ?? "").trim();

  if (!titleHi || !titleEn) {
    return NextResponse.json(
      { ok: false, error: "titleHi और titleEn ज़रूरी हैं" },
      { status: 400 }
    );
  }

  const slug = slugify(titleEn) || `job-${Date.now()}`;
  const jobs = await getJobsCollection();
  const existing = await jobs.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `Slug "job/${slug}" पहले से मौजूद है` },
      { status: 409 }
    );
  }

  const seo = generateJobSEO({
    titleHi,
    titleEn,
    shortDescriptionHi: String(body.shortDescriptionHi ?? "").trim(),
    shortDescriptionEn: String(body.shortDescriptionEn ?? "").trim(),
    descriptionHi: String(body.descriptionHi ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? "").trim(),
    categoryNameHi: String(body.categoryNameHi ?? "").trim(),
    categoryNameEn: String(body.categoryNameEn ?? "").trim(),
    organizationNameHi: String(body.organizationNameHi ?? "").trim(),
    organizationNameEn: String(body.organizationNameEn ?? "").trim(),
    slug,
    state: String(body.state ?? "").trim(),
    minimumQualification: String(body.minimumQualification ?? "").trim(),
    totalVacancies: typeof body.totalVacancies === "number" ? body.totalVacancies : 0,
    applicationLastDate: String(body.applicationLastDate ?? "").trim(),
  });

  let orgObjectId: ObjectId | undefined;
  let catObjectId: ObjectId | undefined;
  try {
    if (organizationId) orgObjectId = new ObjectId(organizationId);
    if (categoryId) catObjectId = new ObjectId(categoryId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "अमान्य ID";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const doc = {
    slug,
    titleHi,
    titleEn,
    shortDescriptionHi: String(body.shortDescriptionHi ?? "").trim(),
    shortDescriptionEn: String(body.shortDescriptionEn ?? "").trim(),
     organizationId: orgObjectId,
     organizationNameHi: String(body.organizationNameHi || body.companyNameHi || body.companyName || "").trim(),
     organizationNameEn: String(body.organizationNameEn || body.companyNameEn || body.companyName || "").trim(),
    categoryId: catObjectId,
    categoryNameHi: String(body.categoryNameHi ?? "").trim(),
    categoryNameEn: String(body.categoryNameEn ?? "").trim(),
    jobType: String(body.jobType ?? "government").trim(),
    sector: String(body.sector ?? "").trim(),
    state: String(body.state ?? "").trim(),
    locationNames: Array.isArray(body.locationNames) ? body.locationNames.map((n: unknown) => String(n).trim()) : [],
    applicationStartDate: String(body.applicationStartDate ?? "").trim(),
    applicationLastDate: String(body.applicationLastDate ?? "").trim(),
    notificationDate: String(body.notificationDate ?? "").trim(),
    totalVacancies: typeof body.totalVacancies === "number" ? body.totalVacancies : 0,
    minimumQualification: String(body.minimumQualification ?? "").trim(),
    maximumQualification: String(body.maximumQualification ?? "").trim(),
    minimumAge: typeof body.minimumAge === "number" ? body.minimumAge : 0,
    maximumAge: typeof body.maximumAge === "number" ? body.maximumAge : 0,
    applicationFeeGeneral: typeof body.applicationFeeGeneral === "number" ? body.applicationFeeGeneral : 0,
    applicationFeeOBC: typeof body.applicationFeeOBC === "number" ? body.applicationFeeOBC : 0,
    applicationFeeSC: typeof body.applicationFeeSC === "number" ? body.applicationFeeSC : 0,
    applicationFeeST: typeof body.applicationFeeST === "number" ? body.applicationFeeST : 0,
    applyUrl: String(body.applyUrl ?? "").trim(),
    notificationUrl: String(body.notificationUrl ?? "").trim(),
    status: String(body.status ?? "draft").trim(),
    isFeatured: body.isFeatured === true,
    isUrgent: body.isUrgent === true,
    isActive: body.isActive !== false,
    template: String(body.template ?? "government").trim(),
    blocks: Array.isArray(body.blocks) ? body.blocks : [],
    ...seo,
    seoTitle: String(body.seoTitle ?? seo.seoTitle).trim(),
    metaDescription: String(body.metaDescription ?? seo.metaDescription).trim(),
    focusKeyword: String(body.focusKeyword ?? seo.focusKeyword).trim(),
    ogTitle: String(body.ogTitle ?? seo.ogTitle).trim(),
    ogDescription: String(body.ogDescription ?? seo.ogDescription).trim(),
    ogImage: String(body.ogImage ?? "").trim(),
    canonicalUrl: String(body.canonicalUrl ?? seo.canonicalUrl).trim(),
    robots: String(body.robots ?? seo.robots).trim(),
    schemaType: String(body.schemaType ?? seo.schemaType).trim(),
    tags: String(body.tags ?? seo.focusKeyword).trim(),
    viewCount: 0,
    applyClickCount: 0,
    notificationClickCount: 0,
    websiteClickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : null,
    expiredAt: body.expiredAt ? new Date(String(body.expiredAt)) : null,
    // Private job fields
    companyNameEn: String(body.companyName || body.companyNameEn || body.organizationNameEn || "").trim(),
    companyNameHi: String(body.companyName || body.companyNameHi || body.organizationNameHi || "").trim(),
    companyLogo: String(body.companyLogo ?? "").trim(),
    companyWebsite: String(body.companyWebsite ?? "").trim(),
    companyIndustry: String(body.companyIndustry ?? "").trim(),
    companySize: String(body.companySize ?? "").trim(),
    companyLocation: String(body.companyLocation ?? "").trim(),
    recruiterName: String(body.recruiterName ?? "").trim(),
    recruiterEmail: String(body.recruiterEmail ?? "").trim(),
    recruiterPhone: String(body.recruiterPhone ?? "").trim(),
    employmentType: String(body.employmentType ?? "").trim(),
    workMode: String(body.workMode ?? "").trim(),
    vacancies: typeof body.vacancies === "number" ? body.vacancies : (typeof body.totalVacancies === "number" ? body.totalVacancies : 0),
    experienceFrom: typeof body.experienceFrom === "number" ? body.experienceFrom : 0,
    experienceTo: typeof body.experienceTo === "number" ? body.experienceTo : 0,
    qualifications: Array.isArray(body.qualifications) ? body.qualifications.map((q: unknown) => String(q)) : [],
    salaryType: String(body.salaryType ?? "").trim(),
    salaryMin: typeof body.salaryMin === "number" ? body.salaryMin : 0,
    salaryMax: typeof body.salaryMax === "number" ? body.salaryMax : 0,
    salaryPeriod: String(body.salaryPeriod ?? "").trim(),
    salaryNotDisclose: body.salaryNotDisclose === true,
    salaryNegotiable: body.salaryNegotiable === true,
    incentives: String(body.incentives ?? "").trim(),
    benefits: Array.isArray(body.benefits) ? body.benefits.map((b: unknown) => String(b)) : [],
    applyMethod: String(body.applyMethod ?? "").trim(),
    externalUrl: String(body.externalUrl ?? "").trim(),
    applicationEmail: String(body.applicationEmail ?? "").trim(),
    applicationInstructions: String(body.applicationInstructions ?? "").trim(),
    walkInDate: String(body.walkInDate ?? "").trim(),
    walkInStartTime: String(body.walkInStartTime ?? "").trim(),
    walkInEndTime: String(body.walkInEndTime ?? "").trim(),
    walkInVenue: String(body.walkInVenue ?? "").trim(),
    walkInAddress: String(body.walkInAddress ?? "").trim(),
    walkInContactPerson: String(body.walkInContactPerson ?? "").trim(),
    walkInContactNumber: String(body.walkInContactNumber ?? "").trim(),
    walkInDocuments: String(body.walkInDocuments ?? "").trim(),
    walkInInstructions: String(body.walkInInstructions ?? "").trim(),
    genderPreference: String(body.genderPreference ?? "").trim(),
    ageFrom: typeof body.ageFrom === "number" ? body.ageFrom : 0,
    ageTo: typeof body.ageTo === "number" ? body.ageTo : 0,
    languageRequirement: String(body.languageRequirement ?? "").trim(),
    travelRequired: body.travelRequired === true,
    willingToRelocate: body.willingToRelocate === true,
    drivingLicenseRequired: body.drivingLicenseRequired === true,
    vehicleRequired: body.vehicleRequired === true,
    shiftType: String(body.shiftType ?? "").trim(),
    workingHours: String(body.workingHours ?? "").trim(),
     applicationLimit: typeof body.applicationLimit === "number" ? body.applicationLimit : 0,
  };

  // Build blocks for private jobs (description + salary)
  const blocks: any[] = [];
  if (String(body.jobType ?? "government").trim() === "private") {
    const descHtml = String(body.descriptionHtml ?? body.descriptionEn ?? "").trim();
    const descTitle = String(body.descriptionTitle ?? body.shortDescriptionEn ?? "").trim();
    if (descHtml) {
      blocks.push({
        id: `block_${Date.now()}_descr`,
        type: "paragraph",
        data: { hi: descHtml, en: descHtml },
        order: blocks.length + 1,
      });
    }

    const salaryNotDisclose = body.salaryNotDisclose === true;
    const salaryMin = typeof body.salaryMin === "number" ? body.salaryMin : 0;
    const salaryMax = typeof body.salaryMax === "number" ? body.salaryMax : 0;
    const salaryPeriod = String(body.salaryPeriod ?? "Monthly").trim();
    const salaryType = String(body.salaryType ?? "").trim();
    const incentives = String(body.incentives ?? "").trim();
    const benefits = Array.isArray(body.benefits) ? body.benefits.map((b: unknown) => String(b)) : [];

    if (salaryNotDisclose) {
      blocks.push({
        id: `block_${Date.now()}_salary`,
        type: "salary",
        data: { notDisclose: true, hi: "वेतन गोपनीय", en: "Salary Not Disclosed" },
        order: blocks.length + 1,
      });
    } else if (salaryMin > 0 || salaryMax > 0) {
      let salaryText = "";
      if (salaryMin > 0 && salaryMax > 0) {
        salaryText = `₹${salaryMin.toLocaleString("en-IN")} - ₹${salaryMax.toLocaleString("en-IN")} ${salaryPeriod}`;
      } else if (salaryMin > 0) {
        salaryText = `₹${salaryMin.toLocaleString("en-IN")} ${salaryPeriod} onwards`;
      } else if (salaryMax > 0) {
        salaryText = `Up to ₹${salaryMax.toLocaleString("en-IN")} ${salaryPeriod}`;
      }
      if (salaryType) salaryText += ` (${salaryType})`;
      if (benefits.length > 0) salaryText += `\nBenefits: ${benefits.join(", ")}`;
      if (incentives) salaryText += `\nIncentives: ${incentives}`;

      blocks.push({
        id: `block_${Date.now()}_salary`,
        type: "salary",
        data: { text: salaryText, hi: salaryText, en: salaryText, notDisclose: false },
        order: blocks.length + 1,
      });
    }
  }

  doc.blocks = blocks;

  try {
    const result = await jobs.insertOne(doc);
    const job = withId({ ...doc, _id: result.insertedId });
    return NextResponse.json({ ok: true, job });
  } catch (e) {
    const message = e instanceof Error ? e.message : "डेटाबेस त्रुटि";
    console.error("Job insert failed:", message, doc);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
