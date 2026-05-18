"use client";

import Link from "next/link";
import { useRef } from "react";
import { useInView } from "motion/react";
import { siteConfig } from "@/config/site";

export function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-48 border-t border-rule overflow-hidden"
    >
      {/* Ambient glow layer */}
      <div
        className="cta-glow absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,169,97,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Secondary warmth ring */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 35% 30% at 50% 50%, rgba(201,169,97,0.04) 0%, transparent 100%)",
        }}
      />

      <div className="container relative z-10">
        <div className="text-center">
          <p
            className="eyebrow mb-8"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Get in touch
          </p>

          {/* Large clip-text headline */}
          <h2
            className="text-cream mx-auto mb-12"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 8rem)",
              fontWeight: 300,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              maxWidth: "14ch",
            }}
          >
            <span className="line-reveal-wrap">
              <span
                className={`line-reveal-inner ${isInView ? "visible-line" : "hidden-line"}`}
                style={{ transitionDelay: "100ms", paddingBottom: "0.04em", display: "block" }}
              >
                Have something
              </span>
            </span>
            <span className="line-reveal-wrap">
              <span
                className={`line-reveal-inner ${isInView ? "visible-line" : "hidden-line"}`}
                style={{
                  color: "var(--color-accent)",
                  fontStyle: "italic",
                  transitionDelay: "220ms",
                  paddingBottom: "0.04em",
                  display: "block",
                }}
              >
                to build?
              </span>
            </span>
          </h2>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.8s ease 0.45s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s",
            }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-500 hover:gap-5 hover:brightness-110 group"
              style={{
                fontFamily: "var(--font-sans)",
                background: "var(--color-accent)",
                color: "var(--color-ink)",
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

          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-muted)",
              opacity: isInView ? 1 : 0,
              transition: "opacity 0.7s ease 0.6s",
            }}
          >
            I respond within 24h on weekdays.{" "}
            <span style={{ color: "var(--color-accent)" }}>
              {siteConfig.availability}.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
