"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

type CursorMode = "default" | "hover" | "project";

/* ──────────────────────────────────────────────────────────────────
   Minimal premium cursor — a precise dot that tracks the pointer
   exactly, trailed by a thin ring that lags with a soft spring.
   On interactive elements the ring expands and warms to gold; over a
   project link it grows further and reveals a "VIEW" label.
   Restraint over spectacle — Editorial Noir.
   ────────────────────────────────────────────────────────────────── */

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);

  // Dot follows the pointer 1:1
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  // Ring lags behind with a smooth spring
  const ringSpring = { damping: 28, stiffness: 350, mass: 0.5 };
  const rx = useSpring(dotX, ringSpring);
  const ry = useSpring(dotY, ringSpring);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    // Event delegation — one pair of listeners on the document. Works for
    // links injected by client navigation; zero hydration churn.
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

  const ringSize  = mode === "project" ? 64 : mode === "hover" ? 44 : 30;
  const ringColor =
    mode === "default" ? "rgba(244,239,230,0.45)" : "rgba(201,169,97,0.9)";
  const ringBg =
    mode === "default" ? "transparent" : "rgba(201,169,97,0.06)";
  const dotScale = mode === "default" ? 1 : 0.35;

  return (
    <>
      {/* ── Lagging ring ── */}
      <motion.div
        style={{
          x: rx, y: ry,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9998,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor: ringColor,
            backgroundColor: ringBg,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: "50%",
            borderWidth: 1,
            borderStyle: "solid",
          }}
        />
        {/* VIEW label — fades in only over a project link */}
        <motion.span
          animate={{ opacity: mode === "project" ? 1 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            fontFamily: "var(--font-sans)",
            fontSize: "8px",
            letterSpacing: "0.22em",
            color: "var(--color-accent)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          VIEW
        </motion.span>
      </motion.div>

      {/* ── Precise dot (exact follow) ── */}
      <motion.div
        style={{
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          position: "fixed", top: 0, left: 0,
          pointerEvents: "none", zIndex: 9999,
        }}
        animate={{ scale: dotScale }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "var(--color-accent)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.div>
    </>
  );
}
