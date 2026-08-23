"use client";

import { useMemo, useState } from "react";

const PAGE_SIZES = [10, 20, 50, 100, 200] as const;
type PageSize = typeof PAGE_SIZES[number] | "all";

type Props<T> = {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyText?: string;
  header?: React.ReactNode;
};

export function AdminTable<T>({ data, renderRow, emptyText = "कोई डेटा नहीं", header }: Props<T>) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = pageSize === "all" ? data : data.slice(page * pageSize, (page + 1) * pageSize);
  const startIndex = pageSize === "all" ? 0 : page * pageSize;

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-navy-100 bg-surface shadow-sm">
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-bold text-ink-soft">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          {header && <thead className="border-b border-navy-100 bg-navy-50/60 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">{header}</thead>}
          <tbody className="divide-y divide-navy-50">{pageData.map((item, i) => renderRow(item, startIndex + i))}</tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 bg-paper px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-soft">दिखाएं:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(e.target.value === "all" ? "all" : Number(e.target.value) as PageSize); setPage(0); }}
            className="rounded-lg border-2 border-navy-100 bg-surface px-2.5 py-1.5 text-xs font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
          >
            {PAGE_SIZES.map((sz) => (
              <option key={sz} value={sz}>{sz} / पेज</option>
            ))}
            <option value="all">सभी दिखाएं</option>
          </select>
        </div>

        {pageSize !== "all" && totalPages > 1 && (
          <>
            <p className="text-xs font-semibold text-ink-soft tnum">
              {data.length} में से {startIndex + 1}–{Math.min(startIndex + pageSize, data.length)} दिखा रहे हैं
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-navy-200 bg-surface px-2.5 py-1.5 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer"
              >
                पिछला
              </button>
              {generatePageButtons(page, totalPages, setPage)}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="rounded-lg border border-navy-200 bg-surface px-2.5 py-1.5 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer"
              >
                अगला
              </button>
            </div>
          </>
        )}

        {pageSize === "all" && (
          <p className="text-xs font-semibold text-ink-soft tnum">
            सभी {data.length} रेकॉर्ड दिखा रहे हैं
          </p>
        )}
      </div>
    </div>
  );
}

function generatePageButtons(current: number, total: number, onChange: (p: number) => void): React.ReactNode[] {
  const buttons: React.ReactNode[] = [];
  const maxVisible = 7;

  if (total <= maxVisible + 2) {
    for (let i = 0; i < total; i++) buttons.push(renderPageBtn(i, current, onChange));
    return buttons;
  }

  buttons.push(renderPageBtn(0, current, onChange));

  let start = Math.max(1, current - 1);
  let end = Math.min(total - 2, current + 1);

  if (current <= 2) { start = 1; end = 3; }
  if (current >= total - 3) { start = total - 4; end = total - 2; }

  if (start > 1) buttons.push(<span key="e1" className="px-1 text-navy-400">…</span>);
  for (let i = start; i <= end; i++) buttons.push(renderPageBtn(i, current, onChange));
  if (end < total - 2) buttons.push(<span key="e2" className="px-1 text-navy-400">…</span>);

  buttons.push(renderPageBtn(total - 1, current, onChange));
  return buttons;
}

function renderPageBtn(p: number, current: number, onChange: (p: number) => void) {
  return (
    <button
      key={p}
      type="button"
      onClick={() => onChange(p)}
      className={`grid size-8 place-items-center rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
        p === current ? "bg-navy-900 text-white shadow-sm" : "border border-navy-200 bg-surface text-navy-800 hover:bg-navy-50"
      }`}
    >
      {p + 1}
    </button>
  );
}
