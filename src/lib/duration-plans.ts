import { ObjectId } from "mongodb";
import { getDurationPlansCollection, withId } from "@/db";
import type { DurationPlan } from "@/db/schema";

export async function createDurationPlan(data: Omit<DurationPlan, "id" | "createdAt" | "updatedAt">): Promise<DurationPlan> {
  const col = await getDurationPlansCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create duration plan");
  return withId(row) as DurationPlan;
}

export async function getDurationPlans(): Promise<DurationPlan[]> {
  const col = await getDurationPlansCollection();
  const rows = await col.find({}).sort({ days: 1 }).toArray();
  return rows.map((r) => withId(r) as DurationPlan);
}

export async function getActiveDurationPlans(): Promise<DurationPlan[]> {
  const col = await getDurationPlansCollection();
  const rows = await col.find({ isActive: true }).sort({ days: 1 }).toArray();
  return rows.map((r) => withId(r) as DurationPlan);
}

export async function updateDurationPlan(id: string, data: Partial<DurationPlan>): Promise<DurationPlan | null> {
  const col = await getDurationPlansCollection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as DurationPlan;
}

export async function deleteDurationPlan(id: string): Promise<void> {
  const col = await getDurationPlansCollection();
  await col.deleteOne({ _id: new ObjectId(id) });
}
