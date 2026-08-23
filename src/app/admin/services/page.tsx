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
import { Bi } from "@/components/bi";
import { colorOf, Icon } from "@/components/icons";
import { detectLanguage, useTranslate } from "@/lib/translation";

type Cat = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  icon: string;
  color: string;
  isActive: boolean;
};

type Svc = {
  id: string;
  categoryIds: string[];
  titleHi: string;
  titleEn: string;
  url: string;
  descriptionHi: string;
  descriptionEn: string;
  tags: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
  categories: Array<Pick<Cat, "slug" | "titleHi" | "titleEn" | "color" | "icon">>;
};

const EMPTY_FORM = {
  titleHi: "",
  titleEn: "",
  url: "",
  categoryIds: [] as string[],
  tags: "",
  descriptionHi: "",
  descriptionEn: "",
  isFeatured: false,
  isNew: true,
  isActive: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Svc[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Svc | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>(null);
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

  const load = useCallback(async () => {
    try {
      const [svcRes, catRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/categories"),
      ]);

      if (!svcRes.ok) {
        const errData = await svcRes.json().catch(() => ({}));
        throw new Error(errData.error || `Services API error: ${svcRes.status}`);
      }
      if (!catRes.ok) {
        const errData = await catRes.json().catch(() => ({}));
        throw new Error(errData.error || `Categories API error: ${catRes.status}`);
      }

      const svcData = (await svcRes.json()) as { services: Svc[] };
      const catData = (await catRes.json()) as { categories: Cat[] };
      setServices(svcData.services ?? []);
      setCats((catData.categories ?? []).sort((a, b) => a.titleEn.localeCompare(b.titleEn)));
    } catch (err) {
      console.error("Failed to load services:", err);
      show("सेवाएं लोड नहीं हो पाईं", "err");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react/hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return services.filter((s) => {
      if (catFilter !== "all" && !(s.categoryIds ?? []).includes(catFilter)) return false;
      if (statusFilter === "active" && !s.isActive) return false;
      if (statusFilter === "inactive" && s.isActive) return false;
      if (!term) return true;
      return (
        s.titleHi.toLowerCase().includes(term) ||
        s.titleEn.toLowerCase().includes(term) ||
        s.url.toLowerCase().includes(term) ||
        s.tags.toLowerCase().includes(term)
      );
    });
  }, [services, q, catFilter, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortCol) {
        case "titleHi": av = a.titleHi; bv = b.titleHi; break;
        case "category": av = a.categories[0]?.titleHi ?? ""; bv = b.categories[0]?.titleHi ?? ""; break;
        case "clickCount": av = a.clickCount; bv = b.clickCount; break;
        case "isActive": av = a.isActive ? 1 : 0; bv = b.isActive ? 1 : 0; break;
        default: return 0;
      }
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filtered, sortCol, sortDir]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryIds: cats[0]?.id ? [cats[0].id] : [] });
    setModal(true);
  };

  const openEdit = (s: Svc) => {
    setEditing(s);
    setForm({
      titleHi: s.titleHi,
      titleEn: s.titleEn,
      url: s.url,
      categoryIds: s.categoryIds?.length ? s.categoryIds : [],
      tags: s.tags,
      descriptionHi: s.descriptionHi,
      descriptionEn: s.descriptionEn,
      isFeatured: s.isFeatured,
      isNew: s.isNew,
      isActive: s.isActive,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.titleHi.trim() || !form.titleEn.trim() || !form.url.trim()) {
      show("नाम और URL ज़रूरी हैं", "err");
      return;
    }
    if (!form.categoryIds?.length) {
      show("कम से कम एक श्रेणी चुनें", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/services/${editing.id}` : "/api/admin/services", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        show(editing ? "सेवा अपडेट हुई" : "नई सेवा जुड़ गई");
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

  const remove = async (s: Svc) => {
    if (!window.confirm(`"${s.titleHi}" को हटाना है?`)) return;
    const res = await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
    if (res.ok) {
      show("सेवा हटा दी गई");
      await load();
    } else {
      show("हटाने में विफल", "err");
    }
  };

  const toggleActive = async (s: Svc) => {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    await load();
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
            सेवाएं (लिंक)
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <span className="tnum">{services.length}</span> कुल •{" "}
            <span className="tnum">{services.filter((s) => s.isActive).length}</span> सक्रिय
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm("Re-enable 'New' tags for all services with less than 50 clicks?")) return;
              const res = await fetch("/api/admin/services/enable-new-tags", { method: "POST" });
              if (res.ok) {
                show("All eligible services marked as New");
                await load();
              } else {
                show("Failed to enable new tags", "err");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-saffron-400 bg-saffron-50 px-4 py-2.5 text-sm font-bold text-saffron-800 shadow-sm transition-all hover:bg-saffron-100 active:scale-95 cursor-pointer"
          >
            <Icon name="sparkles" size={16} />
            Enable New Tags
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95 cursor-pointer"
          >
            <Icon name="plus" size={16} strokeWidth={2.4} />
            नई सेवा जोड़ें
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center rounded-xl border-2 border-navy-100 bg-surface transition-colors focus-within:border-saffron-500">
          <span className="pl-3.5 text-navy-400">
            <Icon name="search" size={17} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="नाम, URL या टैग से खोजें…"
            className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-ink-soft/60"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="pr-3 text-navy-400 hover:text-navy-800 cursor-pointer"
              aria-label="Clear"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
        >
          <option value="all">सभी श्रेणियाँ</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titleHi}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
        >
          <option value="all">सभी स्थिति</option>
          <option value="active">केवल सक्रिय</option>
          <option value="inactive">केवल बंद</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyRow text="कोई सेवा नहीं मिली" />
      ) : (
        <AdminTable
          data={sorted}
          emptyText="कोई सेवा नहीं मिली"
          header={
            <tr>
              <th className="px-4 py-3 text-left">सेवा / URL</th>
              <th className="px-3 py-3 text-left">श्रेणियाँ</th>
              <th className="px-3 py-3 text-center">बैज</th>
              <th className="px-3 py-3 text-center">क्लिक</th>
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(s) => {
            return (
              <tr key={s.id} className={`transition-colors hover:bg-paper ${!s.isActive ? "opacity-55" : ""}`}>
                <td className="max-w-[280px] px-4 py-3">
                  <p className="truncate font-extrabold text-ink">{s.titleHi}</p>
                  <p className="truncate text-xs font-semibold text-ink-soft">{s.titleEn}</p>
                  <p className="truncate text-[11px] text-navy-400">{s.url}</p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.categories.length > 0 ? s.categories.map((c) => {
                      const cc = colorOf(c.color);
                      return (
                        <span key={c.slug} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${cc.chip}`} title={c.titleHi}>
                          <Icon name={c.icon} size={10} />
                          {c.titleEn}
                        </span>
                      );
                    }) : <span className="text-[11px] text-ink-soft">—</span>}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {s.isNew && (
                      <span className="rounded-md bg-leaf-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">New</span>
                    )}
                    {s.isFeatured && (
                      <span className="grid size-5 place-items-center rounded-md bg-saffron-100 text-saffron-700" title="Featured">
                        <Icon name="star" size={11} strokeWidth={2.4} />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-extrabold text-navy-800 tnum">
                  {s.clickCount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-3 text-center">
                  <button type="button" onClick={() => toggleActive(s)} className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors cursor-pointer ${
                    s.isActive ? "bg-leaf-100 text-leaf-800 hover:bg-leaf-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}>
                    {s.isActive ? "सक्रिय" : "बंद"}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="grid size-8 place-items-center rounded-lg text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-800" title="लिंक खोलें">
                      <Icon name="external" size={14} />
                    </a>
                    <button type="button" onClick={() => openEdit(s)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer" title="संपादित करें">
                      <Icon name="pencil" size={15} />
                    </button>
                    <DeleteButton onConfirm={() => remove(s)} />
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
        title={editing ? `संपादित करें — ${editing.titleHi}` : "नई सेवा जोड़ें"}
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
              onClick={() => {
                save();
                if (form.titleHi.trim() && form.titleEn.trim() && form.url.trim() && form.categoryIds?.length) {
                  setTimeout(() => {
                    setForm({ ...EMPTY_FORM, categoryIds: cats[0]?.id ? [cats[0].id] : [] });
                    const titleInput = document.querySelector('input[placeholder="जैसे: आधार कार्ड अपडेट"]') as HTMLInputElement | null;
                    titleInput?.focus();
                  }, 100);
                }
              }}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Icon name="plus" size={16} strokeWidth={2.4} />
              )}
              सहेजें और नया जोड़ें
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
              {editing ? "अपडेट करें" : "जोड़ें"}
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
                placeholder="जैसे: आधार कार्ड अपडेट"
              />
            </Field>
            <Field label="नाम (English)" required hint="Hindi में लिखें — ऑटो English में बदल जाएगा">
              <input
                className={inputCls}
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, titleHi: v }), (v) => setForm({ ...form, titleEn: v }))}
                placeholder="e.g. Update Aadhaar Card"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="आधिकारिक URL" required hint="https:// अपने-आप जुड़ जाएगा">
              <input
                className={inputCls}
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="uidai.gov.in"
              />
            </Field>
            <Field label="टैग" hint="कॉमा से अलग करें — खोज में मदद करते हैं">
              <input
                className={inputCls}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="aadhaar, uidai, card"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="विवरण (हिंदी)">
              <input
                className={inputCls}
                value={form.descriptionHi}
                onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, descriptionHi: v }), (v) => setForm({ ...form, descriptionEn: v }))}
                placeholder="एक लाइन का विवरण"
              />
            </Field>
            <Field label="विवरण (English)" hint="Hindi में लिखें — ऑटो English में बदल जाएगा">
              <input
                className={inputCls}
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                onBlur={(e) => translateAndSync(e.target.value, detectLanguage(e.target.value), (v) => setForm({ ...form, descriptionHi: v }), (v) => setForm({ ...form, descriptionEn: v }))}
                placeholder="One line description"
              />
            </Field>
          </div>

          <Field label="श्रेणियाँ" required hint="एक से ज़्यादा चुन सकते हैं">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {cats.map((c) => {
                const checked = form.categoryIds.includes(c.id);
                const cc = colorOf(c.color);
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-all ${
                      checked
                        ? `${cc.chip} ${cc.border} shadow-sm`
                        : "border-navy-100 bg-paper text-ink-soft hover:border-navy-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded border-2 border-navy-300 accent-saffron-600"
                      checked={checked}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          categoryIds: e.target.checked
                            ? [...form.categoryIds, c.id]
                            : form.categoryIds.filter((id) => id !== c.id),
                        });
                      }}
                    />
                    <span className={`grid size-6 shrink-0 place-items-center rounded-md ${checked ? cc.soft : "bg-navy-50"}`}>
                      <Icon name={c.icon} size={14} className={checked ? cc.text : "text-navy-500"} />
                    </span>
                    <span className="text-left leading-tight">
                      <Bi hi={c.titleHi} en={c.titleEn} />
                    </span>
                  </label>
                );
              })}
            </div>
          </Field>

          {/*<Field label="टैग" hint="कॉमा से अलग करें — खोज में मदद करते हैं">
            <input
              className={inputCls}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="aadhaar, uidai, card"
            />
          </Field>*/}

          <div className="grid gap-2.5 sm:grid-cols-3">
            <Toggle
              checked={form.isNew}
              onChange={(v) => setForm({ ...form, isNew: v })}
              label="नया (NEW)"
              desc="होम पर 'नई लिंक' में दिखे"
            />
            <Toggle
              checked={form.isFeatured}
              onChange={(v) => setForm({ ...form, isFeatured: v })}
              label="चुनिंदा ★"
              desc="हीरो पैनल में दिखे"
            />
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
              label="सक्रिय"
              desc="साइट पर दिखे"
            />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}
