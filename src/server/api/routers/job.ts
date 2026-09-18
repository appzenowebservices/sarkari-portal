import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

function toPublicJob(r: Record<string, unknown>) {
  const get = (k: string, d = "") => (r[k] as string) ?? d;
  const num = (k: string) => (typeof r[k] === "number" ? (r[k] as number) : 0);
  const ageParts: string[] = [];
  if (num("minimumAge")) ageParts.push(`${num("minimumAge")}`);
  if (num("maximumAge")) ageParts.push(`-${num("maximumAge")}`);
  const feeParts: string[] = [];
  if (num("applicationFeeGeneral")) feeParts.push(`Gen ₹${num("applicationFeeGeneral")}`);
  if (num("applicationFeeOBC")) feeParts.push(`OBC ₹${num("applicationFeeOBC")}`);
  if (num("applicationFeeSC")) feeParts.push(`SC ₹${num("applicationFeeSC")}`);
  if (num("applicationFeeST")) feeParts.push(`ST ₹${num("applicationFeeST")}`);
  return {
    ...r,
    category: r["isGovernment"] === false ? "private" : "government",
    organizationHi: get("organizationNameHi"),
    organizationEn: get("organizationNameEn"),
    qualification: get("minimumQualification") || get("maximumQualification"),
    ageLimit: ageParts.length ? `${ageParts.join("")} yrs` : "",
    salary:
      [r["minimumSalary"], r["maximumSalary"]].filter(Boolean).join(" - ") ||
      (get("payScale") as string),
    location: Array.isArray(r["locationNames"]) ? (r["locationNames"] as string[]).join(", ") : "",
    applicationFee: feeParts.join(" / ") || "",
    startDate: get("applicationStartDate"),
    lastDate: get("applicationLastDate"),
    isPublished: (r["isActive"] as boolean) ?? true,
    clickCount: num("clickCount") + num("applyClickCount") + num("notificationClickCount") + num("websiteClickCount"),
    blocks: Array.isArray(r["blocks"]) ? r["blocks"] : [],
  };
}

