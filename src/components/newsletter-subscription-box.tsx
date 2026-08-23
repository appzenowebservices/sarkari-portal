"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Bi } from "@/components/bi";

export default function NewsletterSubscriptionBox({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("कृपया एक वैध ईमेल पता दर्ज करें।");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message || "Please check your email to verify your subscription.");
        setName("");
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

  if (compact) {
    return (
      <div className="rounded-xl border border-navy-100 bg-surface p-4 shadow-sm">
        <h3 className="font-display text-sm font-bold text-navy-950">
          <Bi hi="APPZENO से अपडेट पाएं" en="Stay Updated with APPZENO" />
        </h3>
        {status === "success" ? (
          <p className="mt-2 text-xs text-leaf-700">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 space-y-2">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-1.5 text-xs font-semibold outline-none focus:border-saffron-500"
              />
            </div>
            {status === "error" && <p className="text-[10px] text-rose-600">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Sending…" : "Subscribe"}
            </button>
          </form>
        )}
        <p className="mt-1.5 text-[10px] text-ink-soft">
          By subscribing, you agree to receive newsletters from APPZENO Sarkari Portal.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-saffron-200 bg-gradient-to-b from-saffron-50 to-paper p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-saffron-500 font-display text-lg font-bold text-navy-950">
          A
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-navy-950">
            <Bi hi="APPZENO से अपडेट पाएं" en="Stay Updated with APPZENO" />
          </h3>
          <p className="text-xs text-ink-soft">
            <Bi
              hi="सरकारी नौकरियों और योजनाओं के अपडेट सीधे ईमेल पर पाएं।"
              en="Get government jobs and schemes updates directly in your inbox."
            />
          </p>
        </div>
      </div>

      {status === "success" ? (
        <div className="mt-4 rounded-lg border border-leaf-200 bg-leaf-50 p-3 text-center">
          <Icon name="check" size={20} className="mx-auto text-leaf-600" />
          <p className="mt-1 text-sm font-bold text-leaf-800">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="rounded-lg border-2 border-navy-100 bg-surface px-3 py-2 text-sm font-semibold outline-none focus:border-saffron-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="rounded-lg border-2 border-navy-100 bg-surface px-3 py-2 text-sm font-semibold outline-none focus:border-saffron-500"
            />
          </div>
          {status === "error" && <p className="text-xs text-rose-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Sending…" : "Subscribe to Newsletter"}
          </button>
        </form>
      )}

      <p className="mt-2 text-[10px] text-ink-soft">
        <Bi
          hi="सदस्यता करके आप APPZENO Sarkari Portal से न्यूज़लेटर स्वीकार करने के लिए सहमत होते हैं।"
          en="By subscribing, you agree to receive newsletters from APPZENO Sarkari Portal."
        />
      </p>
    </div>
  );
}
