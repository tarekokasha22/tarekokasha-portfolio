"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  useTime,
} from "motion/react";

/* ──────────────────────────────────────────────────────────────────
   A UR5e-style arm performing a pick-and-place, scrubbed by scroll.
   The section pins (sticky) and the routine plays from 0 → 1 as you
   scroll through it, then releases the page. Forward kinematics is done
   with nested SVG groups: each joint sits at the local origin (0,0) of a
   translated <g>, and a <motion.g transform="rotate(θ)"> spins around it.
   ────────────────────────────────────────────────────────────────── */

const stroke = "rgba(244,239,230,0.6)";
const strokeDim = "rgba(244,239,230,0.22)";
const accent = "#C9A961";

// Joint-link segment with a rounded casing + center seam
function Link({ length, width = 18 }: { length: number; width?: number }) {
  return (
    <g>
      <rect
        x={-width / 2}
        y={-length}
        width={width}
        height={length + width / 2}
        rx={width / 2}
        fill="rgba(18,18,22,0.9)"
        stroke={stroke}
        strokeWidth={1.5}
      />
      <line x1={0} y1={-length + 6} x2={0} y2={-6} stroke={strokeDim} strokeWidth={1} />
    </g>
  );
}

function Joint({ r = 9 }: { r?: number }) {
  return (
    <>
      <circle cx={0} cy={0} r={r} fill="rgba(13,13,16,0.95)" stroke={stroke} strokeWidth={1.5} />
      <circle cx={0} cy={0} r={r * 0.42} fill="none" stroke={accent} strokeWidth={1.2} />
    </>
  );
}

const STAGES = ["APPROACH", "GRIP", "TRANSFER", "PLACE", "RELEASE"] as const;

