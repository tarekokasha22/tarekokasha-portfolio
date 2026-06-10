"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

type CursorMode = "default" | "hover" | "project";

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const dotX  = useMotionValue(-200);
  const dotY  = useMotionValue(-200);

  // Reticle — medium lag
  const ringSpring  = { damping: 26, stiffness: 280, mass: 0.55 };
  // Dot — snappy
  const dotSpring   = { damping: 50, stiffness: 600, mass: 0.2 };
  // Trail — very slow / ghostly
  const trailSpring = { damping: 18, stiffness: 90, mass: 1.0 };

  const rx = useSpring(mouseX, ringSpring);
  const ry = useSpring(mouseY, ringSpring);
  const dx = useSpring(dotX,  dotSpring);
  const dy = useSpring(dotY,  dotSpring);
  const tx = useSpring(mouseX, trailSpring);
  const ty = useSpring(mouseY, trailSpring);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    // Event delegation — one listener on the document instead of a
    // MutationObserver + per-element listeners. Zero hydration churn, and
    // it works automatically for links injected by client navigation.
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-cursor]"
      );
      if (el) setMode(el.dataset.cursor === "project" ? "project" : "hover");
    };
    const out = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("a, button, [data-cursor]");
      const next = (e.relatedTarget as HTMLElement | null)?.closest(
        "a, button, [data-cursor]"
      );
      if (el && !next) setMode("default");
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const size      = mode === "project" ? 70 : mode === "hover" ? 50 : 34;
  const trailSize = mode === "project" ? 92 : mode === "hover" ? 64 : 42;

  // Robotic targeting reticle — four corner brackets + crosshair ticks
  const bracket =
    mode === "project"
      ? "rgba(201,169,97,0.9)"
      : mode === "hover"
      ? "rgba(244,239,230,0.72)"
      : "rgba(244,239,230,0.42)";

  return (
    <>
      {/* ── Ghost trail ring (slowest) ── */}
      <motion.div
        style={{
          x: tx, y: ty,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9996,
        }}
      >
        <motion.div
          animate={{ width: trailSize, height: trailSize, opacity: mode === "default" ? 0.08 : 0.06 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: "50%",
            border: "1px solid rgba(201,169,97,0.35)",
          }}
        />
      </motion.div>

      {/* ── Targeting reticle ── */}
      <motion.div
        style={{
          x: rx, y: ry,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9998,
        }}
      >
        {/* Rotating bracket cage — scans while engaged, still at rest */}
        <motion.div
          animate={{
            width: size,
            height: size,
            rotate: mode === "default" ? 0 : 360,
          }}
          transition={{
            width:  { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
            rotate:
              mode === "default"
                ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                : { repeat: Infinity, ease: "linear", duration: mode === "project" ? 6 : 9 },
          }}
          style={{ position: "absolute", top: 0, left: 0, translateX: "-50%", translateY: "-50%" }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" style={{ overflow: "visible" }}>
            {/* Corner brackets */}
            <path d="M8 28 V8 H28"  stroke={bracket} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M72 8 H92 V28" stroke={bracket} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M92 72 V92 H72" stroke={bracket} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 92 H8 V72" stroke={bracket} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Crosshair edge ticks */}
            <line x1="50" y1="2"  x2="50" y2="12" stroke={bracket} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="50" y1="88" x2="50" y2="98" stroke={bracket} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="2"  y1="50" x2="12" y2="50" stroke={bracket} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="88" y1="50" x2="98" y2="50" stroke={bracket} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </motion.div>

        {/* VIEW label — does not rotate */}
        <motion.span
          animate={{ opacity: mode === "project" ? 1 : 0, scale: mode === "project" ? 1 : 0.6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", top: 0, left: 0,
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--font-sans)",
            fontSize: "8px",
            letterSpacing: "0.2em",
            color: "var(--color-accent)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          VIEW
        </motion.span>
      </motion.div>

      {/* ── Dot ── */}
      <motion.div
        style={{
          x: dx, y: dy,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9999,
        }}
        animate={{ opacity: mode === "project" ? 0 : 1, scale: mode === "hover" ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--color-accent)" }}
        />
      </motion.div>
    </>
  );
}
