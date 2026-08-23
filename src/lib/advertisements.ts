import { ObjectId } from "mongodb";
import { getAdvertisementsCollection, withId } from "@/db";
import type { Advertisement } from "@/db/schema";

export async function createAdvertisement(data: Omit<Advertisement, "id" | "createdAt" | "updatedAt">): Promise<Advertisement> {
  const col = await getAdvertisementsCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create advertisement");
  return withId(row) as Advertisement;
}

export async function getAdvertisements(limit = 100): Promise<Advertisement[]> {
  const col = await getAdvertisementsCollection();
  const rows = await col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return rows.map((r) => withId(r) as Advertisement);
}

export async function getAdvertisementByRequestId(requestId: string): Promise<Advertisement | null> {
  const col = await getAdvertisementsCollection();
  const row = await col.findOne({ requestId });
  if (!row) return null;
  return withId(row) as Advertisement;
}

export async function updateAdvertisement(requestId: string, data: Partial<Advertisement>): Promise<Advertisement | null> {
  const col = await getAdvertisementsCollection();
  const result = await col.findOneAndUpdate(
    { requestId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as Advertisement;
}

export async function getAdvertisementStats(): Promise<{
  total: number;
  draft: number;
  submitted: number;
  paymentPending: number;
  paymentVerification: number;
  contentReview: number;
  approved: number;
  scheduled: number;
  live: number;
  expired: number;
  rejected: number;
  cancelled: number;
}> {
  const col = await getAdvertisementsCollection();
  const total = await col.countDocuments({});
  const draft = await col.countDocuments({ status: "DRAFT" });
  const submitted = await col.countDocuments({ status: "SUBMITTED" });
  const paymentPending = await col.countDocuments({ status: "PAYMENT_PENDING" });
  const paymentVerification = await col.countDocuments({ status: "PAYMENT_VERIFICATION" });
  const contentReview = await col.countDocuments({ status: "CONTENT_REVIEW" });
  const approved = await col.countDocuments({ status: "APPROVED" });
  const scheduled = await col.countDocuments({ status: "SCHEDULED" });
  const live = await col.countDocuments({ status: "LIVE" });
  const expired = await col.countDocuments({ status: "EXPIRED" });
  const rejected = await col.countDocuments({ status: "REJECTED" });
  const cancelled = await col.countDocuments({ status: "CANCELLED" });
  return { total, draft, submitted, paymentPending, paymentVerification, contentReview, approved, scheduled, live, expired, rejected, cancelled };
}
