import { ObjectId } from "mongodb";
import { getPrivacyRequestsCollection, withId } from "@/db";
import type { PrivacyRequest } from "@/db/schema";

export async function createPrivacyRequest(data: Omit<PrivacyRequest, "id" | "requestId" | "createdAt" | "updatedAt" | "submittedAt" | "verifiedAt" | "reviewStartedAt" | "completedAt" | "closedAt"> & {
  verificationStatus?: string;
}): Promise<PrivacyRequest> {
  const col = await getPrivacyRequestsCollection();
  const now = new Date();
  const requestId = "PR-2026-" + String(Math.floor(Math.random() * 900000 + 100000));

  const result = await col.insertOne({
    ...data,
    requestId,
    status: data.status || "RECEIVED",
    priority: data.priority || "normal",
    verificationStatus: data.verificationStatus || "pending",
      assignedTo: data.assignedTo || "",
      internalNotes: data.internalNotes || "",
      reply: data.reply || "",
      submittedAt: now,
    verifiedAt: null,
    reviewStartedAt: null,
    completedAt: null,
    closedAt: null,
    resolution: "",
    rejectionReason: "",
    createdAt: now,
    updatedAt: now,
  });

  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create privacy request");
  return withId(row) as PrivacyRequest;
}

export async function getPrivacyRequests(limit = 100): Promise<PrivacyRequest[]> {
  const col = await getPrivacyRequestsCollection();
  const rows = await col.find({}).sort({ submittedAt: -1 }).limit(limit).toArray();
  return rows.map((r) => withId(r) as PrivacyRequest);
}

export async function getPrivacyRequestByRequestId(requestId: string): Promise<PrivacyRequest | null> {
  const col = await getPrivacyRequestsCollection();
  const row = await col.findOne({ requestId });
  if (!row) return null;
  return withId(row) as PrivacyRequest;
}

export async function updatePrivacyRequest(requestId: string, data: Partial<PrivacyRequest>): Promise<PrivacyRequest | null> {
  const col = await getPrivacyRequestsCollection();
  const result = await col.findOneAndUpdate(
    { requestId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as PrivacyRequest;
}

export async function getPrivacyRequestStats(): Promise<{
  total: number;
  received: number;
  verificationRequired: number;
  underReview: number;
  processing: number;
  completed: number;
  rejected: number;
}> {
  const col = await getPrivacyRequestsCollection();
  const total = await col.countDocuments({});
  const received = await col.countDocuments({ status: "RECEIVED" });
  const verificationRequired = await col.countDocuments({ status: "VERIFICATION_REQUIRED" });
  const underReview = await col.countDocuments({ status: "UNDER_REVIEW" });
  const processing = await col.countDocuments({ status: "PROCESSING" });
  const completed = await col.countDocuments({ status: "COMPLETED" });
  const rejected = await col.countDocuments({ status: "REJECTED" });
  return { total, received, verificationRequired, underReview, processing, completed, rejected };
}
