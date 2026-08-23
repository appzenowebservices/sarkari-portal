import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";
import { UNIVERSAL_FIELD_MASTER } from "@/lib/universal-field-master";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = UNIVERSAL_FIELD_MASTER.map((f) => ({
      "Field Label": f.labelEn,
      "Value": "",
      "Field Key": f.key,
      "Field Type": f.type,
      "Required": f.required ? "Yes" : "No",
      "HTML Component": f.htmlComponent,
      "Section": f.section,
      "SEO Source": f.seoSource ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Job Data");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="universal-job-template.xlsx"',
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "Template generation failed" }, { status: 500 });
  }
}
