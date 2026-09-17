"use client";

import { useState } from "react";
import { Bi } from "@/components/bi";
import Link from "next/link";
import { api } from "@/trpc/react";

const REQUEST_TYPES = [
  { value: "GOVERNMENT_JOB", label: "Government Job" },
  { value: "EXAM_RESULT", label: "Exam / Result" },
  { value: "GOVERNMENT_SCHEME", label: "Government Scheme" },
  { value: "SCHOLARSHIP_EDUCATION", label: "Scholarship / Education" },
  { value: "GOVERNMENT_SERVICE", label: "Government Service" },
  { value: "INCORRECT_INFORMATION", label: "Incorrect Information" },
  { value: "BROKEN_LINK", label: "Broken Link" },
  { value: "ACCOUNT_LOGIN", label: "Account / Login" },
  { value: "TECHNICAL_ISSUE", label: "Technical Issue" },
  { value: "JOB_ALERT", label: "Job Alert" },
  { value: "FEEDBACK_SUGGESTION", label: "Feedback / Suggestion" },
  { value: "PRIVACY", label: "Privacy" },
  { value: "OTHER", label: "Other" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    requestType: "",
    subject: "",
    message: "",
    agreed: false,
  });

  const submit = api.contact.submit.useMutation({
    onSuccess: (data) => {
      if (data?.ticket) {
        setTicketId(data.ticket.ticketId);
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

    if (!form.agreed) {
      setError("Please accept the privacy consent");
      return;
    }

    submit.mutate({
      fullName: form.fullName,
      email: form.email,
      requestType: form.requestType,
      subject: form.subject,
      message: form.message,
      agreed: true as const,
    });
  };

  if (submitted) {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-leaf-300 bg-leaf-50 p-6">
          <h2 className="font-display text-xl font-bold text-leaf-800">Your request has been submitted successfully</h2>
          <div className="mt-4 space-y-2 text-sm text-leaf-900">
            <p><strong>Ticket ID:</strong> {ticketId}</p>
            <p><strong>Status:</strong> Received</p>
            <p><strong>Submitted:</strong> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <p className="mt-4 text-sm text-leaf-800">We will review your request and respond using the contact method provided.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/contact/status?ticketId=${ticketId}`} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">
              Track Request
            </Link>
            <Link href="/help" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">
              Back to Help Center
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Track Request Form */}
      <div className="rounded-xl border border-navy-100 bg-paper p-6">
        <h2 className="font-display text-xl font-bold text-navy-900">Track Your Request</h2>
        <p className="mt-1 text-sm text-ink-soft">Enter your Ticket ID to check the current status of your contact request.</p>
        <form onSubmit={(e) => { e.preventDefault(); setTrackingId(e.currentTarget.ticketId.value.trim()); }} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Ticket ID *</label>
            <input name="ticketId" required placeholder="e.g. ADD-CON-2026-000123" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
          </div>
          <button type="submit" className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">
            Track Status
          </button>
        </form>
        {trackingId && (
          <div className="mt-4">
            <Link href={`/contact/status?ticketId=${encodeURIComponent(trackingId)}`} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">
              View Full Status for {trackingId}
            </Link>
          </div>
        )}
      </div>

      {/* Contact Form */}
      <form className="space-y-8" onSubmit={handleSubmit}>
        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Contact Us</h2>
          <p className="mt-1 text-sm text-ink-soft">Have a question, found incorrect information, or need help? Send us a message and our team will get back to you.</p>
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
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email address" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
          </div>
        </section>

        {/* Request Details */}
        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Request Details</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Request Type *</label>
              <select required value={form.requestType} onChange={(e) => setForm({ ...form, requestType: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500">
                <option value="">Select a request type</option>
                {REQUEST_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Subject *</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Briefly describe your request" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Message *</label>
              <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Please describe your question, issue, feedback, or request." className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500 resize-y" />
              <p className="mt-1 text-[11px] text-ink-soft">Please do not include passwords, OTPs, PINs, banking credentials, or other sensitive information.</p>
            </div>
          </div>
        </section>

        {/* Consent */}
        <section>
          <label className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-paper p-4 text-sm font-semibold text-navy-900 cursor-pointer">
            <input type="checkbox" required checked={form.agreed} onChange={(e) => setForm({ ...form, agreed: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-saffron-600" />
            <span>I agree that APPZENO may use the information provided to respond to my request.</span>
          </label>
        </section>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

        {/* Submit */}
        <div className="flex flex-wrap gap-3 border-t border-navy-100 pt-6">
          <button type="submit" disabled={loading} className="rounded-xl bg-saffron-500 px-6 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
