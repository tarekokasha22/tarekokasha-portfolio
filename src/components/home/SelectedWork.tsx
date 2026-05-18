"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import { projects } from "@/config/site";

const featuredProjects = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);

const projectAccents: Record<string, string> = {
  aurevia: "#C9A961",
  "ai-automations": "#4A90D9",
  "al-helaly-erp": "#8B6B47",
  "sportix-smis": "#4CAF50",
  "robotics-arm": "#E74C3C",
};

type FeaturedProject = (typeof featuredProjects)[number];

function ProjectCard({
  project,
  index,
  isInView,
}: {
  project: FeaturedProject;
  index: number;
  isInView: boolean;
}) {
  const router = useRouter();
  const tiltRef = useRef<HTMLDivElement>(null);

  const isTouch = typeof window !== "undefined" && !window.matchMedia("(hover: hover)").matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${y * -4}deg) rotateY(${x * 6}deg) scale3d(1.01,1.01,1)`;
    el.style.transition = "transform 0.08s linear";
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1)";
  };

  const i = index;
  const accent = projectAccents[project.slug] || "var(--color-accent)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: "transform" }}
      >
        <article
          className="work-card group cursor-pointer"
          data-cursor="project"
          onClick={() => router.push(`/work/${project.slug}`)}
        >
          <div className="block">
            {/* Image container */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "16/7" }}>
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                sizes="(max-width: 768px) 100vw, 90vw"
              />

              {/* Dark veil — lifts on hover */}
              <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/10 transition-colors duration-700 pointer-events-none" />

              {/* Accent glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 100%, ${accent}22 0%, transparent 65%)`,
                }}
              />

              {/* Scanline sweep */}
              <div className="scanline-sweep absolute inset-0 pointer-events-none" />

              {/* Tags */}
              <div className="absolute top-4 right-4 flex gap-2">
                {project.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1"
                    style={{
                      fontFamily: "var(--font-sans)",
                      background: "rgba(11,11,12,0.75)",
                      color: "var(--color-muted)",
                      border: "1px solid var(--color-rule)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Live badge */}
              {project.liveUrl && (
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2.5 py-1 flex items-center gap-1.5"
                    style={{
                      fontFamily: "var(--font-sans)",
                      background: "rgba(11,11,12,0.85)",
                      color: "var(--color-accent)",
                      border: "1px solid rgba(201,169,97,0.3)",
                      backdropFilter: "blur(8px)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#4CAF50", boxShadow: "0 0 4px #4CAF50" }}
                    />
                    LIVE ↗
                  </a>
                </div>
              )}

              {/* Ghost number watermark */}
              <div
                className="absolute bottom-3 right-5 pointer-events-none select-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "6rem",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "rgba(244,239,230,0.05)",
                  letterSpacing: "-0.05em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>

            {/* Meta row */}
            <div className="grid md:grid-cols-12 gap-4 items-start pt-6 pb-8 border-b border-rule">
              <div className="md:col-span-1">
                <span className="text-xs tabular" style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}>
                  {project.year}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs eyebrow" style={{ color: accent }}>
                  {project.client}
                </span>
              </div>
              <div className="md:col-span-7">
                <h3
                  className="text-cream transition-colors duration-500 group-hover:text-accent"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {project.oneLineOutcome}
                </h3>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-4">
                <span
                  className="text-sm text-muted group-hover:text-cream transition-all duration-300 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Read case study
                  <span className="transition-transform duration-300 group-hover:translate-x-1 inline-block">→</span>
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </motion.div>
  );
}

export function SelectedWork() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="ambient-glow py-24 md:py-32 border-t border-rule">
      <div className="container">
        {/* Header */}
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-3">
            <p className="eyebrow">Selected work · 2023–2025</p>
          </div>
          <div className="md:col-span-9 flex items-end justify-between gap-8">
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
                  Three problems.
                </span>
              </span>
              <span className="line-reveal-wrap">
                <span
                  className={`shimmer-accent line-reveal-inner ${isInView ? "visible-line" : "hidden-line"}`}
                  style={{ fontStyle: "italic", transitionDelay: "120ms" }}
                >
                  Three systems that solved them.
                </span>
              </span>
            </h2>
            <Link
              href="/work"
              className="hidden md:flex items-center gap-2 text-sm text-muted hover:text-cream transition-colors duration-300 underline-accent shrink-0"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              View all work →
            </Link>
          </div>
        </div>

        {/* Project cards */}
        <div className="flex flex-col gap-2">
          {featuredProjects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>

        <div className="mt-8 flex md:hidden">
          <Link href="/work" className="text-sm text-muted hover:text-cream transition-colors duration-300" style={{ fontFamily: "var(--font-sans)" }}>
            View all work →
          </Link>
        </div>
      </div>
    </section>
  );
}
