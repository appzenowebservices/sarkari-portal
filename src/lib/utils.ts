export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "अभी";
  if (minutes < 60) return `${minutes} मिनट पहले`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} घंटे पहले`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} दिन पहले`;
  return date.toLocaleDateString("hi-IN");
}

const STOP_WORDS = new Set([
  "the","and","for","with","from","this","that","have","has","been","will","can","are","was","were","not","but","you","your","our","their","his","her","its","all","any","each","every","both","few","more","most","other","some","such","than","too","very","just","because","but","or","if","while","about","into","through","during","before","after","above","below","between","under","again","further","then","once","here","there","when","where","why","how","what","which","who","whom","also","now","today","new","old","best","top","free","full","online","official","website","home","page","click","here","visit","open","use","using","used","one","two","make","made","get","got","like","know","see","look","come","way","need","want","good","great","right","still","thing","things","something","anything","everything","nothing",
  "का","के","की","में","से","पर","को","ने","या","है","हैं","था","थे","थी","कर","करे","किया","किए","करें","करता","करती","करते","ले","लिया","लिए","पानी","पाया","पाएं","जाए","जाएं","जा","हो","हों","होता","होती","होते","सकता","सकती","सकते","रहा","रहे","रही","रहें","दो","दे","दिया","दिए","दें","बन","बना","बने","बनाए","बनाना","लग","लगा","लगे","लगी","आ","आए","आएं","आता","आती","आते","चाहिए","चाहते","चाहता","सक","सके","पड़","पड़ा","पड़े","हुआ","हुई","हुए","हुआ","होना","होने","किया","की","करेगा","करेंगे","करेंगी","करता","करती","करते","करें","करो","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें",
  "अपना","अपनी","अपने","हम","हमारा","हमारी","हमारे","तुम","तुम्हारा","तुम्हारी","तुम्हारे","वह","वो","उसका","उसकी","उसके","इसका","इसकी","इसके","जो","जिस","जिसे","जहां","जैसे","तो","क्योंकि","कि","ही","भी","तक","फिर","बाद","पहले","साथ","सामने","नीचे","ऊपर","बाईं","दाईं","पूरे","सिर्फ","केवल","हर","किसी","किस","कुछ","बहुत","थोड़ा","ज्यादा","कम","अधिक","सारा","सारी","सारे","पूरा","पूरी","पूरे","नया","नई","नए","पुराना","पुरानी","पुराने","बड़ा","बड़ी","बड़े","छोटा","छोटी","छोटे","अच्छा","अच्छी","अच्छे","बुरा","बुरी","बुरे","सरल","आसान","कठिन","जरूरी","महत्वपूर्ण","जरूर","अवश्य","शायद","होना","है","था","था","होगा","होगी","होंगे","हुआ","हुई","हुए","होता","होती","होते","हों","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें","करता","करती","करते","करें","करो","कर","करें"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

export function generateTags(
  titleHi: string,
  titleEn: string,
  descriptionHi: string,
  descriptionEn: string,
  url: string
): string {
  const combined = [titleHi, titleEn, descriptionHi, descriptionEn, url].join(" ");
  const words = tokenize(combined);
  const unique = Array.from(new Set(words));
  const tags = unique.slice(0, 15);
  return tags.join(", ");
}

export type JobStatus = "active" | "upcoming" | "closed";

export function jobStatusOf(startDate: string | null | undefined, lastDate: string | null | undefined): JobStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = startDate ? new Date(startDate) : null;
  const end = lastDate ? new Date(lastDate) : null;
  if (start && now < start) return "upcoming";
  if (end && now > end) return "closed";
  return "active";
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: Date | string | null | undefined): string {
  if (!dateStr) return "—";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
