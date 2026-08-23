import { getNewsletterCampaignsCollection, getNewsletterSubscribersCollection } from "@/db";
import { getNewsletterSettings } from "@/lib/newsletter-template";
import { ObjectId } from "mongodb";

export interface CronResult {
  sent: number;
  campaignsProcessed: number;
  details: Array<{
    campaignId: string;
    title: string;
    sentCount: number;
    failedCount: number;
    total: number;
  }>;
}

export async function runNewsletterCron(): Promise<CronResult> {
  console.log(`[Newsletter Cron] ${new Date().toISOString()} — Starting newsletter send check`);

  const campaignsCol = await getNewsletterCampaignsCollection();
  const subscribersCol = await getNewsletterSubscribersCollection();
  const settings = getNewsletterSettings();
  const portalUrl = settings.websiteUrl || "https://addiessarkari.in";

  const now = new Date();

  const dueCampaigns = await campaignsCol
    .find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    })
    .toArray();

  if (dueCampaigns.length === 0) {
    console.log("[Newsletter Cron] No campaigns due. Exiting.");
    return { sent: 0, campaignsProcessed: 0, details: [] };
  }

  console.log(`[Newsletter Cron] Found ${dueCampaigns.length} scheduled campaigns to send`);

  let totalSent = 0;
  const details: CronResult["details"] = [];
  const sendApi = process.env.NEWSLETTER_SEND_API;
  const { renderNewsletterHtml, renderNewsletterText } = await import("@/lib/newsletter-template");

  for (const campaign of dueCampaigns) {
    if (campaign.status !== "scheduled") continue;

    console.log(`[Newsletter Cron] Sending campaign: "${campaign.title}" (id: ${campaign._id})`);

    await campaignsCol.updateOne(
      { _id: campaign._id },
      { $set: { status: "sending", updatedAt: new Date() } }
    );

    const filter = campaign.audience === "all"
      ? { isVerified: true }
      : { status: "active", isVerified: true };

    const subscribers = await subscribersCol
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const activeSubs = subscribers.filter((s) => s.status === "active");
    console.log(`[Newsletter Cron] ${activeSubs.length} active subscribers for this campaign`);

    let sentCount = 0;
    let failedCount = 0;
    const batchSize = 50;
    const sendTime = new Date();

    if (!sendApi) {
      console.log("[Newsletter Cron] NEWSLETTER_SEND_API not configured — dry run mode");
      sentCount = activeSubs.length;
    } else {
      for (let i = 0; i < activeSubs.length; i += batchSize) {
        const batch = activeSubs.slice(i, i + batchSize);
        const promises = batch.map(async (sub) => {
          try {
            const unsubscribeUrl = `${portalUrl}/newsletter/unsubscribe?token=${Buffer.from(sub._id.toString()).toString("hex")}`;
            const html = renderNewsletterHtml(
              {
                subject: campaign.subject,
                contentBlocks: campaign.contentBlocks || [],
                senderName: campaign.senderName,
                senderEmail: campaign.senderEmail,
              },
              { email: sub.email, name: sub.name },
              unsubscribeUrl,
              settings
            );
            const text = renderNewsletterText(
              {
                subject: campaign.subject,
                contentBlocks: campaign.contentBlocks || [],
              },
              { email: sub.email, name: sub.name },
              unsubscribeUrl,
              settings
            );

            const res = await fetch(sendApi, {
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

            if (res.ok) {
              await subscribersCol.updateOne(
                { _id: sub._id },
                { $set: { lastEmailAt: sendTime, updatedAt: sendTime } }
              );
              return true;
            }
            return false;
          } catch (err) {
            console.error(`[Newsletter Cron] Failed to send to ${sub.email}:`, err);
            return false;
          }
        });

        const results = await Promise.all(promises);
        for (const ok of results) {
          if (ok) sentCount++;
          else failedCount++;
        }
      }
    }

    await campaignsCol.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: "sent",
          sentAt: sendTime,
          sentCount,
          updatedAt: new Date(),
        },
        $inc: { deliveredCount: sentCount },
      }
    );

    console.log(`[Newsletter Cron] Campaign "${campaign.title}" sent: ${sentCount} ok, ${failedCount} failed`);
    totalSent += sentCount;
    details.push({
      campaignId: campaign._id.toString(),
      title: campaign.title,
      sentCount,
      failedCount,
      total: activeSubs.length,
    });
  }

  console.log(`[Newsletter Cron] Done. Total sent: ${totalSent} across ${dueCampaigns.length} campaigns`);
  return { sent: totalSent, campaignsProcessed: dueCampaigns.length, details };
}
