"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { siteConfig } from "@/config/site";
import { Magnetic } from "@/components/ui/Magnetic";
import { SpaceBackground } from "@/components/ui/SpaceBackground";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const line1Ref    = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLDivElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Entrance ─────────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        [line1Ref.current, line2Ref.current],
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, stagger: 0.08 },
        0
      )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.75
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.95
        );

      // No scroll-based transforms on the hero text — the line containers
      // use overflow:hidden so any yPercent movement clips the text.
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-28 overflow-hidden"
    >
      {/* Space background */}
      <SpaceBackground />

      <div className="container relative z-10">
        <div className="max-w-5xl">
          {/* Headline — line-level clip containers prevent descender clipping */}
          <div aria-label={siteConfig.tagline}>
            <div style={{ overflow: "hidden", marginBottom: "0.04em" }}>
              <div
                ref={line1Ref}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.6rem, 10.5vw, 10rem)",
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  color: "var(--color-cream)",
                  paddingBottom: "0.06em",
                }}
              >
                Software that
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                ref={line2Ref}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.6rem, 10.5vw, 10rem)",
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  color: "var(--color-cream)",
                  paddingBottom: "0.06em",
                }}
              >
                pays for{" "}
                <span className="shimmer-accent" style={{ fontStyle: "italic" }}>
                  itself.
                </span>
              </div>
            </div>
          </div>

          <p
            ref={subRef}
            className="mt-8 max-w-xl"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1rem, 1.8vw, 1.175rem)",
              color: "var(--color-muted)",
              lineHeight: 1.65,
              opacity: 0,
            }}
          >
            AI systems and custom internal tools for founders who need them
            working in weeks, not pitch decks in months.
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center gap-6 mt-10" style={{ opacity: 0 }}>
            <Magnetic strength={0.22}>
              <Link
                href="/contact"
                className="btn-glow inline-flex items-center gap-3 text-ink text-sm px-6 py-3.5 font-medium tracking-wide transition-colors duration-300 hover:brightness-110 group"
                style={{
                  fontFamily: "var(--font-sans)",
                  background: "var(--color-accent)",
                }}
              >
                Start a project
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Link
                href="/work"
                className="text-sm text-muted hover:text-cream transition-colors duration-300 underline-accent"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                See selected work
              </Link>
            </Magnetic>
          </div>

          {/* Availability */}
          <p
            className="mt-8 text-xs"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
          >
            <span
              className="avail-dot inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
              style={{ background: "#4CAF50" }}
            />
            {siteConfig.availability}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs eyebrow">Scroll</span>
        <div
          className="w-px h-12 overflow-hidden"
          style={{ background: "var(--color-rule)" }}
        >
          <div
            className="w-px h-full"
            style={{
              background: "var(--color-accent)",
              animation: "scrollLine 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
