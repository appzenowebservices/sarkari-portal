"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bi } from "@/components/bi";
import { TrackingTimeline } from "@/components/tracking-timeline";

type PrivacyRequest = {
  id: string;
  requestId: string;
  requestType: string;
  subject: string;
  status: string;
  priority: string;
  submittedAt: string;
  verifiedAt: string | null;
  reviewStartedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  resolution: string;
  rejectionReason: string;
  reply: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  RECEIVED: { label: "Received", color: "text-navy-800", bg: "bg-navy-100" },
  VERIFICATION_REQUIRED: { label: "Verification Required", color: "text-amber-800", bg: "bg-amber-100" },
  VERIFICATION_PENDING: { label: "Verification Pending", color: "text-amber-800", bg: "bg-amber-100" },
  VERIFIED: { label: "Verified", color: "text-sky-800", bg: "bg-sky-100" },
  UNDER_REVIEW: { label: "Under Review", color: "text-purple-800", bg: "bg-purple-100" },
  ADDITIONAL_INFORMATION_REQUIRED: { label: "Additional Information Required", color: "text-orange-800", bg: "bg-orange-100" },
  PROCESSING: { label: "Processing", color: "text-blue-800", bg: "bg-blue-100" },
  PARTIALLY_COMPLETED: { label: "Partially Completed", color: "text-teal-800", bg: "bg-teal-100" },
  COMPLETED: { label: "Completed", color: "text-leaf-800", bg: "bg-leaf-100" },
  REJECTED: { label: "Rejected", color: "text-rose-800", bg: "bg-rose-100" },
  CANCELLED: { label: "Cancelled", color: "text-slate-800", bg: "bg-slate-100" },
  CLOSED: { label: "Closed", color: "text-slate-800", bg: "bg-slate-100" },
};

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getVerificationStatus(status: string): "completed" | "active" | "upcoming" {
  if (["VERIFIED", "UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED", "PROCESSING", "PARTIALLY_COMPLETED", "COMPLETED", "CLOSED", "REJECTED", "CANCELLED"].includes(status)) return "completed";
  if (["RECEIVED", "VERIFICATION_REQUIRED", "VERIFICATION_PENDING"].includes(status)) return "active";
  return "upcoming";
}

function getReviewStatus(status: string): "completed" | "active" | "upcoming" {
  if (["UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED", "PROCESSING", "PARTIALLY_COMPLETED", "COMPLETED", "CLOSED", "REJECTED", "CANCELLED"].includes(status)) return "completed";
  if (["VERIFIED"].includes(status)) return "active";
  return "upcoming";
}

function getProcessingStatus(status: string): "completed" | "active" | "upcoming" {
  if (["PROCESSING", "PARTIALLY_COMPLETED", "COMPLETED", "CLOSED", "REJECTED", "CANCELLED"].includes(status)) return "completed";
  return "upcoming";
}

function getFinalStatus(status: string): "completed" | "active" | "upcoming" | "rejected" {
  if (status === "REJECTED") return "rejected";
  if (["COMPLETED", "CLOSED", "CANCELLED"].includes(status)) return "completed";
  return "upcoming";
}

