"use client";

import { useEffect, useState } from "react";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Advertisement = {
  id: string;
  requestId: string;
  adTitle: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
};

export default function PaymentClient() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ utrNumber: "", paymentDate: "", paymentTime: "", screenshot: "" });
  const [paymentSettings, setPaymentSettings] = useState<{ upiEnabled: boolean; upiId: string; payeeName: string; merchantName: string; gstPercent: number; whatsappNumber: string } | null>(null);
  const [qrError, setQrError] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [fileError, setFileError] = useState("");

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");

    if (!file.type.startsWith("image/")) {
      setFileError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError("File size must be less than 2MB.");
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setScreenshotPreview(compressed);
      setForm({ ...form, screenshot: compressed });
    } catch {
      setFileError("Failed to process image. Please try another file.");
    } finally {
      setCompressing(false);
    }
  };

  useEffect(() => {
    async function load() {
      if (!requestId) {
        setError("Request ID is required");
        setLoading(false);
        return;
      }

      try {
        const [adRes, settingsRes] = await Promise.all([
          fetch(`/api/advertise/status?requestId=${encodeURIComponent(requestId)}`),
          fetch("/api/public/ad-pricing"),
        ]);

        const adData = await adRes.json();
        const settingsData = await settingsRes.json();

        if (adRes.ok && adData.advertisement) {
          setAd(adData.advertisement);
        } else {
          setError(adData.error || "Advertisement not found");
        }

        if (settingsRes.ok) {
          const ps = settingsData.paymentSettings || {};
          setPaymentSettings({
            upiEnabled: ps.upiEnabled || false,
            upiId: ps.upiId || "",
            payeeName: ps.payeeName || "",
            merchantName: ps.merchantName || "",
            gstPercent: ps.gstPercent || 0,
            whatsappNumber: ps.whatsappNumber || "",
          });
        } else {
          console.error("Failed to load payment settings:", settingsData);
        }
      } catch {
        setError("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/payment/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, ...form }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = `/payment/success?requestId=${requestId}`;
      } else {
        setError(data.error || "Failed to upload payment proof");
      }
    } catch {
      setError("Network error. Please try again.");
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

  if (error || !ad) {
    return (
      <div className="rounded-xl border border-rose-300 bg-rose-50 p-6">
        <h2 className="font-display text-xl font-bold text-rose-800">Advertisement Not Found</h2>
        <p className="mt-2 text-sm text-rose-700">{error || "We could not find this advertisement request."}</p>
        <Link href="/advertise" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 cursor-pointer">
          New Advertisement
        </Link>
      </div>
    );
  }

  const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentSettings?.upiId || "")}&pn=${encodeURIComponent(paymentSettings?.payeeName || "")}&am=${ad.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(ad.requestId)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=ffffff&color=0f172a&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Advertisement Request</span>
            <span className="font-extrabold text-navy-900">{ad.requestId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Ad Title</span>
            <span className="font-extrabold text-navy-900">{ad.adTitle}</span>
          </div>
          <div className="flex justify-between border-t border-navy-100 pt-2">
            <span className="font-extrabold text-navy-900">Amount Payable</span>
            <span className="text-lg font-extrabold text-saffron-700">₹{ad.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {paymentSettings?.upiEnabled && (
        <div className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-navy-900 text-center">Scan & Pay</h2>
          <div className="mx-auto mt-4 grid size-52 place-items-center overflow-hidden rounded-2xl border-2 border-navy-100 bg-white">
            {qrError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Icon name="alert" size={32} className="text-amber-500" />
                <p className="mt-2 text-xs font-bold text-navy-800">QR Code unavailable</p>
                <p className="text-[11px] text-ink-soft">Please use the UPI ID below to pay manually</p>
              </div>
            ) : (
              <img
                src={qrSrc}
                alt="UPI QR Code"
                width={300}
                height={300}
                className="size-full object-contain"
                loading="eager"
                onError={() => setQrError(true)}
              />
            )}
          </div>
          <p className="mt-4 text-center text-sm text-ink-soft">Amount: <span className="font-extrabold text-navy-900">₹{ad.totalAmount.toFixed(2)}</span></p>
          <div className="mt-4 rounded-lg bg-paper p-3 text-center">
            <p className="text-xs text-ink-soft">UPI ID</p>
            <p className="text-sm font-extrabold text-navy-900">{paymentSettings.upiId}</p>
            <button type="button" onClick={() => navigator.clipboard.writeText(paymentSettings.upiId)} className="mt-1 text-xs font-bold text-saffron-600 hover:text-saffron-800 cursor-pointer">
              Copy UPI ID
            </button>
          </div>
          <div className="mt-4 text-center text-xs text-ink-soft">
            <p>Payee: {paymentSettings.payeeName}</p>
            {paymentSettings.merchantName && <p>Merchant: {paymentSettings.merchantName}</p>}
          </div>
        </div>
      )}

      {!paymentSettings?.upiEnabled && !loading && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
          <p className="text-sm font-bold text-amber-800">UPI payment is not configured yet.</p>
          <p className="mt-1 text-xs text-amber-700">Please contact support or try again later.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-navy-100 bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy-900">Upload Payment Proof</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">UTR / Transaction Number *</label>
            <input type="text" required value={form.utrNumber} onChange={(e) => setForm({ ...form, utrNumber: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-soft/60 focus:border-saffron-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Payment Date *</label>
            <input type="date" required value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Payment Time *</label>
            <input type="time" required value={form.paymentTime} onChange={(e) => setForm({ ...form, paymentTime: e.target.value })} className="w-full rounded-lg border-2 border-navy-100 bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-saffron-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[13px] font-extrabold text-navy-900">Payment Screenshot *</label>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-paper p-6 transition-colors hover:border-saffron-400 hover:bg-saffron-50">
                <Icon name="download" size={24} className="text-navy-400" />
                <span className="text-sm font-bold text-navy-800">
                  {compressing ? "Compressing..." : screenshotPreview ? "Click to change image" : "Click to upload payment screenshot"}
                </span>
                <span className="text-[11px] text-ink-soft">JPG, PNG, WEBP — Max 2MB</span>
                <input type="file" accept="image/*" required={!screenshotPreview} onChange={handleScreenshotChange} className="hidden" />
              </label>

              {fileError && <p className="text-sm font-bold text-rose-600">{fileError}</p>}

              {screenshotPreview && (
                <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-surface p-3">
                  <img src={screenshotPreview} alt="Payment screenshot preview" className="size-16 rounded-lg border border-navy-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-navy-900">Screenshot uploaded</p>
                    <p className="text-[11px] text-ink-soft">Image compressed and ready to submit</p>
                  </div>
                  <button type="button" onClick={() => { setScreenshotPreview(null); setForm({ ...form, screenshot: "" }); }} className="rounded-lg border border-navy-200 p-2 text-navy-600 transition-colors hover:bg-navy-50 cursor-pointer">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-rose-600">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="rounded-xl bg-saffron-500 px-6 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 disabled:opacity-60 cursor-pointer">
            {submitting ? "Submitting..." : "Submit Payment Proof"}
          </button>
        </div>
      </form>

      {paymentSettings?.whatsappNumber && (
        <div className="rounded-xl border border-leaf-300 bg-leaf-50 p-6 text-center">
          <h3 className="font-display text-lg font-bold text-leaf-900">Need Faster Verification?</h3>
          <p className="mt-2 text-sm text-leaf-800">Share your payment screenshot and Request ID ({ad.requestId}) with our WhatsApp support.</p>
          <a href={`https://wa.me/${paymentSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi, I have made payment for advertisement request ${ad.requestId}. UTR: `} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 cursor-pointer">
            <Icon name="message" size={16} /> Share on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
