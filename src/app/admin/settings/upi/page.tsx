"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { Field, inputCls, Spinner, Toggle, useToast } from "@/components/admin/ui";
import { Icon } from "@/components/icons";

type PaymentSettings = {
  id: string;
  upiEnabled: boolean;
  upiId: string;
  payeeName: string;
  merchantName: string;
  paymentInstructions: string;
  gstPercent: number;
  whatsappNumber: string;
  updatedAt: string;
};

export default function AdminUPISettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    id: "default",
    upiEnabled: false,
    upiId: "",
    payeeName: "",
    merchantName: "",
    paymentInstructions: "",
    gstPercent: 0,
    whatsappNumber: "",
    updatedAt: "",
  });
  const { show, node } = useToast();

  const utils = api.useUtils();
  const paymentQuery = api.payment.adminPaymentSettings.useQuery();
  const loading = paymentQuery.isLoading;
  const synced = useRef(false);

  useEffect(() => {
    const s = paymentQuery.data as unknown as Partial<PaymentSettings> | null | undefined;
    if (s && !synced.current) {
      synced.current = true;
      setSettings((prev) => ({ ...prev, ...s }));
    }
  }, [paymentQuery.data]);

  useEffect(() => {
    if (paymentQuery.isError) show("सेटिंग्स लोड नहीं हुईं", "err");
  }, [paymentQuery.isError, show]);

  const upsertMut = api.payment.adminUpsertPaymentSettings.useMutation();

  const save = async () => {
    setSaving(true);
    try {
      const { id, updatedAt, ...payload } = settings;
      void id;
      void updatedAt;
      await upsertMut.mutateAsync({ ...payload });
      show("सेटिंग्स सेव हो गईं");
      await utils.payment.adminPaymentSettings.invalidate();
    } catch {
      show("सेव नहीं हो पाया", "err");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Settings</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">UPI & Payment Settings</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">Configure UPI payment details and GST settings</p>
      </div>

      <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
        <div className="space-y-4">
          <Toggle
            checked={settings.upiEnabled}
            onChange={(v) => setSettings({ ...settings, upiEnabled: v })}
            label="UPI Enabled"
            desc="Enable UPI payment method for advertisements"
          />
          <Field label="UPI ID">
            <input className={inputCls} value={settings.upiId} onChange={(e) => setSettings({ ...settings, upiId: e.target.value })} placeholder="addies@upi" />
          </Field>
          <Field label="Payee Name">
            <input className={inputCls} value={settings.payeeName} onChange={(e) => setSettings({ ...settings, payeeName: e.target.value })} placeholder="APPZENO WEB SERVICES PRIVATE LIMITED" />
          </Field>
          <Field label="Merchant Name">
            <input className={inputCls} value={settings.merchantName} onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })} placeholder="APPZENO Sarkari Portal" />
          </Field>
          <Field label="Payment Instructions">
            <textarea className={`${inputCls} min-h-[80px] resize-y`} value={settings.paymentInstructions} onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })} placeholder="Payment instructions for advertisers..." />
          </Field>
          <Field label="GST (%)">
            <input type="number" className={inputCls} value={settings.gstPercent} onChange={(e) => setSettings({ ...settings, gstPercent: Number(e.target.value) })} placeholder="18" />
          </Field>
          <Field label="WhatsApp Number">
            <input className={inputCls} value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="+91XXXXXXXXXX" />
          </Field>
        </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
          {saving ? <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" /> : <Icon name="check" size={16} strokeWidth={2.6} />}
          सेव करें
        </button>
      </div>
      {node}
      </div>
    </div>
  );
}
