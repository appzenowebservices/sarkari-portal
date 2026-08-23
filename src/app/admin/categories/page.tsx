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
import { CATEGORY_COLORS, colorOf, Icon, ICON_OPTIONS } from "@/components/icons";
import { detectLanguage, useTranslate } from "@/lib/translation";

type Cat = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  serviceCount: number;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  schemaType: string;
};

const EMPTY_FORM = {
  titleHi: "",
  titleEn: "",
  slug: "",
  descriptionHi: "",
  descriptionEn: "",
  icon: "dots",
  color: "navy",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>("titleEn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { toast, show, node } = useToast();

  const { translateAndSync } = useTranslate();

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortCol) return list;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortCol) {
        case "sortOrder": av = a.sortOrder; bv = b.sortOrder; break;
        case "titleHi": av = a.titleHi; bv = b.titleHi; break;
        case "slug": av = a.slug; bv = b.slug; break;
        case "serviceCount": av = a.serviceCount; bv = b.serviceCount; break;
        case "isActive": av = a.isActive ? 1 : 0; bv = b.isActive ? 1 : 0; break;
        default: return 0;
      }
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [list, sortCol, sortDir]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Categories API error: ${res.status}`);
      }
      const data = (await res.json()) as { categories: Cat[] };
      setList(data.categories ?? []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      show("श्रेणियां नहीं मिलीं", "err");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (c: Cat) => {
    setEditing(c);
    setForm({
      titleHi: c.titleHi,
      titleEn: c.titleEn,
      slug: c.slug,
      descriptionHi: c.descriptionHi,
      descriptionEn: c.descriptionEn,
      icon: c.icon,
      color: c.color,
      isActive: c.isActive,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.titleHi.trim() || !form.titleEn.trim()) {
      show("हिंदी और अंग्रेज़ी नाम ज़रूरी है", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        show(editing ? "श्रेणी अपडेट हुई" : "श्रेणी बन गई");
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

  const saveAndContinue = async () => {
    if (!form.titleHi.trim() || !form.titleEn.trim()) {
      show("हिंदी और अंग्रेज़ी नाम ज़रूरी है", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        show(editing ? "श्रेणी अपडेट हुई" : "श्रेणी बन गई");
        setEditing(null);
        setForm(EMPTY_FORM);
        const slugInput = document.querySelector('input[placeholder="khali chhodne par auto banega"]') as HTMLInputElement | null;
        slugInput?.focus();
      } else {
        show(data.error ?? "सेव नहीं हो पाया", "err");
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Cat) => {
    if (!window.confirm(`"${c.titleHi}" श्रेणी हटाना है? सभी लिंक भी हट जाएंगे`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      show("श्रेणी हटा दी गई (सभी लिंक भी हट गए)");
      await load();
    } else {
      show("हटाने में विफल", "err");
    }
  };

  const toggleActive = async (c: Cat) => {
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) await load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setList(next);
    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((c) => c.id) }),
    });
  };

  return (
    <div>
      {node}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
            Content Manager
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            श्रेणियाँ
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            क्रम बदलने के लिए ↑↓ बटन, साइट पर तुरंत असर
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95 cursor-pointer"
          >
            <Icon name="plus" size={16} strokeWidth={2.4} />
            नई श्रेणी
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyRow text="अभी कोई श्रेणी नहीं — ऊपर से नई बनाएं" />
      ) : (
        <AdminTable
          data={sorted}
          emptyText="अभी कोई श्रेणी नहीं — ऊपर से नई बनाएं"
          header={
            <tr>
              <th className="px-3 py-3 text-center">क्रम</th>
              <th className="px-3 py-3 text-left">श्रेणी</th>
              <th className="px-3 py-3 text-left">Slug</th>
              <th className="px-3 py-3 text-center">लिंक</th>
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(c, i) => {
            const color = colorOf(c.color);
            return (
              <tr key={c.id} className={`transition-colors hover:bg-paper ${!c.isActive ? "opacity-55" : ""}`}>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => move(i - 1, -1)} disabled={i === 0} className="grid size-6 place-items-center rounded text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-800 disabled:opacity-30 cursor-pointer" aria-label="Move up">
                      <Icon name="chevronUp" size={14} />
                    </button>
                    <button type="button" onClick={() => move(i - 1, 1)} disabled={i === sorted.length - 1} className="grid size-6 place-items-center rounded text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-800 disabled:opacity-30 cursor-pointer" aria-label="Move down">
                      <Icon name="chevronDown" size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color.soft} ${color.text}`}>
                      <Icon name={c.icon} size={19} />
                    </span>
                    <div>
                      <p className="font-extrabold text-ink">{c.titleHi}</p>
                      <p className="text-xs font-semibold text-ink-soft">{c.titleEn}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <code className="rounded bg-navy-50 px-2 py-1 text-xs font-bold text-navy-700">
                    /category/{c.slug}
                  </code>
                </td>
                <td className="px-3 py-3 text-center font-extrabold text-navy-800 tnum">
                  {c.serviceCount}
                </td>
                <td className="px-3 py-3 text-center">
                  <button type="button" onClick={() => toggleActive(c)} className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors cursor-pointer ${
                    c.isActive ? "bg-leaf-100 text-leaf-800 hover:bg-leaf-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`} title="सक्रिय/बंद करने के लिए क्लिक करें">
                    {c.isActive ? "सक्रिय" : "बंद"}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => openEdit(c)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer" aria-label="Edit" title="संपादित करें">
                      <Icon name="pencil" size={15} />
                    </button>
                    <DeleteButton onConfirm={() => remove(c)} />
                  </div>
                </td>
              </tr>
            );
          }}
        />
      )}

      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? `संपादित करें — ${editing.titleHi}` : "नई श्रेणी बनाएं"}
        wide
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-navy-50 cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="button"
              onClick={saveAndContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Icon name="plus" size={16} strokeWidth={2.4} />
              )}
              सहेजें और नया बनाएं
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" />
              ) : (
                <Icon name="check" size={16} strokeWidth={2.6} />
              )}
              {editing ? "अपडेट करें" : "बनाएं"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="नाम (हिंदी)" required>
              <input
                className={inputCls}
                value={form.titleHi}
                onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, titleHi: v }), (v) => setForm({ ...form, titleEn: v }))}
                placeholder="जैसे: बिजली बिल"
              />
            </Field>
            <Field label="नाम (English)" required>
              <input
                className={inputCls}
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, titleHi: v }), (v) => setForm({ ...form, titleEn: v }))}
                placeholder="e.g. Electricity Bill"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug" hint="URL के लिए — a-z, 0-9, '-'">
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="khali chhodne par auto banega"
              />
            </Field>
            <div className="flex items-end">
              <div className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-navy-200 bg-paper px-3 py-2.5 text-xs font-bold text-ink-soft">
                <Icon name="info" size={15} className="shrink-0 text-navy-400" />
                क्रम बदलने के लिए सूची में ↑↓ बटन इस्तेमाल करें — अपने-आप सहेजा जाता है
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="विवरण (हिंदी)">
              <input
                className={inputCls}
                value={form.descriptionHi}
                onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, descriptionHi: v }), (v) => setForm({ ...form, descriptionEn: v }))}
                placeholder="छोटा सा विवरण"
              />
            </Field>
            <Field label="विवरण (English)">
              <input
                className={inputCls}
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, descriptionHi: v }), (v) => setForm({ ...form, descriptionEn: v }))}
                placeholder="Short description"
              />
            </Field>
          </div>

          <Field label="आइकॉन चुनें" required>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm({ ...form, icon: name })}
                  className={`grid aspect-square place-items-center rounded-lg border-2 transition-all cursor-pointer ${
                    form.icon === name
                      ? "border-saffron-500 bg-saffron-50 text-saffron-700 shadow-sm"
                      : "border-navy-100 bg-paper text-ink-soft hover:border-navy-300"
                  }`}
                  aria-label={name}
                >
                  <Icon name={name} size={19} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="रंग चुनें" required>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CATEGORY_COLORS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, color: key })}
                  className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                    form.color === key
                      ? "border-navy-900 bg-navy-900 text-white shadow"
                      : "border-navy-100 bg-paper text-ink-soft hover:border-navy-300"
                  }`}
                >
                  <span className={`size-3.5 rounded-full ${CATEGORY_COLORS[key].solid}`} />
                  {key}
                </button>
              ))}
            </div>
          </Field>

          <Toggle
            checked={form.isActive}
            onChange={(v) => setForm({ ...form, isActive: v })}
            label="श्रेणी सक्रिय रखें"
            desc="बंद श्रेणियाँ साइट पर नहीं दिखेंगी"
          />

        </div>
      </SlidePanel>
    </div>
  );
}
