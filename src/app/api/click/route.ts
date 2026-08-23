import { NextResponse } from "next/server";
import { getServicesCollection } from "@/db";
import { getServiceClicksCollection } from "@/db";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  let body: { serviceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const serviceId = body.serviceId ?? "";
  if (!ObjectId.isValid(serviceId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const services = await getServicesCollection();
  const clicks = await getServiceClicksCollection();

  const updated = await services.findOneAndUpdate(
    { _id: new ObjectId(serviceId) },
    { $inc: { clickCount: 1 } },
    { returnDocument: "after" }
  );

  if (updated) {
    await clicks.insertOne({
      _id: new ObjectId(),
      serviceId: new ObjectId(serviceId),
      createdAt: new Date(),
    });

    if (updated.clickCount >= 50) {
      await services.updateOne(
        { _id: new ObjectId(serviceId), isNew: true },
        { $set: { isNew: false } }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
