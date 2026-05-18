"use client";

import { useScroll, motion, useTransform } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  // Opacity: invisible at 0 scroll, visible after a bit
  const opacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);

  return (
    <>
      {/* ── Top horizontal bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none z-50"
        style={{
          scaleX: scrollYProgress,
          transformOrigin: "left",
          background: "linear-gradient(90deg, var(--color-accent), rgba(201,169,97,0.6))",
          opacity,
        }}
      />

      {/* ── Side vertical bar (desktop only) ── */}
      <div
        className="fixed left-6 top-1/2 -translate-y-1/2 h-28 w-px pointer-events-none z-30 hidden lg:block"
        style={{ background: "rgba(244,239,230,0.08)" }}
      >
        <motion.div
          className="absolute top-0 left-0 w-full"
          style={{
            height: "100%",
            scaleY: scrollYProgress,
            transformOrigin: "top",
            background: "var(--color-accent)",
          }}
        />
      </div>
    </>
  );
}
