import { ObjectId } from "mongodb";
import { getAdTypesCollection, withId } from "@/db";
import type { AdType } from "@/db/schema";

export async function createAdType(data: Omit<AdType, "id" | "createdAt" | "updatedAt">): Promise<AdType> {
  const col = await getAdTypesCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create ad type");
  return withId(row) as AdType;
}

export async function getAdTypes(): Promise<AdType[]> {
  const col = await getAdTypesCollection();
  const rows = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return rows.map((r) => withId(r) as AdType);
}

export async function getActiveAdTypes(): Promise<AdType[]> {
  const col = await getAdTypesCollection();
  const rows = await col.find({ isActive: true }).sort({ sortOrder: 1 }).toArray();
  return rows.map((r) => withId(r) as AdType);
}

export async function updateAdType(id: string, data: Partial<AdType>): Promise<AdType | null> {
  const col = await getAdTypesCollection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as AdType;
}

export async function deleteAdType(id: string): Promise<void> {
  const col = await getAdTypesCollection();
  await col.deleteOne({ _id: new ObjectId(id) });
}
