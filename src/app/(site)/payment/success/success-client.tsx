"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  return (
    <div className="mt-6 rounded-xl border border-leaf-300 bg-leaf-50 p-6">
      <h2 className="font-display text-xl font-bold text-leaf-800">Payment Proof Submitted Successfully</h2>
      <div className="mt-4 space-y-2 text-sm text-leaf-900">
        {requestId && <p><strong>Request ID:</strong> {requestId}</p>}
        <p><strong>Status:</strong> Under Verification</p>
        <p><strong>Submitted:</strong> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <p className="mt-4 text-sm text-leaf-800">We will verify your payment and update the status. You will be notified once your advertisement is approved and published.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {requestId && <Link href={`/advertise/status?requestId=${requestId}`} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">Track Status</Link>}
        <Link href="/advertise" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">New Advertisement</Link>
      </div>
    </div>
  );
}
