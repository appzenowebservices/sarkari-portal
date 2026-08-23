import { ObjectId } from "mongodb";
import {
  getAdsCollection,
  getAdRequestsCollection,
  getCategoriesCollection,
  getNewsletterSubscribersCollection,
  getServiceClicksCollection,
  getServicesCollection,
  getSettingsCollection,
  getJobCategoriesCollection,
  getJobOrganizationsCollection,
  getJobLocationsCollection,
  getJobQualificationsCollection,
  getJobsCollection,
  getJobVacanciesCollection,
  getJobDatesCollection,
  getJobEligibilitiesCollection,
  getJobFeesCollection,
  getJobLinksCollection,
  getJobDocumentsCollection,
  getJobSelectionProcessCollection,
  getJobFAQsCollection,
  getJobTagsCollection,
  getCompaniesCollection,
  withId,
  withIds,
} from "@/db";
import type { Ad, AdRequest, Category, NewsletterSubscriber, Service, ServiceClick, Setting, CategoryWithCount, ServiceWithCategory, Job, JobWithDetails, JobCategory, JobOrganization, JobLocation, JobQualification, Company } from "@/db/schema";
export type { CategoryWithCount, ServiceWithCategory, JobWithDetails, Company };

export interface DateRange {
  from: Date;
  to: Date;
}

export const DEFAULT_SETTINGS: Record<string, string> = {
  ticker:
    "आयुष्मान कार्ड, ई-श्रम कार्ड और PM सूर्य घर — नई सेवाएं जोड़ दी गई हैं • वोटर लिस्ट में नाम जोड़ने की तिथि जांचें • पोर्टल की सभी सेवाएं पूर्णतः निःशुल्क हैं",
  helpline: "1800-11-1551",
  email: "help@addiessarkari.in",
  about:
    "APPZENO Sarkari Portal भारत की सरकारी सेवाओं की एक निःशुल्क निर्देशिका है — आधार, पैन, वोटर ID, योजनाएं, बिल, लाइसेंस और लोन, सब कुछ एक ही जगह।",
  footerNote:
    "यह एक निजी सूचना निर्देशिका है। सभी लिंक संबंधित सरकारी विभागों की आधिकारिक वेबसाइटों की ओर ले जाते हैं। किसी भी सेवा के लिए शुल्क न दें — सरकारी पोर्टल पर आवेदन निःशुल्क होता है।",
  facebook: "",
  twitter: "",
  instagram: "",
  youtube: "",
  linkedin: "",
  telegram: "",
  whatsapp: "",
};

function logDbFallback(fnName: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  const isConn =
    msg.includes("querySrv") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("MONGODB_URI") ||
    msg.includes("MongoServerSelectionError") ||
    (err as { code?: string })?.code === "ECONNREFUSED";
  if (isConn) {
    console.warn(`[data] ${fnName} fallback (DB unavailable): ${msg.split("\n")[0].slice(0, 200)}`);
  } else {
    console.error(`[data] ${fnName} error:`, err);
  }
}

function toId(id: ObjectId): string {
  return id.toString();
}

function getServiceCategoryIds(svc: Record<string, unknown>): ObjectId[] {
  if (Array.isArray(svc.categoryIds)) {
    return svc.categoryIds.filter((id): id is ObjectId => ObjectId.isValid(id));
  }
  if (typeof svc.categoryId === "string" && ObjectId.isValid(svc.categoryId)) {
    return [new ObjectId(svc.categoryId)];
  }
  return [];
}

