import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getNewsletterCampaignsCollection, getNewsletterSubscribersCollection, getNewsletterSendLogsCollection } from "@/db";
import { ObjectId } from "mongodb";
import { renderNewsletterHtml, renderNewsletterText, getNewsletterSettings } from "@/lib/newsletter-template";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const campaignsCol = await getNewsletterCampaignsCollection();
    const campaign = await campaignsCol.findOne({ _id: new ObjectId(id) });
    if (!campaign) {
      return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "scheduled" && campaign.status !== "draft") {
      return NextResponse.json({ ok: false, error: `Cannot send campaign with status ${campaign.status}` }, { status: 400 });
    }

    const subscribersCol = await getNewsletterSubscribersCollection();
    const filter = campaign.audience === "all" ? { isVerified: true } : { status: "active", isVerified: true };
    const subscribers = await subscribersCol
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const activeSubs = subscribers.filter((s) => s.status === "active");
    const settings = getNewsletterSettings();
    const portalUrl = settings.websiteUrl || "https://addiessarkari.in";

    let sentCount = 0;
    let failedCount = 0;
    const now = new Date();

    const sendApi = process.env.NEWSLETTER_SEND_API;

    if (!sendApi) {
      console.log(`[Newsletter Send] NEWSLETTER_SEND_API not configured. Would send to ${activeSubs.length} subscribers.`);
      sentCount = activeSubs.length;
    } else {
      const batchSize = 50;
      for (let i = 0; i < activeSubs.length; i += batchSize) {
        const batch = activeSubs.slice(i, i + batchSize);
        const promises = batch.map(async (sub) => {
          try {
            const unsubscribeUrl = `${portalUrl}/newsletter/unsubscribe?token=${Buffer.from(sub._id.toString()).toString("hex")}`;
            const html = renderNewsletterHtml(campaign, { email: sub.email, name: sub.name }, unsubscribeUrl, settings);
            const text = renderNewsletterText(campaign, { email: sub.email, name: sub.name }, unsubscribeUrl, settings);

            const emailRes = await fetch(sendApi, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                from: `"${campaign.senderName || settings.senderName}" <${campaign.senderEmail || settings.senderEmail}>`,
                to: sub.email,
                subject: campaign.subject,
                html,
                text,
                tags: ["newsletter"],
              }),
            });

            if (emailRes && emailRes.ok) {
              await subscribersCol.updateOne(
                { _id: sub._id },
                { $set: { lastEmailAt: now, updatedAt: now } }
              );
              return { ok: true, subId: sub._id.toString(), email: sub.email };
            } else {
              const errText = emailRes ? await emailRes.text() : "No response";
              return { ok: false, subId: sub._id.toString(), email: sub.email, error: errText };
            }
          } catch (err: any) {
            return { ok: false, subId: sub._id.toString(), email: sub.email, error: err.message };
          }
        });

        const results = await Promise.all(promises);
        for (const r of results) {
          if (r.ok) sentCount++;
          else failedCount++;
        }
      }
    }

    await campaignsCol.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "sent",
          sentAt: now,
          sentCount,
        },
        $inc: { deliveredCount: sentCount },
      }
    );

    return NextResponse.json({
      ok: true,
      sent: sentCount,
      failed: failedCount,
      total: activeSubs.length,
    });
  } catch (error) {
    console.error("Newsletter send error:", error);
    const message = error instanceof Error ? error.message : "Send failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
