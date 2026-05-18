"use client";

import { useEffect, useRef, useState } from "react";
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

  // Debounce MutationObserver re-attachment
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      setMode(el.dataset.cursor === "project" ? "project" : "hover");
    };
    const onLeave = () => setMode("default");

    const attach = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    attach();

    // Re-attach when DOM changes (navigation injects new links)
    const observer = new MutationObserver(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(attach, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("mousemove", move, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
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
