"use client";

import { useMemo, useState } from "react";
import { Bi } from "@/components/bi";
import { colorOf, Icon } from "@/components/icons";
import { TrackLink } from "@/components/track-link";
import type { ServiceWithCategory } from "@/lib/data";

type Props = {
  services: ServiceWithCategory[];
};

type SortCol = "titleHi" | "titleEn" | "clicks" | "domain";
type SortDir = "asc" | "desc";

const PAGE_SIZES = [10, 20, 50, 100, 200] as const;
type PageSize = typeof PAGE_SIZES[number] | "all";

export function CategoryLinksTable({ services }: Props) {
  const [q, setQ] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("titleHi");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return services;
    return services.filter((s) => {
      const title = (s.titleHi + " " + s.titleEn).toLowerCase();
      const desc = (s.descriptionHi + " " + s.descriptionEn).toLowerCase();
      const tags = s.tags.toLowerCase();
      const domain = (() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return s.url; } })();
      return title.includes(term) || desc.includes(term) || tags.includes(term) || domain.includes(term);
    });
  }, [services, q]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortCol) {
        case "titleHi": return a.titleHi.localeCompare(b.titleHi) * dir;
        case "titleEn": return a.titleEn.localeCompare(b.titleEn) * dir;
        case "clicks": return (a.clickCount - b.clickCount) * dir;
        case "domain": {
          const da = (() => { try { return new URL(a.url).hostname.replace(/^www\./, ""); } catch { return a.url; } })();
          const db = (() => { try { return new URL(b.url).hostname.replace(/^www\./, ""); } catch { return b.url; } })();
          return da.localeCompare(db) * dir;
        }
        default: return 0;
      }
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = pageSize === "all" ? sorted : sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    const active = sortCol === col;
    return (
      <span className={`ml-1 inline-flex flex-col ${active ? "text-saffron-600" : "text-navy-300"}`}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 5L5 1L9 5" />
        </svg>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "-4px" }}>
          <path d="M1 1L5 5L9 1" />
        </svg>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="लिंक खोजें — नाम, विवरण, टैग..."
              className="w-72 rounded-xl border-2 border-navy-100 bg-paper pl-9 pr-4 py-2.5 text-sm font-semibold text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-saffron-500"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(e.target.value === "all" ? "all" : Number(e.target.value) as PageSize); setPage(0); }}
            className="rounded-xl border-2 border-navy-100 bg-paper px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
          >
            {PAGE_SIZES.map((sz) => (
              <option key={sz} value={sz}>{sz} / पेज</option>
            ))}
            <option value="all">सभी दिखाएं</option>
          </select>
        </div>
        <p className="text-xs font-bold text-ink-soft tnum">
          {filtered.length} <Bi hi="लिंक" en="links" />
          {filtered.length !== services.length && ` (${services.length} से फिल्टर)`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-navy-100 bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/60 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3 text-center tnum">क्रम</th>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => handleSort("titleHi")} className="inline-flex items-center transition-colors hover:text-navy-800">
                    शीर्षक <SortIcon col="titleHi" />
                  </button>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">
                  <button type="button" onClick={() => handleSort("domain")} className="inline-flex items-center transition-colors hover:text-navy-800">
                    डोमेन <SortIcon col="domain" />
                  </button>
                </th>
                <th className="px-4 py-3 hidden lg:table-cell">विवरण</th>
                <th className="px-4 py-3 hidden sm:table-cell">टैग</th>
                <th className="px-4 py-3 text-center">
                  <button type="button" onClick={() => handleSort("clicks")} className="inline-flex items-center transition-colors hover:text-navy-800">
                    क्लिक <SortIcon col="clicks" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
            {pageData.map((s, i) => {
              const cat = s.categories[0];
              const color = cat ? colorOf(cat.color) : colorOf("navy");
              const globalIdx = page * (pageSize === "all" ? sorted.length : pageSize) + i + 1;
              return (
                <tr key={s.id} className="transition-colors hover:bg-paper">
                  <td className="px-4 py-3 text-center text-xs font-bold text-navy-400 tnum">{globalIdx}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color.soft} ${color.text}`}>
                        <Icon name={cat ? cat.icon : "link"} size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-ink">{s.titleHi}</p>
                        <p className="truncate text-xs font-semibold text-ink-soft">{s.titleEn}</p>
                      </div>
                    </div>
                  </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-semibold text-ink-soft tnum">
                        {(() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return s.url; } })()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {(s.descriptionHi || s.descriptionEn) ? (
                        <p className="line-clamp-2 text-xs text-ink-soft">
                          <Bi hi={s.descriptionHi} en={s.descriptionEn} />
                        </p>
                      ) : (
                        <span className="text-xs text-ink-soft/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.tags.split(",").slice(0, 3).map((t, idx) => (
                          <span key={idx} className="rounded-md bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold text-navy-700">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-extrabold text-navy-800 tnum">
                      {s.clickCount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TrackLink
                        serviceId={s.id}
                        href={s.url}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-saffron-700 transition-colors hover:bg-saffron-50"
                      >
                        विजिट <Icon name="arrowUpRight" size={13} strokeWidth={2.4} />
                      </TrackLink>
                    </td>
                  </tr>
                );
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Icon name="inbox" size={32} className="mx-auto text-navy-300" />
                    <p className="mt-2 text-sm font-bold text-ink-soft">कोई लिंक नहीं मिला</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageSize !== "all" && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-navy-100 bg-paper px-4 py-3">
            <p className="text-xs font-semibold text-ink-soft">
              पेज {page + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-navy-200 bg-surface px-3 py-1.5 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer"
              >
                पिछला
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`grid size-8 place-items-center rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                    p === page
                      ? "bg-navy-900 text-white shadow-sm"
                      : "border border-navy-200 bg-surface text-navy-800 hover:bg-navy-50"
                  }`}
                >
                  {p + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="rounded-lg border border-navy-200 bg-surface px-3 py-1.5 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer"
              >
                अगला
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
