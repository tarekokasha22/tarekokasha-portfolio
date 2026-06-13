"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

type CursorMode = "default" | "hover" | "project";

/* ──────────────────────────────────────────────────────────────────
   Celestial cursor — a four-point gold sparkle that tracks the pointer
   exactly and twinkles, trailed by two faint comet-tail motes and a
   slow orbital ring. On interactive elements the ring opens and two
   satellite stars orbit it; over a project it reveals a "VIEW" label.
   Editorial-Noir restraint — a single warm accent against the dark.
   ────────────────────────────────────────────────────────────────── */

const SPARKLE =
  "M12 1.5 C12.9 7.6 16.4 11.1 22.5 12 C16.4 12.9 12.9 16.4 12 22.5 C11.1 16.4 7.6 12.9 1.5 12 C7.6 11.1 11.1 7.6 12 1.5 Z";

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);

  // Sparkle follows the pointer 1:1
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  // Orbital ring lags softly behind
  const ringSpring = { damping: 26, stiffness: 320, mass: 0.5 };
  const rx = useSpring(x, ringSpring);
  const ry = useSpring(y, ringSpring);

  // Comet-tail motes — progressively softer springs
  const t1x = useSpring(x, { damping: 22, stiffness: 200, mass: 0.6 });
  const t1y = useSpring(y, { damping: 22, stiffness: 200, mass: 0.6 });
  const t2x = useSpring(x, { damping: 20, stiffness: 120, mass: 0.8 });
  const t2y = useSpring(y, { damping: 20, stiffness: 120, mass: 0.8 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
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

  const sparkleSize = mode === "project" ? 30 : mode === "hover" ? 26 : 18;
  const ringSize    = mode === "project" ? 66 : mode === "hover" ? 46 : 30;
  const ringOpacity = mode === "default" ? 0.28 : 0.85;
  const satOpacity  = mode === "default" ? 0 : 1;
  const accent      = "#C9A961";

  return (
    <>
      {/* ── Comet-tail motes ── */}
      <motion.div
        style={{
          x: t2x, y: t2y, translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9996,
        }}
      >
        <div style={{ width: 3, height: 3, borderRadius: "50%", background: accent, opacity: 0.2 }} />
      </motion.div>
      <motion.div
        style={{
          x: t1x, y: t1y, translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9996,
        }}
      >
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: accent, opacity: 0.35 }} />
      </motion.div>

      {/* ── Orbital ring (lagging) ── */}
      <motion.div
        style={{
          x: rx, y: ry, translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9997,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* The ring itself */}
        <motion.div
          animate={{ width: ringSize, height: ringSize, opacity: ringOpacity }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: `1px solid ${accent}`,
          }}
        />
        {/* Slowly rotating satellites that appear on interactive targets */}
        <motion.div
          animate={{ width: ringSize, height: ringSize, rotate: 360, opacity: satOpacity }}
          transition={{
            width:   { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
            height:  { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.3 },
            rotate:  { repeat: Infinity, ease: "linear", duration: 6 },
          }}
          style={{ position: "absolute" }}
        >
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translate(-50%,-50%)",
            width: 3, height: 3, borderRadius: "50%", background: accent,
            boxShadow: `0 0 5px ${accent}`,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translate(-50%,50%)",
            width: 3, height: 3, borderRadius: "50%", background: accent,
            boxShadow: `0 0 5px ${accent}`,
          }} />
        </motion.div>

        {/* VIEW label — project only */}
        <motion.span
          animate={{ opacity: mode === "project" ? 1 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            fontFamily: "var(--font-sans)", fontSize: "8px",
            letterSpacing: "0.22em", color: accent,
            userSelect: "none", whiteSpace: "nowrap",
          }}
        >
          VIEW
        </motion.span>
      </motion.div>

      {/* ── Core sparkle (exact follow) ── */}
      <motion.div
        style={{
          x, y, translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999,
        }}
        animate={{ scale: mode === "default" ? 1 : 1.05 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ scale: [1, 0.82, 1], opacity: [1, 0.78, 1] }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        >
          <svg
            width={sparkleSize} height={sparkleSize} viewBox="0 0 24 24" fill="none"
            style={{ display: "block", filter: `drop-shadow(0 0 4px rgba(201,169,97,0.65))` }}
          >
            <path d={SPARKLE} fill={accent} />
          </svg>
        </motion.div>
      </motion.div>
    </>
  );
}
