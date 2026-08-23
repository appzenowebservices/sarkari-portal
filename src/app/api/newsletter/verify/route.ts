import { NextResponse } from "next/server";
import { getNewsletterSubscribersCollection } from "@/db";

function htmlResponse(html: string, status: number = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email Verification</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;font-size:22px;}
      .error{color:#dc2626;}
      .success{color:#147030;}</style></head>
      <body><div class="card"><h1>Invalid Verification Link</h1>
      <p class="error">The verification token is missing or invalid.</p>
      <p><a href="/" style="color:#f09a00;font-weight:700;">Go to APPZENO Sarkari Portal Home</a></p></div></body></html>`,
      400
    );
  }

  try {
    const col = await getNewsletterSubscribersCollection();
    const sub = await col.findOne({ verificationToken: token });

    if (!sub) {
      return htmlResponse(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email Verification</title>
        <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
        .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
        h1{color:#122546;font-family:'Rajdhani',sans-serif;font-size:22px;}
        .error{color:#dc2626;}</style></head>
        <body><div class="card"><h1>Verification Failed</h1>
        <p class="error">This verification link has expired or is invalid.</p>
        <p><a href="/" style="color:#f09a00;font-weight:700;">Go to APPZENO Sarkari Portal Home</a></p></div></body></html>`,
        404
      );
    }

    await col.updateOne(
      { _id: sub._id },
      {
        $set: {
          isVerified: true,
          status: "active",
          verificationToken: null,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email Verified</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;font-size:22px;}
      .success{color:#147030;}</style></head>
      <body><div class="card"><h1>✓ Email Verified Successfully</h1>
      <p class="success">Thank you! Your email has been verified and you are now subscribed to APPZENO Sarkari Portal newsletter.</p>
      <p>You will receive our latest government jobs, schemes, results and updates directly in your inbox.</p>
      <p><a href="/" style="color:#f09a00;font-weight:700;">Go to APPZENO Sarkari Portal Home</a></p></div></body></html>`
    );
  } catch (error) {
    console.error("Newsletter verify error:", error);
    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;font-size:22px;}
      .error{color:#dc2626;}</style></head>
      <body><div class="card"><h1>Something Went Wrong</h1>
      <p class="error">An error occurred while verifying your email. Please try again later.</p>
      <p><a href="/" style="color:#f09a00;font-weight:700;">Go to APPZENO Sarkari Portal Home</a></p></div></body></html>`,
      500
    );
  }
}
