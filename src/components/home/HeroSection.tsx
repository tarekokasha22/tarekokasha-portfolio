"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Magnetic } from "@/components/ui/Magnetic";

// Loaded after hydration — canvas doesn't need to block the hero text
const SpaceBackground = dynamic(
  () => import("@/components/ui/SpaceBackground").then((m) => ({ default: m.SpaceBackground })),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-28 overflow-hidden">
      <SpaceBackground />

      <div className="container relative z-10">
        <div className="max-w-5xl">
          {/* Headline — clip containers reveal text upward */}
          <div aria-label={siteConfig.tagline}>
            <div style={{ overflow: "hidden", marginBottom: "0.04em" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.6rem, 10.5vw, 10rem)",
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  color: "var(--color-cream)",
                  paddingBottom: "0.06em",
                  animation: "heroLineReveal 1.1s cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                Software that
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.6rem, 10.5vw, 10rem)",
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  color: "var(--color-cream)",
                  paddingBottom: "0.06em",
                  animation: "heroLineReveal 1.1s 0.08s cubic-bezier(0.16,1,0.3,1) both",
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
            className="mt-8 max-w-xl"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1rem, 1.8vw, 1.175rem)",
              color: "var(--color-muted)",
              lineHeight: 1.65,
              animation: "heroFadeUp 0.9s 0.75s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            AI systems, internal tools, and automations — engineered with the
            discipline of robotics and shipped in weeks. Real software that runs
            in production without you watching it.
          </p>

          <div
            className="flex flex-wrap items-center gap-6 mt-10"
            style={{
              animation: "heroFadeUp 0.7s 0.95s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
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
        <div className="w-px h-12 overflow-hidden" style={{ background: "var(--color-rule)" }}>
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
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