export function RoboticArmScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [reduced, setReduced] = useState(false);
  const idleRef = useRef(1);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    idleRef.current = r ? 0 : 1;
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Always-on idle clock — the arm breathes even when you stop scrolling, so
  // it reads as a live machine rather than a frozen diagram.
  const time = useTime();

  // Keyframe breakpoints across the scrubbed routine
  const P = [0, 0.18, 0.32, 0.5, 0.68, 0.82, 1];

  // Joint angles (degrees, clockwise). Shoulder swings the arm; elbow bends
  // the forearm; wrist keeps the gripper oriented at the work surface.
  const a1 = useTransform(scrollYProgress, P, [-20, -36, -36, -6, 26, 34, 14]);
  const a2 = useTransform(scrollYProgress, P, [52, 80, 80, 36, 50, 82, 58]);
  const a3 = useTransform(scrollYProgress, P, [-28, -44, -44, -22, -32, -46, -34]);

  // Scroll-driven angle + a small continuous idle oscillation. The amplitudes
  // stay low so the scrubbed routine still reads clearly.
  const a1c = useTransform(() => a1.get() + Math.sin(time.get() / 900) * 2.2 * idleRef.current);
  const a2c = useTransform(() => a2.get() + Math.sin(time.get() / 680 + 1.1) * 2.8 * idleRef.current);
  const a3c = useTransform(() => a3.get() + Math.sin(time.get() / 1120 + 2.3) * 2.0 * idleRef.current);

  const j1 = useMotionTemplate`rotate(${a1c})`;
  const j2 = useMotionTemplate`rotate(${a2c})`;
  const j3 = useMotionTemplate`rotate(${a3c})`;

  // Gripper open(0) → closed(1)
  const close = useTransform(scrollYProgress, [0, 0.28, 0.34, 0.8, 0.9, 1], [0, 0, 1, 1, 0, 0]);
  const fingerPos = useTransform(close, [0, 1], [13, 5]);
  const fingerNeg = useTransform(close, [0, 1], [-13, -5]);
  const fingerLT = useMotionTemplate`translate(${fingerNeg} 0)`;
  const fingerRT = useMotionTemplate`translate(${fingerPos} 0)`;

  // Payload hand-off: object on the left platform → carried → right platform
  const leftOp = useTransform(scrollYProgress, [0, 0.3, 0.34], [1, 1, 0]);
  const heldOp = useTransform(scrollYProgress, [0, 0.3, 0.34, 0.82, 0.9], [0, 0, 1, 1, 0]);
  const rightOp = useTransform(scrollYProgress, [0, 0.86, 0.92], [0, 0, 1]);

  // Progress bar width + a coarse stage label (≤5 re-renders, not per-frame)
  const barW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = p < 0.18 ? 0 : p < 0.34 ? 1 : p < 0.68 ? 2 : p < 0.86 ? 3 : 4;
    setStage((cur) => (cur === next ? cur : next));
  });

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-rule"
      style={{ height: reduced ? "auto" : "300vh" }}
      aria-label="Interactive robotics demonstration: a robotic arm performing a scroll-driven pick-and-place routine."
    >
      <div
        className={reduced ? "relative" : "sticky top-0"}
        style={{ height: reduced ? "auto" : "100vh", overflow: "hidden" }}
      >
        {/* Blueprint grid wash */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,169,97,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,97,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, #000 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, #000 30%, transparent 80%)",
          }}
        />

        {/* Header */}
        <div className="container relative z-10 pt-20 md:pt-24">
          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <p className="eyebrow">Live routine</p>
            </div>
            <div className="md:col-span-9 max-w-2xl">
              <h2
                className="text-cream"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                A pick-and-place,{" "}
                <span style={{ color: "var(--color-muted)", fontStyle: "italic" }}>
                  scrubbed by your scroll.
                </span>
              </h2>
              <p
                className="mt-4"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.6,
                }}
              >
                The same motion logic behind my UR5e robotics work — keep
                scrolling to run the routine end to end.
              </p>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="relative w-full" style={{ maxWidth: 760 }}>
            {/* Corner brackets — echoes the cursor reticle */}
            {(["tl", "tr", "bl", "br"] as const).map((c) => (
              <span
                key={c}
                aria-hidden
                className="absolute w-6 h-6 pointer-events-none"
                style={{
                  top: c[0] === "t" ? 0 : undefined,
                  bottom: c[0] === "b" ? 0 : undefined,
                  left: c[1] === "l" ? 0 : undefined,
                  right: c[1] === "r" ? 0 : undefined,
                  borderTop: c[0] === "t" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                  borderBottom: c[0] === "b" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                  borderLeft: c[1] === "l" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                  borderRight: c[1] === "r" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                }}
              />
            ))}

            {/* Horizontal scanner sweep */}
            {!reduced && (
              <div
                aria-hidden
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  width: 2,
                  background: "linear-gradient(to bottom, transparent, rgba(201,169,97,0.5), transparent)",
                  animation: "armScanSweep 6s ease-in-out infinite",
                }}
              />
            )}

            <svg viewBox="0 0 640 460" width="100%" height="100%" fill="none" style={{ display: "block" }}>
              {/* Work surface */}
              <line x1="70" y1="392" x2="570" y2="392" stroke={strokeDim} strokeWidth="1.5" />
              {Array.from({ length: 11 }).map((_, i) => (
                <line
                  key={i}
                  x1={80 + i * 48}
                  y1="392"
                  x2={70 + i * 48}
                  y2="402"
                  stroke={strokeDim}
                  strokeWidth="1"
                />
              ))}

              {/* Pick platform (left) + place platform (right) */}
              <rect x="96" y="372" width="74" height="10" rx="2" stroke={stroke} strokeWidth="1.2" />
              <rect x="470" y="372" width="74" height="10" rx="2" stroke={stroke} strokeWidth="1.2" />
              <text x="133" y="420" textAnchor="middle" fill={strokeDim} fontSize="10" fontFamily="var(--font-sans)" letterSpacing="2">PICK</text>
              <text x="507" y="420" textAnchor="middle" fill={strokeDim} fontSize="10" fontFamily="var(--font-sans)" letterSpacing="2">PLACE</text>

              {/* Static payloads on the platforms */}
              <motion.g style={{ opacity: leftOp }}>
                <rect x="120" y="350" width="26" height="22" rx="3" fill="rgba(201,169,97,0.16)" stroke={accent} strokeWidth="1.3" />
              </motion.g>
              <motion.g style={{ opacity: rightOp }}>
                <rect x="494" y="350" width="26" height="22" rx="3" fill="rgba(201,169,97,0.16)" stroke={accent} strokeWidth="1.3" />
              </motion.g>

              {/* ── Robot base ── */}
              <g transform="translate(320,392)">
                <rect x="-46" y="0" width="92" height="20" rx="4" fill="rgba(18,18,22,0.95)" stroke={stroke} strokeWidth="1.5" />
                <rect x="-22" y="-16" width="44" height="18" rx="4" fill="rgba(13,13,16,0.95)" stroke={stroke} strokeWidth="1.5" />
                <circle cx="0" cy="14" r="2" fill={accent} style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />

                {/* Shoulder joint */}
                <g transform="translate(0,-12)">
                  <motion.g transform={j1}>
                    <Link length={132} width={20} />
                    <Joint r={11} />

                    {/* Elbow */}
                    <g transform="translate(0,-132)">
                      <motion.g transform={j2}>
                        <Link length={118} width={16} />
                        <Joint r={9} />

                        {/* Wrist */}
                        <g transform="translate(0,-118)">
                          <motion.g transform={j3}>
                            <Joint r={7} />
                            {/* Wrist plate */}
                            <rect x="-12" y="-30" width="24" height="26" rx="4" fill="rgba(18,18,22,0.95)" stroke={stroke} strokeWidth="1.4" />
                            <circle cx="0" cy="-34" r="2.4" fill={accent} style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />

                            {/* Gripper fingers (open/close along x) */}
                            <motion.g transform={fingerLT}>
                              <path d="M -3 -30 L -3 -50 L -8 -56" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </motion.g>
                            <motion.g transform={fingerRT}>
                              <path d="M 3 -30 L 3 -50 L 8 -56" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </motion.g>

                            {/* Carried payload — travels with the gripper */}
                            <motion.g style={{ opacity: heldOp }}>
                              <rect x="-13" y="-58" width="26" height="22" rx="3" fill="rgba(201,169,97,0.2)" stroke={accent} strokeWidth="1.3" />
                            </motion.g>
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Telemetry HUD */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 md:pb-14">
          <div className="container flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p
                className="text-xs tabular mb-2"
                style={{ fontFamily: "var(--font-sans)", color: "var(--color-accent)", letterSpacing: "0.15em" }}
              >
                ROUTINE 01 · UR5e
              </p>
              <p
                className="text-cream"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                }}
              >
                {String(stage + 1).padStart(2, "0")} / 05 · {STAGES[stage]}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {STAGES.map((s, i) => (
                <span
                  key={s}
                  className="text-[10px] px-2.5 py-1 border transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.12em",
                    color: i === stage ? "var(--color-ink)" : "var(--color-muted)",
                    background: i === stage ? "var(--color-accent)" : "transparent",
                    borderColor: i <= stage ? "var(--color-accent)" : "var(--color-rule)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Progress track */}
          <div className="container mt-5">
            <div className="h-px w-full" style={{ background: "var(--color-rule)" }}>
              <motion.div className="h-px" style={{ width: barW, background: "var(--color-accent)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
