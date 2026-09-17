import { MongoClient, Db, Collection, ObjectId } from "mongodb";

// Single source of truth is DATABASE_URL (see .env.example).
// MONGODB_URI is kept as an override for legacy setups.
const MONGODB_URI = (process.env.MONGODB_URI ?? process.env.DATABASE_URL) as string;

if (!MONGODB_URI) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __addiesSarkariPortalDb?: Db;
};

export async function getDb(): Promise<Db> {
  if (globalForDb.__addiesSarkariPortalDb) {
    return globalForDb.__addiesSarkariPortalDb;
  }

  const client = new MongoClient(MONGODB_URI, {
    serverApi: { version: "1", deprecationErrors: true },
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 30000),
    connectTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 30000),
    socketTimeoutMS: 10000,
  });
  await client.connect();
  const db = client.db();

  globalForDb.__addiesSarkariPortalDb = db;
  return db;
}

export async function getCollection(name: string): Promise<Collection<any>> {
  const db = await getDb();
  return db.collection(name);
}

export function withId<T extends { _id: ObjectId }>(doc: T): T & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() } as T & { id: string };
}

export function withIds<T extends { _id: ObjectId }>(docs: T[]): Array<T & { id: string }> {
  return docs.map(withId);
}

export async function getAdminsCollection(): Promise<Collection<any>> {
  const col = await getCollection("admins");
  await col.createIndex({ username: 1 }, { unique: true });
  return col;
}

export async function getSessionsCollection(): Promise<Collection<any>> {
  const col = await getCollection("sessions");
  await col.createIndex({ token: 1 }, { unique: true });
  await col.createIndex({ adminId: 1 });
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return col;
}

