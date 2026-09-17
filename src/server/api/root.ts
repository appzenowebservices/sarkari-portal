import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { jobRouter } from "@/server/api/routers/job";
import { jobTaxonomyRouter } from "@/server/api/routers/jobTaxonomy";
import { catalogRouter } from "@/server/api/routers/catalog";
import { adsRouter } from "@/server/api/routers/ads";
import { newsletterRouter } from "@/server/api/routers/newsletter";
import { contactRouter, privacyRouter } from "@/server/api/routers/contact";
import { cookieRouter, paymentRouter, systemRouter } from "@/server/api/routers/system";

export const appRouter = createTRPCRouter({
  job: jobRouter,
  jobTaxonomy: jobTaxonomyRouter,
  catalog: catalogRouter,
  ads: adsRouter,
  newsletter: newsletterRouter,
  contact: contactRouter,
  privacy: privacyRouter,
  cookie: cookieRouter,
  payment: paymentRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
