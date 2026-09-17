import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const adsRouter = createTRPCRouter({
  liveAds: publicProcedure.query(({ ctx }) => ctx.db.ad.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } })),
  adsForPlacement: publicProcedure.input(z.object({ placement: z.string() })).query(({ ctx, input }) =>
    ctx.db.ad.findMany({ where: { placement: input.placement, isPublished: true }, orderBy: { sortOrder: "asc" } })),

  adminAds: protectedProcedure.query(({ ctx }) => ctx.db.ad.findMany({ orderBy: { sortOrder: "asc" } })),
  upsertAd: protectedProcedure.input(z.object({ id: z.string().optional(), placement: z.string().optional().default(""), titleHi: z.string().optional().default(""), titleEn: z.string().optional().default(""), isPublished: z.boolean().optional().default(false), sortOrder: z.number().optional().default(0) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.ad.update({ where: { id }, data: rest });
    return ctx.db.ad.create({ data: rest as never });
  }),
  deleteAd: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.ad.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),

  // ad requests (public advertise form + admin)
  submitAdRequest: publicProcedure.input(z.object({
    name: z.string().min(1), email: z.string().email(), phone: z.string().optional().default(""),
    company: z.string().optional().default(""), adType: z.string().optional().default(""),
    preferredPlacement: z.string().optional().default(""), duration: z.string().optional().default(""),
    budget: z.string().optional().default(""), message: z.string().optional().default(""),
  })).mutation(async ({ ctx, input }) => {
    const req = await ctx.db.adRequest.create({ data: { ...input, status: "RECEIVED", adminNotes: "" } });
    return { ok: true, id: req.id };
  }),
  adRequestStatus:
    publicProcedure.input(z.object(
      { id: z.string() })).query(
        ({ ctx, input }) =>
          ctx.db.adRequest.findUnique(
            { where: { id: input.id } })),
  adminAdRequests: protectedProcedure.query(({ ctx }) => ctx.db.adRequest.findMany({ orderBy: { createdAt: "desc" } })),
  updateAdRequest: protectedProcedure.input(z.object({ id: z.string(), status: z.string().optional(), adminNotes: z.string().optional() })).mutation(({ ctx, input }) => ctx.db.adRequest.update({ where: { id: input.id }, data: { status: input.status, adminNotes: input.adminNotes } }).then(() => ({ ok: true }))),
  deleteAdRequest: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.adRequest.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),

  // advertisements lifecycle
  submitAdvertisement: publicProcedure.input(z.object({
    advertiserName: z.string().min(1), email: z.string().email(), mobile: z.string().optional().default(""),
    adTypeCode: z.string().optional().default(""), placementCode: z.string().optional().default(""),
    durationDays: z.number().optional().default(0), adTitle: z.string().optional().default(""),
    destinationUrl: z.string().optional().default(""),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const requestId = `ADV-${Date.now()}`;
    const ad = await ctx.db.advertisement.create({ data: { ...input, requestId, status: "DRAFT", paymentStatus: "PENDING" } as never });
    return { ok: true, requestId, id: ad.id };
  }),
  advertisementStatus: publicProcedure.input(z.object({ requestId: z.string() })).query(({ ctx, input }) => ctx.db.advertisement.findUnique({ where: { requestId: input.requestId } })),
  adminAdvertisements: protectedProcedure.query(({ ctx }) => ctx.db.advertisement.findMany({ orderBy: { createdAt: "desc" } })),
  updateAdvertisement: protectedProcedure.input(z.object({ requestId: z.string(), status: z.string().optional(), paymentStatus: z.string().optional(), adminReply: z.string().optional(), internalNotes: z.string().optional(), rejectionReason: z.string().optional() }).passthrough()).mutation(({ ctx, input }) => {
    const { requestId, ...rest } = input;
    return ctx.db.advertisement.update({ where: { requestId }, data: rest }).then(() => ({ ok: true }));
  }),

  // pricing master
  adPricing: publicProcedure.query(async ({ ctx }) => {
    const [adTypes, placements, plans] = await Promise.all([
      ctx.db.adType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      ctx.db.placement.findMany({ where: { isActive: true }, orderBy: { priority: "asc" } }),
      ctx.db.durationPlan.findMany({ where: { isActive: true }, orderBy: { days: "asc" } }),
    ]);
    return { adTypes, placements, plans };
  }),
  adminAdTypes: protectedProcedure.query(({ ctx }) => ctx.db.adType.findMany({ orderBy: { sortOrder: "asc" } })),
  upsertAdType: protectedProcedure.input(z.object({ id: z.string().optional(), code: z.string(), nameHi: z.string().optional().default(""), nameEn: z.string().optional().default(""), basePrice: z.number().optional().default(0), billingUnit: z.string().optional().default(""), isActive: z.boolean().optional().default(true), sortOrder: z.number().optional().default(0) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.adType.update({ where: { id }, data: rest });
    return ctx.db.adType.create({ data: rest as never });
  }),
  deleteAdType: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.adType.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),
  adminPlacements: protectedProcedure.query(({ ctx }) => ctx.db.placement.findMany({ orderBy: { priority: "asc" } })),
  upsertPlacement: protectedProcedure.input(z.object({ id: z.string().optional(), code: z.string(), nameHi: z.string().optional().default(""), nameEn: z.string().optional().default(""), multiplier: z.number().optional().default(1), priority: z.number().optional().default(0), isActive: z.boolean().optional().default(true) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.placement.update({ where: { id }, data: rest });
    return ctx.db.placement.create({ data: rest as never });
  }),
  deletePlacement: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.placement.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),
  adminPlans: protectedProcedure.query(({ ctx }) => ctx.db.durationPlan.findMany({ orderBy: { days: "asc" } })),
  upsertPlan: protectedProcedure.input(z.object({ id: z.string().optional(), days: z.number(), discountPercent: z.number().optional().default(0), isActive: z.boolean().optional().default(true) }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    if (id) return ctx.db.durationPlan.update({ where: { id }, data: rest });
    return ctx.db.durationPlan.create({ data: rest as never });
  }),
  deletePlan: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.db.durationPlan.delete({ where: { id: input.id } }).then(() => ({ ok: true }))),

  quote: publicProcedure.input(z.object({ adTypeCode: z.string(), placementCode: z.string(), durationDays: z.number() })).query(async ({ ctx, input }) => {
    const [adType, placement, plans] = await Promise.all([
      ctx.db.adType.findUnique({ where: { code: input.adTypeCode } }),
      ctx.db.placement.findUnique({ where: { code: input.placementCode } }),
      ctx.db.durationPlan.findMany({ where: { isActive: true } }),
    ]);
    const base = adType?.basePrice ?? 0;
    const mult = placement?.multiplier ?? 1;
    const gross = base * mult * Math.max(1, input.durationDays);
    const plan = plans.filter((p) => p.days <= input.durationDays).sort((a, b) => b.days - a.days)[0];
    const discountPercent = plan?.discountPercent ?? 0;
    const discount = (gross * discountPercent) / 100;
    const subtotal = gross - discount;
    const gstPercent = 18;
    const gst = (subtotal * gstPercent) / 100;
    return { base, mult, gross, discountPercent, discount, subtotal, gstPercent, gst, total: subtotal + gst };
  }),

  companies: protectedProcedure.query(({ ctx }) => ctx.db.company.findMany({ orderBy: { createdAt: "desc" } })),
  searchCompanies: publicProcedure.input(z.object({ q: z.string() })).query(({ ctx, input }) => ctx.db.company.findMany({ where: { name: { contains: input.q, mode: "insensitive" } }, take: 10 })),
});
