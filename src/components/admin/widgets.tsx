"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export function StatCard({
  label,
  value,
  icon,
  sub,
  accent = "navy",
}: {
  label: ReactNode;
  value: number | string;
  icon: string;
  sub?: ReactNode;
  accent?: "navy" | "saffron" | "green" | "sky";
}) {
  const isNum = typeof value === "number";
  const [display, setDisplay] = useState<number | string>(isNum ? 0 : value);

  useEffect(() => {
    if (typeof value !== "number") {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1000;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const accents: Record<string, string> = {
    navy: "bg-navy-900 text-saffron-400",
    saffron: "bg-saffron-500 text-navy-950",
    green: "bg-leaf-500 text-white",
    sky: "bg-sky-500 text-white",
  };

  return (
    <div className="group rounded-xl border border-navy-100 bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <span className={`grid size-11 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${accents[accent]}`}>
          <Icon name={icon} size={20} />
        </span>
        {sub && (
          <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-extrabold text-navy-700 tnum">
            {sub}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-4xl font-bold leading-none tracking-tight text-navy-950 tnum">
        {typeof display === "number" ? display.toLocaleString("en-IN") : display}
      </p>
      <p className="mt-1.5 text-[13px] font-extrabold text-ink-soft">{label}</p>
    </div>
  );
}

export function BarsChart({
  series,
}: {
  series: { day: string; label: string; count: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((a, s) => a + s.count, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-ink-soft">
        <span>पिछले 14 दिन</span>
        <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-leaf-800 tnum">
          कुल {total.toLocaleString("en-IN")} क्लिक
        </span>
      </div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2">
        {series.map((s, i) => {
          const h = Math.max(4, (s.count / max) * 100);
          const isToday = i === series.length - 1;
          return (
            <div key={s.day} className="group/bar relative flex h-full flex-1 flex-col justify-end">
              <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy-950 px-2.5 py-1.5 text-[11px] font-extrabold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/bar:opacity-100 tnum">
                {s.label}: {s.count}
              </div>
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${
                  isToday
                    ? "bg-saffron-500 group-hover/bar:bg-saffron-400"
                    : "bg-navy-200 group-hover/bar:bg-navy-400"
                }`}
                style={{
                  height: mounted ? `${h}%` : "4%",
                  transitionDelay: `${i * 40}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wide text-ink-soft">
        <span>{series[0]?.label}</span>
        <span className="text-saffron-700">आज</span>
      </div>
    </div>
  );
}
