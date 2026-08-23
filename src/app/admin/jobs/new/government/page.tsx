"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import WordPressStyleEditor from "@/components/wordpress-style-editor";

type JobType = "Sarkari" | "PSU" | "Banking" | "Railway" | "Defence" | "Teaching" | "Police" | "Others";

interface GovernmentJobForm {
  id?: string;
  title: string;
  organization: string;
  department: string;
  jobType: JobType;
  totalVacancies: number;
  categoryId: string;
  categoryName: string;
  state: string;
  district: string;
  applicationStartDate: string;
  applicationLastDate: string;
  examDate: string;
  admitCardDate: string;
  resultDate: string;
  applicationFeeGeneral: number;
  applicationFeeOBC: number;
  applicationFeeSC: number;
  applicationFeeST: number;
  feeExemption: boolean;
  ageLimitMin: number;
  ageLimitMax: number;
  ageRelaxation: string;
  qualification: string;
  experience: string;
  physicalRequirements: string;
  jobDescription: string;
  jobDescriptionTitle: string;
  responsibilities: string[];
  eligibility: string[];
  selectionProcess: string[];
  importantLinks: { title: string; url: string }[];
  importantDates: { event: string; date: string }[];
  notificationUrl: string;
  applyUrl: string;
  status: "Draft" | "Published" | "Closed";
  visibility: "Public" | "Private";
  featured: boolean;
  urgent: boolean;
}

const EMPTY_FORM: GovernmentJobForm = {
  title: "",
  organization: "",
  department: "",
  jobType: "Sarkari",
  totalVacancies: 1,
  categoryId: "",
  categoryName: "",
  state: "",
  district: "",
  applicationStartDate: "",
  applicationLastDate: "",
  examDate: "",
  admitCardDate: "",
  resultDate: "",
  applicationFeeGeneral: 0,
  applicationFeeOBC: 0,
  applicationFeeSC: 0,
  applicationFeeST: 0,
  feeExemption: false,
  ageLimitMin: 18,
  ageLimitMax: 30,
  ageRelaxation: "",
  qualification: "",
  experience: "",
  physicalRequirements: "",
  jobDescription: "",
  jobDescriptionTitle: "",
  responsibilities: [],
  eligibility: [],
  selectionProcess: [],
  importantLinks: [],
  importantDates: [],
  notificationUrl: "",
  applyUrl: "",
  status: "Draft",
  visibility: "Public",
  featured: false,
  urgent: false,
};

const JOB_TYPES: JobType[] = ["Sarkari", "PSU", "Banking", "Railway", "Defence", "Teaching", "Police", "Others"];
const STATES = ["Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Others"];

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };
  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-navy-100 bg-surface p-2">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-extrabold text-navy-800">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-navy-500 hover:text-navy-900 cursor-pointer"><Icon name="x" size={12} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } if (e.key === "Backspace" && !input && value.length) removeTag(value[value.length - 1]); }}
        placeholder={placeholder || "Type and press Enter"}
        className="min-w-[120px] flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-ink-soft/60"
      />
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border-2 border-navy-100 bg-surface">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-3 text-left">
        <h2 className="font-display text-base font-bold text-navy-950">{title}</h2>
        <Icon name="chevronLeft" size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-navy-100 p-5">{children}</div>}
    </div>
  );
}

