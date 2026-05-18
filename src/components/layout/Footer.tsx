"use client";

import Link from "next/link";
import { useRef } from "react";
import { useInView } from "motion/react";
import { siteConfig } from "@/config/site";
import { Magnetic } from "@/components/ui/Magnetic";

export function Footer() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  return (
    <footer className="border-t border-rule">
      {/* CTA Section */}
      <div className="container py-24 md:py-32" ref={ctaRef}>
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <div>
            <p
              className="eyebrow mb-6"
              style={{
                opacity: ctaInView ? 1 : 0,
                transform: ctaInView ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              Start a project
            </p>
            <h2
              className="text-cream leading-none mb-0"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 300,
                letterSpacing: "-0.03em",
              }}
            >
              <span className="line-reveal-wrap">
                <span
                  className={`line-reveal-inner ${ctaInView ? "visible-line" : "hidden-line"}`}
                  style={{ transitionDelay: "80ms" }}
                >
                  Have something
                </span>
              </span>
              <span className="line-reveal-wrap">
                <span
                  className={`line-reveal-inner ${ctaInView ? "visible-line" : "hidden-line"}`}
                  style={{ transitionDelay: "160ms" }}
                >
                  to build?
                </span>
              </span>
            </h2>
          </div>
          <div
            className="flex flex-col gap-4"
            style={{
              opacity: ctaInView ? 1 : 0,
              transform: ctaInView ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.8s ease 0.35s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s",
            }}
          >
            <Magnetic strength={0.2}>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 text-lg text-cream border border-rule px-6 py-4 hover:border-accent hover:text-accent transition-all duration-500 w-fit group"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Book a 30-min call
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </Magnetic>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-muted hover:text-cream text-sm transition-colors duration-300 underline-accent w-fit"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {siteConfig.email}
            </a>
            <a
              href={siteConfig.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-cream text-sm transition-colors duration-300 underline-accent w-fit"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              WhatsApp {siteConfig.whatsapp}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-rule">
        <div className="container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <div className="flex items-center gap-6">
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-cream transition-colors duration-300"
              style={{ fontFamily: "var(--font-sans)" }}
              aria-label="LinkedIn profile"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-cream transition-colors duration-300"
              style={{ fontFamily: "var(--font-sans)" }}
              aria-label="WhatsApp"
            >
              WhatsApp
            </a>
            <Link
              href="/work"
              className="text-xs text-muted hover:text-cream transition-colors duration-300"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Work
            </Link>
            <Link
              href="/about"
              className="text-xs text-muted hover:text-cream transition-colors duration-300"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
