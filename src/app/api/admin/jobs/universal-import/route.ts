import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { readExcel } from "@/lib/excel-utils";
import { importFromCSV } from "@/lib/csv-utils";
import { mapUniversalImport } from "@/lib/universal-import-mapper";
import { getFieldByKey } from "@/lib/universal-field-master";

export const runtime = "nodejs";

function validateFileFormat(file: File): Promise<{ fields: { key: string; value: string }[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ fields: [], errors: ["फाइल खाली है"] });
          return;
        }

        const ext = file.name.split(".").pop()?.toLowerCase();
        let rows: Record<string, unknown>[] = [];
        let parseErrors: string[] = [];

        if (ext === "xlsx" || ext === "xls") {
          const result = await readExcel<Record<string, string>>(file);
          if (result.errors.length) {
            resolve({ fields: [], errors: result.errors });
            return;
          }
          rows = result.data as Record<string, unknown>[];
        } else {
          const text = await file.text();
          const result = await importFromCSV<Record<string, string>>();
          rows = result.data as Record<string, unknown>[];
          parseErrors = result.errors;
        }

        if (parseErrors.length) {
          resolve({ fields: [], errors: parseErrors });
          return;
        }

        if (rows.length === 0) {
          resolve({ fields: [], errors: ["फाइल में डेटा नहीं है"] });
          return;
        }

        const fields: { key: string; value: string }[] = [];
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const key = String(row.field_key || row.key || row["Field Key"] || "").trim();
          const value = String(row.value || row["Value"] || "").trim();

          if (!key) {
            errors.push(`Row ${i + 1}: field_key missing`);
            continue;
          }

          const def = getFieldByKey(key);
          if (!def) {
            errors.push(`Row ${i + 1}: Unknown field key "${key}"`);
            continue;
          }

          fields.push({ key, value });
        }

        resolve({ fields, errors });
      } catch {
        resolve({ fields: [], errors: ["फाइल पार्स करने में त्रुटि"] });
      }
    };
    reader.onerror = () => resolve({ fields: [], errors: ["फाइल पढ़ने में त्रुटि"] });
    reader.readAsArrayBuffer(file);
  });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "फाइल ज़रूरी है" }, { status: 400 });
    }

    const { fields, errors } = await validateFileFormat(file);

    if (errors.length) {
      return NextResponse.json({ ok: false, error: errors[0], details: errors }, { status: 400 });
    }

    const result = mapUniversalImport(fields);

    if (!result.ok || !result.data) {
      return NextResponse.json({ ok: false, error: result.error || "Import failed" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      preview: {
        title: result.data.titleEn || result.data.titleHi,
        stats: result.stats,
        warnings: result.warnings,
        payload: result.data,
      },
    });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
