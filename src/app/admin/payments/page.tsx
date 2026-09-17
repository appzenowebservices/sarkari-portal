"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { DeleteButton, EmptyRow, Field, inputCls, SortTh, Spinner, useToast } from "@/components/admin/ui";
import { AdminTable } from "@/components/admin/table-pagination";
import { SlidePanel } from "@/components/admin/slide-panel";
import { Icon } from "@/components/icons";

type Payment = {
  id: string;
  requestId: string;
  amount: number;
  method: string;
  utrNumber: string;
  screenshot: string;
  status: string;
  verifiedAt: string | null;
  verifiedBy: string;
  notes: string;
  createdAt: string;
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  VERIFIED: "bg-leaf-100 text-leaf-800",
  FAILED: "bg-rose-100 text-rose-800",
  REJECTED: "bg-rose-100 text-rose-800",
  REFUNDED: "bg-slate-100 text-slate-700",
};

export default function AdminPaymentsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState({ status: "", verifiedBy: "", notes: "" });
  const { show } = useToast();
  const utils = api.useUtils();

  const paymentsQuery = api.payment.adminPayments.useQuery({ page: 1, limit: 200 });
  const payments = useMemo(() => (paymentsQuery.data?.items ?? []) as unknown as Payment[], [paymentsQuery.data]);

  useEffect(() => {
    if (paymentsQuery.isError) show("लोड नहीं हो पाया", "err");
  }, [paymentsQuery.isError, show]);

  const verifyMut = api.payment.adminVerify.useMutation({
    onSuccess: () => {
      show("अपडेट हो गया");
      setModal(false);
      void utils.payment.adminPayments.invalidate();
    },
    onError: (e) => show(e.message || "सेव नहीं हो पाया", "err"),
  });
  const saving = verifyMut.isPending;

  const openEdit = (payment: Payment) => {
    setEditing(payment);
    setForm({
      status: payment.status,
      verifiedBy: payment.verifiedBy ?? "",
      notes: payment.notes ?? "",
    });
    setModal(true);
  };

  const save = () => {
    if (!editing) return;
    if (form.status !== "VERIFIED" && form.status !== "REJECTED") {
      show("tRPC से केवल Verified / Rejected किया जा सकता है", "err");
      return;
    }
    verifyMut.mutate({
      id: editing.id,
      status: form.status as "VERIFIED" | "REJECTED",
      notes: [form.notes, form.verifiedBy ? `Verified by: ${form.verifiedBy}` : ""].filter(Boolean).join("\n"),
    });
  };

  if (paymentsQuery.isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">Payments</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">All Payments</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          <span className="tnum">{payments.length}</span> कुल पेमेंट्स
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyRow text="अभी कोई पेमेंट नहीं" />
      ) : (
        <AdminTable
          data={payments}
          emptyText="अभी कोई पेमेंट नहीं"
          header={
            <tr>
              <th className="px-3 py-3 text-left">Request ID</th>
              <th className="px-3 py-3 text-left">UTR Number</th>
              <th className="px-3 py-3 text-left">Amount</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-left">Method</th>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          }
          renderRow={(payment) => (
            <tr key={payment.id} className="transition-colors hover:bg-paper">
              <td className="px-3 py-3">
                <p className="font-extrabold text-ink">{payment.requestId}</p>
              </td>
              <td className="px-3 py-3">
                <p className="font-mono text-xs font-bold text-ink">{payment.utrNumber}</p>
              </td>
              <td className="px-3 py-3 text-sm font-extrabold text-navy-900">₹{payment.amount.toFixed(2)}</td>
              <td className="px-3 py-3 text-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${PAYMENT_COLORS[payment.status] || "bg-slate-100 text-slate-700"}`}>
                  {payment.status}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-ink-soft">{payment.method}</td>
              <td className="px-3 py-3 text-xs text-ink-soft">
                {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(payment)} className="grid size-8 place-items-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 cursor-pointer"><Icon name="pencil" size={15} /></button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      <SlidePanel
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? `Verify Payment — ${editing.requestId}` : "Verify Payment"}
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
          <div className="space-y-4">
            <div className="rounded-xl border border-navy-100 bg-paper p-4">
              <p className="text-sm font-extrabold text-navy-900">{editing.requestId}</p>
              <p className="mt-1 text-xs text-ink-soft">UTR: {editing.utrNumber} • ₹{editing.amount.toFixed(2)}</p>
            </div>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="FAILED">Failed</option>
                <option value="REJECTED">Rejected</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </Field>
            <Field label="Verified By">
              <input className={inputCls} value={form.verifiedBy} onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })} placeholder="Admin username" />
            </Field>
            <Field label="Notes">
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment notes..." />
            </Field>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
