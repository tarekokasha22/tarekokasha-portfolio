"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { projects } from "@/config/site";

const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

const projectAccents: Record<string, string> = {
  aurevia: "#C9A961",
  "ai-automations": "#4A90D9",
  "al-helaly-erp": "#8B6B47",
  "sportix-smis": "#4CAF50",
  "robotics-arm": "#E74C3C",
};

export function WorkIndex() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredProject = sortedProjects.find((p) => p.slug === hoveredSlug);

  return (
    <div className="pt-32 pb-24">
      {/* Header */}
      <div className="container mb-16" ref={headerRef}>
        <div>
          <p
            className="eyebrow mb-6"
            style={{
              opacity: headerInView ? 1 : 0,
              transform: headerInView ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Work · 2023–2025
          </p>
          <h1
            className="text-cream mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 7vw, 7rem)",
              fontWeight: 300,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            <span className="line-reveal-wrap">
              <span
                className={`line-reveal-inner ${headerInView ? "visible-line" : "hidden-line"}`}
                style={{ transitionDelay: "80ms", paddingBottom: "0.06em", display: "block" }}
              >
                Selected projects.
              </span>
            </span>
          </h1>
          <p
            className="max-w-2xl"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.0625rem",
              color: "var(--color-muted)",
              lineHeight: 1.7,
            }}
          >
            Five systems, five problems worth solving. Real clients, real numbers,
            honest reflections on what worked and what I&apos;d do differently.
          </p>
        </div>
      </div>

      {/* Project list */}
      <div ref={containerRef} className="container relative" onMouseMove={handleMouseMove}>
        <div className="relative">
          {sortedProjects.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="group"
                onMouseEnter={() => setHoveredSlug(project.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
              >
                <div
                  className="grid grid-cols-12 gap-4 items-center py-6 border-t border-rule transition-all duration-500"
                  style={{
                    background: hoveredSlug === project.slug ? "rgba(244,239,230,0.02)" : "transparent",
                  }}
                >
                  {/* Index */}
                  <div className="col-span-1">
                    <span
                      className="text-xs tabular transition-colors duration-300"
                      style={{
                        fontFamily: "var(--font-sans)",
                        color: hoveredSlug === project.slug
                          ? projectAccents[project.slug] || "var(--color-accent)"
                          : "var(--color-muted)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Client */}
                  <div className="col-span-2">
                    <span
                      className="text-xs eyebrow transition-colors duration-300"
                      style={{
                        color: hoveredSlug === project.slug
                          ? projectAccents[project.slug] || "var(--color-accent)"
                          : "var(--color-muted)",
                      }}
                    >
                      {project.client}
                    </span>
                  </div>

                  {/* Outcome */}
                  <div className="col-span-6">
                    <Link href={`/work/${project.slug}`}>
                      <h2
                        className="transition-colors duration-500"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                          fontWeight: 400,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                          color: hoveredSlug === project.slug
                            ? "var(--color-cream)"
                            : "rgba(244,239,230,0.7)",
                        }}
                      >
                        {project.oneLineOutcome}
                      </h2>
                    </Link>
                  </div>

                  {/* Tags + live */}
                  <div className="col-span-2 hidden md:flex items-center gap-3 justify-end">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs transition-colors duration-200 shrink-0"
                        style={{
                          fontFamily: "var(--font-sans)",
                          color: hoveredSlug === project.slug
                            ? projectAccents[project.slug] || "var(--color-accent)"
                            : "var(--color-muted)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        ↗ Live
                      </a>
                    )}
                    {project.tags.slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1"
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

                  {/* Arrow */}
                  <div className="col-span-1 flex justify-end">
                    <Link href={`/work/${project.slug}`}>
                      <span
                        className="text-sm transition-all duration-300 inline-block"
                        style={{
                          color: hoveredSlug === project.slug
                            ? projectAccents[project.slug] || "var(--color-accent)"
                            : "var(--color-muted)",
                          transform: hoveredSlug === project.slug ? "translateX(4px)" : "translateX(0)",
                        }}
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-rule" />
        </div>

        {/* Floating preview with real image */}
        <AnimatePresence>
          {hoveredSlug && hoveredProject && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute hidden lg:block"
              style={{
                left: mousePos.x + 28,
                top: mousePos.y - 110,
                width: "300px",
                zIndex: 10,
              }}
            >
              <div
                className="overflow-hidden"
                style={{
                  background: "rgba(14,13,11,0.97)",
                  border: "1px solid var(--color-rule)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="relative overflow-hidden" style={{ height: "168px" }}>
                  <Image
                    src={hoveredProject.image}
                    alt={hoveredProject.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-ink/25" />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: projectAccents[hoveredSlug] || "var(--color-accent)" }}
                  />
                </div>
                <div className="p-4">
                  <p
                    className="text-xs eyebrow mb-1.5"
                    style={{ color: projectAccents[hoveredSlug] || "var(--color-accent)" }}
                  >
                    {hoveredProject.client} · {hoveredProject.year}
                  </p>
                  <p className="text-sm text-cream mb-1" style={{ fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>
                    {hoveredProject.oneLineOutcome}
                  </p>
                  {hoveredProject.liveUrl && (
                    <p className="text-xs mt-2" style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}>
                      ↗ Live project available
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
