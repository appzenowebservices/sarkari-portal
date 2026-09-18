import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const cookieRouter = createTRPCRouter({
  settings: publicProcedure.query(async ({ ctx }) => {
    const s = await ctx.db.cookieSettings.findFirst();
    const categories = await ctx.db.cookieCategory.findMany({ orderBy: { displayOrder: "asc" } });
    return { settings: s, categories };
  }),
  saveConsent: publicProcedure.input(z.object({
    anonymousId: z.string().min(1), preferences: z.record(z.string(), z.boolean()).optional().default({}),
    policyVersion: z.string().optional().default("1.0"), consentStatus: z.string().optional().default("CUSTOMIZED"),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const consent = await ctx.db.cookieConsent.create({ data: { anonymousId: input.anonymousId, preferences: input.preferences ?? {}, policyVersion: input.policyVersion ?? "1.0", consentStatus: input.consentStatus ?? "CUSTOMIZED", sessionId: "", consentMethod: "banner" } as never });
    return { ok: true, id: consent.id };
  }),

  adminSettings: protectedProcedure.query(async ({ ctx }) => {
    const s = await ctx.db.cookieSettings.findFirst();
    const categories = await ctx.db.cookieCategory.findMany({ orderBy: { displayOrder: "asc" } });
    return { settings: s, categories };
  }),
  upsertSettings: protectedProcedure.input(z.object({ settingId: z.string(), bannerEnabled: z.boolean().optional(), bannerTitle: z.string().optional(), bannerDescription: z.string().optional(), policyVersion: z.string().optional() }).passthrough()).mutation(async ({ ctx, input }) => {
    await ctx.db.cookieSettings.upsert({ where: { settingId: input.settingId }, create: input as never, update: input as never });
    return { ok: true };
  }),
  upsertCategory: protectedProcedure.input(z.object({ id: z.string().optional(), code: z.string(), name: z.string().optional().default(""), description: z.string().optional().default(""), required: z.boolean().optional().default(false), defaultEnabled: z.boolean().optional().default(false), displayOrder: z.number().optional().default(0) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.cookieCategory.update({ where: { id }, data: rest }).then(() => ({ ok: true }));
    await ctx.db.cookieCategory.create({ data: rest as never });
    return { ok: true };
  }),
  deleteCategory: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.cookieCategory.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),
  adminConsents: protectedProcedure.input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20) })).query(async ({ ctx, input }) => {
    const [total, items] = await Promise.all([
      ctx.db.cookieConsent.count(),
      ctx.db.cookieConsent.findMany({ skip: (input.page - 1) * input.limit, take: input.limit, orderBy: { consentTimestamp: "desc" } }),
    ]);
    return { items, total, page: input.page, limit: input.limit };
  }),
});

export const paymentRouter = createTRPCRouter({
  uploadProof: publicProcedure.input(z.object({
    requestId: z.string().min(1), amount: z.number(), method: z.string().optional().default("UPI"),
    utrNumber: z.string().optional().default(""), screenshot: z.string().optional().default(""),
  })).mutation(async ({ ctx, input }) => {
    const ad = await ctx.db.advertisement.findUnique({ where: { requestId: input.requestId } });
    const payment = await ctx.db.payment.create({ data: { advertisementId: ad?.id ?? null, requestId: input.requestId, amount: input.amount, method: input.method ?? "UPI", utrNumber: input.utrNumber ?? "", screenshot: input.screenshot ?? "", status: "PENDING" } as never });
    if (ad) await ctx.db.advertisement.update({ where: { id: ad.id }, data: { paymentStatus: "SUBMITTED", utrNumber: input.utrNumber ?? "", paymentScreenshot: input.screenshot ?? "" } });
    return { ok: true, id: payment.id };
  }),
  settings: publicProcedure.query(({ ctx }) => ctx.db.paymentSettings.findFirst()),
  adminPayments: protectedProcedure.input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20), status: z.string().optional() })).query(async ({ ctx, input }) => {
    const where = input.status ? { status: input.status } : {};
    const [total, items] = await Promise.all([
      ctx.db.payment.count({ where }),
      ctx.db.payment.findMany({ where, skip: (input.page - 1) * input.limit, take: input.limit, orderBy: { createdAt: "desc" } }),
    ]);
    return { items, total, page: input.page, limit: input.limit };
  }),
  adminVerify: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["VERIFIED", "REJECTED"]), notes: z.string().optional().default("") })).mutation(async ({ ctx, input }) => {
    const payment = await ctx.db.payment.update({ where: { id: input.id }, data: { status: input.status, notes: input.notes ?? "" } });
    if (payment.requestId) {
      await ctx.db.advertisement.updateMany({ where: { requestId: payment.requestId }, data: { paymentStatus: input.status } });
    }
    return { ok: true };
  }),
  adminPaymentSettings: protectedProcedure.query(({ ctx }) => ctx.db.paymentSettings.findFirst()),
  adminUpsertPaymentSettings: protectedProcedure.input(z.object({ upiEnabled: z.boolean().optional(), upiId: z.string().optional(), payeeName: z.string().optional(), merchantName: z.string().optional(), paymentInstructions: z.string().optional(), gstPercent: z.number().optional(), whatsappNumber: z.string().optional() }).passthrough()).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.paymentSettings.findFirst();
    if (existing) return ctx.db.paymentSettings.update({ where: { id: existing.id }, data: input }).then(() => ({ ok: true }));
    await ctx.db.paymentSettings.create({ data: input as never });
    return { ok: true };
  }),
});

