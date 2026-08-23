import { ObjectId } from "mongodb";
import {
  getCookieCategoriesCollection,
  getCookieConsentHistoryCollection,
  getCookieConsentsCollection,
  getCookieSettingsCollection,
  withId,
} from "@/db";
import type { CookieCategory, CookieConsent, CookieConsentHistory, CookieSettings } from "@/db/schema";

export async function getCookieSettings(): Promise<CookieSettings | null> {
  const col = await getCookieSettingsCollection();
  const row = await col.findOne({ settingId: "COOKIE-SETTINGS-001" });
  if (!row) return null;
  return withId(row) as CookieSettings;
}

export async function saveCookieSettings(data: Partial<CookieSettings> & { settingId: string; updatedBy: string }): Promise<CookieSettings> {
  const col = await getCookieSettingsCollection();
  const now = new Date();
  const update: Record<string, unknown> = {
    ...data,
    updatedAt: now,
  };
  if (data.bannerEnabled === undefined) delete update.bannerEnabled;
  if (data.bannerTitle === undefined) delete update.bannerTitle;
  if (data.bannerDescription === undefined) delete update.bannerDescription;
  if (data.position === undefined) delete update.position;
  if (data.layout === undefined) delete update.layout;
  if (data.policyVersion === undefined) delete update.policyVersion;
  if (data.policyUrl === undefined) delete update.policyUrl;
  if (data.privacyPolicyUrl === undefined) delete update.privacyPolicyUrl;

  const result = await col.findOneAndUpdate(
    { settingId: data.settingId },
    { $set: update, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  return result as unknown as CookieSettings;
}

export async function getCookieCategories(): Promise<CookieCategory[]> {
  const col = await getCookieCategoriesCollection();
  const rows = await col.find({}).sort({ displayOrder: 1 }).toArray();
  return rows.map((r) => withId(r) as CookieCategory);
}

export async function getActiveCookieCategories(): Promise<CookieCategory[]> {
  const col = await getCookieCategoriesCollection();
  const rows = await col.find({ status: "active" }).sort({ displayOrder: 1 }).toArray();
  return rows.map((r) => withId(r) as CookieCategory);
}

export async function createCookieCategory(data: Omit<CookieCategory, "id" | "createdAt" | "updatedAt">): Promise<CookieCategory> {
  const col = await getCookieCategoriesCollection();
  const now = new Date();
  const result = await col.insertOne({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create cookie category");
  return withId(row) as CookieCategory;
}

export async function updateCookieCategory(id: string, data: Partial<CookieCategory>): Promise<CookieCategory | null> {
  const col = await getCookieCategoriesCollection();
  if (!ObjectId.isValid(id)) return null;
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as CookieCategory;
}

export async function deleteCookieCategory(id: string): Promise<boolean> {
  const col = await getCookieCategoriesCollection();
  if (!ObjectId.isValid(id)) return false;
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function getCookieConsent(anonymousId: string): Promise<CookieConsent | null> {
  const col = await getCookieConsentsCollection();
  const row = await col.findOne({ anonymousId }, { sort: { consentTimestamp: -1 } });
  if (!row) return null;
  return withId(row) as CookieConsent;
}

export async function createCookieConsent(data: Omit<CookieConsent, "id" | "createdAt" | "updatedAt">): Promise<CookieConsent> {
  const col = await getCookieConsentsCollection();
  const now = new Date();
  const result = await col.insertOne({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create cookie consent");
  return withId(row) as CookieConsent;
}

export async function updateCookieConsent(id: string, data: Partial<CookieConsent>): Promise<CookieConsent | null> {
  const col = await getCookieConsentsCollection();
  if (!ObjectId.isValid(id)) return null;
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as CookieConsent;
}

export async function getCookieConsentHistory(consentId: string): Promise<CookieConsentHistory[]> {
  const col = await getCookieConsentHistoryCollection();
  const rows = await col.find({ consentId }).sort({ timestamp: -1 }).toArray();
  return rows.map((r) => withId(r) as CookieConsentHistory);
}

export async function createCookieConsentHistory(data: Omit<CookieConsentHistory, "id" | "createdAt">): Promise<CookieConsentHistory> {
  const col = await getCookieConsentHistoryCollection();
  const now = new Date();
  const result = await col.insertOne({
    ...data,
    createdAt: now,
  });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create cookie consent history");
  return withId(row) as CookieConsentHistory;
}

export async function getAllCookieConsents(limit = 100): Promise<CookieConsent[]> {
  const col = await getCookieConsentsCollection();
  const rows = await col.find({}).sort({ consentTimestamp: -1 }).limit(limit).toArray();
  return rows.map((r) => withId(r) as CookieConsent);
}

export async function getCookieConsentStats(): Promise<{
  total: number;
  acceptedAll: number;
  rejectedOptional: number;
  customized: number;
  withdrawn: number;
  pending: number;
}> {
  const col = await getCookieConsentsCollection();
  const total = await col.countDocuments({});
  const acceptedAll = await col.countDocuments({ consentStatus: "ACCEPTED_ALL" });
  const rejectedOptional = await col.countDocuments({ consentStatus: "REJECTED_OPTIONAL" });
  const customized = await col.countDocuments({ consentStatus: "CUSTOMIZED" });
  const withdrawn = await col.countDocuments({ consentStatus: "WITHDRAWN" });
  const pending = await col.countDocuments({ consentStatus: "PENDING" });
  return { total, acceptedAll, rejectedOptional, customized, withdrawn, pending };
}
