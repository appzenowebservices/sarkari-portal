import Link from "next/link";
import { AdSection } from "@/components/ad-slot";
import { Bi } from "@/components/bi";
import { CountUp } from "@/components/count-up";
import { SearchBox } from "@/components/header";
import { colorOf, Icon } from "@/components/icons";
import { InstallButton } from "@/components/pwa";
import { Reveal } from "@/components/reveal";
import { ServiceCard } from "@/components/service-card";
import { JobCard } from "@/components/job-card";
import { TrackLink } from "@/components/track-link";
import {
  resilient,
} from "@/lib/data";
import { attachCategories } from "@/lib/with-categories";
import { api } from "@/trpc/server";
import type { Ad, Job, ServiceWithCategory } from "@/db/schema";

export const dynamic = "force-dynamic";

function Chakra({ className, size = 220 }: { className?: string; size?: number }) {
  const spokes = Array.from({ length: 12 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <g stroke="currentColor" strokeWidth="1.4">
        {spokes.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const dx = 44 * Math.cos(rad);
          const dy = 44 * Math.sin(rad);
          return <line key={deg} x1={50 - dx} y1={50 - dy} x2={50 + dx} y2={50 + dy} />;
        })}
      </g>
      <circle cx="50" cy="50" r="7" fill="currentColor" />
    </svg>
  );
}

const QUICK_SEARCHES = [
  { hi: "आधार कार्ड", en: "Aadhaar Card" },
  { hi: "वोटर ID", en: "Voter ID" },
  { hi: "पीएम किसान", en: "PM Kisan" },
  { hi: "ड्राइविंग लाइसेंस", en: "Driving License" },
  { hi: "आयुष्मान कार्ड", en: "Ayushman Card" },
  { hi: "बिजली बिल", en: "Electricity Bill" },
];

