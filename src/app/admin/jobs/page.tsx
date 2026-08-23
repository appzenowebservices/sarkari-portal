"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DeleteButton,
  EmptyRow,
  useToast,
} from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { daysUntil, formatDate, jobStatusOf } from "@/lib/utils";

type JobRow = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  categoryId: string;
  categoryNameHi: string;
  categoryNameEn: string;
  organizationId: string;
  organizationNameHi: string;
  organizationNameEn: string;
  jobType: string;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  applicationStartDate: string;
  applicationLastDate: string;
  state: string;
  totalVacancies: number;
  minimumQualification: string;
  minimumAge: number;
  maximumAge: number;
  applyUrl: string;
  notificationUrl: string;
  tags: string;
  clickCount: number;
  createdAt: string;
  template: string;
};

const STATUS_STYLES = {
  active: "bg-leaf-100 text-leaf-800",
  upcoming: "bg-amber-100 text-amber-800",
  closed: "bg-slate-200 text-slate-600",
};

type SortKey = "newest" | "lastdate" | "vacancies" | "title";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "नवीनतम पहले" },
  { value: "lastdate", label: "अंतिम तिथि" },
  { value: "vacancies", label: "रिक्तियां" },
  { value: "title", label: "शीर्षक" },
];

const LIMIT_OPTIONS = [10, 20, 50, 100, 200];

