"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { DeleteButton, EmptyRow, Field, inputCls, SortTh, Spinner, useToast } from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { SlidePanel } from "@/components/admin/slide-panel";
import { Icon } from "@/components/icons";
import { colorOf } from "@/components/icons";

type ContactRequest = {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  requestType: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assignedTo: string;
  submittedAt: string;
  reviewedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  resolution: string;
  internalNotes: string;
  reply: string;
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "bg-navy-100 text-navy-800",
  UNDER_REVIEW: "bg-purple-100 text-purple-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-leaf-100 text-leaf-800",
  REJECTED: "bg-rose-100 text-rose-800",
  CLOSED: "bg-slate-100 text-slate-100",
};

export default function AdminContactRequestsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ContactRequest | null>(null);
  const [form, setForm] = useState({ status: "", priority: "", resolution: "", internalNotes: "", assignedTo: "", reply: "" });
  const { show } = useToast();
  const utils = api.useUtils();

  const listQuery = api.contact.adminList.useQuery({ page: 1, limit: 100 });
  const requests = useMemo(() => (listQuery.data?.items ?? []) as unknown as ContactRequest[], [listQuery.data]);
  const stats = useMemo(() => {
    const s = { total: listQuery.data?.total ?? requests.length, received: 0, underReview: 0, completed: 0, rejected: 0 };
    for (const r of requests) {
      if (r.status === "RECEIVED") s.received++;
      else if (r.status === "UNDER_REVIEW") s.underReview++;
      else if (r.status === "COMPLETED") s.completed++;
      else if (r.status === "REJECTED") s.rejected++;
    }
    return s;
  }, [requests, listQuery.data]);

  useEffect(() => {
    if (listQuery.isError) show("लोड नहीं हो पाया", "err");
  }, [listQuery.isError, show]);

  const saveMut = api.contact.adminUpdate.useMutation({
    onSuccess: () => {
      show("अपडेट हो गया");
      setModal(false);
      void utils.contact.adminList.invalidate();
    },
    onError: () => show("सेव नहीं हो पाया", "err"),
  });
  const markMut = api.contact.adminUpdate.useMutation({
    onSuccess: () => {
      void utils.contact.adminList.invalidate();
    },
  });
  const saving = saveMut.isPending;

  const openEdit = (req: ContactRequest) => {
    setEditing(req);
    setForm({
      status: req.status,
      priority: req.priority,
      resolution: req.resolution ?? "",
      internalNotes: req.internalNotes ?? "",
      assignedTo: req.assignedTo || "",
      reply: req.reply || "",
    });
    setModal(true);

    if (!req.reviewedAt) {
      const stamp: Record<string, string> = { reviewedAt: new Date().toISOString() };
      markMut.mutate({ ticketId: req.ticketId, ...stamp });
    }
  };

  const save = () => {
    if (!editing) return;
    if (form.status === "REJECTED" && !form.resolution.trim()) {
      show("Resolution is required when rejecting", "err");
      return;
    }
    const now = new Date().toISOString();
    const stamp: Record<string, string> = {};
    if (form.status === "COMPLETED" && !editing.completedAt) stamp.completedAt = now;
    if (form.status === "CLOSED" && !editing.closedAt) stamp.closedAt = now;
    saveMut.mutate({ ticketId: editing.ticketId, ...form, ...stamp });
  };

  if (listQuery.isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Support</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">Contact Requests</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          <span className="tnum">{stats.total}</span> कुल • <span className="tnum">{stats.received}</span> प्राप्त • <span className="tnum">{stats.underReview}</span> समीक्षा में • <span className="tnum">{stats.completed}</span> पूर्ण
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Received" value={stats.received} accent="navy" />
        <StatCard label="Review" value={stats.underReview} accent="purple" />
        <StatCard label="Completed" value={stats.completed} accent="green" />
        <StatCard label="Rejected" value={stats.rejected} accent="rose" />
      </div>

      {requests.length === 0 ? (
        <EmptyRow text="अभी कोई कॉन्टैक्ट अनुरोध नहीं" />
      ) : (
        <AdminTable
          data={requests}
          emptyText="अभी कोई कॉन्टैक्ट अनुरोध नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-left">Ticket ID</th>
              <th className="px-3 py-3 text-left">आवेदक</th>
              <th className="px-3 py-3 text-left">ईमेल</th>
              <th className="px-3 py-3 text-left">प्रकार</th>
              <th className="px-3 py-3 text-left">विषय</th>
              <th className="px-3 py-3 text-center">स्थिति</th>
              <th className="px-3 py-3 text-left">तिथि</th>
              <th className="px-3 py-3 text-right">एक्शन</th>
            </tr>
          }
          renderRow={(req) => (
            <tr key={req.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3">
                <p className="font-extrabold text-ink">{req.ticketId}</p>
              </td>
              <td className="px-3 py-3">
                <p className="font-extrabold text-ink">{req.fullName}</p>
              </td>
              <td className="px-3 py-3">
                <p className="truncate max-w-[180px] text-sm text-ink-soft">{req.email}</p>
              </td>
              <td className="px-3 py-3">
                <span className="rounded bg-navy-50 px-2 py-0.5 text-[11px] font-bold text-navy-700">{req.requestType.replace(/_/g, " ")}</span>
              </td>
              <td className="px-3 py-3">
                <p className="truncate max-w-[220px] text-sm font-semibold text-ink">{req.subject}</p>
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${STATUS_COLORS[req.status] || "bg-slate-100 text-slate-700"}`}>
                  {req.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-ink-soft">
                {new Date(req.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(req)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer" title="देखें / अपडेट करें">
                    <Icon name="pencil" size={15} />
                  </button>
                  <DeleteButton onConfirm={async () => { /* delete logic if needed */ }} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {/* View / Edit Slide Panel */}
      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? `View Request — ${editing.ticketId}` : "View Request"}
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
            {/* Request Info */}
            <div className="rounded-xl border border-navy-100 bg-paper p-4">
              <p className="text-sm font-extrabold text-navy-900">{editing.subject}</p>
              <p className="mt-1 text-xs text-ink-soft">{editing.requestType.replace(/_/g, " ")} • {editing.email}</p>
            </div>

            {/* Submitted Data */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Submitted Data</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Full Name"><input className={inputCls} value={editing.fullName} readOnly /></Field>
                <Field label="Email"><input className={inputCls} value={editing.email} readOnly /></Field>
                <Field label="Request Type"><input className={inputCls} value={editing.requestType.replace(/_/g, " ")} readOnly /></Field>
                <Field label="Status">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${STATUS_COLORS[editing.status] || "bg-slate-100 text-slate-700"}`}>{editing.status.replace(/_/g, " ")}</span>
                </Field>
              </div>
              <div className="mt-2">
                <Field label="Message"><textarea className={`${inputCls} min-h-[80px] resize-y`} value={editing.message} readOnly /></Field>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Timeline</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Submitted"><input className={inputCls} value={new Date(editing.submittedAt).toLocaleString("en-IN")} readOnly /></Field>
                <Field label="Reviewed"><input className={inputCls} value={editing.reviewedAt ? new Date(editing.reviewedAt).toLocaleString("en-IN") : "—"} readOnly /></Field>
                <Field label="Completed"><input className={inputCls} value={editing.completedAt ? new Date(editing.completedAt).toLocaleString("en-IN") : "—"} readOnly /></Field>
                <Field label="Closed"><input className={inputCls} value={editing.closedAt ? new Date(editing.closedAt).toLocaleString("en-IN") : "—"} readOnly /></Field>
              </div>
            </div>

            {/* Admin Actions */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Admin Actions</h3>
              <div className="space-y-3">
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="RECEIVED">Received</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </Field>
                <Field label="Priority">
                  <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </Field>
                <Field label="Assigned To">
                  <input className={inputCls} value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Admin username" />
                </Field>
                <Field label="Reply to User">
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.reply} onChange={(e) => setForm({ ...form, reply: e.target.value })} placeholder="Write your reply to the user..." />
                </Field>
                <Field label="Internal Notes">
                  <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} placeholder="Internal notes..." />
                </Field>
                <Field label="Resolution">
                  <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} placeholder="Resolution details..." />
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
