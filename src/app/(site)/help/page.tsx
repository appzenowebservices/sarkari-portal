import { Metadata } from "next";
import { Bi } from "@/components/bi";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help & Support | APPZENO Sarkari Portal",
  description: "Get help using APPZENO Sarkari Portal. Find answers about government jobs, exams, admit cards, results, schemes, scholarships, documents, services, accounts, alerts, and privacy.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="सहायता और समर्थन" en="Help & Support" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Get help using APPZENO Sarkari Portal</p>

      {/* Search Help */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-navy-900">How Can We Help You?</h2>
        <p className="mt-1 text-sm text-ink-soft">Search your question or problem...</p>
        <div className="mt-4 flex items-center rounded-xl border-2 border-navy-100 bg-surface transition-colors focus-within:border-saffron-500">
          <span className="pl-3.5 text-navy-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-400"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
          </span>
          <input
            placeholder="Search your question or problem..."
            className="w-full bg-transparent px-3 py-3 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-ink-soft/60"
          />
        </div>
        <p className="mt-2 text-xs text-ink-soft">Examples: How can I search for government jobs? How can I download an admit card? How can I save a job?</p>
      </div>

      {/* Quick Help Cards */}
      <div className="mt-10">
  <h2 className="font-display text-xl font-bold text-navy-900">
    Quick Help
  </h2>

  <div className="mt-4 grid gap-3 sm:grid-cols-4">
    {[
      { icon: "briefcase", label: "Government Jobs", hi: "सरकारी नौकरियां" },
      { icon: "fileText", label: "Exams & Results", hi: "परीक्षा और परिणाम" },
      { icon: "landmark", label: "Government Schemes", hi: "सरकारी योजनाएं" },
      { icon: "gift", label: "Farmer Services", hi: "किसान सेवाएं" },
      { icon: "sparkles", label: "Education & Scholarships", hi: "शिक्षा और छात्रवृत्ति" },
      { icon: "fileText", label: "Documents & Certificates", hi: "दस्तावेज और प्रमाणपत्र" },
      { icon: "globe", label: "Government Services", hi: "सरकारी सेवाएं" },
      { icon: "users", label: "Account & Login", hi: "खाता और लॉगिन" },
    ].map((item) => (
      <div
        key={item.label}
        className="flex items-center gap-3 rounded-xl border border-navy-100 bg-paper p-4"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-700">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </span>

        <div>
          <p className="text-sm font-extrabold text-navy-900">
            {item.label}
          </p>
          <p className="text-xs text-ink-soft">
            {item.hi}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Getting Started */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Getting Started</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">How does APPZENO Sarkari Portal work?</h3>
        <p className="mt-2 text-sm text-ink">APPZENO helps you <strong>discover government-related information and official links</strong> from one place.</p>
        <div className="mt-4 rounded-xl border border-navy-100 bg-paper p-4">
          <p className="text-sm font-mono text-navy-800">
            Search → Find Information → Read Details → Verify Official Source → Visit Official Website → Apply / Register / Download / Check Status
          </p>
        </div>
        <p className="mt-3 text-sm text-ink"><strong>Important:</strong> APPZENO is an <strong>independent information platform</strong>. It does not replace the relevant government department's official website or notification.</p>
      </section>

      {/* Government Jobs Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Government Jobs Help</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">How do I find a government job?</h3>
        <p className="mt-2 text-sm text-ink">Go to <strong>Government Jobs</strong> and filter by qualification, state, department, organization, job category, employment type, application status, or last date.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">How do I apply for a government job?</h3>
        <p className="mt-2 text-sm text-ink">Open the relevant job notification and review eligibility, vacancy details, age limit, application dates, application fee, required documents, and selection process. Then use the official application link where available.</p>
        <p className="mt-2 text-sm text-ink"><strong>Important:</strong> Always verify the application deadline and eligibility from the <strong>official recruitment notification</strong> before submitting your application.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">Does APPZENO guarantee a government job?</h3>
        <p className="mt-2 text-sm text-ink"><strong>No.</strong> APPZENO only provides information and links. Selection is entirely controlled by the relevant recruitment authority.</p>
      </section>

      {/* Exams & Results Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Exams & Results Help</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">Where can I find admit cards?</h3>
        <p className="mt-2 text-sm text-ink">Go to <strong>Exams & Results → Admit Cards</strong> or use the global search.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">Where can I find results?</h3>
        <p className="mt-2 text-sm text-ink">Go to <strong>Exams & Results → Results</strong>. You can search by examination, organization, department, state, or year.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">Can APPZENO issue my admit card?</h3>
        <p className="mt-2 text-sm text-ink">Generally, <strong>no</strong>. APPZENO may provide an official download link. The actual admit card is normally issued by the relevant examination authority.</p>
      </section>

      {/* Government Schemes Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Government Schemes Help</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">How can I find a government scheme?</h3>
        <p className="mt-2 text-sm text-ink">Go to <strong>Government Schemes</strong> and browse by beneficiary (farmers, students, women, youth, senior citizens, workers, businesses) or purpose (education, employment, health, housing, agriculture, pension, financial assistance).</p>

        <h3 className="mt-4 font-extrabold text-navy-900">Can APPZENO guarantee that I will receive scheme benefits?</h3>
        <p className="mt-2 text-sm text-ink"><strong>No.</strong> The relevant government department determines eligibility and approval.</p>
      </section>

      {/* Farmer Services Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Farmer Services Help</h2>
        <p className="mt-2 text-sm text-ink">Use <strong>Farmer Services</strong> to discover information related to PM-Kisan, agriculture schemes, crop insurance, Kisan Credit Card, soil health, subsidies, farmer registration, and mandi services. Always verify eligibility and application requirements on the relevant official portal.</p>
      </section>

      {/* Education & Scholarships Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Education & Scholarships Help</h2>
        <p className="mt-2 text-sm text-ink">You can find scholarships, admissions, entrance examinations, fellowships, student schemes, education loans, university admissions, and state scholarships. Go to <strong>Education & Scholarships</strong>.</p>
      </section>

      {/* Documents & Certificates Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Documents & Certificates Help</h2>
        <p className="mt-2 text-sm text-ink">APPZENO may help you discover official information and application links for Aadhaar, PAN, Voter ID, Driving Licence, Passport, Ration Card, Birth Certificate, Death Certificate, Income Certificate, Caste Certificate, Domicile Certificate, EWS Certificate, and Disability Certificate.</p>
        <p className="mt-2 text-sm text-ink"><strong>Important:</strong> APPZENO does not automatically issue government documents unless a specific service expressly states otherwise.</p>
      </section>

      {/* Government Services Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Government Services Help</h2>
        <p className="mt-2 text-sm text-ink">Go to <strong>Government Services</strong> to search for services relating to Aadhaar, PAN, voter services, driving licence, passport, vehicles, electricity, water, gas, tax, pension, health, police, municipal services, and land and property.</p>
      </section>

      {/* Search Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Search Help</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">How do I search?</h3>
        <p className="mt-2 text-sm text-ink">Use the search box in the header. You can search terms such as:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink">
          <li>UP Police</li>
          <li>PM Kisan</li>
          <li>Aadhaar</li>
          <li>SSC</li>
          <li>Scholarship</li>
          <li>Income Certificate</li>
        </ul>
        <p className="mt-2 text-sm text-ink">The search system may return relevant jobs, exams, results, schemes, services, documents, and official links.</p>
      </section>

      {/* Saved Jobs & Services */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Saved Jobs & Services</h2>
        <p className="mt-2 text-sm text-ink">If account functionality is enabled, you can save useful information for later. You may be able to save jobs, schemes, services, exams, and results.</p>
        <p className="mt-2 text-sm text-ink"><strong>How to save?</strong> Open the relevant page, select <strong>Save</strong> or <strong>Bookmark</strong>, sign in if required, and access saved items from <strong>My Account</strong>.</p>
      </section>

      {/* Job Alerts & Notifications */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Job Alerts & Notifications</h2>
        <p className="mt-2 text-sm text-ink">If notifications are available, users can configure alerts based on preferences such as state, qualification, job category, and department. You may receive relevant notifications when matching updates become available.</p>
        <p className="mt-2 text-sm text-ink"><strong>Manage alerts:</strong> My Account → Job Alerts</p>
      </section>

      {/* Account & Login */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Account & Login</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">How can I create an account?</h3>
        <p className="mt-2 text-sm text-ink">Select <strong>Login / Register → Create Account</strong> and provide the information requested by the registration form.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">Can I login using Google?</h3>
        <p className="mt-2 text-ink text-sm">If Google Login is enabled, select <strong>Login → Continue with Google</strong>. Google authentication may allow you to sign in without creating a separate APPZENO password. APPZENO does not receive your Google password through standard Google authentication.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">I forgot my password</h3>
        <p className="mt-2 text-sm text-ink">Select <strong>Login → Forgot Password</strong> and follow the password-reset instructions.</p>

        <h3 className="mt-4 font-extrabold text-navy-900">How can I change my profile information?</h3>
        <p className="mt-2 text-sm text-ink">Go to <strong>My Account → Profile</strong>. Depending on the field, you may be able to update name, mobile number, email, language, notification preferences, and job preferences.</p>
      </section>

      {/* Account Security */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Account Security</h2>
        <p className="mt-2 text-sm text-ink">Never share your password, OTP, UPI PIN, ATM PIN, banking password, or authentication code with anyone claiming to represent APPZENO. APPZENO will not ask for these through ordinary support channels.</p>
      </section>

      {/* Official Government Links */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Official Government Links</h2>
        <h3 className="mt-4 font-extrabold text-navy-900">How do I know whether a link is official?</h3>
        <p className="mt-2 text-sm text-ink">Where possible, APPZENO identifies links leading to official government sources. However, always verify website domain, government department, official notification, and application page before submitting personal information or making a payment.</p>
      </section>

      {/* Application & Payment Safety */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Application & Payment Safety</h2>
        <p className="mt-2 text-sm text-ink">Before making a payment:</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-ink">
          <li>Verify the website.</li>
          <li>Verify the department.</li>
          <li>Verify the application.</li>
          <li>Verify the official fee.</li>
          <li>Keep the payment receipt.</li>
        </ol>
        <p className="mt-2 text-sm text-ink">Do not make payments to individuals simply because someone claims to represent a government department or APPZENO.</p>
      </section>

      {/* Mobile & PWA Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Mobile & PWA Help</h2>
        <p className="mt-2 text-sm text-ink">APPZENO is designed to work across desktop, laptop, tablet, mobile, and supported PWA environments. For the best experience, keep your browser updated, enable notifications if you want alerts, allow required browser permissions, and keep your internet connection stable.</p>
      </section>

      {/* Cookie Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Cookie Help</h2>
        <p className="mt-2 text-sm text-ink">APPZENO uses cookies and similar technologies for functionality, preferences, analytics, and where applicable, advertising. You can manage optional cookie preferences from <Link href="/cookie-preferences" className="text-saffron-600 underline">Cookie Settings</Link>. For detailed information, see <Link href="/cookie-policy" className="text-saffron-600 underline">Cookie Policy</Link>.</p>
      </section>

      {/* Privacy Help */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Privacy Help</h2>
        <p className="mt-2 text-sm text-ink">For personal-data related requests, use <Link href="/privacy-request" className="text-saffron-600 underline">Privacy Request</Link>. You can request access, correction, deletion, consent withdrawal, information about processing, privacy complaint, or security concern.</p>
      </section>

      {/* Delete My Account */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Delete My Account</h2>
        <p className="mt-2 text-sm text-ink">If account deletion is supported, go to <strong>My Account → Settings → Delete Account</strong>. Alternatively, submit a <Link href="/privacy-request" className="text-saffron-600 underline">Privacy Request → Delete My Account</Link>. Some information may need to be retained where required or permitted by applicable law.</p>
      </section>

      {/* Contact Support */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Contact Support</h2>
        <p className="mt-2 text-sm text-ink">If you cannot find an answer, contact us at <Link href="/contact" className="text-saffron-600 underline">/contact</Link>.</p>
        <p className="mt-2 text-sm text-ink">Suggested categories: Government Job, Exam, Admit Card, Result, Government Scheme, Scholarship, Government Service, Document / Certificate, Account & Login, Notification / Alert, Website Problem, Incorrect Information, Privacy, Security, Other.</p>
      </section>

      {/* Report Incorrect Information */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Report Incorrect Information</h2>
        <p className="mt-2 text-sm text-ink">If you find outdated or incorrect information, use <Link href="/contact" className="text-saffron-600 underline">/contact</Link> and select <strong>Incorrect Information</strong>. Please provide page URL, information that appears incorrect, correct information, relevant official source, and additional details.</p>
      </section>

      {/* Report a Security Problem */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Report a Security Problem</h2>
        <p className="mt-2 text-sm text-ink">If you believe you have discovered a security vulnerability, <strong>please do not publicly disclose technical details</strong> before giving our team an opportunity to investigate. Use the appropriate security contact channel.</p>
      </section>

      {/* FAQs */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy-900">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">Is APPZENO a government website?</h3>
            <p className="mt-1 text-sm text-ink">No. APPZENO Sarkari Portal is an independent information and service-discovery platform.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">Does APPZENO guarantee government jobs?</h3>
            <p className="mt-1 text-sm text-ink">No.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">Does APPZENO collect Aadhaar information?</h3>
            <p className="mt-1 text-sm text-ink">Ordinary APPZENO browsing does not require Aadhaar information. Users should not submit unnecessary sensitive information through general forms.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">Can I apply for a government job through APPZENO?</h3>
            <p className="mt-1 text-sm text-ink">APPZENO may provide an official application link. The actual application is generally completed on the relevant recruitment authority's website.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">Can I check government results through APPZENO?</h3>
            <p className="mt-1 text-sm text-ink">APPZENO may provide result information and official result links.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">Can I use APPZENO without creating an account?</h3>
            <p className="mt-1 text-sm text-ink">Yes, core public information should remain accessible without an account. Account registration may be required for optional features such as saved jobs or personalized alerts.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">How do I report incorrect information?</h3>
            <p className="mt-1 text-sm text-ink">Use <Link href="/contact" className="text-saffron-600 underline">/contact</Link> and select <strong>Incorrect Information</strong>.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">How do I make a privacy request?</h3>
            <p className="mt-1 text-sm text-ink">Use <Link href="/privacy-request" className="text-saffron-600 underline">/privacy-request</Link>.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">How do I change cookie preferences?</h3>
            <p className="mt-1 text-sm text-ink">Use <Link href="/cookie-preferences" className="text-saffron-600 underline">/cookie-settings</Link>.</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-paper p-4">
            <h3 className="font-extrabold text-navy-900">How do I delete my account?</h3>
            <p className="mt-1 text-sm text-ink">Use <strong>My Account → Settings → Delete Account</strong>, where available, or submit a <Link href="/privacy-request" className="text-saffron-600 underline">privacy request</Link>.</p>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="mt-10">
        <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-6">
          <h2 className="font-display text-xl font-bold text-saffron-900">Still Need Help?</h2>
          <p className="mt-2 text-sm text-saffron-800">Couldn't find what you were looking for? Contact us and we'll help you.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 cursor-pointer">Contact Us</Link>
            <Link href="/privacy-request" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">Submit Privacy Request</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