export default async function HomePage() {
  // Primary data via tRPC/Prisma (works where the raw driver cannot).
  // Each fetch retries with backoff, then falls back — a DB blip must not 500 the homepage.
  const [cats, popRaw, freshRaw, totalClicks, adsRaw, tJobs] = await Promise.all([
    resilient(() => api.catalog.categories({ includeInactive: false }), []),
    resilient(() => api.catalog.popularServices({ limit: 10 }), []),
    resilient(() => api.catalog.freshServices({ limit: 10 }), []),
    resilient(() => api.catalog.totalClicks(), 0),
    resilient(() => api.ads.liveAds(), []),
    resilient(() => api.job.list({ limit: 6, sort: "latest" }), []),
  ]);

  const categories = cats;
  const popular = attachCategories(popRaw, cats);
  const fresh = attachCategories(freshRaw, cats);

  const liveAds: Record<string, Ad[]> = {};
  for (const ad of adsRaw) {
    const key = ad.placement;
    if (!liveAds[key]) liveAds[key] = [];
    liveAds[key].push(ad as Ad);
  }

  const latestJobs = tJobs as unknown as Job[];

  // Services grouped per category (top 10 categories).
  const grouped = await Promise.all(
    cats.slice(0, 10).map(async (c) => {
      const rows = await resilient(() => api.catalog.servicesByCategory({ slug: c.slug }), []);
      return [c.slug, attachCategories(rows, cats)] as const;
    }),
  );
  const servicesByCategory: Record<string, ServiceWithCategory[]> = Object.fromEntries(grouped);

  const totalServices = categories.reduce((acc, c) => acc + c.serviceCount, 0);

  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-navy-100 bg-paper">
        <div className="bg-grid-ink absolute inset-0" aria-hidden />
        <div className="absolute -right-40 -top-40 size-[480px] rounded-full opacity-60" style={{ background: "radial-gradient(closest-side, var(--color-saffron-200), transparent)" }} aria-hidden />
        <div className="absolute -bottom-52 -left-32 size-[460px] rounded-full opacity-50" style={{ background: "radial-gradient(closest-side, var(--color-leaf-200), transparent)" }} aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:py-16">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-leaf-300 bg-leaf-50 px-3.5 py-1.5 text-[13px] font-extrabold text-leaf-800">
                <span className="animate-pulse-dot inline-block size-2 rounded-full bg-leaf-500" />
                <Bi hi={`${totalServices}+ सरकारी सेवाएं — सभी लिंक आधिकारिक और निःशुल्क`} en={`${totalServices}+ government services — all links official & free`} />
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-[42px] font-bold leading-[1.05] tracking-tight text-navy-950 sm:text-6xl lg:text-[64px]">
                <span className="lang-hi">हर सरकारी काम,<br />अब <span className="relative inline-block text-saffron-600">एक ही जगह<svg viewBox="0 0 220 12" className="absolute -bottom-1.5 left-0 w-full text-saffron-400" aria-hidden preserveAspectRatio="none"><path d="M3 9c40-6 140-8 214-4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></span>।</span>
                <span className="lang-en">Every government task,<br />now in <span className="relative inline-block text-saffron-600">one place<svg viewBox="0 0 220 12" className="absolute -bottom-1.5 left-0 w-full text-saffron-400" aria-hidden preserveAspectRatio="none"><path d="M3 9c40-6 140-8 214-4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></span>.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                <Bi hi="आधार से लेकर आयुष्मान तक, बिजली बिल से लेकर ड्राइविंग लाइसेंस तक — सही सरकारी वेबसाइट का सीधा लिंक पाएं, बिना किसी एजेंट या शुल्क के।" en="From Aadhaar to Ayushman, electricity bills to driving licenses — get direct links to the right government website, without agents or fees." />
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-7 max-w-xl">
              <SearchBox />
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft"><Bi hi="लोकप्रिय:" en="Popular:" /></span>
                {QUICK_SEARCHES.map((s) => (
                  <Link key={s.en} href={`/search?q=${encodeURIComponent(s.hi)}`} className="rounded-full border border-navy-200 bg-surface px-3 py-1 text-[13px] font-bold text-navy-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-saffron-400 hover:bg-saffron-50 hover:text-saffron-800">
                    <Bi hi={s.hi} en={s.en} />
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Live counter panel */}
          <Reveal delay={200}>
            <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-2xl shadow-navy-900/30 ring-1 ring-white/10 sm:p-7">
              <div className="bg-grid-light absolute inset-0" aria-hidden />
              <Chakra className="animate-spin-slower absolute -right-14 -top-14 text-saffron-500/25" size={230} />
              <div className="relative">
                <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.22em] text-saffron-400">
                  <span className="animate-pulse-dot inline-block size-2 rounded-full bg-leaf-400" />
                  <Bi hi="लाइव काउंटर" en="Live Counter" />
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { value: totalServices, label: <Bi hi="सेवाएं" en="Services" />, icon: "link" },
                    { value: categories.length, label: <Bi hi="श्रेणियाँ" en="Categories" />, icon: "folder" },
                    { value: totalClicks, label: <Bi hi="कुल क्लिक" en="Total Clicks" />, icon: "click" },
                  ].map((s) => (
                    <div key={s.icon} className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10 transition-colors hover:bg-white/10">
                      <Icon name={s.icon} size={17} className="text-saffron-400" />
                      <p className="mt-2 font-display text-2xl font-bold leading-none sm:text-3xl"><CountUp value={s.value} /></p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/60">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/*<div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50"><Bi hi="आज की चुनिंदा सेवाएं" en="Today's featured services" /></p>
                  <ul className="mt-3 space-y-1">
                    {popular.slice(0, 10).map((s) => (
                      <li key={s.id}>
                        <TrackLink serviceId={s.id} href={s.url} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/10">
                          <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${colorOf(s.category.color).solid} text-white`}><Icon name={s.category.icon} size={15} /></span>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold"><Bi hi={s.titleHi} en={s.titleEn} /></span>
                          <Icon name="arrowUpRight" size={15} className="shrink-0 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-saffron-400" />
                        </TrackLink>
                      </li>
                    ))}
                  </ul>
                </div>*/}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AD SLOT: hero_below */}
      <AdSection ads={liveAds.hero_below} />

      {/* ============ CATEGORY BENTO ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600"><Bi hi="विभाग अनुसार" en="By Department" /></p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl"><Bi hi="किस काम के लिए आए हैं?" en="What do you need today?" /></h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft"><Bi hi="अपनी श्रेणी चुनें — हर श्रेणी में आधिकारिक सरकारी लिंकों की पूरी सूची मिलेगी।" en="Pick a category — each one holds a complete list of official government links." /></p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c, i) => {
            const color = colorOf(c.color);
            const services = servicesByCategory[c.slug] ?? [];
            const isLarge = i < 2;
            return (
              <Reveal key={c.id} delay={(i % 4) * 70}>
                <div className={`group flex h-full flex-col rounded-xl border border-navy-100 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isLarge ? "sm:col-span-2 lg:col-span-2 xl:col-span-2" : ""} ${color.hoverBorder}`}>
                  <Link href={`/category/${c.slug}`} className="block">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`grid size-11 place-items-center rounded-xl ${color.soft} ${color.text} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}><Icon name={c.icon} size={22} /></span>
                          <div>
                            <h3 className="text-[15px] font-extrabold leading-snug text-navy-950"><Bi hi={c.titleHi} en={c.titleEn} /></h3>
                            <p className="mt-0.5 text-xs font-bold text-ink-soft tnum">{c.serviceCount} <Bi hi="लिंक उपलब्ध" en="links available" /></p>
                          </div>
                        </div>
                        <Icon name="arrowUpRight" size={17} strokeWidth={2.2} className="text-navy-200 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-saffron-600" />
                      </div>
                      {c.descriptionHi && (
                        <p className="mt-3 text-xs leading-relaxed text-ink-soft line-clamp-2"><Bi hi={c.descriptionHi} en={c.descriptionEn} /></p>
                      )}
                    </div>
                  </Link>
                  {services.length > 0 && (
                    <div className="border-t border-navy-100 bg-navy-50/50 px-5 py-3 sm:px-6 sm:py-3.5">
                      <ul className="space-y-2">
              {services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <TrackLink serviceId={s.id} href={s.url} className="group/link flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white hover:shadow-sm">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-md ${colorOf(s.categories[0]?.color ?? "navy").soft} ${colorOf(s.categories[0]?.color ?? "navy").text}`}><Icon name={s.categories[0]?.icon ?? "link"} size={13} /></span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink group-hover/link:text-navy-800"><Bi hi={s.titleHi} en={s.titleEn} /></span>
                    <Icon name="arrowUpRight" size={13} className="shrink-0 text-navy-300 transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-saffron-600" />
                  </TrackLink>
                </li>
              ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ LATEST JOBS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
              <Bi hi="करियर" en="Careers" />
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              <Bi hi="नवीनतम नौकरियां" en="Latest Jobs" />
            </h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              <Bi hi="सरकारी और निजी नौकरियों के नए अवसर" en="New government and private job opportunities" />
            </p>
          </div>
          <Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95">
            <Bi hi="सभी नौकरियां देखें" en="View All Jobs" />
            <Icon name="arrowUpRight" size={15} strokeWidth={2.4} />
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestJobs.map((job, i) => (
            <Reveal key={job.id} delay={(i % 3) * 70}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* AD SLOT: categories_between */}
      <AdSection ads={liveAds.categories_between} />

      {/* AD SLOT: popular_above */}
      <AdSection ads={liveAds.popular_above} />

      {/* ============ POPULAR + NEW ============ */}
      <section className="border-y border-navy-100 bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-saffron-500 text-navy-950"><Icon name="trendingUp" size={20} strokeWidth={2.2} /></span>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl"><Bi hi="सबसे ज़्यादा इस्तेमाल हुई" en="Most Used Services" /></h2>
                <p className="text-[13px] font-semibold text-ink-soft"><Bi hi="क्लिक के आधार पर रैंक" en="Ranked by clicks" /></p>
              </div>
            </div>
            <ol className="space-y-1.5">
              {popular.slice(0, 10).map((s, i) => {
                const cat = s.categories[0];
                const color = cat ? colorOf(cat.color) : colorOf("navy");
                return (
                  <li key={s.id}>
                    <TrackLink serviceId={s.id} href={s.url} className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-navy-100 hover:bg-paper">
                      <span className="w-9 shrink-0 text-right font-display text-3xl font-bold leading-none text-navy-200 transition-colors group-hover:text-saffron-500 tnum">{i + 1}</span>
                      <span className={`hidden size-9 shrink-0 place-items-center rounded-lg sm:grid ${color.soft} ${color.text}`}><Icon name={cat ? cat.icon : "link"} size={17} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-extrabold text-ink group-hover:text-navy-800"><Bi hi={s.titleHi} en={s.titleEn} /></span>
                        <span className={`mt-0.5 inline-block rounded-full px-2 py-px text-[11px] font-bold ${color.chip}`}><Bi hi={cat ? cat.titleHi : ""} en={cat ? cat.titleEn : ""} /></span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ink-soft tnum">{s.clickCount.toLocaleString("en-IN")}<Icon name="click" size={13} /></span>
                      <Icon name="arrowUpRight" size={16} className="shrink-0 text-navy-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-saffron-600" />
                    </TrackLink>
                  </li>
                );
              })}
            </ol>
          </Reveal>
          <Reveal delay={120}>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-leaf-500 text-white"><Icon name="sparkles" size={20} strokeWidth={2.2} /></span>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl"><Bi hi="नई लिंक — अभी जुड़ीं" en="Fresh Links — Just Added" /></h2>
                <p className="text-[13px] font-semibold text-ink-soft"><Bi hi="हाल ही में जोड़ी गई सेवाएं" en="Recently added services" /></p>
              </div>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {fresh.map((s) => (<ServiceCard key={s.id} service={s} />))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-navy-200 bg-surface shadow-sm">
            <div className="flex flex-col divide-y divide-navy-100 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                { icon: "search", num: "01", title: <Bi hi="सेवा खोजें" en="Find the service" />, desc: <Bi hi="खोज बॉक्स में लिखें या अपनी श्रेणी चुनें।" en="Type in the search box or pick a category." /> },
                { icon: "click", num: "02", title: <Bi hi="आधिकारिक लिंक खोलें" en="Open the official link" />, desc: <Bi hi="हर लिंक सीधे सरकारी विभाग की साइट पर ले जाता है।" en="Every link goes straight to the government portal." /> },
                { icon: "check", num: "03", title: <Bi hi="काम पूरा करें" en="Complete your work" />, desc: <Bi hi="आवेदन करें, बिल भरें या स्थिति जांचें — बिल्कुल निःशुल्क।" en="Apply, pay bills or check status — completely free." /> },
              ].map((step) => (
                <div key={step.num} className="group relative flex items-start gap-4 p-6 transition-colors hover:bg-navy-50/60 sm:p-7">
                  <span className="absolute right-5 top-4 font-display text-5xl font-bold text-navy-100 transition-colors group-hover:text-saffron-200">{step.num}</span>
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-navy-900 text-saffron-400 ring-4 ring-saffron-100 transition-transform duration-300 group-hover:scale-110"><Icon name={step.icon} size={22} strokeWidth={2} /></span>
                  <div className="relative pr-10">
                    <h3 className="text-lg font-extrabold text-navy-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* AD SLOT: footer_above */}
      <AdSection ads={liveAds.footer_above} />

      {/* ============ INSTALL CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-7 text-white sm:p-10">
            <div className="bg-grid-light absolute inset-0" aria-hidden />
            <Chakra className="animate-spin-slower absolute -bottom-20 -right-16 text-leaf-500/20" size={300} />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-saffron-300 ring-1 ring-white/15"><Icon name="download" size={13} />PWA</p>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"><Bi hi="पोर्टल को अपने फ़ोन की होम स्क्रीन पर रखें" en="Keep this portal on your phone's home screen" /></h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70"><Bi hi="एक बार इंस्टॉल करें — फिर ऐप की तरह खुलेगा, तेज़ चलेगा और कम डेटा में भी चलेगा।" en="Install once — it opens like an app, loads fast and works on low data." /></p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <InstallButton />
                  <span className="flex items-center gap-2 text-sm font-semibold text-white/60"><Icon name="shield" size={15} className="text-leaf-400" /><Bi hi="सुरक्षित • कोई लॉगिन नहीं • मुफ्त" en="Secure • No login • Free" /></span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ icon: "zap", label: <Bi hi="तेज़ लोड" en="Fast load" /> },{ icon: "home", label: <Bi hi="वन-टैप एक्सेस" en="One-tap access" /> },{ icon: "globe", label: <Bi hi="कम डेटा" en="Low data" /> }].map((f) => (
                  <div key={f.icon} className="rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10 transition-colors hover:bg-white/10">
                    <Icon name={f.icon} size={22} className="mx-auto text-saffron-400" />
                    <p className="mt-2 text-xs font-bold text-white/75">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