function serviceCategoryQuery(categoryId: ObjectId | string): Record<string, unknown> {
  const id = typeof categoryId === "string" ? new ObjectId(categoryId) : categoryId;
  return {
    $or: [
      { categoryIds: id },
      { categoryId: id },
    ],
  };
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const settings = await getSettingsCollection();
    const rows = await settings.find({}).toArray();
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch (err) {
    logDbFallback("getSettings", err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getCategories(
  opts: { includeInactive?: boolean; alphabetical?: boolean } = {}
): Promise<CategoryWithCount[]> {
  try {
    const categories = await getCategoriesCollection();
    const services = await getServicesCollection();

    const sort = opts.alphabetical
      ? ({ titleEn: 1 } as Record<string, 1 | -1>)
      : ({ sortOrder: 1, _id: 1 } as Record<string, 1 | -1>);
    const cats = await categories.find({}).sort(sort).toArray();

    const results: CategoryWithCount[] = [];
    for (const cat of cats) {
      const catQuery = serviceCategoryQuery(cat._id);
      const activeCount = await services.countDocuments({
        ...catQuery,
        isActive: true,
      });
      const totalCount = await services.countDocuments(catQuery);
      const serviceCount = opts.includeInactive ? totalCount : activeCount;
      results.push({
        id: toId(cat._id),
        slug: cat.slug,
        titleHi: cat.titleHi,
        titleEn: cat.titleEn,
        descriptionHi: cat.descriptionHi,
        descriptionEn: cat.descriptionEn,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        seoTitle: cat.seoTitle,
        metaDescription: cat.metaDescription,
        focusKeyword: cat.focusKeyword,
        ogTitle: cat.ogTitle,
        ogDescription: cat.ogDescription,
        ogImage: cat.ogImage,
        canonicalUrl: cat.canonicalUrl,
        robots: cat.robots,
        schemaType: cat.schemaType,
        createdAt: cat.createdAt,
        serviceCount,
      });
    }

    if (!opts.includeInactive) {
      return results.filter((r) => r.isActive);
    }
    return results;
  } catch (err) {
    logDbFallback("getCategories", err);
    return [];
  }
}

export async function getServicesForCategory(slug: string) {
  const categories = await getCategoriesCollection();
  const services = await getServicesCollection();

  const cat = await categories.findOne({ slug });
  if (!cat) return [];

  const rows = await services
    .find({ ...serviceCategoryQuery(cat._id), isActive: true })
    .sort({ sortOrder: 1, clickCount: -1, _id: 1 })
    .toArray();

  const catIds = rows.flatMap((r) => getServiceCategoryIds(r).map(toId));
  const uniqueCatIds = Array.from(new Set(catIds));
  const matchedCats = uniqueCatIds.length
    ? await categories.find({ _id: { $in: uniqueCatIds.map((id) => new ObjectId(id)) } }).toArray()
    : [];
  const catMap = new Map(matchedCats.map((c) => [toId(c._id), c]));

  return rows.map((r) => ({
    id: toId(r._id),
    categoryIds: getServiceCategoryIds(r).map(toId),
    titleHi: r.titleHi,
    titleEn: r.titleEn,
    url: r.url,
    descriptionHi: r.descriptionHi,
    descriptionEn: r.descriptionEn,
    tags: r.tags,
    isFeatured: r.isFeatured,
    isNew: r.isNew,
    isActive: r.isActive,
    sortOrder: r.sortOrder,
    clickCount: r.clickCount,
    createdAt: r.createdAt,
    categories: getServiceCategoryIds(r)
      .map((id) => {
        const c = catMap.get(toId(id));
        if (!c) return null;
        return {
          slug: c.slug,
          titleHi: c.titleHi,
          titleEn: c.titleEn,
          color: c.color,
          icon: c.icon,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null),
  })) as ServiceWithCategory[];
}

export async function getPopular(limit = 6, dateRange?: { from: Date; to: Date }) {
  try {
    const categories = await getCategoriesCollection();
    const services = await getServicesCollection();

    const filter: Record<string, unknown> = { isActive: true };
    if (dateRange) {
      filter.createdAt = { $gte: dateRange.from, $lte: dateRange.to };
    }

    const rows = await services
      .find(filter)
      .sort({ clickCount: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    const results: ServiceWithCategory[] = [];
    for (const svc of rows) {
      const catIds = getServiceCategoryIds(svc).map(toId);
      const cats = await categories.find({ _id: { $in: catIds.map((id) => new ObjectId(id)) } }).toArray();
      if (!cats.length) continue;
      results.push({
        id: toId(svc._id),
        categoryIds: getServiceCategoryIds(svc).map(toId),
        titleHi: svc.titleHi,
        titleEn: svc.titleEn,
        url: svc.url,
        descriptionHi: svc.descriptionHi,
        descriptionEn: svc.descriptionEn,
        tags: svc.tags,
        isFeatured: svc.isFeatured,
        isNew: svc.isNew,
        isActive: svc.isActive,
        sortOrder: svc.sortOrder,
        clickCount: svc.clickCount,
        createdAt: svc.createdAt,
        categories: cats.map((c) => ({
          slug: c.slug,
          titleHi: c.titleHi,
          titleEn: c.titleEn,
          color: c.color,
          icon: c.icon,
        })),
      });
    }
    return results;
  } catch (err) {
    logDbFallback("getPopular", err);
    return [];
  }
}

export async function getFreshServices(limit = 8, dateRange?: { from: Date; to: Date }) {
  try {
    const categories = await getCategoriesCollection();
    const services = await getServicesCollection();

    const filter: Record<string, unknown> = { isActive: true, isNew: true };
    if (dateRange) {
      filter.createdAt = { $gte: dateRange.from, $lte: dateRange.to };
    }

    const rows = await services
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const results: ServiceWithCategory[] = [];
    for (const svc of rows) {
      const catIds = getServiceCategoryIds(svc).map(toId);
      const cats = await categories.find({ _id: { $in: catIds.map((id) => new ObjectId(id)) } }).toArray();
      if (!cats.length) continue;
      results.push({
        id: toId(svc._id),
        categoryIds: getServiceCategoryIds(svc).map(toId),
        titleHi: svc.titleHi,
        titleEn: svc.titleEn,
        url: svc.url,
        descriptionHi: svc.descriptionHi,
        descriptionEn: svc.descriptionEn,
        tags: svc.tags,
        isFeatured: svc.isFeatured,
        isNew: svc.isNew,
        isActive: svc.isActive,
        sortOrder: svc.sortOrder,
        clickCount: svc.clickCount,
        createdAt: svc.createdAt,
        categories: cats.map((c) => ({
          slug: c.slug,
          titleHi: c.titleHi,
          titleEn: c.titleEn,
          color: c.color,
          icon: c.icon,
        })),
      });
    }
    return results;
  } catch (err) {
    logDbFallback("getFreshServices", err);
    return [];
  }
}

export async function getServicesByCategory(limit = 6, alphabetical = false): Promise<Record<string, ServiceWithCategory[]>> {
  try {
    const categories = await getCategoriesCollection();
    const services = await getServicesCollection();

    const catSort = alphabetical
      ? ({ titleEn: 1 } as Record<string, 1 | -1>)
      : ({ sortOrder: 1, _id: 1 } as Record<string, 1 | -1>);
    const cats = await categories.find({ isActive: true }).sort(catSort).toArray();
    const map: Record<string, ServiceWithCategory[]> = {};

    for (const cat of cats) {
      const rows = await services
        .find({ ...serviceCategoryQuery(cat._id), isActive: true })
        .sort({ sortOrder: 1, clickCount: -1, _id: 1 })
        .limit(limit)
        .toArray();

      const catIds = rows.flatMap((r) => getServiceCategoryIds(r).map(toId));
      const uniqueCatIds = Array.from(new Set(catIds));
      const matchedCats = uniqueCatIds.length
        ? await categories.find({ _id: { $in: uniqueCatIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
      const catMap = new Map(matchedCats.map((c) => [toId(c._id), c]));

      map[cat.slug] = rows.map((r) => ({
        id: toId(r._id),
        categoryIds: getServiceCategoryIds(r).map(toId),
        titleHi: r.titleHi,
        titleEn: r.titleEn,
        url: r.url,
        descriptionHi: r.descriptionHi,
        descriptionEn: r.descriptionEn,
        tags: r.tags,
        isFeatured: r.isFeatured,
        isNew: r.isNew,
        isActive: r.isActive,
        sortOrder: r.sortOrder,
        clickCount: r.clickCount,
        createdAt: r.createdAt,
        categories: getServiceCategoryIds(r)
          .map((id) => {
            const c = catMap.get(toId(id));
            if (!c) return null;
            return {
              slug: c.slug,
              titleHi: c.titleHi,
              titleEn: c.titleEn,
              color: c.color,
              icon: c.icon,
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null),
      })) as ServiceWithCategory[];
    }

    return map;
  } catch (err) {
    logDbFallback("getServicesByCategory", err);
    return {};
  }
}

export async function getFeatured(limit = 4) {
  const categories = await getCategoriesCollection();
  const services = await getServicesCollection();

  const rows = await services
    .find({ isActive: true, isFeatured: true })
    .sort({ clickCount: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  const results: ServiceWithCategory[] = [];
  for (const svc of rows) {
    const catIds = getServiceCategoryIds(svc).map(toId);
    const cats = await categories.find({ _id: { $in: catIds.map((id) => new ObjectId(id)) } }).toArray();
    if (!cats.length) continue;
    results.push({
      id: toId(svc._id),
      categoryIds: getServiceCategoryIds(svc).map(toId),
      titleHi: svc.titleHi,
      titleEn: svc.titleEn,
      url: svc.url,
      descriptionHi: svc.descriptionHi,
      descriptionEn: svc.descriptionEn,
      tags: svc.tags,
      isFeatured: svc.isFeatured,
      isNew: svc.isNew,
      isActive: svc.isActive,
      sortOrder: svc.sortOrder,
      clickCount: svc.clickCount,
      createdAt: svc.createdAt,
      categories: cats.map((c) => ({
        slug: c.slug,
        titleHi: c.titleHi,
        titleEn: c.titleEn,
        color: c.color,
        icon: c.icon,
      })),
    });
  }
  return results;
}

export async function searchServices(q: string, limit = 12) {
  const categories = await getCategoriesCollection();
  const services = await getServicesCollection();

  const regex = new RegExp(q.trim(), "i");
  const rows = await services
    .find({
      isActive: true,
      $or: [
        { titleHi: { $regex: regex } },
        { titleEn: { $regex: regex } },
        { tags: { $regex: regex } },
      ],
    })
    .sort({ clickCount: -1, titleEn: 1 })
    .limit(limit)
    .toArray();

  const results: ServiceWithCategory[] = [];
  for (const svc of rows) {
    const catIds = getServiceCategoryIds(svc).map(toId);
    const cats = await categories.find({ _id: { $in: catIds.map((id) => new ObjectId(id)) } }).toArray();
    if (!cats.length) continue;
    results.push({
      id: toId(svc._id),
      categoryIds: getServiceCategoryIds(svc).map(toId),
      titleHi: svc.titleHi,
      titleEn: svc.titleEn,
      url: svc.url,
      descriptionHi: svc.descriptionHi,
      descriptionEn: svc.descriptionEn,
      tags: svc.tags,
      isFeatured: svc.isFeatured,
      isNew: svc.isNew,
      isActive: svc.isActive,
      sortOrder: svc.sortOrder,
      clickCount: svc.clickCount,
      createdAt: svc.createdAt,
      categories: cats.map((c) => ({
        slug: c.slug,
        titleHi: c.titleHi,
        titleEn: c.titleEn,
        color: c.color,
        icon: c.icon,
      })),
    });
  }
  return results;
}

export async function getTotalClicks(): Promise<number> {
  try {
    const services = await getServicesCollection();
    const result = await services
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$clickCount" },
          },
        },
      ])
      .toArray();
    return result[0]?.total ?? 0;
  } catch (err) {
    logDbFallback("getTotalClicks", err);
    return 0;
  }
}

/* =================== ADS =================== */

export async function getAdsForPlacement(placement: string): Promise<Ad[]> {
  try {
    const ads = await getAdsCollection();
    const now = new Date();
    const rows = await ads
      .find({
        isPublished: true,
        placement,
        $or: [
          { publishAt: { $lte: now } },
          { publishAt: { $exists: false } },
          { expiresAt: { $gte: now } },
          { expiresAt: { $exists: false } },
        ],
      })
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();

    return rows.map((r) => ({
      ...r,
      id: toId(r._id),
    })) as Ad[];
  } catch (err) {
    logDbFallback("getAdsForPlacement", err);
    return [];
  }
}

export async function getAllLiveAds(): Promise<Record<string, Ad[]>> {
  try {
    const ads = await getAdsCollection();
    const now = new Date();
    const rows = await ads
      .find({
        isPublished: true,
        $or: [
          { publishAt: { $lte: now } },
          { publishAt: { $exists: false } },
          { expiresAt: { $gte: now } },
          { expiresAt: { $exists: false } },
        ],
      })
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();

    const map: Record<string, Ad[]> = {};
    for (const ad of rows) {
      if (!map[ad.placement]) map[ad.placement] = [];
      map[ad.placement].push({ ...ad, id: toId(ad._id) } as Ad);
    }
    return map;
  } catch (err) {
    logDbFallback("getAllLiveAds", err);
    return {};
  }
}

/* =================== DASHBOARD =================== */

export async function getDashboardStats(dateRange?: DateRange) {
  const categories = await getCategoriesCollection();
  const services = await getServicesCollection();
  const serviceClicks = await getServiceClicksCollection();
  const ads = await getAdsCollection();
  const adRequests = await getAdRequestsCollection();

  const [
    totalCategories,
    totalServices,
    activeServices,
    totalAds,
    liveAds,
    totalAdRequests,
    pendingAdRequests,
  ] = await Promise.all([
    categories.countDocuments({}),
    services.countDocuments({}),
    services.countDocuments({ isActive: true }),
    ads.countDocuments({}),
    ads.countDocuments({ isPublished: true }),
    adRequests.countDocuments({}),
    adRequests.countDocuments({ status: "pending" }),
  ]);

  let totalClicks: number;
  if (dateRange) {
    const totalClicksResult = await serviceClicks
      .aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
          },
        },
      ])
      .toArray();
    totalClicks = totalClicksResult[0]?.total ?? 0;
  } else {
    const totalClicksResult = await services
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$clickCount" },
          },
        },
      ])
      .toArray();
    totalClicks = totalClicksResult[0]?.total ?? 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const from = dateRange?.from ?? today;
  const to = dateRange?.to ?? endOfToday;

  const rangeClicks = await serviceClicks.countDocuments({
    createdAt: { $gte: from, $lte: to },
  });

  const series: { day: string; label: string; count: number }[] = [];

  if (dateRange) {
    const seriesMap = new Map<string, number>();
    const dailyRows = await serviceClicks
      .find({
        createdAt: { $gte: from, $lte: to },
      })
      .toArray();

    for (const row of dailyRows) {
      const dayKey = row.createdAt.toISOString().slice(0, 10);
      seriesMap.set(dayKey, (seriesMap.get(dayKey) ?? 0) + 1);
    }

    const current = new Date(from);
    current.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      series.push({
        day: key,
        label: current.toLocaleDateString("hi-IN", { day: "numeric", month: "short" }),
        count: seriesMap.get(key) ?? 0,
      });
      current.setDate(current.getDate() + 1);
    }
  } else {
    const thirteenDaysAgo = new Date();
    thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);
    thirteenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRows = await serviceClicks
      .find({
        createdAt: { $gte: thirteenDaysAgo },
      })
      .toArray();

    const seriesMap = new Map<string, number>();
    for (const row of dailyRows) {
      const dayKey = row.createdAt.toISOString().slice(0, 10);
      seriesMap.set(dayKey, (seriesMap.get(dayKey) ?? 0) + 1);
    }

    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      series.push({
        day: key,
        label: d.toLocaleDateString("hi-IN", { day: "numeric", month: "short" }),
        count: seriesMap.get(key) ?? 0,
      });
    }
  }

  const topServices = await getPopular(6, dateRange);
  const latestServices = await getFreshServices(5, dateRange);

  return {
    totalCategories,
    totalServices,
    activeServices,
    totalClicks,
    todayClicks: rangeClicks,
    totalAds,
    liveAds,
    totalAdRequests,
    pendingAdRequests,
    series,
    topServices,
    latestServices,
  };
}

