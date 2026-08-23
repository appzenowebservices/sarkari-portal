export type ColumnDef<T> = { key: keyof T; label: string };

export function exportToCSV<T>(data: T[], columns: ColumnDef<T>[], filename: string): void {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((item) =>
    columns.map((c) => {
      const raw = item[c.key];
      const val = raw == null ? "" : String(raw);
      if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromCSV<T>(): Promise<{ data: T[]; errors: string[] }> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve({ data: [], errors: [] }); return; }
      try {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "xlsx" || ext === "xls") {
          const { readExcel } = await import("./excel-utils");
          const result = await readExcel<T>(file);
          resolve(result);
        } else {
          const text = await file.text();
          const { data, errors } = parseCSV<T>(text);
          resolve({ data, errors });
        }
      } catch {
        resolve({ data: [], errors: ["फाइल पढ़ने में त्रुटि"] });
      }
    };
    input.click();
  });
}

export function getCSVTemplate<T>(
  columns: ColumnDef<T>[],
  sampleData?: Partial<T>
): string {
  const header = columns.map((c) => c.label).join(",");
  const sampleRow = columns.map((c) => {
    const val = sampleData?.[c.key as keyof T];
    if (val === undefined || val === null) return "";
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }).join(",");
  const hints: Record<string, string> = {
    titleHi: "हिंदी नाम",
    titleEn: "English name",
    descriptionHi: "हिंदी विवरण",
    descriptionEn: "English description",
    slug: "url-slug",
    url: "https://example.com",
    icon: "dots",
    color: "navy",
    variant: "banner",
    placement: "hero_below",
    tags: "tag1, tag2",
    adType: "banner",
    preferredPlacement: "hero_below",
    duration: "7 days",
    budget: "5000",
    status: "pending",
    isActive: "true",
    isFeatured: "false",
    isNew: "true",
    isPublished: "false",
    sortOrder: "0",
  };
  const exampleRow = columns.map((c) => {
    const hint = hints[String(c.key)] ?? "";
    return hint.includes(",") || hint.includes('"') || hint.includes("\n")
      ? `"${hint.replace(/"/g, '""')}"`
      : hint;
  }).join(",");
  return [header, sampleRow || exampleRow].join("\n");
}

function parseCSV<T>(text: string): { data: T[]; errors: string[] } {
  const errors: string[] = [];
  const rows: string[][] = [];
  let i = 0;
  while (i < text.length) {
    const row: string[] = [];
    let col = "";
    let inQuotes = false;
    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { col += '"'; i += 2; }
          else { inQuotes = false; i++; }
        } else { col += ch; i++; }
      } else {
        if (ch === '"') { inQuotes = true; i++; }
        else if (ch === ",") { row.push(col.trim()); col = ""; i++; }
        else if (ch === "\r") {
          if (text[i + 1] === "\n") i++;
          break;
        } else if (ch === "\n") {
          break;
        } else { col += ch; i++; }
      }
    }
    row.push(col.trim());
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  if (rows.length < 2) {
    return { data: [], errors: ["CSV फाइल में हेडर और कम से कम एक डेटा रो होनी चाहिए"] };
  }
  const headers = rows[0];
  const data: T[] = rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      const val = idx < row.length ? row[idx] : "";
      if (val !== "") obj[h] = val;
    });
    return obj as T;
  });
  return { data, errors };
}
