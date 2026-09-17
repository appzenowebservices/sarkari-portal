import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const catalogRouter = createTRPCRouter({
  // categories
  categories: publicProcedure.input(z.object({ includeInactive: z.boolean().optional().default(false) }).optional()).query(async ({ ctx, input }) => {
    const cats = await ctx.db.category.findMany({
      where: input?.includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    const withCounts = await Promise.all(cats.map(async (c) => {
      const serviceCount = await ctx.db.service.count({ where: { categoryIds: { has: c.id } } });
      return { ...c, serviceCount };
    }));
    return withCounts;
  }),
  adminCategories: protectedProcedure.query(({ ctx }) => ctx.db.category.findMany({ orderBy: { sortOrder: "asc" } })),
  upsertCategory: protectedProcedure.input(z.object({
    id: z.string().optional(), slug: z.string(), titleHi: z.string().optional().default(""),
    titleEn: z.string().optional().default(""), descriptionHi: z.string().optional().default(""),
    descriptionEn: z.string().optional().default(""), icon: z.string().optional().default(""),
    color: z.string().optional().default(""), sortOrder: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.category.update({ where: { id }, data: rest });
    return ctx.db.category.create({ data: rest as never });
  }),
  deleteCategory: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.category.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),
  reorderCategories: protectedProcedure.input(z.object({ ids: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
    await Promise.all(input.ids.map((id, i) => ctx.db.category.update({ where: { id }, data: { sortOrder: i } })));
    return { ok: true };
  }),

  // services
  servicesByCategory: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const cat = await ctx.db.category.findUnique({ where: { slug: input.slug } });
    if (!cat) return [];
    return ctx.db.service.findMany({ where: { categoryIds: { has: cat.id }, isActive: true }, orderBy: { sortOrder: "asc" } });
  }),
  popularServices: publicProcedure.input(z.object({ limit: z.number().optional().default(10) })).query(({ ctx, input }) => ctx.db.service.findMany({ where: { isActive: true }, orderBy: { clickCount: "desc" }, take: input.limit })),
  freshServices: publicProcedure.input(z.object({ limit: z.number().optional().default(10) })).query(({ ctx, input }) => ctx.db.service.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: input.limit })),
  featuredServices: publicProcedure.query(({ ctx }) => ctx.db.service.findMany({ where: { isActive: true, isFeatured: true }, orderBy: { sortOrder: "asc" } })),
  searchServices: publicProcedure.input(z.object({ q: z.string(), limit: z.number().optional().default(20) })).query(({ ctx, input }) => ctx.db.service.findMany({
    where: { isActive: true, OR: [{ titleHi: { contains: input.q, mode: "insensitive" } }, { titleEn: { contains: input.q, mode: "insensitive" } }, { tags: { contains: input.q, mode: "insensitive" } }] },
    take: input.limit,
  })),
  adminServices: protectedProcedure.input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20), q: z.string().optional().default("") })).query(async ({ ctx, input }) => {
    const where = input.q ? { OR: [{ titleEn: { contains: input.q, mode: "insensitive" } }, { titleHi: { contains: input.q, mode: "insensitive" } }] } : {};
    const [total, services] = await Promise.all([
      ctx.db.service.count({ where: where as never }),
      ctx.db.service.findMany({ where: where as never, skip: (input.page - 1) * input.limit, take: input.limit, orderBy: { sortOrder: "asc" } }),
    ]);
    return { services, total, page: input.page, limit: input.limit };
  }),
  upsertService: protectedProcedure.input(z.object({
    id: z.string().optional(), categoryIds: z.array(z.string()).optional().default([]),
    titleHi: z.string().optional().default(""), titleEn: z.string().optional().default(""),
    url: z.string().optional().default(""), descriptionHi: z.string().optional().default(""),
    descriptionEn: z.string().optional().default(""), tags: z.string().optional().default(""),
    isFeatured: z.boolean().optional().default(false), isNew: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true), sortOrder: z.number().optional().default(0),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.service.update({ where: { id }, data: rest });
    return ctx.db.service.create({ data: rest as never });
  }),
  deleteService: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.service.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),

  trackClick: publicProcedure.input(z.object({ serviceId: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.service.update({ where: { id: input.serviceId }, data: { clickCount: { increment: 1 } } }).catch(() => null);
    await ctx.db.serviceClick.create({ data: { serviceId: input.serviceId } }).catch(() => null);
    return { ok: true };
  }),
  totalClicks: publicProcedure.query(async ({ ctx }) => {
    const agg = await ctx.db.service.aggregate({ _sum: { clickCount: true } });
    return agg._sum.clickCount ?? 0;
  }),
  enableNewTags: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.service.updateMany({
      where: { isNew: false, clickCount: { lt: 50 } },
      data: { isNew: true },
    });
    return { ok: true, modified: result.count };
  }),
});
