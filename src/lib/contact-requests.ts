import { ObjectId } from "mongodb";
import { getContactRequestsCollection, withId } from "@/db";
import type { ContactRequest } from "@/db/schema";

export async function createContactRequest(data: Omit<ContactRequest, "id" | "ticketId" | "createdAt" | "updatedAt" | "submittedAt" | "reviewedAt" | "completedAt" | "closedAt">): Promise<ContactRequest> {
  const col = await getContactRequestsCollection();
  const now = new Date();
  const ticketId = "ADD-CON-" + String(Math.floor(Math.random() * 900000 + 100000));

  const result = await col.insertOne({
    ...data,
    ticketId,
    status: data.status || "RECEIVED",
    priority: data.priority || "normal",
      assignedTo: data.assignedTo || "",
      internalNotes: data.internalNotes || "",
      reply: data.reply || "",
      resolution: data.resolution || "",
    submittedAt: now,
    reviewedAt: null,
    completedAt: null,
    closedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create contact request");
  return withId(row) as ContactRequest;
}

export async function getContactRequests(limit = 100): Promise<ContactRequest[]> {
  const col = await getContactRequestsCollection();
  const rows = await col.find({}).sort({ submittedAt: -1 }).limit(limit).toArray();
  return rows.map((r) => withId(r) as ContactRequest);
}

export async function getContactRequestByTicketId(ticketId: string): Promise<ContactRequest | null> {
  const col = await getContactRequestsCollection();
  const row = await col.findOne({ ticketId });
  if (!row) return null;
  return withId(row) as ContactRequest;
}

export async function updateContactRequest(ticketId: string, data: Partial<ContactRequest>): Promise<ContactRequest | null> {
  const col = await getContactRequestsCollection();
  const result = await col.findOneAndUpdate(
    { ticketId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as ContactRequest;
}

export async function getContactRequestStats(): Promise<{
  total: number;
  received: number;
  underReview: number;
  completed: number;
  rejected: number;
}> {
  const col = await getContactRequestsCollection();
  const total = await col.countDocuments({});
  const received = await col.countDocuments({ status: "RECEIVED" });
  const underReview = await col.countDocuments({ status: "UNDER_REVIEW" });
  const completed = await col.countDocuments({ status: "COMPLETED" });
  const rejected = await col.countDocuments({ status: "REJECTED" });
  return { total, received, underReview, completed, rejected };
}
