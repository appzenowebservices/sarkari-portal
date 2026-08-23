"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * External link that fires a beacon to /api/click before opening
 * the target government site in a new tab.
 */
export function TrackLink({
  serviceId,
  href,
  className,
  children,
  title,
}: {
  serviceId: string;
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  const track = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      const payload = JSON.stringify({ serviceId });
      if ("sendBeacon" in navigator) {
        navigator.sendBeacon(
          "/api/click",
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch("/api/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* never block navigation for analytics */
    }
    // anchor's default target=_blank still fires
    void e;
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      className={className}
      title={title}
    >
      {children}
    </a>
  );
}
