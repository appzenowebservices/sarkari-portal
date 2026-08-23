"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { CookiePreferencesModal } from "./cookie-preferences-modal";

const CONSENT_KEY = "addies_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [settings, setSettings] = useState<{
    bannerEnabled: boolean;
    bannerTitle: string;
    bannerDescription: string;
    position: string;
    layout: string;
    policyVersion: string;
    policyUrl: string;
    privacyPolicyUrl: string;
  } | null>(null);
  const [categories, setCategories] = useState<Array<{ code: string; name: string; required: boolean; defaultEnabled: boolean }>>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/cookies/settings");
        if (!res.ok) return;
        const data = (await res.json()) as {
          settings?: typeof settings;
          categories?: Array<{ code: string; name: string; required: boolean; defaultEnabled: boolean }>;
        };
        if (cancelled) return;
        if (data.settings?.bannerEnabled !== false) {
          setSettings(data.settings || null);
          setCategories(data.categories || []);
          const hasConsent = document.cookie.includes(`${CONSENT_KEY}=`);
          if (!hasConsent) setVisible(true);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const saveConsent = async (preferences: Record<string, boolean>, status: string) => {
    try {
      await fetch("/api/cookies/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: getAnonymousId(),
          sessionId: getSessionId(),
          consentStatus: status,
          preferences,
          policyVersion: settings?.policyVersion || "1.0",
          consentMethod: "cookie_banner",
          ipHash: "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          deviceType: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
        }),
      });
    } catch {
      // ignore
    }
    document.cookie = `${CONSENT_KEY}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible || !settings) return null;

  const position = settings.position === "top" ? "top" : "bottom";

  return (
    <>
      <div
        className={`fixed inset-x-0 z-[55] ${position === "top" ? "top-0" : "bottom-0"} bg-surface/95 backdrop-blur-sm border-t border-navy-100 shadow-2xl`}
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-navy-950">{settings.bannerTitle}</h3>
              <p className="mt-1 text-sm text-ink-soft">{settings.bannerDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer"
              >
                Manage Cookie Preferences
              </button>
              <button
                type="button"
                onClick={() => saveConsent(
                  Object.fromEntries(categories.map((c) => [c.code, c.required ? true : false])),
                  "REJECTED_OPTIONAL"
                )}
                className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-navy-50 cursor-pointer"
              >
                Reject Optional Cookies
              </button>
              <button
                type="button"
                onClick={() => saveConsent(
                  Object.fromEntries(categories.map((c) => [c.code, true])),
                  "ACCEPTED_ALL"
                )}
                className="rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 cursor-pointer"
              >
                Accept All Cookies
              </button>
            </div>
          </div>
          <div className="mt-3 text-xs text-ink-soft">
            By selecting &ldquo;Accept All Cookies&rdquo;, you consent to the use of optional cookies as described in our{" "}
            <a href={settings.policyUrl || "/cookie-policy"} className="font-bold text-saffron-600 underline">Cookie Policy</a>.
          </div>
        </div>
      </div>
      {showPreferences && (
        <CookiePreferencesModal
          categories={categories}
          policyUrl={settings.policyUrl || "/cookie-policy"}
          privacyPolicyUrl={settings.privacyPolicyUrl || "/privacy-policy"}
          onClose={() => setShowPreferences(false)}
          onSave={saveConsent}
        />
      )}
    </>
  );
}

function getAnonymousId(): string {
  if (typeof window === "undefined") return "anon_unknown";
  let id = localStorage.getItem("addies_anon_id");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("addies_anon_id", id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "session_unknown";
  let id = sessionStorage.getItem("addies_session_id");
  if (!id) {
    id = "ses_" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("addies_session_id", id);
  }
  return id;
}

function getDeviceType(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "unknown";
}

function getOS(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "unknown";
}
