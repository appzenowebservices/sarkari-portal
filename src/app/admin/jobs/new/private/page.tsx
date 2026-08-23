"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import WordPressStyleEditor from "@/components/wordpress-style-editor";

interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
}

type EmploymentType = "Full Time" | "Part Time" | "Contract" | "Temporary" | "Internship" | "Freelance" | "Apprenticeship";
type WorkMode = "Work From Office" | "Work From Home" | "Hybrid" | "Remote" | "Field Job";
type SalaryType = "Fixed" | "Variable" | "Fixed + Variable" | "Performance Based";
type SalaryPeriod = "Monthly" | "Annual" | "Hourly";
type ApplyMethod = "Apply on APPZENO" | "Apply on Company Website" | "Apply via Email" | "Walk-in" | "Contact Recruiter";
type JobStatus = "Draft" | "Published" | "Paused" | "Closed";
type Visibility = "Public" | "Private";

interface PrivateJobForm {
  id?: string;
  // Employer & Company
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyIndustry: string;
  companySize: string;
  companyLocation: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  // Job Basic
  title: string;
  category: string;
  subCategory: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  vacancies: number;
  location: string;
  experienceFrom: number;
  experienceTo: number;
   qualifications: string[];
   // Salary
  salaryType: SalaryType;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: SalaryPeriod;
  salaryNegotiable: boolean;
  salaryNotDisclose: boolean;
  incentives: string;
  benefits: string[];
  // JD
  descriptionHtml: string;
  descriptionTitle: string;
  // Skills
  requiredSkills: string[];
  preferredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  languages: string[];
  // Application
  applyMethod: ApplyMethod;
  externalUrl: string;
  applicationEmail: string;
  applicationDeadline: string;
  applicationInstructions: string;
  // Walk-in
  walkInDate: string;
  walkInStartTime: string;
  walkInEndTime: string;
  walkInVenue: string;
  walkInAddress: string;
  walkInContactPerson: string;
  walkInContactNumber: string;
  walkInDocuments: string;
  walkInInstructions: string;
  // Preferences
  genderPreference: string;
  ageFrom: number;
  ageTo: number;
  languageRequirement: string;
  travelRequired: boolean;
  willingToRelocate: boolean;
  drivingLicenseRequired: boolean;
  vehicleRequired: boolean;
  shiftType: string;
  workingHours: string;
  // SEO & Publish
  status: JobStatus;
  publishDate: string;
  expiryDate: string;
  featured: boolean;
  urgent: boolean;
  visibility: Visibility;
  applicationLimit: number;
}

const EMPTY_FORM: PrivateJobForm = {
  companyName: "",
  companyLogo: "",
  companyWebsite: "",
  companyIndustry: "",
  companySize: "",
  companyLocation: "",
  recruiterName: "",
  recruiterEmail: "",
  recruiterPhone: "",
  title: "",
  category: "",
  subCategory: "",
  employmentType: "Full Time",
  workMode: "Work From Office",
  vacancies: 1,
  location: "",
  experienceFrom: 0,
  experienceTo: 5,
  qualifications: [],
  salaryType: "Fixed",
  salaryMin: 0,
  salaryMax: 0,
  salaryPeriod: "Monthly",
  salaryNegotiable: false,
  salaryNotDisclose: false,
  incentives: "",
  benefits: [],
  descriptionHtml: "",
  descriptionTitle: "",
  requiredSkills: [],
  preferredSkills: [],
  technicalSkills: [],
  softSkills: [],
  languages: [],
  applyMethod: "Apply on APPZENO",
  externalUrl: "",
  applicationEmail: "",
  applicationDeadline: "",
  applicationInstructions: "",
  walkInDate: "",
  walkInStartTime: "",
  walkInEndTime: "",
  walkInVenue: "",
  walkInAddress: "",
  walkInContactPerson: "",
  walkInContactNumber: "",
  walkInDocuments: "",
  walkInInstructions: "",
  genderPreference: "Any",
  ageFrom: 18,
  ageTo: 60,
  languageRequirement: "",
  travelRequired: false,
  willingToRelocate: false,
  drivingLicenseRequired: false,
  vehicleRequired: false,
  shiftType: "Day Shift",
  workingHours: "",
  status: "Draft",
  publishDate: "",
  expiryDate: "",
  featured: false,
  urgent: false,
  visibility: "Public",
  applicationLimit: 0,
};

