import { Metadata } from "next";
import { Bi } from "@/components/bi";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | APPZENO Sarkari Portal",
  description: "Privacy Policy for APPZENO Sarkari Portal",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="गोपनीयता नीति" en="Privacy Policy" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Effective Date: 13 August 2026 • Last Updated: 13 August 2026 • Version: 1.0</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <p>Welcome to <strong>APPZENO Sarkari Portal</strong> ("APPZENO", "we", "us", "our", or "Platform").</p>
        <p>This Privacy Policy explains how APPZENO Sarkari Portal may collect, use, process, store, protect, and disclose information when you access or use our website, applications, services, features, and related digital platforms.</p>
        <p>APPZENO Sarkari Portal is designed to help users discover government-related information and official links, including government jobs, recruitment notifications, examinations, admit cards, results, answer keys, government schemes, scholarships, education services, farmer services, government documents, certificates, government services, official government links, public notices, and related updates and notifications.</p>
        <p>This Privacy Policy should be read together with our <strong>Terms & Conditions</strong>, <strong>Cookie Policy</strong>, <strong>Disclaimer</strong>, and other applicable policies published on the Platform.</p>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">1. About APPZENO Sarkari Portal</h2>
          <p className="mt-2">APPZENO Sarkari Portal is an <strong>independent information and service-discovery platform</strong>. APPZENO may organize, categorize, summarize, and link to publicly available government-related information to make it easier for users to discover relevant services and official resources.</p>
          <p className="mt-2"><strong>APPZENO Sarkari Portal is not a government website, government department, or government authority unless expressly stated otherwise.</strong></p>
          <p className="mt-2">When you click an external government link, you may be redirected to a website operated by the relevant government department or another third party. That website will have its own privacy practices.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">2. Scope of This Privacy Policy</h2>
          <p className="mt-2">This Privacy Policy applies to information collected through the APPZENO Sarkari Portal website, mobile-responsive website, Progressive Web App (PWA), user registration and login, contact forms, feedback forms, correction requests, job-alert subscriptions, saved jobs, saved services, notifications, search functionality, cookie-consent mechanisms, customer/support communications, and other features operated directly by APPZENO.</p>
          <p className="mt-2">It generally does <strong>not</strong> govern information collected directly by external government websites or third-party services that you access through links on APPZENO.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">3. Information We May Collect</h2>
          <p className="mt-2">Depending on the features you use, APPZENO may collect different categories of information. We aim to collect only information reasonably necessary for the relevant purpose.</p>
          <h3 className="mt-4 font-extrabold text-navy-900">3.1 Information You Provide Directly</h3>
          <p className="mt-2">You may voluntarily provide information when you create an account, contact us, submit feedback, subscribe to alerts, save jobs, save services, request corrections, contact support, or participate in optional features. This information may include basic account information such as full name, email address, mobile number, password or authentication information, preferred language, and account preferences.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">4. Information Collected Through Google or Social Login</h2>
          <p className="mt-2">If APPZENO provides Google or another supported social-login option, you may choose to authenticate using that service. Depending on the authentication provider and permissions granted, we may receive limited information such as name, email address, profile identifier, profile image where available, and authentication-related information. We do <strong>not</strong> receive your Google password through standard OAuth authentication.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">5. Contact Form Information</h2>
          <p className="mt-2">When you contact APPZENO, we may collect information such as name, email address, mobile number if provided, subject, message, contact category, attachment if supported, date/time of submission, and technical information associated with the submission. Please do not submit unnecessary sensitive information through a general contact form.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">6. Job Alert Information</h2>
          <p className="mt-2">If APPZENO provides personalized job alerts, you may choose to provide preferences such as state, city/region, qualification, job category, department, organization, employment type, preferred government sector, and notification preference. This information may be used to provide relevant notifications.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">7. Saved Jobs and Saved Services</h2>
          <p className="mt-2">If you create an account, APPZENO may allow you to save jobs, government schemes, services, exams, results, documents, and search preferences. This information may be associated with your account so that it can be accessed across supported devices.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">8. Search Information</h2>
          <p className="mt-2">When you use the APPZENO search facility, the system may process information such as search keywords, search category, filters, date/time, and general technical information. Search information may be used to return relevant results, improve search functionality, identify popular services, improve website navigation, detect abusive or automated activity, and improve content organization. We aim to avoid unnecessarily associating ordinary search activity with identifiable user profiles.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">9. Automatically Collected Information</h2>
          <p className="mt-2">When you access APPZENO, certain technical information may be automatically collected. This may include IP address, browser type, device type, operating system, screen/device characteristics, language preference, approximate geographic region derived from technical information, referring website, pages visited, date and time of access, session information, website interaction information, and error and diagnostic information. This information may be used for security, performance monitoring, troubleshooting, analytics, fraud prevention, and website optimization.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">10. Cookies and Similar Technologies</h2>
          <p className="mt-2">APPZENO may use cookies and similar technologies for authentication, security, session management, cookie-consent preferences, language preferences, functional preferences, analytics, and advertising where applicable. For complete information, please read our <Link href="/cookie-policy" className="text-saffron-600 underline">Cookie Policy</Link>. You may also manage optional cookie preferences through <Link href="/cookie-preferences" className="text-saffron-600 underline">Cookie Settings</Link>.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">11. Why We Use Your Information</h2>
          <p className="mt-2">Depending on the circumstances, APPZENO may process information for purposes including:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Website Operation:</strong> Provide website functionality, maintain user sessions, provide requested services, maintain user accounts.</li>
            <li><strong>Personalization:</strong> Remember preferences, display relevant categories, provide saved jobs, provide saved services, provide personalized alerts.</li>
            <li><strong>Communication:</strong> Respond to contact requests, provide support, send requested notifications, respond to correction requests, communicate important account information.</li>
            <li><strong>Security:</strong> Detect suspicious activity, prevent fraud, prevent unauthorized access, protect accounts, protect website infrastructure.</li>
            <li><strong>Improvement:</strong> Improve website performance, improve search, improve navigation, analyze aggregate usage, improve content organization.</li>
            <li><strong>Legal and Compliance:</strong> Comply with applicable legal obligations, respond to lawful requests, protect legal rights, investigate security incidents, maintain required records.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">12. Data Minimization</h2>
          <p className="mt-2">APPZENO follows a principle of collecting information that is reasonably necessary for the relevant purpose. For example, if you are simply reading a government-job notification, we generally do not need your Aadhaar number, PAN number, bank account number, OTP, or government application password. You should never submit such information through a general APPZENO form unless a specific feature explicitly requires it and provides appropriate safeguards.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">13. Sensitive Personal Information</h2>
          <p className="mt-2">APPZENO does not need sensitive government credentials merely to provide ordinary information-discovery services. Do not submit passwords, OTPs, ATM PINs, credit/debit card PINs, internet banking passwords, Aadhaar authentication credentials, government portal passwords, or authentication tokens through ordinary contact or feedback forms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">14. Government Application Information</h2>
          <p className="mt-2">APPZENO may provide links to official government application websites. When you click Apply Online, Register, Download, Check Status, or similar buttons, you may be redirected to an external website. If you provide information on that external website, the information is generally collected by that website/operator according to its own privacy policy. APPZENO does not automatically receive information that you submit directly to an external government website.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">15. Information From External Services</h2>
          <p className="mt-2">APPZENO may integrate third-party services for functionality such as authentication, analytics, hosting, security, search, notifications, email, advertising, and social sharing. The amount of information shared depends on the particular integration. We aim to configure integrations according to the purpose for which they are used and applicable privacy requirements.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">16. Google Authentication</h2>
          <p className="mt-2">Where Google Sign-In is enabled, APPZENO may use Google's authentication infrastructure to authenticate users. APPZENO may receive information permitted by the authentication flow, such as your name, email, Google account identifier, and profile image where available. APPZENO does not receive your Google account password through standard OAuth authentication. You may review Google's own privacy practices through Google's official resources.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">17. How We Use Email Addresses</h2>
          <p className="mt-2">If you provide an email address, we may use it to create your account, authenticate your account, respond to your queries, send requested alerts, send account-related communications, and send important service notices. We do not intend to use your email address for unrelated marketing without an appropriate basis or applicable consent where required.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">18. How We Use Mobile Numbers</h2>
          <p className="mt-2">If you provide a mobile number, it may be used for account verification, login verification, security, notifications, support, and requested alerts. We will not ask you to provide OTPs or authentication credentials through ordinary support forms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">19. Notifications</h2>
          <p className="mt-2">If you enable notifications, APPZENO may send relevant information such as new government jobs, application deadlines, admit cards, results, government schemes, scholarships, and important notices. You can manage notification settings where such controls are available. We do not guarantee that every eligible update will be delivered through every notification channel.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">20. Advertising</h2>
          <p className="mt-2">APPZENO may use advertising services to support the operation and development of the Platform. Advertising providers may use cookies or similar technologies depending on their configuration and applicable consent requirements. Advertising may include display advertising, contextual advertising, personalized advertising where permitted, and campaign measurement. APPZENO does not sell your personal data merely because you use the website.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">21. Analytics</h2>
          <p className="mt-2">We may use analytics tools to understand aggregate website usage. Analytics information may include page views, popular content, general traffic sources, device category, browser information, session information, and performance information. Analytics should be configured according to applicable privacy requirements and user choices.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">22. How We Share Information</h2>
          <p className="mt-2">We may share information only where reasonably necessary for legitimate purposes, including with service providers for hosting, database infrastructure, email, authentication, security, analytics, notifications, and technical support; legal authorities where required by applicable law; security and fraud prevention services; and business transfers in the event of a merger, acquisition, or similar transaction.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">23. We Do Not Sell Personal Data</h2>
          <p className="mt-2">APPZENO does not intend to sell personal data as a standalone commercial asset. Where advertising or analytics services are used, they will be configured and managed according to applicable legal requirements and our published privacy practices.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">24. Data Retention</h2>
          <p className="mt-2">We retain information only for as long as reasonably necessary for providing the requested service, maintaining accounts, security, legal compliance, resolving disputes, maintaining business records, and preventing fraud and abuse. Different categories of information may have different retention periods. Indicative retention purposes include account data for maintaining accounts, saved jobs for user functionality, contact requests for support history, consent records for compliance and audit, security logs for security, analytics data for website improvement, and job alerts for notification service.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">25. Data Security</h2>
          <p className="mt-2">We implement reasonable technical and organizational safeguards designed to protect personal information. Depending on the system architecture, safeguards may include HTTPS/TLS encryption, password hashing, secure authentication, access control, role-based permissions, secure session management, HttpOnly cookies where appropriate, SameSite cookie controls, rate limiting, API authentication, database access controls, security monitoring, backup controls, and audit logs. However, no online service can guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">26. Password Security</h2>
          <p className="mt-2">Where APPZENO supports password-based accounts, passwords should be stored using secure one-way hashing. Plain-text passwords should not be stored. Passwords should not be visible to administrators. Password reset mechanisms should use secure verification. Authentication sessions should be protected against unauthorized access. Users are responsible for maintaining the confidentiality of their credentials.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">27. Account Deletion</h2>
          <p className="mt-2">Where account functionality is available, users may request deletion of their account. An account deletion request may result in deletion or anonymization of information associated with the account, subject to legal retention requirements, security records, fraud-prevention requirements, dispute resolution, and other legitimate retention requirements. Certain records may therefore remain for an appropriate period even after account deletion.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">28. Correction of Personal Information</h2>
          <p className="mt-2">If you believe information associated with your account is inaccurate or incomplete, you may request correction. Depending on the feature, correction may be available through account settings, profile settings, contact support, or privacy request mechanism. We may need to verify your identity before making changes.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">29. Withdrawal of Consent</h2>
          <p className="mt-2">Where processing is based on consent, you may withdraw your consent through the available mechanism. For example, you may withdraw consent for optional analytics, optional advertising, certain notifications, or other optional processing. Withdrawal does not affect processing that occurred before withdrawal where that processing was otherwise lawful.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">30. Privacy Requests</h2>
          <p className="mt-2">Subject to applicable law, users may be able to request information or exercise applicable rights relating to their personal data. Requests may include access to relevant personal data, correction, deletion, withdrawal of consent, information about processing, and grievance/complaint submission. We may require reasonable verification before processing a request.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">31. Grievance and Privacy Contact</h2>
          <p className="mt-2">For privacy-related concerns, please contact APPZENO through:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Contact Us:</strong> <Link href="/contact" className="text-saffron-600 underline">/contact</Link></li>
            <li><strong>Privacy Request:</strong> <Link href="/privacy-request" className="text-saffron-600 underline">/privacy-request</Link></li>
            <li><strong>Cookie Policy:</strong> <Link href="/cookie-policy" className="text-saffron-600 underline">/cookie-policy</Link></li>
            <li><strong>Cookie Settings:</strong> <Link href="/cookie-preferences" className="text-saffron-600 underline">/cookie-preferences</Link></li>
            <li><strong>Terms & Conditions:</strong> <Link href="/terms-conditions" className="text-saffron-600 underline">/terms-conditions</Link></li>
          </ul>
          <p className="mt-2">For a legal or privacy-related request, please provide sufficient information for us to understand and respond to your request.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">32. Children's Privacy</h2>
          <p className="mt-2">APPZENO is a general information platform. We do not intentionally design ordinary advertising or personalization features to profile children. Where a service is specifically intended for minors or requires information relating to a child, appropriate safeguards should be implemented according to applicable law. Parents or guardians who believe that information concerning a child has been collected improperly may contact us.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">33. International Data Processing</h2>
          <p className="mt-2">Some technology or service providers used by APPZENO may process information from locations outside India. Where this occurs, we will seek to implement appropriate contractual, technical, organizational, or other safeguards required by applicable law. The location of processing may depend on the service provider and infrastructure selected by APPZENO.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">34. External Government Websites</h2>
          <p className="mt-2">APPZENO provides links to official government websites. Examples may include Aadhaar, PAN, voter services, driving licence, government recruitment portals, scholarship portals, state government services, and central government services. Once you leave APPZENO, the external website's privacy policy applies. APPZENO cannot control how an external website processes your information.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">35. Social Media</h2>
          <p className="mt-2">APPZENO may provide links or sharing features for Facebook, Instagram, YouTube, Telegram, WhatsApp, LinkedIn, and X/Twitter. Interactions with those services are governed by their respective privacy policies.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">36. Cookies</h2>
          <p className="mt-2">Our use of cookies is explained separately in our <Link href="/cookie-policy" className="text-saffron-600 underline">Cookie Policy</Link>. Cookies may be used for authentication, security, preferences, analytics, consent management, and advertising where applicable.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">37. Do Not Track</h2>
          <p className="mt-2">Some browsers provide a "Do Not Track" or similar setting. Browser implementations vary, and APPZENO may not respond to all such signals in the same manner. Our cookie-consent controls provide the primary mechanism for managing optional cookie categories where applicable.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">38. Data Breach and Security Incidents</h2>
          <p className="mt-2">If APPZENO becomes aware of a personal-data security incident, we will assess and respond according to applicable law and our incident-response procedures. Where legally required, affected users and/or relevant authorities may be notified within the applicable requirements. Security incidents may include unauthorized access, data leakage, malware, account compromise, database compromise, and unauthorized disclosure.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">39. Third-Party Links</h2>
          <p className="mt-2">APPZENO may contain links to third-party websites. We are not responsible for the privacy practices, security, content, or data-processing activities of third-party websites. Users should review the privacy policy of each external website before submitting personal information.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">40. Changes to This Privacy Policy</h2>
          <p className="mt-2">We may update this Privacy Policy from time to time. Changes may occur due to new features, new services, changes in data-processing practices, changes in technology, changes in third-party integrations, or security improvements. When material changes are made, we may update the policy version, effective date, last updated date, and website notification where appropriate.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">41. Applicable Legal Framework</h2>
          <p className="mt-2">APPZENO intends to operate its personal-data practices in accordance with applicable Indian laws and regulations. India's principal digital personal-data framework includes the <strong>Digital Personal Data Protection Act, 2023</strong>. The Central Government notified the <strong>Digital Personal Data Protection Rules, 2025</strong> on 14 November 2025, with provisions coming into force in phases according to the notified commencement framework. Because different provisions may become applicable at different times, this Privacy Policy and APPZENO's technical implementation should be reviewed and updated as the applicable requirements take effect.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">42. User Responsibility</h2>
          <p className="mt-2">Users are responsible for providing accurate information, keeping account credentials secure, not sharing passwords, not submitting unnecessary sensitive information, reviewing external website privacy policies, verifying official government websites before submitting personal information, and reporting suspected account compromise or privacy issues.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">43. Important Security Warning</h2>
          <p className="mt-2">APPZENO will never require you to provide your OTP, ATM PIN, UPI PIN, internet banking password, credit/debit card PIN, or government portal password through a normal contact form or support channel. If a person claims to represent APPZENO and requests such information, <strong>do not provide it</strong> and report the incident to us.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">44. No Control Over External Government Portals</h2>
          <p className="mt-2">APPZENO may help you discover an official government service, but we do not control the government's website. Information submitted after leaving APPZENO is generally governed by the external website's privacy policy.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">45. Contact Us</h2>
          <p className="mt-2">For questions regarding this Privacy Policy or your personal information, contact:</p>
          <p className="mt-2"><strong>APPZENO Sarkari Portal</strong></p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Contact Us:</strong> <Link href="/contact" className="text-saffron-600 underline">/contact</Link></li>
            <li><strong>Privacy Request:</strong> <Link href="/privacy-request" className="text-saffron-600 underline">/privacy-request</Link></li>
            <li><strong>Cookie Policy:</strong> <Link href="/cookie-policy" className="text-saffron-600 underline">/cookie-policy</Link></li>
            <li><strong>Cookie Settings:</strong> <Link href="/cookie-preferences" className="text-saffron-600 underline">/cookie-preferences</Link></li>
            <li><strong>Terms & Conditions:</strong> <Link href="/terms-conditions" className="text-saffron-600 underline">/terms-conditions</Link></li>
          </ul>
          <p className="mt-2">For a legal or privacy-related request, please provide sufficient information for us to understand and respond to your request.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">46. Policy Information</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100">
                  <th className="py-2 pr-4 font-extrabold text-navy-900">Field</th>
                  <th className="py-2 font-extrabold text-navy-900">Value</th>
                </tr>
              </thead>
              <tbody className="text-ink-soft">
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Policy Name</td><td className="py-2">Privacy Policy</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Platform</td><td className="py-2">APPZENO Sarkari Portal</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Version</td><td className="py-2">1.0</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Effective Date</td><td className="py-2">13 August 2026</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Last Updated</td><td className="py-2">13 August 2026</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Status</td><td className="py-2">Published</td></tr>
                <tr className="border-b border-navy-50"><td className="py-2 pr-4 font-extrabold text-ink">Applicable Region</td><td className="py-2">India</td></tr>
                <tr><td className="py-2 pr-4 font-extrabold text-ink">Owner</td><td className="py-2">APPZENO Sarkari Portal / Legal Entity</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">APPZENO Privacy Promise</h2>
          <div className="mt-2 rounded-xl border border-saffron-300 bg-saffron-50 p-4">
            <p className="text-sm font-bold text-saffron-900">We aim to collect only the information we reasonably need, use it for clearly defined purposes, protect it with appropriate safeguards, and provide users with meaningful control over their information where required by applicable law.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
