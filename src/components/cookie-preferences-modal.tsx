"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

interface Category {
  code: string;
  name: string;
  required: boolean;
  defaultEnabled: boolean;
}

interface CookiePreferencesModalProps {
  categories: Category[];
  policyUrl: string;
  privacyPolicyUrl: string;
  onClose: () => void;
  onSave: (preferences: Record<string, boolean>, status: string) => void;
}

export function CookiePreferencesModal({ categories, policyUrl, privacyPolicyUrl, onClose, onSave }: CookiePreferencesModalProps) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const c of categories) {
      initial[c.code] = c.defaultEnabled;
    }
    return initial;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="font-display text-lg font-bold text-navy-950">Cookie Preferences</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 cursor-pointer"
            aria-label="Close"
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-5">
          <p className="text-sm text-ink-soft">
            Manage your cookie preferences below. Strictly necessary cookies are always enabled as they are essential for the website to function properly.
          </p>

          {categories.map((cat) => (
            <div key={cat.code} className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 bg-paper p-4">
              <div className="flex-1">
                <p className="text-sm font-extrabold text-navy-900">{cat.name}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {cat.required
                    ? "Required for essential website functionality."
                    : "Optional cookies that help us improve your experience."}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={prefs[cat.code] || false}
                  disabled={cat.required}
                  onChange={(e) => setPrefs({ ...prefs, [cat.code]: e.target.checked })}
                  className="h-5 w-9 appearance-none rounded-full bg-navy-200 transition-colors duration-200 checked:bg-leaf-500 disabled:opacity-50"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
                  <span className={`size-3.5 rounded-full bg-white shadow transition-transform duration-200 ${prefs[cat.code] ? "translate-x-4" : "translate-x-0"}`} />
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-100 px-5 py-4">
          <div className="text-xs text-ink-soft">
            <a href={policyUrl} className="font-bold text-saffron-600 underline">Cookie Policy</a>
            {" • "}
            <a href={privacyPolicyUrl} className="font-bold text-saffron-600 underline">Privacy Policy</a>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSave(prefs, "CUSTOMIZED")}
              className="rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-leaf-500 active:scale-95 cursor-pointer"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={() => onSave(prefs, "ACCEPTED_ALL")}
              className="rounded-xl bg-saffron-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 shadow-sm transition-all hover:bg-saffron-400 active:scale-95 cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