export async function subscribeNewsletter(email: string, name = "", source = "footer"): Promise<NewsletterSubscriber> {
  const col = await getNewsletterSubscribersCollection();
  const now = new Date();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await col.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.status === "active") {
      throw new Error("Already subscribed");
    }
    await col.updateOne(
      { _id: existing._id },
      { $set: { status: "active", unsubscribedAt: null, updatedAt: now } }
    );
    const updated = await col.findOne({ _id: existing._id });
    return withId(updated) as NewsletterSubscriber;
  }

  const result = await col.insertOne({
    email: normalizedEmail,
    name: name.trim(),
    status: "active",
    source,
    subscribedAt: now,
    unsubscribedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to subscribe");
  return withId(row) as NewsletterSubscriber;
}

export async function unsubscribeNewsletter(email: string): Promise<boolean> {
  const col = await getNewsletterSubscribersCollection();
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();
  const result = await col.updateOne(
    { email: normalizedEmail, status: "active" },
    { $set: { status: "unsubscribed", unsubscribedAt: now, updatedAt: now } }
  );
  return result.modifiedCount > 0;
}

export async function getNewsletterSubscribers(status = "active", limit = 1000): Promise<NewsletterSubscriber[]> {
  const col = await getNewsletterSubscribersCollection();
  const filter: Record<string, unknown> = {};
  if (status !== "all") filter.status = status;
  const rows = await col.find(filter).sort({ subscribedAt: -1 }).limit(limit).toArray();
  return rows.map((r) => withId(r) as NewsletterSubscriber);
}

export async function getNewsletterStats(): Promise<{ total: number; active: number; unsubscribed: number }> {
  const col = await getNewsletterSubscribersCollection();
  const total = await col.countDocuments({});
  const active = await col.countDocuments({ status: "active" });
  const unsubscribed = await col.countDocuments({ status: "unsubscribed" });
  return { total, active, unsubscribed };
}

export async function getJobStats() {
  const jobs = await getJobsCollection();
  const now = new Date();
  const [
    totalJobs,
    activeJobs,
    featuredJobs,
    urgentJobs,
    expiredJobs,
    draftJobs,
    totalVacancies,
  ] = await Promise.all([
    jobs.countDocuments({}),
    jobs.countDocuments({ isActive: true, status: { $ne: "expired" } }),
    jobs.countDocuments({ isFeatured: true }),
    jobs.countDocuments({ isUrgent: true }),
    jobs.countDocuments({ status: "expired" }),
    jobs.countDocuments({ status: "draft" }),
    jobs.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: "$totalVacancies" } } },
    ]).toArray(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [jobsAddedToday, jobsPublishedToday, jobsExpiringToday] = await Promise.all([
    jobs.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
    jobs.countDocuments({ publishedAt: { $gte: today, $lte: todayEnd } }),
    jobs.countDocuments({
      applicationLastDate: { $gte: today, $lte: todayEnd },
      isActive: true,
      status: { $ne: "expired" },
    }),
  ]);

  const expiringSoon = await jobs
    .find({
      applicationLastDate: { $gte: now, $lte: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) },
      isActive: true,
      status: { $ne: "expired" },
    })
    .sort({ applicationLastDate: 1 })
    .limit(10)
    .toArray();

  return {
    totalJobs,
    activeJobs,
    featuredJobs,
    urgentJobs,
    expiredJobs,
    draftJobs,
    totalVacancies: totalVacancies[0]?.total ?? 0,
    jobsAddedToday,
    jobsPublishedToday,
    jobsExpiringToday,
    expiringSoon: expiringSoon.map((r) => withId(r)),
  };
}

