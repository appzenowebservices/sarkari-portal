import type { Metadata } from "next";
import Link from "next/link";
import { AdSection } from "@/components/ad-slot";
import { Bi } from "@/components/bi";
import { SearchBox } from "@/components/header";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { ServiceCard } from "@/components/service-card";
import { getAdsForPlacement, getCategories, getPopular, searchServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `खोज: ${q}` : "Search Services" };
}

const POPULAR_TERMS = [
  "आधार",
  "पैन",
  "वोटर",
  "किसान",
  "बिजली",
  "लाइसेंस",
  "आयुष्मान",
  "राशन",
  "PF",
  "FASTag",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [results, categories, popular, searchAds] = await Promise.all([
    query ? searchServices(query, 40) : Promise.resolve([]),
    getCategories({ alphabetical: true }),
    getPopular(8),
    getAdsForPlacement("search_top"),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          <Bi hi="सेवा खोजें" en="Search Services" />
        </h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          <Bi
            hi="आधार, पैन, योजना, बिल — कुछ भी लिखकर खोजें"
            en="Search anything — Aadhaar, PAN, schemes, bills"
          />
        </p>
        <div className="mt-6">
          <SearchBox autoFocus />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {POPULAR_TERMS.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className={`rounded-full border px-3 py-1 text-[13px] font-bold transition-all hover:-translate-y-0.5 hover:border-saffron-400 hover:bg-saffron-50 hover:text-saffron-800 ${
                query === t
                  ? "border-saffron-500 bg-saffron-100 text-saffron-800"
                  : "border-navy-200 bg-surface text-navy-700"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <AdSection ads={searchAds} className="mt-6" />

      <div className="mt-12">
        {query ? (
          <>
            <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-navy-950">
                <span className="tnum">{results.length}</span>{" "}
                <Bi hi={`"${query}" के लिए परिणाम`} en={`results for "${query}"`} />
              </h2>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-leaf-700">
                <Icon name="shield" size={14} />
                <Bi hi="केवल आधिकारिक सरकारी लिंक" en="Only official government links" />
              </p>
            </Reveal>

            {results.length === 0 ? (
              <Reveal>
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-navy-300 bg-surface p-10 text-center">
                  <Icon name="search" size={40} className="mx-auto text-navy-300" />
                  <h3 className="mt-4 text-lg font-extrabold text-navy-900">
                    <Bi hi="कोई परिणाम नहीं मिला" en="No results found" />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    <Bi
                      hi="कुछ और शब्द आज़माएं — जैसे 'आधार', 'लाइसेंस', 'योजना'।"
                      en="Try different words — e.g. 'Aadhaar', 'license', 'scheme'."
                    />
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((s, i) => (
                  <Reveal key={s.id} delay={(i % 4) * 50}>
                    <ServiceCard service={s} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <Reveal className="mb-6">
              <h2 className="text-lg font-extrabold text-navy-950">
                <Bi hi="श्रेणी से ब्राउज़ करें" en="Browse by category" />
              </h2>
            </Reveal>
            <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-5">
              {categories.map((c, i) => (
                <Reveal key={c.id} delay={(i % 5) * 60}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="group flex flex-col items-start gap-2.5 rounded-xl border border-navy-100 bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className={`text-navy-600 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon name={c.icon} size={22} />
                    </span>
                    <span className="text-sm font-extrabold leading-snug text-navy-950">
                      <Bi hi={c.titleHi} en={c.titleEn} />
                    </span>
                    <span className="text-xs font-bold text-ink-soft tnum">
                      {c.serviceCount} <Bi hi="लिंक" en="links" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Reveal className="mb-6">
              <h2 className="text-lg font-extrabold text-navy-950">
                <Bi hi="लोकप्रिय सेवाएं" en="Popular services" />
              </h2>
            </Reveal>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
