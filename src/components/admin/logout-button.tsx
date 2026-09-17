"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Icon } from "@/components/icons";

export function LogoutButton({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setBusy(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className="grid size-9 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-rose-500 cursor-pointer disabled:opacity-60"
        aria-label="Logout"
        title="लॉगआउट"
      >
        <Icon name="logout" size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={`flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-rose-500 cursor-pointer disabled:opacity-60 ${className ?? ""}`}
    >
      <Icon name="logout" size={15} />
      {busy ? "…" : "लॉगआउट"}
    </button>
  );
}
