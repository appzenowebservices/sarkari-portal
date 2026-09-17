export const NEWSLETTER_SETTINGS_DEFAULTS: Record<string, string> = {
  senderName: "APPZENO Sarkari Portal",
  senderEmail: "newsletter@addiessarkari.in",
  websiteUrl: "https://addiessarkari.in",
  about: "APPZENO Sarkari Portal भारत की सरकारी सेवाओं की एक निःशुल्क निर्देशिका है।",
  facebook: "https://facebook.com/addiessarkari",
  youtube: "https://youtube.com/@addiessarkari",
  telegram: "https://t.me/addiessarkari",
  whatsapp: "https://chat.whatsapp.com/addiessarkari",
  instagram: "https://instagram.com/addiessarkari",
  linkedin: "https://linkedin.com/company/addiessarkari",
  twitter: "https://twitter.com/addiessarkari",
};

export function getNewsletterSettings(): Record<string, string> {
  const settingsKey = process.env.NEWSLETTER_SETTINGS || "";
  if (settingsKey) {
    try {
      return { ...NEWSLETTER_SETTINGS_DEFAULTS, ...JSON.parse(settingsKey) };
    } catch {
      return NEWSLETTER_SETTINGS_DEFAULTS;
    }
  }
  return NEWSLETTER_SETTINGS_DEFAULTS;
}
