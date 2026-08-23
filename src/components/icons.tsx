import type { ReactNode, SVGProps } from "react";

const PATHS: Record<string, ReactNode> = {
  sparkles: (
    <>
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </>
  ),
  vote: (
    <>
      <path d="M5 9.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
      <path d="M9 13l2 2 4-4" />
      <path d="M3.5 7h17l-1.6-3.1A2 2 0 0 0 17.1 3H6.9a2 2 0 0 0-1.8 1L3.5 7z" />
    </>
  ),
  landmark: (
    <>
      <path d="M3 21h18" />
      <path d="M4.5 18h15" />
      <path d="M6.5 18v-7M10.2 18v-7M13.8 18v-7M17.5 18v-7" />
      <path d="M12 2 3 8h18L12 2z" />
    </>
  ),
  zap: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
  smartphone: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2.5" />
      <path d="M12 18h.01" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </>
  ),
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8.5c-.6 0-1.1.2-1.5.6L4.6 10c-.9.2-1.6 1-1.6 1.9v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </>
  ),
  wallet: (
    <>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  external: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  folder: (
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  settings: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  pencil: (
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M8 17v-6M13 17V7M18 17v-3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  alert: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  star: (
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  trendingUp: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  click: (
    <>
      <path d="m9 9 5 12 1.8-5.2L21 14 9 9z" />
      <path d="M7.2 2.2 8 5.1M5.1 8 2.2 7.2M14 4.1 12 6M6 12l-1.9 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m11 12 9.5-9.5M16 7l3 3" />
    </>
  ),
  facebook: (
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  ),
  twitter: (
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  ),
  instagram: (
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
  ),
  youtube: (
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
  ),
  linkedin: (
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  ),
  telegram: (
    <path d="M21 5 2 13l6.5 2.5L8 21l2.5-7.5L21 5z" />
  ),
  whatsapp: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  ),
};

export type IconName = keyof typeof PATHS;

export const ICON_OPTIONS = [
  "sparkles",
  "vote",
  "landmark",
  "zap",
  "smartphone",
  "fileText",
  "gift",
  "car",
  "wallet",
  "users",
  "shield",
  "star",
  "home",
  "folder",
  "globe",
  "download",
  "dashboard",
  "link",
  "settings",
  "eye",
  "chart",
  "clock",
  "phone",
  "mail",
  "alert",
  "trendingUp",
  "megaphone",
  "inbox",
  "key",
  "info",
  "dots",
  "facebook",
  "twitter",
  "instagram",
  "youtube",
  "linkedin",
  "telegram",
  "whatsapp",
] as const;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  ...rest
}: { name: string; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name] ?? PATHS.dots}
    </svg>
  );
}

/** 24-spoke chakra-inspired brand mark */
export function LogoMark({ size = 40 }: { size?: number }) {
  const spokes = [0, 30, 60, 90, 120, 150];
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="var(--color-navy-800)" />
      <circle cx="24" cy="22" r="11" fill="none" stroke="var(--color-saffron-500)" strokeWidth="2.4" />
      <g stroke="var(--color-saffron-500)" strokeWidth="1.4">
        {spokes.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const dx = 11 * Math.cos(rad);
          const dy = 11 * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={24 - dx}
              y1={22 - dy}
              x2={24 + dx}
              y2={22 + dy}
            />
          );
        })}
      </g>
      <circle cx="24" cy="22" r="2.2" fill="var(--color-saffron-500)" />
      <path
        d="M14 38h20"
        stroke="var(--color-leaf-400)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tailwind class maps for per-category accent colors (literal classes for JIT) */
export const CATEGORY_COLORS: Record<
  string,
  { soft: string; text: string; border: string; hoverBorder: string; solid: string; chip: string }
> = {
  saffron: {
    soft: "bg-saffron-100",
    text: "text-saffron-700",
    border: "border-saffron-300",
    hoverBorder: "hover:border-saffron-300",
    solid: "bg-saffron-500",
    chip: "bg-saffron-100 text-saffron-800",
  },
  green: {
    soft: "bg-leaf-100",
    text: "text-leaf-700",
    border: "border-leaf-300",
    hoverBorder: "hover:border-leaf-300",
    solid: "bg-leaf-500",
    chip: "bg-leaf-100 text-leaf-800",
  },
  navy: {
    soft: "bg-navy-100",
    text: "text-navy-700",
    border: "border-navy-300",
    hoverBorder: "hover:border-navy-300",
    solid: "bg-navy-600",
    chip: "bg-navy-100 text-navy-800",
  },
  sky: {
    soft: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-300",
    hoverBorder: "hover:border-sky-300",
    solid: "bg-sky-500",
    chip: "bg-sky-100 text-sky-800",
  },
  rose: {
    soft: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-300",
    hoverBorder: "hover:border-rose-300",
    solid: "bg-rose-500",
    chip: "bg-rose-100 text-rose-800",
  },
  teal: {
    soft: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-300",
    hoverBorder: "hover:border-teal-300",
    solid: "bg-teal-500",
    chip: "bg-teal-100 text-teal-800",
  },
  amber: {
    soft: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    hoverBorder: "hover:border-amber-300",
    solid: "bg-amber-500",
    chip: "bg-amber-100 text-amber-800",
  },
  slate: {
    soft: "bg-slate-200",
    text: "text-slate-700",
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-300",
    solid: "bg-slate-500",
    chip: "bg-slate-200 text-slate-800",
  },
};

export function colorOf(key: string) {
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.navy;
}
