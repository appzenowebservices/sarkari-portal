"use client";

import { useEffect, useCallback, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-100 bg-surface px-5 py-4">
          <h3 className="font-display text-lg font-bold text-navy-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 cursor-pointer"
            aria-label="Close dialog"
          >
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-extrabold text-navy-900">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
        {hint && <span className="text-[11px] font-semibold text-ink-soft">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500";

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  desc?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-navy-100 bg-paper px-3 py-2.5 text-left transition-colors hover:border-navy-200 cursor-pointer"
      role="switch"
      aria-checked={checked}
    >
      <span>
        <span className="block text-[13px] font-extrabold text-navy-900">{label}</span>
        {desc && <span className="block text-[11px] font-semibold text-ink-soft">{desc}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-leaf-500" : "bg-navy-200"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function Toast({ message, kind }: { message: string; kind: "ok" | "err" }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div
        className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-2xl ${
          kind === "ok" ? "bg-leaf-600" : "bg-rose-600"
        }`}
      >
        <Icon name={kind === "ok" ? "check" : "alert"} size={16} />
        {message}
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "err" } | null>(null);

  const show = useCallback((message: string, kind: "ok" | "err" = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, show, node: toast ? <Toast message={toast.message} kind={toast.kind} /> : null };
}

export function DeleteButton({
  onConfirm,
  label = "हटाएं",
}: {
  onConfirm: () => void;
  label?: string;
}) {
  const [arming, setArming] = useState(false);

  useEffect(() => {
    if (!arming) return;
    const t = setTimeout(() => setArming(false), 2500);
    return () => clearTimeout(t);
  }, [arming]);

  return (
    <button
      type="button"
      onClick={() => {
        if (arming) {
          setArming(false);
          onConfirm();
        } else {
          setArming(true);
        }
      }}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
        arming
          ? "bg-rose-600 text-white"
          : "text-rose-600 hover:bg-rose-50"
      }`}
      title={label}
    >
      <Icon name="trash" size={14} />
      {arming ? "पक्का?" : ""}
    </button>
  );
}

export function Spinner() {
  return (
    <div className="grid place-items-center py-24">
      <span className="size-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-saffron-500" />
    </div>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-navy-200 py-14 text-center">
      <Icon name="inbox" size={34} className="text-navy-300" />
      <p className="mt-3 text-sm font-bold text-ink-soft">{text}</p>
    </div>
  );
}

export function SortTh({
  label,
  col,
  sortCol,
  sortDir,
  onClick,
  align = "left",
}: {
  label: string;
  col: string;
  sortCol: string | null;
  sortDir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "center" | "right";
}) {
  const active = sortCol === col;
  const alignCls = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return (
    <th
      className={`${alignCls} px-3 py-3 cursor-pointer select-none transition-colors hover:bg-navy-100/60`}
      onClick={onClick}
      title={active ? (sortDir === "asc" ? "Ascending" : "Descending") : "Sort"}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`inline-flex flex-col ${active ? "text-saffron-600" : "text-navy-300"}`}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 5L5 1L9 5" />
          </svg>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "-4px" }}>
            <path d="M1 1L5 5L9 1" />
          </svg>
        </span>
      </span>
    </th>
  );
}
