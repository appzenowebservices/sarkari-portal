"use client";

import { useState } from "react";
import { Bi } from "@/components/bi";
import { Icon } from "@/components/icons";
import { inputCls, DeleteButton } from "@/components/admin/ui";

export type NewsletterBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "button"
  | "link"
  | "list"
  | "divider"
  | "job_card"
  | "scheme_card"
  | "result_card"
  | "important_update"
  | "custom_html";

export type NewsletterBlock = {
  id: string;
  type: NewsletterBlockType;
  data: Record<string, unknown>;
  order: number;
};

const BLOCK_OPTIONS: { type: NewsletterBlockType; label: { hi: string; en: string }; icon: string }[] = [
  { type: "heading", label: { hi: "हीडिंग", en: "Heading" }, icon: "fileText" },
  { type: "paragraph", label: { hi: "पैराग्राफ", en: "Paragraph" }, icon: "fileText" },
  { type: "image", label: { hi: "इमेज", en: "Image" }, icon: "eye" },
  { type: "button", label: { hi: "बटन", en: "Button" }, icon: "external" },
  { type: "link", label: { hi: "लिंक", en: "Link" }, icon: "link" },
  { type: "list", label: { hi: "लिस्ट", en: "List" }, icon: "dots" },
  { type: "divider", label: { hi: "डिवाइडर", en: "Divider" }, icon: "download" },
  { type: "job_card", label: { hi: "नौकरी कार्ड", en: "Job Card" }, icon: "briefcase" },
  { type: "scheme_card", label: { hi: "स्कीम कार्ड", en: "Scheme Card" }, icon: "gift" },
  { type: "result_card", label: { hi: "रिजल्ट कार्ड", en: "Result Card" }, icon: "chart" },
  { type: "important_update", label: { hi: "महत्वपूर्ण अपडेट", en: "Important Update" }, icon: "alert" },
  { type: "custom_html", label: { hi: "कस्टम HTML", en: "Custom HTML" }, icon: "fileText" },
];

