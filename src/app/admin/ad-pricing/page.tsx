"use client";

import { useCallback, useEffect, useState } from "react";
import { DeleteButton, EmptyRow, Field, inputCls, SortTh, Spinner, useToast } from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { SlidePanel } from "@/components/admin/slide-panel";
import { Icon } from "@/components/icons";
import { colorOf } from "@/components/icons";

type AdType = {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  basePrice: number;
  billingUnit: string;
  isActive: boolean;
  sortOrder: number;
};

type Placement = {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  multiplier: number;
  priority: number;
  isActive: boolean;
};

type DurationPlan = {
  id: string;
  days: number;
  discountPercent: number;
  isActive: boolean;
};

type Tab = "ad-types" | "placements" | "duration-plans";

export default function AdPricingPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ad-types");
  const [adTypes, setAdTypes] = useState<AdType[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [durationPlans, setDurationPlans] = useState<DurationPlan[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdType | Placement | DurationPlan | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  const load = useCallback(async () => {
    try {
      const [typesRes, placementsRes, durationsRes] = await Promise.all([
        fetch("/api/admin/ad-pricing/ad-types"),
        fetch("/api/admin/ad-pricing/placements"),
        fetch("/api/admin/ad-pricing/duration-plans"),
      ]);

      if (typesRes.ok) {
        const data = await typesRes.json();
        setAdTypes(data.adTypes || []);
      }
      if (placementsRes.ok) {
        const data = await placementsRes.json();
        setPlacements(data.placements || []);
      }
      if (durationsRes.ok) {
        const data = await durationsRes.json();
        setDurationPlans(data.durationPlans || []);
      }
    } catch {
      show("लोड नहीं हो पाया", "err");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { void load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    if (tab === "ad-types") {
      setForm({ code: "", nameHi: "", nameEn: "", descriptionHi: "", descriptionEn: "", basePrice: 0, billingUnit: "day", isActive: true, sortOrder: 0 });
    } else if (tab === "placements") {
      setForm({ code: "", nameHi: "", nameEn: "", multiplier: 1, priority: 0, isActive: true });
    } else {
      setForm({ days: 1, discountPercent: 0, isActive: true });
    }
    setModal(true);
  };

  const openEdit = (item: AdType | Placement | DurationPlan) => {
    setEditing(item);
    setForm({ ...item });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const endpoint = tab === "ad-types" ? "/api/admin/ad-pricing/ad-types" : tab === "placements" ? "/api/admin/ad-pricing/placements" : "/api/admin/ad-pricing/duration-plans";
      const method = editing ? "PATCH" : "POST";
      const url = editing ? `${endpoint}/${editing.id}` : endpoint;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        show(editing ? "अपडेट हो गया" : "जोड़ा गया");
        setModal(false);
        await load();
      } else {
        show("सेव नहीं हो पाया", "err");
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const currentItems = tab === "ad-types" ? adTypes : tab === "placements" ? placements : durationPlans;

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Pricing</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">Ad Pricing</h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">Configure ad types, placements, and duration plans</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95 cursor-pointer">
          <Icon name="plus" size={16} strokeWidth={2.4} />
          Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-navy-100 bg-paper p-1">
        {[
          { key: "ad-types", label: "Ad Types" },
          { key: "placements", label: "Placements" },
          { key: "duration-plans", label: "Duration Plans" },
        ].map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key as Tab)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-extrabold transition-all cursor-pointer ${tab === t.key ? "bg-navy-900 text-white shadow-sm" : "text-ink-soft hover:text-navy-800"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ad-types" && (
        <AdminTable
          data={adTypes}
          emptyText="अभी कोई एड टाइप नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-left">Code</th>
              <th className="px-3 py-3 text-left">Name (EN)</th>
              <th className="px-3 py-3 text-left">Name (HI)</th>
              <th className="px-3 py-3 text-left">Base Price</th>
              <th className="px-3 py-3 text-left">Billing</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          }
          renderRow={(item: AdType) => (
            <tr key={item.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3 font-mono text-xs font-bold text-ink">{item.code}</td>
              <td className="px-3 py-3 text-sm font-semibold text-ink">{item.nameEn}</td>
              <td className="px-3 py-3 text-sm font-semibold text-ink">{item.nameHi}</td>
              <td className="px-3 py-3 text-sm font-extrabold text-navy-900">₹{item.basePrice}</td>
              <td className="px-3 py-3 text-xs text-ink-soft capitalize">{item.billingUnit}</td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.isActive ? "bg-leaf-100 text-leaf-800" : "bg-slate-200 text-slate-600"}`}>
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(item)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"><Icon name="pencil" size={15} /></button>
                  <DeleteButton onConfirm={async () => { }} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {tab === "placements" && (
        <AdminTable
          data={placements}
          emptyText="अभी कोई प्लेसमेंट नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-left">Code</th>
              <th className="px-3 py-3 text-left">Name (EN)</th>
              <th className="px-3 py-3 text-left">Name (HI)</th>
              <th className="px-3 py-3 text-center">Multiplier</th>
              <th className="px-3 py-3 text-center">Priority</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          }
          renderRow={(item: Placement) => (
            <tr key={item.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3 font-mono text-xs font-bold text-ink">{item.code}</td>
              <td className="px-3 py-3 text-sm font-semibold text-ink">{item.nameEn}</td>
              <td className="px-3 py-3 text-sm font-semibold text-ink">{item.nameHi}</td>
              <td className="px-3 py-3 text-center text-sm font-extrabold text-navy-900">{item.multiplier}x</td>
              <td className="px-3 py-3 text-center text-sm font-extrabold text-navy-900">{item.priority}</td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.isActive ? "bg-leaf-100 text-leaf-800" : "bg-slate-200 text-slate-600"}`}>
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(item)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"><Icon name="pencil" size={15} /></button>
                  <DeleteButton onConfirm={async () => { }} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {tab === "duration-plans" && (
        <AdminTable
          data={durationPlans}
          emptyText="अभी कोई ड्यूरेशन प्लान नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-center">Days</th>
              <th className="px-3 py-3 text-center">Discount %</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          }
          renderRow={(item: DurationPlan) => (
            <tr key={item.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3 text-center text-sm font-extrabold text-navy-900">{item.days}</td>
              <td className="px-3 py-3 text-center text-sm font-extrabold text-saffron-700">{item.discountPercent}%</td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.isActive ? "bg-leaf-100 text-leaf-800" : "bg-slate-200 text-slate-600"}`}>
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(item)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"><Icon name="pencil" size={15} /></button>
                  <DeleteButton onConfirm={async () => { }} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {/* Modal */}
      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit" : "Add New"}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-navy-50 cursor-pointer">रद्द करें</button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
              {saving ? <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" /> : <Icon name="check" size={16} strokeWidth={2.6} />}
              सहेजें
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {tab === "ad-types" && (
            <>
              <Field label="Code"><input className={inputCls} value={(form.code as string) || ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })} placeholder="e.g. BANNER" /></Field>
              <Field label="Name (English)"><input className={inputCls} value={(form.nameEn as string) || ""} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Banner Advertisement" /></Field>
              <Field label="Name (Hindi)"><input className={inputCls} value={(form.nameHi as string) || ""} onChange={(e) => setForm({ ...form, nameHi: e.target.value })} placeholder="बैनर विज्ञापन" /></Field>
              <Field label="Description (English)"><textarea className={`${inputCls} min-h-[60px] resize-y`} value={(form.descriptionEn as string) || ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></Field>
              <Field label="Description (Hindi)"><textarea className={`${inputCls} min-h-[60px] resize-y`} value={(form.descriptionHi as string) || ""} onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Base Price (₹)"><input type="number" className={inputCls} value={(form.basePrice as number) || 0} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></Field>
                <Field label="Billing Unit"><select className={inputCls} value={(form.billingUnit as string) || "day"} onChange={(e) => setForm({ ...form, billingUnit: e.target.value })}><option value="day">Per Day</option><option value="week">Per Week</option><option value="month">Per Month</option></select></Field>
              </div>
              <Field label="Sort Order"><input type="number" className={inputCls} value={(form.sortOrder as number) || 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Field>
            </>
          )}

          {tab === "placements" && (
            <>
              <Field label="Code"><input className={inputCls} value={(form.code as string) || ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })} placeholder="e.g. HOME_HERO_BELOW" /></Field>
              <Field label="Name (English)"><input className={inputCls} value={(form.nameEn as string) || ""} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Hero Below Home" /></Field>
              <Field label="Name (Hindi)"><input className={inputCls} value={(form.nameHi as string) || ""} onChange={(e) => setForm({ ...form, nameHi: e.target.value })} placeholder="होम हीरो नीचे" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Multiplier"><input type="number" step="0.1" className={inputCls} value={(form.multiplier as number) || 1} onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })} /></Field>
                <Field label="Priority"><input type="number" className={inputCls} value={(form.priority as number) || 0} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></Field>
              </div>
            </>
          )}

          {tab === "duration-plans" && (
            <>
              <Field label="Days"><input type="number" className={inputCls} value={(form.days as number) || 1} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} /></Field>
              <Field label="Discount (%)"><input type="number" className={inputCls} value={(form.discountPercent as number) || 0} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></Field>
            </>
          )}
        </div>
      </SlidePanel>
    </div>
  );
}
