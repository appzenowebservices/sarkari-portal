"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registers the service worker once. */
export function PWABootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const register = async () => {
      try {
        // Only register if /sw.js exists to avoid 404 noise
        const res = await fetch("/sw.js", { method: "HEAD" });
        if (!res.ok) return;
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        /* offline support is progressive — ignore failures */
      }
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}

/** Install button that appears when the browser fires beforeinstallprompt. */
export function InstallButton({
  children,
  className,
  variant = "solid",
}: {
  children?: ReactNode;
  className?: string;
  variant?: "solid" | "light";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  if (installed) return null;
  if (!deferred) return null;

  const styles =
    variant === "solid"
      ? "bg-saffron-500 text-navy-950 hover:bg-saffron-400 shadow-sm shadow-saffron-500/40"
      : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20";

  return (
    <button
      type="button"
      onClick={install}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${styles} ${className ?? ""}`}
    >
      <Icon name="download" size={16} strokeWidth={2.2} />
      {children ?? (
        <>
          <span className="lang-hi">ऐप इंस्टॉल करें</span>
          <span className="lang-en">Install App</span>
        </>
      )}
    </button>
  );
}
