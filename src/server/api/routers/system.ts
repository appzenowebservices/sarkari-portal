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
  dashboardStats: protectedProcedure.input(z.object({ days: z.number().optional().default(14) })).query(async ({ ctx, input }) => {
    const since = new Date(Date.now() - input.days * 24 * 3600 * 1000);
    const [jobs, services, subscribers, contacts, privacy, ads, payments] = await Promise.all([
      ctx.db.job.count(), ctx.db.service.count(),
      ctx.db.newsletterSubscriber.count(), ctx.db.contactRequest.count(),
      ctx.db.privacyRequest.count(), ctx.db.advertisement.count(), ctx.db.payment.count(),
    ]);
    const recentJobs = await ctx.db.job.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5 });
    return { jobs, services, subscribers, contacts, privacy, ads, payments, recentJobs };
  }),
  search: publicProcedure.input(z.object({ q: z.string().min(2), limit: z.number().optional().default(10) })).query(async ({ ctx, input }) => {
    const [services, jobs] = await Promise.all([
      ctx.db.service.findMany({ where: { isActive: true, OR: [{ titleEn: { contains: input.q, mode: "insensitive" } }, { titleHi: { contains: input.q, mode: "insensitive" } }] }, take: input.limit }),
      ctx.db.job.findMany({ where: { isActive: true, OR: [{ titleEn: { contains: input.q, mode: "insensitive" } }, { titleHi: { contains: input.q, mode: "insensitive" } }] }, take: input.limit }),
    ]);
    return { services, jobs };
  }),
});
