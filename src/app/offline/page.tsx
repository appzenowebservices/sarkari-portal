import Link from "next/link";
import { Icon, LogoMark } from "@/components/icons";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="max-w-sm rounded-2xl border border-navy-100 bg-surface p-8 text-center shadow-lg">
        <LogoMark size={56} />
        <div className="mx-auto mt-5 grid size-12 place-items-center rounded-full bg-saffron-100 text-saffron-700">
          <Icon name="globe" size={22} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-950">
          <span className="lang-hi">आप ऑफलाइन हैं</span>
          <span className="lang-en">You are offline</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <span className="lang-hi">
            इंटरनेट कनेक्शन नहीं मिला। कनेक्शन जांचकर दोबारा कोशिश करें।
          </span>
          <span className="lang-en">
            No internet connection found. Check your connection and try again.
          </span>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
        >
          <Icon name="home" size={16} />
          <span className="lang-hi">होम पेज पर जाएं</span>
          <span className="lang-en">Go to Home</span>
        </Link>
      </div>
    </main>
  );
}
