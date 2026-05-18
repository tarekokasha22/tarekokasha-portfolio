"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const services = [
  {
    number: "01",
    title: "AI systems with teeth",
    description:
      "Working LLM integrations, agents, retrieval pipelines, and evaluations — built like real software, with tests and observability. Not a demo. Not a prototype. Something that runs in production without you watching it.",
    tags: ["Claude", "OpenAI", "n8n", "LangChain"],
  },
  {
    number: "02",
    title: "Custom internal software",
    description:
      "The tools your team needs but no SaaS vendor sells: ops dashboards, lead pipelines, custom CRMs, workflow engines. Built for the exact shape of your business. Yours to own, not subscribe to forever.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
  },
  {
    number: "03",
    title: "Automations that don't break",
    description:
      "The boring AI work — and the most impactful. Replacing manual spreadsheets, data plumbing, and ops handoffs with code that runs quietly and reliably. If it needs a human to click a button every Monday, I built it wrong.",
    tags: ["Zapier", "n8n", "GHL", "Resend"],
  },
];

export function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-rule">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-3">
            <p className="eyebrow">What I build</p>
          </div>
          <div className="md:col-span-9">
            {/* Clip-text headline reveal */}
            <h2
              className="text-cream max-w-lg"
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
                  Three things, done properly.
                </span>
              </span>
              <span className="line-reveal-wrap">
                <span
                  className={`line-reveal-inner ${isInView ? "visible-line" : "hidden-line"}`}
                  style={{ color: "var(--color-muted)", fontStyle: "italic", transitionDelay: "120ms" }}
                >
                  Not twelve things, done adequately.
                </span>
              </span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col">
          {services.map((service, i) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative grid md:grid-cols-12 gap-6 py-10 border-t border-rule cursor-default pl-4 md:pl-6"
            >
              {/* Left accent bar — grows down on hover */}
              <div className="service-bar" aria-hidden="true" />

              {/* Number */}
              <div className="md:col-span-1 flex items-start">
                <span
                  className="text-xs tabular transition-all duration-400 group-hover:scale-110"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-accent)",
                    display: "inline-block",
                    transformOrigin: "left center",
                    transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
                  }}
                >
                  {service.number}
                </span>
              </div>

              {/* Title */}
              <div className="md:col-span-4">
                <h3
                  className="text-cream transition-colors duration-500 group-hover:text-accent"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {service.title}
                </h3>
              </div>

              {/* Description — more opaque on hover */}
              <div className="md:col-span-5">
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9375rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.7,
                    opacity: 0.75,
                    transition: "opacity 0.4s ease",
                  }}
                  className="group-hover:opacity-100"
                >
                  {service.description}
                </p>
              </div>

              {/* Tags */}
              <div className="md:col-span-2 flex flex-wrap gap-2 items-start">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 transition-colors duration-300 group-hover:border-accent/30"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-muted)",
                      border: "1px solid var(--color-rule)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
