"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, Spinner, useToast, inputCls } from "@/components/admin/ui";
import NewsletterBlockEditor, { type NewsletterBlock } from "@/components/newsletter-block-editor";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { renderNewsletterHtml, type NewsletterTemplateData } from "@/lib/newsletter-template";

type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed";

type Campaign = {
  id: string;
  title: string;
  subject: string;
  previewText: string;
  status: CampaignStatus;
  contentBlocks: NewsletterBlock[];
  audience: "all" | "active";
  scheduledAt: string | null;
  senderName?: string;
  senderEmail?: string;
};

export default function AdminNewsletterCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isEdit = Boolean(id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { toast, show, node } = useToast();

   const load = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { campaign: Campaign };
      setCampaign({
        ...data.campaign,
        contentBlocks: data.campaign.contentBlocks || [],
      });
    } catch (err) {
      console.error("Failed to load campaign:", err);
      show("कैंपेन नहीं मिला", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) void load();
  }, [isEdit]);

  const draftForm: Campaign = {
    id: "",
    title: "",
    subject: "",
    previewText: "",
    status: "draft",
    contentBlocks: [],
    audience: "active",
    scheduledAt: null,
  };

  const form = campaign || draftForm;

  const updateField = (field: keyof Campaign, value: unknown) => {
    setCampaign((prev) => (prev ? { ...prev, [field]: value } : { ...draftForm, [field]: value }));
  };

  const save = async (status: CampaignStatus) => {
    if (!form.title.trim() || !form.subject.trim()) {
      show("शीर्षक और विषय ज़रूरी हैं", "err");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        subject: form.subject,
        previewText: form.previewText,
        contentBlocks: form.contentBlocks,
        audience: form.audience,
        status,
      };

      if (form.scheduledAt) body.scheduledAt = form.scheduledAt;

      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/newsletter/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = (await res.json()) as { ok?: boolean; error?: string; id?: string };
      if (res.ok && data.ok) {
        show(status === "draft" ? "ड्राफ्ट सहेजा गया" : "कैंपेन सहेजा गया और शेड्यूल कर दिया गया");
        if (!isEdit) {
          router.push(`/admin/newsletter/create?id=${data.id}`);
        } else {
          void load();
        }
      } else {
        show(data.error ?? "सेव नहीं हो पाया", "err");
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    } finally {
      setSaving(false);
    }
  };

  const sendNow = async () => {
    if (!form.title.trim() || !form.subject.trim()) {
      show("शीर्षक और विषय ज़रूरी हैं", "err");
      return;
    }
    if (!window.confirm("क्या आप वाकई भेजना चाहते हैं?")) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        subject: form.subject,
        previewText: form.previewText,
        contentBlocks: form.contentBlocks,
        audience: form.audience,
        status: "draft",
      };

      let campaignId = id;

      if (!isEdit) {
        const res = await fetch("/api/admin/newsletter/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; id?: string };
        if (!res.ok || !data.ok) {
          show(data.error ?? "Save failed", "err");
          setSaving(false);
          return;
        }
        campaignId = data.id || id;
      } else {
        await fetch(`/api/admin/newsletter/campaigns/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const sendRes = await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, { method: "POST" });
      const sendData = (await sendRes.json()) as { ok?: boolean; error?: string; sent?: number; failed?: number; total?: number };
      if (sendRes.ok && sendData.ok) {
        show(`Sent to ${sendData.sent} subscribers (${sendData.failed} failed)`);
        router.push("/admin/newsletter/campaigns");
      } else {
        show(sendData.error ?? "Send failed", "err");
      }
    } catch {
      show("Network error", "err");
    } finally {
      setSaving(false);
    }
  };

  const renderPreviewHtml = () => {
    if (!campaign) return "<p>No content</p>";
    const settings: Record<string, string> = {
      websiteUrl: "https://addiessarkari.in",
      senderName: "APPZENO Sarkari Portal",
      senderEmail: "newsletter@addiessarkari.in",
    };
    const html = renderNewsletterHtml(
      {
        subject: form.subject,
        contentBlocks: form.contentBlocks,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
      },
      { email: "preview@example.com", name: "Preview User" },
      "https://addiessarkari.in/newsletter/unsubscribe?token=preview",
      settings
    );
    return html;
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      {node}
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
          Content Manager
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          {isEdit ? "कैंपेन एडिट" : "नया न्यूज़लेटर बनाएं"}
        </h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          {isEdit ? "Campaign में बदलाव करें" : "Standard header और footer स्वचालित रूप से लागू होगा"}
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field label="इंटर्नल टाइटल" required hint="Campaign name for reference">
          <input
            className={inputCls}
            value={form.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="जैसे: Weekly Jobs Update – 17 Aug 2026"
          />
        </Field>
        <Field label="ईमेल विषय" required hint="What subscribers see in their inbox">
          <input
            className={inputCls}
            value={form.subject || ""}
            onChange={(e) => updateField("subject", e.target.value)}
            placeholder="🚀 This Week's Latest Government Jobs & Updates"
          />
        </Field>
      </div>

      <div className="mb-6">
        <Field label="प्रीव्यू टेक्स्ट" hint="Short preview snippet in email inbox">
          <input
            className={inputCls}
            value={form.previewText || ""}
            onChange={(e) => updateField("previewText", e.target.value)}
            placeholder="Latest jobs, results, admit cards and schemes..."
          />
        </Field>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field label="शेड्यूल ऑडियंस">
          <select
            value={form.audience}
            onChange={(e) => updateField("audience", e.target.value as "all" | "active")}
            className={inputCls}
          >
            <option value="active">Active Subscribers only</option>
            <option value="all">All Subscribers</option>
          </select>
        </Field>
        {form.status === "draft" && (
          <Field label="Schedule Date & Time">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.scheduledAt?.slice(0, 16) || ""}
              onChange={(e) => updateField("scheduledAt", e.target.value || null)}
            />
            <p className="mt-1 text-[11px] text-ink-soft">
              Leave empty to keep as draft or send now.
            </p>
          </Field>
        )}
      </div>

      {/* Locked Header Preview */}
      <div className="mb-4 rounded-xl border-2 border-navy-100 bg-navy-50/30 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-navy-700">
          <Icon name="shield" size={16} className="text-saffron-500" />
          <span>STANDARD HEADER — Locked</span>
          <span className="text-xs font-normal text-ink-soft">(Auto-applied to every newsletter)</span>
        </div>
        <div className="mt-2 rounded-lg bg-navy-950 p-4 text-center text-white">
          <div className="text-lg font-bold">APPZENO <span className="text-saffron-400">Sarkari</span> Portal</div>
          <div className="text-[11px] opacity-60">आपके काम की जानकारी, एक जगह।</div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-navy-700">
          <Icon name="pencil" size={16} className="text-leaf-500" />
          <span>CONTENT AREA — Editable</span>
          <span className="text-xs font-normal text-ink-soft">(Only this area can be edited)</span>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-navy-200 bg-surface p-5 shadow-sm">
        <NewsletterBlockEditor
          blocks={form.contentBlocks || []}
          onChange={(blocks) => updateField("contentBlocks", blocks)}
        />
      </div>

      {/* Locked Footer Preview */}
      <div className="mb-6 rounded-xl border-2 border-navy-100 bg-navy-50/30 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-navy-700">
          <Icon name="shield" size={16} className="text-saffron-500" />
          <span>STANDARD FOOTER — Locked</span>
          <span className="text-xs font-normal text-ink-soft">(Auto-applied to every newsletter)</span>
        </div>
        <div className="mt-2 rounded-lg bg-navy-950 p-4 text-center text-navy-300">
          <div className="mb-1 font-bold text-saffron-400">APPZENO Sarkari Portal</div>
          <div className="mb-2 text-[11px]">आपके काम की जानकारी, एक जगह।</div>
          <div className="text-[11px]">About | Contact | Privacy | Terms | Disclaimer | Cookie Policy</div>
          <div className="my-1 text-[11px]">YouTube | Telegram | WhatsApp | Facebook | Instagram | LinkedIn | X</div>
          <div className="text-[11px]">Unsubscribe | Manage Preferences</div>
          <div className="mt-1 text-[10px]">© 2026 APPZENO Sarkari Portal</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-navy-200 pt-5">
        <button
          type="button"
          onClick={() => save("draft")}
          disabled={saving || !form.title || !form.subject}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-surface px-4 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:bg-navy-50 disabled:opacity-60 cursor-pointer"
        >
          {saving ? <span className="size-4 animate-spin rounded-full border-2 border-navy-300 border-t-navy-800" /> : <Icon name="eye" size={16} />}
          सहेजें (Draft)
        </button>

        <button
          type="button"
          onClick={() => save("scheduled")}
          disabled={saving || !form.title || !form.subject || !form.scheduledAt}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-surface px-4 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:bg-navy-50 disabled:opacity-60 cursor-pointer"
        >
          <Icon name="clock" size={16} />
          शेड्यूल करें
        </button>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          disabled={!form.title || !form.subject}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-surface px-4 py-2.5 text-sm font-bold text-navy-900 transition-colors hover:bg-navy-50 disabled:opacity-60 cursor-pointer"
        >
          <Icon name="eye" size={16} />
          Preview
        </button>

        <div className="ml-auto flex items-center gap-2">
          {isEdit && (form.status === "draft" || (form as any).status === "scheduled") && (
            <button
              type="button"
              onClick={sendNow}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Icon name="mail" size={16} strokeWidth={2.6} />}
              Send Now
            </button>
          )}
          {!isEdit && (
            <button
              type="button"
              onClick={() => save("scheduled")}
              disabled={saving || !form.title || !form.subject}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Icon name="plus" size={16} strokeWidth={2.4} />
              Create & Schedule
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
              <h3 className="font-display text-lg font-bold text-navy-950">Newsletter Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-navy-500 hover:bg-navy-50 hover:text-navy-900 cursor-pointer"
              >
                <Icon name="x" size={17} />
              </button>
            </div>
            <div className="p-5">
              <div className="border border-navy-200">
                <iframe
                  title="Newsletter Preview"
                  srcDoc={renderPreviewHtml()}
                  className="h-[70vh] w-full border-0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </div>
            <div className="border-t border-navy-100 px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
