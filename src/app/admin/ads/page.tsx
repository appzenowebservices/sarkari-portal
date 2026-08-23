"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DeleteButton,
  EmptyRow,
  Field,
  inputCls,
  SortTh,
  Spinner,
  Toggle,
  useToast,
} from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { SlidePanel } from "@/components/admin/slide-panel";
import { Icon } from "@/components/icons";
import { detectLanguage, useTranslate } from "@/lib/translation";

type AdRow = {
  id: string;
  variant: string;
  placement: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  linkUrl: string;
  imageUrl: string;
  buttonTextHi: string;
  buttonTextEn: string;
  bgColor: string;
  textColor: string;
  isPublished: boolean;
  publishAt: string | null;
  expiresAt: string | null;
  sortOrder: number;
  clickCount: number;
  impressionCount: number;
  createdAt: string;
};

const VARIANTS = [
  { value: "link", label: "लिंक Ad", icon: "link", desc: "Simple text link" },
  { value: "image", label: "इमेज Ad", icon: "eye", desc: "Full-width image" },
  { value: "banner", label: "बैनर Ad", icon: "megaphone", desc: "Rich banner with CTA" },
  { value: "inline", label: "इनलाइन Ad", icon: "dots", desc: "Small text inline" },
  { value: "sponsored", label: "स्पॉन्सर्ड", icon: "star", desc: "Card styled" },
  { value: "popup", label: "पॉपअप Ad", icon: "alert", desc: "Overlay modal" },
];

const PLACEMENTS = [
  { value: "hero_below", label: "हीरो के नीचे (Home)" },
  { value: "categories_between", label: "श्रेणियों के बीच (Home)" },
  { value: "popular_above", label: "लोकप्रिय के ऊपर (Home)" },
  { value: "footer_above", label: "फुटर के ऊपर" },
  { value: "category_top", label: "श्रेणी पेज ऊपर" },
  { value: "category_bottom", label: "श्रेणी पेज नीचे" },
  { value: "search_top", label: "खोज पेज ऊपर" },
  { value: "sidebar", label: "साइडबार" },
];

const EMPTY_FORM = {
  variant: "banner",
  placement: "hero_below",
  titleHi: "",
  titleEn: "",
  descriptionHi: "",
  descriptionEn: "",
  linkUrl: "",
  imageUrl: "",
  buttonTextHi: "",
  buttonTextEn: "",
  bgColor: "#1f3b6e",
  textColor: "#ffffff",
  isPublished: false,
  publishAt: "",
  expiresAt: "",
  sortOrder: 0,
};

function dtLocal(val: string | null): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function statusOf(ad: AdRow): { label: string; color: string } {
  if (!ad.isPublished) return { label: "ड्राफ्ट", color: "bg-slate-200 text-slate-700" };
  const now = Date.now();
  if (ad.publishAt && new Date(ad.publishAt).getTime() > now) return { label: "शेड्यूल", color: "bg-amber-100 text-amber-800" };
  if (ad.expiresAt && new Date(ad.expiresAt).getTime() < now) return { label: "समाप्त", color: "bg-rose-100 text-rose-700" };
  return { label: "लाइव", color: "bg-leaf-100 text-leaf-800" };
}