function BlockEditor({ block, onChange }: {
  block: NewsletterBlock;
  onChange: (block: NewsletterBlock) => void;
}) {
  const d = block.data;

  const setField = (key: string, value: unknown) => {
    onChange({ ...block, data: { ...block.data, [key]: value } });
  };

  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="हीडिंग टेक्स्ट"
            value={String(d.hi || d.text || "")}
            onChange={(e) => { setField("hi", e.target.value); setField("text", e.target.value); }}
          />
          <input
            className={inputCls}
            placeholder="Heading text (English)"
            value={String(d.en || d.text || "")}
            onChange={(e) => { setField("en", e.target.value); setField("text", e.target.value); }}
          />
          <select
            value={String(d.size || "22")}
            onChange={(e) => setField("size", e.target.value)}
            className={inputCls}
          >
            <option value="18">Small (18px)</option>
            <option value="22">Medium (22px)</option>
            <option value="26">Large (26px)</option>
            <option value="32">XL (32px)</option>
          </select>
          <input
            className={inputCls}
            placeholder="Text color (e.g. #122546)"
            value={String(d.color || "")}
            onChange={(e) => setField("color", e.target.value)}
          />
        </div>
      );

    case "paragraph":
      return (
        <div className="space-y-3">
          <textarea
            className={inputCls}
            rows={4}
            placeholder="पैराग्राफ का टेक्स्ट..."
            value={String(d.hi || d.text || "")}
            onChange={(e) => { setField("hi", e.target.value); setField("text", e.target.value); }}
          />
          <textarea
            className={inputCls}
            rows={4}
            placeholder="Paragraph text (English)"
            value={String(d.en || d.text || "")}
            onChange={(e) => setField("en", e.target.value)}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="Image URL"
            value={String(d.url || d.src || "")}
            onChange={(e) => setField("url", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Alt text"
            value={String(d.alt || "")}
            onChange={(e) => setField("alt", e.target.value)}
          />
          <select
            value={String(d.align || "center")}
            onChange={(e) => setField("align", e.target.value)}
            className={inputCls}
          >
            <option value="left">बाएं</option>
            <option value="center">केंद्र</option>
            <option value="right">दाएं</option>
          </select>
        </div>
      );

    case "button":
      return (
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="बटन टेक्स्ट"
            value={String(d.text || d.hi || "")}
            onChange={(e) => { setField("text", e.target.value); setField("hi", e.target.value); }}
          />
          <input
            className={inputCls}
            placeholder="Button text (English)"
            value={String(d.en || "")}
            onChange={(e) => setField("en", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Button URL"
            value={String(d.url || "")}
            onChange={(e) => setField("url", e.target.value)}
          />
          <select
            value={String(d.style || "primary")}
            onChange={(e) => setField("style", e.target.value)}
            className={inputCls}
          >
            <option value="primary">Primary (Navy)</option>
            <option value="secondary">Secondary (Saffron)</option>
          </select>
        </div>
      );

    case "link":
      return (
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="लिंक टेक्स्ट"
            value={String(d.text || d.hi || "")}
            onChange={(e) => { setField("text", e.target.value); setField("hi", e.target.value); }}
          />
          <input
            className={inputCls}
            placeholder="Link URL"
            value={String(d.url || "")}
            onChange={(e) => setField("url", e.target.value)}
          />
        </div>
      );

    case "list":
      return (
        <div className="space-y-3">
          <textarea
            className={inputCls}
            rows={5}
            placeholder="Enter items, one per line"
            value={Array.isArray(d.items) ? (d.items as string[]).join("\n") : String(d.text || "")}
            onChange={(e) => setField("items", e.target.value.split("\n").filter(Boolean))}
          />
        </div>
      );

    case "job_card":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputCls} placeholder="नौकरी का शीर्षक" value={String(d.titleHi || d.title || "")} onChange={(e) => { setField("titleHi", e.target.value); setField("title", e.target.value); }} />
          <input className={inputCls} placeholder="Title (English)" value={String(d.titleEn || d.title || "")} onChange={(e) => setField("titleEn", e.target.value)} />
          <input className={inputCls} placeholder="Organization" value={String(d.org || "")} onChange={(e) => setField("org", e.target.value)} />
          <input className={inputCls} placeholder="Last Date" value={String(d.lastDate || "")} onChange={(e) => setField("lastDate", e.target.value)} />
          <input className={inputCls} placeholder="Vacancies" value={String(d.vacancies || "")} onChange={(e) => setField("vacancies", e.target.value)} />
          <input className={inputCls} placeholder="Job URL" value={String(d.url || "")} onChange={(e) => setField("url", e.target.value)} />
        </div>
      );

    case "scheme_card":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputCls} placeholder="योजना शीर्षक" value={String(d.titleHi || d.title || "")} onChange={(e) => { setField("titleHi", e.target.value); setField("title", e.target.value); }} />
          <input className={inputCls} placeholder="Scheme Title (English)" value={String(d.titleEn || "")} onChange={(e) => setField("titleEn", e.target.value)} />
          <input className={inputCls} placeholder="Description" value={String(d.desc || "")} onChange={(e) => setField("desc", e.target.value)} />
          <input className={inputCls} placeholder="Scheme URL" value={String(d.url || "")} onChange={(e) => setField("url", e.target.value)} />
        </div>
      );

    case "result_card":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputCls} placeholder="रिजल्ट शीर्षक" value={String(d.titleHi || d.title || "")} onChange={(e) => { setField("titleHi", e.target.value); setField("title", e.target.value); }} />
          <input className={inputCls} placeholder="Result Title (English)" value={String(d.titleEn || "")} onChange={(e) => setField("titleEn", e.target.value)} />
          <input className={inputCls} placeholder="Organization" value={String(d.org || "")} onChange={(e) => setField("org", e.target.value)} />
          <input className={inputCls} placeholder="Result Date" value={String(d.resultDate || "")} onChange={(e) => setField("resultDate", e.target.value)} />
          <input className={inputCls} placeholder="Result URL" value={String(d.url || "")} onChange={(e) => setField("url", e.target.value)} />
        </div>
      );

    case "important_update":
      return (
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="Update Title"
            value={String(d.title || "")}
            onChange={(e) => setField("title", e.target.value)}
          />
          <textarea
            className={inputCls}
            rows={4}
            placeholder="Update description..."
            value={String(d.text || d.hi || "")}
            onChange={(e) => { setField("text", e.target.value); setField("hi", e.target.value); }}
          />
        </div>
      );

    case "custom_html":
      return (
        <div className="space-y-3">
          <textarea
            className={inputCls}
            rows={8}
            placeholder="<div>Your custom HTML here</div>"
            value={String(d.html || "")}
            onChange={(e) => setField("html", e.target.value)}
          />
        </div>
      );

    case "divider":
    default:
      return (
        <div className="py-4 text-center text-sm text-ink-soft">
          <span className="inline-block h-px w-12 bg-navy-300"></span>
          <span className="mx-2 text-xs">Divider</span>
          <span className="inline-block h-px w-12 bg-navy-300"></span>
        </div>
      );
  }
}

