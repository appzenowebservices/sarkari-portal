import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import type { Ad } from "@/db/schema";

/**
 * Renders all ad variants inside a placement slot.
 * Hidden if no active ads exist for that placement.
 */
export function AdSlot({ ads }: { ads: Ad[] | undefined }) {
  if (!ads || ads.length === 0) return null;

  return (
    <>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  switch (ad.variant) {
    case "link":
      return <LinkAd ad={ad} />;
    case "image":
      return <ImageAd ad={ad} />;
    case "banner":
      return <BannerAd ad={ad} />;
    case "inline":
      return <InlineAd ad={ad} />;
    case "sponsored":
      return <SponsoredAd ad={ad} />;
    case "popup":
      return <PopupAd ad={ad} />;
    default:
      return <BannerAd ad={ad} />;
  }
}

/* =============== LINK AD =============== */
function LinkAd({ ad }: { ad: Ad }) {
  return (
    <div className="group mx-auto max-w-7xl px-4 py-3 sm:px-6">
      <a
        href={ad.linkUrl || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-3 rounded-xl border border-saffron-200 bg-saffron-50 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-saffron-400 hover:shadow-md"
        data-ad-id={ad.id}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-saffron-500 text-white">
          <Icon name="megaphone" size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-navy-900">
            <Bi hi={ad.titleHi} en={ad.titleEn} />
          </p>
          {(ad.descriptionHi || ad.descriptionEn) && (
            <p className="mt-0.5 truncate text-xs font-semibold text-ink-soft">
              <Bi hi={ad.descriptionHi} en={ad.descriptionEn} />
            </p>
          )}
        </div>
        <span className="rounded-full bg-saffron-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-saffron-700">
          Ad
        </span>
        <Icon name="arrowUpRight" size={16} className="shrink-0 text-saffron-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}

/* =============== IMAGE AD =============== */
function ImageAd({ ad }: { ad: Ad }) {
  const Wrapper = ad.linkUrl ? "a" : "div";
  const linkProps = ad.linkUrl
    ? { href: ad.linkUrl, target: "_blank" as const, rel: "noopener noreferrer sponsored" }
    : {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
      <Wrapper
        {...linkProps}
        className="group relative block overflow-hidden rounded-2xl border border-navy-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        data-ad-id={ad.id}
      >
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.titleEn || ad.titleHi || "Advertisement"}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        )}
        {(ad.titleHi || ad.titleEn) && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-base font-extrabold text-white sm:text-lg">
                  <Bi hi={ad.titleHi} en={ad.titleEn} />
                </p>
                {(ad.descriptionHi || ad.descriptionEn) && (
                  <p className="mt-1 text-sm text-white/80">
                    <Bi hi={ad.descriptionHi} en={ad.descriptionEn} />
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
                Ad
              </span>
            </div>
          </div>
        )}
        {!ad.titleHi && !ad.titleEn && (
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
            Ad
          </span>
        )}
      </Wrapper>
    </div>
  );
}

/* =============== BANNER AD =============== */
function BannerAd({ ad }: { ad: Ad }) {
  const hasImage = !!ad.imageUrl;
  const hasButton = !!(ad.buttonTextHi || ad.buttonTextEn);

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg"
        style={{ backgroundColor: ad.bgColor, color: ad.textColor }}
        data-ad-id={ad.id}
      >
        {/* Decorative grid */}
        <div className="bg-grid-light absolute inset-0 opacity-30" aria-hidden />

        <div className={`relative flex flex-col gap-5 p-5 sm:p-7 ${hasImage ? "md:flex-row md:items-center" : ""}`}>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                विज्ञापन • Ad
              </span>
            </div>
            {(ad.titleHi || ad.titleEn) && (
              <h3 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                <Bi hi={ad.titleHi} en={ad.titleEn} />
              </h3>
            )}
            {(ad.descriptionHi || ad.descriptionEn) && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-85 sm:text-base">
                <Bi hi={ad.descriptionHi} en={ad.descriptionEn} />
              </p>
            )}
            {hasButton && ad.linkUrl && (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              >
                <Bi hi={ad.buttonTextHi} en={ad.buttonTextEn} />
                <Icon name="arrowUpRight" size={15} />
              </a>
            )}
            {!hasButton && ad.linkUrl && (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold underline underline-offset-2 opacity-90 hover:opacity-100"
              >
                <Bi hi="अभी देखें" en="View Now" />
                <Icon name="arrowUpRight" size={14} />
              </a>
            )}
          </div>

          {hasImage && (
            <div className="shrink-0 md:w-48 lg:w-56">
              <img
                src={ad.imageUrl}
                alt={ad.titleEn || ""}
                className="h-auto w-full rounded-xl object-cover shadow-lg"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============== INLINE AD =============== */
function InlineAd({ ad }: { ad: Ad }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
      <a
        href={ad.linkUrl || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex items-center gap-2.5 rounded-lg border border-dashed border-navy-200 bg-surface px-3.5 py-2.5 transition-all duration-200 hover:border-saffron-400 hover:bg-saffron-50"
        data-ad-id={ad.id}
      >
        <span className="rounded bg-saffron-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-saffron-700">
          Ad
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-navy-800">
          <Bi hi={ad.titleHi} en={ad.titleEn} />
        </span>
        {(ad.descriptionHi || ad.descriptionEn) && (
          <span className="hidden truncate text-xs font-semibold text-ink-soft sm:block">
            <Bi hi={ad.descriptionHi} en={ad.descriptionEn} />
          </span>
        )}
        <Icon name="external" size={13} className="shrink-0 text-navy-400 transition-colors group-hover:text-saffron-600" />
      </a>
    </div>
  );
}

/* =============== SPONSORED (card style) =============== */
function SponsoredAd({ ad }: { ad: Ad }) {
  return (
    <a
      href={ad.linkUrl || "#"}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative flex h-full flex-col rounded-xl border-2 border-saffron-200 bg-saffron-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-saffron-400 hover:shadow-lg"
      data-ad-id={ad.id}
    >
      <div className="flex items-start justify-between gap-2">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt="" className="size-11 shrink-0 rounded-xl object-cover" loading="lazy" />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-saffron-500 text-white">
            <Icon name="star" size={21} />
          </span>
        )}
        <span className="rounded-md bg-saffron-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
          Sponsored
        </span>
      </div>
      <h3 className="mt-3 text-[15px] font-extrabold leading-snug text-navy-900 transition-colors group-hover:text-saffron-800">
        <Bi hi={ad.titleHi} en={ad.titleEn} />
      </h3>
      {(ad.descriptionHi || ad.descriptionEn) && (
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          <Bi hi={ad.descriptionHi} en={ad.descriptionEn} />
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        {(ad.buttonTextHi || ad.buttonTextEn) && (
          <span className="text-[13px] font-extrabold text-saffron-700">
            <Bi hi={ad.buttonTextHi} en={ad.buttonTextEn} />
          </span>
        )}
        <Icon
          name="arrowUpRight"
          size={15}
          strokeWidth={2.4}
          className="ml-auto text-saffron-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-saffron-700"
        />
      </div>
    </a>
  );
}

/* =============== POPUP AD (client component will be separate) =============== */
function PopupAd({ ad }: { ad: Ad }) {
  // Popup ads use a client wrapper imported separately
  return (
    <div className="hidden" data-ad-id={ad.id} data-popup-ad={JSON.stringify(ad)} />
  );
}

/** Wrapper that adds proper spacing as a section divider */
export function AdSection({
  ads,
  className,
}: {
  ads: Ad[] | undefined;
  className?: string;
}) {
  if (!ads || ads.length === 0) return null;
  return (
    <section className={className}>
      <AdSlot ads={ads} />
    </section>
  );
}
