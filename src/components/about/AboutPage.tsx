"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { siteConfig } from "@/config/site";

const principles = [
  {
    title: "I write the code.",
    body: "No subcontractors, no 'team of vetted freelancers.' When you hire me, I'm the person on the keyboard. You get my thinking on your problem, not a project manager who escalates to someone you've never met.",
  },
  {
    title: "Working software in weeks, not pitch decks in months.",
    body: "I ship weekly demos. You see progress. No surprise invoices at the end of month three. If something isn't working, we know in week two — not week twelve.",
  },
  {
    title: "If it doesn't move a number, it doesn't ship.",
    body: "Every system I build has a metric attached. Saved hours. Reduced errors. Faster cycle time. If we can't agree on what success looks like before we start, we don't start.",
  },
  {
    title: "I say no a lot.",
    body: "I take on 6 projects a year. Not 20. I'd rather recommend someone better suited than over-commit and underdeliver. Scarcity isn't marketing — it's how good work actually gets done.",
  },
];

const skills = [
  {
    category: "AI & LLMs",
    items: ["Claude (Anthropic)", "GPT-4o / o1", "Gemini", "Fine-tuning", "RAG pipelines", "Vector search", "Prompt engineering", "Evals & benchmarking"],
  },
  {
    category: "AI Engineering",
    items: ["LangChain", "LlamaIndex", "CrewAI", "Computer Vision", "Embeddings", "Function calling", "Pinecone / Weaviate", "OpenAI Assistants API"],
  },
  {
    category: "Automation & Integration",
    items: ["n8n (self-hosted)", "Zapier", "Make (Integromat)", "GoHighLevel", "WhatsApp Business API", "HubSpot API", "Salesforce API", "Webhook orchestration"],
  },
  {
    category: "Frontend & UI",
    items: ["Next.js 15", "React 19", "TypeScript (strict)", "Tailwind CSS v4", "Framer Motion", "GSAP", "Three.js", "Figma → code"],
  },
  {
    category: "Backend & Data",
    items: ["Node.js", "Python / FastAPI", "PostgreSQL", "Redis", "Supabase", "Prisma ORM", "REST & GraphQL", "Stripe"],
  },
  {
    category: "Infrastructure",
    items: ["Vercel / Netlify", "Docker", "Linux (Ubuntu)", "GitHub Actions", "AWS (EC2, S3, Lambda)", "Cloudflare", "CI/CD pipelines", "Monitoring & alerting"],
  },
];

