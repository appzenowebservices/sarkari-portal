import { randomBytes } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure.input(z.object({ email: z.string().email(), name: z.string().optional().default("") })).mutation(async ({ ctx, input }) => {
    const email = input.email.trim().toLowerCase();
    const existing = await ctx.db.newsletterSubscriber.findUnique({ where: { email } });
    if (existing?.isVerified) return { ok: true, alreadySubscribed: true };
    const verificationToken = randomBytes(32).toString("hex");
    if (existing) {
      await ctx.db.newsletterSubscriber.update({ where: { email }, data: { name: input.name || existing.name, status: "pending", isVerified: false, verificationToken, verifiedAt: null } });
    } else {
      await ctx.db.newsletterSubscriber.create({ data: { email, name: input.name, status: "pending", source: "website", preferences: { jobs: true }, isVerified: false, verificationToken } as never });
    }
    return { ok: true };
  }),
  verify: publicProcedure.input(z.object({ token: z.string() })).mutation(async ({ ctx, input }) => {
    const sub = await ctx.db.newsletterSubscriber.findFirst({ where: { verificationToken: input.token } });
    if (!sub) throw new Error("Invalid token");
    await ctx.db.newsletterSubscriber.update({ where: { id: sub.id }, data: { isVerified: true, status: "active", verifiedAt: new Date(), verificationToken: null } });
    return { ok: true };
  }),
  unsubscribe: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ ctx, input }) => {
    await ctx.db.newsletterSubscriber.update({ where: { email: input.email.toLowerCase() }, data: { status: "unsubscribed", isVerified: false } });
    return { ok: true };
  }),

  adminList: protectedProcedure.input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20), status: z.string().optional() })).query(async ({ ctx, input }) => {
    const where = input.status ? { status: input.status } : {};
    const [total, subscribers] = await Promise.all([
      ctx.db.newsletterSubscriber.count({ where }),
      ctx.db.newsletterSubscriber.findMany({ where, skip: (input.page - 1) * input.limit, take: input.limit, orderBy: { createdAt: "desc" } }),
    ]);
    return { subscribers, total, page: input.page, limit: input.limit };
  }),
  adminStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, active, pending, unsub] = await Promise.all([
      ctx.db.newsletterSubscriber.count(), ctx.db.newsletterSubscriber.count({ where: { status: "active" } }),
      ctx.db.newsletterSubscriber.count({ where: { status: "pending" } }), ctx.db.newsletterSubscriber.count({ where: { status: "unsubscribed" } }),
    ]);
    return { total, active, pending, unsubscribed: unsub };
  }),
  adminUpdate: protectedProcedure.input(z.object({ id: z.string(), status: z.string().optional() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    await ctx.db.newsletterSubscriber.update({ where: { id }, data: rest });
    return { ok: true };
  }),
  adminDelete: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.newsletterSubscriber.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),
  adminBulk: protectedProcedure.input(z.object({ ids: z.array(z.string()), action: z.enum(["activate", "unsubscribe", "delete"]) })).mutation(async ({ ctx, input }) => {
    if (input.action === "delete") await ctx.db.newsletterSubscriber.deleteMany({ where: { id: { in: input.ids } } });
    else await ctx.db.newsletterSubscriber.updateMany({ where: { id: { in: input.ids } }, data: { status: input.action === "activate" ? "active" : "unsubscribed" } });
    return { ok: true };
  }),
  adminSettings: protectedProcedure.query(({ ctx }) => ctx.db.newsletterSetting.findMany()),
  adminUpsertSetting: protectedProcedure.input(z.object({ key: z.string(), value: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.newsletterSetting.upsert({ where: { key: input.key }, create: input, update: { value: input.value } });
    return { ok: true };
  }),
});
