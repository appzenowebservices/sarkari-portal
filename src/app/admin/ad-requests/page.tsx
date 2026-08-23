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

type Req = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  adType: string;
  preferredPlacement: string;
  duration: string;
  budget: string;
  message: string;
  status: string;
  adminNotes: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-leaf-100 text-leaf-800",
  rejected: "bg-rose-100 text-rose-700",
  completed: "bg-navy-100 text-navy-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "⏳ पेंडिंग",
  approved: "✅ स्वीकृत",
  rejected: "❌ अस्वीकृत",
  completed: "✔️ पूर्ण",
};

const PLACEMENT_LABELS: Record<string, string> = {
  hero_below: "हीरो के नीचे",
  categories_between: "श्रेणियों के बीच",
  popular_above: "लोकप्रिय के ऊपर",
  footer_above: "फुटर के ऊपर",
  category_top: "श्रेणी पेज ऊपर",
  category_bottom: "श्रेणी पेज नीचे",
  search_top: "खोज पेज ऊपर",
  sidebar: "साइडबार",
};

export default function AdminAdRequestsPage() {
  const [list, setList] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [detail, setDetail] = useState<Req | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { show, node } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ad-requests");
      const data = (await res.json()) as { requests: Req[] };
      setList(data.requests);
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
    return list.filter((r) => r.status === filter);
  }, [list, filter]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortCol) {
        case "name": av = a.name; bv = b.name; break;
        case "adType": av = a.adType; bv = b.adType; break;
        case "placement": av = a.preferredPlacement; bv = b.preferredPlacement; break;
        case "status": av = a.status; bv = b.status; break;
        default: return 0;
      }
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as unknown as number) - (bv as unknown as number)) * dir;
    });
  }, [filtered, sortCol, sortDir]);

  const openDetail = (r: Req) => {
    setDetail(r);
    setNotes(r.adminNotes);
  };

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ad-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (res.ok) {
        show("स्थिति अपडेट हो गई");
        setDetail(null);
        await load();
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: Req) => {
    if (!window.confirm(`"${r.name}" का अनुरोध हटाना है?`)) return;
    const res = await fetch(`/api/admin/ad-requests/${r.id}`, { method: "DELETE" });
    if (res.ok) { show("अनुरोध हटा दिया गया"); await load(); }
    else show("हटाने में विफल", "err");
  };

  const pendingCount = list.filter((r) => r.status === "pending").length;

  return (
    <div>
      {node}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Ad Requests</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">विज्ञापन अनुरोध</h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <span className="tnum">{list.length}</span> कुल
            {pendingCount > 0 && <> • <span className="text-amber-700 font-extrabold tnum">{pendingCount} पेंडिंग</span></>}
          </p>
        </div>
      </div>

      {/* Status filters */}
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {["all", "pending", "approved", "rejected", "completed"].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all cursor-pointer ${
              filter === s ? "border-saffron-500 bg-saffron-50 text-saffron-800" : "border-navy-200 text-ink-soft hover:bg-navy-50"
            }`}
          >
            {s === "all" ? "सभी" : STATUS_LABELS[s] ?? s}
            {s === "pending" && pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white tnum">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyRow text="कोई अनुरोध नहीं" />
      ) : (
        <AdminTable
          data={sorted}
          emptyText="कोई अनुरोध नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-left">आवेदक</th>
              <th className="px-3 py-3 text-left">Ad प्रकार</th>
              <th className="px-3 py-3 text-left">स्थान</th>
              <th className="px-3 py-3 text-left">बजट / अवधि</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(r) => (
            <tr key={r.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${STATUS_COLORS[r.status] ?? "bg-slate-200 text-slate-700"}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </td>
              <td className="px-3 py-3">
                <p className="truncate font-extrabold text-ink">{r.name}</p>
                <p className="truncate text-xs font-semibold text-ink-soft">{r.email} {r.phone && `• ${r.phone}`}</p>
                {r.company && <p className="truncate text-xs font-semibold text-navy-600">{r.company}</p>}
              </td>
              <td className="px-3 py-3">
                <span className="rounded bg-navy-50 px-2 py-0.5 text-[11px] font-bold text-navy-700">{r.adType}</span>
              </td>
              <td className="px-3 py-3">
                <span className="rounded bg-navy-50 px-2 py-0.5 text-[11px] font-bold text-navy-700">
                  {PLACEMENT_LABELS[r.preferredPlacement] ?? r.preferredPlacement}
                </span>
              </td>
              <td className="px-3 py-3">
                {r.budget && <span className="rounded bg-leaf-50 px-2 py-0.5 text-[11px] font-bold text-leaf-700">₹{r.budget}</span>}
                {r.duration && <span className="ml-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{r.duration}</span>}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openDetail(r)} className="grid size-8 place-items-center rounded-lg text-navy-600 hover:bg-navy-100 cursor-pointer" title="View / Update">
                    <Icon name="eye" size={14} />
                  </button>
                  <DeleteButton onConfirm={() => remove(r)} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {/* Detail modal */}
      <SlidePanel open={!!detail} onClose={() => setDetail(null)} title={detail ? `अनुरोध #${detail.id} — ${detail.name}` : ""}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs font-extrabold text-ink-soft">नाम</span><p className="font-bold">{detail.name}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">ईमेल</span><p className="font-bold">{detail.email}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">फोन</span><p className="font-bold">{detail.phone || "—"}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">कंपनी</span><p className="font-bold">{detail.company || "—"}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">Ad प्रकार</span><p className="font-bold">{detail.adType}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">स्थान</span><p className="font-bold">{PLACEMENT_LABELS[detail.preferredPlacement] ?? detail.preferredPlacement}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">अवधि</span><p className="font-bold">{detail.duration || "—"}</p></div>
              <div><span className="text-xs font-extrabold text-ink-soft">बजट</span><p className="font-bold">{detail.budget || "—"}</p></div>
            </div>
            {detail.message && (
              <div className="rounded-lg bg-navy-50 p-3">
                <p className="text-xs font-extrabold text-ink-soft mb-1">संदेश:</p>
                <p className="text-sm text-navy-800">{detail.message}</p>
              </div>
            )}

            <Field label="Admin नोट (internal)">
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." />
            </Field>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["pending", "approved", "rejected", "completed"] as const).map((s) => (
                <button key={s} type="button" onClick={() => updateStatus(detail.id, s)} disabled={saving}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                    detail.status === s ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 text-navy-800 hover:border-navy-400"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
