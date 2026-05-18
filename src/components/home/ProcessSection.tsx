"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const principles = [
  {
    index: "01",
    title: "I write the code.",
    body: "No subcontractors, no 'team of vetted freelancers.' When you hire me, I'm the person on the keyboard. You get my thinking on your problem — not a project manager who escalates to someone you've never met.",
  },
  {
    index: "02",
    title: "Working software in weeks.",
    body: "I ship weekly demos. You see progress. No surprise invoices at the end of month three. If it's not working, we know in week two — not week twelve.",
  },
  {
    index: "03",
    title: "If it doesn't move a number, it doesn't ship.",
    body: "Every system I build has a metric attached. Saved hours. Reduced errors. Faster cycle time. If we can't agree on what success looks like before we start, we don't start.",
  },
  {
    index: "04",
    title: "I say no a lot.",
    body: "I take on 6 projects a year. Not 20. I'd rather recommend someone better suited than over-commit and underdeliver. Scarcity isn't marketing — it's how good work actually gets done.",
  },
];

export function ProcessSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="ambient-glow py-24 md:py-32 border-t border-rule">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-3">
            <p className="eyebrow">How I work</p>
          </div>
          <div className="md:col-span-9">
            <h2
              className="text-cream"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              <span className="line-reveal-wrap">
                <span
                  className={`line-reveal-inner ${isInView ? "visible-line" : "hidden-line"}`}
                  style={{ transitionDelay: "0ms" }}
                >
                  Four operating principles.
                </span>
              </span>
              <span className="line-reveal-wrap">
                <span
                  className={`line-reveal-inner ${isInView ? "visible-line" : "hidden-line"}`}
                  style={{ color: "var(--color-muted)", fontStyle: "italic", transitionDelay: "120ms" }}
                >
                  The ones I'd put in writing.
                </span>
              </span>
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {principles.map((p, i) => (
            <motion.div
              key={p.index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative py-8 pl-6 pr-8 border-t border-rule overflow-hidden"
              style={{
                borderRight: i % 2 === 0 ? "1px solid var(--color-rule)" : undefined,
              }}
            >
              {/* Left accent bar */}
              <div className="service-bar" />

              {/* Ghost number watermark */}
              <div
                className="absolute bottom-2 right-4 pointer-events-none select-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "5rem",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "rgba(201,169,97,0.07)",
                  letterSpacing: "-0.05em",
                }}
              >
                {p.index}
              </div>

              <div className="flex items-start gap-4 mb-3">
                <span
                  className="text-xs tabular pt-1 shrink-0 transition-colors duration-300 group-hover:text-accent"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--color-accent)" }}
                >
                  {p.index}
                </span>
                <h3
                  className="text-cream transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {p.title}
                </h3>
              </div>
              <p
                className="ml-8 transition-opacity duration-500 opacity-60 group-hover:opacity-100"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9375rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.7,
                }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
