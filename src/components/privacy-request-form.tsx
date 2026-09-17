"use client";

import { useState } from "react";
import { Bi } from "@/components/bi";
import Link from "next/link";
import { api } from "@/trpc/react";

type RequestType = "ACCESS" | "CORRECTION" | "DELETION" | "CONSENT_WITHDRAWAL" | "COMMUNICATION_PREFERENCES" | "COOKIE_REQUEST" | "PROCESSING_INFORMATION" | "PRIVACY_COMPLAINT" | "SECURITY_CONCERN" | "OTHER";

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: "ACCESS", label: "Access My Personal Information" },
  { value: "CORRECTION", label: "Correct My Personal Information" },
  { value: "DELETION", label: "Delete My Account / Personal Information" },
  { value: "CONSENT_WITHDRAWAL", label: "Withdraw Consent" },
  { value: "COMMUNICATION_PREFERENCES", label: "Manage Communication Preferences" },
  { value: "COOKIE_REQUEST", label: "Cookie / Tracking Preference" },
  { value: "PROCESSING_INFORMATION", label: "Information About Data Processing" },
  { value: "PRIVACY_COMPLAINT", label: "Privacy Complaint / Grievance" },
  { value: "SECURITY_CONCERN", label: "Report a Privacy or Security Concern" },
  { value: "OTHER", label: "Other Privacy Request" },
];

export function PrivacyRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    requestType: "",
    fullName: "",
    email: "",
    mobile: "",
    accountId: "",
    subject: "",
    description: "",
    verificationMethod: "email",
  });

  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);

  const submit = api.privacy.submit.useMutation({
    onSuccess: (data) => {
      if (data?.requestId) {
        setRequestId(data.requestId);
        setSubmitted(true);
      } else {
        setError("Failed to submit request");
      }
    },
    onError: (err) => {
      setError(err.message || "Failed to submit request");
    },
  });
  const loading = submit.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed1 || !agreed2) {
      setError("Please accept both authorization declarations");
      return;
    }

    submit.mutate({
      requestType: form.requestType,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      accountId: form.accountId,
      subject: form.subject,
      description: form.description,
      verificationMethod: form.verificationMethod,
    });
  };

  if (submitted) {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-leaf-300 bg-leaf-50 p-6">
          <h2 className="font-display text-xl font-bold text-leaf-800">Your privacy request has been submitted successfully</h2>
          <div className="mt-4 space-y-2 text-sm text-leaf-900">
            <p><strong>Request ID:</strong> {requestId}</p>
            <p><strong>Status:</strong> Received</p>
            <p><strong>Submitted:</strong> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <p className="mt-4 text-sm text-leaf-800">We will review your request and respond using the contact method provided. You may be contacted for additional verification if required.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/privacy-request/status?requestId=${requestId}`} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">
              Check Request Status
            </Link>
            <button type="button" onClick={() => { setSubmitted(false); setRequestId(""); }} className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Request Type */}
        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Submit a Privacy Request</h2>
          <p className="mt-1 text-sm text-ink-soft">Select the type of request you want to submit.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {REQUEST_TYPES.map((rt) => (
              <label key={rt.value} className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-sm font-bold transition-all cursor-pointer ${form.requestType === rt.value ? "border-saffron-500 bg-saffron-50 text-saffron-900" : "border-navy-100 bg-paper text-navy-900 hover:border-navy-200"}`}>
                <input type="radio" name="requestType" value={rt.value} required className="h-4 w-4 accent-saffron-600" onChange={(e) => setForm({ ...form, requestType: e.target.value })} />
                {rt.label}
              </label>
            ))}
          </div>
        </section>

        {/* Your Information */}
        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Your Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Full Name *</label>
              <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Enter your full name" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Email Address *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter the email associated with your APPZENO account" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
              <p className="mt-1 text-[11px] text-ink-soft">Please use the email address associated with your APPZENO account where possible.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Mobile Number</label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-lg border-2 border-navy-100 bg-paper px-3 text-sm font-bold text-ink-soft">+91</span>
                <input type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="Enter your registered mobile number" className="flex-1 rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">APPZENO User ID</label>
              <input type="text" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} placeholder="e.g. ADD-USER-00001234" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
              <p className="mt-1 text-[11px] text-ink-soft">Optional. If logged in, this may be auto-populated.</p>
            </div>
          </div>
        </section>

        {/* Request Details */}
        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Request Details</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Subject *</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Briefly describe your privacy request" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Request Description *</label>
              <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please provide details about your request. Do not include passwords, OTPs, UPI PINs, banking passwords, or other authentication secrets." className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500 resize-y" />
              <p className="mt-1 text-[11px] text-ink-soft">Please provide enough information for us to understand and process your request. Do not include unnecessary sensitive personal information.</p>
            </div>
          </div>
        </section>

        {/* Authorization */}
        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Authorization Declaration</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-paper p-4 text-sm font-semibold text-navy-900 cursor-pointer">
              <input type="checkbox" required checked={agreed1} onChange={(e) => setAgreed1(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-saffron-600" />
              <span>I confirm that the information provided in this request is accurate to the best of my knowledge and that I am submitting this request regarding my own personal information, or I am authorized to act on behalf of the relevant individual.</span>
            </label>
            <label className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-paper p-4 text-sm font-semibold text-navy-900 cursor-pointer">
              <input type="checkbox" required checked={agreed2} onChange={(e) => setAgreed2(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-saffron-600" />
              <span>I understand that APPZENO may use the information provided in this form to verify, investigate, process, and respond to my privacy request. I understand that additional verification may be required before my request can be completed.</span>
            </label>
          </div>
        </section>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

        {/* Submit */}
        <div className="flex flex-wrap gap-3 border-t border-navy-100 pt-6">
          <button type="submit" disabled={loading} className="rounded-xl bg-saffron-500 px-6 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
            {loading ? "Submitting..." : "Submit Privacy Request"}
          </button>
        </div>
      </form>
  );
}
