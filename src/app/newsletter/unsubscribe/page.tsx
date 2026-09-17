"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Bi } from "@/components/bi";
import { api } from "@/trpc/react";

const defaultSettings = {
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

export default function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"input" | "confirming" | "confirmed" | "error">("input");
  const [message, setMessage] = useState("");
  const unsubscribe = api.newsletter.unsubscribe.useMutation();

  useEffect(() => {
    void fetchSearchParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSearchParams() {
    const params = await searchParams;
    setToken(params.token || null);
    setEmail(params.email || "");

    if (params.email) {
      setStatus("confirming");
      setLoading(true);
      try {
        await unsubscribe.mutateAsync({ email: params.email });
        setStatus("confirmed");
        setMessage("आपने सफलतापूर्वक निष्क्रिय कर दिया है। आपका ईमेल निकाल दिया गया है।");
      } catch {
        setStatus("error");
        setMessage("अमान्य या खत्म हुआ टोकन। कृपया अपना ईमेल दर्ज करें।");
      } finally {
        setLoading(false);
      }
    } else if (params.token) {
      setStatus("error");
      setLoading(false);
      setMessage("अमान्य या खत्म हुआ टोकन। कृपया अपना ईमेल दर्ज करें।");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("कृपया एक वैध ईमेल पता दर्ज करें।");
      setStatus("error");
      return;
    }
    setLoading(true);
    setStatus("confirming");
    try {
      await unsubscribe.mutateAsync({ email: email.trim() });
      setStatus("confirmed");
      setMessage("आपने सफलतापूर्वक निष्क्रिय कर दिया है। आपका ईमेल निकाल दिया गया है।");
    } catch {
      setStatus("error");
      setMessage("हमें आपका ईमेल नहीं मिल सका या आप पहले से ही निष्क्रिय हैं।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header categories={[]} helpline={defaultSettings.helpline} />
      <main className="min-h-[calc(100vh-140px)] bg-paper py-12">
        <div className="mx-auto max-w-md px-4">
          <div className="mb-6 text-center">
            <div className="mb-2 flex justify-center">
              <div className="grid size-16 place-items-center rounded-xl bg-navy-950 font-display text-2xl font-bold text-saffron-400">
                APPZENO
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-950">
              <Bi hi="न्यूज़लेटर से निष्क्रिय करें" en="Unsubscribe from Newsletter" />
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              <Bi
                hi="आपको हमारे न्यूज़लेटर से सम्पूर्ण ईमेल निकाल दिए जाएंगे।"
                en="Your email will be permanently removed from our mailing list."
              />
            </p>
          </div>

          {status === "confirmed" && (
            <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-6 text-center">
              <div className="mb-3 flex justify-center">
                <Icon name="check" size={32} className="text-leaf-600" />
              </div>
              <h2 className="mb-2 font-display text-xl font-bold text-leaf-800">✓ Unsubscribed</h2>
              <p className="text-sm text-leaf-800">{message}</p>
              <div className="mt-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800 cursor-pointer"
                >
                  <Bi hi="होम पर वापस" en="Back to Home" />
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
              <div className="mb-3 flex justify-center">
                <Icon name="alert" size={32} className="text-rose-600" />
              </div>
              <h2 className="mb-2 font-display text-xl font-bold text-rose-800">⚠ Error</h2>
              <p className="text-sm text-rose-800">{message}</p>
            </div>
          )}

          {(status === "input" || status === "error") && (
            <form onSubmit={handleSubmit} className="rounded-xl border border-navy-200 bg-surface p-6 shadow-sm">
              <div className="mb-3">
                <label className="block text-sm font-extrabold text-navy-900">
                  <Bi hi="ईमेल पता" en="Email Address" />
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="mt-1 w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold outline-none focus:border-saffron-500"
                />
              </div>
              {message && status === "error" && (
                <p className="mb-3 text-xs text-rose-600">{message}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Processing…" : "Unsubscribe & Remove My Email"}
              </button>
            </form>
          )}

          {status === "confirming" && (
            <div className="rounded-xl border border-navy-200 bg-surface p-6 text-center shadow-sm">
              <span className="inline-block size-6 animate-spin rounded-full border-2 border-navy-300 border-t-navy-800" />
              <p className="mt-2 text-sm text-ink-soft">Processing your request…</p>
            </div>
          )}
        </div>
      </main>
      <Footer
        settings={defaultSettings}
        categories={[]}
        popular={[]}
      />
    </>
  );
}