export function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const skillsRef = useRef<HTMLDivElement>(null);
  const skillsInView = useInView(skillsRef, { once: true, margin: "-80px" });
  const principlesRef = useRef<HTMLElement>(null);
  const principlesInView = useInView(principlesRef, { once: true, margin: "-80px" });

  return (
    <div className="pt-28 md:pt-36 pb-24">
      {/* Hero — Portrait + Intro */}
      <div className="container" ref={heroRef}>
        <div className="grid md:grid-cols-12 gap-12 items-start mb-24">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src="/images/tarek.jpg"
                alt="Tarek Okasha"
                fill
                className="object-cover object-center"
                style={{ filter: "contrast(1.05) brightness(0.95)" }}
                priority
              />
              {/* Accent overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, transparent 60%, rgba(11,11,12,0.4) 100%)",
                }}
              />
            </div>
          </motion.div>

          {/* Intro */}
          <div className="md:col-span-8 md:pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow mb-6">About</p>
              <h1
                className="text-cream mb-8"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                Tarek Okasha.
              </h1>

              <div className="space-y-5">
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.0625rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  I'm an engineer based in Cairo, working with founders and operators around the world
                  on AI systems, automations, and custom internal software. I take on a small number
                  of projects each year and build them like real software — with tests, observability,
                  and a written architecture I'd hand to my successor.
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.0625rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  This isn't for early-stage founders without a clear scope. If you have a vague idea
                  and want me to figure it out, that's not how I work well. But if you have a real
                  operational problem — a process that runs on spreadsheets and goodwill, a workflow
                  that burns your team's hours every week, a system that needs to actually exist — I
                  can probably help.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Currently working on */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 py-10 border-t border-rule"
        >
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="eyebrow">Currently</p>
            </div>
            <div className="md:col-span-9">
              <div
                className="p-6 border border-rule relative"
                style={{ background: "rgba(244,239,230,0.02)" }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ background: "#4CAF50", boxShadow: "0 0 6px #4CAF50" }}
                  />
                  <p
                    className="text-xs eyebrow"
                    style={{ color: "var(--color-accent)", paddingTop: "2px" }}
                  >
                    May 2026 — Active
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.0625rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  Right now (May 2026), I'm expanding the automation stack for an enterprise ops client,
                  finishing a client dashboard for a wholesale brand in the Gulf, and experimenting with
                  agentic systems that handle multi-step internal processes without human checkpoints.
                  Also reading more about information retrieval than any reasonable person should.
                </p>
                <p
                  className="mt-4 text-xs"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
                >
                  Last updated: May 16, 2026.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Background */}
        <div className="mb-24 py-10 border-t border-rule">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="eyebrow">Background</p>
            </div>
            <div className="md:col-span-9">
              <div className="space-y-5">
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.0625rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  I studied engineering at the German International University, where I built
                  my first AI system in my second year — an auction-pricing model for a friend's
                  electronics resale business. It worked better than expected and worse than I'd promised,
                  which is the shape of most projects since.
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.0625rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  Before going independent, I worked on robotics research, built internal tools for
                  small businesses, and shipped my first paid software project at 20. I went independent
                  because client work was more interesting than most jobs I could see — and because
                  seeing something you built go live for real is a different kind of feedback than
                  anything you get in an office.
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.0625rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  I'm 22. I work across Cairo and remotely with clients in the Gulf, Egypt, and globally.
                  Most of my clients found me through referral, which is the only metric of client
                  satisfaction I've ever trusted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-24 py-10 border-t border-rule" ref={skillsRef}>
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="eyebrow">Tools</p>
            </div>
            <div className="md:col-span-9">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {skills.map((skillGroup, gi) => (
                  <motion.div
                    key={skillGroup.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: gi * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p
                      className="text-xs eyebrow mb-3"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {skillGroup.category}
                    </p>
                    <ul className="space-y-1.5">
                      {skillGroup.items.map((item, ii) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -8 }}
                          animate={skillsInView ? { opacity: 1, x: 0 } : {}}
                          transition={{
                            delay: gi * 0.08 + ii * 0.04 + 0.1,
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="group/skill flex items-center gap-2 text-sm cursor-default"
                          style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
                        >
                          <span
                            className="inline-block w-1 h-1 rounded-full shrink-0 transition-all duration-300 group-hover/skill:scale-150"
                            style={{ background: "var(--color-accent)", opacity: 0.4 }}
                          />
                          <span className="transition-colors duration-300 group-hover/skill:text-cream">
                            {item}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operating principles */}
      <section ref={principlesRef} className="py-10 border-t border-rule">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
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
                    className={`line-reveal-inner ${principlesInView ? "visible-line" : "hidden-line"}`}
                    style={{ transitionDelay: "0ms" }}
                  >
                    Four things I&apos;d put in writing.
                  </span>
                </span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={principlesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative py-8 pl-6 pr-8 border-t border-rule overflow-hidden"
                style={{
                  borderRight: i % 2 === 0 ? "1px solid var(--color-rule)" : undefined,
                }}
              >
                {/* Left accent bar */}
                <div className="service-bar" />

                {/* Ghost index watermark */}
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
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="flex items-start gap-4 mb-3">
                  <span
                    className="text-xs tabular pt-0.5 shrink-0 transition-colors duration-300"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-cream transition-colors duration-300"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.1rem, 1.8vw, 1.375rem)",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
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

      {/* Outside work */}
      <div className="container py-10 border-t border-rule mt-4">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <p className="eyebrow">Outside work</p>
          </div>
          <div className="md:col-span-9">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.0625rem",
                color: "var(--color-muted)",
                lineHeight: 1.75,
                maxWidth: "55ch",
              }}
            >
              I lift heavy things and box at the gym — the most consistent thing I do.
              I read more nonfiction than is probably necessary — currently working through{" "}
              <em>The Systems Mindset: Managing the Machinery of Your Life</em>, which keeps
              turning up in my work in ways I didn't expect. I'm slowly learning to make a
              proper espresso. The machine judges me.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container py-16 border-t border-rule mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <p
            className="text-cream"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            Have something to build?
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm px-5 py-3 transition-all duration-500 hover:gap-4 group"
              style={{
                fontFamily: "var(--font-sans)",
                background: "var(--color-accent)",
                color: "var(--color-ink)",
                fontWeight: 500,
              }}
            >
              Book a 30-min call
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-sm text-muted hover:text-cream transition-colors duration-300 underline-accent"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
