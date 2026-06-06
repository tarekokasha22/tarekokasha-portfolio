"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Reticle } from "@/components/ui/Reticle";

const services = [
  {
    number: "01",
    title: "AI systems & automations",
    description:
      "Working LLM integrations, agents, retrieval pipelines, and evaluations — built like real software, with tests and observability. Plus the boring, high-impact automation work: manual spreadsheets, data plumbing, and ops handoffs replaced with code that runs quietly. Not demos. Things that run in production without you watching them.",
    tags: ["Claude", "OpenAI", "n8n", "LangChain", "Zapier"],
  },
  {
    number: "02",
    title: "Custom internal software",
    description:
      "The tools your team needs but no SaaS vendor sells: ops dashboards, lead pipelines, custom CRMs, workflow engines. Built for the exact shape of your business. Yours to own, not subscribe to forever.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
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

        {/* ── Robotics highlight — the engineering underneath ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="robotics-panel relative mt-16 grid md:grid-cols-12 gap-8 md:gap-10 items-center p-8 md:p-12 overflow-hidden"
        >
          {/* Animated reticle */}
          <div className="md:col-span-3 flex justify-center md:justify-start">
            <Reticle active={isInView} />
          </div>

          {/* Copy */}
          <div className="md:col-span-9">
            <div className="flex items-center gap-4 mb-4">
              <span
                className="text-xs tabular"
                style={{ fontFamily: "var(--font-sans)", color: "var(--color-accent)" }}
              >
                03
              </span>
              <p className="eyebrow" style={{ color: "var(--color-accent)" }}>
                The engineering underneath
              </p>
            </div>
            <h3
              className="text-cream mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Robotics &amp; computer vision.
            </h3>
            <p
              className="max-w-2xl mb-6"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9375rem",
                color: "var(--color-muted)",
                lineHeight: 1.75,
              }}
            >
              Before the software, the hardware. I built the USS UR5e — a 6-axis
              robotic arm that picks, sorts, and places objects autonomously with
              computer vision, and takes voice commands through Alexa and AWS. That
              systems-level instinct — sensors, control loops, real-time constraints —
              is what I bring to every AI and software build.
            </p>
            <div className="flex flex-wrap gap-2">
              {["ROS", "Computer Vision", "UR5e 6-axis", "Embedded C", "Sensor Fusion", "Alexa", "AWS"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-muted)",
                      border: "1px solid var(--color-rule)",
                    }}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