export async function getCategoriesCollection(): Promise<Collection<any>> {
  const col = await getCollection("categories");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getServicesCollection(): Promise<Collection<any>> {
  const col = await getCollection("services");
  await col.createIndex({ categoryIds: 1 });
  await col.createIndex({ url: 1 });

  try {
    const indexes = await col.indexes();
    const compound = indexes.find(
      (idx) => "key" in idx && (idx.key as Record<string, number>).url === 1 && (idx.key as Record<string, number>).categoryId === 1
    );
    if (compound && compound.unique && compound.name) {
      await col.dropIndex(compound.name);
    }
  } catch {
    // ignore index cleanup errors
  }

  return col;
}

export async function getServiceClicksCollection(): Promise<Collection<any>> {
  const col = await getCollection("serviceClicks");
  await col.createIndex({ serviceId: 1 });
  await col.createIndex({ createdAt: -1 });
  return col;
}

export async function getSettingsCollection(): Promise<Collection<any>> {
  const col = await getCollection("settings");
  await col.createIndex({ key: 1 }, { unique: true });
  return col;
}

export async function getAdsCollection(): Promise<Collection<any>> {
  const col = await getCollection("ads");
  await col.createIndex({ placement: 1, isPublished: 1 });
  await col.createIndex({ publishAt: 1 });
  await col.createIndex({ expiresAt: 1 });
  return col;
}

export async function getAdRequestsCollection(): Promise<Collection<any>> {
  const col = await getCollection("adRequests");
  await col.createIndex({ status: 1 });
  await col.createIndex({ createdAt: -1 });
  return col;
}

export async function getAdTypesCollection(): Promise<Collection<any>> {
  const col = await getCollection("adTypes");
  await col.createIndex({ code: 1 }, { unique: true });
  await col.createIndex({ isActive: 1 });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getPlacementsCollection(): Promise<Collection<any>> {
  const col = await getCollection("placements");
  await col.createIndex({ code: 1 }, { unique: true });
  await col.createIndex({ isActive: 1 });
  await col.createIndex({ priority: 1 });
  return col;
}

export async function getDurationPlansCollection(): Promise<Collection<any>> {
  const col = await getCollection("durationPlans");
  await col.createIndex({ days: 1 }, { unique: true });
  await col.createIndex({ isActive: 1 });
  return col;
}

export async function getAdvertisementsCollection(): Promise<Collection<any>> {
  const col = await getCollection("advertisements");
  await col.createIndex({ requestId: 1 }, { unique: true });
  await col.createIndex({ status: 1 });
  await col.createIndex({ paymentStatus: 1 });
  await col.createIndex({ createdAt: -1 });
  return col;
}

export async function getPaymentsCollection(): Promise<Collection<any>> {
  const col = await getCollection("payments");
  await col.createIndex({ advertisementId: 1 });
  await col.createIndex({ requestId: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ createdAt: -1 });
  return col;
}

export async function getPaymentSettingsCollection(): Promise<Collection<any>> {
  const col = await getCollection("paymentSettings");
  await col.createIndex({ id: 1 }, { unique: true });
  return col;
}

export async function getCookieSettingsCollection(): Promise<Collection<any>> {
  const col = await getCollection("cookie_settings");
  await col.createIndex({ settingId: 1 }, { unique: true });
  return col;
}

export async function getCookieCategoriesCollection(): Promise<Collection<any>> {
  const col = await getCollection("cookie_categories");
  await col.createIndex({ code: 1 }, { unique: true });
  await col.createIndex({ displayOrder: 1 });
  return col;
}

export async function getCookieConsentsCollection(): Promise<Collection<any>> {
  const col = await getCollection("cookie_consents");
  await col.createIndex({ anonymousId: 1 });
  await col.createIndex({ userId: 1 });
  await col.createIndex({ consentTimestamp: -1 });
  await col.createIndex({ policyVersion: 1 });
  return col;
}

export async function getCookieConsentHistoryCollection(): Promise<Collection<any>> {
  const col = await getCollection("cookie_consent_history");
  await col.createIndex({ consentId: 1 });
  await col.createIndex({ timestamp: -1 });
  return col;
}

export async function getNewsletterSubscribersCollection(): Promise<Collection<any>> {
  const col = await getCollection("newsletter_subscribers");
  await col.createIndex({ email: 1 }, { unique: true });
  await col.createIndex({ status: 1 });
  await col.createIndex({ createdAt: -1 });
  await col.createIndex({ verificationToken: 1 }, { sparse: true });
  return col;
}

export async function getPrivacyRequestsCollection(): Promise<Collection<any>> {
  const col = await getCollection("privacy_requests");
  await col.createIndex({ requestId: 1 }, { unique: true });
  await col.createIndex({ email: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ submittedAt: -1 });
  return col;
}

export async function getContactRequestsCollection(): Promise<Collection<any>> {
  const col = await getCollection("contact_requests");
  await col.createIndex({ ticketId: 1 }, { unique: true });
  await col.createIndex({ email: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ submittedAt: -1 });
  return col;
}

export async function getJobCategoriesCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_categories");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getJobOrganizationsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_organizations");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getJobLocationsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_locations");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getJobQualificationsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_qualifications");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getJobsCollection(): Promise<Collection<any>> {
  const col = await getCollection("jobs");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ categoryId: 1 });
  await col.createIndex({ organizationId: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ isActive: 1 });
  await col.createIndex({ isFeatured: 1 });
  await col.createIndex({ applicationLastDate: 1 });
  await col.createIndex({ sortOrder: 1 });
  await col.createIndex({ createdAt: -1 });
  return col;
}

export async function getJobVacanciesCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_vacancies");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobDatesCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_dates");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobEligibilitiesCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_eligibilities");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobFeesCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_fees");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobLinksCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_links");
  await col.createIndex({ jobId: 1 });
  await col.createIndex({ linkType: 1 });
  return col;
}

export async function getJobDocumentsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_documents");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobSelectionProcessCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_selection_process");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobFAQsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_faqs");
  await col.createIndex({ jobId: 1 });
  return col;
}

export async function getJobTagsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_tags");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  return col;
}

export async function getJobClicksCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_clicks");
  await col.createIndex({ jobId: 1 });
  await col.createIndex({ linkType: 1 });
  await col.createIndex({ timestamp: -1 });
  return col;
}

export async function getJobViewsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_views");
  await col.createIndex({ jobId: 1 });
  await col.createIndex({ timestamp: -1 });
  return col;
}

export async function getJobHistoryCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_history");
  await col.createIndex({ jobId: 1 });
  await col.createIndex({ timestamp: -1 });
  return col;
}

export async function getJobSocialPostsCollection(): Promise<Collection<any>> {
  const col = await getCollection("job_social_posts");
  await col.createIndex({ jobId: 1 });
  await col.createIndex({ platform: 1 });
  await col.createIndex({ status: 1 });
  return col;
}

export async function getCompaniesCollection(): Promise<Collection<any>> {
  const col = await getCollection("companies");
  await col.createIndex({ name: 1 }, { unique: true });
  return col;
}

/* ───────────────────────── Newsletter Collections ───────────────────────── */

