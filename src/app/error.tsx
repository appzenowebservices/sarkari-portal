"use client";

import Link from "next/link";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="tricolor-strip h-[3px] w-full" aria-hidden />

      <main className="mx-auto flex-1 max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <span
              className="grid size-24 sm:size-28 place-items-center rounded-full bg-navy-50 text-navy-300"
              aria-hidden
            >
              <Icon name="alert" size={56} strokeWidth={1.4} />
            </span>
            <div className="absolute -bottom-1 right-2 text-6xl font-display font-extrabold text-navy-900 opacity-10 select-none">
              !
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">
            <Bi hi="कुछ गड़बड़ हो गया" en="Something Went Wrong" />
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
            <Bi
              hi="आम बातौर पर, एक अनपेक्षित त्रुटि हो गई। कृपया पुनः प्रयास करें या होम पे लौटें।"
              en="An unexpected error occurred. Please try again or return to the home page."
            />
          </p>

          {process.env.NODE_ENV === "development" && error?.message && (
            <details className="mt-6 max-w-md text-left">
              <summary className="cursor-pointer text-sm font-semibold text-navy-600">
                Error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-xs text-navy-500">
                {error.message}
              </pre>
            </details>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 px-6 py-3 font-display text-sm font-bold text-white transition-all duration-200 hover:bg-navy-700 active:scale-95"
            >
              <Icon name="sparkles" size={16} />
              <Bi hi="फिर कोशिश करें" en="Try Again" />
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-surface px-6 py-3 font-display text-sm font-bold text-navy-800 transition-all duration-200 hover:bg-navy-50 active:scale-95"
            >
              <Icon name="home" size={16} />
              <Bi hi="होम पर वापस जाएं" en="Back to Home" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-navy-100 bg-surface py-4">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-ink-soft sm:px-6">
          <Bi
            hi="© सभी अधिकार सुरक्षित हैं"
            en="© All Rights Reserved"
          />
        </div>
      </footer>
    </div>
  );
}
