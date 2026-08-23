"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-navy-900 text-white shadow-lg shadow-navy-900/30 transition-all duration-300 hover:bg-saffron-600 hover:shadow-xl hover:shadow-saffron-600/20 active:scale-90 cursor-pointer"
      aria-label="Back to top"
      title="ऊपर जाएं"
    >
      <Icon name="arrowUpRight" size={20} strokeWidth={2.4} className="-rotate-90" />
    </button>
  );
}
