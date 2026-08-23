import { NextResponse } from "next/server";
import { getActiveCookieCategories, getCookieSettings } from "@/lib/cookies";

export async function GET() {
  try {
    const [settings, categories] = await Promise.all([
      getCookieSettings(),
      getActiveCookieCategories(),
    ]);

    return NextResponse.json({
      settings: settings || {
        bannerEnabled: true,
        bannerTitle: "We use cookies to improve your experience",
        bannerDescription:
          "APPZENO Sarkari Portal uses cookies and similar technologies to provide essential website functionality, remember your preferences, improve website performance, and understand how visitors use our portal.",
        position: "bottom",
        layout: "banner",
        policyVersion: "1.0",
        policyUrl: "/cookie-policy",
        privacyPolicyUrl: "/privacy-policy",
      },
      categories: categories || [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to load cookie settings" }, { status: 500 });
  }
}
