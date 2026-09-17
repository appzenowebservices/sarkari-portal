import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const contactRouter = createTRPCRouter({
  submit: publicProcedure.input(z.object({
    fullName: z.string().min(1), email: z.string().email(), requestType: z.string().min(1),
    subject: z.string().min(1), message: z.string().min(1), agreed: z.literal(true),
  })).mutation(async ({ ctx, input }) => {
    const ticketId = `CNT-${Date.now()}`;
    const ticket = await ctx.db.contactRequest.create({ data: { ticketId, fullName: input.fullName.trim(), email: input.email.trim().toLowerCase(), requestType: input.requestType, subject: input.subject.trim(), message: input.message.trim(), status: "RECEIVED", priority: "normal" } });
    return { ok: true, ticket: { ticketId: ticket.ticketId } };
  }),
  status: publicProcedure.input(z.object({ ticketId: z.string() })).query(({ ctx, input }) => ctx.db.contactRequest.findUnique({ where: { ticketId: input.ticketId } })),
  adminList: protectedProcedure.input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20), status: z.string().optional() })).query(async ({ ctx, input }) => {
    const where = input.status ? { status: input.status } : {};
    const [total, items] = await Promise.all([
      ctx.db.contactRequest.count({ where }),
      ctx.db.contactRequest.findMany({ where, skip: (input.page - 1) * input.limit, take: input.limit, orderBy: { submittedAt: "desc" } }),
    ]);
    return { items, total, page: input.page, limit: input.limit };
  }),
  adminUpdate: protectedProcedure.input(z.object({ ticketId: z.string(), status: z.string().optional(), reply: z.string().optional(), internalNotes: z.string().optional(), assignedTo: z.string().optional(), priority: z.string().optional(), resolution: z.string().optional() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { ticketId, ...rest } = input;
    await ctx.db.contactRequest.update({ where: { ticketId }, data: rest });
    return { ok: true };
  }),
});

export const privacyRouter = createTRPCRouter({
  submit: publicProcedure.input(z.object({
    fullName: z.string().min(1), email: z.string().email(), requestType: z.string().min(1),
    subject: z.string().optional().default(""), description: z.string().optional().default(""),
    mobile: z.string().optional().default(""),
  }).passthrough()).mutation(async ({ ctx, input }) => {
    const requestId = `PRV-${Date.now()}`;
    const req = await ctx.db.privacyRequest.create({ data: { ...input, requestId, status: "RECEIVED", priority: "normal" } as never });
    return { ok: true, requestId: req.requestId };
  }),
  status: publicProcedure.input(z.object({ requestId: z.string() })).query(({ ctx, input }) => ctx.db.privacyRequest.findUnique({ where: { requestId: input.requestId } })),
  adminList: protectedProcedure.input(z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20), status: z.string().optional() })).query(async ({ ctx, input }) => {
    const where = input.status ? { status: input.status } : {};
    const [total, items] = await Promise.all([
      ctx.db.privacyRequest.count({ where }),
      ctx.db.privacyRequest.findMany({ where, skip: (input.page - 1) * input.limit, take: input.limit, orderBy: { submittedAt: "desc" } }),
    ]);
    return { items, total, page: input.page, limit: input.limit };
  }),
  adminUpdate: protectedProcedure.input(z.object({ id: z.string(), status: z.string().optional(), reply: z.string().optional(), internalNotes: z.string().optional(), assignedTo: z.string().optional(), priority: z.string().optional(), resolution: z.string().optional(), rejectionReason: z.string().optional() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    await ctx.db.privacyRequest.update({ where: { id }, data: rest });
    return { ok: true };
  }),
});
