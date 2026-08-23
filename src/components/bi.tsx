import type { ReactNode } from "react";

/**
 * Bilingual text — renders both languages; CSS toggles visibility
 * based on <html data-lang="hi|en">, so no client re-render is needed.
 */
export function Bi({
  hi,
  en,
  className,
}: {
  hi: ReactNode;
  en?: ReactNode;
  className?: string;
}) {
  return (
    <>
      <span className={`lang-hi ${className ?? ""}`}>{hi}</span>
      <span className={`lang-en ${className ?? ""}`}>{en ?? hi}</span>
    </>
  );
}
