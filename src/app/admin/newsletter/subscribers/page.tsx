"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DeleteButton,
  EmptyRow,
  Field,
  Spinner,
  Toggle,
  useToast,
  inputCls,
} from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { SlidePanel } from "@/components/admin/slide-panel";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/reveal";

type Subscriber = {
  id: string;
  email: string;
  name: string;
  status: "active" | "unsubscribed" | "bounced" | "blocked";
  source: string;
  isVerified: boolean;
  lastEmailAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; status: "active" | "unsubscribed" | "bounced" | "blocked" }>({
    name: "",
    email: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { toast, show, node } = useToast();

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/admin/newsletter/subscribers?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }
      const data = (await res.json()) as { subscribers: Subscriber[]; total: number };
      setSubscribers(data.subscribers ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
      show("सब्सक्राइबर नहीं मिले", "err");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react/hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, sourceFilter, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return subscribers;
    return subscribers.filter(
      (s) => s.email.toLowerCase().includes(term) || (s.name?.toLowerCase() || "").includes(term)
    );
  }, [subscribers, q]);

  const activeCount = subscribers.filter((s) => s.status === "active" && s.isVerified).length;
  const unverifiedCount = subscribers.filter((s) => !s.isVerified).length;

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", email: "", status: "active" });
    setModal(true);
  };

  const openEdit = (s: Subscriber) => {
    setEditing(s);
    setForm({ name: s.name || "", email: s.email, status: s.status });
    setModal(true);
  };

  const save = async () => {
    if (!form.email.trim() || !form.name.trim()) {
      show("नाम और ईमेल ज़रूरी हैं", "err");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      show("वैध ईमेल दर्ज करें", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/newsletter/subscribers/${editing.id}` : "/api/admin/newsletter/subscribers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        show(editing ? "सब्सक्राइबर अपडेट हुआ" : "नई सब्सक्राइबर जुड़ी");
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

  const removeSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`क्या आप वाकई ${selected.length} सब्सक्राइबर हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch("/api/admin/newsletter/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: selected }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; modified?: number };
      if (res.ok && data.ok) {
        show(`${data.modified} सब्सक्राइबर हटा दिए गए`);
        setSelected([]);
        await load();
      } else {
        show(data.error ?? "हटाने में विफल", "err");
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    }
  };

  const removeSingle = async (s: Subscriber) => {
    if (!window.confirm(`"${s.email}" को हटाना है?`)) return;
    const res = await fetch(`/api/admin/newsletter/subscribers/${s.id}`, { method: "DELETE" });
    if (res.ok) {
      show("सब्सक्राइबर हटा दिया गया");
      await load();
    } else {
      show("हटाने में विफल", "err");
    }
  };

  const bulkStatus = async (status: "subscribe" | "unsubscribe") => {
    if (selected.length === 0) return;
    const action = status === "subscribe" ? "subscribe" : "unsubscribe";
    const res = await fetch("/api/admin/newsletter/subscribers/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: selected }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; modified?: number };
    if (res.ok && data.ok) {
      show(`${data.modified} ${status === "subscribe" ? "सक्रिय" : "निष्क्रिय"} कर दिए गए`);
      setSelected([]);
      await load();
    } else {
      show(data.error ?? "ऑपरेशन विफल", "err");
    }
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
            सब्सक्राइबर
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <span className="tnum">{total}</span> कुल •{" "}
            <span className="tnum">{activeCount}</span> सक्रिय •{" "}
            <span className="tnum">{unverifiedCount}</span> pending verification
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => bulkStatus("unsubscribe")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-surface px-3 py-2 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer"
              >
                <Icon name="mail" size={13} />
                Unsubscribe
              </button>
              <button
                type="button"
                onClick={() => bulkStatus("subscribe")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-surface px-3 py-2 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer"
              >
                <Icon name="check" size={13} />
                Subscribe
              </button>
              <DeleteButton onConfirm={removeSelected} label="हटाएं" />
            </>
          )}
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95 cursor-pointer"
          >
            <Icon name="plus" size={16} strokeWidth={2.4} />
            नई सब्सक्राइबर जोड़ें
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
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="नाम या ईमेल से खोजें…"
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
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
        >
          <option value="all">सभी स्थिति</option>
          <option value="active">सक्रिय</option>
          <option value="unsubscribed">निष्क्रिय</option>
          <option value="bounced">बाउंस</option>
          <option value="blocked">ब्लॉक्ड</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
        >
          <option value="all">सभी स्रोत</option>
          <option value="website">वेबसाइट</option>
          <option value="admin">एडमिन</option>
          <option value="import">इम्पोर्ट</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyRow text="कोई सब्सक्राइबर नहीं मिला" />
      ) : (
        <AdminTable
          data={filtered}
          emptyText="कोई सब्सक्राइबर नहीं मिला"
          header={
            <tr>

              <th className="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected(filtered.map((s) => s.id));
                    } else {
                      setSelected([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-left">Name</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-left">Source</th>
              <th className="px-3 py-3 text-right">Date</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          }
          renderRow={(s) => (
            <tr key={s.id} className={`transition-colors hover:bg-paper ${s.status !== "active" ? "opacity-55" : ""}`}>
              <td className="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected([...selected, s.id]);
                    } else {
                      setSelected(selected.filter((id) => id !== s.id));
                    }
                  }}
                />
              </td>
              <td className="max-w-[220px] px-4 py-3">
                <p className="truncate font-extrabold text-ink">{s.email}</p>
                {!s.isVerified && (
                  <span className="inline-block rounded-full bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold text-navy-700">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-3 py-3 text-ink-soft">{s.name || "—"}</td>
              <td className="px-3 py-3 text-center">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  s.status === "active" ? "bg-leaf-100 text-leaf-800" :
                  s.status === "unsubscribed" ? "bg-navy-100 text-navy-700" :
                  s.status === "bounced" ? "bg-rose-100 text-rose-800" :
                  "bg-slate-100 text-slate-700"
                }`}>
                  {s.status === "active" ? "सक्रिय" :
                   s.status === "unsubscribed" ? "निष्क्रिय" :
                   s.status === "bounced" ? "बाउंस" : "ब्लॉक्ड"}
                </span>
              </td>
              <td className="px-3 py-3 text-ink-soft">{s.source || "—"}</td>
              <td className="px-3 py-3 text-right text-[11px] text-ink-soft tnum">
                {new Date(s.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"
                    title="Edit"
                  >
                    <Icon name="pencil" size={15} />
                  </button>
                  <DeleteButton onConfirm={() => removeSingle(s)} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-4 text-right text-sm text-ink-soft">
          Page {page} • {total} total
        </div>
      )}

      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? `Edit — ${editing.email}` : "नई सब्सक्राइबर जोड़ें"}
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
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Icon name="check" size={16} strokeWidth={2.6} />
              )}
              {editing ? "अपडेट" : "जोड़ें"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ईमेल" required>
              <input
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="subscriber@example.com"
              />
            </Field>
            <Field label="नाम">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="जैसे: राजेश कुमार"
              />
            </Field>
          </div>
          <Field label="स्थिति">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
              className="rounded-xl border-2 border-navy-100 bg-surface w-full px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
              <option value="blocked">Blocked</option>
            </select>
          </Field>
        </div>
      </SlidePanel>
    </div>
  );
}