export async function getJobs(opts: { includeInactive?: boolean; status?: string; categoryId?: string; organizationId?: string; limit?: number } = {}): Promise<JobWithDetails[]> {
  const jobs = await getJobsCollection();
  const jobCategories = await getJobCategoriesCollection();
  const jobOrganizations = await getJobOrganizationsCollection();
  const jobVacancies = await getJobVacanciesCollection();
  const jobDates = await getJobDatesCollection();
  const jobEligibilities = await getJobEligibilitiesCollection();
  const jobFees = await getJobFeesCollection();
  const jobLinks = await getJobLinksCollection();
  const jobDocuments = await getJobDocumentsCollection();
  const jobSelectionProcess = await getJobSelectionProcessCollection();
  const jobFaqs = await getJobFAQsCollection();
  const jobTags = await getJobTagsCollection();
  const jobLocations = await getJobLocationsCollection();
  const services = await getServicesCollection();

  const filter: Record<string, unknown> = {};
  if (!opts.includeInactive) filter.isActive = true;
  if (opts.status) filter.status = opts.status;
  if (opts.categoryId) filter.categoryId = new ObjectId(opts.categoryId);
  if (opts.organizationId) filter.organizationId = new ObjectId(opts.organizationId);

  const rows = await jobs.find(filter).sort({ sortOrder: -1, createdAt: -1 }).limit(opts.limit ?? 100).toArray();

  const results: JobWithDetails[] = [];
  for (const job of rows) {
    const cat = await jobCategories.findOne({ _id: job.categoryId });
    const org = await jobOrganizations.findOne({ _id: job.organizationId });
    const vacancies = await jobVacancies.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const dates = await jobDates.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const eligibilities = await jobEligibilities.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const fees = await jobFees.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const links = await jobLinks.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const documents = await jobDocuments.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const selectionProcess = await jobSelectionProcess.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
    const faqs = await jobFaqs.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();

    const tagIds = (job.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);
    const tags = tagIds.length
      ? await jobTags.find({ _id: { $in: tagIds.map((id: string) => new ObjectId(id)) } }).toArray()
      : [];

    const locationIds = (job.locationIds ?? []).map((id: string) => new ObjectId(id));
    const locations = locationIds.length
      ? await jobLocations.find({ _id: { $in: locationIds } }).toArray()
      : [];

    results.push({
      ...withId(job),
      vacancies: vacancies.map(withId),
      dates: dates.map(withId),
      eligibility: eligibilities.map(withId),
      fees: fees.map(withId),
      links: links.map(withId),
      documents: documents.map(withId),
      selectionProcess: selectionProcess.map(withId),
      faqs: faqs.map(withId),
      categories: cat ? [{ slug: cat.slug, titleHi: cat.titleHi, titleEn: cat.titleEn, color: cat.color, icon: cat.icon }] : [],
      organizations: org ? [{ slug: org.slug, nameHi: org.nameHi, nameEn: org.nameEn }] : [],
      locations: locations.map((l) => ({ slug: l.slug, titleHi: l.titleHi, titleEn: l.titleEn })),
      tagsList: tags.map((t) => ({ nameHi: t.nameHi, nameEn: t.nameEn, slug: t.slug })),
    });
  }

  return results;
}

