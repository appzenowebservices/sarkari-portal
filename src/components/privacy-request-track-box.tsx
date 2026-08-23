"use client";

import { useState } from "react";
import Link from "next/link";

export function PrivacyRequestTrackBox() {
  const [trackingId, setTrackingId] = useState("");

  return (
    <div className="mt-8 rounded-xl border border-navy-100 bg-paper p-6">
      <h2 className="font-display text-xl font-bold text-navy-900">Track Your Request</h2>
      <p className="mt-1 text-sm text-ink-soft">Enter your Request ID to check the current status of your privacy request.</p>
      <form onSubmit={(e) => { e.preventDefault(); setTrackingId(e.currentTarget.requestId.value.trim()); }} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Request ID *</label>
          <input name="requestId" required placeholder="e.g. PR-2026-000123" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
        </div>
        <button type="submit" className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">
          Track Status
        </button>
      </form>
      {trackingId && (
        <div className="mt-4">
          <Link href={`/privacy-request/status?requestId=${encodeURIComponent(trackingId)}`} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">
            View Full Status for {trackingId}
          </Link>
        </div>
      )}
    </div>
  );
}
