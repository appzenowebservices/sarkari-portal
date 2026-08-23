import { getAdTypesCollection, getPlacementsCollection, getDurationPlansCollection } from "@/db";

async function seed() {
  try {
    const adTypesCol = await getAdTypesCollection();
    const placementsCol = await getPlacementsCollection();
    const durationPlansCol = await getDurationPlansCollection();
    const now = new Date();

    const adTypes = [
      { code: "LINK", nameHi: "लिंक विज्ञापन", nameEn: "Link Advertisement", descriptionHi: "टेक्स्ट लिंक + छोटा विवरण", descriptionEn: "Text link + short description", basePrice: 100, billingUnit: "day", isActive: true, sortOrder: 1 },
      { code: "IMAGE", nameHi: "छवि विज्ञापन", nameEn: "Image Advertisement", descriptionHi: "फुल-विड्थ क्लिकेबल इमेज", descriptionEn: "Full-width clickable image", basePrice: 200, billingUnit: "day", isActive: true, sortOrder: 2 },
      { code: "BANNER", nameHi: "बैनर विज्ञापन", nameEn: "Banner Advertisement", descriptionHi: "शीर्षक + टेक्स्ट + CTA", descriptionEn: "Title + text + CTA", basePrice: 300, billingUnit: "day", isActive: true, sortOrder: 3 },
      { code: "INLINE", nameHi: "इनलाइन विज्ञापन", nameEn: "Inline Advertisement", descriptionHi: "छोटा टेक्स्ट विज्ञापन", descriptionEn: "Small text advertisement", basePrice: 150, billingUnit: "day", isActive: true, sortOrder: 4 },
      { code: "SPONSORED", nameHi: "स्पंसर कार्ड", nameEn: "Sponsored Card", descriptionHi: "सेवा-शैली प्रचार कार्ड", descriptionEn: "Service-style promotional card", basePrice: 250, billingUnit: "day", isActive: true, sortOrder: 5 },
    ];

    const placements = [
      { code: "HOME_HERO_BELOW", nameHi: "होम हीरो नीचे", nameEn: "Hero Below Home", multiplier: 2.0, priority: 1, isActive: true },
      { code: "HOME_CATEGORY_BETWEEN", nameHi: "होम श्रेणी के बीच", nameEn: "Categories Between Home", multiplier: 1.5, priority: 2, isActive: true },
      { code: "POPULAR_SERVICES_ABOVE", nameHi: "लोकप्रिय सेवाएं ऊपर", nameEn: "Popular Services Above", multiplier: 1.75, priority: 3, isActive: true },
      { code: "FOOTER_ABOVE", nameHi: "फुटर ऊपर", nameEn: "Footer Above", multiplier: 1.0, priority: 4, isActive: true },
      { code: "CATEGORY_TOP", nameHi: "श्रेणी पेज टॉप", nameEn: "Category Page Top", multiplier: 1.5, priority: 5, isActive: true },
      { code: "CATEGORY_BOTTOM", nameHi: "श्रेणी पेज बॉटम", nameEn: "Category Page Bottom", multiplier: 0.8, priority: 6, isActive: true },
      { code: "SEARCH_TOP", nameHi: "सर्च पेज टॉप", nameEn: "Search Page Top", multiplier: 1.75, priority: 7, isActive: true },
    ];

    const durationPlans = [
      { days: 1, discountPercent: 0, isActive: true },
      { days: 7, discountPercent: 5, isActive: true },
      { days: 15, discountPercent: 10, isActive: true },
      { days: 30, discountPercent: 15, isActive: true },
      { days: 60, discountPercent: 20, isActive: true },
      { days: 90, discountPercent: 25, isActive: true },
    ];

    for (const adType of adTypes) {
      await adTypesCol.updateOne({ code: adType.code }, { $set: { ...adType, createdAt: now, updatedAt: now } }, { upsert: true });
      console.log("Upserted ad type:", adType.code);
    }

    for (const placement of placements) {
      await placementsCol.updateOne({ code: placement.code }, { $set: { ...placement, createdAt: now, updatedAt: now } }, { upsert: true });
      console.log("Upserted placement:", placement.code);
    }

    for (const durationPlan of durationPlans) {
      await durationPlansCol.updateOne({ days: durationPlan.days }, { $set: { ...durationPlan, createdAt: now, updatedAt: now } }, { upsert: true });
      console.log("Upserted duration plan:", durationPlan.days);
    }

    const counts = await Promise.all([
      adTypesCol.countDocuments({}),
      placementsCol.countDocuments({}),
      durationPlansCol.countDocuments({}),
    ]);
    console.log("Final counts - Ad Types:", counts[0], "Placements:", counts[1], "Duration Plans:", counts[2]);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

void seed();
