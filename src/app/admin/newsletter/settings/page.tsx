import { getAdmin } from "@/lib/auth";
import { getNewsletterSettings } from "@/lib/newsletter-template";

export default async function AdminNewsletterSettingsPage() {
  const admin = await getAdmin();
  if (!admin) {
    return (
      <div className="p-6">
        <p className="text-red-600">Authentication required. Please <a href="/login" className="text-saffron-600">log in</a>.</p>
      </div>
    );
  }
  const settings = getNewsletterSettings();

  const platforms = ["youtube", "telegram", "whatsapp", "facebook", "instagram", "linkedin", "twitter"];

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
          Content Manager
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          Newsletter Settings
        </h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          Configure sender details, social links, and email delivery
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-display text-lg font-bold text-navy-800">Sender Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">Sender Name</label>
              <input
                defaultValue={settings.senderName}
                readOnly
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none"
              />
              <p className="mt-1 text-[11px] text-ink-soft">Default: APPZENO Sarkari Portal</p>
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">Sender Email</label>
              <input
                defaultValue={settings.senderEmail}
                readOnly
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none"
              />
              <p className="mt-1 text-[11px] text-ink-soft">Default: newsletter@addiessarkari.in</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-display text-lg font-bold text-navy-800">Website & Links</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-extrabold text-navy-900 mb-1.5">Website URL</label>
              <input
                defaultValue={settings.websiteUrl}
                readOnly
                className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-display text-lg font-bold text-navy-800">Social Media Links</h2>
          <p className="mb-3 text-xs text-ink-soft">
            Set these via <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs">NEWSLETTER_SETTINGS</code> environment variable.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {platforms.map((platform) => (
              <div key={platform}>
                <label className="block text-[12px] font-bold text-navy-700 mb-1 capitalize">{platform}</label>
                <input
                  defaultValue={settings[platform] || ""}
                  readOnly
                  className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-xs font-semibold text-ink outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-display text-lg font-bold text-navy-800">Email Delivery</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-navy-900">Delivery API</p>
                <p className="text-xs text-ink-soft">NEWSLETTER_SEND_API environment variable</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                process.env.NEWSLETTER_SEND_API
                  ? "bg-leaf-100 text-leaf-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                <span className={`size-1.5 rounded-full ${
                  process.env.NEWSLETTER_SEND_API ? "bg-leaf-500" : "bg-rose-500"
                }`} />
                {process.env.NEWSLETTER_SEND_API ? "Configured" : "Not Configured"}
              </span>
            </div>
            {process.env.NEWSLETTER_SEND_API && (
              <p className="text-[11px] text-ink-soft">Endpoint: <code className="rounded bg-navy-100 px-1 py-0.5">{process.env.NEWSLETTER_SEND_API}</code></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
