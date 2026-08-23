import { getAdmin } from "@/lib/auth";
import { getNewsletterSettings } from "@/lib/newsletter-template";
import { Icon } from "@/components/icons";

export default async function AdminNewsletterTemplatesPage() {
  const admin = await getAdmin();
  if (!admin) {
    return (
      <div className="p-6">
        <p className="text-red-600">Authentication required. Please <a href="/login" className="text-saffron-600">log in</a>.</p>
      </div>
    );
  }
  const settings = getNewsletterSettings();

  const NAV_LINKS = [
    { label: "Jobs", url: "/jobs" },
    { label: "Results", url: "/jobs?tab=results" },
    { label: "Admit Cards", url: "/jobs?tab=admit-cards" },
    { label: "Government Schemes", url: "/schemes" },
    { label: "Services", url: "/services" },
  ];

  const LEGAL_LINKS = [
    { label: "About Us", url: "/about" },
    { label: "Contact Us", url: "/contact" },
    { label: "Privacy Policy", url: "/privacy-policy" },
    { label: "Terms & Conditions", url: "/terms-conditions" },
    { label: "Disclaimer", url: "/disclaimer" },
    { label: "Cookie Policy", url: "/cookie-policy" },
  ];

  const SOCIAL_LINKS = [
    "youtube", "telegram", "whatsapp", "facebook", "instagram", "linkedin", "twitter"
  ];

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
          Content Manager
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          Newsletter Templates
        </h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          Master template — Header & Footer are locked for brand consistency
        </p>
      </div>

      <div className="mb-6 rounded-xl border-2 border-navy-100 bg-navy-50/30">
        <div className="border-b border-navy-100 px-5 py-3 flex items-center gap-2 text-navy-700">
          <Icon name="shield" size={16} className="text-saffron-500" />
          <span className="font-bold text-sm">HEADER — Locked</span>
        </div>
        <div className="mt-2 rounded-lg bg-navy-950 p-4 text-center text-white">
          <div className="text-lg font-bold">APPZENO <span className="text-saffron-400">Sarkari</span> Portal</div>
          <div className="text-[11px] opacity-60 text-white/70">आपके काम की जानकारी, एक जगह।</div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-white/50">
            {NAV_LINKS.map((n) => (
              <a key={n.url} href={n.url} className="hover:text-white">{n.label}</a>
            ))}
          </div>
        </div>

        <div className="border-y border-navy-100 px-5 py-3 flex items-center gap-2 text-navy-700">
          <Icon name="pencil" size={16} className="text-leaf-500" />
          <span className="font-bold text-sm">CONTENT AREA — Editable</span>
          <span className="text-xs font-normal text-ink-soft ml-auto">Managed via Create Newsletter page</span>
        </div>
        <div className="p-5 bg-paper min-h-[100px]">
          <p className="text-center text-sm text-ink-soft py-8">Content blocks editor → /admin/newsletter/create</p>
        </div>

        <div className="border-t border-navy-100 px-5 py-3 flex items-center gap-2 text-navy-700">
          <Icon name="shield" size={16} className="text-saffron-500" />
          <span className="font-bold text-sm">FOOTER — Locked</span>
        </div>
        <div className="p-5 bg-navy-950 text-navy-300">
          <div className="mb-2 font-bold text-saffron-400">APPZENO Sarkari Portal</div>
          <div className="text-[11px] mb-2">आपके काम की जानकारी, एक जगह।</div>
          <div className="my-1 text-[11px]">
            {LEGAL_LINKS.map((l) => (
              <a key={l.url} href={l.url} className="mr-3 hover:text-white">{l.label}</a>
            ))}
          </div>
          <div className="my-1 text-[11px]">
            {SOCIAL_LINKS.map((s) => (
              <span key={s} className="mr-3">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            ))}
          </div>
          <div className="text-[11px]">Unsubscribe | Manage Preferences</div>
          <div className="mt-1 text-[10px]">© 2026 APPZENO Sarkari Portal. All Rights Reserved.</div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-navy-800">Email Settings</h2>
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">Sender Name</label>
              <input
                defaultValue={settings.senderName}
                readOnly
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">Sender Email</label>
              <input
                defaultValue={settings.senderEmail}
                readOnly
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none"
              />
              <p className="mt-1 text-[10px] text-ink-soft">Configure via NEWSLETTER_SETTINGS env var</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">Website URL</label>
              <input
                defaultValue={settings.websiteUrl}
                readOnly
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
