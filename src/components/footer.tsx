"use client";

import Link from "next/link";
import { Bi } from "@/components/bi";
import { Icon, LogoMark } from "@/components/icons";
import type { CategoryWithCount, ServiceWithCategory } from "@/lib/data";
import { useState } from "react";
import { api } from "@/trpc/react";

export function Footer({
  settings,
  categories,
  popular,
}: {
  settings: Record<string, string>;
  categories: CategoryWithCount[];
  popular: ServiceWithCategory[];
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const subscribe = api.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      setName("");
      setEmail("");
    },
    onError: (err) => {
      setError(err.message || "Subscription failed");
    },
  });
  const subscribing = subscribe.isPending;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    subscribe.mutate({ email, name });
  };

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 bg-navy-950 text-white">
      <div className="tricolor-strip h-[3px] w-full" aria-hidden />
      <div className="bg-grid-light">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={44} />
              <div className="leading-tight">
                <p className="font-display text-xl font-bold">
                  APPZENO <span className="text-saffron-400">Sarkari</span> Portal
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                  <Bi hi="डिजिटल इंडिया • आत्मनिर्भर भारत" en="Digital India • Self-reliant India" />
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              <Bi hi={settings.about} en="APPZENO Sarkari Portal is a free directory of Indian government services — Aadhaar, PAN, Voter ID, schemes, bills, licenses and loans, all in one place." />
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a
                href={`tel:${settings.helpline.replace(/[^0-9]/g, "")}`}
                className="flex items-center gap-2.5 text-white/80 transition-colors hover:text-saffron-300"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-white/10">
                  <Icon name="phone" size={15} />
                </span>
                <span className="tnum font-semibold">{settings.helpline}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2.5 text-white/80 transition-colors hover:text-saffron-300"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-white/10">
                  <Icon name="mail" size={15} />
                </span>
                {settings.email}
              </a>
            </div>
            {Object.entries({ facebook: settings.facebook, twitter: settings.twitter, instagram: settings.instagram, youtube: settings.youtube, linkedin: settings.linkedin, telegram: settings.telegram, whatsapp: settings.whatsapp }).filter(([, v]) => v && v.trim()).length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {Object.entries({ facebook: settings.facebook, twitter: settings.twitter, instagram: settings.instagram, youtube: settings.youtube, linkedin: settings.linkedin, telegram: settings.telegram, whatsapp: settings.whatsapp }).map(([key, url]) => {
                  if (!url || !url.trim()) return null;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-saffron-500 hover:text-white" aria-label={key}>
                      <Icon name={key} size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-saffron-400">
              <Bi hi="श्रेणियाँ" en="Categories" />
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.slice(0, 10).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="group inline-flex items-center gap-2 text-white/75 transition-colors hover:text-white"
                  >
                    <Icon
                      name="arrowRight"
                      size={13}
                      className="text-saffron-500 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                    <Bi hi={c.titleHi} en={c.titleEn} />
                  </Link>
                </li>
              ))}
              {categories.length > 10 && (
                <li>
                  <Link
                    href="/category"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-saffron-400 transition-colors hover:text-saffron-300"
                  >
                    <Bi hi="सभी श्रेणियां देखें" en="Browse all Categories" />
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Popular services */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-saffron-400">
              <Bi hi="लोकप्रिय सेवाएं" en="Popular Services" />
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {popular.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-white/75 transition-colors hover:text-white"
                  >
                    <Icon
                      name="external"
                      size={12}
                      className="shrink-0 text-leaf-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                    <Bi hi={s.titleHi} en={s.titleEn} />
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/search?q="
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-saffron-400 transition-colors hover:text-saffron-300"
            >
              <Bi hi="सभी सेवाएं खोजें" en="Browse all services" />
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-saffron-400">
              <Bi hi="त्वरित लिंक" en="Quick Links" />
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
               {[
                 { href: "/terms-conditions", label: "Terms Conditions", hi: "नियम और शर्तें" },
                 { href: "/contact", label: "Contact Us", hi: "संपर्क करें" },
                 { href: "/privacy-policy", label: "Privacy Policy", hi: "गोपनीयता नीति" },
                 { href: "/cookie-policy", label: "Cookie Policy", hi: "कुकी नीति" },
                 { href: "/cookie-preferences", label: "Cookie Settings", hi: "कुकी सेटिंग्स" },
                 { href: "/help", label: "Help & Support", hi: "सहायता और समर्थन" },
                 { href: "/privacy-request", label: "Privacy Request", hi: "गोपनीयता अनुरोध" },
                 { href: "/advertise", label: "Advertise Here", hi: "यहाँ विज्ञापन दें" },
                 { href: "/advertise/status", label: "Advertisement Status", hi: "विज्ञापन स्थिति" },
               ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex items-center gap-2 text-white/75 transition-colors hover:text-white">
                    <Icon name="arrowRight" size={13} className="text-saffron-500" />
                    <Bi hi={link.hi} en={link.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-saffron-400">
              <Bi hi="न्यूज़लेटर" en="Newsletter" />
            </h3>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mt-1 text-xs text-white/70">
                <Bi hi="नई सेवाओं के अपडेट पाएं" en="Get updates on new services" />
              </p>
            {subscribed ? (
                <p className="mt-3 text-sm font-bold text-leaf-400">
                  <Bi hi="सफलता! अब आप सदस्य हैं" en="Success! You are now subscribed" />
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/50 outline-none focus:border-saffron-500"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/50 outline-none focus:border-saffron-500"
                  />
                  {error && <p className="text-xs text-rose-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="w-full rounded-lg bg-saffron-500 px-3 py-2 text-sm font-extrabold text-navy-950 shadow-sm transition-colors hover:bg-saffron-400 disabled:opacity-60 cursor-pointer"
                  >
                    {subscribing ? "..." : <Bi hi="सदस्यता लें" en="Subscribe" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/55 sm:px-6 md:flex-row">
            <p className="tnum">
              © {year} APPZENO Sarkari Portal. All Rights Reserved. | An Independent Government Information & Services Platform.
            </p>
            <p className="max-w-xl text-center leading-relaxed md:text-right">
              <Bi hi={settings.footerNote} en="A private informational directory. All links lead to official government websites." />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
