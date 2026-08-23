import type { ReactNode } from "react";
import { Bi } from "@/components/bi";

type Block = {
  id: string;
  type: string;
  data: Record<string, any>;
  order: number;
};

type Props = {
  blocks: Block[];
};

const LABELS: Record<string, { hi: string; en: string }> = {
  "important-dates": { hi: "महत्वपूर्ण तिथियां", en: "Important Dates" },
  "vacancy-details": { hi: "पदवार विवरण", en: "Vacancy Details" },
  eligibility: { hi: "पात्रता", en: "Eligibility" },
  "age-limit": { hi: "आयु सीमा", en: "Age Limit" },
  "application-fee": { hi: "आवेदन शुल्क", en: "Application Fee" },
  salary: { hi: "वेतनमान", en: "Salary" },
  "selection-process": { hi: "चयन प्रक्रिया", en: "Selection Process" },
  "how-to-apply": { hi: "आवेदन कैसे करें", en: "How to Apply" },
  "documents-required": { hi: "आवश्यक दस्तावेज", en: "Documents Required" },
  "important-links": { hi: "आधिकारिक लिंक", en: "Official Links" },
  faq: { hi: "अक्सर पूछे जाने वाले प्रश्न", en: "FAQ" },
  notice: { hi: "सूचना", en: "Notice" },
};

function Section({ children, label }: { children: ReactNode; label: { hi: string; en: string } }) {
  return (
    <section className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
      <h2 className="mb-3 font-display text-lg font-bold text-navy-950">
        <Bi hi={label.hi} en={label.en} />
      </h2>
      {children}
    </section>
  );
}

