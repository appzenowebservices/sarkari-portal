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

type Org = {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  abbreviation: string;
  website: string;
  descriptionHi: string;
  descriptionEn: string;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY_FORM = {
  nameHi: "",
  nameEn: "",
  slug: "",
  abbreviation: "",
  website: "",
  descriptionHi: "",
  descriptionEn: "",
  isActive: true,
};

export default function AdminJobOrganizationsPage() {
  const [list, setList] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Org | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>("sortOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { toast, show, node } = useToast();

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
        case "nameHi": av = a.nameHi; bv = b.nameHi; break;
        case "nameEn": av = a.nameEn; bv = b.nameEn; break;
        case "abbreviation": av = a.abbreviation; bv = b.abbreviation; break;
        case "website": av = a.website; bv = b.website; break;
        default: return 0;
      }
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [list, sortCol, sortDir]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/jobs/organizations");
      const data = (await res.json()) as { organizations: Org[] };
      setList(data.organizations);
    } catch {
      show("लोड नहीं हो पाया", "err");
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

  const openEdit = (o: Org) => {
    setEditing(o);
    setForm({
      nameHi: o.nameHi,
      nameEn: o.nameEn,
      slug: o.slug,
      abbreviation: o.abbreviation,
      website: o.website,
      descriptionHi: o.descriptionHi,
      descriptionEn: o.descriptionEn,
      isActive: o.isActive,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.nameHi.trim() || !form.nameEn.trim()) {
      show("हिंदी और अंग्रेज़ी नाम ज़रूरी है", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/jobs/organizations/${editing.id}` : "/api/admin/jobs/organizations",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        show(editing ? "संस्थान अपडेट हुआ" : "संस्थान बन गया");
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

  const remove = async (o: Org) => {
    if (!window.confirm(`"${o.nameHi}" संस्थान हटाना है?`)) return;
    const res = await fetch(`/api/admin/jobs/organizations/${o.id}`, { method: "DELETE" });
    if (res.ok) {
      show("संस्थान हटा दिया गया");
      await load();
    } else {
      show("हटाने में विफल", "err");
    }
  };

  const toggleActive = async (o: Org) => {
    const res = await fetch(`/api/admin/jobs/organizations/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !o.isActive }),
    });
    if (res.ok) await load();
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
            संस्थान
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
            नया संस्थान
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyRow text="अभी कोई संस्थान नहीं — ऊपर से नया बनाएं" />
      ) : (
        <AdminTable
          data={sorted}
          emptyText="अभी कोई संस्थान नहीं — ऊपर से नया बनाएं"
          header={
            <tr>
              <SortTh label="क्रम" col="sortOrder" sortCol={sortCol} sortDir={sortDir} onClick={() => handleSort("sortOrder")} align="center" />
              <SortTh label="संस्थान" col="nameHi" sortCol={sortCol} sortDir={sortDir} onClick={() => handleSort("nameHi")} />
              <SortTh label="संक्षिप्त" col="abbreviation" sortCol={sortCol} sortDir={sortDir} onClick={() => handleSort("abbreviation")} />
              <SortTh label="वेबसाइट" col="website" sortCol={sortCol} sortDir={sortDir} onClick={() => handleSort("website")} />
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(o, i) => (
            <tr key={o.id} className={`transition-colors hover:bg-paper ${!o.isActive ? "opacity-55" : ""}`}>
              <td className="px-3 py-3 text-center font-extrabold text-navy-800 tnum">
                {i + 1}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-100 text-navy-700">
                    <Icon name="landmark" size={19} />
                  </span>
                  <div>
                    <p className="font-extrabold text-ink">{o.nameHi}</p>
                    <p className="text-xs font-semibold text-ink-soft">{o.nameEn}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3">
                <span className="inline-flex rounded-full bg-navy-50 px-2.5 py-1 text-xs font-extrabold text-navy-800">
                  {o.abbreviation || "—"}
                </span>
              </td>
              <td className="px-3 py-3 text-sm font-semibold text-ink">
                {o.website ? (
                  <a href={o.website} target="_blank" rel="noopener noreferrer" className="text-saffron-700 hover:text-saffron-800 hover:underline">
                    {o.website}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-3 text-center">
                <button
                  type="button"
                  onClick={() => toggleActive(o)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors cursor-pointer ${
                    o.isActive ? "bg-leaf-100 text-leaf-800 hover:bg-leaf-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                  title="सक्रिय/बंद करने के लिए क्लिक करें"
                >
                  {o.isActive ? "सक्रिय" : "बंद"}
                </button>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(o)}
                    className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"
                    aria-label="Edit"
                    title="संपादित करें"
                  >
                    <Icon name="pencil" size={15} />
                  </button>
                  <DeleteButton onConfirm={() => remove(o)} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? `संपादित करें — ${editing.nameHi}` : "नया संस्थान बनाएं"}
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
                value={form.nameHi}
                onChange={(e) => setForm({ ...form, nameHi: e.target.value })}
                placeholder="जैसे: भारतीय सैन्य"
              />
            </Field>
            <Field label="नाम (English)" required>
              <input
                className={inputCls}
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="e.g. Indian Army"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="संक्षिप्त नाम">
              <input
                className={inputCls}
                value={form.abbreviation}
                onChange={(e) => setForm({ ...form, abbreviation: e.target.value })}
                placeholder="जैसे: इंडियन आर्मी"
              />
            </Field>
            <Field label="वेबसाइट" hint="https:// अपने-आप जुड़ जाएगा">
              <input
                className={inputCls}
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="example.com"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="विवरण (हिंदी)">
              <input
                className={inputCls}
                value={form.descriptionHi}
                onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })}
                placeholder="छोटा सा विवरण"
              />
            </Field>
            <Field label="विवरण (English)">
              <input
                className={inputCls}
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                placeholder="Short description"
              />
            </Field>
          </div>

          <Toggle
            checked={form.isActive}
            onChange={(v) => setForm({ ...form, isActive: v })}
            label="संस्थान सक्रिय रखें"
            desc="बंद संस्थान सूची में नहीं दिखेंगे"
          />
        </div>
      </SlidePanel>
    </div>
  );
}