export const systemRouter = createTRPCRouter({
  settings: publicProcedure.query(({ ctx }) => ctx.db.setting.findMany()),
  adminSettings: protectedProcedure.query(({ ctx }) => ctx.db.setting.findMany()),
  adminUpsertSetting: protectedProcedure.input(z.object({ key: z.string(), value: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.setting.upsert({ where: { key: input.key }, create: input, update: { value: input.value } });
    return { ok: true };
  }),
  changePassword: protectedProcedure.input(z.object({ currentPassword: z.string(), newPassword: z.string().min(6) })).mutation(async ({ ctx, input }) => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth");
    const userId = ctx.session.user.id as string;
    const admin = await ctx.db.admin.findUnique({ where: { id: userId } });
    if (!admin) throw new Error("Admin not found");
    const valid = await verifyPassword(input.currentPassword, admin.passwordHash);
    if (!valid) throw new Error("Current password incorrect");
    await ctx.db.admin.update({ where: { id: userId }, data: { passwordHash: await hashPassword(input.newPassword) } });
    return { ok: true };
  }),
  dashboardStats: protectedProcedure.input(z.object({ from: z.string().optional(), to: z.string().optional() })).query(async ({ ctx, input }) => {
    const range = input.from && input.to ? { from: new Date(input.from), to: new Date(input.to) } : undefined;

    const [totalCategories, totalServices, activeServices, totalAds, liveAds, totalAdRequests, pendingAdRequests] = await Promise.all([
      ctx.db.category.count(),
      ctx.db.service.count(),
      ctx.db.service.count({ where: { isActive: true } }),
      ctx.db.ad.count(),
      ctx.db.ad.count({ where: { isPublished: true } }),
      ctx.db.adRequest.count(),
      ctx.db.adRequest.count({ where: { status: "pending" } }),
    ]);

    let totalClicks: number;
    if (range) {
      totalClicks = await ctx.db.serviceClick.count({
        where: { createdAt: { gte: range.from, lte: range.to } },
      });
    } else {
      const agg = await ctx.db.service.aggregate({ _sum: { clickCount: true } });
      totalClicks = agg._sum.clickCount ?? 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const from = range?.from ?? today;
    const to = range?.to ?? endOfToday;
    const todayClicks = await ctx.db.serviceClick.count({
      where: { createdAt: { gte: from, lte: to } },
    });

    // Daily series across the range (default: last 14 days).
    const start = range ? new Date(from) : new Date(Date.now() - 13 * 24 * 3600 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    const clickRows = await ctx.db.serviceClick.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    });
    const perDay = new Map<string, number>();
    for (const row of clickRows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }
    const series: Array<{ day: string; label: string; count: number }> = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      series.push({
        day: key,
        label: cursor.toLocaleDateString("hi-IN", { day: "numeric", month: "short" }),
        count: perDay.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Category join for service rows (same shape as lib/data ServiceWithCategory).
    const cats = await ctx.db.category.findMany();
    const catsById = new Map(cats.map((c) => [c.id, c]));
    const withCats = <S extends { categoryIds: string[] }>(rows: S[]) =>
      rows.map((s) => ({
        ...s,
        categories: (s.categoryIds ?? [])
          .map((id) => catsById.get(id))
          .filter((c): c is (typeof cats)[number] => !!c)
          .map((c) => ({ slug: c.slug, titleHi: c.titleHi, titleEn: c.titleEn, color: c.color, icon: c.icon })),
      }));

    const [topRaw, freshRaw] = await Promise.all([
      ctx.db.service.findMany({ orderBy: [{ clickCount: "desc" }, { createdAt: "desc" }], take: 6 }),
      ctx.db.service.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    return {
      totalCategories,
      totalServices,
      activeServices,
      totalClicks,
      todayClicks,
      totalAds,
      liveAds,
      totalAdRequests,
      pendingAdRequests,
      series,
      topServices: withCats(topRaw),
      latestServices: withCats(freshRaw),
    };
  }),
  search: publicProcedure.input(z.object({ q: z.string().min(2), limit: z.number().optional().default(10) })).query(async ({ ctx, input }) => {
    const [services, jobs] = await Promise.all([
      ctx.db.service.findMany({ where: { isActive: true, OR: [{ titleEn: { contains: input.q, mode: "insensitive" } }, { titleHi: { contains: input.q, mode: "insensitive" } }] }, take: input.limit }),
      ctx.db.job.findMany({ where: { isActive: true, OR: [{ titleEn: { contains: input.q, mode: "insensitive" } }, { titleHi: { contains: input.q, mode: "insensitive" } }] }, take: input.limit }),
    ]);
    return { services, jobs };
  }),
});
