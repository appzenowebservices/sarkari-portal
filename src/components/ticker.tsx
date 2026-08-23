import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";

export function Ticker({ text }: { text: string }) {
  const segments = text
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return null;

  const row = (key: string, hidden = false) => (
    <div
      key={key}
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {segments.map((seg, i) => (
        <span
          key={`${key}-${i}`}
          className="flex items-center gap-2 whitespace-nowrap px-6 text-[13px] font-bold text-navy-900"
        >
          <span className="inline-block size-1.5 rounded-full bg-saffron-600" />
          {seg}
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker-mask flex items-stretch border-b border-saffron-200 bg-saffron-50">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-saffron-500 px-3 py-2 sm:px-4">
        <Icon name="megaphone" size={16} strokeWidth={2} className="text-navy-950" />
        <span className="hidden font-display text-sm font-bold uppercase tracking-wider text-navy-950 sm:inline">
          <Bi hi="सूचना" en="Notice" />
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max items-center py-2">
          {row("a")}
          {row("b", true)}
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-1.5 px-4 text-xs font-bold text-leaf-700 sm:flex">
        <span className="animate-pulse-dot inline-block size-2 rounded-full bg-leaf-500" />
        LIVE
      </div>
    </div>
  );
}
