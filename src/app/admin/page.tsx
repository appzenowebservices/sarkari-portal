import Link from "next/link";
import { BarsChart, StatCard } from "@/components/admin/widgets";
import { Bi } from "@/components/bi";
import { colorOf, Icon } from "@/components/icons";
import { getDashboardStats, resilient } from "@/lib/data";
import { timeAgo } from "@/lib/utils";
import { DateFilter } from "@/components/admin/date-filter";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard — Superadmin" };

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const dateRange = params.from && params.to
    ? {
        from: new Date(params.from),
        to: new Date(params.to),
      }
    : undefined;
  const stats = await resilient(() => getDashboardStats(dateRange), {
    totalServices: 0,
    activeServices: 0,
    totalCategories: 0,
    totalClicks: 0,
    todayClicks: 0,
    totalAds: 0,
    liveAds: 0,
    totalAdRequests: 0,
    pendingAdRequests: 0,
    series: [],
    topServices: [],
    latestServices: [],
  } as Awaited<ReturnType<typeof getDashboardStats>>);

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Superadmin</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">Complete portal status at a glance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ads" className="inline-flex items-center gap-2 rounded-xl border border-saffron-400 bg-saffron-50 px-4 py-2.5 text-sm font-bold text-saffron-800 shadow-sm transition-all hover:bg-saffron-100 active:scale-95">
            <Icon name="megaphone" size={16} />New Ad
          </Link>
          <Link href="/admin/services" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95">
            <Icon name="plus" size={16} strokeWidth={2.4} />New Service
          </Link>
        </div>
      </div>

      <DateFilter />

      {/* Stat cards — 6 cards in 2 rows */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Services" value={stats.totalServices} icon="link" accent="navy" sub={`${stats.activeServices} active`} />
        <StatCard label="Categories" value={stats.totalCategories} icon="folder" accent="saffron" />
        <StatCard label="Total Clicks" value={stats.totalClicks} icon="click" accent="green" />
        <StatCard label="Today Clicks" value={stats.todayClicks} icon="trendingUp" accent="sky" />
        <StatCard label="Ads" value={stats.totalAds} icon="megaphone" accent="saffron" sub={`${stats.liveAds} live`} />
        <StatCard label="Ad Requests" value={stats.totalAdRequests} icon="inbox" accent="green" sub={stats.pendingAdRequests > 0 ? `${stats.pendingAdRequests} pending` : undefined} />
      </div>

      {/* Chart + top services */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-navy-900 text-saffron-400"><Icon name="chart" size={17} /></span>
            <div>
              <h2 className="font-display text-lg font-bold leading-none text-navy-950">Click Trend</h2>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Click analytics</p>
            </div>
          </div>
          <BarsChart series={stats.series} />
        </div>

        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-saffron-500 text-navy-950"><Icon name="star" size={17} /></span>
            <div>
              <h2 className="font-display text-lg font-bold leading-none text-navy-950">Top Services</h2>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Most clicked</p>
            </div>
          </div>
          <ol className="space-y-1">
            {stats.topServices.map((s, i) => {
              const cat = s.categories[0];
              const color = cat ? colorOf(cat.color) : colorOf("navy");
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-paper">
                  <span className="w-6 text-right font-display text-xl font-bold text-navy-200 tnum">{i + 1}</span>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color.soft} ${color.text}`}><Icon name={cat ? cat.icon : "link"} size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-extrabold text-ink">{s.titleHi}</p>
                    <p className="truncate text-[11px] font-semibold text-ink-soft">{cat ? cat.titleHi : ""}</p>
                  </div>
                  <span className="shrink-0 text-xs font-extrabold text-saffron-700 tnum">{s.clickCount.toLocaleString("en-IN")}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Quick links + latest services */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        {/* Quick links */}
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg font-bold text-navy-950">
            <span className="grid size-9 place-items-center rounded-lg bg-leaf-500 text-white"><Icon name="zap" size={17} /></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/admin/services", icon: "plus", label: "New Service", bg: "bg-navy-900 text-white" },
              { href: "/admin/categories", icon: "folder", label: "Categories", bg: "bg-navy-100 text-navy-800" },
              { href: "/admin/ads", icon: "megaphone", label: "New Ad", bg: "bg-saffron-500 text-navy-950" },
              { href: "/admin/ad-requests", icon: "inbox", label: "Ad Requests", bg: "bg-leaf-500 text-white" },
              { href: "/admin/privacy-requests", icon: "shield", label: "Privacy Requests", bg: "bg-purple-100 text-purple-800" },
              { href: "/admin/contact-requests", icon: "mail", label: "Contact Requests", bg: "bg-sky-100 text-sky-800" },
              { href: "/admin/settings", icon: "settings", label: "Settings", bg: "bg-navy-100 text-navy-800" },
              { href: "/", icon: "external", label: "View Site", bg: "bg-navy-100 text-navy-800" },
            ].map((q) => (
              <Link key={q.href + q.label} href={q.href} className="flex items-center gap-2.5 rounded-xl border border-navy-100 px-3 py-3 text-sm font-bold text-navy-800 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${q.bg}`}><Icon name={q.icon} size={15} /></span>
                {q.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Latest services */}
        <div className="rounded-xl border border-navy-100 bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-navy-950">
              <span className="grid size-9 place-items-center rounded-lg bg-navy-100 text-navy-700"><Icon name="clock" size={17} /></span>
              Recently Added Services
            </h2>
            <Link href="/admin/services" className="flex items-center gap-1 text-sm font-extrabold text-saffron-700 transition-colors hover:text-saffron-800">
              All <Icon name="arrowRight" size={15} />
            </Link>
          </div>
          <div className="divide-y divide-navy-50">
            {stats.latestServices.map((s) => {
              const cat = s.categories[0];
              const color = cat ? colorOf(cat.color) : colorOf("navy");
              return (
                <div key={s.id} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-paper">
                  <span className={`hidden size-9 shrink-0 place-items-center rounded-lg sm:grid ${color.soft} ${color.text}`}>
                    <Icon name={cat ? cat.icon : "link"} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink"><Bi hi={s.titleHi} en={s.titleEn} /></p>
                    <p className="truncate text-xs font-semibold text-ink-soft">{s.url}</p>
                  </div>
                  {s.isNew && <span className="rounded-md bg-leaf-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">New</span>}
                  <span className={`hidden rounded-full px-2.5 py-0.5 text-[11px] font-extrabold sm:inline ${s.isActive ? "bg-leaf-100 text-leaf-800" : "bg-slate-200 text-slate-600"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-ink-soft">{timeAgo(s.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