export function PrivacyRequestStatusContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<PrivacyRequest | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!requestId) {
        setError("Request ID is required");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/privacy-request/status?requestId=${encodeURIComponent(requestId)}`);
        const data = (await res.json()) as { request?: PrivacyRequest; error?: string };
        if (res.ok && data.request) {
          setRequest(data.request);
        } else {
          setError(data.error || "Request not found");
        }
      } catch {
        setError("Failed to load request status");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [requestId]);

  const getSteps = (req: PrivacyRequest) => {
    const submitted = formatDate(req.submittedAt);
    const submittedTime = formatTime(req.submittedAt);
    const verified = formatDate(req.verifiedAt);
    const verifiedTime = formatTime(req.verifiedAt);
    const reviewed = formatDate(req.reviewStartedAt);
    const reviewedTime = formatTime(req.reviewStartedAt);
    const completed = formatDate(req.completedAt);
    const completedTime = formatTime(req.completedAt);
    const closed = formatDate(req.closedAt);
    const closedTime = formatTime(req.closedAt);

    const verificationStatus = getVerificationStatus(req.status);
    const reviewStatus = getReviewStatus(req.status);
    const processingStatus = getProcessingStatus(req.status);
    const finalStatus = getFinalStatus(req.status);
    const finalLabel = req.status === "REJECTED" ? "Rejected" : req.status === "CANCELLED" ? "Cancelled" : "Completed / Closed";

    return [
      {
        label: "Request Submitted",
        date: submitted,
        time: submittedTime,
        description: "Your privacy request has been submitted successfully.",
        status: "completed" as const,
      },
      {
        label: "Request Received",
        date: submitted,
        time: submittedTime,
        description: "We have received your privacy request.",
        status: "completed" as const,
      },
      {
        label: "Identity Verification",
        date: verificationStatus === "completed" ? (verified || reviewed || completed || closed) : verificationStatus === "active" ? submitted : null,
        time: verificationStatus === "completed" ? (verifiedTime || reviewedTime || completedTime || closedTime) : verificationStatus === "active" ? submittedTime || "In progress..." : null,
        description: verificationStatus === "completed" ? "Your identity has been verified." : verificationStatus === "active" ? "We are verifying your identity." : "Waiting for verification.",
        status: verificationStatus,
      },
      {
        label: "Privacy Team Review",
        date: reviewStatus === "completed" ? (reviewed || completed || closed) : reviewStatus === "active" ? verified || submitted : null,
        time: reviewStatus === "completed" ? (reviewedTime || completedTime || closedTime) : reviewStatus === "active" ? verifiedTime || submittedTime || "In progress..." : null,
        description: reviewStatus === "completed" ? "Our privacy team has reviewed your request." : reviewStatus === "active" ? "Our privacy team is reviewing your request." : "Waiting for review.",
        status: reviewStatus,
      },
      {
        label: "Request Processing",
        date: processingStatus === "completed" ? (completed || closed) : processingStatus === "active" ? reviewed || verified || submitted : null,
        time: processingStatus === "completed" ? (completedTime || closedTime) : processingStatus === "active" ? reviewedTime || verifiedTime || submittedTime || "In progress..." : null,
        description: processingStatus === "completed" ? "Your request is being processed." : processingStatus === "active" ? "Your request is currently being processed." : "Waiting for processing.",
        status: processingStatus,
      },
      {
        label: finalLabel,
        date: finalStatus === "completed" ? (closed || completed) : finalStatus === "rejected" ? (closed || completed || reviewed) : null,
        time: finalStatus === "completed" ? (closedTime || completedTime) : finalStatus === "rejected" ? (closedTime || completedTime || reviewedTime) : null,
        description: finalStatus === "completed" ? (req.status === "REJECTED" ? "Your privacy request has been rejected." : "Your privacy request has been completed.") : finalStatus === "rejected" ? "Your privacy request has been rejected." : "Waiting for completion.",
        status: finalStatus,
      },
    ];
  };

  const statusInfo = request ? STATUS_MAP[request.status] || { label: request.status, color: "text-navy-800", bg: "bg-navy-100" } : null;

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <span className="size-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-saffron-500" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mt-8 rounded-xl border border-rose-300 bg-rose-50 p-6">
        <h2 className="font-display text-xl font-bold text-rose-800">Request Not Found</h2>
        <p className="mt-2 text-sm text-rose-700">{error || "We could not find a privacy request with this Request ID."}</p>
        <a href="/privacy-request" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 cursor-pointer">
          Submit a New Request
        </a>
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
            <p className="mt-1 text-lg font-extrabold text-navy-900">{request.subject}</p>
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
            <p className="mt-0.5 text-sm font-extrabold text-navy-900">{request.requestId}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Request Type</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900">{request.requestType.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Submitted</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900">{formatDate(request.submittedAt) || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-soft">Priority</p>
            <p className="mt-0.5 text-sm font-extrabold text-navy-900 capitalize">{request.priority}</p>
          </div>
        </div>
      </div>

      {/* Flipkart-style Tracking Timeline */}
      <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-navy-900">Privacy Request Tracking</h3>
        <div className="mt-6">
          <TrackingTimeline steps={getSteps(request)} />
        </div>
      </div>

      {/* Reply from Admin */}
      {request.reply && (
        <div className="rounded-xl border border-leaf-300 bg-leaf-50 p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-leaf-900">Reply from Admin</h3>
          <p className="mt-2 text-sm text-leaf-800 whitespace-pre-wrap">{request.reply}</p>
        </div>
      )}

      {/* Resolution */}
      {(request.resolution || request.rejectionReason) && (
        <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-navy-900">Resolution</h3>
          {request.resolution && <p className="mt-2 text-sm text-ink">{request.resolution}</p>}
          {request.rejectionReason && <p className="mt-2 text-sm text-rose-700"><strong>Reason:</strong> {request.rejectionReason}</p>}
        </div>
      )}

      {/* Help */}
      <div className="rounded-xl border border-navy-100 bg-paper p-6">
        <h3 className="font-display text-lg font-bold text-navy-900">Need Help?</h3>
        <p className="mt-2 text-sm text-ink-soft">If you have questions about your privacy request, please contact us.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/privacy-request" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">New Privacy Request</a>
          <a href="/privacy-policy" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
