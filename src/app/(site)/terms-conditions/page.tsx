import { Metadata } from "next";
import { Bi } from "@/components/bi";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | APPZENO Sarkari Portal",
  description: "Terms & Conditions for APPZENO Sarkari Portal",
};

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="नियम एवं शर्तें" en="Terms & Conditions" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Effective Date: 13 August 2026 • Last Updated: 13 August 2026 • Version: 1.0</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <p>Welcome to <strong>APPZENO Sarkari Portal</strong> ("APPZENO", "we", "us", or "our").</p>
        <p>These Terms & Conditions ("Terms") govern your access to and use of the APPZENO Sarkari Portal website, including its pages, services, government information, job notifications, recruitment updates, examination information, results, admit cards, schemes, scholarships, certificates, government-service links, notifications, search functionality, user accounts, and other features made available through the platform.</p>
        <p>By accessing or using APPZENO Sarkari Portal, you acknowledge that you have read, understood, and agreed to these Terms.</p>
        <p>If you do not agree with these Terms, please discontinue use of the website.</p>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">1. About APPZENO Sarkari Portal</h2>
          <p className="mt-2">APPZENO Sarkari Portal is an <strong>independent information and service-discovery platform</strong> designed to help users find information and official links relating to government services and public opportunities.</p>
          <p className="mt-2">The platform may provide information relating to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Government Jobs</li>
            <li>Recruitment Notifications</li>
            <li>Examination Notifications</li>
            <li>Admit Cards</li>
            <li>Results</li>
            <li>Answer Keys</li>
            <li>Government Schemes</li>
            <li>Scholarships</li>
            <li>Admissions</li>
            <li>Farmer Services</li>
            <li>Government Documents</li>
            <li>Certificates</li>
            <li>Citizen Services</li>
            <li>Government Departments</li>
            <li>Official Government Websites</li>
            <li>Other publicly available government-related information</li>
          </ul>
          <p className="mt-2"><strong>APPZENO Sarkari Portal is not a government website, government department, government authority, or government recruitment agency unless expressly stated otherwise.</strong></p>
          <p className="mt-2">APPZENO does not represent that it is affiliated with, endorsed by, or operated by any government department merely because it provides a link to that department's official website.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">2. Acceptance of Terms</h2>
          <p className="mt-2">By accessing APPZENO Sarkari Portal, you agree to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Use the website lawfully.</li>
            <li>Follow these Terms.</li>
            <li>Respect applicable laws and regulations.</li>
            <li>Provide accurate information when submitting information to us.</li>
            <li>Avoid misuse of the platform.</li>
            <li>Verify important information through official sources.</li>
          </ul>
          <p className="mt-2">If you are using the website on behalf of an organization, you confirm that you have the authority to accept these Terms on behalf of that organization.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">3. Eligibility</h2>
          <p className="mt-2">You may use APPZENO Sarkari Portal provided that you are legally permitted to access and use online services under applicable law.</p>
          <p className="mt-2">Certain services or external government websites linked from APPZENO may have their own eligibility requirements. For example, a government recruitment notification may specify minimum age, maximum age, educational qualification, nationality, experience, category requirements, or location requirements. Users are responsible for reviewing the official notification before applying.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">4. Nature of Information Provided</h2>
          <p className="mt-2">APPZENO may collect, organize, summarize, categorize, or present publicly available information from official government sources and other relevant sources. Our content may include job titles, vacancy information, eligibility information, application dates, examination dates, result information, scheme details, official links, application links, government department information, and public notices.</p>
          <p className="mt-2">We attempt to provide useful and accurate information; however, government information may change without notice.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">5. Official Source Verification</h2>
          <p className="mt-2">Where practical, APPZENO may identify or link to an official source. Users should always verify critical information from the relevant official website or notification before taking action. This includes application deadlines, eligibility, age limits, vacancy numbers, application fees, exam dates, admit-card information, result information, required documents, government scheme eligibility, and application procedures.</p>
          <p className="mt-2"><strong>Official Source Principle:</strong> Where there is any conflict between information displayed on APPZENO and the relevant official government notification, the official notification or government website should be treated as the authoritative source.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">6. External Links</h2>
          <p className="mt-2">APPZENO may provide links to government websites, recruitment portals, examination portals, scholarship portals, state government websites, central government websites, public institutions, and other external websites. When you click an external link, you may leave APPZENO Sarkari Portal.</p>
          <p className="mt-2">External websites operate under their own Terms & Conditions, Privacy Policies, Cookie Policies, and Security practices. APPZENO does not control those websites and is not responsible for their content, availability, security, privacy practices, or transactions.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">7. Government Applications</h2>
          <p className="mt-2">APPZENO may provide a link or button such as <strong>Apply Online</strong>. This link may redirect you to an external official application website. APPZENO generally does <strong>not</strong> process the government application itself unless expressly stated.</p>
          <p className="mt-2">Users should carefully verify the domain and official source before entering name, date of birth, Aadhaar information, PAN information, mobile number, email address, bank details, payment information, or other personal information. Do not share sensitive information with an unofficial website merely because the link appears on the internet.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">8. No Government Representation</h2>
          <p className="mt-2">APPZENO does not guarantee that a government department endorses APPZENO, a government organization has authorized APPZENO, a job listing guarantees employment, a scheme guarantees financial assistance, an application submitted through an external link will be accepted, or a user will qualify for a government service.</p>
          <p className="mt-2">APPZENO is an <strong>information and discovery platform</strong>, not a government decision-making authority.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">9. Job and Recruitment Information</h2>
          <p className="mt-2">Government recruitment information may change due to official amendments, court orders, administrative decisions, extension of deadlines, cancellation, vacancy revisions, examination postponements, or recruitment-board decisions. APPZENO may update information when changes become known. However, users should verify the latest official notification before applying.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">10. Government Schemes</h2>
          <p className="mt-2">Information about government schemes may include eligibility, benefits, application process, required documents, official links, and department information. Scheme eligibility and benefits are determined by the relevant government authority. APPZENO does not guarantee that a user will receive subsidies, grants, loans, scholarships, pension, insurance benefits, financial assistance, or other government benefits. The relevant government authority makes the final decision.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">11. User Accounts</h2>
          <p className="mt-2">If APPZENO provides registration or login functionality, users are responsible for providing accurate information, maintaining account security, keeping login credentials confidential, not sharing passwords with others, and immediately reporting suspected unauthorized access. You are responsible for activity performed through your account unless caused by circumstances beyond your reasonable control.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">12. User-Submitted Information</h2>
          <p className="mt-2">Certain features may allow users to submit information, including contact forms, feedback, job-related suggestions, government-service suggestions, correction requests, comments, and support requests. You agree that information submitted by you should be accurate, lawful, relevant, non-malicious, and free from intentionally misleading information.</p>
          <p className="mt-2">Do not submit passwords, OTPs, bank PINs, credit/debit card PINs, authentication credentials, or unnecessary sensitive personal information through ordinary contact or feedback forms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">13. Content Correction Requests</h2>
          <p className="mt-2">If you find incorrect, outdated, incomplete, or misleading information on APPZENO, you may contact us through the available correction or contact mechanism. A correction request should preferably include page URL, update title, incorrect information, correct information, relevant official source, and official notification/document where available. APPZENO may review and update information at its discretion.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">14. Intellectual Property</h2>
          <p className="mt-2">Unless otherwise stated, the APPZENO website's original logo, branding, website design, UI/UX, graphics, original written content, software, database structure, website code, and platform functionality may be protected by applicable intellectual-property laws. You may not reproduce, copy, modify, distribute, sell, license, scrape, or commercially exploit APPZENO's proprietary content or technology without appropriate authorization.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">15. Government Information and Public Content</h2>
          <p className="mt-2">Government notifications, laws, regulations, official logos, public notices, and other government materials may belong to or be controlled by their respective government departments or authorities. APPZENO does not claim ownership over third-party government materials merely because they are displayed, summarized, referenced, or linked through the platform. Where appropriate, users should refer to the original government source.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">16. Prohibited Activities</h2>
          <p className="mt-2">You must not use APPZENO Sarkari Portal to break any applicable law, attempt unauthorized access, attack or disrupt the website, introduce malware or malicious code, attempt to bypass security controls, scrape the website in a manner that causes excessive load, create fake accounts for abuse, impersonate APPZENO or a government authority, submit fraudulent information, abuse contact or support systems, attempt to obtain another user's account, reverse engineer protected components where prohibited by law, use automated systems in a manner that harms the platform, publish unlawful, defamatory, threatening, or fraudulent material, or use APPZENO to facilitate scams or fraudulent recruitment.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">17. Automated Access and Scraping</h2>
          <p className="mt-2">APPZENO may use technical controls to protect the platform from excessive automated traffic. Unauthorized or abusive activities may include high-volume scraping, automated crawling that overloads servers, credential attacks, automated account creation, circumventing rate limits, or bypassing technical restrictions. Legitimate search-engine crawling or other permitted access may be allowed subject to applicable technical rules.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">18. Advertising</h2>
          <p className="mt-2">APPZENO may display advertisements to support the operation and development of the platform. Advertisements may be provided by APPZENO or third-party advertising providers. APPZENO does not necessarily endorse every product or service appearing in an advertisement. Users should independently evaluate third-party products or services before purchasing or using them.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">19. Affiliate Links</h2>
          <p className="mt-2">If APPZENO introduces affiliate relationships in the future, certain links may generate a commission when users complete an eligible action. Where applicable, such relationships may be disclosed on relevant pages. An affiliate relationship does not mean that APPZENO guarantees or endorses the third-party service.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">20. Availability of the Website</h2>
          <p className="mt-2">We aim to keep APPZENO Sarkari Portal available and operational. However, we do not guarantee uninterrupted availability. The website may temporarily become unavailable because of maintenance, server problems, hosting issues, network failures, security incidents, software updates, third-party service failures, or force majeure events. We may modify, suspend, or discontinue any part of the website where reasonably necessary.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">21. Accuracy of Information</h2>
          <p className="mt-2">We make reasonable efforts to maintain useful and updated information. However, we do not warrant that all information will always be complete, accurate, current, error-free, available, or suitable for a particular purpose. Government authorities may change information without notifying APPZENO.</p>
          <p className="mt-2"><strong>Always verify important information through the relevant official source before making an application, payment, travel arrangement, career decision, or other important decision.</strong></p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">22. No Professional Advice</h2>
          <p className="mt-2">Information published on APPZENO is generally provided for informational and educational purposes. It should not automatically be treated as legal advice, financial advice, tax advice, medical advice, professional advice, or official government advice. For matters requiring professional advice, consult an appropriately qualified professional or the relevant government authority.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">23. Payments</h2>
          <p className="mt-2">APPZENO may link users to external websites where payments are required for government applications or services. Unless expressly stated otherwise, APPZENO does not process such government application payments. Before making a payment, users should verify the official website, verify the application/service, verify the fee, verify the payment recipient, and keep the transaction receipt. APPZENO is not responsible for payment disputes arising directly between a user and an external website or government authority.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">24. Privacy</h2>
          <p className="mt-2">Your use of APPZENO is also governed by our <strong>Privacy Policy</strong>. The Privacy Policy explains how we may collect, use, store, protect, and manage personal information. Please review: <Link href="/privacy-policy" className="text-saffron-600 underline">Privacy Policy</Link></p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">25. Cookies</h2>
          <p className="mt-2">APPZENO uses cookies and similar technologies as described in our Cookie Policy. You can manage optional cookie preferences through the available cookie settings functionality. <Link href="/cookie-policy" className="text-saffron-600 underline">Cookie Policy</Link> • <Link href="/cookie-preferences" className="text-saffron-600 underline">Cookie Settings</Link></p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">26. Security</h2>
          <p className="mt-2">We implement reasonable technical and organizational measures designed to protect the platform and information handled through it. However, no online system can be guaranteed to be completely secure. Users should also use strong passwords, avoid sharing login credentials, keep devices secure, avoid entering sensitive information on suspicious websites, and verify external government URLs before submitting information.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">27. Third-Party Services</h2>
          <p className="mt-2">APPZENO may integrate or interact with third-party technologies and services. Examples may include authentication services, analytics services, hosting providers, maps, communication services, search services, advertising services, and social media platforms. Third-party services may have separate terms and privacy policies. Your use of those services may be subject to their respective terms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">28. Social Media and Sharing</h2>
          <p className="mt-2">APPZENO may provide sharing options for platforms such as Facebook, Instagram, YouTube, Telegram, WhatsApp, LinkedIn, and X/Twitter. When you use a third-party social platform, your activity is subject to that platform's terms and privacy policies. APPZENO does not control how those platforms process information.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">29. Notifications and Alerts</h2>
          <p className="mt-2">If APPZENO provides email alerts, push notifications, job alerts, SMS notifications, or other notification services, users may be able to configure their notification preferences. Notifications may include new government jobs, application deadlines, admit cards, results, government schemes, and important notices. We do not guarantee that every eligible update will be delivered through every notification channel.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">30. User Feedback and Suggestions</h2>
          <p className="mt-2">We welcome suggestions for improving APPZENO. By submitting feedback or suggestions, you grant APPZENO permission to use the feedback for improving, developing, or promoting the platform, without creating an obligation to compensate you, unless otherwise agreed. Please do not submit confidential or proprietary information through general feedback forms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">31. Limitation of Liability</h2>
          <p className="mt-2">To the maximum extent permitted by applicable law, APPZENO and its operators shall not be responsible for losses or damages arising from reliance on outdated information, incorrect government information, changes to government policies, missed application deadlines, rejected applications, failed examinations, government recruitment decisions, external website downtime, third-party website errors, payment issues on external websites, unauthorized third-party activities, technical interruptions, or internet or network failures. Users remain responsible for verifying important information with the relevant official authority.</p>
          <p className="mt-2">Nothing in these Terms is intended to exclude liability that cannot legally be excluded under applicable law.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">32. Indemnification</h2>
          <p className="mt-2">To the extent permitted by applicable law, you agree to indemnify and hold harmless APPZENO and its operators from claims, losses, liabilities, damages, or expenses arising from your misuse of the website, your violation of these Terms, your violation of applicable law, your infringement of another person's rights, or fraudulent or unauthorized activities conducted through your account.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">33. Suspension or Termination</h2>
          <p className="mt-2">APPZENO may suspend or terminate access to accounts or features where reasonably necessary, including in cases involving fraud, abuse, security threats, violation of these Terms, unauthorized access, illegal activity, or platform manipulation. We may also discontinue features or services where necessary for operational, legal, or security reasons.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">34. Changes to These Terms</h2>
          <p className="mt-2">We may update these Terms from time to time. Changes may be made because of new features, changes to the platform, changes to applicable law, security improvements, changes to third-party integrations, or operational requirements. When appropriate, we may update the Effective Date and Last Updated date. Your continued use of the website after an updated version becomes available may constitute acceptance of the revised Terms to the extent permitted by applicable law.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">35. Governing Law</h2>
          <p className="mt-2">These Terms shall be governed by the laws applicable in <strong>India</strong>, subject to applicable statutory and regulatory requirements. Any dispute shall be subject to the jurisdiction of the competent courts having jurisdiction over the applicable location of the platform operator, subject to applicable law.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">36. Severability</h2>
          <p className="mt-2">If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, that provision shall be interpreted or modified to the extent necessary, and the remaining provisions shall continue to apply to the extent permitted by law.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">37. Entire Agreement</h2>
          <p className="mt-2">These Terms, together with the applicable Privacy Policy, Cookie Policy, Refund Policy if applicable, and other policies expressly referenced by APPZENO, constitute the applicable terms governing your use of the platform, subject to any specific terms displayed for particular services.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">38. Contact Us</h2>
          <p className="mt-2">If you have questions, complaints, correction requests, or feedback regarding these Terms, please contact us through:</p>
          <p className="mt-2"><strong>APPZENO Sarkari Portal</strong></p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Contact Us:</strong> <Link href="/contact" className="text-saffron-600 underline">/contact</Link></li>
            <li><strong>Privacy Policy:</strong> <Link href="/privacy-policy" className="text-saffron-600 underline">/privacy-policy</Link></li>
            <li><strong>Cookie Policy:</strong> <Link href="/cookie-policy" className="text-saffron-600 underline">/cookie-policy</Link></li>
            <li><strong>Cookie Settings:</strong> <Link href="/cookie-preferences" className="text-saffron-600 underline">/cookie-preferences</Link></li>
            <li><strong>Help & Support:</strong> <Link href="/help" className="text-saffron-600 underline">/help</Link></li>
          </ul>
          <p className="mt-2">For a legal or privacy-related request, please provide sufficient information for us to understand and respond to your request.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">39. Important User Notice</h2>
          <p className="mt-2">Before using information published on APPZENO Sarkari Portal, remember:</p>
          <p className="mt-2"><strong>APPZENO Sarkari Portal is an independent information platform. It helps users discover government-related information and official links but does not replace the official government website or notification.</strong></p>
          <p className="mt-2">For any important matter, always verify:</p>
          <p className="mt-2 font-extrabold text-navy-900">Official Notification → Official Website → Eligibility → Dates → Fees → Application Process</p>
          <p className="mt-2">before taking action.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900">Policy Information</h2>
          <div className="mt-2 rounded-xl border border-navy-100 bg-paper p-4">
            <p className="font-extrabold text-navy-900">Document: Terms & Conditions</p>
            <p className="mt-1 text-ink-soft"><strong>Platform:</strong> APPZENO Sarkari Portal</p>
            <p className="text-ink-soft"><strong>Version:</strong> 1.0</p>
            <p className="text-ink-soft"><strong>Effective Date:</strong> 13 August 2026</p>
            <p className="text-ink-soft"><strong>Last Updated:</strong> 13 August 2026</p>
            <p className="text-ink-soft"><strong>Status:</strong> Published</p>
          </div>
        </section>
      </div>
    </div>
  );
}
