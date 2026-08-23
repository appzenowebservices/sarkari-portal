import type { NewsletterContentBlock } from "@/db/schema";

export type NewsletterTemplateData = {
  portalUrl: string;
  settings: Record<string, string>;
  campaign: {
    subject: string;
    previewText: string;
    senderName: string;
    senderEmail: string;
    contentBlocks: NewsletterContentBlock[];
  };
};

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

const PORTAL_NAV = [
  { label: "Jobs", url: "/jobs" },
  { label: "Results", url: "/jobs?tab=results" },
  { label: "Admit Cards", url: "/jobs?tab=admit-cards" },
  { label: "Government Schemes", url: "/schemes" },
  { label: "Services", url: "/services" },
];

const LEGAL_LINKS = [
  { label: "About Us", url: "/about" },
  { label: "Contact Us", url: "/contact" },
  { label: "Privacy Policy", url: "/privacy-policy" },
  { label: "Terms & Conditions", url: "/terms-conditions" },
  { label: "Disclaimer", url: "/disclaimer" },
  { label: "Cookie Policy", url: "/cookie-policy" },
];

function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderBlockHtml(block: NewsletterContentBlock, portalUrl: string): string {
  const data = block.data || {};
  const text = String(data.text || data.hi || data.title || "");
  const enText = String(data.en || data.en || "");

  switch (block.type) {
    case "heading":
      return `<h2 style="font-family:'Rajdhani',sans-serif;font-size:${data.size || 22}px;font-weight:700;color:${data.color || "#122546"};margin:22px 0 12px;">${escapeHtml(text)}</h2>`;

    case "paragraph":
      return `<p style="font-size:15px;line-height:1.6;color:#4c5872;margin:10px 0;">${escapeHtml(text)}</p>`;

    case "image":
      return `<div style="text-align:${data.align || "center"};margin:18px 0;"><img src="${escapeHtml(String(data.url || data.src || ""))}" alt="${escapeHtml(String(data.alt || ""))}" style="max-width:100%;border-radius:8px;" /></div>`;

    case "button": {
      const isSecondary = data.style === "secondary";
      const bg = isSecondary ? "#f09a00" : "#122546";
      const color = isSecondary ? "#122546" : "#ffffff";
      return `<div style="text-align:${data.align || "center"};margin:22px 0;">
        <a href="${escapeHtml(String(data.url || ""))}" style="display:inline-block;padding:12px 32px;background:${bg};color:${color};text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;border:2px solid ${bg};">${escapeHtml(String(data.text || data.hi || ""))}</a>
      </div>`;
    }

    case "link":
      return `<p style="margin:10px 0;"><a href="${escapeHtml(String(data.url || ""))}" style="color:#f09a00;font-weight:600;text-decoration:none;">${escapeHtml(text)}</a></p>`;

    case "list": {
      const items = Array.isArray(data.items) ? (data.items as string[]) : text.split("\n").filter(Boolean);
      const lis = items.map((item) => `<li style="margin:3px 0;">${escapeHtml(item)}</li>`).join("");
      return `<ul style="font-size:15px;line-height:1.6;color:#4c5872;padding-left:22px;margin:10px 0;">${lis}</ul>`;
    }

    case "divider":
      return `<div class="divider"></div>`;

    case "job_card":
      return `<div style="border:1px solid #dfe8f5;border-radius:10px;padding:18px;margin:18px 0;background:#f9fafb;">
        <h3 style="margin:0 0 6px;font-size:17px;color:#122546;font-weight:700;">${escapeHtml(String(data.titleHi || data.title || ""))}</h3>
        <p style="margin:3px 0;font-size:13px;color:#4c5872;">Organization: ${escapeHtml(String(data.org || ""))}</p>
        <p style="margin:3px 0;font-size:13px;color:#4c5872;">Vacancies: ${escapeHtml(String(data.vacancies || ""))} | Last Date: ${escapeHtml(String(data.lastDate || ""))}</p>
        ${data.url ? `<a href="${escapeHtml(String(data.url))}" style="display:inline-block;margin-top:8px;padding:6px 14px;background:#122546;color:#fff;border-radius:6px;font-weight:700;text-decoration:none;font-size:12px;">View Job</a>` : ""}
      </div>`;

    case "scheme_card":
      return `<div style="border:1px solid #fef3c7;border-left:3px solid #f09a00;border-radius:8px;padding:16px;margin:18px 0;background:#fffbeb;">
        <h3 style="margin:0 0 6px;font-size:17px;color:#122546;font-weight:700;">${escapeHtml(String(data.titleHi || data.title || ""))}</h3>
        <p style="margin:3px 0;font-size:14px;color:#4c5872;line-height:1.5;">${escapeHtml(String(data.desc || ""))}</p>
        ${data.url ? `<a href="${escapeHtml(String(data.url))}" style="display:inline-block;margin-top:8px;padding:6px 14px;background:#f09a00;color:#122546;border-radius:6px;font-weight:700;text-decoration:none;font-size:12px;">View Scheme</a>` : ""}
      </div>`;

    case "result_card":
      return `<div style="border:1px solid #dcfce8;border-left:3px solid #21945d;border-radius:8px;padding:16px;margin:18px 0;background:#f0fdf4;">
        <h3 style="margin:0 0 6px;font-size:17px;color:#122546;font-weight:700;">${escapeHtml(String(data.titleHi || data.title || ""))}</h3>
        <p style="margin:3px 0;font-size:13px;color:#4c5872;">Organization: ${escapeHtml(String(data.org || ""))}</p>
        <p style="margin:3px 0;font-size:13px;color:#4c5872;">Result Date: ${escapeHtml(String(data.resultDate || ""))}</p>
        ${data.url ? `<a href="${escapeHtml(String(data.url))}" style="display:inline-block;margin-top:8px;padding:6px 14px;background:#122546;color:#fff;border-radius:6px;font-weight:700;text-decoration:none;font-size:12px;">Check Result</a>` : ""}
      </div>`;

    case "important_update":
      return `<div style="background:#fff7e8;border-left:4px solid #f09a00;border-radius:6px;padding:14px 18px;margin:18px 0;">
        <strong style="color:#122546;font-size:15px;font-weight:700;">${escapeHtml(String(data.title || ""))}</strong>
        <p style="margin:5px 0 0;font-size:14px;line-height:1.5;color:#4c5872;">${escapeHtml(String(data.text || data.hi || ""))}</p>
      </div>`;

    case "custom_html":
      return `<div>${data.html || ""}</div>`;

    default:
      return "";
  }
}