export default function GovernmentJobPage() {
  const [form, setForm] = useState<GovernmentJobForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const set = useCallback(<K extends keyof GovernmentJobForm>(key: K, value: GovernmentJobForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.title.trim()) {
        fetch("/api/admin/jobs/autosave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, titleEn: form.title }),
        }).then(() => {
          setLastSaved(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        }).catch(() => {});
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [form]);

  const handleSave = async (status: "Draft" | "Published" | "Closed") => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status, jobType: "government", titleEn: form.title, titleHi: form.title }),
      });
      const data = await res.json();
      if (data.ok) {
        setForm((f) => ({ ...f, id: data.job.id }));
        setLastSaved(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        alert(status === "Published" ? "Job published successfully!" : "Draft saved!");
      } else {
        alert(data.error || "Save failed");
      }
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-navy-200 bg-paper px-3 py-2 text-sm font-semibold text-navy-900 outline-none focus:border-saffron-500";
  const labelCls = "mb-1 block text-xs font-extrabold text-ink-soft";

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-20 border-b border-navy-100 bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/admin/jobs" className="text-navy-500 hover:text-navy-800">
                <Icon name="chevronLeft" size={20} className="rotate-180" />
              </Link>
              <div>
                <h1 className="font-display text-xl font-bold text-navy-950 sm:text-2xl">Government Job Posting</h1>
                <p className="text-xs font-semibold text-ink-soft">{lastSaved ? `Last saved at ${lastSaved}` : "Not saved yet"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => handleSave("Draft")} disabled={saving} className="rounded-xl border border-navy-200 px-4 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 disabled:opacity-60">
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button type="button" onClick={() => handleSave("Published")} disabled={publishing} className="rounded-xl bg-saffron-500 px-5 py-2 text-sm font-extrabold text-navy-950 shadow-sm hover:bg-saffron-400 disabled:opacity-60">
                {publishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Section title="Job Basic Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Post Name *</label>
                  <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Clerk, Officer, Assistant" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Organization/Department *</label>
                  <input value={form.organization} onChange={(e) => set("organization", e.target.value)} className={inputCls} placeholder="e.g. SSC, UPSC, Banking" />
                </div>
                <div>
                  <label className={labelCls}>Department</label>
                  <input value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls} placeholder="Department name" />
                </div>
                <div>
                  <label className={labelCls}>Job Type</label>
                  <select value={form.jobType} onChange={(e) => set("jobType", e.target.value as JobType)} className={inputCls}>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Total Vacancies *</label>
                  <input type="number" value={form.totalVacancies} onChange={(e) => set("totalVacancies", parseInt(e.target.value) || 0)} className={inputCls} min={1} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls}>
                    <option value="">Select State</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>District</label>
                  <input value={form.district} onChange={(e) => set("district", e.target.value)} className={inputCls} placeholder="District name" />
                </div>
              </div>
            </Section>

            <Section title="Important Dates">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Application Start Date</label>
                  <input type="date" value={form.applicationStartDate} onChange={(e) => set("applicationStartDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Application Last Date</label>
                  <input type="date" value={form.applicationLastDate} onChange={(e) => set("applicationLastDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Exam Date</label>
                  <input type="date" value={form.examDate} onChange={(e) => set("examDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Admit Card Date</label>
                  <input type="date" value={form.admitCardDate} onChange={(e) => set("admitCardDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Result Date</label>
                  <input type="date" value={form.resultDate} onChange={(e) => set("resultDate", e.target.value)} className={inputCls} />
                </div>
              </div>
            </Section>

            <Section title="Application Fee">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>General Fee (INR)</label>
                  <input type="number" value={form.applicationFeeGeneral} onChange={(e) => set("applicationFeeGeneral", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>OBC Fee (INR)</label>
                  <input type="number" value={form.applicationFeeOBC} onChange={(e) => set("applicationFeeOBC", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>SC Fee (INR)</label>
                  <input type="number" value={form.applicationFeeSC} onChange={(e) => set("applicationFeeSC", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>ST Fee (INR)</label>
                  <input type="number" value={form.applicationFeeST} onChange={(e) => set("applicationFeeST", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="feeExemption" checked={form.feeExemption} onChange={(e) => set("feeExemption", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="feeExemption" className="text-xs font-extrabold text-navy-900">Fee Exemption Available</label>
                </div>
              </div>
            </Section>

            <Section title="Age & Qualification">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Minimum Age</label>
                  <input type="number" value={form.ageLimitMin} onChange={(e) => set("ageLimitMin", parseInt(e.target.value) || 18)} className={inputCls} min={18} />
                </div>
                <div>
                  <label className={labelCls}>Maximum Age</label>
                  <input type="number" value={form.ageLimitMax} onChange={(e) => set("ageLimitMax", parseInt(e.target.value) || 30)} className={inputCls} min={18} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Age Relaxation</label>
                  <input value={form.ageRelaxation} onChange={(e) => set("ageRelaxation", e.target.value)} className={inputCls} placeholder="e.g. 5 years for SC/ST" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Qualification *</label>
                  <textarea value={form.qualification} onChange={(e) => set("qualification", e.target.value)} className={`${inputCls} h-20`} placeholder="Required educational qualification" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Experience</label>
                  <textarea value={form.experience} onChange={(e) => set("experience", e.target.value)} className={`${inputCls} h-20`} placeholder="Required experience" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Physical Requirements</label>
                  <textarea value={form.physicalRequirements} onChange={(e) => set("physicalRequirements", e.target.value)} className={`${inputCls} h-20`} placeholder="Physical standards if any" />
                </div>
              </div>
            </Section>

            <Section title="Job Description">
              <WordPressStyleEditor
                value={{ html: form.jobDescription, title: form.jobDescriptionTitle }}
                onChange={(val) => {
                  set("jobDescription", val.html);
                  set("jobDescriptionTitle", val.title);
                }}
                minHeight={400}
              />
            </Section>

            <Section title="Responsibilities & Eligibility">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelCls}>Responsibilities</label>
                  <TagInput value={form.responsibilities} onChange={(v) => set("responsibilities", v)} placeholder="Add responsibilities" />
                </div>
                <div>
                  <label className={labelCls}>Eligibility Criteria</label>
                  <TagInput value={form.eligibility} onChange={(v) => set("eligibility", v)} placeholder="Add eligibility criteria" />
                </div>
                <div>
                  <label className={labelCls}>Selection Process</label>
                  <TagInput value={form.selectionProcess} onChange={(v) => set("selectionProcess", v)} placeholder="e.g. Written Test, Interview" />
                </div>
              </div>
            </Section>

            <Section title="Important Links">
              <div className="space-y-3">
                {form.importantLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input value={link.title} onChange={(e) => { const updated = [...form.importantLinks]; updated[idx] = { ...updated[idx], title: e.target.value }; set("importantLinks", updated); }} className={inputCls} placeholder="Link title" />
                    <input value={link.url} onChange={(e) => { const updated = [...form.importantLinks]; updated[idx] = { ...updated[idx], url: e.target.value }; set("importantLinks", updated); }} className={inputCls} placeholder="URL" />
                    <button type="button" onClick={() => set("importantLinks", form.importantLinks.filter((_, i) => i !== idx))} className="rounded-lg border border-navy-200 px-3 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => set("importantLinks", [...form.importantLinks, { title: "", url: "" }])} className="rounded-xl border border-navy-200 px-4 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">
                  + Add Link
                </button>
              </div>
            </Section>

            <Section title="Important Dates Timeline">
              <div className="space-y-3">
                {form.importantDates.map((date, idx) => (
                  <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input value={date.event} onChange={(e) => { const updated = [...form.importantDates]; updated[idx] = { ...updated[idx], event: e.target.value }; set("importantDates", updated); }} className={inputCls} placeholder="Event name" />
                    <input type="date" value={date.date} onChange={(e) => { const updated = [...form.importantDates]; updated[idx] = { ...updated[idx], date: e.target.value }; set("importantDates", updated); }} className={inputCls} />
                    <button type="button" onClick={() => set("importantDates", form.importantDates.filter((_, i) => i !== idx))} className="rounded-lg border border-navy-200 px-3 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => set("importantDates", [...form.importantDates, { event: "", date: "" }])} className="rounded-xl border border-navy-200 px-4 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">
                  + Add Date
                </button>
              </div>
            </Section>

            <Section title="Links">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Notification URL</label>
                  <input value={form.notificationUrl} onChange={(e) => set("notificationUrl", e.target.value)} className={inputCls} placeholder="https://..." />
                </div>
                <div>
                  <label className={labelCls}>Apply URL</label>
                  <input value={form.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} className={inputCls} placeholder="https://..." />
                </div>
              </div>
            </Section>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border-2 border-navy-100 bg-surface shadow-sm">
              <div className="border-b border-navy-100 px-5 py-3">
                <h3 className="font-display text-sm font-bold text-navy-950">Publishing Controls</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={labelCls}>Job Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value as any)} className={inputCls}>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Visibility</label>
                  <select value={form.visibility} onChange={(e) => set("visibility", e.target.value as any)} className={inputCls}>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="featured" className="text-xs font-extrabold text-navy-900">Featured Job</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="urgent" checked={form.urgent} onChange={(e) => set("urgent", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="urgent" className="text-xs font-extrabold text-navy-900">Urgent Hiring</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
