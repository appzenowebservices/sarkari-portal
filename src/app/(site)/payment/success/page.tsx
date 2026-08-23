import { Metadata } from "next";
import { Bi } from "@/components/bi";
import { Suspense } from "react";
import PaymentSuccessClient from "./success-client";

export const metadata: Metadata = {
  title: "Payment Successful | APPZENO Sarkari Portal",
  description: "Your advertisement payment has been submitted successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="भुगतान सफल" en="Payment Successful" />
      </h1>
      <Suspense fallback={<div className="mt-8 grid place-items-center py-24"><span className="size-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-saffron-500"></span></div>}>
        <PaymentSuccessClient />
      </Suspense>
    </div>
  );
}