export async function getJobBySlug(slug: string): Promise<JobWithDetails | null> {
  const jobs = await getJobsCollection();
  const job = await jobs.findOne({ slug });
  if (!job) return null;

  const jobCategories = await getJobCategoriesCollection();
  const jobOrganizations = await getJobOrganizationsCollection();
  const jobVacancies = await getJobVacanciesCollection();
  const jobDates = await getJobDatesCollection();
  const jobEligibilities = await getJobEligibilitiesCollection();
  const jobFees = await getJobFeesCollection();
  const jobLinks = await getJobLinksCollection();
  const jobDocuments = await getJobDocumentsCollection();
  const jobSelectionProcess = await getJobSelectionProcessCollection();
  const jobFaqs = await getJobFAQsCollection();
  const jobTags = await getJobTagsCollection();
  const jobLocations = await getJobLocationsCollection();

  const cat = await jobCategories.findOne({ _id: job.categoryId });
  const org = await jobOrganizations.findOne({ _id: job.organizationId });
  const vacancies = await jobVacancies.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const dates = await jobDates.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const eligibilities = await getJobEligibilitiesCollection();
  const eligDocs = await eligibilities.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const fees = await jobFees.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const links = await jobLinks.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const documents = await jobDocuments.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const selectionProcess = await jobSelectionProcess.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();
  const faqs = await jobFaqs.find({ jobId: job._id }).sort({ sortOrder: 1 }).toArray();

  const tagIds = (job.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);
  const tags = tagIds.length
    ? await jobTags.find({ _id: { $in: tagIds.map((id: string) => new ObjectId(id)) } }).toArray()
    : [];

  const locationIds = (job.locationIds ?? []).map((id: string) => new ObjectId(id));
  const locations = locationIds.length
    ? await jobLocations.find({ _id: { $in: locationIds } }).toArray()
    : [];

  return {
    ...withId(job),
    vacancies: vacancies.map(withId),
    dates: dates.map(withId),
    eligibility: eligDocs.map(withId),
    fees: fees.map(withId),
    links: links.map(withId),
    documents: documents.map(withId),
    selectionProcess: selectionProcess.map(withId),
    faqs: faqs.map(withId),
    categories: cat ? [{ slug: cat.slug, titleHi: cat.titleHi, titleEn: cat.titleEn, color: cat.color, icon: cat.icon }] : [],
    organizations: org ? [{ slug: org.slug, nameHi: org.nameHi, nameEn: org.nameEn }] : [],
    locations: locations.map((l) => ({ slug: l.slug, titleHi: l.titleHi, titleEn: l.titleEn })),
    tagsList: tags.map((t) => ({ nameHi: t.nameHi, nameEn: t.nameEn, slug: t.slug })),
  };
}

