export type JobBlock = {
  id: string;
  type: string;
  data: Record<string, any>;
  order: number;
};

import { getFieldByKey } from "./universal-field-master";

export interface ImportField {
  key: string;
  value: string;
}

export interface MappedJob {
  titleHi: string;
  titleEn: string;
  shortDescriptionHi: string;
  shortDescriptionEn: string;
  descriptionHi: string;
  descriptionEn: string;
  organizationId: string;
  organizationNameHi: string;
  organizationNameEn: string;
  categoryId: string;
  categoryNameHi: string;
  categoryNameEn: string;
  jobType: string;
  sector: string;
  state: string;
  locationNames: string[];
  applicationStartDate: string;
  applicationLastDate: string;
  notificationDate: string;
  totalVacancies: number;
  minimumQualification: string;
  maximumQualification: string;
  minimumAge: number;
  maximumAge: number;
  applicationFeeGeneral: number;
  applicationFeeOBC: number;
  applicationFeeSC: number;
  applicationFeeST: number;
  applyUrl: string;
  notificationUrl: string;
  status: string;
  isFeatured: boolean;
  isUrgent: boolean;
  isActive: boolean;
  template: string;
  blocks: JobBlock[];
  tags: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  schemaType: string;
  viewCount: number;
  applyClickCount: number;
  notificationClickCount: number;
  websiteClickCount: number;
}

export interface ImportResult {
  ok: boolean;
  data?: MappedJob;
  error?: string;
  warnings: string[];
  stats: {
    fieldsFound: number;
    fieldsBlank: number;
    fieldsMapped: number;
    blocksGenerated: number;
  };
}

const JOB_PROPERTY_MAP: Record<string, keyof MappedJob> = {
  titleEn: "titleEn",
  titleHi: "titleHi",
  shortDescriptionEn: "shortDescriptionEn",
  organizationNameEn: "organizationNameEn",
  organizationNameHi: "organizationNameHi",
  categoryNameEn: "categoryNameEn",
  jobType: "jobType",
  sector: "sector",
  state: "state",
  applicationStartDate: "applicationStartDate",
  applicationLastDate: "applicationLastDate",
  notificationDate: "notificationDate",
  totalVacancies: "totalVacancies",
  minimumQualification: "minimumQualification",
  maximumQualification: "maximumQualification",
  minimumAge: "minimumAge",
  maximumAge: "maximumAge",
  applicationFeeGeneral: "applicationFeeGeneral",
  applicationFeeOBC: "applicationFeeOBC",
  applicationFeeSC: "applicationFeeSC",
  applicationFeeST: "applicationFeeST",
  applyUrl: "applyUrl",
  notificationUrl: "notificationUrl",
};

function safeNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sanitize(v: string): string {
  return v.replace(/<[^>]*>/g, "").trim();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateTags(input: {
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  organizationNameEn: string;
  categoryNameEn: string;
  sector: string;
  state: string;
  minimumQualification: string;
  totalVacancies: number;
}): string {
  const raw = [
    input.titleEn,
    input.titleHi,
    input.descriptionEn,
    input.descriptionHi,
    input.organizationNameEn,
    input.categoryNameEn,
    input.sector,
    input.state,
    input.minimumQualification,
    input.totalVacancies > 0 ? `${input.totalVacancies} vacancies` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stopWords = new Set([
    "the", "and", "for", "with", "from", "this", "that", "have", "has", "been",
    "will", "can", "are", "was", "were", "not", "but", "you", "your", "our",
    "their", "his", "her", "its", "all", "any", "each", "every", "both", "few",
    "more", "most", "other", "some", "such", "than", "too", "very", "just",
    "because", "but", "or", "if", "while", "about", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "what", "which",
    "who", "whom", "also", "now", "today", "new", "old", "best", "top", "free",
    "full", "online", "official", "website", "home", "page", "click", "here", "visit",
    "open", "use", "using", "used", "one", "two", "make", "made", "get", "got",
    "like", "know", "see", "look", "come", "way", "need", "want", "good", "great",
    "right", "still", "thing", "things", "something", "anything", "everything", "nothing",
  ]);

  const words = raw
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const unique = Array.from(new Set(words));
  return unique.slice(0, 15).join(", ");
}

function generateSEO(input: {
  titleEn: string;
  titleHi: string;
  organizationNameEn: string;
  categoryNameEn: string;
  state: string;
  minimumQualification: string;
  totalVacancies: number;
  applicationLastDate: string;
  slug: string;
  shortDescriptionEn: string;
}): Pick<MappedJob, "seoTitle" | "metaDescription" | "focusKeyword" | "ogTitle" | "ogDescription" | "canonicalUrl"> {
  const raw = [
    input.titleEn,
    input.titleHi,
    input.organizationNameEn,
    input.categoryNameEn,
    input.state,
    input.minimumQualification,
    input.totalVacancies > 0 ? `${input.totalVacancies} vacancies` : "",
    input.applicationLastDate ? `Apply before ${input.applicationLastDate}` : "",
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
  const focusKeyword = unique.slice(0, 3).join(", ") || input.slug.replace(/-/g, " ");
  const keywords = unique.slice(0, 10).join(", ");

  const seoTitle = `${input.titleEn} – Vacancy, Eligibility & Apply Online | APPZENO Sarkari Portal`;
  const metaDescription = [
    input.shortDescriptionEn || `Check ${input.titleEn} details including vacancies, eligibility, age limit, important dates, application process and official notification.`,
    input.totalVacancies > 0 ? `${input.totalVacancies} vacancies.` : "",
    input.minimumQualification ? `Qualification: ${input.minimumQualification}.` : "",
    input.applicationLastDate ? `Last date: ${input.applicationLastDate}.` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 160);

  return {
    seoTitle,
    metaDescription,
    focusKeyword,
    ogTitle: seoTitle,
    ogDescription: metaDescription,
    canonicalUrl: `/job/${input.slug}`,
  };
}

function buildBlocks(sectionGroups: Record<string, any[]>): JobBlock[] {
  const blocks: JobBlock[] = [];
  let order = 0;

  const addBlock = (type: JobBlock["type"], data: Record<string, any>) => {
    blocks.push({ id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type, data, order: order++ });
  };

  const dates: { event: string; date: string }[] = [];
  const dateFields = sectionGroups["dates"] || [];
  for (const f of dateFields) {
    const def = f.__def;
    if (def.blockType === "important-dates" && def.blockDataKey === "dates" && f.value) {
      dates.push({ event: def.labelEn, date: f.value });
    }
  }
  if (dates.length > 0) {
    addBlock("important-dates", { dates });
  }

  const vacancyRows: { post: string; vacancies: string; payScale: string }[] = [];
  const vacancyFields = sectionGroups["vacancy"] || [];
  for (const f of vacancyFields) {
    const def = f.__def;
    if (def.blockType === "vacancy-details" && def.blockDataKey === "rows" && f.value) {
      vacancyRows.push({ post: f.value, vacancies: "", payScale: "" });
    }
  }
  if (vacancyRows.length > 0) {
    addBlock("vacancy-details", { rows: vacancyRows });
  }

  const eligibilityItems: { text: string; required: boolean }[] = [];
  const eligibilityFields = sectionGroups["eligibility"] || [];
  for (const f of eligibilityFields) {
    const def = f.__def;
    if (def.blockType === "eligibility" && def.blockDataKey === "items" && f.value) {
      eligibilityItems.push({ text: f.value, required: false });
    }
  }
  if (eligibilityItems.length > 0) {
    addBlock("eligibility", { items: eligibilityItems });
  }

  const ageFields = sectionGroups["age"] || [];
  const ageMin = ageFields.find((f: any) => f.__def.key === "minimum_age")?.value;
  const ageMax = ageFields.find((f: any) => f.__def.key === "maximum_age")?.value;
  const ageRelaxation = ageFields.find((f: any) => f.__def.key === "age_relaxation")?.value;
  if (ageMin || ageMax || ageRelaxation) {
    const relaxations: { category: string; years: number }[] = [];
    if (ageRelaxation) {
      relaxations.push({ category: "General", years: safeNum(ageRelaxation) });
    }
    addBlock("age-limit", {
      minimum: ageMin || "",
      maximum: ageMax || "",
      relaxations,
      asOnDate: ageFields.find((f: any) => f.__def.key === "age_as_on_date")?.value || "",
    });
  }

  const salaryFields = sectionGroups["salary"] || [];
  const salaryText = salaryFields.find((f: any) => f.__def.blockDataKey === "text")?.value;
  if (salaryText) {
    addBlock("salary", { text: salaryText });
  }

  const feeFields = sectionGroups["fee"] || [];
  const fees: { category: string; amount: number }[] = [];
  for (const f of feeFields) {
    const def = f.__def;
    if (def.blockType === "application-fee" && def.blockDataKey === "fees" && f.value) {
      fees.push({ category: def.labelEn, amount: safeNum(f.value) });
    }
  }
  if (fees.length > 0) {
    addBlock("application-fee", { fees, exemption: false });
  }

  const selectionFields = sectionGroups["government"] || [];
  const selectionText = selectionFields.find((f: any) => f.__def.key === "selection_process")?.value;
  if (selectionText) {
    const steps = selectionText.split(/\n+/).filter(Boolean).map((s: string) => ({ text: s.trim(), description: "" }));
    addBlock("selection-process", { steps });
  }

  const howToApply = sectionGroups["application"]?.find((f: any) => f.__def.key === "how_to_apply")?.value;
  if (howToApply) {
    addBlock("how-to-apply", { text: howToApply });
  }

  const links: { title: string; url: string; type: string }[] = [];
  const linkFields = sectionGroups["links"] || [];
  for (const f of linkFields) {
    const def = f.__def;
    if (def.blockType === "important-links" && def.blockDataKey === "links" && f.value) {
      links.push({ title: def.labelEn, url: f.value, type: def.labelEn });
    }
  }
  if (links.length > 0) {
    addBlock("important-links", { links });
  }

  const faqFields = sectionGroups["content"] || [];
  const faqItems: { question: string; answer: string }[] = [];
  for (const f of faqFields) {
    const def = f.__def;
    if (def.blockType === "faq" && def.blockDataKey === "items" && f.value) {
      faqItems.push({ question: def.labelEn, answer: f.value });
    }
  }
  if (faqItems.length > 0) {
    addBlock("faq", { items: faqItems });
  }

  return blocks;
}

export function mapUniversalImport(fields: ImportField[], existingSlug?: string): ImportResult {
  const warnings: string[] = [];
  const blankCount = fields.filter((f) => !f.value.trim()).length;
  const nonBlank = fields.filter((f) => f.value.trim());

  const job: MappedJob = {
    titleHi: "",
    titleEn: "",
    shortDescriptionHi: "",
    shortDescriptionEn: "",
    descriptionHi: "",
    descriptionEn: "",
    organizationId: "",
    organizationNameHi: "",
    organizationNameEn: "",
    categoryId: "",
    categoryNameHi: "",
    categoryNameEn: "",
    jobType: "government",
    sector: "",
    state: "",
    locationNames: [],
    applicationStartDate: "",
    applicationLastDate: "",
    notificationDate: "",
    totalVacancies: 0,
    minimumQualification: "",
    maximumQualification: "",
    minimumAge: 0,
    maximumAge: 0,
    applicationFeeGeneral: 0,
    applicationFeeOBC: 0,
    applicationFeeSC: 0,
    applicationFeeST: 0,
    applyUrl: "",
    notificationUrl: "",
    status: "draft",
    isFeatured: false,
    isUrgent: false,
    isActive: true,
    template: "universal",
    blocks: [],
    tags: "",
    seoTitle: "",
    metaDescription: "",
    focusKeyword: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    canonicalUrl: "",
    robots: "index, follow",
    schemaType: "JobPosting",
    viewCount: 0,
    applyClickCount: 0,
    notificationClickCount: 0,
    websiteClickCount: 0,
  };

  const sectionGroups: Record<string, any[]> = {};

  for (const field of nonBlank) {
    const def = getFieldByKey(field.key);
    if (!def) {
      warnings.push(`Unknown field key: ${field.key}`);
      continue;
    }
    const value = sanitize(field.value);
    if (!value) continue;

    if (def.jobProperty && def.jobProperty in JOB_PROPERTY_MAP) {
      const prop = JOB_PROPERTY_MAP[def.jobProperty] as keyof MappedJob;
      if (prop === "totalVacancies" || prop === "minimumAge" || prop === "maximumAge") {
        (job as any)[prop] = safeNum(value);
      } else if (prop === "applicationFeeGeneral" || prop === "applicationFeeOBC" || prop === "applicationFeeSC" || prop === "applicationFeeST") {
        (job as any)[prop] = safeNum(value);
      } else {
        (job as any)[prop] = value;
      }
    }

    if (!sectionGroups[def.section]) sectionGroups[def.section] = [];
    sectionGroups[def.section].push({ ...field, __def: def, _value: value });
  }

  job.blocks = buildBlocks(sectionGroups);

  const slug = generateSlug(job.titleEn || job.titleHi || existingSlug || `job-${Date.now()}`);
  const seo = generateSEO({
    titleEn: job.titleEn || job.titleHi,
    titleHi: job.titleHi,
    organizationNameEn: job.organizationNameEn,
    categoryNameEn: job.categoryNameEn,
    state: job.state,
    minimumQualification: job.minimumQualification,
    totalVacancies: job.totalVacancies,
    applicationLastDate: job.applicationLastDate,
    slug,
    shortDescriptionEn: job.shortDescriptionEn || job.shortDescriptionHi,
  });

  job.tags = generateTags({
    titleHi: job.titleHi,
    titleEn: job.titleEn,
    descriptionHi: job.descriptionHi,
    descriptionEn: job.descriptionEn,
    organizationNameEn: job.organizationNameEn,
    categoryNameEn: job.categoryNameEn,
    sector: job.sector,
    state: job.state,
    minimumQualification: job.minimumQualification,
    totalVacancies: job.totalVacancies,
  });
  job.seoTitle = seo.seoTitle;
  job.metaDescription = seo.metaDescription;
  job.focusKeyword = seo.focusKeyword;
  job.ogTitle = seo.ogTitle;
  job.ogDescription = seo.ogDescription;
  job.canonicalUrl = seo.canonicalUrl;

  return {
    ok: true,
    data: job,
    warnings,
    stats: {
      fieldsFound: fields.length,
      fieldsBlank: blankCount,
      fieldsMapped: nonBlank.length,
      blocksGenerated: job.blocks.length,
    },
  };
}
