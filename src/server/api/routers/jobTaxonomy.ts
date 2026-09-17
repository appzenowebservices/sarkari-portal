import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

export const jobTaxonomyRouter = createTRPCRouter({
  categories: publicProcedure.query(({ ctx }) => ctx.db.jobCategory.findMany({ orderBy: { sortOrder: "asc" } })),
  organizations: publicProcedure.query(({ ctx }) => ctx.db.jobOrganization.findMany({ orderBy: { sortOrder: "asc" } })),
  locations: publicProcedure.query(({ ctx }) => ctx.db.jobLocation.findMany({ orderBy: { sortOrder: "asc" } })),
  qualifications: publicProcedure.query(({ ctx }) => ctx.db.jobQualification.findMany({ orderBy: { sortOrder: "asc" } })),
  tags: publicProcedure.query(({ ctx }) => ctx.db.jobTag.findMany({ orderBy: { sortOrder: "asc" } })),

  upsertCategory: protectedProcedure.input(z.object({
    id: z.string().optional(), slug: z.string().optional(),
    titleHi: z.string().optional().default(""), titleEn: z.string().optional().default(""),
    descriptionHi: z.string().optional().default(""), descriptionEn: z.string().optional().default(""),
    icon: z.string().optional().default(""), color: z.string().optional().default(""),
    sortOrder: z.number().optional().default(0), isActive: z.boolean().optional().default(true),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const data = { ...rest, slug: input.slug || slug(input.titleEn || input.titleHi || `cat-${Date.now()}`) };
    if (id) return ctx.db.jobCategory.update({ where: { id }, data });
    return ctx.db.jobCategory.create({ data: data as never });
  }),
  deleteCategory: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.jobCategory.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),

  upsertOrganization: protectedProcedure.input(z.object({
    id: z.string().optional(), slug: z.string().optional(),
    nameHi: z.string().optional().default(""), nameEn: z.string().optional().default(""),
    abbreviation: z.string().optional().default(""), website: z.string().optional().default(""),
    sortOrder: z.number().optional().default(0), isActive: z.boolean().optional().default(true),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const data = { ...rest, slug: input.slug || slug(input.nameEn || input.nameHi || `org-${Date.now()}`) };
    if (id) return ctx.db.jobOrganization.update({ where: { id }, data });
    return ctx.db.jobOrganization.create({ data: data as never });
  }),
  deleteOrganization: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.jobOrganization.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),

  upsertLocation: protectedProcedure.input(z.object({ id: z.string().optional(), titleHi: z.string().optional().default(""), titleEn: z.string().optional().default(""), state: z.string().optional().default(""), sortOrder: z.number().optional().default(0), isActive: z.boolean().optional().default(true) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const data = { ...rest, slug: slug(input.titleEn || input.titleHi || `loc-${Date.now()}`) };
    if (id) return ctx.db.jobLocation.update({ where: { id }, data });
    return ctx.db.jobLocation.create({ data: data as never });
  }),
  upsertQualification: protectedProcedure.input(z.object({ id: z.string().optional(), titleHi: z.string().optional().default(""), titleEn: z.string().optional().default(""), level: z.number().optional().default(0), sortOrder: z.number().optional().default(0), isActive: z.boolean().optional().default(true) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const data = { ...rest, slug: slug(input.titleEn || input.titleHi || `q-${Date.now()}`) };
    if (id) return ctx.db.jobQualification.update({ where: { id }, data });
    return ctx.db.jobQualification.create({ data: data as never });
  }),
  upsertTag: protectedProcedure.input(z.object({ id: z.string().optional(), nameHi: z.string().optional().default(""), nameEn: z.string().optional().default(""), sortOrder: z.number().optional().default(0) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const data = { ...rest, slug: slug(input.nameEn || input.nameHi || `tag-${Date.now()}`) };
    if (id) return ctx.db.jobTag.update({ where: { id }, data });
    return ctx.db.jobTag.create({ data: data as never });
  }),
});
