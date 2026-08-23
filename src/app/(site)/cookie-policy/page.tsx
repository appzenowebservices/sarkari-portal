import { Metadata } from "next";
import { Bi } from "@/components/bi";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | APPZENO Sarkari Portal",
  description: "Cookie Policy for APPZENO Sarkari Portal",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="कुकी नीति" en="Cookie Policy" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Effective Date: 13 August 2026 • Last Updated: 13 August 2026 • Version: 1.0</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <p>Welcome to <strong>APPZENO Sarkari Portal</strong> ("APPZENO", "we", "us", or "our").</p>
        <p>This Cookie Policy explains how APPZENO Sarkari Portal uses cookies and similar technologies when you visit or use our website, including our pages containing government job notifications, recruitment updates, examination information, results, admit cards, government schemes, official government links and other related public information.</p>
        <p>This Cookie Policy should be read together with our <strong>Privacy Policy</strong>, <strong>Terms & Conditions</strong>, and other applicable website policies.</p>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">1. What Are Cookies?</h2>
          <p className="mt-2">Cookies are small text files or similar technologies that may be stored on your device when you visit a website.</p>
          <p className="mt-2">They allow a website to remember certain information about your visit, preferences, session, or interactions.</p>
          <p className="mt-2">Cookies may be stored on:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Desktop computers</li>
            <li>Laptops</li>
            <li>Mobile phones</li>
            <li>Tablets</li>
            <li>Other internet-enabled devices</li>
          </ul>
          <p className="mt-2">Cookies may be:</p>
          <h3 className="mt-4 font-extrabold text-navy-900">First-Party Cookies</h3>
          <p className="mt-1">These are cookies placed directly by APPZENO Sarkari Portal.</p>
          <h3 className="mt-4 font-extrabold text-navy-900">Third-Party Cookies</h3>
          <p className="mt-1">These may be placed by third-party services that we use on our website, subject to the services actually implemented on the website.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">2. Why Does APPZENO Sarkari Portal Use Cookies?</h2>
          <p className="mt-2">We may use cookies and similar technologies for purposes such as:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Operating the website</li>
            <li>Maintaining user sessions</li>
            <li>Securing user accounts</li>
            <li>Remembering user preferences</li>
            <li>Remembering cookie-consent choices</li>
            <li>Improving website performance</li>
            <li>Understanding aggregate website usage</li>
            <li>Improving search and navigation</li>
            <li>Improving the relevance and presentation of content</li>
            <li>Supporting optional advertising and monetization, where applicable</li>
            <li>Detecting abuse, fraud or suspicious activity</li>
            <li>Maintaining website security</li>
          </ul>
          <p className="mt-2">Our objective is to use cookies only where they are reasonably necessary for the relevant purpose.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">3. Types of Cookies We May Use</h2>
          <p className="mt-2">APPZENO Sarkari Portal may classify cookies into the following categories.</p>
          <h3 className="mt-4 font-extrabold text-navy-900">3.1 Strictly Necessary Cookies</h3>
          <p className="mt-2">These cookies are required for essential website functionality. They may support login sessions, authentication, security, session management, cookie-consent preferences, form submissions, basic website functionality, fraud and abuse prevention, and protection of authenticated areas.</p>
          <p className="mt-2">These cookies are generally necessary for the website or a requested service to function. Where a cookie is strictly necessary, disabling it may cause certain website features to stop working properly.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">4. Functional Cookies</h2>
          <p className="mt-2">Functional cookies help us remember choices made by visitors and provide a more convenient experience. Depending on the features implemented, these may remember language preference, display preferences, search preferences, selected filters, recently selected categories, website preferences, and other user interface preferences.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">5. Analytics Cookies</h2>
          <p className="mt-2">Where implemented and where applicable consent is required, analytics cookies help us understand how visitors use APPZENO Sarkari Portal. They may provide aggregated information such as number of visitors, popular pages, popular government-job categories, frequently viewed updates, search activity, referral sources, device type, browser type, website performance, and general navigation patterns.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">6. Advertising and Personalization Cookies</h2>
          <p className="mt-2">APPZENO Sarkari Portal may display advertisements or promotional content to support the operation and development of the portal. Where advertising or personalization technologies are used, optional cookies or similar technologies may be used to measure advertising performance, limit repetitive advertisements, understand advertising interactions, provide more relevant advertising, measure conversions, and support advertising partners.</p>
          <p className="mt-2">We do not sell your personal information merely because you visit APPZENO Sarkari Portal.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">7. Cookies Used for Login and User Accounts</h2>
          <p className="mt-2">If APPZENO Sarkari Portal provides user registration and login functionality, necessary cookies or similar technologies may be used to maintain your authenticated session. Authentication tokens and security credentials should be handled securely and should not be exposed through ordinary analytics or advertising cookies.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">8. Cookie Consent Preferences</h2>
          <p className="mt-2">When you first visit APPZENO Sarkari Portal, we may display a cookie-consent banner. You may be presented with options such as <strong>Accept All Cookies</strong>, <strong>Reject Optional Cookies</strong>, and <strong>Manage Cookie Preferences</strong>. You may be able to select individual categories of optional cookies.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100">
                  <th className="py-2 pr-4 font-extrabold text-navy-900">Cookie Category</th>
                  <th className="py-2 font-extrabold text-navy-900">Default/Status</th>
                </tr>
              </thead>
              <tbody className="text-ink-soft">
                <tr className="border-b border-navy-50"><td className="py-2 pr-4">Strictly Necessary</td><td className="py-2">Always Active</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4">Functional</td><td className="py-2">Optional</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4">Analytics</td><td className="py-2">Optional</td></tr>
                <tr><td className="py-2 pr-4">Advertising/Personalization</td><td className="py-2">Optional</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">9. Changing Your Cookie Preferences</h2>
          <p className="mt-2">You can change your optional cookie preferences at any time. APPZENO Sarkari Portal provides a <strong>Manage Cookie Preferences</strong> option. When you change your preferences, the website may update your consent record, enable permitted cookie categories, disable optional cookie categories, remove certain optional cookies where technically possible, or request consent again when required because of a policy or technology change.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">10. Withdrawal of Consent</h2>
          <p className="mt-2">Where optional cookies are based on your consent, you may withdraw that consent at any time through the Cookie Settings interface. Withdrawal of consent does not affect processing that occurred before the withdrawal, where such processing was otherwise lawful. Strictly necessary technologies may continue to operate because they are required for essential website functionality.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">11. How Long Do Cookies Remain on Your Device?</h2>
          <p className="mt-2">Cookies may have different lifetimes. <strong>Session Cookies</strong> normally expire when the browser session ends. <strong>Persistent Cookies</strong> remain for a specified period or until they are deleted. The actual duration depends on the specific cookie and its purpose.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">12. Third-Party Services</h2>
          <p className="mt-2">Some features of APPZENO Sarkari Portal may rely on third-party services. Depending on what is implemented, these could include services for website analytics, advertising, security, authentication, embedded content, social media, and performance monitoring. Third-party providers may use their own cookies or similar technologies. Their use of information is governed by their respective privacy policies and terms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">13. External Government Websites</h2>
          <p className="mt-2">APPZENO Sarkari Portal may provide links to official government websites and other external websites. Once you leave APPZENO Sarkari Portal and access an external website, that website's own Cookie Policy, Privacy Policy, Terms of Use, and Security practices will apply. APPZENO does not control cookies placed by external government or third-party websites.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">14. Government Links and Information Disclaimer</h2>
          <p className="mt-2"><strong>APPZENO Sarkari Portal is an independent information platform and is not itself a government website or government authority unless expressly stated otherwise.</strong> Users should verify important information, deadlines, eligibility requirements, application fees, examination dates and other official details through the relevant official government notification or website. A link provided by APPZENO does not constitute government endorsement, affiliation or authorization.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">15. Cookies and Personal Information</h2>
          <p className="mt-2">We do not use cookies to collect information such as passwords, bank passwords, OTPs, credit/debit card PINs, Aadhaar authentication credentials, or other authentication secrets, unless specifically required for a legitimate service and handled through appropriate secure mechanisms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">16. Security</h2>
          <p className="mt-2">We take reasonable technical and organizational measures to protect information associated with our website. Security measures may include HTTPS/TLS encryption, secure cookie attributes, HttpOnly cookies where appropriate, SameSite controls, access controls, authentication controls, rate limiting, fraud and abuse prevention, security monitoring, and audit logging. However, no internet-based system can be guaranteed to be completely secure.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">17. Cookies on Mobile Devices</h2>
          <p className="mt-2">The use of cookies and similar technologies may vary depending on device, operating system, browser, browser settings, and website configuration. You can also manage cookies through your browser's privacy and security settings.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">18. Browser Cookie Controls</h2>
          <p className="mt-2">Most modern browsers allow you to view, delete, block, or clear cookies and browsing data. Please note that blocking all cookies may cause certain website functionality to stop working correctly.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">19. Do Not Track Signals</h2>
          <p className="mt-2">Some browsers provide "Do Not Track" or similar privacy settings. Because browser implementations and standards may differ, APPZENO may not respond to every such signal in the same manner. Where applicable, our cookie-consent mechanism will provide users with controls for optional cookie categories.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">20. Cookie Consent Records</h2>
          <p className="mt-2">Where technically and legally appropriate, APPZENO may maintain a record of cookie preferences. Such records may include anonymous identifier, selected cookie categories, consent status, cookie-policy version, date and time of consent, consent method, preference changes, and withdrawal of consent. We do not need to store the actual contents of ordinary browser cookies merely to maintain a record of your cookie preferences.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">21. Policy Versioning</h2>
          <p className="mt-2">When we make material changes to our cookie practices, we may update this Cookie Policy, update the policy version, update the "Last Updated" date, update our Cookie Settings, or request renewed consent where required. You should periodically review this page for updates.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">22. Children's Privacy</h2>
          <p className="mt-2">APPZENO Sarkari Portal is primarily an information and services platform intended for general users and job seekers. We do not knowingly use optional cookies to create profiles of children for advertising purposes. If you believe that information relating to a child has been collected improperly, please contact us.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">23. Data Retention</h2>
          <p className="mt-2">Cookie-related information will be retained only for as long as reasonably necessary for the purposes for which it was collected, including maintaining consent records, managing preferences, security, compliance, resolving disputes, and maintaining website functionality.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">24. Your Privacy Rights</h2>
          <p className="mt-2">Depending on applicable law and your circumstances, you may have rights relating to your personal data and privacy. These may include applicable rights to request information about processing, request correction of inaccurate information, request deletion where applicable, withdraw consent where processing relies on consent, raise a privacy-related complaint, and exercise other rights provided by applicable law.</p>
          <p className="mt-2">India's data-protection framework includes the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025; the applicability and effective implementation of particular provisions should be assessed based on the current legal position and your actual processing activities.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">25. Contact Us</h2>
          <p className="mt-2">If you have questions regarding this Cookie Policy or our use of cookies, please contact us through:</p>
          <p className="mt-2"><strong>APPZENO Sarkari Portal</strong></p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Contact Us:</strong> <Link href="/contact" className="text-saffron-600 underline">/contact</Link></li>
            <li><strong>Privacy:</strong> <Link href="/privacy-policy" className="text-saffron-600 underline">/privacy-policy</Link></li>
            <li><strong>Terms & Conditions:</strong> <Link href="/terms-conditions" className="text-saffron-600 underline">/terms-conditions</Link></li>
            <li><strong>Cookie Settings:</strong> <Link href="/cookie-preferences" className="text-saffron-600 underline">/cookie-preferences</Link></li>
            <li><strong>Cookie Policy:</strong> <Link href="/cookie-policy" className="text-saffron-600 underline">/cookie-policy</Link></li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">26. Updates to This Cookie Policy</h2>
          <p className="mt-2">We may update this Cookie Policy from time to time to reflect changes to our website, new website features, new analytics technologies, advertising changes, security improvements, changes in applicable law, or changes in our cookie practices. The latest version will be published on this page.</p>
          <div className="mt-4 rounded-xl border border-navy-100 bg-paper p-4">
            <p className="font-extrabold text-navy-900">Current Version</p>
            <p className="mt-1 text-ink-soft"><strong>Version:</strong> 1.0</p>
            <p className="text-ink-soft"><strong>Effective Date:</strong> 13 August 2026</p>
            <p className="text-ink-soft"><strong>Last Updated:</strong> 13 August 2026</p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Quick Cookie Summary</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100">
                  <th className="py-2 pr-4 font-extrabold text-navy-900">Category</th>
                  <th className="py-2 pr-4 font-extrabold text-navy-900">Purpose</th>
                  <th className="py-2 text-right font-extrabold text-navy-900">Required?</th>
                </tr>
              </thead>
              <tbody className="text-ink-soft">
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Strictly Necessary</td><td className="py-2 pr-4">Login, security, sessions, consent</td><td className="py-2 text-right">Yes</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Functional</td><td className="py-2 pr-4">Preferences and convenience</td><td className="py-2 text-right">Optional</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Analytics</td><td className="py-2 pr-4">Aggregate usage and performance</td><td className="py-2 text-right">Optional</td></tr>
                <tr><td className="py-2 pr-4 font-extrabold text-ink">Advertising/Personalization</td><td className="py-2 pr-4">Advertising measurement/personalization</td><td className="py-2 text-right">Optional</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Your Cookie Choices</h2>
          <p className="mt-2">You can manage your preferences at any time:</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/cookie-preferences" className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95">Manage Cookie Preferences</Link>
            <Link href="/cookie-preferences" className="rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-navy-50">Reject Optional Cookies</Link>
            <Link href="/cookie-preferences" className="rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95">Accept All Cookies</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
