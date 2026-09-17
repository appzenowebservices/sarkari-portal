"use client";

import type { MouseEvent, ReactNode } from "react";
import { api } from "@/trpc/react";

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
  const trackClick = api.catalog.trackClick.useMutation();

  const track = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      trackClick.mutate({ serviceId });
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