export function renderNewsletterHtml(
  campaign: {
    subject: string;
    contentBlocks: NewsletterContentBlock[];
    senderName?: string;
    senderEmail?: string;
  },
  subscriber: { email: string; name?: string },
  unsubscribeUrl: string,
  settings: Record<string, string>
): string {
  const portalUrl = settings.websiteUrl || "https://addiessarkari.in";

  const contentHtml = (campaign.contentBlocks || []).map((b) => renderBlockHtml(b, portalUrl)).join("");

  const navHtml = PORTAL_NAV.map(
    (n) => `<a href="${portalUrl}${n.url}" style="color:#cbd5e1;text-decoration:none;margin:0 8px;font-size:12px;">${n.label}</a>`
  ).join("");

  const legalHtml = LEGAL_LINKS.map(
    (l) => `<a href="${portalUrl}${l.url}" style="color:#93afd6;text-decoration:none;margin-right:12px;font-size:12px;">${l.label}</a>`
  ).join("");

  const socialIcons: Record<string, { name: string; icon: string; color: string }> = {
    youtube: { name: "YouTube", icon: "youtube", color: "#FF0000" },
    telegram: { name: "Telegram", icon: "telegram", color: "#0088CC" },
    whatsapp: { name: "WhatsApp", icon: "whatsapp", color: "#25D36F" },
    facebook: { name: "Facebook", icon: "facebook", color: "#1877F2" },
    instagram: { name: "Instagram", icon: "instagram", color: "#E4405F" },
    linkedin: { name: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
    twitter: { name: "X", icon: "twitter", color: "#1DA1F2" },
  };

  const socialHtml = Object.entries(socialIcons)
    .filter(([key]) => settings[key] && settings[key]!.trim())
    .map(([key, meta]) => {
      const url = settings[key]!;
      const svg = getSocialIconSvg(meta.icon);
      return `<a href="${escapeHtml(url)}" style="display:inline-block;margin:0 6px;text-decoration:none;">${svg}</a>`;
    })
    .join("");

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(campaign.subject)}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Mukta', Arial, sans-serif; background: #f2f4f9; color: #1a2238; }
    .tricolor { background: linear-gradient(90deg, #f09a00 0 34%, #f8fafc 34% 67%, #21945d 67% 100%); }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #122546; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; font-family: 'Rajdhani', sans-serif; }
    .header h1 span { color: #f09a00; }
    .header p { margin: 5px 0 0; font-size: 12px; opacity: 0.7; }
    .tagline { text-align: center; padding: 12px; background: #fff7e8; font-size: 13px; font-weight: 600; color: #783402; }
    .nav-links { text-align: center; padding: 8px 0; }
    .content { padding: 25px; }
    .divider { height: 1px; background: #dfe8f5; margin: 22px 0; }
    .footer { background: #122546; color: #cbd5e1; padding: 25px; font-size: 13px; }
    .footer h3 { color: #f09a00; font-size: 14px; font-weight: 700; margin: 0 0 10px; }
    .footer p { font-size: 12px; color: #93afd6; line-height: 1.4; margin: 3px 0; }
    .footer a { color: #93afd6; text-decoration: none; }
  </style>
</head>
<body style="margin:0;padding:0;">
  <div class="tricolor" style="height:4px;"></div>
  <div class="container">
    <div class="header">
      <h1>APPZENO <span>Sarkari</span> Portal</h1>
      <p>आपके काम की जानकारी, एक जगह। — Every Govt Service, One Place</p>
    </div>
    <div class="tagline">नई सेवाएं • नई योजनाएं • महत्वपूर्ण अपडेट — New Services • New Schemes • Important Updates</div>
    <div class="nav-links">${navHtml}</div>
    <div class="content">
    ${contentHtml}
    </div>
    <div class="footer">
      <h3>APPZENO Sarkari Portal</h3>
      <p>आपके काम की जानकारी, एक जगह।</p>
      <div style="margin:12px 0;">${legalHtml}</div>
      <div style="margin:12px 0;">${socialHtml}</div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #1f3b6e;text-align:center;font-size:11px;color:#93afd6;">
        You received this because you subscribed to APPZENO Sarkari Portal.<br>
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#f09a00;font-weight:700;">Unsubscribe</a> | <a href="${portalUrl}/newsletter/preferences" style="color:#f09a00;font-weight:700;">Manage Preferences</a>
      </div>
      <div style="margin-top:12px;font-size:11px;color:#93afd6;text-align:center;">
        © ${year} APPZENO Sarkari Portal. All Rights Reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}

function getSocialIconSvg(icon: string): string {
  const size = 18;
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"`;
  switch (icon) {
    case "youtube":
      return `<svg ${common}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2 29 29 0 0 0 8.6.46 29 29 0 0 0 8.6-.46 2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><path d="M10 15l5.33-3L10 9v6z" fill="#fff"></path></svg>`;
    case "telegram":
      return `<svg ${common}><path d="M21 5 2 13l6 2.5L8 21l6-5 5 2z"></path></svg>`;
    case "facebook":
      return `<svg ${common}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
    case "instagram":
      return `<svg ${common}><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="5"></circle><circle cx="18" cy="6" r="1" fill="#fff"></circle></svg>`;
    case "linkedin":
      return `<svg ${common}><rect x="2" y="2" width="20" height="20" rx="4"></rect><circle cx="6" cy="6" r="2"></circle><path d="M2 14v6h4v-6M9 14v6h4v-4a2 2 0 0 1 2-2h.5a3.5 3.5 0  0-3.5 3.5V21H9v-7"></path></svg>`;
    case "twitter":
      return `<svg ${common}><path d="M22 4s-.7 2.1-2 3.4C21 9.7 22 11.5 22 13.5c0 4.4-3.6 8-8 8s-8-3.6-8-8C6 8 11 4 16 4c.7 0 1.4.1 2 .3C19.3 2.7 22 4 22 4z"></path></svg>`;
    case "whatsapp":
      return `<svg ${common}><path d="M22.54 4.31A11.44 11.44 0 0 0 12 1C5.9 1 1 5.9 1 12c0 2.4.6 4.7 1.7 6.7l-1.7 5.2 5.4-2.8A10.9 10.9 0 0 0 12 23c6.1 0 11-4.9 11-11 0-2.8-.7-5.4-1.9-7.7z"></path><path d="M16 12.37c0-.81-.66-1.47-1.47-1.47-.23 0-.46.05-.66.14.2.14.35.33.42.55.06.22.08.44-.19.44-.49 0-1.59-.59-1.59-.59-.24-.16-.51-.35-.86-.09.14.22.27.47.39.73.12.26.15.53-.13.53-.36 0-1.46-.28-1.71-.37-.23-.09-.31.17-.03.53.18.47 1.03 1.03 1.5.99.29-.02.81.33.81.33s.33.75 2.28 1.03c.46.05 1.3.08 1.86-.24.46-0.26 1.29-0.73 1.72-1.25.67-.81 1.49-1.51 1.49-2.6s-.27-2.35-1.62-2.73v-.06c0-.46-.19-.93-.49-1.27.35-.1 1.03-.76 1.43-1.17z"></path></svg>`;
    default:
      return "";
  }
}

export function renderNewsletterText(
  campaign: { subject: string; contentBlocks: NewsletterContentBlock[] },
  subscriber: { email: string; name?: string },
  unsubscribeUrl: string,
  settings: Record<string, string>
): string {
  const portalUrl = settings.websiteUrl || "https://addiessarkari.in";
  const year = new Date().getFullYear();

  const text = (campaign.contentBlocks || []).map((block: NewsletterContentBlock) => {
    const d = block.data || {};
    switch (block.type) {
      case "heading":
        return `\n${String(d.text || d.hi || "")}\n`;
      case "paragraph":
        return `\n${String(d.text || d.hi || "")}\n`;
      case "button":
        return `\n${String(d.text || d.hi || "")} — ${d.url || ""}\n`;
      case "link":
        return `\n${String(d.text || d.hi || "")} — ${d.url || ""}\n`;
      case "list": {
        const items = Array.isArray(d.items) ? d.items as string[] : String(d.text || "").split("\n").filter(Boolean);
        return items.map((i) => `- ${i}`).join("\n") + "\n";
      }
      case "job_card":
        return `\n${String(d.titleHi || d.title || "")} | ${d.org || ""} | Last: ${d.lastDate || ""} | ${d.url || ""}\n`;
      case "scheme_card":
        return `\n${String(d.titleHi || "")}\n${d.desc || ""}\n${d.url || ""}\n`;
      case "result_card":
        return `\n${String(d.titleHi || "")} | ${d.org || ""} | ${d.url || ""}\n`;
      case "important_update":
        return `\n${d.title || ""}: ${String(d.text || d.hi || "")}\n`;
      case "divider":
        return "\n" + "-".repeat(40) + "\n";
      default:
        return "";
    }
  }).join("");

  return `APPZENO Sarkari Portal Newsletter — ${campaign.subject}

${text}

---
${settings.about || ""}

Website: ${portalUrl}
Unsubscribe: ${unsubscribeUrl}

© ${year} APPZENO Sarkari Portal. All Rights Reserved.`;
}
