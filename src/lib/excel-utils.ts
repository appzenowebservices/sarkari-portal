import * as XLSX from "xlsx";

export async function readExcel<T>(file: File): Promise<{ data: T[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ data: [], errors: ["फाइल खाली है"] });
          return;
        }
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) {
          resolve({ data: [], errors: ["शीट नहीं मिली"] });
          return;
        }
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
        if (json.length === 0) {
          resolve({ data: [], errors: ["एक्सेल फाइल में डेटा नहीं है"] });
          return;
        }
        const dataRows: T[] = json.map((row) => {
          const obj: Record<string, string> = {};
          for (const [key, val] of Object.entries(row)) {
            if (val !== null && val !== undefined && String(val).trim() !== "") {
              obj[key] = String(val);
            }
          }
          return obj as T;
        });
        resolve({ data: dataRows, errors: [] });
      } catch {
        resolve({ data: [], errors: ["एक्सेल पार्स करने में त्रुटि"] });
      }
    };
    reader.onerror = () => resolve({ data: [], errors: ["फाइल पढ़ने में त्रुटि"] });
    reader.readAsArrayBuffer(file);
  });
}