const INDUSTRIES = ["IT/Software", "BPO/KPO", "Sales/Marketing", "HR/Admin", "Finance/Accounting", "Healthcare", "Education", "Engineering", "Manufacturing", "Retail", "Hospitality", "Real Estate", "Others"];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+", "Not Specified"];
const CATEGORIES = ["IT/Software", "Sales/Marketing", "HR/Admin", "Finance/Accounting", "Healthcare", "Education", "Engineering", "BPO/Customer Support", "Operations", "Legal", "Design/Creative", "Others"];
const EMPLOYMENT_TYPES: EmploymentType[] = ["Full Time", "Part Time", "Contract", "Temporary", "Internship", "Freelance", "Apprenticeship"];
const WORK_MODES: WorkMode[] = ["Work From Office", "Work From Home", "Hybrid", "Remote", "Field Job"];
const SALARY_TYPES: SalaryType[] = ["Fixed", "Variable", "Fixed + Variable", "Performance Based"];
const SALARY_PERIODS: SalaryPeriod[] = ["Monthly", "Annual", "Hourly"];
const APPLY_METHODS: ApplyMethod[] = ["Apply on APPZENO", "Apply on Company Website", "Apply via Email", "Walk-in", "Contact Recruiter"];
const JOB_STATUSES: JobStatus[] = ["Draft", "Published", "Paused", "Closed"];
const VISIBILITIES: Visibility[] = ["Public", "Private"];
const SHIFT_TYPES = ["Day Shift", "Night Shift", "Rotational Shift", "Flexible Shift", "General Shift"];
const QUALIFICATIONS = ["10th Pass", "12th Pass", "Graduate", "Post Graduate", "Diploma", "ITI", "PhD", "Any"];
const BENEFITS = ["Health Insurance", "PF", "ESI", "Paid Leave", "Performance Bonus", "Incentives", "Food", "Transport", "Accommodation", "Work From Home"];

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-navy-100 bg-surface p-2">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-extrabold text-navy-800">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-navy-500 hover:text-navy-900 cursor-pointer">
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !input && value.length) { removeTag(value[value.length - 1]); }
        }}
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
        <Icon name={open ? "chevronLeft" : "chevronLeft"} size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-navy-100 p-5">{children}</div>}
    </div>
  );
}

