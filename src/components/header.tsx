"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/bi";
import { colorOf, Icon, LogoMark } from "@/components/icons";
import { InstallButton } from "@/components/pwa";
import type { CategoryWithCount } from "@/lib/data";

type Suggestion = {
  id: string;
  titleHi: string;
  titleEn: string;
  url: string;
  categories: Array<{ titleHi: string; titleEn: string; color: string; icon: string }>;
};

function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState<"hi" | "en">("hi");

  useEffect(() => {
    const current = document.documentElement.dataset.lang === "en" ? "en" : "hi";
    setLang(current);
  }, []);

  const switchTo = (l: "hi" | "en") => {
    document.documentElement.dataset.lang = l;
    try {
      localStorage.setItem("addies-lang", l);
    } catch {
      /* private mode */
    }
    setLang(l);
  };

  const base = compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <div
      className="inline-flex items-center rounded-full bg-white/10 p-0.5 ring-1 ring-white/15"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("hi")}
        className={`rounded-full font-bold transition-colors cursor-pointer ${base} ${
          lang === "hi" ? "bg-saffron-500 text-navy-950" : "text-white/80 hover:text-white"
        }`}
      >
        हिंदी
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`rounded-full font-bold uppercase tracking-wide transition-colors cursor-pointer ${base} ${
          lang === "en" ? "bg-saffron-500 text-navy-950" : "text-white/80 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLang(document.documentElement.dataset.lang === "en" ? "en" : "hi");
  }, []);

  useEffect(() => {
    const onDoc = (e: globalThis.MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggest = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=6`);
        if (res.ok) {
          const data = (await res.json()) as { results: Suggestion[] };
          setItems(data.results);
          setOpen(true);
        }
      } catch {
        /* offline */
      }
    }, 180);
  };

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const openService = (s: Suggestion) => {
    try {
      navigator.sendBeacon?.(
        "/api/click",
        new Blob([JSON.stringify({ serviceId: s.id })], { type: "application/json" })
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
    window.open(s.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={go} role="search">
        <div className="flex items-center overflow-hidden rounded-xl border-2 border-navy-200 bg-surface shadow-sm transition-all duration-200 focus-within:border-saffron-500 focus-within:shadow-md focus-within:shadow-saffron-500/10">
          <span className="pl-3.5 text-navy-400">
            <Icon name="search" size={18} />
          </span>
          <input
            value={q}
            onChange={(e) => suggest(e.target.value)}
            onFocus={() => items.length && setOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            autoFocus={autoFocus}
            placeholder={
              lang === "en"
                ? "Search Aadhaar, PAN, Voter ID, PM Kisan…"
                : "खोजें — आधार, पैन, वोटर ID, पीएम किसान…"
            }
            className="w-full bg-transparent px-3 py-2.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-soft/70"
            aria-label="Search services"
          />
          <button
            type="submit"
            className="m-1 rounded-lg bg-navy-800 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-navy-700 cursor-pointer"
          >
            <Bi hi="खोजें" en="Search" />
          </button>
        </div>
      </form>

      {open && items.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-navy-100 bg-surface shadow-xl shadow-navy-900/10">
          {items.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => openService(s)}
              className="flex w-full items-center gap-3 border-b border-navy-50 px-3.5 py-2.5 text-left transition-colors last:border-0 hover:bg-navy-50 cursor-pointer"
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${colorOf(s.categories[0]?.color ?? "navy").soft} ${colorOf(s.categories[0]?.color ?? "navy").text}`}>
                <Icon name="arrowUpRight" size={15} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">
                  <Bi hi={s.titleHi} en={s.titleEn} />
                </span>
                <span className="block text-xs text-ink-soft">
                  <Bi hi={s.categories[0]?.titleHi ?? ""} en={s.categories[0]?.titleEn ?? ""} />
                </span>
              </span>
              <Icon name="external" size={14} className="shrink-0 text-navy-300" />
            </button>
          ))}
          <div className="bg-navy-50/60 px-3.5 py-2 text-xs font-semibold text-navy-600">
            <Bi hi="↵ दबाकर सभी परिणाम देखें" en="Press ↵ to see all results" />
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({
  categories,
  helpline,
}: {
  categories: CategoryWithCount[];
  helpline: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const today = new Date();

  return (
    <>
      {/* Tricolour strip */}
      <div className="tricolor-strip h-[3px] w-full" aria-hidden />

      {/* Utility bar */}
      <div className="bg-navy-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden text-white/70 sm:inline" suppressHydrationWarning>
              <span className="lang-hi">
                {today.toLocaleDateString("hi-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="lang-en">
                {today.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>
            <a
              href={`tel:${helpline.replace(/[^0-9]/g, "")}`}
              className="flex items-center gap-1.5 font-semibold text-saffron-300 transition-colors hover:text-saffron-200"
            >
              <Icon name="phone" size={13} />
              <span className="tnum">{helpline}</span>
              <span className="hidden font-normal text-white/60 md:inline">
                <Bi hi="(टोल फ्री हेल्पलाइन)" en="(Toll-free helpline)" />
              </span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden items-center gap-1.5 font-semibold text-white/70 transition-colors hover:text-white sm:flex"
            >
              <Icon name="shield" size={13} />
              <Bi hi="सुपरएडमिन" en="Superadmin" />
            </Link>
            <LanguageToggle compact />
          </div>
        </div>
      </div>

      {/* Main sticky header */}
      <header className="sticky top-0 z-40 border-b border-navy-100 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark size={42} />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-tight text-navy-900 sm:text-[22px]">
                APPZENO <span className="text-saffron-600">Sarkari</span> Portal
              </span>
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                <Bi hi="हर सरकारी काम • एक जगह" en="Every Govt Service • One Place" />
              </span>
            </span>
          </Link>

          <div className="mx-auto hidden w-full max-w-xl flex-1 md:block">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href="/advertise" className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 cursor-pointer">
              <Icon name="megaphone" size={15} />
              <Bi hi="विज्ञापन दें" en="Advertise" />
            </Link>
            <InstallButton className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-lg border border-navy-200 text-navy-800 transition-colors hover:bg-navy-50 md:hidden cursor-pointer"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 md:hidden">
          <SearchBox />
        </div>

        {/* Category chips rail */}
        <nav className="border-t border-navy-100/70 bg-surface">
          <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-2 sm:px-6">
            {categories.map((c) => {
              const active = pathname === `/category/${c.slug}`;
              const color = colorOf(c.color);
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all duration-200 ${
                    active
                      ? `${color.chip} ${color.border} shadow-sm`
                      : "border-transparent text-ink-soft hover:border-navy-200 hover:bg-navy-50 hover:text-navy-800"
                  }`}
                >
                  <Icon name={c.icon} size={14} />
                  <Bi hi={c.titleHi} en={c.titleEn} />
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-surface p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogoMark size={34} />
                <span className="font-display text-lg font-bold text-navy-900">
                  APPZENO <span className="text-saffron-600">Sarkari</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid size-9 place-items-center rounded-lg border border-navy-200 text-navy-800 cursor-pointer"
                aria-label="Close menu"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
              <Bi hi="श्रेणियाँ" en="Categories" />
            </p>
            <div className="space-y-1">
              {categories.map((c) => {
                const color = colorOf(c.color);
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 font-bold text-ink transition-colors hover:border-navy-100 hover:bg-navy-50"
                  >
                    <span className={`grid size-9 place-items-center rounded-lg ${color.soft} ${color.text}`}>
                      <Icon name={c.icon} size={17} />
                    </span>
                    <span className="flex-1">
                      <Bi hi={c.titleHi} en={c.titleEn} />
                    </span>
                    <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-bold text-navy-700 tnum">
                      {c.serviceCount}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 border-t border-navy-100 pt-4">
              <Link
                href="/advertise"
                className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-saffron-500 px-3 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95"
              >
                <Icon name="megaphone" size={15} />
                <Bi hi="विज्ञापन दें" en="Advertise Here" />
              </Link>
              <InstallButton className="w-full justify-center" />
              <Link
                href="/login"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm font-bold text-navy-800"
              >
                <Icon name="shield" size={15} />
                <Bi hi="सुपरएडमिन लॉगिन" en="Superadmin Login" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
