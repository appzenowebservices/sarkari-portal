"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Bi } from "@/components/bi";

export default function NewsletterPreferencesPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("कृपया एक वैध ईमेल पता दर्श करें।");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message || "Please check your email to verify your subscription.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    about: "APPZENO Sarkari Portal भारत की सरकारी सेवाओं की एक निःशुल्क निर्देशिका है।",
    email: "info@addiessarkari.in",
    helpline: "1800-123-4567",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    telegram: "",
    whatsapp: "",
    footerNote: "",
  };

  return (
    <>
      <Header categories={[]} helpline={settings.helpline || ""} />
      <main className="min-h-[calc(100vh-140px)] bg-paper py-12">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <div className="mb-2 flex justify-center">
              <div className="grid size-16 place-items-center rounded-xl bg-navy-950 font-display text-2xl font-bold text-saffron-400">
                APPZENO
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-950 sm:text-3xl">
              <Bi hi="न्यूज़लेटर प्राथमिकता" en="Newsletter Preferences" />
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              <Bi
                hi="अपने ईमेल को अपडेट या री-सब्सक्राइब करें।"
                en="Enter your email to update or re-subscribe to our newsletter."
              />
            </p>
          </div>

          {status === "success" ? (
            <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-6 text-center">
              <div className="mb-3 flex justify-center">
                <Icon name="check" size={32} className="text-leaf-600" />
              </div>
              <h2 className="mb-2 font-display text-xl font-bold text-leaf-800">✓ Success</h2>
              <p className="text-sm text-leaf-800">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-navy-200 bg-surface p-6 shadow-sm">
              <div className="mb-4">
                <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">
                  <Bi hi="ईमेल पता" en="Email Address" />
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                  className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-saffron-500"
                />
              </div>
              {message && status === "error" && (
                <p className="mb-3 text-xs text-rose-600">{message}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Processing…" : <Bi hi="अपडेट और सदस्यता लें" en="Update & Subscribe" />}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="/newsletter/unsubscribe"
              className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:underline"
            >
              <Icon name="x" size={14} />
              <span>अपने ईमेल को हटवाना चाहते हैं?</span>
            </a>
          </div>
        </div>
      </main>
      <Footer settings={settings} categories={[]} popular={[]} />
    </>
  );
}
