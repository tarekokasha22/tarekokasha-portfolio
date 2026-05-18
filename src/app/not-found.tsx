import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Not Found",
  description: "This page doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="eyebrow mb-6">404</p>
      <h1
        className="text-cream mb-6"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(4rem, 12vw, 10rem)",
          fontWeight: 300,
          letterSpacing: "-0.06em",
          lineHeight: 1,
        }}
      >
        Lost.
      </h1>
      <p
        className="max-w-sm mb-10"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          color: "var(--color-muted)",
          lineHeight: 1.7,
        }}
      >
        This page doesn't exist. Happens to the best systems.
        <br />
        (And by "best systems" I mean all of them.)
      </p>
      <Link
        href="/work"
        className="inline-flex items-center gap-2 text-sm px-5 py-3 transition-all duration-500 hover:gap-4 group"
        style={{
          fontFamily: "var(--font-sans)",
          background: "var(--color-accent)",
          color: "var(--color-ink)",
          fontWeight: 500,
        }}
      >
        See the work
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
