"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface StatProps {
  value: string;
  caption: string;
}

function parseNumeric(value: string): { prefix: string; num: number; suffix: string } | null {
  const match = value.match(/^([^0-9]*)([0-9][0-9,]*\.?[0-9]*)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[2].replace(/,/g, ""));
  if (isNaN(num)) return null;
  return { prefix: match[1], num, suffix: match[3] };
}

export function Stat({ value, caption }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const parsed = parseNumeric(value);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || !parsed) return;
    const { num } = parsed;
    const duration = 1800;
    const steps = 72;
    let step = 0;
    const inc = num / steps;
    let cur = 0;
    const t = setInterval(() => {
      step++;
      cur = Math.min(cur + inc, num);
      setCount(Math.round(cur));
      if (step >= steps) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  const displayText = parsed
    ? `${parsed.prefix}${count.toLocaleString()}${parsed.suffix}`
    : value;

  return (
    <div ref={ref} className="flex flex-col gap-2 py-8 border-t border-rule">
      <div
        className="tabular text-cream"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          fontWeight: 300,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "var(--color-accent)",
        }}
      >
        {displayText}
      </div>
      <p
        className="text-xs eyebrow"
        style={{ color: "var(--color-muted)" }}
      >
        {caption}
      </p>
    </div>
  );
}

export function StatGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-3 gap-8 my-12">
      {children}
    </div>
  );
}
