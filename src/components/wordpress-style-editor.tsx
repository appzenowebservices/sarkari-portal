"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

type EditorValue = {
  html: string;
  title: string;
};

type WordPressStyleEditorProps = {
  value?: EditorValue;
  onChange?: (value: EditorValue) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function WordPressStyleEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 400,
}: WordPressStyleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const initialized = useRef(false);
  const isInternalChange = useRef(false);

  const currentHtml = value?.html || "";
  const currentTitle = value?.title || "";

  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (onChange) {
      onChange({ html: currentHtml, title: newTitle });
    }
  }, [onChange, currentHtml]);

  useLayoutEffect(() => {
    if (!editorRef.current) return;
    if (!initialized.current) {
      editorRef.current.innerHTML = currentHtml || "<p><br/></p>";
      initialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!editorRef.current) return;
    if (sourceMode) {
      setSourceHtml(currentHtml);
    } else if (!isInternalChange.current) {
      editorRef.current.innerHTML = currentHtml || "<p><br/></p>";
    }
    isInternalChange.current = false;
  }, [sourceMode, currentHtml]);

  const emitChange = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    isInternalChange.current = true;
    const html = editorRef.current.innerHTML;
    onChange({ html, title: currentTitle });
  }, [onChange, currentTitle]);

  const exec = useCallback((command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  }, [emitChange]);

  const handleInput = useCallback(() => {
    emitChange();
  }, [emitChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emitChange();
  }, [emitChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
      emitChange();
    }
  }, [emitChange]);

  const toggleSource = useCallback(() => {
    if (!sourceMode) {
      setSourceHtml(currentHtml);
    } else {
      if (onChange) {
        onChange({ html: sourceHtml, title: currentTitle });
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceHtml || "<p><br/></p>";
      }
    }
    setSourceMode((s) => !s);
  }, [sourceMode, currentHtml, sourceHtml, onChange, currentTitle]);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  const insertTable = useCallback(() => {
    const table = `<table style="border-collapse:collapse;width:100%;margin:8px 0;"><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Cell 1</td><td style="border:1px solid #ddd;padding:8px;">Cell 2</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Cell 3</td><td style="border:1px solid #ddd;padding:8px;">Cell 4</td></tr></tbody></table>`;
    document.execCommand("insertHTML", false, table);
    emitChange();
  }, [emitChange]);

  const ToolbarButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className="toolbar-btn" title={title}>
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border-2 border-navy-100 bg-surface">
      <div className="border-b border-navy-100 bg-surface px-4 py-3">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter title..."
          className="w-full bg-transparent font-display text-lg font-bold text-navy-950 outline-none placeholder:text-ink-soft/60"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-navy-100 bg-navy-50/40 px-2 py-2">
        <ToolbarButton onClick={() => exec("bold")} title="Bold">
          <span className="font-extrabold">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} title="Italic">
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("strikeThrough")} title="Strikethrough">
          <span className="line-through">S</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-navy-200" />
        <ToolbarButton onClick={() => exec("formatBlock", "H2")} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "H3")} title="Heading 3">H3</ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "P")} title="Paragraph">P</ToolbarButton>
        <span className="mx-1 h-4 w-px bg-navy-200" />
        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bullet List">
          <span className="text-sm">• List</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Numbered List">
          <span className="text-sm">1. List</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("outdent")} title="Outdent">
          <Icon name="chevronLeft" size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("indent")} title="Indent">
          <Icon name="chevronLeft" size={14} className="rotate-180" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-navy-200" />
        <ToolbarButton onClick={insertLink} title="Insert Link">Link</ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Insert Table">Table</ToolbarButton>
        <ToolbarButton onClick={() => exec("removeFormat")} title="Clear Formatting">Clear</ToolbarButton>
        <span className="mx-1 h-4 w-px bg-navy-200" />
        <ToolbarButton onClick={toggleSource} title="Toggle Source">
          {sourceMode ? "Visual" : "< >"}
        </ToolbarButton>
      </div>

      {sourceMode ? (
        <textarea
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          onBlur={() => {
            if (onChange) {
              onChange({ html: sourceHtml, title: currentTitle });
            }
          }}
          className="min-h-[500px] w-full resize-y bg-paper p-5 font-mono text-xs leading-relaxed text-navy-900 outline-none"
          spellCheck
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="min-h-[500px] max-h-[800px] overflow-y-auto p-5 text-sm leading-relaxed text-ink outline-none"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
