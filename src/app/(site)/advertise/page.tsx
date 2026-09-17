"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";

type AdType = {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  basePrice: number;
  billingUnit: string;
};

type Placement = {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  multiplier: number;
  priority: number;
};

type DurationPlan = {
  id: string;
  days: number;
  discountPercent: number;
};

type PaymentSettings = {
  upiEnabled: boolean;
  upiId: string;
  payeeName: string;
  merchantName: string;
  gstPercent: number;
  whatsappNumber: string;
};

export default function AdvertisePage() {
  const pricingQuery = api.ads.adPricing.useQuery();
  const paymentSettingsQuery = api.payment.settings.useQuery();
  const submitAdvertisement = api.ads.submitAdvertisement.useMutation();

  const adTypes = pricingQuery.data?.adTypes ?? [];
  const placements = pricingQuery.data?.placements ?? [];
  const durationPlans = pricingQuery.data?.plans ?? [];
  const paymentSettings = paymentSettingsQuery.data ?? null;
  const loading = pricingQuery.isLoading || paymentSettingsQuery.isLoading;
  const loadError = pricingQuery.error ? "Failed to load pricing data" : "";
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    advertiserName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    websiteUrl: "",
    businessCategory: "",
    adTypeCode: "",
    placementCode: "",
    durationDays: "",
    startDate: new Date().toISOString().split("T")[0],
    targetPage: "",
    adTitle: "",
    shortDescription: "",
    ctaText: "",
    destinationUrl: "",
    creativeType: "link",
    imageUrl: "",
    bannerImageUrl: "",
    logoUrl: "",
    altText: "",
  });

  const [calculatedPrice, setCalculatedPrice] = useState({
    basePrice: 0,
    placementMultiplier: 1,
    grossAmount: 0,
    discountPercent: 0,
    discountAmount: 0,
    subtotal: 0,
    gstPercent: 0,
    gstAmount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const adType = adTypes.find((a) => a.code === form.adTypeCode);
    const placement = placements.find((p) => p.code === form.placementCode);
    const duration = durationPlans.find((d) => d.days === Number(form.durationDays));
    const basePrice = adType?.basePrice || 0;
    const placementMultiplier = placement?.multiplier || 1;
    const grossAmount = basePrice * placementMultiplier * (Number(form.durationDays) || 1);
    const discountPercent = duration?.discountPercent || 0;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const subtotal = grossAmount - discountAmount;
    const gstPercent = paymentSettings?.gstPercent || 0;
    const gstAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + gstAmount;

    setCalculatedPrice({
      basePrice,
      placementMultiplier,
      grossAmount,
      discountPercent,
      discountAmount,
      subtotal,
      gstPercent,
      gstAmount,
      totalAmount,
    });
  }, [form.adTypeCode, form.placementCode, form.durationDays, adTypes, placements, durationPlans, paymentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await submitAdvertisement.mutateAsync({
        ...form,
        durationDays: Number(form.durationDays) || 0,
        ...calculatedPrice,
      });
      if (data.ok) {
        setRequestId(data.requestId);
        setSubmitted(true);
      } else {
        setError("Failed to submit request");
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <span className="size-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-saffron-500" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-leaf-300 bg-leaf-50 p-6">
          <h2 className="font-display text-xl font-bold text-leaf-800">Your advertisement request has been submitted successfully</h2>
          <div className="mt-4 space-y-2 text-sm text-leaf-900">
            <p><strong>Request ID:</strong> {requestId}</p>
            <p><strong>Amount Payable:</strong> ₹{calculatedPrice.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> Payment Pending</p>
            <p><strong>Submitted:</strong> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <p className="mt-4 text-sm text-leaf-800">Please complete the payment to proceed. You will receive payment details on the next page.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/payment?requestId=${requestId}`} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">
              Proceed to Payment
            </Link>
            <Link href="/help" className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer">
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedAdType = adTypes.find((a) => a.code === form.adTypeCode);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">Advertise on APPZENO Sarkari Portal</h1>
      <p className="mt-2 text-sm text-ink-soft">Reach millions of users looking for government services, jobs, and schemes.</p>

      {(error || loadError) && <p className="mt-4 text-sm font-bold text-rose-600">{error || loadError}</p>}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Advertiser Information */}
        <section className="rounded-xl border border-navy-100 bg-surface p-6">
          <h2 className="font-display text-xl font-bold text-navy-900">Advertiser Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Business / Organization Name *</label>
              <input type="text" required value={form.advertiserName} onChange={(e) => setForm({ ...form, advertiserName: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Contact Person *</label>
              <input type="text" required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Email Address *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Mobile Number *</label>
              <input type="tel" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Website URL</label>
              <input type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Business Category</label>
              <input type="text" value={form.businessCategory} onChange={(e) => setForm({ ...form, businessCategory: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
          </div>
        </section>

        {/* Advertisement Details */}
        <section className="rounded-xl border border-navy-100 bg-surface p-6">
          <h2 className="font-display text-xl font-bold text-navy-900">Advertisement Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Ad Type *</label>
              <select required value={form.adTypeCode} onChange={(e) => setForm({ ...form, adTypeCode: e.target.value, creativeType: e.target.value.toLowerCase() })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500">
                <option value="">Select Ad Type</option>
                {adTypes.map((at) => (
                  <option key={at.id} value={at.code}>{at.nameEn} - ₹{at.basePrice}/{at.billingUnit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Placement *</label>
              <select required value={form.placementCode} onChange={(e) => setForm({ ...form, placementCode: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500">
                <option value="">Select Placement</option>
                {placements.map((p) => (
                  <option key={p.id} value={p.code}>{p.nameEn} ({p.multiplier}x)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Duration *</label>
              <select required value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500">
                <option value="">Select Duration</option>
                {durationPlans.map((d) => (
                  <option key={d.id} value={d.days}>{d.days} Days {d.discountPercent > 0 ? `(${d.discountPercent}% off)` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Start Date *</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Target Page / Category</label>
              <input type="text" value={form.targetPage} onChange={(e) => setForm({ ...form, targetPage: e.target.value })} placeholder="e.g. /government-jobs" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Ad Title *</label>
              <input type="text" required value={form.adTitle} onChange={(e) => setForm({ ...form, adTitle: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Short Description</label>
              <textarea rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500 resize-y" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">CTA Text</label>
              <input type="text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} placeholder="e.g. Apply Now" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Destination URL *</label>
              <input type="url" required value={form.destinationUrl} onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
            </div>
          </div>
        </section>

        {/* Dynamic Creative Fields */}
        {form.adTypeCode && (
          <section className="rounded-xl border border-navy-100 bg-surface p-6">
            <h2 className="font-display text-xl font-bold text-navy-900">Creative Assets</h2>
            <p className="mt-1 text-sm text-ink-soft">{selectedAdType?.descriptionEn}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(form.creativeType === "image" || form.creativeType === "banner" || form.creativeType === "sponsored") && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Image URL *</label>
                  <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
                </div>
              )}
              {form.creativeType === "banner" && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Banner Image URL</label>
                  <input type="url" value={form.bannerImageUrl} onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })} placeholder="https://example.com/banner.jpg" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
                </div>
              )}
              {form.creativeType === "sponsored" && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Logo URL</label>
                  <input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
                </div>
              )}
              {(form.creativeType === "image" || form.creativeType === "banner") && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Alt Text</label>
                  <input type="text" value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Budget Calculator */}
        {form.adTypeCode && form.placementCode && form.durationDays && (
          <section className="rounded-xl border border-saffron-300 bg-saffron-50 p-6">
            <h2 className="font-display text-xl font-bold text-saffron-900">Estimated Budget</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-saffron-700">Base Price ({selectedAdType?.nameEn})</span>
                <span className="font-extrabold text-saffron-900">₹{calculatedPrice.basePrice.toFixed(2)}/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-saffron-700">Placement Multiplier</span>
                <span className="font-extrabold text-saffron-900">× {calculatedPrice.placementMultiplier.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-saffron-700">Duration</span>
                <span className="font-extrabold text-saffron-900">{form.durationDays} Days</span>
              </div>
              <div className="flex justify-between border-t border-saffron-200 pt-2">
                <span className="text-saffron-700">Gross Amount</span>
                <span className="font-extrabold text-saffron-900">₹{calculatedPrice.grossAmount.toFixed(2)}</span>
              </div>
              {calculatedPrice.discountPercent > 0 && (
                <div className="flex justify-between text-leaf-700">
                  <span>Discount ({calculatedPrice.discountPercent}%)</span>
                  <span className="font-extrabold">-₹{calculatedPrice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-saffron-200 pt-2">
                <span className="font-extrabold text-saffron-900">Subtotal</span>
                <span className="font-extrabold text-saffron-900">₹{calculatedPrice.subtotal.toFixed(2)}</span>
              </div>
              {calculatedPrice.gstPercent > 0 && (
                <div className="flex justify-between text-saffron-700">
                  <span>GST ({calculatedPrice.gstPercent}%)</span>
                  <span className="font-extrabold">+₹{calculatedPrice.gstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-saffron-300 pt-2">
                <span className="text-lg font-extrabold text-saffron-900">TOTAL</span>
                <span className="text-lg font-extrabold text-saffron-900">₹{calculatedPrice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-3 border-t border-navy-100 pt-6">
          <button type="submit" disabled={submitting || !form.adTypeCode || !form.placementCode || !form.durationDays} className="rounded-xl bg-saffron-500 px-6 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
            {submitting ? "Submitting..." : "Continue to Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
