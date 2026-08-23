import { Bi } from "@/components/bi";
import { colorOf, Icon } from "@/components/icons";
import { TrackLink } from "@/components/track-link";
import type { ServiceWithCategory } from "@/lib/data";

export function ServiceCard({
  service,
  showCategory = true,
}: {
  service: ServiceWithCategory;
  showCategory?: boolean;
}) {
  const cat = service.categories[0];
  const color = cat ? colorOf(cat.color) : colorOf("navy");

  return (
    <TrackLink
      serviceId={service.id}
      href={service.url}
      className="group relative flex h-full flex-col rounded-xl border border-navy-100 bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-lg hover:shadow-navy-900/8"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${color.soft} ${color.text} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
        >
          <Icon name={cat ? cat.icon : "link"} size={21} />
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {service.isNew && (
            <span className="rounded-md bg-leaf-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              New
            </span>
          )}
          {service.isFeatured && (
            <span className="grid size-5 place-items-center rounded-md bg-saffron-100 text-saffron-700" title="Featured">
              <Icon name="star" size={11} strokeWidth={2.4} />
            </span>
          )}
        </span>
      </div>

      <h3 className="mt-3 text-[15px] font-extrabold leading-snug text-ink transition-colors group-hover:text-navy-700">
        <Bi hi={service.titleHi} en={service.titleEn} />
      </h3>
      {(service.descriptionHi || service.descriptionEn) && (
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          <Bi hi={service.descriptionHi} en={service.descriptionEn} />
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        {showCategory ? (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color.chip}`}>
            <Bi hi={cat ? cat.titleHi : ""} en={cat ? cat.titleEn : ""} />
          </span>
        ) : (
          <span className="truncate text-[11px] font-semibold text-ink-soft/80 tnum">
            {(() => { try { return new URL(service.url).hostname.replace(/^www\./, ""); } catch { return service.url; } })()}
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] font-bold text-ink-soft transition-colors group-hover:text-saffron-700">
          <span className="tnum">{service.clickCount.toLocaleString("en-IN")}</span>
          <Icon name="click" size={12} />
          <Icon
            name="arrowUpRight"
            size={13}
            strokeWidth={2.4}
            className="-ml-0.5 text-navy-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-saffron-600"
          />
        </span>
      </div>
    </TrackLink>
  );
}
