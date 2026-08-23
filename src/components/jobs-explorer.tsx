"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import type { PublicJob } from "@/db/schema";
import { daysUntil, formatDate, jobStatusOf, type JobStatus } from "@/lib/utils";

type CategoryFilter = "all" | "government" | "private";
type StatusFilter = "all" | JobStatus;
type SortKey = "newest" | "lastdate" | "vacancies" | "salary";

const CATEGORY_META: Record<"government" | "private", { label: string; labelEn: string; badge: string; icon: string }> = {
  government: {
    label: "सरकारी नौकरी",
    labelEn: "Government Job",
    badge: "bg-leaf-100 text-leaf-800 border-leaf-300",
    icon: "building",
  },
  private: {
    label: "प्राइवेट नौकरी",
    labelEn: "Private Job",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    icon: "briefcase",
  },
};

const STATUS_META: Record<JobStatus, { label: string; labelEn: string; badge: string; dot: string }> = {
  active: { label: "सक्रिय", labelEn: "Active", badge: "bg-leaf-100 text-leaf-800 border-leaf-300", dot: "bg-leaf-500" },
  upcoming: { label: "आगामी", labelEn: "Upcoming", badge: "bg-amber-100 text-amber-800 border-amber-300", dot: "bg-amber-500" },
  closed: { label: "समाप्त", labelEn: "Closed", badge: "bg-slate-200 text-slate-600 border-slate-300", dot: "bg-slate-400" },
};

const PAGE_SIZE = 10;

