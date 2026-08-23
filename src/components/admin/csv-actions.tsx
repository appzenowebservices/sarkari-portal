"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  DeleteButton,
  EmptyRow,
  Field,
  inputCls,
  Modal,
  SortTh,
  Spinner,
  Toggle,
  useToast,
} from "@/components/admin/ui";
import { exportToCSV, getCSVTemplate, importFromCSV, type ColumnDef } from "@/lib/csv-utils";
import { readExcel } from "@/lib/excel-utils";

export type { ColumnDef };

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  onExport?: (data: T[]) => void;
  onImport: (items: T[], mode: "upsert" | "skip") => Promise<{ imported: number; updated: number; failed: number; summary: string }>;
  filename: string;
  sampleRow?: Partial<T>;
  getUniqueKey?: (item: T) => string;
};

function CsvBtn({ children, onClick, className = "", disabled }: { children: ReactNode; onClick: () => void; className?: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer disabled:opacity-60 ${className}`}>
      {children}
    </button>
  );
}

function SvgDownload({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SvgFile({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SvgX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CSVActions<T>({ columns, data, onExport, onImport, filename, sampleRow, getUniqueKey }: Props<T>) {
  const [importOpen, setImportOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<T[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ imported: 0, updated: 0, failed: 0 });
  const [summary, setSummary] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [duplicates, setDuplicates] = useState<{ existing: T; incoming: T }[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importMode, setImportMode] = useState<"upsert" | "skip">("upsert");
  const { show } = useToast();

  const handleFile = useCallback(async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls" && f.type !== "text/csv") {
      show("कृपया .csv या .xlsx फाइल चुनें", "err");
      return;
    }
    setFile(f);
    setErrors([]);
    setPreview([]);
    setProgress({ imported: 0, updated: 0, failed: 0 });
    setSummary("");
    setDuplicates([]);
    setConfirmOpen(false);
    try {
      let rows: T[] = [];
      let h: string[] = [];
      if (ext === "xlsx" || ext === "xls") {
        const result = await readExcel<T>(f);
        if (result.errors.length > 0) {
          setErrors(result.errors);
          return;
        }
        rows = result.data;
        h = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];
      } else {
        const text = await f.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          setErrors(["फाइल में हेडर और डेटा रो दोनों चाहिए"]);
          return;
        }
        h = parseLine(lines[0]);
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const cols = parseLine(lines[i]);
          const obj: Record<string, string> = {};
          h.forEach((key, idx) => {
            if (idx < cols.length && cols[idx] !== "") obj[key] = cols[idx];
          });
          rows.push(obj as T);
        }
      }
      setHeaders(h);
      setPreview(rows.slice(0, 5));

      const dupes: { existing: T; incoming: T }[] = [];
      if (getUniqueKey && data.length > 0) {
        const existingKeys = new Set(data.map((item) => getUniqueKey(item)));
        for (const row of rows) {
          const key = getUniqueKey(row);
          if (key && existingKeys.has(key)) {
            const existing = data.find((item) => getUniqueKey(item) === key);
            if (existing) dupes.push({ existing, incoming: row });
          }
        }
      }
      setDuplicates(dupes);
    } catch {
      setErrors(["फाइल पढ़ने में त्रुटि"]);
    }
  }, [data, getUniqueKey, show]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) void handleFile(f);
  }, [handleFile]);

  const startImport = useCallback(() => {
    if (duplicates.length > 0) {
      setConfirmOpen(true);
    } else {
      doImport("skip");
    }
  }, [duplicates.length]);

  const doImport = useCallback(async (mode: "upsert" | "skip") => {
    if (!file) return;
    setImporting(true);
    setConfirmOpen(false);
    setProgress({ imported: 0, updated: 0, failed: 0 });
    setSummary("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let items: T[] = [];
      if (ext === "xlsx" || ext === "xls") {
        const result = await readExcel<T>(file);
        items = result.data;
      } else {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        const h = parseLine(lines[0]);
        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (cols.every((c) => c === "")) continue;
          const obj: Record<string, string> = {};
          h.forEach((key, idx) => {
            if (idx < cols.length && cols[idx] !== "") obj[key] = cols[idx];
          });
          items.push(obj as T);
        }
      }
      const result = await onImport(items, mode);
      setProgress({ imported: result.imported, updated: result.updated, failed: result.failed });
      setSummary(result.summary);
      if (result.failed === 0) {
        show(`${result.imported + result.updated} रेकॉर्ड सफल`);
      }
    } catch {
      show("इमपोर्ट में त्रुटि", "err");
    } finally {
      setImporting(false);
    }
  }, [file, onImport, show]);

  const reset = useCallback(() => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setErrors([]);
    setProgress({ imported: 0, updated: 0, failed: 0 });
    setSummary("");
    setDuplicates([]);
    setConfirmOpen(false);
  }, []);

  useEffect(() => {
    if (!importOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setImportOpen(false); reset(); } };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [importOpen, reset]);

  return (
    <>
      <div className="flex items-center gap-2">
        <CsvBtn
          onClick={() => {
            exportToCSV(data, columns, filename);
            onExport?.(data);
          }}
          className="border-2 border-navy-200 bg-surface text-navy-800 hover:bg-navy-50"
        >
          <SvgDownload size={16} />
          Export CSV
        </CsvBtn>
        <CsvBtn
          onClick={() => setImportOpen(true)}
          className="border-2 border-navy-200 bg-surface text-navy-800 hover:bg-navy-50"
        >
          <SvgFile size={16} />
          Import CSV/Excel
        </CsvBtn>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => { setImportOpen(false); reset(); }} />
          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl sm:max-w-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-100 bg-surface px-5 py-4">
              <h3 className="font-display text-lg font-bold text-navy-950">Import CSV / Excel</h3>
              <button type="button" onClick={() => { setImportOpen(false); reset(); }} className="grid size-8 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 cursor-pointer" aria-label="Close">
                <SvgX size={17} />
              </button>
            </div>
            <div className="space-y-5 p-5">
              {!file && !errors.length ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                    dragOver ? "border-saffron-500 bg-saffron-50/50" : "border-navy-200 hover:border-navy-300"
                  }`}
                  onClick={() => document.getElementById("csv-file-input")?.click()}
                >
                  <SvgFile size={32} className="mx-auto text-navy-300" />
                  <p className="mt-3 text-sm font-bold text-navy-900">CSV या Excel (.xlsx) फाइल यहाँ ड्रॉप करें या क्लिक करें</p>
                  <p className="mt-1 text-xs font-semibold text-ink-soft">.csv, .xlsx, .xls स्वीकार्य</p>
                  <input id="csv-file-input" type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
                </div>
              ) : errors.length > 0 && !preview.length ? (
                <div className="space-y-3">
                  <EmptyRow text="फाइल पढ़ने में त्रुटि" />
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <p className="text-xs font-extrabold text-rose-700 mb-1.5">त्रुटियाँ:</p>
                    {errors.map((e, idx) => <p key={idx} className="text-xs text-rose-700">{e}</p>)}
                  </div>
                  <CsvBtn onClick={reset} className="w-full justify-center border-2 border-navy-200 bg-surface text-navy-800 hover:bg-navy-50">दोबारा कोशिश करें</CsvBtn>
                </div>
              ) : preview.length > 0 ? (
                <>
                  {errors.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-extrabold text-amber-800 mb-1">चेतावनी:</p>
                      {errors.map((e, idx) => <p key={idx} className="text-xs text-amber-800">{e}</p>)}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-navy-900">
                      फाइल: <span className="font-normal text-ink-soft">{file?.name}</span>
                    </p>
                    <button type="button" onClick={reset} className="text-xs font-bold text-saffron-700 hover:text-saffron-900 cursor-pointer">अन्य फाइल चुनें</button>
                  </div>

                  <div className="rounded-lg border border-navy-100 bg-paper p-3">
                    <p className="mb-2 text-xs font-extrabold text-ink-soft uppercase tracking-wider">पहले {preview.length} रो का पूर्वावलोकन:</p>
                    <div className="overflow-x-auto rounded-lg border border-navy-100">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-navy-100 bg-navy-50/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                            <th className="px-2 py-2">क्रम</th>
                            {headers.map((h) => <th key={h} className="px-2 py-2">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50">
                          {preview.map((row, idx) => (
                            <tr key={idx} className="hover:bg-surface">
                              <td className="px-2 py-2 text-navy-400 font-bold">{idx + 1}</td>
                              {headers.map((key) => {
                                const val = row[key as keyof T];
                                const display = val == null ? <span className="text-ink-soft/40">—</span> : String(val);
                                return <td key={key} className="max-w-[160px] truncate px-2 py-2 text-ink">{display}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {duplicates.length > 0 && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm font-extrabold text-amber-900 mb-2">⚠️ डुप्लीकेट रेकॉर्ड मिले ({duplicates.length})</p>
                      <p className="text-xs font-semibold text-amber-800 mb-3">ये रेकॉर्ड पहले से मौजूद हैं। क्या आप उन्हें अपडेट करना चाहते हैं?</p>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-amber-200 bg-amber-100/60 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                              <th className="px-2 py-2">क्रम</th>
                              <th className="px-2 py-2">मौजूदा</th>
                              <th className="px-2 py-2">नई</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100">
                            {duplicates.slice(0, 10).map((dup, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/50">
                                <td className="px-2 py-2 text-amber-700 font-bold">{idx + 1}</td>
                                <td className="max-w-[200px] truncate px-2 py-2 text-amber-900">
                                  {getUniqueKey ? String(dup.incoming) : "Record " + (idx + 1)}
                                </td>
                                <td className="max-w-[200px] truncate px-2 py-2 text-amber-700">
                                  {getUniqueKey ? String(dup.existing) : "Record " + (idx + 1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {sampleRow && (
                    <button type="button" onClick={() => {
                      const tpl = getCSVTemplate(columns, sampleRow);
                      const blob = new Blob(["\uFEFF" + tpl], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${filename}-template.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }} className="text-xs font-bold text-saffron-700 hover:text-saffron-900 cursor-pointer flex items-center gap-1">
                      <SvgDownload size={14} />
                      सैंपल टेम्पलेट डाउनलोड करें
                    </button>
                  )}

                  {(progress.imported > 0 || progress.updated > 0 || progress.failed > 0) && (
                    <div className="rounded-xl border-2 border-navy-100 bg-navy-50/60 p-4">
                      <p className="text-sm font-extrabold text-navy-900 mb-2">Import Summary:</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-leaf-100 p-2.5">
                          <p className="text-lg font-extrabold text-leaf-800 tnum">{progress.imported}</p>
                          <p className="text-[10px] font-bold text-leaf-700 uppercase">नया बनाया</p>
                        </div>
                        <div className="rounded-lg bg-amber-100 p-2.5">
                          <p className="text-lg font-extrabold text-amber-800 tnum">{progress.updated}</p>
                          <p className="text-[10px] font-bold text-amber-700 uppercase">अपडेट हुआ</p>
                        </div>
                        <div className="rounded-lg bg-rose-100 p-2.5">
                          <p className="text-lg font-extrabold text-rose-800 tnum">{progress.failed}</p>
                          <p className="text-[10px] font-bold text-rose-700 uppercase">विफल</p>
                        </div>
                      </div>
                      {summary && <p className="mt-2 text-xs font-semibold text-ink-soft">{summary}</p>}
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-2 border-t border-navy-100 pt-4 sm:flex-row sm:justify-end">
                    <CsvBtn onClick={() => { setImportOpen(false); reset(); }} className="border-2 border-navy-200 bg-surface text-ink-soft hover:bg-navy-50" disabled={importing}>रद्द करें</CsvBtn>
                    <CsvBtn onClick={startImport} disabled={importing} className="bg-saffron-500 text-navy-950 hover:bg-saffron-400 shadow-sm">
                      {importing ? (<><span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" />Import हो रहा है…</>) : "Import करें"}
                    </CsvBtn>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div className="relative max-w-md w-full rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <h3 className="font-display text-lg font-bold text-navy-950">डुप्लीकेट रेकॉर्ड</h3>
            </div>
            <p className="text-sm font-semibold text-ink-soft mb-2">
              इमपोर्ट करने वाले {duplicates.length} रेकॉर्ड पहले से मौजूद हैं।
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4">
              <p className="text-xs font-extrabold text-amber-800 mb-2">क्या करना है?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="importMode" value="upsert" checked={importMode === "upsert"} onChange={() => setImportMode("upsert")} className="accent-saffron-600" />
                  <span className="text-sm font-bold text-navy-900">मौजूदा रेकॉर्ड अपडेट करें + नई रेकॉर्ड बनाएं</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="importMode" value="skip" checked={importMode === "skip"} onChange={() => setImportMode("skip")} className="accent-saffron-600" />
                  <span className="text-sm font-bold text-navy-900">नई रेकॉर्ड सिर्फ बनाएं (मौजूदा को छोड़ दें)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <CsvBtn onClick={() => { setConfirmOpen(false); doImport("skip"); }} className="border-2 border-navy-200 bg-surface text-ink-soft hover:bg-navy-50" disabled={importing}>रद्द करें</CsvBtn>
              <CsvBtn onClick={() => doImport(importMode)} disabled={importing} className="bg-saffron-500 text-navy-950 hover:bg-saffron-400 shadow-sm">
                {importing ? (<><span className="size-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" />Import हो रहा है…</>) : "Continue Import"}
              </CsvBtn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function parseLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let i = 0;
  let inQuotes = false;
  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else { current += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ",") { cols.push(current); current = ""; i++; }
      else { current += ch; i++; }
    }
  }
  cols.push(current);
  return cols;
}
