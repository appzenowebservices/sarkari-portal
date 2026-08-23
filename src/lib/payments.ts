import { ObjectId } from "mongodb";
import { getPaymentsCollection, withId } from "@/db";
import type { Payment } from "@/db/schema";

export async function createPayment(data: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
  const col = await getPaymentsCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create payment");
  return withId(row) as Payment;
}

export async function getPayments(limit = 100): Promise<Payment[]> {
  const col = await getPaymentsCollection();
  const rows = await col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return rows.map((r) => withId(r) as Payment);
}

export async function getPaymentByRequestId(requestId: string): Promise<Payment | null> {
  const col = await getPaymentsCollection();
  const row = await col.findOne({ requestId });
  if (!row) return null;
  return withId(row) as Payment;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const col = await getPaymentsCollection();
  const row = await col.findOne({ _id: new ObjectId(id) });
  if (!row) return null;
  return withId(row) as Payment;
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
  const col = await getPaymentsCollection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as Payment;
}