const jobInput = z.object({
  titleHi: z.string().min(1),
  titleEn: z.string().min(1),
  categoryId: z.string().optional(),
  organizationId: z.string().optional(),
  shortDescriptionHi: z.string().optional().default(""),
  shortDescriptionEn: z.string().optional().default(""),
  organizationNameHi: z.string().optional().default(""),
  organizationNameEn: z.string().optional().default(""),
  categoryNameHi: z.string().optional().default(""),
  categoryNameEn: z.string().optional().default(""),
  jobType: z.string().optional().default("government"),
  sector: z.string().optional().default(""),
  state: z.string().optional().default(""),
  locationNames: z.array(z.string()).optional().default([]),
  applicationStartDate: z.string().optional().default(""),
  applicationLastDate: z.string().optional().default(""),
  notificationDate: z.string().optional().default(""),
  totalVacancies: z.number().optional().default(0),
  minimumQualification: z.string().optional().default(""),
  maximumQualification: z.string().optional().default(""),
  minimumAge: z.number().optional().default(0),
  maximumAge: z.number().optional().default(0),
  applicationFeeGeneral: z.number().optional().default(0),
  applicationFeeOBC: z.number().optional().default(0),
  applicationFeeSC: z.number().optional().default(0),
  applicationFeeST: z.number().optional().default(0),
  applyUrl: z.string().optional().default(""),
  notificationUrl: z.string().optional().default(""),
  status: z.string().optional().default("draft"),
  isFeatured: z.boolean().optional().default(false),
  isUrgent: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  template: z.string().optional().default("government"),
  blocks: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  tags: z.string().optional().default(""),
}).passthrough();

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export const jobRouter = createTRPCRouter({
  // ── public ──
  list: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      categoryId: z.string().optional(),
      organizationId: z.string().optional(),
      limit: z.number().min(1).max(200).optional().default(50),
      sort: z.enum(["latest", "lastDate", "vacancies", "popular"]).optional().default("latest"),
      q: z.string().optional().default(""),
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { isActive: true };
      if (input.status) (where as Record<string, unknown>).status = input.status;
      if (input.categoryId) (where as Record<string, unknown>).categoryId = input.categoryId;
      if (input.organizationId) (where as Record<string, unknown>).organizationId = input.organizationId;
      if (input.q) {
        (where as Record<string, unknown>).OR = [
          { titleHi: { contains: input.q, mode: "insensitive" } },
          { titleEn: { contains: input.q, mode: "insensitive" } },
          { tags: { contains: input.q, mode: "insensitive" } },
          { organizationNameHi: { contains: input.q, mode: "insensitive" } },
          { organizationNameEn: { contains: input.q, mode: "insensitive" } },
        ];
      }
      const orderBy =
        input.sort === "lastDate" ? { applicationLastDate: "asc" as const }
        : input.sort === "vacancies" ? { totalVacancies: "desc" as const }
        : input.sort === "popular" ? { viewCount: "desc" as const }
        : { createdAt: "desc" as const };
      const rows = await ctx.db.job.findMany({ where: where as never, orderBy, take: input.limit });
      return rows.map((r) => toPublicJob(r as unknown as Record<string, unknown>));
    }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const job = await ctx.db.job.findUnique({ where: { slug: input.slug } });
    if (!job) return null;
    await ctx.db.job.update({ where: { slug: input.slug }, data: { viewCount: { increment: 1 } } }).catch(() => null);
    await ctx.db.jobView.create({ data: { jobId: job.id, source: "web" } }).catch(() => null);
    return toPublicJob(job as unknown as Record<string, unknown>);
  }),

  related: publicProcedure.input(z.object({ slug: z.string(), limit: z.number().optional().default(6) })).query(async ({ ctx, input }) => {
    const job = await ctx.db.job.findUnique({ where: { slug: input.slug } });
    if (!job) return [];
    const rows = await ctx.db.job.findMany({
      where: { isActive: true, categoryId: job.categoryId ?? undefined, slug: { not: input.slug } } as never,
      take: input.limit, orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => toPublicJob(r as unknown as Record<string, unknown>));
  }),

  trackClick: publicProcedure.input(z.object({ slug: z.string(), linkType: z.string().optional().default("apply") })).mutation(async ({ ctx, input }) => {
    const job = await ctx.db.job.findUnique({ where: { slug: input.slug } });
    if (!job) return { ok: false };
    const field = input.linkType === "notification" ? "notificationClickCount" : input.linkType === "website" ? "websiteClickCount" : "applyClickCount";
    await ctx.db.job.update({ where: { id: job.id }, data: { [field]: { increment: 1 } } }).catch(() => null);
    await ctx.db.jobClick.create({ data: { jobId: job.id, linkType: input.linkType, source: "web" } }).catch(() => null);
    return { ok: true };
  }),

  // ── admin ──
  adminList: protectedProcedure.input(z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.union([z.number(), z.literal("all")]).optional().default(20),
    sort: z.string().optional().default("newest"),
  })).query(async ({ ctx, input }) => {
    const orderBy = input.sort === "lastdate" ? { applicationLastDate: "asc" as const }
      : input.sort === "vacancies" ? { totalVacancies: "desc" as const }
      : input.sort === "title" ? { titleEn: "asc" as const } : { createdAt: "desc" as const };
    const total = await ctx.db.job.count();
    if (input.limit === "all") {
      const jobs = await ctx.db.job.findMany({ orderBy });
      return { jobs, total, page: 1, limit: "all" as const };
    }
    const jobs = await ctx.db.job.findMany({ orderBy, skip: (input.page - 1) * input.limit, take: input.limit });
    return { jobs, total, page: input.page, limit: input.limit };
  }),

  adminGet: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.job.findUnique({ where: { id: input.id } });
  }),

  create: protectedProcedure.input(jobInput).mutation(async ({ ctx, input }) => {
    const slug = slugify(input.titleEn) || `job-${Date.now()}`;
    const existing = await ctx.db.job.findUnique({ where: { slug } });
    if (existing) throw new Error(`Slug "job/${slug}" पहले से मौजूद है`);
    const seoTitle = `${input.titleEn} – Vacancy, Eligibility & Apply Online | APPZENO Sarkari Portal`;
    const {
      titleHi, titleEn, categoryId, organizationId, shortDescriptionHi, shortDescriptionEn,
      organizationNameHi, organizationNameEn, categoryNameHi, categoryNameEn, jobType, sector, state,
      locationNames, applicationStartDate, applicationLastDate, totalVacancies, minimumQualification,
      maximumQualification, minimumAge, maximumAge, applicationFeeGeneral, applicationFeeOBC,
      applicationFeeSC, applicationFeeST, applyUrl, notificationUrl, status, isFeatured, isUrgent,
      isActive, template, blocks, tags, ...extras
    } = input as Record<string, unknown> & typeof input;
    const job = await ctx.db.job.create({
      data: {
        slug, titleHi: titleHi as string, titleEn: titleEn as string,
        shortDescriptionHi: (shortDescriptionHi as string) ?? "", shortDescriptionEn: (shortDescriptionEn as string) ?? "",
        organizationId: (organizationId as string) || null, organizationNameHi: (organizationNameHi as string) ?? "",
        organizationNameEn: (organizationNameEn as string) ?? "", categoryId: (categoryId as string) || null,
        categoryNameHi: (categoryNameHi as string) ?? "", categoryNameEn: (categoryNameEn as string) ?? "",
        jobType: (jobType as string) ?? "government", sector: (sector as string) ?? "", state: (state as string) ?? "",
        locationNames: (locationNames as string[]) ?? [], applicationStartDate: (applicationStartDate as string) ?? "",
        applicationLastDate: (applicationLastDate as string) ?? "",
        totalVacancies: (totalVacancies as number) ?? 0, minimumQualification: (minimumQualification as string) ?? "",
        maximumQualification: (maximumQualification as string) ?? "", minimumAge: (minimumAge as number) ?? 0,
        maximumAge: (maximumAge as number) ?? 0, applicationFeeGeneral: (applicationFeeGeneral as number) ?? 0,
        applicationFeeOBC: (applicationFeeOBC as number) ?? 0, applicationFeeSC: (applicationFeeSC as number) ?? 0,
        applicationFeeST: (applicationFeeST as number) ?? 0, applyUrl: (applyUrl as string) ?? "",
        notificationUrl: (notificationUrl as string) ?? "", status: (status as string) ?? "draft",
        isFeatured: (isFeatured as boolean) ?? false, isUrgent: (isUrgent as boolean) ?? false, isActive: (isActive as boolean) ?? true,
        template: (template as string) ?? "government", blocks: (blocks as unknown[]) ?? [],
        tags: (tags as string) ?? "", seoTitle, metaDescription: (shortDescriptionEn as string) ?? "",
        focusKeyword: slug.replace(/-/g, " "), ogTitle: seoTitle, ogDescription: (shortDescriptionEn as string) ?? "",
        canonicalUrl: `/job/${slug}`, robots: "index, follow", schemaType: "JobPosting",
        ...extras,
      } as never,
    });
    return { ok: true, job };
  }),

  update: protectedProcedure.input(z.object({ id: z.string(), data: jobInput.partial() })).mutation(async ({ ctx, input }) => {
    const job = await ctx.db.job.update({ where: { id: input.id }, data: input.data as never });
    return { ok: true, job };
  }),

  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.job.delete({ where: { id: input.id } });
    return { ok: true };
  }),

  duplicate: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const src = await ctx.db.job.findUnique({ where: { id: input.id } });
    if (!src) throw new Error("Job not found");
    const copy = await ctx.db.job.create({
      data: { ...(src as object), id: undefined, slug: `${src.slug}-copy-${Date.now()}`, titleEn: `${src.titleEn} (Copy)`, createdAt: undefined, updatedAt: undefined } as never,
    });
    return { ok: true, job: copy };
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const [total, active, featured, govt, priv, vacAgg] = await Promise.all([
      ctx.db.job.count(), ctx.db.job.count({ where: { isActive: true } }),
      ctx.db.job.count({ where: { isFeatured: true } }), ctx.db.job.count({ where: { jobType: "government" } }),
      ctx.db.job.count({ where: { jobType: "private" } }),
      ctx.db.job.aggregate({ where: { isActive: true }, _sum: { totalVacancies: true } }),
    ]);
    return { total, active, featured, government: govt, private: priv, totalVacancies: vacAgg._sum.totalVacancies ?? 0 };
  }),

  autosave: protectedProcedure.input(z.object({ id: z.string().optional(), data: z.record(z.string(), z.unknown()) })).mutation(async ({ ctx, input }) => {
    if (!input.id) {
      const slug = `draft-${Date.now()}`;
      const job = await ctx.db.job.create({ data: { slug, titleHi: "Draft", titleEn: "Draft", status: "draft", blocks: [] } as never });
      return { ok: true, id: job.id };
    }
    await ctx.db.job.update({ where: { id: input.id }, data: input.data as never });
    return { ok: true, id: input.id };
  }),

  smartImport: protectedProcedure.input(z.object({ text: z.string(), jobType: z.string().optional().default("government") })).mutation(async ({ ctx, input }) => {
    // Heuristic parse: lines -> title/org/dates/vacancies; reuse create path
    const lines = input.text.split("\n").map((l) => l.trim()).filter(Boolean);
    const titleEn = lines[0]?.slice(0, 200) ?? "Imported Job";
    const slug = slugify(titleEn) || `job-${Date.now()}`;
    const job = await ctx.db.job.create({
      data: { slug, titleEn, titleHi: titleEn, jobType: input.jobType, status: "draft", blocks: [{ id: `block_${Date.now()}`, type: "paragraph", data: { en: input.text.slice(0, 5000) }, order: 1 }] } as never,
    });
    return { ok: true, job };
  }),

  universalImport: protectedProcedure.input(z.object({ rows: z.array(z.record(z.string(), z.unknown())), jobType: z.string().optional().default("government") })).mutation(async ({ ctx, input }) => {
    let created = 0;
    for (const row of input.rows.slice(0, 200)) {
      const titleEn = String((row["titleEn"] ?? row["title"] ?? "") as string).slice(0, 200);
      if (!titleEn) continue;
      const slug = slugify(titleEn) || `job-${Date.now()}-${created}`;
      const exists = await ctx.db.job.findUnique({ where: { slug } });
      if (exists) continue;
      await ctx.db.job.create({ data: { slug, titleEn, titleHi: String((row["titleHi"] ?? titleEn) as string), jobType: input.jobType, status: "draft", organizationNameEn: String((row["organization"] ?? "") as string), totalVacancies: Number(row["vacancies"] ?? 0) || 0, applicationLastDate: String((row["lastDate"] ?? "") as string), blocks: [] } as never });
      created++;
    }
    return { ok: true, created };
  }),

  reusableBlocks: protectedProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.db.job.findMany({ take: 20, orderBy: { updatedAt: "desc" }, select: { blocks: true } });
    const seen = new Map<string, unknown>();
    for (const j of jobs) {
      const blocks = (j.blocks as unknown as Array<{ type?: string }>) ?? [];
      for (const b of blocks) { if (b?.type && !seen.has(b.type)) seen.set(b.type, b); }
    }
    return [...seen.values()];
  }),
});
