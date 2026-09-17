"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { Field, inputCls, Spinner, useToast } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { toHindi } from "@/lib/transliterate";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState({
    ticker: "",
    helpline: "",
    email: "",
    about: "",
    footerNote: "",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    telegram: "",
    whatsapp: "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const { toast, show, node } = useToast();

  const utils = api.useUtils();
  const settingsQuery = api.system.adminSettings.useQuery();
  const loading = settingsQuery.isLoading;
  const synced = useRef(false);

  useEffect(() => {
    const rows = settingsQuery.data as unknown as { key: string; value: string }[] | undefined;
    if (!rows || synced.current) return;
    synced.current = true;
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value ?? "";
    setSite({
      ticker: map.ticker ?? "",
      helpline: map.helpline ?? "",
      email: map.email ?? "",
      about: map.about ?? "",
      footerNote: map.footerNote ?? "",
      facebook: map.facebook ?? "",
      twitter: map.twitter ?? "",
      instagram: map.instagram ?? "",
      youtube: map.youtube ?? "",
      linkedin: map.linkedin ?? "",
      telegram: map.telegram ?? "",
      whatsapp: map.whatsapp ?? "",
    });
  }, [settingsQuery.data]);

  useEffect(() => {
    if (settingsQuery.isError) show("सेटिंग्स लोड नहीं हुईं", "err");
  }, [settingsQuery.isError, show]);

  const upsertMut = api.system.adminUpsertSetting.useMutation();
  const passwordMut = api.system.changePassword.useMutation();

  const saveSite = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(site)) {
        await upsertMut.mutateAsync({ key, value });
      }
      show("सेटिंग्स सहेज गईं — साइट पर तुरंत लागू");
      await utils.system.adminSettings.invalidate();
    } catch {
      show("सेव नहीं हो पाया", "err");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pw.next.length < 8) {
      show("नया पासवर्ड कम से कम 8 अक्षरों का हो", "err");
      return;
    }
    if (pw.next !== pw.confirm) {
      show("दोनों पासवर्ड मेल नहीं खा रहे", "err");
      return;
    }
    setPwBusy(true);
    try {
      await passwordMut.mutateAsync({ currentPassword: pw.current, newPassword: pw.next });
      show("पासवर्ड बदल दिया गया");
      setPw({ current: "", next: "", confirm: "" });
    } catch (e) {
      show(e instanceof Error ? e.message : "पासवर्ड नहीं बदला जा सका", "err");
    } finally {
      setPwBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {node}
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
          Site Control
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          सेटिंग्स
        </h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          टिकर, संपर्क और सुरक्षा — सब यहीं से
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Site content */}
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-navy-900 text-saffron-400">
              <Icon name="megaphone" size={17} />
            </span>
            <h2 className="font-display text-lg font-bold text-navy-950">साइट कंटेंट</h2>
          </div>

          <div className="space-y-4">
            <Field label="टिकर सूचना" hint="• से अलग करें — हेडर के नीचे चलती है">
              <textarea
                className={`${inputCls} min-h-[76px] resize-y`}
                value={site.ticker}
                onChange={(e) => setSite({ ...site, ticker: e.target.value })}
                placeholder="सूचना 1 • सूचना 2 • सूचना 3"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="हेल्पलाइन नंबर">
                <input
                  className={inputCls}
                  value={site.helpline}
                  onChange={(e) => setSite({ ...site, helpline: e.target.value })}
                  placeholder="1800-11-1551"
                />
              </Field>
              <Field label="ईमेल">
                <input
                  className={inputCls}
                  value={site.email}
                  onChange={(e) => setSite({ ...site, email: e.target.value })}
                  placeholder="help@example.in"
                />
              </Field>
            </div>
            <Field label="पोर्टल का परिचय (फुटर में)">
              <textarea
                className={`${inputCls} min-h-[76px] resize-y`}
                value={site.about}
                onChange={(e) => setSite({ ...site, about: e.target.value })}
                placeholder="APPZENO Sarkari Portal भारत की सरकारी सेवाओं की एक निःशुल्क निर्देशिका है..."
              />
            </Field>
            <Field label="फुटर नोट / अस्वीकरण">
              <textarea
                className={`${inputCls} min-h-[76px] resize-y`}
                value={site.footerNote}
                onChange={(e) => setSite({ ...site, footerNote: e.target.value })}
                placeholder="यह एक निजी सूचना निर्देशिका है..."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facebook URL" hint="खाली छोड़ें — आइकॉन नहीं दिखेगा">
                <input
                  className={inputCls}
                  value={site.facebook}
                  onChange={(e) => setSite({ ...site, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </Field>
              <Field label="Twitter / X URL">
                <input
                  className={inputCls}
                  value={site.twitter}
                  onChange={(e) => setSite({ ...site, twitter: e.target.value })}
                  placeholder="https://x.com/..."
                />
              </Field>
              <Field label="Instagram URL">
                <input
                  className={inputCls}
                  value={site.instagram}
                  onChange={(e) => setSite({ ...site, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </Field>
              <Field label="YouTube URL">
                <input
                  className={inputCls}
                  value={site.youtube}
                  onChange={(e) => setSite({ ...site, youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  className={inputCls}
                  value={site.linkedin}
                  onChange={(e) => setSite({ ...site, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </Field>
              <Field label="Telegram URL">
                <input
                  className={inputCls}
                  value={site.telegram}
                  onChange={(e) => setSite({ ...site, telegram: e.target.value })}
                  placeholder="https://t.me/..."
                />
              </Field>
              <Field label="WhatsApp URL">
                <input
                  className={inputCls}
                  value={site.whatsapp}
                  onChange={(e) => setSite({ ...site, whatsapp: e.target.value })}
                  placeholder="https://wa.me/..."
                />
              </Field>
            </div>
            <div className="flex justify-end border-t border-navy-100 pt-4">
              <button
                type="button"
                onClick={saveSite}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" />
                ) : (
                  <Icon name="check" size={16} strokeWidth={2.6} />
                )}
                सेटिंग्स सहेजें
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-leaf-500 text-white">
                <Icon name="key" size={17} />
              </span>
              <h2 className="font-display text-lg font-bold text-navy-950">पासवर्ड बदलें</h2>
            </div>
            <div className="space-y-4">
              <Field label="वर्तमान पासवर्ड" required>
                <input
                  type="password"
                  className={inputCls}
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  autoComplete="current-password"
                />
              </Field>
              <Field label="नया पासवर्ड" required hint="कम से कम 8 अक्षर">
                <input
                  type="password"
                  className={inputCls}
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="नया पासवर्ड (दोबारा)" required>
                <input
                  type="password"
                  className={inputCls}
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  autoComplete="new-password"
                />
              </Field>
              <button
                type="button"
                onClick={changePassword}
                disabled={pwBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-navy-800 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {pwBusy ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Icon name="shield" size={16} />
                )}
                पासवर्ड अपडेट करें
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-5">
            <div className="flex gap-3">
              <Icon name="alert" size={20} className="shrink-0 text-saffron-700" />
              <div className="text-[13px] leading-relaxed text-saffron-900">
                <p className="font-extrabold">सुरक्षा सलाह</p>
                <p className="mt-1 font-semibold">
                  डेमो पासवर्ड बदलकर मज़बूत पासवर्ड रखें। यह डैशबोर्ड साइट की हर सेवा और हर लिंक को नियंत्रित करता है।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