export async function getPublicJobs(opts: { status?: string; categoryId?: string; organizationId?: string; limit?: number; sort?: string } = {}): Promise<Job[]> {
  try {
    const jobs = await getJobsCollection();
    const filter: Record<string, unknown> = { isActive: true };
    if (opts.status) filter.status = opts.status;
    if (opts.categoryId) filter.categoryId = new ObjectId(opts.categoryId);
    if (opts.organizationId) filter.organizationId = new ObjectId(opts.organizationId);

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (opts.sort === "lastDate") sort = { applicationLastDate: 1 };
    else if (opts.sort === "vacancies") sort = { totalVacancies: -1 };
    else if (opts.sort === "popular") sort = { viewCount: -1 };

    const rows = await jobs.find(filter).sort(sort).limit(opts.limit ?? 50).toArray();
    return rows.map((r) => withId(r)) as Job[];
  } catch (err) {
    logDbFallback("getPublicJobs", err);
    return [];
  }
}

export async function getRelatedJobs(jobId: string, limit = 6): Promise<Job[]> {
  const jobs = await getJobsCollection();
  const job = await jobs.findOne({ _id: new ObjectId(jobId) });
  if (!job) return [];

  const related = await jobs
    .find({
      _id: { $ne: job._id },
      isActive: true,
      status: { $ne: "expired" },
      $or: [
        { categoryId: job.categoryId },
        { organizationId: job.organizationId },
        { jobType: job.jobType },
      ],
    })
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return related.map((r) => withId(r)) as Job[];
}

