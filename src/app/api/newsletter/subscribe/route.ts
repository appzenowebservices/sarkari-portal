import { NextResponse } from "next/server";
import { getNewsletterSubscribersCollection } from "@/db";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email: string;
      name?: string;
    };

    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    }

    const col = await getNewsletterSubscribersCollection();

    const existing = await col.findOne({ email });
    if (existing && existing.isVerified) {
      return NextResponse.json({ ok: true, message: "Already subscribed", alreadySubscribed: true });
    }

    const verificationToken = randomBytes(32).toString("hex");

    if (existing) {
      await col.updateOne(
        { email },
        {
          $set: {
            name: name || existing.name,
            status: "pending",
            isVerified: false,
            verificationToken,
            verifiedAt: null,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await col.insertOne({
        email,
        name,
        status: "pending",
        source: "website",
        preferences: { jobs: true, schemes: true, results: true, updates: true },
        isVerified: false,
        verificationToken,
        verifiedAt: null,
        lastEmailAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://addiessarkari.in";
    const verifyUrl = `${portalUrl}/newsletter/verify?token=${verificationToken}`;

    if (process.env.NEWSLETTER_SEND_API) {
      try {
        await fetch(process.env.NEWSLETTER_SEND_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "APPZENO Sarkari Portal — Email Verification",
            html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Verify your email</title></head>
            <body style="font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;">
            <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <div style="text-align:center;margin-bottom:20px;"><span style="font-size:28px;">APPZENO <span style="color:#f09a00;">Sarkari</span> Portal</span></div>
            <h2 style="color:#122546;font-family:'Rajdhani',sans-serif;margin-bottom:15px;">Verify Your Email Address</h2>
            <p style="font-size:15px;line-height:1.6;color:#4c5872;">नमस्ते ${name || ""}!</p>
            <p style="font-size:15px;line-height:1.6;color:#4c5872;">कृपया नीचे दिए गए बटन पर क्लिक करके अपना ईमेल सत्यापित करें।</p>
            <div style="text-align:center;margin:25px 0;">
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 30px;background:#122546;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">Verify Email Now</a>
            </div>
            <p style="font-size:13px;color:#93afd6;">या आप इस लिंक को कॉपी करके अपने ब्राउज़र में पेस्ट कर सकते हैं:</p>
            <p style="font-size:12px;word-break:break-all;color:#4c5872;">${verifyUrl}</p>
            <hr style="border:none;border-top:1px solid #dfe8f5;margin:25px 0;">
            <p style="font-size:12px;color:#93afd6;">© ${new Date().getFullYear()} APPZENO Sarkari Portal. All rights reserved.</p>
            </div></body></html>`,
            text: `APPZENO Sarkari Portal - Verify Your Email\n\nHi ${name || ""},\n\nPlease click the link below to verify your email address:\n${verifyUrl}\n\nThis link will expire in 48 hours.\n\n© ${new Date().getFullYear()} APPZENO Sarkari Portal`,
          }),
        });
      } catch (emailErr) {
        console.error("Verification email failed:", emailErr);
      }
    } else {
      console.log(`[Newsletter] Verification email for ${email}: ${verifyUrl}`);
    }

    return NextResponse.json({ ok: true, message: "Please check your email to verify your subscription" });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    const message = error instanceof Error ? error.message : "Subscription failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
