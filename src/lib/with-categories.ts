import type { ServiceWithCategory } from "@/db/schema";

type MiniCategory = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  color: string;
  icon: string;
};

type MiniService = {
  categoryIds: string[];
};

/**
 * Attach joined category objects to Prisma Service rows, producing the
 * ServiceWithCategory shape that ServiceCard / CategoryLinksTable expect.
 * (tRPC catalog procedures return raw services; the join used to happen in
 * lib/data over the raw driver.)
 */
export function attachCategories<
  S extends MiniService,
  C extends MiniCategory,
>(services: S[], categories: C[]): Array<S & Pick<ServiceWithCategory, "categories">> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return services.map((s) => ({
    ...s,
    categories: (s.categoryIds ?? [])
      .map((id) => byId.get(id))
      .filter((c): c is C => !!c)
      .map((c) => ({
        slug: c.slug,
        titleHi: c.titleHi,
        titleEn: c.titleEn,
        color: c.color,
        icon: c.icon,
      })),
  }));
}
