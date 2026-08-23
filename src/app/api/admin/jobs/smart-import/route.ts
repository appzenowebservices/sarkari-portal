import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection } from "@/db";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

function extractFromText(text: string, title: string, url: string) {
  const lower = text.toLowerCase();
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);

  const organization = lines.find((l) => /organization|department|board|commission|ministry|recruitment|conducted by|by\s+\w+\s+\w+/i.test(l)) || "";
  const totalVacancies = (lines.find((l) => /total\s+(?:vacancies?|posts?|seats?)\s*[:\-]?\s*(\d+)/i.exec(l)?.[1]) || "").trim();
  const qualification = lines.find((l) => /qualification|education|required|eligibility|10th|12th|graduate|degree/i.test(l)) || "";
  const ageMatch = lower.match(/(?:age| आयु)[^.\n]*?(\d{1,2})\s*[-–to]+\s*(\d{1,2})\s*(?:years?|yrs?|वर्ष)?/i);
  const ageLimit = ageMatch ? `${ageMatch[1]}-${ageMatch[2]}` : "";
  const lastDateLine = lines.find((l) => /last\s+date|closing\s+date|apply\s+before|आवेदन\s+अंतिम/i.test(l)) || "";
  const lastDate = lastDateLine.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/)?.[0] || "";

  const applyUrl = url;
  const notificationUrl = url;

  const shortDescription = lines.slice(0, 3).join(" ").slice(0, 300);

  return {
    title: title || lines[0] || "",
    organization,
    totalVacancies: totalVacancies ? Number(totalVacancies) : 0,
    minimumQualification: qualification,
    ageLimit,
    applicationLastDate: lastDate,
    applyUrl,
    notificationUrl,
    shortDescription,
  };
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { url, text, title } = body as { url?: string; text?: string; title?: string };

    if (!url && !text) {
      return NextResponse.json({ error: "url या text ज़रूरी है" }, { status: 400 });
    }

    let sourceText = text || "";
    let sourceTitle = title || "";

    if (url && !text) {
      let sourceHtml = "";
      let fetchSource = "direct";

      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; APPZENOBot/1.0; +https://addies.in)",
            Accept: "text/html,application/xhtml+xml",
          },
          redirect: "follow",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        sourceHtml = await res.text();
        if (!sourceHtml || sourceHtml.length < 500) throw new Error("Empty response");
      } catch {
        fetchSource = "jina";
        try {
          const encoded = encodeURIComponent(url);
          const proxyRes = await fetch(`https://r.jina.ai/http://${encoded}`, {
            redirect: "follow",
          });
          if (!proxyRes.ok) throw new Error(`Proxy HTTP ${proxyRes.status}`);
          const proxyText = await proxyRes.text();
          if (proxyText && proxyText.length > 100) {
            sourceText = proxyText;
            sourceTitle = title || "";
          } else {
            throw new Error("Empty proxy response");
          }
        } catch {
          return NextResponse.json({ error: "URL से डेटा लोड नहीं हो पाया" }, { status: 400 });
        }
      }

      if (fetchSource === "direct" && sourceHtml) {
        const cheerio = await import("cheerio");
        const $ = cheerio.load;
        const $doc = $(sourceHtml);
        $doc("script, style, nav, header, footer, aside").remove();
        sourceText = $doc("body").text() || $doc("main").text() || "";
        sourceTitle = $doc("h1").first().text().trim() || $doc("title").text().trim() || title || "";
      }
    }

    const extracted = extractFromText(sourceText, sourceTitle, url || "");

    const slug = slugify(extracted.title) || `imported-${Date.now()}`;
    const jobs = await getJobsCollection();
    const existing = await jobs.findOne({ slug });
    if (existing) {
      extracted.title = `${extracted.title} ${new Date().getFullYear()}`;
    }

    const seo = {
      seoTitle: `${extracted.title} – Eligibility, Dates & Apply Online | APPZENO Sarkari Portal`,
      metaDescription: extracted.shortDescription.slice(0, 160) || `Check ${extracted.title} details and apply online.`,
      focusKeyword: extracted.title,
      ogTitle: extracted.title,
      ogDescription: extracted.shortDescription.slice(0, 160),
      canonicalUrl: `/job/${slugify(extracted.title) || `job-${Date.now()}`}`,
      robots: "index, follow",
      schemaType: "JobPosting",
    };

    return NextResponse.json({
      ok: true,
      data: {
        ...extracted,
        ...seo,
        template: "government",
        blocks: [],
        confidence: "medium",
      },
    });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
