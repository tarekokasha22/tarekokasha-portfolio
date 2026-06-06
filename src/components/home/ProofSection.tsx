"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface StatProps {
  value: string;
  caption: string;
  sub: string;
  prefix?: string;
  suffix?: string;
  numericValue?: number;
}

function AnimatedStat({ value, caption, sub, numericValue, prefix = "", suffix = "" }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView || !numericValue) return;

    const duration = 1800;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, numericValue);
      setDisplayValue(Math.round(current));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  const displayText = numericValue
    ? `${prefix}${displayValue.toLocaleString()}${suffix}`
    : value;

  return (
    <div
      ref={ref}
      className="hover-lift flex flex-col gap-3 py-10 border-t border-rule group"
      data-cursor="hover"
    >
      <div
        className="stat-value tabular transition-colors duration-500 group-hover:text-accent"
        style={{ transition: "color 0.5s var(--ease-editorial)" }}
      >
        {displayText}
      </div>
      <p
        className="text-xs eyebrow"
        style={{ color: "var(--color-accent)" }}
      >
        {caption}
      </p>
      <p
        className="text-sm"
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)", maxWidth: "28ch" }}
      >
        {sub}
      </p>
    </div>
  );
}

export function ProofSection() {
  const stats: StatProps[] = [
    {
      value: "70+",
      numericValue: 70,
      suffix: "+",
      caption: "Automations shipped",
      sub: "AI workflows across enterprise operations teams, running daily without a babysitter.",
    },
    {
      value: "40h",
      numericValue: 40,
      suffix: "h",
      caption: "Weekly hours recovered",
      sub: "Manual work removed from operations teams — every week, permanently.",
    },
    {
      value: "5",
      numericValue: 5,
      caption: "Systems in production",
      sub: "From AI photography studios to construction ERPs to autonomous robotics. Each one shipped and running.",
    },
  ];

  return (
    <section className="py-8">
      <div className="container">
        <div className="grid sm:grid-cols-3 gap-0 sm:gap-8">
          {stats.map((stat) => (
            <AnimatedStat key={stat.caption} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