export default function NewsletterBlockEditor({
  blocks,
  onChange,
}: {
  blocks: NewsletterBlock[];
  onChange: (blocks: NewsletterBlock[]) => void;
}) {
  const addBlock = (type: NewsletterBlockType) => {
    const newBlock: NewsletterBlock = {
      id: crypto.randomUUID(),
      type,
      data: {},
      order: blocks.length,
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, block: NewsletterBlock) => {
    onChange(blocks.map((b) => (b.id === id ? block : b)));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, dir: "up" | "down") => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(idx, 1);
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= newBlocks.length) return;
    newBlocks.splice(newIdx, 0, removed);
    onChange(newBlocks);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 pb-2">
        {BLOCK_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => addBlock(opt.type)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-surface px-2.5 py-1.5 text-[12px] font-bold text-navy-800 transition-all hover:border-saffron-500 hover:bg-saffron-50 cursor-pointer"
            title={opt.label.en}
          >
            <Icon name={opt.icon} size={12} />
            <Bi hi={opt.label.hi} en={opt.label.en} />
          </button>
        ))}
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/30 p-8 text-center">
          <Icon name="plus" size={32} className="mx-auto text-navy-300" />
          <p className="mt-2 text-sm font-bold text-ink-soft">
            कोई कंटेंट ब्लॉक नहीं है। ऊपर से एक जोड़ें।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, i) => (
            <div
              key={block.id}
              className="rounded-xl border border-navy-200 bg-surface p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={block.type}
                    onChange={(e) => updateBlock(block.id, { ...block, type: e.target.value as NewsletterBlockType })}
                    className="rounded-lg border-2 border-navy-100 bg-paper px-2.5 py-1 text-xs font-bold text-navy-900 outline-none focus:border-saffron-500 cursor-pointer"
                  >
                    {BLOCK_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        <Bi hi={opt.label.hi} en={opt.label.en} />
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-ink-soft">Block {i + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={i === 0}
                    className="grid size-7 place-items-center rounded-lg border border-navy-200 text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer"
                    title="Move up"
                  >
                    <Icon name="chevronUp" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={i === blocks.length - 1}
                    className="grid size-7 place-items-center rounded-lg border border-navy-200 text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-40 cursor-pointer"
                    title="Move down"
                  >
                    <Icon name="chevronDown" size={14} />
                  </button>
                  <DeleteButton onConfirm={() => removeBlock(block.id)} />
                </div>
              </div>

              <BlockEditor block={block} onChange={(b) => updateBlock(block.id, b)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
