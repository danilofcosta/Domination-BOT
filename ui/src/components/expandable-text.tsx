"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function ExpandableText({
  text,
  clamp = 3,
  className,
}: {
  text: string;
  clamp?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (expanded) return;

    const el = ref.current;
    if (!el) return;

    const check = () => {
      el.style.webkitLineClamp = "unset";
      const full = el.scrollHeight;
      el.style.webkitLineClamp = "";
      setOverflowing(full > el.clientHeight);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [expanded, clamp]);

  return (
    <div>
      <p
        ref={ref}
        className={cn(
          "text-muted-foreground text-sm",
          !expanded && "line-clamp-3",
          className,
        )}
      >
        {text}
      </p>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-1 text-xs font-medium underline underline-offset-4 transition-colors"
        >
          {expanded ? "Recolher" : "Expandir"}
        </button>
      )}
    </div>
  );
}
