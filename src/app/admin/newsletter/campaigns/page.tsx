"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DeleteButton, EmptyRow, Spinner, useToast } from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";

type Campaign = {
  id: string;
  title: string;
  subject: string;
  previewText: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed";
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const { toast, show, node } = useToast();

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/admin/newsletter/campaigns?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }
      const data = (await res.json()) as { campaigns: Campaign[]; total: number };
      setCampaigns(data.campaigns ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      show("कैंपेन नहीं मिले", "err");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react/hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return campaigns;
    return campaigns.filter(
      (c) => c.title.toLowerCase().includes(term) || c.subject.toLowerCase().includes(term)
    );
  }, [campaigns, q]);

  const handleSend = async (c: Campaign) => {
    if (c.status !== "scheduled" && c.status !== "draft") {
      show(`कैंपेन स्टेटस "${c.status}" में भेजा नहीं जा सकता`, "err");
      return;
    }
    if (!window.confirm(`क्या आप वाकई भेजना चाहते हैं "${c.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${c.id}/send`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string; sent?: number; failed?: number; total?: number };
      if (res.ok && data.ok) {
        show(`Sent to ${data.sent} subscribers (${data.failed} failed)`);
        await load();
      } else {
        show(data.error ?? "भेजने में विफल", "err");
      }
    } catch {
      show("नेटवर्क त्रुटि", "err");
    }
  };

  const handleDelete = async (c: Campaign) => {
    if (!window.confirm(`"${c.title}" को हटाना है?`)) return;
    const res = await fetch(`/api/admin/newsletter/campaigns/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      show("कैंपेन हटा दिया गया");
      await load();
    } else {
      show("हटाने में विफल", "err");
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
            Newsletter Campaigns
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            <span className="tnum">{total}</span> कुल •{" "}
            <span className="tnum">{campaigns.filter(c => c.status === "sent").length}</span> भेजा गया
          </p>
        </div>
        <Link
          href="/admin/newsletter/create"
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 active:scale-95 cursor-pointer"
        >
          <Icon name="plus" size={16} strokeWidth={2.4} />
          नया कैंपेन
        </Link>
      </div>

      <div className="mb-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center rounded-xl border-2 border-navy-100 bg-surface transition-colors focus-within:border-saffron-500">
          <span className="pl-3.5 text-navy-400">
            <Icon name="search" size={17} />
          </span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="कैंपेन खोजें…"
            className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-ink-soft/60"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border-2 border-navy-100 bg-surface px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
        >
          <option value="all">सभी स्थिति</option>
          <option value="draft">ड्राफ्ट</option>
          <option value="scheduled">शेड्यूल्ड</option>
          <option value="sent">भेजा गया</option>
          <option value="failed">फेल</option>
          <option value="sending">भेज रहा है</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyRow text="कोई कैंपेन नहीं मिला" />
      ) : (
        <AdminTable
          data={filtered}
          emptyText="कोई कैंपेन नहीं मिला"
          header={
            <tr>
              <th className="px-4 py-3 text-left">Campaign</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-right">Sent</th>
              <th className="px-3 py-3 text-right">Opened</th>
              <th className="px-3 py-3 text-right">Clicked</th>
              <th className="px-3 py-3 text-right">Date</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          }
          renderRow={(c) => (
            <tr key={c.id} className="transition-colors hover:bg-paper">
              <td className="max-w-[280px] px-4 py-3">
                <p className="truncate font-extrabold text-ink">{c.title}</p>
                <p className="truncate text-xs font-semibold text-ink-soft">{c.subject}</p>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  c.status === "sent" ? "bg-leaf-100 text-leaf-800" :
                  c.status === "scheduled" ? "bg-saffron-100 text-saffron-800" :
                  c.status === "sending" ? "bg-sky-100 text-sky-800" :
                  c.status === "failed" ? "bg-rose-100 text-rose-800" :
                  c.status === "draft" ? "bg-navy-100 text-navy-700" :
                  "bg-slate-100 text-slate-700"
                }`}>
                  {c.status === "sent" ? "Sent" :
                   c.status === "scheduled" ? "Scheduled" :
                   c.status === "sending" ? "Sending" :
                   c.status === "failed" ? "Failed" :
                   c.status === "draft" ? "Draft" :
                   c.status}
                </span>
              </td>
              <td className="px-3 py-3 text-right font-extrabold text-navy-800 tnum">{c.sentCount}</td>
              <td className="px-3 py-3 text-right font-extrabold text-navy-800 tnum">{c.openedCount}</td>
              <td className="px-3 py-3 text-right font-extrabold text-navy-800 tnum">{c.clickedCount}</td>
              <td className="px-3 py-3 text-right text-[11px] text-ink-soft tnum">
                {c.sentAt ? new Date(c.sentAt).toLocaleDateString("en-IN") : new Date(c.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/newsletter/create?id=${c.id}`}
                    className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900"
                    title="Edit"
                  >
                    <Icon name="pencil" size={15} />
                  </Link>
                  {(c.status === "scheduled" || c.status === "draft") && (
                    <button
                      type="button"
                      onClick={() => handleSend(c)}
                      className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"
                      title="Send now"
                    >
                      <Icon name="mail" size={15} />
                    </button>
                  )}
                  <DeleteButton onConfirm={() => handleDelete(c)} />
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
    </div>
  );
}
