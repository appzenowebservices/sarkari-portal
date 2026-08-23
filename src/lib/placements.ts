import { ObjectId } from "mongodb";
import { getPlacementsCollection, withId } from "@/db";
import type { Placement } from "@/db/schema";

export async function createPlacement(data: Omit<Placement, "id" | "createdAt" | "updatedAt">): Promise<Placement> {
  const col = await getPlacementsCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  const row = await col.findOne({ _id: result.insertedId });
  if (!row) throw new Error("Failed to create placement");
  return withId(row) as Placement;
}

export async function getPlacements(): Promise<Placement[]> {
  const col = await getPlacementsCollection();
  const rows = await col.find({}).sort({ priority: 1 }).toArray();
  return rows.map((r) => withId(r) as Placement);
}

export async function getActivePlacements(): Promise<Placement[]> {
  const col = await getPlacementsCollection();
  const rows = await col.find({ isActive: true }).sort({ priority: 1 }).toArray();
  return rows.map((r) => withId(r) as Placement);
}

export async function updatePlacement(id: string, data: Partial<Placement>): Promise<Placement | null> {
  const col = await getPlacementsCollection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return withId(result) as Placement;
}

export async function deletePlacement(id: string): Promise<void> {
  const col = await getPlacementsCollection();
  await col.deleteOne({ _id: new ObjectId(id) });
}
