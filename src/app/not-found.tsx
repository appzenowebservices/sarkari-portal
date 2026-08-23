import Link from "next/link";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Ticker } from "@/components/ticker";
import { BackToTop } from "@/components/back-to-top";
import { getCategories, getPopular, getSettings } from "@/lib/data";
import type { CategoryWithCount, ServiceWithCategory } from "@/lib/data";

const EMPTY_CATEGORIES: CategoryWithCount[] = [];
const EMPTY_POPULAR: ServiceWithCategory[] = [];
const EMPTY_SETTINGS: Record<string, string> = {
  ticker: "",
  helpline: "",
  email: "",
  about: "",
  footerNote: "",
};

export const metadata = {
  title: "Page Not Found | APPZENO Sarkari Portal",
  description:
    "The page you're looking for doesn't exist or has been moved. Return to APPZENO Sarkari Portal for all government services.",
};

export const dynamic = "force-dynamic";

export default async function NotFound() {
  let categories: CategoryWithCount[] = EMPTY_CATEGORIES;
  let settings: Record<string, string> = EMPTY_SETTINGS;
  let popular: ServiceWithCategory[] = EMPTY_POPULAR;

  try {
    [categories, settings, popular] = await Promise.all([
      getCategories({ alphabetical: true }),
      getSettings(),
      getPopular(10),
    ]);
  } catch {
    // MongoDB unavailable — render with empty data
  }

  return (
    <>
      <Header categories={categories} helpline={settings.helpline} />
      <Ticker text={settings.ticker} />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-8">
            <div className="tricolor-strip absolute -top-6 left-1/2 -translate-x-1/2 h-3 w-32 rounded-full opacity-60" />
            <span
              className="grid size-24 sm:size-28 place-items-center rounded-full bg-navy-50 text-navy-300"
              aria-hidden
            >
              <Icon name="alert" size={56} strokeWidth={1.4} />
            </span>
            <div className="absolute -bottom-1 right-2 text-6xl font-display font-extrabold text-navy-900 opacity-10 select-none">
              404
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">
            <Bi hi="आ पृष्ठ नहीं मिला" en="Page Not Found" />
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
            <Bi
              hi="आपकी खोज करने वाला पृष्ठ मौजूद नहीं है या सेव कर दिया गया है।"
              en="The page you are looking for doesn't exist or may have been moved."
            />
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 px-6 py-3 font-display text-sm font-bold text-white transition-all duration-200 hover:bg-navy-700 active:scale-95"
            >
              <Icon name="home" size={16} />
              <Bi hi="होम पर वापस जाएं" en="Back to Home" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-surface px-6 py-3 font-display text-sm font-bold text-navy-800 transition-all duration-200 hover:bg-navy-50 active:scale-95"
            >
              <Icon name="search" size={16} />
              <Bi hi="खोजें" en="Search Services" />
            </Link>
          </div>

          {categories.length > 0 && (
            <div className="mt-12 w-full max-w-3xl">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink-soft mb-4">
                <Bi hi="लोकप्रिय श्रेणियाँ" en="Popular Categories" />
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.slice(0, 12).map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-1.5 rounded-full border border-navy-200 bg-surface px-3.5 py-2 text-[13px] font-bold text-navy-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Icon name={c.icon} size={14} />
                    <Bi hi={c.titleHi} en={c.titleEn} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} categories={categories} popular={popular} />
      <BackToTop />
    </>
  );
}
