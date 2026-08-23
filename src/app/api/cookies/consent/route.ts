import { NextResponse } from "next/server";
import { createCookieConsent, createCookieConsentHistory, getCookieConsent, getCookieSettings, updateCookieConsent } from "@/lib/cookies";
import type { CookieConsent } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      anonymousId: string;
      sessionId: string;
      consentStatus: string;
      preferences: Record<string, boolean>;
      policyVersion: string;
      consentMethod: string;
      ipHash: string;
      userAgent: string;
      deviceType: string;
      browser: string;
      os: string;
    };

    if (!body.anonymousId || !body.sessionId || !body.consentStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let policyVersion = body.policyVersion || "1.0";
    try {
      const settings = await getCookieSettings();
      policyVersion = body.policyVersion || settings?.policyVersion || "1.0";
    } catch {
      policyVersion = body.policyVersion || "1.0";
    }

    let existing: CookieConsent | null = null;
    try {
      existing = await getCookieConsent(body.anonymousId);
    } catch {
      existing = null;
    }

    let consent;

    if (existing && existing.consentStatus !== "WITHDRAWN") {
      const previousPreferences = existing.preferences;
      consent = await updateCookieConsent(existing.id, {
        consentStatus: body.consentStatus as any,
        preferences: body.preferences,
        policyVersion,
        consentUpdatedAt: new Date(),
        withdrawn: false,
      });

      if (consent && previousPreferences !== body.preferences) {
        await createCookieConsentHistory({
          consentId: consent.id,
          userId: null,
          anonymousId: body.anonymousId,
          previousPreferences,
          newPreferences: body.preferences,
          action: body.consentStatus === "ACCEPTED_ALL" ? "ACCEPT_ALL" : body.consentStatus === "REJECTED_OPTIONAL" ? "REJECT_OPTIONAL" : "UPDATE_PREFERENCES",
          policyVersion,
          timestamp: new Date(),
          source: body.consentMethod || "cookie_banner",
        });
      }
    } else {
      consent = await createCookieConsent({
        userId: null,
        anonymousId: body.anonymousId,
        sessionId: body.sessionId,
        consentStatus: body.consentStatus as any,
        preferences: body.preferences,
        policyVersion,
        consentMethod: body.consentMethod || "cookie_banner",
        consentTimestamp: new Date(),
        consentUpdatedAt: new Date(),
        ipHash: body.ipHash || "",
        userAgent: body.userAgent || "",
        deviceType: body.deviceType || "",
        browser: body.browser || "",
        os: body.os || "",
        withdrawn: false,
      });

      await createCookieConsentHistory({
        consentId: consent.id,
        userId: null,
        anonymousId: body.anonymousId,
        previousPreferences: {},
        newPreferences: body.preferences,
        action: body.consentStatus === "ACCEPTED_ALL" ? "ACCEPT_ALL" : body.consentStatus === "REJECTED_OPTIONAL" ? "REJECT_OPTIONAL" : "CUSTOMIZE",
        policyVersion,
        timestamp: new Date(),
        source: body.consentMethod || "cookie_banner",
      });
    }

    return NextResponse.json({ ok: true, consent });
  } catch (error) {
    console.error("Cookie consent error:", error);
    return NextResponse.json({ error: "Failed to save consent" }, { status: 500 });
  }
}
