"use client";

import { useCallback, useEffect, useState } from "react";
import { DeleteButton, EmptyRow, Field, inputCls, SortTh, Spinner, useToast } from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { SlidePanel } from "@/components/admin/slide-panel";
import { Icon } from "@/components/icons";
import { colorOf } from "@/components/icons";

type Advertisement = {
  id: string;
  requestId: string;
  advertiserName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  adTitle: string;
  adTypeCode: string;
  placementCode: string;
  durationDays: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  adminReply: string;
  internalNotes: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-navy-100 text-navy-800",
  SUBMITTED: "bg-sky-100 text-sky-800",
  PAYMENT_PENDING: "bg-amber-100 text-amber-800",
  PAYMENT_VERIFICATION: "bg-purple-100 text-purple-800",
  CONTENT_REVIEW: "bg-blue-100 text-blue-800",
  CREATIVE_REVIEW: "bg-indigo-100 text-indigo-800",
  APPROVED: "bg-leaf-100 text-leaf-800",
  SCHEDULED: "bg-teal-100 text-teal-800",
  LIVE: "bg-emerald-100 text-emerald-800",
  PAUSED: "bg-orange-100 text-orange-800",
  EXPIRED: "bg-slate-100 text-slate-800",
  REJECTED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-slate-100 text-slate-800",
};

export default function AdminAdvertisementsPage() {
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, submitted: 0, paymentPending: 0, paymentVerification: 0, contentReview: 0, approved: 0, scheduled: 0, live: 0, expired: 0, rejected: 0, cancelled: 0 });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [form, setForm] = useState({ status: "", paymentStatus: "", adminReply: "", internalNotes: "", rejectionReason: "", assignedTo: "" });
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/advertisements");
      const data = (await res.json()) as { ads: Advertisement[]; stats: typeof stats };
      if (res.ok) {
        setAds(data.ads || []);
        setStats(data.stats || stats);
      }
    } catch {
      show("लोड नहीं हो पाया", "err");
    } finally {
      setLoading(false);
    }
  }, [show, stats]);

  useEffect(() => { void load(); }, [load]);

  const openEdit = (ad: Advertisement) => {
    setEditing(ad);
    setForm({
      status: ad.status,
      paymentStatus: ad.paymentStatus,
      adminReply: ad.adminReply,
      internalNotes: ad.internalNotes,
      rejectionReason: ad.rejectionReason,
      assignedTo: "",
    });
    setModal(true);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/advertisements/${editing.requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        show("अपडेट हो गया");
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

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Advertisements</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">All Advertisements</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          <span className="tnum">{stats.total}</span> कुल • <span className="tnum">{stats.live}</span> लाइव • <span className="tnum">{stats.paymentPending}</span> पेमेंट पेंडिंग
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Draft" value={stats.draft} accent="navy" />
        <StatCard label="Submitted" value={stats.submitted} accent="sky" />
        <StatCard label="Pay Pending" value={stats.paymentPending} accent="amber" />
        <StatCard label="In Review" value={stats.contentReview} accent="purple" />
        <StatCard label="Live" value={stats.live} accent="green" />
      </div>

      {ads.length === 0 ? (
        <EmptyRow text="अभी कोई विज्ञापन अनुरोध नहीं" />
      ) : (
        <AdminTable
          data={ads}
          emptyText="अभी कोई विज्ञापन अनुरोध नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-left">Request ID</th>
              <th className="px-3 py-3 text-left">आवेदक</th>
              <th className="px-3 py-3 text-left">विषय</th>
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-center">पेमेंट</th>
              <th className="px-3 py-3 text-left">तिथि</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(ad) => (
            <tr key={ad.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3">
                <p className="font-extrabold text-ink">{ad.requestId}</p>
                <p className="text-xs text-ink-soft">{ad.email}</p>
              </td>
              <td className="px-3 py-3">
                <p className="font-extrabold text-ink">{ad.advertiserName}</p>
                <p className="text-xs text-ink-soft">{ad.contactPerson}</p>
              </td>
              <td className="px-3 py-3">
                <p className="truncate max-w-[200px] text-sm font-semibold text-ink">{ad.adTitle}</p>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${STATUS_COLORS[ad.status] || "bg-slate-100 text-slate-700"}`}>
                  {ad.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${ad.paymentStatus === "PAID" || ad.paymentStatus === "VERIFIED" ? "bg-leaf-100 text-leaf-800" : "bg-amber-100 text-amber-800"}`}>
                  {ad.paymentStatus.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-ink-soft">
                {new Date(ad.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(ad)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer" title="देखें / अपडेट करें">
                    <Icon name="pencil" size={15} />
                  </button>
                  <DeleteButton onConfirm={async () => { }} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {/* Edit Modal */}
      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? `View Request — ${editing.requestId}` : "View Request"}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-navy-50 cursor-pointer">रद्द करें</button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
              {saving ? <span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" /> : <Icon name="check" size={16} strokeWidth={2.6} />}
              अपडेट करें
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-5">
            <div className="rounded-xl border border-navy-100 bg-paper p-4">
              <p className="text-sm font-extrabold text-navy-900">{editing.adTitle}</p>
              <p className="mt-1 text-xs text-ink-soft">{editing.advertiserName} • {editing.email} • ₹{editing.totalAmount.toFixed(2)}</p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Submitted Data</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Advertiser Name"><input className={inputCls} value={editing.advertiserName} readOnly /></Field>
                <Field label="Contact Person"><input className={inputCls} value={editing.contactPerson} readOnly /></Field>
                <Field label="Email"><input className={inputCls} value={editing.email} readOnly /></Field>
                <Field label="Mobile"><input className={inputCls} value={editing.mobile} readOnly /></Field>
                <Field label="Ad Type"><input className={inputCls} value={editing.adTypeCode.replace(/_/g, " ")} readOnly /></Field>
                <Field label="Placement"><input className={inputCls} value={editing.placementCode.replace(/_/g, " ")} readOnly /></Field>
                <Field label="Duration"><input className={inputCls} value={`${editing.durationDays} Days`} readOnly /></Field>
                <Field label="Total Amount"><input className={inputCls} value={`₹${editing.totalAmount.toFixed(2)}`} readOnly /></Field>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Admin Actions</h3>
              <div className="space-y-3">
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="PAYMENT_PENDING">Payment Pending</option>
                    <option value="PAYMENT_VERIFICATION">Payment Verification</option>
                    <option value="CONTENT_REVIEW">Content Review</option>
                    <option value="CREATIVE_REVIEW">Creative Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live</option>
                    <option value="PAUSED">Paused</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </Field>
                <Field label="Payment Status">
                  <select className={inputCls} value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="FAILED">Failed</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </Field>
                <Field label="Reply to User">
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.adminReply} onChange={(e) => setForm({ ...form, adminReply: e.target.value })} placeholder="Write your reply to the user..." />
                </Field>
                <Field label="Internal Notes">
                  <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} placeholder="Internal notes..." />
                </Field>
                <Field label="Rejection Reason">
                  <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.rejectionReason} onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })} placeholder="Reason if rejected..." />
                </Field>
              </div>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

function StatCard({ label, value, accent = "navy" }: { label: string; value: number; accent?: string }) {
  const color = colorOf(accent);
  return (
    <div className="rounded-xl border border-navy-100 bg-surface p-3 shadow-sm">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tnum ${color.text}`}>{value}</p>
    </div>
  );
}
