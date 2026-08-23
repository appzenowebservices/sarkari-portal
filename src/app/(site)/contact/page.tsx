import { Metadata } from "next";
import { Bi } from "@/components/bi";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | APPZENO Sarkari Portal",
  description: "Contact APPZENO Sarkari Portal for help with government jobs, exams, results, schemes, services, and more.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="संपर्क करें" en="Contact Us" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Have a question, found incorrect information, or need help? Send us a message and our team will get back to you.</p>

      <ContactForm />

      <div className="mt-12 rounded-xl border border-navy-100 bg-paper p-6">
        <h3 className="font-display text-lg font-bold text-navy-900">Need more help?</h3>
        <p className="mt-2 text-sm text-ink-soft">Please review our Help Center for answers to common questions.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/help" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer">Help Center</a>
          <a href="/privacy-request" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Privacy Request</a>
        </div>
      </div>
    </div>
  );
}
