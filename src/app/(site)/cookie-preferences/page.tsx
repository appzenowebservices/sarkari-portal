"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import Link from "next/link";

interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  required: boolean;
  defaultEnabled: boolean;
}

export default function CookiePreferencesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/cookies/settings");
        if (!res.ok) return;
        const data = (await res.json()) as { categories?: Category[] };
        if (cancelled) return;
        if (data.categories) {
          setCategories(data.categories);
          const initial: Record<string, boolean> = {};
          for (const c of data.categories) {
            initial[c.code] = c.defaultEnabled;
          }
          setPrefs(initial);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const allEnabled = categories.every((c) => prefs[c.code]);
      const anyOptionalEnabled = categories.some((c) => !c.required && prefs[c.code]);
      const status = allEnabled ? "ACCEPTED_ALL" : anyOptionalEnabled ? "CUSTOMIZED" : "REJECTED_OPTIONAL";

      await fetch("/api/cookies/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: getAnonymousId(),
          sessionId: getSessionId(),
          consentStatus: status,
          preferences: prefs,
          policyVersion: "1.0",
          consentMethod: "cookie_preferences_page",
          ipHash: "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          deviceType: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
        }),
      });
      document.cookie = "addies_cookie_consent=1; path=/; max-age=" + 60 * 60 * 24 * 365 + "; SameSite=Lax";
      setMessage("Preferences saved successfully");
    } catch {
      setMessage("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">Cookie Preferences</h1>
      <p className="mt-2 text-sm text-ink-soft">Manage your cookie preferences below. Strictly necessary cookies are always enabled as they are essential for the website to function properly.</p>

      <div className="mt-8 space-y-4">
        {categories.map((cat) => (
          <div key={cat.code} className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 bg-surface p-5">
            <div className="flex-1">
              <p className="text-sm font-extrabold text-navy-900">{cat.name}</p>
              <p className="mt-1 text-xs text-ink-soft">{cat.description}</p>
              {cat.required && (
                <span className="mt-2 inline-block rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-extrabold text-navy-700">
                  Always Active
                </span>
              )}
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={prefs[cat.code] || false}
                disabled={cat.required}
                onChange={(e) => setPrefs({ ...prefs, [cat.code]: e.target.checked })}
                className="h-5 w-9 appearance-none rounded-full bg-navy-200 transition-colors duration-200 checked:bg-leaf-500 disabled:opacity-50"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
                <span className={`size-3.5 rounded-full bg-white shadow transition-transform duration-200 ${prefs[cat.code] ? "translate-x-4" : "translate-x-0"}`} />
              </span>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-leaf-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        <Link href="/cookie-policy" className="rounded-xl border border-navy-200 px-6 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50">Cookie Policy</Link>
      </div>

      {message && <p className="mt-4 text-sm font-bold text-leaf-700">{message}</p>}
    </div>
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