export async function searchCompanies(query: string, limit = 10): Promise<Company[]> {
  const col = await getCompaniesCollection();
  const regex = new RegExp(query.trim(), "i");
  const rows = await col
    .find({ name: { $regex: regex } })
    .sort({ name: 1 })
    .limit(limit)
    .toArray();
  return rows.map((r) => withId(r) as Company);
}

export async function getCompanyByName(name: string): Promise<Company | null> {
  const col = await getCompaniesCollection();
  const row = await col.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
  return row ? (withId(row) as Company) : null;
}

export async function saveCompany(data: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> {
  const col = await getCompaniesCollection();
  const now = new Date();
  const existing = await col.findOne({ name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") } });
  if (existing) {
    const updated = await col.findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          name: data.name.trim(),
          website: data.website,
          industry: data.industry,
          size: data.size,
          location: data.location,
          recruiterName: data.recruiterName,
          recruiterEmail: data.recruiterEmail,
          recruiterPhone: data.recruiterPhone,
          updatedAt: now,
        },
      },
      { returnDocument: "after", sort: { _id: -1 } }
    );
    return withId(updated) as Company;
  }
  const result = await col.insertOne({
    name: data.name.trim(),
    website: data.website,
    industry: data.industry,
    size: data.size,
    location: data.location,
    recruiterName: data.recruiterName,
    recruiterEmail: data.recruiterEmail,
    recruiterPhone: data.recruiterPhone,
    createdAt: now,
    updatedAt: now,
  });
  const row = await col.findOne({ _id: result.insertedId });
  return withId(row) as Company;
}

