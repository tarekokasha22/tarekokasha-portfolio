"use client";

import { motion } from "motion/react";

/**
 * Rotating targeting reticle — a quiet nod to vision/robotics systems.
 * Counter-rotating tick rings, a crosshair, and a pulsing core.
 */
export function Reticle({
  size = 132,
  active = true,
}: {
  size?: number;
  active?: boolean;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 132 132" width={size} height={size} fill="none">
        {/* Outer rotating ring with ticks */}
        <motion.g
          style={{ transformOrigin: "66px 66px", transformBox: "view-box" }}
          animate={active ? { rotate: 360 } : {}}
          transition={{ duration: 24, ease: "linear", repeat: Infinity }}
        >
          <circle cx="66" cy="66" r="60" stroke="var(--color-rule)" strokeWidth="1" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r1 = i % 6 === 0 ? 51 : 55;
            return (
              <line
                key={i}
                x1={66 + Math.cos(a) * r1}
                y1={66 + Math.sin(a) * r1}
                x2={66 + Math.cos(a) * 60}
                y2={66 + Math.sin(a) * 60}
                stroke={i % 6 === 0 ? "var(--color-accent)" : "var(--color-rule)"}
                strokeWidth={i % 6 === 0 ? 1.4 : 0.8}
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* Counter-rotating inner ring */}
        <motion.circle
          cx="66" cy="66" r="40"
          stroke="rgba(201,169,97,0.45)"
          strokeWidth="1"
          strokeDasharray="4 8"
          style={{ transformOrigin: "66px 66px", transformBox: "view-box" }}
          animate={active ? { rotate: -360 } : {}}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        />

        {/* Crosshair */}
        <line x1="66" y1="20" x2="66" y2="40" stroke="var(--color-rule)" strokeWidth="1" />
        <line x1="66" y1="92" x2="66" y2="112" stroke="var(--color-rule)" strokeWidth="1" />
        <line x1="20" y1="66" x2="40" y2="66" stroke="var(--color-rule)" strokeWidth="1" />
        <line x1="92" y1="66" x2="112" y2="66" stroke="var(--color-rule)" strokeWidth="1" />

        {/* Pulsing core */}
        <motion.circle
          cx="66" cy="66" r="6"
          fill="var(--color-accent)"
          animate={active ? { opacity: [0.4, 1, 0.4], scale: [0.85, 1.1, 0.85] } : {}}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: "66px 66px", transformBox: "view-box" }}
        />
        <circle cx="66" cy="66" r="11" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}
