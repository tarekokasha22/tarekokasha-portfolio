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

  // Ring — medium lag
  const ringSpring  = { damping: 26, stiffness: 280, mass: 0.55 };
  // Dot — snappy
  const dotSpring   = { damping: 50, stiffness: 600, mass: 0.2 };
  // Trail ring — very slow / ghostly
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

  const ringSize  = mode === "project" ? 76 : mode === "hover" ? 50 : 32;
  const trailSize = mode === "project" ? 96 : mode === "hover" ? 64 : 42;

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

      {/* ── Ring ── */}
      <motion.div
        style={{
          x: rx, y: ry,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9998,
        }}
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor: mode === "project"
              ? "rgba(201,169,97,0.75)"
              : mode === "hover"
              ? "rgba(244,239,230,0.55)"
              : "rgba(244,239,230,0.28)",
          }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: "50%",
            border: "1px solid rgba(244,239,230,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* VIEW label */}
          <motion.span
            animate={{ opacity: mode === "project" ? 1 : 0, scale: mode === "project" ? 1 : 0.6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
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
      </motion.div>

      {/* ── Dot ── */}
      <motion.div
        style={{
          x: dx, y: dy,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9999,
        }}
        animate={{ opacity: mode === "project" ? 0 : 1, scale: mode === "hover" ? 0 : 1 }}
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
