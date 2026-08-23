"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Preset = "today" | "yesterday" | "7d" | "30d" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

function getDateRange(preset: Preset): { from: string; to: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return {
        from: today.toISOString().slice(0, 10),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10),
      };
    case "yesterday": {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yesterday.toISOString().slice(0, 10),
        to: yesterday.toISOString().slice(0, 10),
      };
    }
    case "7d":
      return {
        from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10),
      };
    case "30d":
      return {
        from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10),
      };
    case "thisMonth":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10),
      };
    case "lastMonth": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: first.toISOString().slice(0, 10),
        to: last.toISOString().slice(0, 10),
      };
    }
    case "thisYear":
      return {
        from: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10),
      };
    case "custom":
      return null;
  }
}

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preset, setPreset] = useState<Preset>(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from && to) return "custom";
    return "today";
  });
  const [customFrom, setCustomFrom] = useState(() => searchParams.get("from") ?? "");
  const [customTo, setCustomTo] = useState(() => searchParams.get("to") ?? "");
  const [isPending, startTransition] = useTransition();

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === "custom") return;
    const range = getDateRange(p);
    if (range) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", range.from);
      params.set("to", range.to);
      startTransition(() => router.push(`?${params.toString()}`, { scroll: false }));
    }
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", customFrom);
    params.set("to", customTo);
    startTransition(() => router.push(`?${params.toString()}`, { scroll: false }));
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    startTransition(() => router.push(`?${params.toString()}`, { scroll: false }));
  };

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-navy-100 bg-surface p-3 shadow-sm">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Filter:</span>
      {[
        { key: "today", label: "Today" },
        { key: "yesterday", label: "Yesterday" },
        { key: "7d", label: "7D" },
        { key: "30d", label: "30D" },
        { key: "thisMonth", label: "This Month" },
        { key: "lastMonth", label: "Last Month" },
        { key: "thisYear", label: "This Year" },
        { key: "custom", label: "Custom" },
      ].map((btn) => (
        <button
          key={btn.key}
          onClick={() => applyPreset(btn.key as Preset)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            preset === btn.key
              ? "bg-navy-900 text-white shadow-sm"
              : "bg-navy-100 text-navy-800 hover:bg-navy-200"
          }`}
        >
          {btn.label}
        </button>
      ))}
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs font-semibold text-navy-900"
          />
          <span className="text-xs font-bold text-ink-soft">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs font-semibold text-navy-900"
          />
          <button
            onClick={applyCustom}
            disabled={!customFrom || !customTo || isPending}
            className="rounded-lg bg-saffron-500 px-3 py-1.5 text-xs font-bold text-navy-950 transition-all hover:bg-saffron-600 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}
      {(searchParams.get("from") || searchParams.get("to")) && (
        <button
          onClick={clearFilter}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
