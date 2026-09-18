import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSection } from "@/components/ad-slot";
import { Bi } from "@/components/bi";
import { CategoryLinksTable } from "@/components/category-links-table";
import { colorOf, Icon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { resilient } from "@/lib/data";
import { attachCategories } from "@/lib/with-categories";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tCats = await resilient(() => api.catalog.categories({ includeInactive: false }), []);
  const category = tCats.find((c) => c.slug === slug);
  return {
    title: category ? `${category.titleEn} — ${category.titleHi}` : "Category",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [tCats, tSvc, topAds, bottomAds] = await Promise.all([
    resilient(() => api.catalog.categories({ includeInactive: false }), []),
    resilient(() => api.catalog.servicesByCategory({ slug }), []),
    resilient(() => api.ads.adsForPlacement({ placement: "category_top" }), []),
    resilient(() => api.ads.adsForPlacement({ placement: "category_bottom" }), []),
  ]);
  const categories = tCats;
  const services = attachCategories(tSvc, tCats);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const color = colorOf(category.color);

  return (
    <main>
      {/* Banner */}
      <section className={`relative overflow-hidden border-b ${color.border} ${color.soft}`}>
        <div className="bg-grid-ink absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <nav className="mb-5 flex items-center gap-2 text-[13px] font-bold text-ink-soft">
            <Link href="/" className="transition-colors hover:text-navy-800">
              <Bi hi="होम" en="Home" />
            </Link>
            <Icon name="chevronLeft" size={13} className="rotate-180" />
            <span className="text-navy-900">
              <Bi hi={category.titleHi} en={category.titleEn} />
            </span>
          </nav>
          <div className="flex flex-wrap items-center gap-5">
            <span
              className={`grid size-16 place-items-center rounded-2xl ${color.solid} text-white shadow-lg sm:size-20`}
            >
              <Icon name={category.icon} size={38} strokeWidth={1.6} />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-5xl">
                <Bi hi={category.titleHi} en={category.titleEn} />
              </h1>
              <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                <Bi hi={category.descriptionHi} en={category.descriptionEn} />
              </p>
            </div>
            <span className="ml-auto hidden rounded-full bg-surface px-4 py-2 text-sm font-extrabold text-navy-800 shadow-sm ring-1 ring-navy-100 sm:block tnum">
              {services.length} <Bi hi="आधिकारिक लिंक" en="official links" />
            </span>
          </div>
        </div>
      </section>

      {/* AD SLOT: category_top */}
      <AdSection ads={topAds} className="pt-4" />

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {services.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-navy-300 bg-surface p-10 text-center">
              <Icon name="inbox" size={40} className="mx-auto text-navy-300" />
              <h2 className="mt-4 text-lg font-extrabold text-navy-900">
                <Bi hi="जल्द ही नई सेवाएं जुड़ेंगी" en="New services coming soon" />
              </h2>
              <p className="mt-1.5 text-sm text-ink-soft">
                <Bi
                  hi="इस श्रेणी में अभी कोई लिंक नहीं है। कृपया बाद में देखें।"
                  en="No links in this category yet. Please check back later."
                />
              </p>
            </div>
          </Reveal>
        ) : (
          <CategoryLinksTable services={services} />
        )}
      </section>

      {/* AD SLOT: category_bottom */}
      <AdSection ads={bottomAds} className="pb-4" />

      {/* Other categories */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <Reveal>
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-ink-soft">
            <Bi hi="अन्य श्रेणियाँ देखें" en="Browse other categories" />
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.slug !== category.slug)
              .map((c) => {
                const cc = colorOf(c.color);
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-2 rounded-full border border-navy-200 bg-surface px-3.5 py-2 text-[13px] font-bold text-navy-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className={cc.text}>
                      <Icon name={c.icon} size={14} />
                    </span>
                    <Bi hi={c.titleHi} en={c.titleEn} />
                    <span className="text-ink-soft tnum">{c.serviceCount}</span>
                  </Link>
                );
              })}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
