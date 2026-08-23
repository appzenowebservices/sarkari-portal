"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminNavLink } from "@/components/admin/nav-link";
import { Icon, LogoMark } from "@/components/icons";

const STORAGE_KEY = "admin-sidebar-collapsed";

function loadCollapsed() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function SidebarClient({
  admin,
  nav,
  children,
}: {
  admin: { name: string; username: string };
  nav: { href: string; icon: string; label: string; exact?: boolean }[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const toggle = () => setCollapsed((v) => !v);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar (desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-navy-950 text-white transition-all duration-300 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="tricolor-strip h-[3px] w-full shrink-0" aria-hidden />
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-5 py-5 transition-all duration-300 ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <LogoMark size={collapsed ? 32 : 40} />
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-lg font-bold">
                APPZENO <span className="text-saffron-400">Sarkari</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                Superadmin Console
              </p>
            </div>
          )}
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {nav.map((item) => (
            <AdminNavLink
              key={item.href}
              {...item}
              collapsed={collapsed}
            />
          ))}
          <div className="!my-4 border-t border-white/10" />
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white/65 transition-colors hover:bg-white/10 hover:text-white ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <Icon name="home" size={18} />
            {!collapsed && <span>साइट देखें</span>}
            {!collapsed && <Icon name="external" size={13} className="ml-auto opacity-60" />}
          </Link>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-saffron-500 font-display text-base font-bold text-navy-950">
                {admin.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-extrabold">{admin.name}</p>
                <p className="truncate text-[11px] font-semibold text-white/50">@{admin.username}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <span className="grid size-10 place-items-center rounded-full bg-saffron-500 font-display text-base font-bold text-navy-950">
                {admin.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            className={`mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-white/60 transition-all hover:bg-white/10 hover:text-white cursor-pointer ${
              collapsed ? "px-2" : "w-full px-3"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={16} />
            {!collapsed && <span>संकुचित करें</span>}
          </button>
          <LogoutButton className={`mt-2 ${collapsed ? "w-auto px-2" : "w-full"}`} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 lg:hidden">
        <div className="tricolor-strip h-[3px] w-full" aria-hidden />
        <div className="flex items-center justify-between bg-navy-950 px-4 py-3 text-white">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-display text-base font-bold">
              APPZENO <span className="text-saffron-400">Sarkari</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15" aria-label="View site">
              <Icon name="home" size={16} />
            </Link>
            <LogoutButton iconOnly />
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-navy-100 bg-surface px-3 py-2">
          {nav.map((item) => (
            <AdminNavLink key={item.href} {...item} mobile />
          ))}
        </nav>
      </div>

      <main className={`min-w-0 flex-1 pt-[104px] transition-all duration-300 lg:pt-0 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
