"use client";

import { Bi } from "@/components/bi";
import { TrackingTimeline } from "@/components/tracking-timeline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";

type Advertisement = {
  id: string;
  requestId: string;
  adTitle: string;
  adTypeCode: string;
  placementCode: string;
  durationDays: number;
  startDate: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  adminReply: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "text-navy-800", bg: "bg-navy-100" },
  SUBMITTED: { label: "Submitted", color: "text-sky-800", bg: "bg-sky-100" },
  PAYMENT_PENDING: { label: "Payment Pending", color: "text-amber-800", bg: "bg-amber-100" },
  PAYMENT_VERIFICATION: { label: "Payment Verification", color: "text-purple-800", bg: "bg-purple-100" },
  CONTENT_REVIEW: { label: "Content Review", color: "text-blue-800", bg: "bg-blue-100" },
  CREATIVE_REVIEW: { label: "Creative Review", color: "text-indigo-800", bg: "bg-indigo-100" },
  APPROVED: { label: "Approved", color: "text-leaf-800", bg: "bg-leaf-100" },
  SCHEDULED: { label: "Scheduled", color: "text-teal-800", bg: "bg-teal-100" },
  LIVE: { label: "Live", color: "text-emerald-800", bg: "bg-emerald-100" },
  PAUSED: { label: "Paused", color: "text-orange-800", bg: "bg-orange-100" },
  EXPIRED: { label: "Expired", color: "text-slate-800", bg: "bg-slate-100" },
  REJECTED: { label: "Rejected", color: "text-rose-800", bg: "bg-rose-100" },
  CANCELLED: { label: "Cancelled", color: "text-slate-800", bg: "bg-slate-100" },
};

