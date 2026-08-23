"use client";

import { ReactNode } from "react";

type TrackingStep = {
  label: string;
  date: string | null;
  time: string | null;
  description: string;
  status: "completed" | "active" | "upcoming" | "rejected";
};

type TrackingTimelineProps = {
  steps: TrackingStep[];
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function DotIcon() {
  return <span className="block size-2.5 rounded-full bg-current" />;
}

export function TrackingTimeline({ steps }: TrackingTimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === "completed";
        const isActive = step.status === "active";
        const isRejected = step.status === "rejected";

        return (
          <div key={index} className="relative flex gap-4 pb-5">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[19px] top-[44px] h-[calc(100%-28px)] w-[2px]">
                <div className={`h-full w-full ${isRejected ? "bg-rose-400" : isCompleted ? "bg-leaf-500" : "bg-navy-200"}`} />
              </div>
            )}

            {/* Icon circle */}
            <div
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 ${
                isRejected
                  ? "border-rose-500 bg-rose-500 text-white"
                  : isCompleted
                  ? "border-leaf-500 bg-leaf-500 text-white"
                  : isActive
                  ? "border-saffron-500 bg-saffron-50 text-saffron-600"
                  : "border-navy-200 bg-navy-50 text-navy-300"
              }`}
            >
              {isRejected ? <CrossIcon /> : isCompleted ? <CheckIcon /> : <DotIcon />}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p
                  className={`text-sm font-extrabold ${
                    isRejected
                      ? "text-rose-700"
                      : isCompleted
                      ? "text-navy-900"
                      : isActive
                      ? "text-saffron-700"
                      : "text-ink-soft"
                  }`}
                >
                  {step.label}
                </p>
                {step.date && (
                  <span className={`text-xs font-semibold ${isRejected || isCompleted || isActive ? "text-ink-soft" : "text-navy-300"}`}>
                    {step.date}
                  </span>
                )}
              </div>

              {step.description && (
                <p className={`mt-1 text-xs ${isRejected || isCompleted || isActive ? "text-ink" : "text-navy-300"}`}>
                  {step.description}
                </p>
              )}

              {step.time && (
                <p className={`mt-0.5 text-[11px] font-semibold ${isRejected || isCompleted || isActive ? "text-ink-soft" : "text-navy-300"}`}>
                  {step.time}
                </p>
              )}

              {isActive && !step.time && (
                <p className="mt-0.5 text-[11px] font-semibold text-saffron-600">In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
