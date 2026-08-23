"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export function SlidePanel({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`relative flex h-full w-full flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          wide ? "sm:max-w-3xl" : "sm:max-w-2xl"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Fixed Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-navy-100 px-4 py-3 sm:px-6">
          <h3 className="font-display text-lg font-bold text-navy-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 cursor-pointer"
            aria-label="Close"
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="shrink-0 border-t border-navy-100 bg-surface px-4 py-3 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
