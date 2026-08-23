"use client";

import Link from "next/link";
import { Bi } from "@/components/bi";
import { colorOf, Icon } from "@/components/icons";
import type { Job } from "@/db/schema";

export function JobCard({
  job,
  showCategory = true,
}: {
  job: Job;
  showCategory?: boolean;
}) {
  const color = colorOf("navy");

  const lastDate = job.applicationLastDate ? new Date(job.applicationLastDate) : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const last = lastDate ? new Date(lastDate) : null;
  if (last) last.setHours(0, 0, 0, 0);
  const diffMs = last ? last.getTime() - now.getTime() : 0;
  const daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

  const category = (job as any).isGovernment !== false ? "government" : "private";
  const cmeta = category === "private"
    ? { badge: "bg-sky-100 text-sky-800", icon: "briefcase", label: "प्राइवेट", labelEn: "Private" }
    : { badge: "bg-leaf-100 text-leaf-800", icon: "building", label: "सरकारी", labelEn: "Government" };

  return (
    <div className="group overflow-hidden rounded-2xl border border-navy-100 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${cmeta.badge}`}>
              <Icon name={cmeta.icon} size={11} />
              <Bi hi={cmeta.label} en={cmeta.labelEn} />
            </span>
            {job.isFeatured && (
              <span className="grid size-5 place-items-center rounded-md bg-saffron-100 text-saffron-700" title="Featured">
                <Icon name="star" size={11} strokeWidth={2.4} />
              </span>
            )}
            {job.isUrgent && (
              <span className="grid size-5 place-items-center rounded-md bg-rose-100 text-rose-700" title="Urgent">
                <Icon name="alert" size={11} strokeWidth={2.4} />
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg font-extrabold leading-snug text-navy-950 transition-colors group-hover:text-navy-700 sm:text-xl">
            <Link href={`/jobs/${job.slug}`}><Bi hi={job.titleHi} en={job.titleEn} /></Link>
          </h3>
          {(job.organizationNameHi || job.organizationNameEn) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink-soft">
              <Icon name="building" size={14} className="text-navy-400" />
              <Bi hi={job.organizationNameHi} en={job.organizationNameEn} />
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Fact icon="users" label={<Bi hi="रिक्तियां" en="Vacancies" />} value={job.totalVacancies > 0 ? job.totalVacancies.toLocaleString("en-IN") : "—"} />
            <Fact icon="fileText" label={<Bi hi="योग्यता" en="Qualification" />} value={job.minimumQualification || "—"} />
            <Fact icon="clock" label={<Bi hi="आयु सीमा" en="Age Limit" />} value={
              job.minimumAge && job.maximumAge ? `${job.minimumAge}-${job.maximumAge} yrs` :
              job.minimumAge ? `${job.minimumAge}+ yrs` :
              job.maximumAge ? `Upto ${job.maximumAge} yrs` : "—"
            } />
            <Fact icon="globe" label={<Bi hi="स्थान" en="Location" />} value={
              Array.isArray(job.locationNames) && job.locationNames.length > 0 ? job.locationNames.join(", ") : "—"
            } />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-paper px-3.5 py-2.5 text-[13px] font-bold">
            {(job as any).applicationStartDate && (
              <span className="flex items-center gap-1.5 text-ink-soft">
                <Icon name="calendar" size={14} className="text-navy-400" />
                <Bi hi="शुरू" en="Start" />:{" "}
                <span className="text-navy-900 tnum">
                  {new Date((job as any).applicationStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </span>
            )}
            {job.applicationLastDate && (
              <span className={`flex items-center gap-1.5 ${daysRemaining <= 7 ? "text-rose-700" : "text-ink-soft"}`}>
                <Icon name="alert" size={14} className={daysRemaining <= 7 ? "text-rose-500" : "text-navy-400"} />
                <Bi hi="अंतिम तिथि" en="Last date" />:{" "}
                <span className={`tnum ${daysRemaining <= 7 ? "font-extrabold text-rose-700" : "text-navy-900"}`}>
                  {lastDate!.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {daysRemaining > 0 && daysRemaining <= 7 && (
                  <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-700 tnum">
                    {daysRemaining} <Bi hi="दिन शेष" en="days left" />
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 border-t border-navy-100 bg-navy-50/40 p-4 lg:w-52 lg:flex-col lg:justify-center lg:border-l lg:border-t-0">
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-navy-800 active:scale-95"
          >
            <Icon name="eye" size={15} />
            <Bi hi="पूरी जानकारी" en="Details" />
          </Link>
          {(job as any).applyUrl && daysRemaining > 0 && (
            <a
              href={(job as any).applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-all hover:bg-saffron-400 active:scale-95"
            >
              <Icon name="external" size={15} />
              <Bi hi="आवेदन करें" en="Apply Now" />
            </a>
          )}
          {(job as any).notificationUrl && (
            <a
              href={(job as any).notificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-surface px-4 py-2.5 text-sm font-bold text-navy-800 transition-all hover:bg-navy-50"
            >
              <Icon name="fileText" size={15} />
              <Bi hi="नोटिफिकेशन" en="Notification" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: string; label: React.ReactNode; value: string }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-surface px-2.5 py-2">
      <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
        <Icon name={icon} size={11} className="text-navy-400" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-extrabold text-navy-900" title={value}>{value}</p>
    </div>
  );
}