export default function AdminAdsPage() {
  const [list, setList] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { show, node } = useToast();

  const { translateAndSync } = useTranslate();

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ads");
      const data = (await res.json()) as { ads: AdRow[] };
      setList(data.ads);
    } catch {
      show("लोड नहीं हो पाया", "err");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    if (filter === "live") return list.filter((a) => statusOf(a).label === "लाइव");
    if (filter === "draft") return list.filter((a) => !a.isPublished);
    if (filter === "expired") return list.filter((a) => statusOf(a).label === "समाप्त");
    return list.filter((a) => a.placement === filter);
  }, [list, filter]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortCol) {
        case "titleHi": av = a.titleHi || a.titleEn; bv = b.titleHi || b.titleEn; break;
        case "placement": av = a.placement; bv = b.placement; break;
        case "clickCount": av = a.clickCount; bv = b.clickCount; break;
        case "status": av = statusOf(a).label; bv = statusOf(b).label; break;
        default: return 0;
      }
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filtered, sortCol, sortDir]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (ad: AdRow) => {
    setEditing(ad);
    setForm({
      variant: ad.variant,
      placement: ad.placement,
      titleHi: ad.titleHi,
      titleEn: ad.titleEn,
      descriptionHi: ad.descriptionHi,
      descriptionEn: ad.descriptionEn,
      linkUrl: ad.linkUrl,
      imageUrl: ad.imageUrl,
      buttonTextHi: ad.buttonTextHi,
      buttonTextEn: ad.buttonTextEn,
      bgColor: ad.bgColor,
      textColor: ad.textColor,
      isPublished: ad.isPublished,
      publishAt: dtLocal(ad.publishAt),
      expiresAt: dtLocal(ad.expiresAt),
      sortOrder: ad.sortOrder,
    });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishAt: form.publishAt || null,
        expiresAt: form.expiresAt || null,
      };
      const res = await fetch(editing ? `/api/admin/ads/${editing.id}` : "/api/admin/ads", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        show(editing ? "विज्ञापन अपडेट हुआ" : "नया विज्ञापन बना");
        setModal(false);
        await load();
      } else {
        show(data.error ?? "सेव नहीं हो पाया", "err");
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ad: AdRow) => {
    if (!window.confirm(`"${ad.titleHi || ad.titleEn}" विज्ञापन हटाना है?`)) return;
    const res = await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
    if (res.ok) { show("विज्ञापन हटा दिया"); await load(); }
    else show("हटाने में विफल", "err");
  };

  const togglePublish = async (ad: AdRow) => {
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !ad.isPublished }),
    });
    await load();
  };

  const set = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const showFieldsFor = (variant: string) => {
    const needs = {
      title: true,
      desc: variant !== "link" && variant !== "inline",
      link: true,
      image: variant === "image" || variant === "banner" || variant === "sponsored" || variant === "popup",
      button: variant === "banner" || variant === "popup",
      colors: variant === "banner" || variant === "popup",
    };
    return needs;
  };

  const fields = showFieldsFor(form.variant);

  return (
    <div>
      {node}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Ad Manager</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">विज्ञापन (Ads)</h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <span className="tnum">{list.length}</span> कुल • <span className="tnum">{list.filter((a) => statusOf(a).label === "लाइव").length}</span> लाइव
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-bold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 cursor-pointer">
            <Icon name="plus" size={16} strokeWidth={2.4} />नया विज्ञापन बनाएं
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {[
          { value: "all", label: "सभी" },
          { value: "live", label: "🟢 लाइव" },
          { value: "draft", label: "📝 ड्राफ्ट" },
          { value: "expired", label: "⏰ समाप्त" },
          ...PLACEMENTS.map((p) => ({ value: p.value, label: p.label })),
        ].map((f) => (
          <button key={f.value} type="button" onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all cursor-pointer ${
              filter === f.value ? "border-saffron-500 bg-saffron-50 text-saffron-800" : "border-navy-200 text-ink-soft hover:bg-navy-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyRow text="कोई विज्ञापन नहीं — ऊपर से नया बनाएं" />
      ) : (
        <AdminTable
          data={sorted}
          emptyText="कोई विज्ञापन नहीं — ऊपर से नया बनाएं"
          header={
            <tr>
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-left">विज्ञापन</th>
              <th className="px-3 py-3 text-left">स्थान</th>
              <th className="px-3 py-3 text-left">प्रकार</th>
              <th className="px-3 py-3 text-center">क्लिक</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(ad) => {
            const status = statusOf(ad);
            const v = VARIANTS.find((v) => v.value === ad.variant);
            return (
              <tr key={ad.id} className={`transition-colors hover:bg-paper ${!ad.isPublished ? "opacity-70" : ""}`}>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${status.color}`}>{status.label}</span>
                </td>
                <td className="px-3 py-3">
                  <p className="truncate font-extrabold text-ink">{ad.titleHi || ad.titleEn}</p>
                  <p className="truncate text-xs font-semibold text-ink-soft">{ad.descriptionHi || ad.descriptionEn}</p>
                  {ad.imageUrl && (
                    <div className="mt-1 overflow-hidden rounded border border-navy-100">
                      <img src={ad.imageUrl} alt="" className="h-12 w-full object-cover" loading="lazy" />
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="rounded bg-navy-50 px-2 py-1 text-[11px] font-bold text-navy-600">
                    {PLACEMENTS.find((p) => p.value === ad.placement)?.label ?? ad.placement}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">{v?.label ?? ad.variant}</span>
                </td>
                <td className="px-3 py-3 text-center font-extrabold text-navy-800 tnum">
                  {ad.clickCount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => togglePublish(ad)} className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold cursor-pointer transition-colors ${
                      ad.isPublished ? "bg-leaf-100 text-leaf-800 hover:bg-leaf-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`} title={ad.isPublished ? "Unpublish" : "Publish"}>
                      {ad.isPublished ? "Live" : "Draft"}
                    </button>
                    <button type="button" onClick={() => openEdit(ad)} className="grid size-8 place-items-center rounded-lg text-navy-600 hover:bg-navy-100 cursor-pointer" title="Edit">
                      <Icon name="pencil" size={14} />
                    </button>
                    <DeleteButton onConfirm={() => remove(ad)} />
                  </div>
                </td>
              </tr>
            );
          }}
        />
      )}

      {/* Create/Edit modal */}
      <SlidePanel open={modal} onClose={() => setModal(false)} title={editing ? `Ad संपादित करें #${editing.id}` : "नया विज्ञापन बनाएं"} wide
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-navy-50 cursor-pointer">रद्द करें</button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
              {saving ? <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" /> : <Icon name="check" size={16} strokeWidth={2.6} />}
              {editing ? "अपडेट करें" : "बनाएं"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Variant selector */}
          <Field label="विज्ञापन प्रकार (Variant)" required>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {VARIANTS.map((v) => (
                <button key={v.value} type="button" onClick={() => set("variant", v.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                    form.variant === v.value ? "border-saffron-500 bg-saffron-50 text-saffron-800" : "border-navy-100 bg-paper text-ink-soft hover:border-navy-200"
                  }`}
                >
                  <Icon name={v.icon} size={18} />
                  <span className="text-[11px] font-extrabold leading-tight">{v.label}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Placement */}
          <Field label="स्थान (Placement)" required>
            <select className={`${inputCls} cursor-pointer`} value={form.placement} onChange={(e) => set("placement", e.target.value)}>
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>

          {/* Title */}
          {fields.title && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="शीर्षक (हिंदी)">
                <input className={inputCls} value={form.titleHi} onChange={(e) => set("titleHi", e.target.value)} onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, titleHi: v }), (v) => setForm({ ...form, titleEn: v }))} placeholder="विज्ञापन शीर्षक" />
              </Field>
              <Field label="शीर्षक (English)" hint="Hindi में लिखें — ऑटो English में बदल जाएगा">
                <input className={inputCls} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, titleHi: v }), (v) => setForm({ ...form, titleEn: v }))} placeholder="Ad title" />
              </Field>
            </div>
          )}

          {/* Description */}
          {fields.desc && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="विवरण (हिंदी)">
                <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.descriptionHi} onChange={(e) => set("descriptionHi", e.target.value)} onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, descriptionHi: v }), (v) => setForm({ ...form, descriptionEn: v }))} />
              </Field>
              <Field label="विवरण (English)" hint="Hindi में लिखें — ऑटो English में बदल जाएगा">
                <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, descriptionHi: v }), (v) => setForm({ ...form, descriptionEn: v }))} />
              </Field>
            </div>
          )}

          {/* Link URL */}
          {fields.link && (
            <Field label="लिंक URL" hint="https:// ऑटो जुड़ेगा">
              <input className={inputCls} value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="https://example.com" />
            </Field>
          )}

          {/* Image URL */}
          {fields.image && (
            <Field label="इमेज URL" hint="बाहरी URL या /images/ad.jpg">
              <input className={inputCls} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://example.com/banner.jpg" />
              {form.imageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-navy-100">
                  <img src={form.imageUrl} alt="Preview" className="h-24 w-full object-cover" loading="lazy" />
                </div>
              )}
            </Field>
          )}

          {/* Button text */}
          {fields.button && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="बटन टेक्स्ट (हिंदी)">
                <input className={inputCls} value={form.buttonTextHi} onChange={(e) => set("buttonTextHi", e.target.value)} onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, buttonTextHi: v }), (v) => setForm({ ...form, buttonTextEn: v }))} placeholder="अभी देखें" />
              </Field>
              <Field label="बटन टेक्स्ट (English)" hint="Hindi में लिखें — ऑटो English में बदल जाएगा">
                <input className={inputCls} value={form.buttonTextEn} onChange={(e) => set("buttonTextEn", e.target.value)} onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, buttonTextHi: v }), (v) => setForm({ ...form, buttonTextEn: v }))} placeholder="View Now" />
              </Field>
            </div>
          )}

          {/* Colors */}
          {fields.colors && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="बैकग्राउंड रंग">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="size-9 cursor-pointer rounded border border-navy-200" />
                  <input className={inputCls} value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} />
                </div>
              </Field>
              <Field label="टेक्स्ट रंग">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor} onChange={(e) => set("textColor", e.target.value)} className="size-9 cursor-pointer rounded border border-navy-200" />
                  <input className={inputCls} value={form.textColor} onChange={(e) => set("textColor", e.target.value)} />
                </div>
              </Field>
            </div>
          )}

          {/* Schedule */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="📅 प्रकाशन तिथि" hint="खाली = तुरंत">
              <input type="datetime-local" className={inputCls} value={form.publishAt} onChange={(e) => set("publishAt", e.target.value)} />
            </Field>
            <Field label="⏰ समाप्ति तिथि" hint="खाली = कभी समाप्त नहीं">
              <input type="datetime-local" className={inputCls} value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
            </Field>
          </div>

          {/* Publish toggle */}
          <Toggle checked={form.isPublished} onChange={(v) => set("isPublished", v)} label="प्रकाशित करें (Publish)" desc="ड्राफ्ट साइट पर नहीं दिखेंगे — लाइव होने पर दिखेंगे" />
        </div>
      </SlidePanel>
    </div>
  );
}
