import { Metadata } from "next";
import { Bi } from "@/components/bi";
import { Suspense } from "react";
import { AdvertiseStatusContent } from "./status-content";

export const metadata: Metadata = {
  title: "Advertisement Status | APPZENO Sarkari Portal",
  description: "Check the status of your advertisement request",
};

export default function AdvertiseStatusPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <Bi hi="विज्ञापन स्थिति" en="Advertisement Status" />
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Check the status of your advertisement request</p>
      <Suspense fallback={<div className="mt-8 grid place-items-center py-24"><span className="size-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-saffron-500"></span></div>}>
        <AdvertiseStatusContent />
      </Suspense>
    </div>
  );
}
