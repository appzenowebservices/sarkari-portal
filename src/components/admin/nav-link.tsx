"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

export function AdminNavLink({
  href,
  icon,
  label,
  exact,
  mobile,
  collapsed,
}: {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
  mobile?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href + "/") || pathname === href;

  if (mobile) {
    return (
      <Link
        href={href}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-extrabold transition-colors ${
          active ? "bg-navy-900 text-white" : "text-ink-soft hover:bg-navy-50 hover:text-navy-900"
        }`}
      >
        <Icon name={icon} size={14} />
        {label}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <Link
        href={href}
        className={`group flex items-center justify-center rounded-xl px-2 py-2.5 text-sm font-bold transition-all duration-200 ${
          active
            ? "bg-saffron-500 text-navy-950 shadow-lg shadow-saffron-500/20"
            : "text-white/65 hover:bg-white/10 hover:text-white"
        }`}
        title={label}
      >
        <Icon name={icon} size={18} />
        {active && <span className="ml-auto size-1.5 rounded-full bg-navy-950/60" />}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? "bg-saffron-500 text-navy-950 shadow-lg shadow-saffron-500/20"
          : "text-white/65 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon name={icon} size={18} />
      {label}
      {active && <span className="ml-auto size-1.5 rounded-full bg-navy-950/60" />}
    </Link>
  );
}