export default function AdminJobsPage() {
  const [list, setList] = useState<JobRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState<SortKey>("newest");
  const { show, node } = useToast();
  const loadRef = useRef<() => void>(null);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (limit < 200) params.set("limit", String(limit));
    if (sort !== "newest") params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (filter !== "all") params.set("filter", filter);
    return `/api/admin/jobs?${params.toString()}`;
  }, [page, limit, sort, q, filter]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(buildUrl());
        const data = (await res.json()) as { jobs: JobRow[]; total: number; page: number; limit: number };
        if (!cancelled) {
          setList(data.jobs || []);
          setTotal(data.total || 0);
        }
      } catch {
        if (!cancelled) show("लोड नहीं हो पाया", "err");
      }
    };
    loadRef.current = load;
    load();
    return () => { cancelled = true; };
  }, [buildUrl, show]);

  const reload = useCallback(() => {
    loadRef.current?.();
  }, []);

  const totalPages = limit === 200 ? 1 : Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const startIdx = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const endIdx = Math.min(safePage * limit, total);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter((j) => {
      if (filter === "published" && !j.isActive) return false;
      if (filter === "draft" && j.isActive) return false;
      if (filter === "government" && j.jobType !== "government") return false;
      if (filter === "private" && j.jobType !== "private") return false;
      if (filter === "active" && jobStatusOf(j.applicationStartDate, j.applicationLastDate) !== "active") return false;
      if (filter === "closed" && jobStatusOf(j.applicationStartDate, j.applicationLastDate) !== "closed") return false;
      if (term) {
        const hay = `${j.titleHi} ${j.titleEn} ${j.organizationNameHi} ${j.tags}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [list, q, filter]);

  const remove = async (j: JobRow) => {
    const res = await fetch(`/api/admin/jobs/${j.id}`, { method: "DELETE" });
    if (res.ok) { show("नौकरी हटा दी गई"); await reload(); }
    else show("हटाने में विफल", "err");
  };

  const togglePublish = async (j: JobRow) => {
    await fetch(`/api/admin/jobs/${j.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !j.isActive }),
    });
    await reload();
  };

  const duplicate = async (j: JobRow) => {
    const res = await fetch(`/api/admin/jobs/${j.id}/duplicate`, { method: "POST" });
    if (res.ok) {
      show("नौकरी डुप्लीकेट हो गई");
      await reload();
    } else {
      show("डुप्लीकेट नहीं हो पाया", "err");
    }
  };

  const publishedCount = list.filter((j) => j.isActive).length;

  return (
    <div>
      {node}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Jobs Manager</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">नौकरियां (Jobs)</h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <span className="tnum">{total}</span> कुल • <span className="tnum">{publishedCount}</span> प्रकाशित
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/jobs/new/government"
            className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-leaf-800 active:scale-95"
          >
            <Icon name="building" size={16} strokeWidth={2.4} />
            Government Job
          </Link>
          <Link
            href="/admin/jobs/new/private"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-800 active:scale-95"
          >
            <Icon name="briefcase" size={16} strokeWidth={2.4} />
            Private Job
          </Link>
        </div>
      </div>

      <div className="mb-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center rounded-xl border-2 border-navy-100 bg-surface transition-colors focus-within:border-saffron-500">
          <span className="pl-3.5 text-navy-400"><Icon name="search" size={17} /></span>
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="नाम, विभाग या टैग से खोजें…"
            className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-ink-soft/60" />
          {q && <button type="button" onClick={() => { setQ(""); setPage(1); }} className="pr-3 text-navy-400 hover:text-navy-800 cursor-pointer" aria-label="Clear"><Icon name="x" size={15} /></button>}
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer">
          <option value="all">सभी नौकरियां</option>
          <option value="published">केवल प्रकाशित</option>
          <option value="draft">केवल ड्राफ्ट</option>
          <option value="government">सरकारी</option>
          <option value="private">प्राइवेट</option>
          <option value="active">सक्रिय</option>
          <option value="closed">समाप्त</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-ink-soft">दिखाएं:</span>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-navy-200 bg-paper px-2.5 py-1.5 text-xs font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer">
            {LIMIT_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            <option value={200}>All</option>
          </select>
          <span className="text-xs font-semibold text-ink-soft">
            {total > 0 ? `${startIdx}-${endIdx} of ${total}` : "0 results"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-ink-soft">क्रमबद्ध:</span>
          <select value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }} className="rounded-lg border border-navy-200 bg-paper px-2.5 py-1.5 text-xs font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer">
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyRow text="कोई नौकरी नहीं मिली" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-navy-100 bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50/60 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                  <th className="px-4 py-3">नौकरी</th>
                  <th className="px-3 py-3">प्रकार</th>
                  <th className="px-3 py-3 text-center">रिक्तियां</th>
                  <th className="px-3 py-3">अंतिम तिथि</th>
                  <th className="px-3 py-3 text-center">स्थिति</th>
                  <th className="px-3 py-3 text-center">क्लिक</th>
                  <th className="px-3 py-3 text-right">एक्शन</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {filtered.map((j) => {
                  const st = jobStatusOf(j.applicationStartDate, j.applicationLastDate);
                  const days = daysUntil(j.applicationLastDate);
                  return (
                    <tr key={j.id} className={`transition-colors hover:bg-paper ${!j.isActive ? "opacity-55" : ""}`}>
                      <td className="max-w-[260px] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${j.jobType === "private" ? "bg-sky-100 text-sky-700" : "bg-leaf-100 text-leaf-700"}`}>
                            <Icon name={j.jobType === "private" ? "briefcase" : "building"} size={16} />
                          </span>
                          <div className="min-w-0">
                            <Link href={`/admin/jobs/new?id=${j.id}`} className="truncate font-extrabold text-ink hover:text-navy-800">
                              {j.titleHi}
                            </Link>
                            <p className="truncate text-xs font-semibold text-ink-soft">{j.organizationNameHi || j.titleEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-extrabold ${j.jobType === "private" ? "bg-sky-100 text-sky-800" : "bg-leaf-100 text-leaf-800"}`}>
                            {j.jobType === "private" ? "प्राइवेट" : "सरकारी"}
                          </span>
                          <span className="text-[11px] font-semibold text-ink-soft">{j.jobType}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-extrabold text-navy-800 tnum">{j.totalVacancies}</td>
                      <td className="px-3 py-3">
                        {j.applicationLastDate ? (
                          <span className="flex items-center gap-1 font-bold text-ink">
                            <Icon name="calendar" size={12} className="text-navy-400" />
                            <span className="tnum">{formatDate(j.applicationLastDate)}</span>
                            {days !== null && days >= 0 && st === "active" && (
                              <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-extrabold text-rose-700 tnum">{days}d</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-ink-soft">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${STATUS_STYLES[st]}`}>
                          {st === "active" ? "सक्रिय" : st === "upcoming" ? "आगामी" : "समाप्त"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-extrabold text-navy-800 tnum">{j.clickCount}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => togglePublish(j)} title="प्रकाशित/ड्राफ्ट"
                            className={`rounded-lg px-2 py-1 text-[11px] font-extrabold cursor-pointer transition-colors ${
                              j.isActive ? "bg-leaf-100 text-leaf-800 hover:bg-leaf-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}>
                            {j.isActive ? "प्रकाशित" : "ड्राफ्ट"}
                          </button>
                          <Link href={`/admin/jobs/new/${j.jobType}?id=${j.id}`} className="grid size-8 place-items-center rounded-lg text-navy-600 hover:bg-navy-100 cursor-pointer" title="संपादित करें">
                            <Icon name="pencil" size={15} />
                          </Link>
                          <button type="button" onClick={() => duplicate(j)} title="Duplicate"
                            className="grid size-8 place-items-center rounded-lg text-navy-600 hover:bg-navy-100 cursor-pointer">
                            <Icon name="copy" size={15} />
                          </button>
                          <DeleteButton onConfirm={() => remove(j)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
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
          <p className="text-xs font-semibold text-ink-soft">
            पेज {safePage} / {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
