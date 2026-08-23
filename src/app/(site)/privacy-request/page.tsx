import { Metadata } from "next";
import { Bi } from "@/components/bi";
import { PrivacyRequestForm } from "@/components/privacy-request-form";
import { PrivacyRequestTrackBox } from "@/components/privacy-request-track-box";

export const metadata: Metadata = {
  title: "Privacy Request | APPZENO Sarkari Portal",
  description: "Submit a privacy request to APPZENO Sarkari Portal to request access, correction, deletion, consent withdrawal, or information about the processing of your personal data.",
};

export default function PrivacyRequestPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="गोपनीयता अनुरोध" en="Privacy Request" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Submit a privacy request to APPZENO Sarkari Portal</p>

      <PrivacyRequestTrackBox />

      <div className="mt-8">
        <PrivacyRequestForm />
      </div>

      <div className="mt-12 rounded-xl border border-navy-100 bg-paper p-6">
        <h3 className="font-display text-lg font-bold text-navy-900">Need more information?</h3>
        <p className="mt-2 text-sm text-ink-soft">Please review our privacy-related pages to understand how APPZENO Sarkari Portal collects and processes personal information.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/privacy-policy" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">Privacy Policy</a>
          <a href="/cookie-policy" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Cookie Policy</a>
          <a href="/cookie-preferences" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Cookie Settings</a>
          <a href="/terms-conditions" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Terms & Conditions</a>
        </div>
      </div>
    </div>
  );
}
