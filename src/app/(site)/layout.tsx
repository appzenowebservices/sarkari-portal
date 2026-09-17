import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { Header } from "@/components/header";
import { Ticker } from "@/components/ticker";
import { getCategories, getPopular, getSettings } from "@/lib/data";
import { api } from "@/trpc/server";
import type { CategoryWithCount } from "@/db/schema";
import type { ServiceWithCategory } from "@/db/schema";

const EMPTY_CATEGORIES: CategoryWithCount[] = [];
const EMPTY_POPULAR: ServiceWithCategory[] = [];
const EMPTY_SETTINGS = {
  ticker: "",
  helpline: "",
  email: "",
  about: "",
  footerNote: "",
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let categories: CategoryWithCount[] = EMPTY_CATEGORIES;
  let settings: Record<string, string> = EMPTY_SETTINGS;
  let popular: ServiceWithCategory[] = EMPTY_POPULAR;

  try {
    // Primary: T3 tRPC server caller (Prisma). Fallback: legacy lib/data (raw Mongo driver).
    try {
      const [cats, sets, pop] = await Promise.all([
        api.catalog.categories({ includeInactive: false }),
        api.system.settings(),
        api.catalog.popularServices({ limit: 10 }),
      ]);
      categories = cats as unknown as CategoryWithCount[];
      const map: Record<string, string> = { ...EMPTY_SETTINGS };
      for (const s of sets) map[s.key] = s.value;
      settings = map;
      popular = pop as unknown as ServiceWithCategory[];
    } catch {
      [categories, settings, popular] = await Promise.all([
        getCategories({ alphabetical: true }),
        getSettings(),
        getPopular(10),
      ]);
    }
  } catch {
    // MongoDB unavailable during build or runtime — render with empty data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} helpline={settings.helpline} />
      <Ticker text={settings.ticker} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} categories={categories} popular={popular} />
      <BackToTop />
    </div>
  );
}
