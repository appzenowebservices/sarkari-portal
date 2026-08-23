import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { Header } from "@/components/header";
import { Ticker } from "@/components/ticker";
import { getCategories, getPopular, getSettings } from "@/lib/data";
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
    [categories, settings, popular] = await Promise.all([
      getCategories({ alphabetical: true }),
      getSettings(),
      getPopular(10),
    ]);
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
