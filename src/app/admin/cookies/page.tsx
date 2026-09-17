"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { Field, inputCls, Spinner, useToast } from "@/components/admin/ui";
import { Icon } from "@/components/icons";

type CookieCategory = {
  id: string;
  name: string;
  code: string;
  description: string;
  required: boolean;
  defaultEnabled: boolean;
  status: string;
  displayOrder: number;
};

export default function AdminCookiesPage() {
  const [settings, setSettings] = useState({
    settingId: "COOKIE-SETTINGS-001",
    bannerEnabled: true,
    bannerTitle: "We use cookies to improve your experience",
    bannerDescription: "",
    position: "bottom",
    layout: "banner",
    policyVersion: "1.0",
    policyUrl: "/cookie-policy",
    privacyPolicyUrl: "/privacy-policy",
  });
  const [editingCat, setEditingCat] = useState<CookieCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: "", code: "", description: "", required: false, defaultEnabled: true, status: "active", displayOrder: 0 });
  const { toast, show, node } = useToast();
  const utils = api.useUtils();

  const settingsQuery = api.cookie.adminSettings.useQuery();
  const loading = settingsQuery.isLoading;
  const categories = useMemo(() => (settingsQuery.data?.categories ?? []) as unknown as CookieCategory[], [settingsQuery.data]);

  useEffect(() => {
    const s = settingsQuery.data?.settings as unknown as Partial<{
      settingId: string;
      bannerEnabled: boolean;
      bannerTitle: string;
      bannerDescription: string;
      position: string;
      layout: string;
      policyVersion: string;
      policyUrl: string;
      privacyPolicyUrl: string;
    }> | null | undefined;
    if (s) setSettings((prev) => ({ ...prev, ...s }));
  }, [settingsQuery.data]);

  useEffect(() => {
    if (settingsQuery.isError) show("लोड नहीं हो पाया", "err");
  }, [settingsQuery.isError, show]);

  const settingsMut = api.cookie.upsertSettings.useMutation({
    onSuccess: () => {
      show("कुकी सेटिंग्स सहेजी गईं");
      void utils.cookie.adminSettings.invalidate();
    },
    onError: () => show("सेव नहीं हो पाया", "err"),
  });
  const categoryMut = api.cookie.upsertCategory.useMutation({
    onSuccess: () => {
      show(editingCat ? "श्रेणी अपडेट हुई" : "श्रेणी बन गई");
      setEditingCat(null);
      setCatForm({ name: "", code: "", description: "", required: false, defaultEnabled: true, status: "active", displayOrder: 0 });
      void utils.cookie.adminSettings.invalidate();
    },
    onError: (e) => show(e.message || "सेव नहीं हो पाया", "err"),
  });
  const saving = settingsMut.isPending || categoryMut.isPending;

  const saveSettings = () => {
    settingsMut.mutate({ ...settings });
  };

  const saveCategory = () => {
    if (editingCat) categoryMut.mutate({ id: editingCat.id, ...catForm });
    else categoryMut.mutate({ ...catForm });
  };

  const deleteCategory = (id: string) => {
    if (!id || !window.confirm("क्या आप इस श्रेणी को हटाना चाहते हैं?")) return;
    show("श्रेणी हटाना tRPC में उपलब्ध नहीं", "err");
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {node}
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Site Control</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">कुकी प्रबंधन</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">कुकी बैनर, श्रेणियाँ और सहमति रिकॉर्ड</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cookie Settings */}
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-navy-900 text-saffron-400">
              <Icon name="settings" size={17} />
            </span>
            <h2 className="font-display text-lg font-bold text-navy-950">कुकी बैनर सेटिंग्स</h2>
          </div>
          <div className="space-y-4">
            <Field label="बैनर शीर्षक">
              <input className={inputCls} value={settings.bannerTitle} onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })} />
            </Field>
            <Field label="बैनर विवरण">
              <textarea className={`${inputCls} min-h-[76px] resize-y`} value={settings.bannerDescription} onChange={(e) => setSettings({ ...settings, bannerDescription: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="पॉलिसी संस्करण">
                <input className={inputCls} value={settings.policyVersion} onChange={(e) => setSettings({ ...settings, policyVersion: e.target.value })} />
              </Field>
              <Field label="स्थिति">
                <select className={`${inputCls} cursor-pointer`} value={settings.position} onChange={(e) => setSettings({ ...settings, position: e.target.value })}>
                  <option value="bottom">नीचे</option>
                  <option value="top">ऊपर</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end border-t border-navy-100 pt-4">
              <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
                {saving ? <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" /> : <Icon name="check" size={16} strokeWidth={2.6} />}
                सेटिंग्स सहेजें
              </button>
            </div>
          </div>
        </div>

        {/* Cookie Categories */}
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-navy-900 text-saffron-400">
              <Icon name="folder" size={17} />
            </span>
            <h2 className="font-display text-lg font-bold text-navy-950">कुकी श्रेणियाँ</h2>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="नाम">
                <input className={inputCls} value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
              </Field>
              <Field label="कोड">
                <input className={inputCls} value={catForm.code} onChange={(e) => setCatForm({ ...catForm, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })} />
              </Field>
            </div>
            <Field label="विवरण">
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="क्रम">
                <input type="number" className={inputCls} value={catForm.displayOrder} onChange={(e) => setCatForm({ ...catForm, displayOrder: Number(e.target.value) })} />
              </Field>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  <input type="checkbox" checked={catForm.required} onChange={(e) => setCatForm({ ...catForm, required: e.target.checked })} className="h-4 w-4 rounded accent-saffron-600" />
                  आवश्यक
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  <input type="checkbox" checked={catForm.defaultEnabled} onChange={(e) => setCatForm({ ...catForm, defaultEnabled: e.target.checked })} className="h-4 w-4 rounded accent-saffron-600" />
                  डिफॉल्ट चालू
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setEditingCat(null); setCatForm({ name: "", code: "", description: "", required: false, defaultEnabled: true, status: "active", displayOrder: 0 }); }} className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-ink-soft hover:bg-navy-50 cursor-pointer">रद्द करें</button>
              <button type="button" onClick={saveCategory} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-leaf-500 disabled:opacity-60 cursor-pointer">
                {saving ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Icon name="check" size={16} strokeWidth={2.6} />}
                {editingCat ? "अपडेट करें" : "जोड़ें"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="mt-6 rounded-xl border border-navy-100 bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50/60 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3">क्रम</th>
                <th className="px-4 py-3">नाम</th>
                <th className="px-4 py-3">कोड</th>
                <th className="px-4 py-3 text-center">आवश्यक</th>
                <th className="px-4 py-3 text-center">डिफॉल्ट</th>
                <th className="px-4 py-3 text-center">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {categories.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-paper">
                  <td className="px-4 py-3 tnum">{c.displayOrder}</td>
                  <td className="px-4 py-3 font-extrabold text-ink">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{c.code}</td>
                  <td className="px-4 py-3 text-center">{c.required ? "✅" : "❌"}</td>
                  <td className="px-4 py-3 text-center">{c.defaultEnabled ? "✅" : "❌"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => { setEditingCat(c); setCatForm({ name: c.name, code: c.code, description: c.description, required: c.required, defaultEnabled: c.defaultEnabled, status: c.status, displayOrder: c.displayOrder }); }} className="grid size-8 place-items-center rounded-lg text-navy-600 hover:bg-navy-100 cursor-pointer" title="संपादित करें">
                        <Icon name="pencil" size={15} />
                      </button>
                      <button type="button" onClick={() => deleteCategory(c.id)} className="grid size-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer" title="हटाएं">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
