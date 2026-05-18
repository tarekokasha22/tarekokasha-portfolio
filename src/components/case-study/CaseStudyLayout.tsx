"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { CaseStudyFrontmatter } from "@/lib/mdx";
import { projects } from "@/config/site";

const projectAccents: Record<string, string> = {
  aurevia: "#C9A961",
  "ai-automations": "#4A90D9",
  "al-helaly-erp": "#8B6B47",
  "sportix-smis": "#4CAF50",
  "robotics-arm": "#E74C3C",
};

interface Props {
  frontmatter: CaseStudyFrontmatter;
  slug: string;
  children: React.ReactNode;
}

export function CaseStudyLayout({ frontmatter, slug, children }: Props) {
  const accent = projectAccents[slug] || "var(--color-accent)";
  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);
  const currentIdx = sortedProjects.findIndex((p) => p.slug === slug);
  const currentProject = projects.find((p) => p.slug === slug);
  const nextProject = sortedProjects[currentIdx + 1] || sortedProjects[0];

  return (
    <article className="pt-28 md:pt-36">
      {/* Hero */}
      <div className="container mb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-12">
          <Link
            href="/work"
            className="text-xs text-muted hover:text-cream transition-colors duration-300"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Work
          </Link>
          <span className="text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>
            /
          </span>
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-sans)", color: accent }}
          >
            {frontmatter.client}
          </span>
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-4 items-center mb-6"
        >
          <span className="eyebrow">{frontmatter.year}</span>
          <span
            className="w-px h-4 opacity-30"
            style={{ background: "var(--color-cream)" }}
          />
          <span className="eyebrow" style={{ color: accent }}>
            {frontmatter.client}
          </span>
          <span
            className="w-px h-4 opacity-30"
            style={{ background: "var(--color-cream)" }}
          />
          <span className="eyebrow">{frontmatter.role}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-cream mb-8"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 6rem)",
            fontWeight: 300,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            maxWidth: "20ch",
          }}
        >
          {frontmatter.oneLineOutcome}
        </motion.h1>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex flex-wrap gap-6 items-center py-6 border-t border-b border-rule"
        >
          <div>
            <p className="text-xs eyebrow mb-1">Duration</p>
            <p
              className="text-sm text-cream"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {frontmatter.duration}
            </p>
          </div>
          <div
            className="w-px h-8 opacity-20"
            style={{ background: "var(--color-cream)" }}
          />
          <div>
            <p className="text-xs eyebrow mb-1">Role</p>
            <p
              className="text-sm text-cream"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {frontmatter.role}
            </p>
          </div>
          <div
            className="w-px h-8 opacity-20"
            style={{ background: "var(--color-cream)" }}
          />
          <div className="flex flex-wrap gap-2">
            {frontmatter.tags.map((tag) => (
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
        </motion.div>
      </div>

      {/* Hero visual — project image */}
      <div
        className="w-full mb-20 relative overflow-hidden"
        style={{
          height: "40vw",
          minHeight: "300px",
          maxHeight: "520px",
          borderTop: "1px solid var(--color-rule)",
          borderBottom: "1px solid var(--color-rule)",
        }}
      >
        {currentProject?.image ? (
          <Image
            src={currentProject.image}
            alt={frontmatter.title}
            fill
            className="object-cover"
            style={{ filter: "brightness(0.65) saturate(0.75)" }}
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0" style={{ background: "rgba(244,239,230,0.02)" }} />
        )}

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(11,11,12,0.25) 0%, transparent 40%, rgba(11,11,12,0.6) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accent}18 0%, transparent 65%)` }}
        />

        {/* Ghost number watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(8rem, 25vw, 22rem)",
              fontWeight: 300,
              color: "rgba(244,239,230,0.04)",
              letterSpacing: "-0.06em",
              lineHeight: 1,
            }}
          >
            {String(currentIdx + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Bottom meta */}
        <div className="absolute bottom-6 left-0 right-0 container flex items-end justify-between">
          <p className="text-xs eyebrow" style={{ color: "rgba(244,239,230,0.7)" }}>
            {frontmatter.title}
          </p>
          <div className="flex items-center gap-4">
            {currentProject?.liveUrl && (
              <a
                href={currentProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-accent)",
                  letterSpacing: "0.08em",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#4CAF50", boxShadow: "0 0 4px #4CAF50" }}
                />
                LIVE ↗
              </a>
            )}
            <p className="text-xs" style={{ fontFamily: "var(--font-sans)", color: "rgba(244,239,230,0.5)" }}>
              {frontmatter.publishedAt}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 md:col-start-3">
            <div className="prose-editorial">{children}</div>
          </div>
        </div>
      </div>

      {/* Next case study */}
      {nextProject && nextProject.slug !== slug && (
        <div className="mt-24 border-t border-rule">
          <div className="container py-16">
            <p className="eyebrow mb-4">Next</p>
            <Link
              href={`/work/${nextProject.slug}`}
              className="group flex items-end justify-between gap-8"
            >
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
                >
                  {nextProject.client} · {nextProject.year}
                </p>
                <h2
                  className="text-cream group-hover:text-accent transition-colors duration-500"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3.5vw, 3rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {nextProject.oneLineOutcome}
                </h2>
              </div>
              <span
                className="text-2xl text-muted group-hover:text-accent transition-all duration-500 group-hover:translate-x-2 inline-block shrink-0"
                style={{ fontFamily: "var(--font-display)" }}
              >
                →
              </span>
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
