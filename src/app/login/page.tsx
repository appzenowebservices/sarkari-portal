"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Icon, LogoMark } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });
      if (result?.ok && !result.error) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("गलत यूज़रनेम या पासवर्ड");
      }
    } catch {
      setError("नेटवर्क त्रुटि — दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-navy-950 text-white lg:block">
        <div className="bg-grid-light absolute inset-0" aria-hidden />
        <svg
          viewBox="0 0 100 100"
          className="animate-spin-slower absolute -bottom-32 -left-32 text-saffron-500/15"
          width={520}
          height={520}
          aria-hidden
        >
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
          <g stroke="currentColor" strokeWidth="1">
            {Array.from({ length: 12 }, (_, i) => i * 15).map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const dx = 44 * Math.cos(rad);
              const dy = 44 * Math.sin(rad);
              return <line key={deg} x1={50 - dx} y1={50 - dy} x2={50 + dx} y2={50 + dy} />;
            })}
          </g>
          <circle cx="50" cy="50" r="7" fill="currentColor" />
        </svg>

        <div className="relative flex h-full flex-col p-12">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark size={46} />
            <div className="leading-tight">
              <p className="font-display text-2xl font-bold">
                APPZENO <span className="text-saffron-400">Sarkari</span> Portal
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                Superadmin Console
              </p>
            </div>
          </Link>

          <div className="my-auto max-w-md">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
              पूरे पोर्टल का नियंत्रण,
              <br />
              <span className="text-saffron-400">एक ही डैशबोर्ड में।</span>
            </h1>
            <ul className="mt-8 space-y-4 text-[15px] text-white/75">
              {[
                { icon: "folder", text: "श्रेणियाँ बनाएं, सजाएं, रंग-आइकॉन बदलें" },
                { icon: "link", text: "50+ सरकारी सेवा लिंक प्रबंधित करें" },
                { icon: "chart", text: "लाइव क्लिक एनालिटिक्स और ट्रेंड देखें" },
                { icon: "megaphone", text: "टिकर सूचना और साइट सेटिंग्स बदलें" },
              ].map((f) => (
                <li key={f.icon} className="flex items-center gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-saffron-400 ring-1 ring-white/15">
                    <Icon name={f.icon} size={19} />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} APPZENO Sarkari Portal — केवल अधिकृत सुपरएडमिन के लिए
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <LogoMark size={40} />
            <span className="font-display text-xl font-bold text-navy-900">
              APPZENO <span className="text-saffron-600">Sarkari</span> Portal
            </span>
          </Link>

          <div className="rounded-2xl border border-navy-100 bg-surface p-7 shadow-xl shadow-navy-900/5 sm:p-9">
            <div className="mb-7">
              <span className="inline-grid size-12 place-items-center rounded-xl bg-navy-900 text-saffron-400">
                <Icon name="shield" size={24} />
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-950">
                सुपरएडमिन लॉगिन
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                साइट कंटेंट प्रबंधित करने के लिए साइन इन करें
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-bold text-rose-700">
                <Icon name="alert" size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-1.5 block text-[13px] font-extrabold text-navy-900">
                  यूज़रनेम
                </label>
                <div className="flex items-center rounded-xl border-2 border-navy-200 bg-paper transition-colors focus-within:border-saffron-500">
                  <span className="pl-3.5 text-navy-400">
                    <Icon name="users" size={17} />
                  </span>
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full bg-transparent px-3 py-2.5 text-[15px] font-semibold text-ink outline-none"
                    placeholder="superadmin"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-extrabold text-navy-900">
                  पासवर्ड
                </label>
                <div className="flex items-center rounded-xl border-2 border-navy-200 bg-paper transition-colors focus-within:border-saffron-500">
                  <span className="pl-3.5 text-navy-400">
                    <Icon name="key" size={17} />
                  </span>
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent px-3 py-2.5 text-[15px] font-semibold text-ink outline-none"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="pr-3.5 text-navy-400 transition-colors hover:text-navy-700 cursor-pointer"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <Icon name="eye" size={17} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 font-display text-base font-bold uppercase tracking-wider text-white transition-all hover:bg-navy-800 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    जांच हो रही है…
                  </>
                ) : (
                  <>
                    <Icon name="logout" size={17} className="rotate-180" />
                    साइन इन करें
                  </>
                )}
              </button>
            </form>
          </div>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-bold text-ink-soft transition-colors hover:text-navy-800"
          >
            <Icon name="arrowRight" size={15} className="rotate-180" />
            मुख्य साइट पर वापस जाएं
          </Link>
        </div>
      </div>
    </main>
  );
}