export function JobBlockRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="mt-8 space-y-8">
      {sorted.map((block) => {
        const { type, data } = block;
        const label = LABELS[type];

        switch (type) {
          case "heading": {
            const text = data.text || data.hi || data.en || "";
            if (!text) return null;
            const level = Math.min(6, Math.max(1, data.level || 2));
            const sizes = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"];
            return (
              <div className={`font-display font-bold text-navy-950 ${sizes[level - 1]}`}>
                <Bi hi={data.hi || text} en={data.en || text} />
              </div>
            );
          }

          case "paragraph": {
            const text = data.text || data.hi || data.en || "";
            if (!text) return null;
            return (
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                <Bi hi={data.hi || text} en={data.en || text} />
              </p>
            );
          }

          case "bullet-list": {
            const items = Array.isArray(data.items) ? data.items : [];
            if (!items.length) return null;
            return (
              <ul className="space-y-2">
                {items.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-navy-400" />
                    <span className="font-semibold text-ink">
                      <Bi hi={item.hi || item.text} en={item.en || item.text} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          }

          case "numbered-list": {
            const items = Array.isArray(data.items) ? data.items : [];
            if (!items.length) return null;
            return (
              <ol className="space-y-2">
                {items.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-saffron-100 text-xs font-extrabold text-saffron-800">
                      {i + 1}
                    </span>
                    <span className="text-sm font-extrabold text-ink">
                      <Bi hi={item.hi || item.text} en={item.en || item.text} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          }

          case "table": {
            const rows = Array.isArray(data.rows) ? data.rows : [];
            const headers = Array.isArray(data.headers) ? data.headers : [];
            if (!rows.length && !headers.length) return null;
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  {headers.length > 0 && (
                    <thead>
                      <tr className="border-b border-navy-100">
                        {headers.map((h: string, i: number) => (
                          <th key={i} className="pb-2 pr-4 text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-navy-50">
                    {rows.map((row: string[], i: number) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="py-2.5 pr-4 font-semibold text-ink">
                            {j === 0 ? <Bi hi={cell} en={cell} /> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "important-dates":
          case "vacancy-details":
          case "eligibility":
          case "age-limit":
          case "application-fee":
          case "salary":
          case "selection-process":
          case "how-to-apply":
          case "documents-required":
          case "important-links":
          case "faq":
          case "notice":
            return <Section key={block.id} label={label}>{renderBlockData(type, data)}</Section>;

          case "quote":
            return (
              <blockquote className="border-l-4 border-saffron-400 pl-4 italic text-ink">
                <Bi hi={data.hi || data.text} en={data.en || data.text} />
              </blockquote>
            );

          case "divider":
            return <hr key={block.id} className="border-navy-100" />;

          case "spacer":
            return <div key={block.id} style={{ height: data.height || 24 }} />;

          case "image":
            return data.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={block.id} src={data.src} alt={data.alt || ""} className="rounded-xl border border-navy-100" />
            ) : null;

          case "video":
            return data.src ? (
              <div key={block.id} className="aspect-video">
                <iframe src={data.src} className="h-full w-full rounded-xl border border-navy-100" allowFullScreen />
              </div>
            ) : null;

          default:
            return null;
        }
      })}
    </div>
  );
}

function renderBlockData(type: string, data: Record<string, any>): ReactNode {
  switch (type) {
    case "important-dates": {
      const dates = Array.isArray(data.dates) ? data.dates : [];
      if (!dates.length) return <p className="text-sm text-ink-soft">No dates specified.</p>;
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {dates.map((d: any, i: number) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2">
              <span className="text-sm font-semibold text-ink">
                <Bi hi={d.eventHi || d.event} en={d.eventEn || d.event} />
              </span>
              <span className="tnum text-sm font-extrabold text-navy-800">
                {d.date ? new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "vacancy-details": {
      const rows = Array.isArray(data.rows) ? data.rows : [];
      if (!rows.length) return <p className="text-sm text-ink-soft">No vacancy details.</p>;
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100">
                <th className="pb-2 pr-4 text-xs font-extrabold uppercase tracking-wider text-ink-soft">Post</th>
                <th className="pb-2 pr-4 text-xs font-extrabold uppercase tracking-wider text-ink-soft">Vacancies</th>
                <th className="pb-2 text-xs font-extrabold uppercase tracking-wider text-ink-soft">Pay Scale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rows.map((row: any, i: number) => (
                <tr key={i}>
                  <td className="py-2.5 pr-4 font-semibold text-ink">
                    <Bi hi={row.postHi || row.post} en={row.postEn || row.post} />
                  </td>
                  <td className="py-2.5 pr-4 tnum font-extrabold text-navy-800">{row.vacancies ?? "—"}</td>
                  <td className="py-2.5 text-ink-soft">{row.payScale || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "eligibility": {
      const items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) return <p className="text-sm text-ink-soft">No eligibility criteria.</p>;
      return (
        <ul className="space-y-2">
          {items.map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={`size-2 rounded-full ${item.required ? "bg-leaf-500" : "bg-navy-300"}`} />
              <span className="font-semibold text-ink">
                <Bi hi={item.hi || item.text} en={item.en || item.text} />
              </span>
              {item.required && <span className="text-[11px] font-bold text-rose-600">(जरूरी)</span>}
            </li>
          ))}
        </ul>
      );
    }

    case "age-limit": {
      const min = data.minimum;
      const max = data.maximum;
      const relaxations = Array.isArray(data.relaxations) ? data.relaxations : [];
      return (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Minimum Age</p>
              <p className="mt-1 text-sm font-extrabold text-navy-900">{min || "—"} yrs</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Maximum Age</p>
              <p className="mt-1 text-sm font-extrabold text-navy-900">{max || "—"} yrs</p>
            </div>
          </div>
          {relaxations.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Age Relaxation</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {relaxations.map((r: any, i: number) => (
                  <div key={i} className="rounded-lg bg-navy-50 px-3 py-2">
                    <p className="text-xs font-bold text-ink-soft">{r.category}</p>
                    <p className="text-sm font-extrabold text-navy-900">{r.years} yrs</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "application-fee": {
      const fees = Array.isArray(data.fees) ? data.fees : [];
      const exemption = data.exemption;
      return (
        <div>
          {fees.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-100">
                    <th className="pb-2 pr-4 text-xs font-extrabold uppercase tracking-wider text-ink-soft">Category</th>
                    <th className="pb-2 text-xs font-extrabold uppercase tracking-wider text-ink-soft">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {fees.map((f: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 font-semibold text-ink">
                        <Bi hi={f.categoryHi || f.category} en={f.categoryEn || f.category} />
                      </td>
                      <td className="py-2.5 tnum font-extrabold text-navy-800">₹{f.amount?.toLocaleString("en-IN") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {exemption && <p className="mt-2 text-xs font-bold text-leaf-700">Fee exemption available</p>}
        </div>
      );
    }

    case "salary": {
      if (data.notDisclose) {
        return <p className="text-sm font-extrabold text-navy-900"><Bi hi="वेतन गोपनीय" en="Salary Not Disclosed" /></p>;
      }
      const text = data.text || data.hi || data.en || "";
      if (!text) return <p className="text-sm text-ink-soft">Salary not specified.</p>;
      return <p className="whitespace-pre-line text-sm leading-relaxed text-ink"><Bi hi={data.hi || text} en={data.en || text} /></p>;
    }

    case "selection-process": {
      const steps = Array.isArray(data.steps) ? data.steps : [];
      if (!steps.length) return <p className="text-sm text-ink-soft">No selection process details.</p>;
      return (
        <ol className="space-y-2">
          {steps.map((s: any, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-saffron-100 text-xs font-extrabold text-saffron-800">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink">
                  <Bi hi={s.hi || s.text} en={s.en || s.text} />
                </p>
                {s.description && <p className="text-xs text-ink-soft">{s.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      );
    }

    case "how-to-apply":
    case "documents-required":
    case "important-instructions": {
      const text = data.text || data.hi || data.en || "";
      if (!text) return <p className="text-sm text-ink-soft">Not specified.</p>;
      return <div className="whitespace-pre-line text-sm leading-relaxed text-ink"><Bi hi={data.hi || text} en={data.en || text} /></div>;
    }

    case "important-links": {
      const links = Array.isArray(data.links) ? data.links : [];
      if (!links.length) return <p className="text-sm text-ink-soft">No links.</p>;
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {links
            .filter((l: any) => l.isActive !== false)
            .map((link: any, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-navy-100 bg-paper px-4 py-3 transition-colors hover:border-saffron-300 hover:bg-saffron-50"
              >
                <span className="text-sm font-extrabold text-navy-900">
                  <Bi hi={link.hi || link.text || link.title} en={link.en || link.text || link.title} />
                </span>
                <span className="text-xs font-bold text-navy-400">{link.type || "Link"}</span>
              </a>
            ))}
        </div>
      );
    }

    case "faq": {
      const items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) return <p className="text-sm text-ink-soft">No FAQs.</p>;
      return (
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="rounded-lg bg-navy-50 p-4">
              <p className="text-sm font-extrabold text-navy-900">
                <Bi hi={item.questionHi || item.question} en={item.questionEn || item.question} />
              </p>
              <p className="mt-1 text-sm text-ink">
                <Bi hi={item.answerHi || item.answer} en={item.answerEn || item.answer} />
              </p>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
