import { NextResponse } from "next/server";
import { getNewsletterSubscribersCollection } from "@/db";
import { ObjectId } from "mongodb";

function htmlResponse(html: string, status: number = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const email = url.searchParams.get("email") || "";

  let resolvedEmail = email.trim().toLowerCase();

  if (!resolvedEmail && token) {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const match = decoded.match(/^([a-f0-9]{24})/);
      if (match) {
        resolvedEmail = match[1];
      }
    } catch {
      // ignore
    }
  }

  if (!resolvedEmail) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;}
      input{padding:10px 14px;border:2px solid #dfe8f5;border-radius:8px;font-size:15px;width:100%;}
      .btn{display:inline-block;padding:12px 28px;background:#122546;color:#fff;border-radius:6px;font-weight:700;text-decoration:none;cursor:pointer;}
      .btn-rose{background:#dc2626;}</style></head>
      <body><div class="card">
      <h1>Unsubscribe from Newsletter</h1>
      <p>Enter your email address below to unsubscribe from APPZENO Sarkari Portal newsletters. Your email will be permanently removed from our mailing list.</p>
      <form method="POST" action="/api/newsletter/unsubscribe">
        <div style="margin:15px 0;">
          <input type="email" name="email" placeholder="your@email.com" required style="padding:10px 14px;border:2px solid #dfe8f5;border-radius:8px;font-size:15px;width:100%;">
        </div>
        <button type="submit" class="btn btn-rose">Unsubscribe Now</button>
      </form>
      <p style="margin-top:20px;font-size:13px;color:#93afd6;"><a href="/" style="color:#f09a00;">Back to APPZENO Sarkari Portal</a></p>
      </div></body></html>`,
      200
    );
  }

  return handleUnsubscribe(resolvedEmail);
}

export async function POST(req: Request) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const email = params.get("email")?.trim().toLowerCase() || "";
  return handleUnsubscribe(email);
}

async function handleUnsubscribe(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;}
      .error{color:#dc2626;}</style></head>
      <body><div class="card"><h1>Invalid Email</h1>
      <p class="error">Please provide a valid email address.</p></div></body></html>`,
      400
    );
  }

  try {
    const col = await getNewsletterSubscribersCollection();
    const result = await col.deleteOne({ email });

    if (result.deletedCount === 0) {
      return htmlResponse(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not Found</title>
        <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
        .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
        h1{color:#122546;font-family:'Rajdhani',sans-serif;}</style></head>
        <body><div class="card"><h1>Not Found</h1>
        <p>We could not find a subscriber with this email address. It may have already been removed.</p>
        <p><a href="/" style="color:#f09a00;font-weight:700;">Back to Home</a></p></div></body></html>`,
        404
      );
    }

    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;}
      .success{color:#147030;}</style></head>
      <body><div class="card"><h1>✓ Unsubscribed Successfully</h1>
      <p class="success">Your email has been permanently removed from our mailing list. You will no longer receive newsletters from APPZENO Sarkari Portal.</p>
      <p><a href="/" style="color:#f09a00;font-weight:700;">Back to APPZENO Sarkari Portal</a></p></div></body></html>`,
      200
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return htmlResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error</title>
      <style>body{font-family:'Mukta',Arial,sans-serif;background:#f2f4f9;padding:20px;}
      .card{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
      h1{color:#122546;font-family:'Rajdhani',sans-serif;}
      .error{color:#dc2626;}</style></head>
      <body><div class="card"><h1>Something Went Wrong</h1>
      <p class="error">An error occurred while processing your request. Please try again later.</p></div></body></html>`,
      500
    );
  }
}