function formatDate(date: string | Date | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string | Date | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function AdvertiseStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const {
    data: ad,
    isLoading: queryLoading,
    error: queryError,
  } = api.ads.advertisementStatus.useQuery(
    { requestId: requestId ?? "" },
    { enabled: !!requestId }
  );

  const loading = !!requestId && queryLoading;
  const error = !requestId
    ? ""
    : queryError
      ? queryError.message || "Advertisement not found"
      : !queryLoading && !ad
        ? "Advertisement not found"
        : "";

  const handleTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = e.currentTarget.requestId.value.trim();
    if (id) {
      router.push(`/advertise/status?requestId=${encodeURIComponent(id)}`);
    }
  };

  const getSteps = (item: NonNullable<typeof ad>) => {
    const submitted = formatDate(item.createdAt);
    const submittedTime = formatTime(item.createdAt);
    const updated = formatDate(item.updatedAt);
    const updatedTime = formatTime(item.updatedAt);

    const paymentStatus = item.paymentStatus;
    const isPaymentPending = paymentStatus === "PENDING";
    const isPaymentVerified = paymentStatus === "PAID" || paymentStatus === "VERIFIED";
    const isPaymentFailed = paymentStatus === "FAILED" || paymentStatus === "REJECTED";

    const adStatus = item.status;
    const isUnderReview = ["CONTENT_REVIEW", "CREATIVE_REVIEW"].includes(adStatus);
    const isApproved = ["APPROVED", "SCHEDULED", "LIVE", "PAUSED"].includes(adStatus);
    const isLive = adStatus === "LIVE";
    const isRejected = adStatus === "REJECTED";

    const steps: { label: string; date: string | null; time: string | null; description: string; status: "completed" | "active" | "upcoming" | "rejected" }[] = [
      { label: "Request Submitted", date: submitted, time: submittedTime, description: "Your advertisement request has been submitted.", status: "completed" },
      { label: "Payment Pending", date: isPaymentPending ? submitted : isPaymentVerified ? submitted : null, time: isPaymentPending ? submittedTime : isPaymentVerified ? submittedTime : null, description: isPaymentPending ? "Waiting for payment." : isPaymentVerified ? "Payment completed." : "Payment failed.", status: isPaymentPending ? "active" : isPaymentVerified ? "completed" : "rejected" },
      { label: "Payment Verification", date: isPaymentVerified ? (updated || submitted) : null, time: isPaymentVerified ? (updatedTime || submittedTime) : null, description: isPaymentVerified ? "Payment has been verified." : isPaymentFailed ? "Payment verification failed." : "Waiting for payment verification.", status: isPaymentVerified ? "completed" : isPaymentFailed ? "rejected" : "upcoming" },
      { label: "Content Review", date: isUnderReview || isApproved || isLive ? (updated || submitted) : null, time: isUnderReview || isApproved || isLive ? (updatedTime || submittedTime) : null, description: isUnderReview ? "Our team is reviewing your advertisement content." : isApproved || isLive ? "Content has been approved." : "Waiting for content review.", status: isUnderReview ? "active" : isApproved || isLive ? "completed" : "upcoming" },
      { label: isRejected ? "Rejected" : "Approved", date: isApproved || isLive || isRejected ? (updated || submitted) : null, time: isApproved || isLive || isRejected ? (updatedTime || submittedTime) : null, description: isRejected ? (item.rejectionReason || "Your advertisement has been rejected.") : isLive ? "Your advertisement is now live!" : isApproved ? "Your advertisement has been approved." : "Waiting for approval.", status: isRejected ? "rejected" : isApproved || isLive ? "completed" : "upcoming" },
    ];

    return steps;
  };

  const statusInfo = ad ? STATUS_MAP[ad.status] || { label: ad.status, color: "text-navy-800", bg: "bg-navy-100" } : null;

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <span className="size-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-saffron-500" />
      </div>
    );
  }

  if (!requestId) {
    return (
      <div className="mt-8 rounded-xl border border-navy-100 bg-paper p-6">
        <h2 className="font-display text-xl font-bold text-navy-900">Track Your Advertisement</h2>
        <p className="mt-1 text-sm text-ink-soft">Enter your Advertisement Request ID to check the current status.</p>
        <form onSubmit={handleTrack} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Request ID *</label>
            <input name="requestId" required placeholder="e.g. ADD-ADS-2026-000123" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
          </div>
          <button type="submit" className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">
            Track Status
          </button>
        </form>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="mt-8 rounded-xl border border-rose-300 bg-rose-50 p-6">
        <h2 className="font-display text-xl font-bold text-rose-800">Advertisement Not Found</h2>
        <p className="mt-2 text-sm text-rose-700">{error || "We could not find this advertisement request."}</p>
        <Link href="/advertise" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 cursor-pointer">
          New Advertisement
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Status Card */}
      <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Current Status</p>
            <p className="mt-1 text-lg font-extrabold text-navy-900">{ad.adTitle}</p>
          </div>
          {statusInfo && (
            <span className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-ink-soft">Request ID</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900">{ad.requestId}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Amount</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900">₹{ad.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Payment Status</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900 capitalize">{ad.paymentStatus.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Ad Status</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900 capitalize">{ad.status.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Submitted</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900">{formatDate(ad.createdAt) || "—"}</p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-navy-900">Advertisement Tracking</h3>
        <div className="mt-6">
          <TrackingTimeline steps={getSteps(ad)} />
        </div>
      </div>

      {/* Admin Reply */}
      {ad.adminReply && (
        <div className="rounded-xl border border-leaf-300 bg-leaf-50 p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-leaf-900">Message from Admin</h3>
          <p className="mt-2 text-sm text-leaf-800 whitespace-pre-wrap">{ad.adminReply}</p>
        </div>
      )}

      {/* Rejection Reason */}
      {ad.rejectionReason && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-rose-900">Rejection Reason</h3>
          <p className="mt-2 text-sm text-rose-800">{ad.rejectionReason}</p>
        </div>
      )}

      {/* Help */}
      <div className="rounded-xl border border-navy-100 bg-paper p-6">
        <h3 className="font-display text-lg font-bold text-navy-900">Need Help?</h3>
        <p className="mt-2 text-sm text-ink-soft">If you have questions about your advertisement, please reach out to us.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/advertise" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">New Advertisement</Link>
          <Link href="/help" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Help Center</Link>
        </div>
      </div>
    </div>
  );
}