export async function getJobCategories(opts: { includeInactive?: boolean } = {}): Promise<JobCategory[]> {
  const col = await getJobCategoriesCollection();
  const cats = await col.find({}).sort({ sortOrder: 1 }).toArray();
  const results = cats.map((c) => withId(c)) as JobCategory[];
  if (!opts.includeInactive) return results.filter((r) => r.isActive);
  return results;
}

export async function getJobOrganizations(opts: { includeInactive?: boolean } = {}): Promise<JobOrganization[]> {
  const col = await getJobOrganizationsCollection();
  const orgs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  const results = orgs.map((o) => withId(o)) as JobOrganization[];
  if (!opts.includeInactive) return results.filter((r) => r.isActive);
  return results;
}

export async function getJobLocations(opts: { includeInactive?: boolean } = {}): Promise<JobLocation[]> {
  const col = await getJobLocationsCollection();
  const locs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  const results = locs.map((l) => withId(l)) as JobLocation[];
  if (!opts.includeInactive) return results.filter((r) => r.isActive);
  return results;
}

export async function getJobQualifications(opts: { includeInactive?: boolean } = {}): Promise<JobQualification[]> {
  const col = await getJobQualificationsCollection();
  const quals = await col.find({}).sort({ sortOrder: 1 }).toArray();
  const results = quals.map((q) => withId(q)) as JobQualification[];
  if (!opts.includeInactive) return results.filter((r) => r.isActive);
  return results;
}