export function JobsExplorer({ jobs }: { jobs: PublicJob[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = jobs.filter((j) => {
      if (category !== "all" && j.category !== category) return false;
      if (status !== "all" && jobStatusOf(j.startDate, j.lastDate) !== status) return false;
      if (term) {
        const hay = `${j.titleHi} ${j.titleEn} ${j.organizationHi} ${j.organizationEn} ${j.tags} ${j.location}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "lastdate") {
        const ad = a.lastDate ? new Date(a.lastDate).getTime() : Infinity;
        const bd = b.lastDate ? new Date(b.lastDate).getTime() : Infinity;
        return ad - bd;
      }
      if (sort === "vacancies") return b.totalVacancies - a.totalVacancies;
      if (sort === "salary") {
        const as = parseSalary(a.salary);
        const bs = parseSalary(b.salary);
        return bs - as;
      }
      return 0;
    });
    return list;
  }, [jobs, q, category, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = useMemo(() => {
    const c = { all: jobs.length, government: 0, private: 0, active: 0, upcoming: 0, closed: 0 };
    for (const j of jobs) {
      if (j.category === "government") c.government++;
      if (j.category === "private") c.private++;
      const st = jobStatusOf(j.startDate, j.lastDate);
      c[st]++;
    }
    return c;
  }, [jobs]);

  return (
    <div>
      <div className="rounded-2xl border border-navy-100 bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex items-center rounded-xl border-2 border-navy-100 bg-paper transition-colors focus-within:border-saffron-500">
          <span className="pl-3.5 text-navy-400"><Icon name="search" size={18} /></span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="नौकरी, विभाग या पद खोजें… (Search jobs, department or post)"
            className="w-full bg-transparent px-3 py-2.5 text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/60"
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); setPage(1); }} className="pr-3 text-navy-400 hover:text-navy-800 cursor-pointer" aria-label="Clear">
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {([
              { v: "all", label: "सभी", en: "All" },
              { v: "government", label: "सरकारी", en: "Govt" },
              { v: "private", label: "प्राइवेट", en: "Private" },
            ] as { v: CategoryFilter; label: string; en: string }[]).map((f) => (
              <button key={f.v} type="button" onClick={() => { setCategory(f.v); setPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all cursor-pointer ${
                  category === f.v ? "border-navy-900 bg-navy-900 text-white shadow" : "border-navy-200 bg-surface text-ink-soft hover:bg-navy-50"
                }`}
              >
                <span className="lang-hi">{f.label}</span>
                <span className="lang-en">{f.en}</span>
                <span className="ml-1 text-[10px] opacity-70 tnum">
                  {f.v === "all" ? counts.all : f.v === "government" ? counts.government : counts.private}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "active", "upcoming", "closed"] as StatusFilter[]).map((s) => (
              <button key={s} type="button" onClick={() => { setStatus(s); setPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all cursor-pointer ${
                  status === s ? "border-saffron-500 bg-saffron-50 text-saffron-800" : "border-navy-200 bg-surface text-ink-soft hover:bg-navy-50"
                }`}
              >
                {s === "all" ? <><span className="lang-hi">सभी स्थिति</span><span className="lang-en">All status</span></> : (
                  <span className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${STATUS_META[s].dot}`} />
                    <span className="lang-hi">{STATUS_META[s].label}</span>
                    <span className="lang-en">{STATUS_META[s].labelEn}</span>
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-1.5 text-[13px] font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
            >
              <option value="newest">नवीनतम पहले (Newest)</option>
              <option value="lastdate">अंतिम तिथि (Last date)</option>
              <option value="vacancies">अधिक रिक्तियां (Vacancies)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6 mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-ink-soft tnum">
          {filtered.length} <Bi hi="नौकरियां मिलीं" en="jobs found" />
        </p>
        <p className="hidden text-xs font-semibold text-ink-soft sm:block">
          <Bi hi="हर नौकरी की जानकारी आधिकारिक स्रोत से" en="Every job's info from official sources" />
        </p>
      </div>
      {pageItems.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-navy-200 bg-surface py-16 text-center">
          <Icon name="briefcase" size={40} className="text-navy-300" />
          <p className="mt-4 text-lg font-extrabold text-navy-900"><Bi hi="कोई नौकरी नहीं मिली" en="No jobs found" /></p>
          <p className="mt-1 text-sm text-ink-soft"><Bi hi="फ़िल्टर बदलकर दोबारा देखें" en="Try changing your filters" /></p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {pageItems.map((job, i) => (
            <Reveal key={job.id} delay={(i % 5) * 40}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="grid size-9 place-items-center rounded-lg border border-navy-200 text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer" aria-label="Previous">
            <Icon name="chevronLeft" size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)}
              className={`grid size-9 place-items-center rounded-lg text-sm font-extrabold transition-colors cursor-pointer ${
                p === safePage ? "bg-navy-900 text-white" : "border border-navy-200 text-navy-700 hover:bg-navy-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="grid size-9 place-items-center rounded-lg border border-navy-200 text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer" aria-label="Next">
            <Icon name="chevronLeft" size={16} className="rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: PublicJob }) {
  const status = jobStatusOf(job.startDate, job.lastDate);
  const smeta = STATUS_META[status];
  const cmeta = job.category === "private" ? CATEGORY_META.private : CATEGORY_META.government;
  const days = daysUntil(job.lastDate);
  const closingSoon = status === "active" && days !== null && days >= 0 && days <= 7;
  return (
    <article className="group overflow-hidden rounded-2xl border border-navy-100 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${smeta.badge}`}>
              <span className={`size-1.5 rounded-full ${smeta.dot}`} />
              <Bi hi={smeta.label} en={smeta.labelEn} />
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${cmeta.badge}`}>
              <Icon name={cmeta.icon} size={11} />
              <Bi hi={cmeta.label} en={cmeta.labelEn} />
            </span>
            {job.isFeatured && (
              <span className="grid size-5 place-items-center rounded-md bg-saffron-100 text-saffron-700" title="Featured">
                <Icon name="star" size={11} strokeWidth={2.4} />
              </span>
            )}
            <span className="ml-auto text-[11px] font-bold text-ink-soft/70">
              <Icon name="calendar" size={11} className="mr-1 inline" />
              {formatDate(job.createdAt)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-extrabold leading-snug text-navy-950 transition-colors group-hover:text-navy-700 sm:text-xl">
            <Link href={`/jobs/${job.slug}`}><Bi hi={job.titleHi} en={job.titleEn} /></Link>
          </h3>
          {(job.organizationHi || job.organizationEn) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink-soft">
              <Icon name="building" size={14} className="text-navy-400" />
              <Bi hi={job.organizationHi} en={job.organizationEn} />
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Fact icon="users" label={<Bi hi="रिक्तियां" en="Vacancies" />} value={job.totalVacancies.toLocaleString("en-IN")} />
            <Fact icon="graduation" label={<Bi hi="योग्यता" en="Qualification" />} value={job.qualification || "—"} />
            <Fact icon="clock" label={<Bi hi="आयु सीमा" en="Age Limit" />} value={job.ageLimit || "—"} />
            <Fact icon="target" label={<Bi hi="स्थान" en="Location" />} value={job.location || "—"} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-paper px-3.5 py-2.5 text-[13px] font-bold">
            {job.startDate && (
              <span className="flex items-center gap-1.5 text-ink-soft">
                <Icon name="calendar" size={14} className="text-navy-400" />
                <Bi hi="शुरू" en="Start" />: <span className="text-navy-900 tnum">{formatDate(job.startDate)}</span>
              </span>
            )}
            <span className={`flex items-center gap-1.5 ${closingSoon ? "text-rose-700" : "text-ink-soft"}`}>
              <Icon name="alert" size={14} className={closingSoon ? "text-rose-500" : "text-navy-400"} />
              <Bi hi="अंतिम तिथि" en="Last date" />:{" "}
              <span className={`tnum ${closingSoon ? "font-extrabold text-rose-700" : "text-navy-900"}`}>
                {job.lastDate ? formatDate(job.lastDate) : "—"}
              </span>
              {closingSoon && (
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-700 tnum">
                  {days} <Bi hi="दिन शेष" en="days left" />
                </span>
              )}
            </span>
            {(job as any).examDate && (
              <span className="flex items-center gap-1.5 text-ink-soft">
                <Icon name="clock" size={14} className="text-navy-400" />
                <Bi hi="परीक्षा" en="Exam" />: <span className="text-navy-900 tnum">{(job as any).examDate}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 border-t border-navy-100 bg-navy-50/40 p-4 lg:w-52 lg:flex-col lg:justify-center lg:border-l lg:border-t-0">
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-navy-800 active:scale-95"
          >
            <Icon name="eye" size={15} />
            <Bi hi="पूरी जानकारी" en="Details" />
          </Link>
          {job.applyUrl && status !== "closed" && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-all hover:bg-saffron-400 active:scale-95"
            >
              <Icon name="external" size={15} />
              <Bi hi="आवेदन करें" en="Apply Now" />
            </a>
          )}
          {job.notificationUrl && (
            <a
              href={job.notificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-surface px-4 py-2.5 text-sm font-bold text-navy-800 transition-all hover:bg-navy-50"
            >
              <Icon name="fileText" size={15} />
              <Bi hi="नोटिफिकेशन" en="Notification" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Fact({ icon, label, value }: { icon: string; label: React.ReactNode; value: string }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-surface px-2.5 py-2">
      <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
        <Icon name={icon} size={11} className="text-navy-400" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-extrabold text-navy-900" title={value}>{value}</p>
    </div>
  );
}

function parseSalary(s: string): number {
  const match = s.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (s.includes("L") || s.includes("Lakh")) return num * 100000;
  if (s.includes("k") || s.includes("K")) return num * 1000;
  return num;
}
