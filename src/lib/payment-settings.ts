import { getPaymentSettingsCollection, withId } from "@/db";
import type { PaymentSettings } from "@/db/schema";

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  const col = await getPaymentSettingsCollection();
  const row = await col.findOne({ id: "default" });
  if (!row) return null;
  return withId(row) as PaymentSettings;
}

export async function upsertPaymentSettings(data: Partial<PaymentSettings>): Promise<PaymentSettings> {
  const col = await getPaymentSettingsCollection();
  const now = new Date();
  const result = await col.findOneAndUpdate(
    { id: "default" },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: "after", upsert: true }
  );
  if (!result) throw new Error("Failed to upsert payment settings");
  return withId(result) as PaymentSettings;
}