export default function PrivateJobPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("id");

  const [form, setForm] = useState<PrivateJobForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const companyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const set = useCallback(<K extends keyof PrivateJobForm>(key: K, value: PrivateJobForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const fetchCompanySuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setCompanySuggestions([]);
      setShowCompanySuggestions(false);
      return;
    }
    setCompanySearchLoading(true);
    try {
      const res = await fetch(`/api/admin/companies?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCompanySuggestions(data.companies || []);
        setShowCompanySuggestions(true);
      }
    } catch {
      // ignore
    } finally {
      setCompanySearchLoading(false);
    }
  }, []);

  const handleCompanySelect = (company: Company) => {
    setForm((f) => ({
      ...f,
      companyName: company.name,
      companyWebsite: company.website || "",
      companyIndustry: company.industry || "",
      companySize: company.size || "",
      companyLocation: company.location || "",
      recruiterName: company.recruiterName || "",
      recruiterEmail: company.recruiterEmail || "",
      recruiterPhone: company.recruiterPhone || "",
    }));
    setShowCompanySuggestions(false);
    setCompanySuggestions([]);
  };
  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/admin/jobs/${jobId}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        const job = data.job || data;
        setForm((f) => ({
          ...f,
          id: job.id || job._id,
          companyName: job.companyNameEn || job.companyName || job.organizationNameEn || "",
          companyLogo: job.companyLogo || "",
          companyWebsite: job.companyWebsite || "",
          companyIndustry: job.companyIndustry || "",
          companySize: job.companySize || "",
          companyLocation: job.companyLocation || "",
          recruiterName: job.recruiterName || "",
          recruiterEmail: job.recruiterEmail || "",
          title: job.titleEn || job.titleHi || "",
          category: job.categoryNameEn || job.categoryName || "",
          subCategory: job.subCategory || "",
          employmentType: job.employmentType || "Full Time",
          workMode: job.workMode || "Work From Office",
          vacancies: job.vacancies || job.totalVacancies || 1,
          location: job.locationNames?.[0] || job.state || "",
          experienceFrom: job.experienceFrom || 0,
          experienceTo: job.experienceTo || 5,
          qualifications: job.qualifications || job.minimumQualification ? [job.minimumQualification].filter(Boolean) : [],
          salaryType: job.salaryType || "Fixed",
          salaryMin: job.salaryMin || 0,
          salaryMax: job.salaryMax || 0,
          salaryPeriod: job.salaryPeriod || "Monthly",
          salaryNegotiable: job.salaryNegotiable || false,
          salaryNotDisclose: job.salaryNotDisclose || false,
          incentives: job.incentives || "",
          benefits: job.benefits || [],
          descriptionHtml: job.shortDescriptionEn || job.descriptionEn || "",
          descriptionTitle: job.shortDescriptionEn || "",
          requiredSkills: job.requiredSkills || [],
          preferredSkills: job.preferredSkills || [],
          technicalSkills: job.technicalSkills || [],
          softSkills: job.softSkills || [],
          languages: job.languages || [],
          applyMethod: job.applyMethod || "Apply on APPZENO",
          externalUrl: job.externalUrl || "",
          applicationEmail: job.applicationEmail || "",
          applicationDeadline: job.applicationDeadline || job.applicationLastDate || "",
          applicationInstructions: job.applicationInstructions || "",
          walkInDate: job.walkInDate || "",
          walkInStartTime: job.walkInStartTime || "",
          walkInEndTime: job.walkInEndTime || "",
          walkInVenue: job.walkInVenue || "",
          walkInAddress: job.walkInAddress || "",
          walkInContactPerson: job.walkInContactPerson || "",
          walkInContactNumber: job.walkInContactNumber || "",
          walkInDocuments: job.walkInDocuments || "",
          walkInInstructions: job.walkInInstructions || "",
          genderPreference: job.genderPreference || "Any",
          ageFrom: job.ageFrom || 18,
          ageTo: job.ageTo || 60,
          languageRequirement: job.languageRequirement || "",
          travelRequired: job.travelRequired || false,
          willingToRelocate: job.willingToRelocate || false,
          drivingLicenseRequired: job.drivingLicenseRequired || false,
          vehicleRequired: job.vehicleRequired || false,
          shiftType: job.shiftType || "Day Shift",
          workingHours: job.workingHours || "",
          status: job.status || "Draft",
          publishDate: job.publishDate || "",
          expiryDate: job.expiryDate || "",
          featured: job.isFeatured || job.featured || false,
          urgent: job.isUrgent || job.urgent || false,
          visibility: job.visibility || "Public",
          applicationLimit: job.applicationLimit || 0,
        }));
      })
      .catch(() => {});
  }, [jobId]);

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

  useEffect(() => {
    if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current);
    companyDebounceRef.current = setTimeout(() => {
      fetchCompanySuggestions(form.companyName);
    }, 500);
    return () => {
      if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current);
    };
  }, [form.companyName, fetchCompanySuggestions]);

  const handleSave = async (status: JobStatus) => {
    if (status === "Published") setPublishing(true);
    else setSaving(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status, jobType: "private", titleEn: form.title, titleHi: form.title }),
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
      setPublishing(false);
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
                <h1 className="font-display text-xl font-bold text-navy-950 sm:text-2xl">Private Job Posting</h1>
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
            <Section title="Employer & Company Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Company/Employer Name *</label>
                  <div className="relative">
                    <input
                      value={form.companyName}
                      onChange={(e) => set("companyName", e.target.value)}
                      className={inputCls}
                      placeholder="Type 3+ chars for suggestions"
                      onFocus={() => form.companyName.length >= 3 && setShowCompanySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 150)}
                    />
                    {showCompanySuggestions && (
                      <div className="absolute top-full left-0 z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-navy-200 bg-surface shadow-lg">
                        {companySearchLoading && (
                          <div className="px-3 py-2 text-xs text-ink-soft">Searching…</div>
                        )}
                        {companySuggestions.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleCompanySelect(company)}
                            className="block w-full cursor-pointer px-3 py-2 text-left hover:bg-navy-50"
                          >
                            <div className="font-bold text-navy-900">{company.name}</div>
                            <div className="text-xs text-ink-soft truncate">
                              {company.industry && `${company.industry} · `}{company.location}
                            </div>
                          </button>
                        ))}
                        {!companySearchLoading && companySuggestions.length === 0 && form.companyName.length >= 3 && (
                          <div className="px-3 py-2 text-xs text-ink-soft">No matches found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Company Website</label>
                  <input value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} className={inputCls} placeholder="https://company.com" />
                </div>
                <div>
                  <label className={labelCls}>Company Industry *</label>
                  <select value={form.companyIndustry} onChange={(e) => set("companyIndustry", e.target.value)} className={inputCls}>
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Company Size</label>
                  <select value={form.companySize} onChange={(e) => set("companySize", e.target.value)} className={inputCls}>
                    <option value="">Select Size</option>
                    {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Company Location *</label>
                  <input value={form.companyLocation} onChange={(e) => set("companyLocation", e.target.value)} className={inputCls} placeholder="City, State" />
                </div>
                <div>
                  <label className={labelCls}>Recruiter/Contact Person *</label>
                  <input value={form.recruiterName} onChange={(e) => set("recruiterName", e.target.value)} className={inputCls} placeholder="Full name" />
                </div>
                <div>
                  <label className={labelCls}>Recruiter Email *</label>
                  <input type="email" value={form.recruiterEmail} onChange={(e) => set("recruiterEmail", e.target.value)} className={inputCls} placeholder="email@company.com" />
                </div>
                <div>
                  <label className={labelCls}>Recruiter Phone</label>
                  <input type="tel" value={form.recruiterPhone} onChange={(e) => set("recruiterPhone", e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
                </div>
              </div>
            </Section>

            <Section title="Job Basic Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Job Title *</label>
                  <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Senior React Developer" />
                </div>
                <div>
                  <label className={labelCls}>Job Category *</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Job Sub-Category</label>
                  <input value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)} className={inputCls} placeholder="e.g. Frontend" />
                </div>
                <div>
                  <label className={labelCls}>Employment Type *</label>
                  <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value as EmploymentType)} className={inputCls}>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Work Mode *</label>
                  <select value={form.workMode} onChange={(e) => set("workMode", e.target.value as WorkMode)} className={inputCls}>
                    {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Number of Vacancies</label>
                  <input type="number" value={form.vacancies} onChange={(e) => set("vacancies", parseInt(e.target.value) || 0)} className={inputCls} min={1} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Job Location *</label>
                  <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} placeholder="City, State" />
                </div>
                <div>
                  <label className={labelCls}>Experience Required (Years) *</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={form.experienceFrom} onChange={(e) => set("experienceFrom", parseInt(e.target.value) || 0)} className={inputCls} placeholder="From" min={0} />
                    <span className="text-sm font-bold text-ink-soft">to</span>
                    <input type="number" value={form.experienceTo} onChange={(e) => set("experienceTo", parseInt(e.target.value) || 0)} className={inputCls} placeholder="To" min={0} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Education/Qualification</label>
                  <select multiple value={form.qualifications} onChange={(e) => set("qualifications", Array.from(e.target.selectedOptions, (o) => o.value))} className={`${inputCls} h-32`}>
                    {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
            </Section>

             <Section title="Salary & Compensation">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div className="flex items-end gap-2">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" id="salaryNotDisclose" checked={form.salaryNotDisclose} onChange={(e) => set("salaryNotDisclose", e.target.checked)} className="size-4 rounded border-navy-300" />
                     <label htmlFor="salaryNotDisclose" className="text-xs font-extrabold text-navy-900">Not Disclose</label>
                   </div>
                   <label className={labelCls}>Salary Type *</label>
                   <select value={form.salaryType} onChange={(e) => set("salaryType", e.target.value as SalaryType)} className={inputCls} disabled={form.salaryNotDisclose}>
                     {SALARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className={labelCls}>Salary Period</label>
                   <select value={form.salaryPeriod} onChange={(e) => set("salaryPeriod", e.target.value as SalaryPeriod)} className={inputCls} disabled={form.salaryNotDisclose}>
                     {SALARY_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className={labelCls}>Minimum Salary</label>
                   <input type="number" value={form.salaryMin} onChange={(e) => set("salaryMin", parseInt(e.target.value) || 0)} className={inputCls} placeholder="e.g. 15000" disabled={form.salaryNotDisclose} />
                 </div>
                 <div>
                   <label className={labelCls}>Maximum Salary</label>
                   <input type="number" value={form.salaryMax} onChange={(e) => set("salaryMax", parseInt(e.target.value) || 0)} className={inputCls} placeholder="e.g. 25000" disabled={form.salaryNotDisclose} />
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" id="salaryNegotiable" checked={form.salaryNegotiable} onChange={(e) => set("salaryNegotiable", e.target.checked)} className="size-4 rounded border-navy-300" disabled={form.salaryNotDisclose} />
                   <label htmlFor="salaryNegotiable" className="text-xs font-extrabold text-navy-900">Salary Negotiable</label>
                 </div>
                 <div className="sm:col-span-2">
                   <label className={labelCls}>Incentives/Bonus</label>
                   <input value={form.incentives} onChange={(e) => set("incentives", e.target.value)} className={inputCls} placeholder="e.g. Performance bonus, Diwali bonus" disabled={form.salaryNotDisclose} />
                 </div>
                 <div className="sm:col-span-2">
                   <label className={labelCls}>Other Benefits</label>
                   <TagInput value={form.benefits} onChange={(v) => set("benefits", v)} placeholder="Select benefits" />
                 </div>
               </div>
             </Section>

            <Section title="Job Description">
              <WordPressStyleEditor
                value={{ html: form.descriptionHtml, title: form.descriptionTitle }}
                onChange={(val) => {
                  set("descriptionHtml", val.html);
                  set("descriptionTitle", val.title);
                }}
                minHeight={400}
              />
            </Section>

            <Section title="Skills">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Required Skills</label>
                  <TagInput value={form.requiredSkills} onChange={(v) => set("requiredSkills", v)} placeholder="e.g. React, Node.js" />
                </div>
                <div>
                  <label className={labelCls}>Preferred Skills</label>
                  <TagInput value={form.preferredSkills} onChange={(v) => set("preferredSkills", v)} placeholder="e.g. AWS, Docker" />
                </div>
                <div>
                  <label className={labelCls}>Technical Skills</label>
                  <TagInput value={form.technicalSkills} onChange={(v) => set("technicalSkills", v)} placeholder="e.g. JavaScript, Python" />
                </div>
                <div>
                  <label className={labelCls}>Soft Skills</label>
                  <TagInput value={form.softSkills} onChange={(v) => set("softSkills", v)} placeholder="e.g. Communication, Leadership" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Languages</label>
                  <TagInput value={form.languages} onChange={(v) => set("languages", v)} placeholder="e.g. English, Hindi" />
                </div>
              </div>
            </Section>

            <Section title="Application Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Apply Method *</label>
                  <select value={form.applyMethod} onChange={(e) => set("applyMethod", e.target.value as ApplyMethod)} className={inputCls}>
                    {APPLY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {form.applyMethod === "Apply on Company Website" && (
                  <div>
                    <label className={labelCls}>External Application URL *</label>
                    <input value={form.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} className={inputCls} placeholder="https://company.com/apply" />
                  </div>
                )}
                {form.applyMethod === "Apply via Email" && (
                  <div>
                    <label className={labelCls}>Application Email *</label>
                    <input type="email" value={form.applicationEmail} onChange={(e) => set("applicationEmail", e.target.value)} className={inputCls} placeholder="careers@company.com" />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Application Deadline</label>
                  <input type="date" value={form.applicationDeadline} onChange={(e) => set("applicationDeadline", e.target.value)} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Application Instructions</label>
                  <textarea value={form.applicationInstructions} onChange={(e) => set("applicationInstructions", e.target.value)} className={`${inputCls} h-24`} placeholder="Instructions for applicants..." />
                </div>
              </div>
            </Section>

            {form.applyMethod === "Walk-in" && (
              <Section title="Walk-in Details" defaultOpen={true}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Walk-in Date</label>
                    <input type="date" value={form.walkInDate} onChange={(e) => set("walkInDate", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Time</label>
                    <input type="time" value={form.walkInStartTime} onChange={(e) => set("walkInStartTime", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Time</label>
                    <input type="time" value={form.walkInEndTime} onChange={(e) => set("walkInEndTime", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Venue</label>
                    <input value={form.walkInVenue} onChange={(e) => set("walkInVenue", e.target.value)} className={inputCls} placeholder="Venue name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Complete Address</label>
                    <textarea value={form.walkInAddress} onChange={(e) => set("walkInAddress", e.target.value)} className={`${inputCls} h-20`} placeholder="Full address..." />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Person</label>
                    <input value={form.walkInContactPerson} onChange={(e) => set("walkInContactPerson", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input value={form.walkInContactNumber} onChange={(e) => set("walkInContactNumber", e.target.value)} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Documents Required</label>
                    <textarea value={form.walkInDocuments} onChange={(e) => set("walkInDocuments", e.target.value)} className={`${inputCls} h-20`} placeholder="Resume, ID proof, etc." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Interview Instructions</label>
                    <textarea value={form.walkInInstructions} onChange={(e) => set("walkInInstructions", e.target.value)} className={`${inputCls} h-20`} placeholder="Instructions..." />
                  </div>
                </div>
              </Section>
            )}

            <Section title="Job Preferences">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Gender Preference</label>
                  <select value={form.genderPreference} onChange={(e) => set("genderPreference", e.target.value)} className={inputCls}>
                    <option value="Any">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Age Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={form.ageFrom} onChange={(e) => set("ageFrom", parseInt(e.target.value) || 18)} className={inputCls} min={18} />
                    <span className="text-sm font-bold text-ink-soft">to</span>
                    <input type="number" value={form.ageTo} onChange={(e) => set("ageTo", parseInt(e.target.value) || 60)} className={inputCls} min={18} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Language Requirement</label>
                  <input value={form.languageRequirement} onChange={(e) => set("languageRequirement", e.target.value)} className={inputCls} placeholder="e.g. English, Hindi" />
                </div>
                <div>
                  <label className={labelCls}>Shift Type</label>
                  <select value={form.shiftType} onChange={(e) => set("shiftType", e.target.value)} className={inputCls}>
                    {SHIFT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Working Hours</label>
                  <input value={form.workingHours} onChange={(e) => set("workingHours", e.target.value)} className={inputCls} placeholder="e.g. 9 AM - 6 PM" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="travelRequired" checked={form.travelRequired} onChange={(e) => set("travelRequired", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="travelRequired" className="text-xs font-extrabold text-navy-900">Travel Required</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="willingToRelocate" checked={form.willingToRelocate} onChange={(e) => set("willingToRelocate", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="willingToRelocate" className="text-xs font-extrabold text-navy-900">Willingness to Relocate</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="drivingLicenseRequired" checked={form.drivingLicenseRequired} onChange={(e) => set("drivingLicenseRequired", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="drivingLicenseRequired" className="text-xs font-extrabold text-navy-900">Driving License Required</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vehicleRequired" checked={form.vehicleRequired} onChange={(e) => set("vehicleRequired", e.target.checked)} className="size-4 rounded border-navy-300" />
                  <label htmlFor="vehicleRequired" className="text-xs font-extrabold text-navy-900">Vehicle Required</label>
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
                  <select value={form.status} onChange={(e) => set("status", e.target.value as JobStatus)} className={inputCls}>
                    {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Visibility</label>
                  <select value={form.visibility} onChange={(e) => set("visibility", e.target.value as Visibility)} className={inputCls}>
                    {VISIBILITIES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Publish Date</label>
                  <input type="date" value={form.publishDate} onChange={(e) => set("publishDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Application Limit</label>
                  <input type="number" value={form.applicationLimit} onChange={(e) => set("applicationLimit", parseInt(e.target.value) || 0)} className={inputCls} placeholder="0 = unlimited" />
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
