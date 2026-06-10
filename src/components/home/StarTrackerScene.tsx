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
   STAR-TRACKER — a scroll-scrubbed star-tracker / orbital gimbal.
   The section pins and a two-axis robotic gimbal acquires a star field,
   aligns, locks its boresight onto a target star, scans, and syncs a
   constellation — all driven by scroll progress. Concentric rings keep
   a slow idle rotation so the instrument is alive even at rest.
   ────────────────────────────────────────────────────────────────── */

const stroke = "rgba(244,239,230,0.6)";
const strokeDim = "rgba(244,239,230,0.2)";
const accent = "#C9A961";

const CX = 320;
const CY = 304;

// Deterministic starfield (seeded) — same on server + client, no hydration drift
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260610);
const FIELD = Array.from({ length: 64 }, () => ({
  x: rand() * 640,
  y: rand() * 320,
  r: 0.4 + rand() * 1.4,
  o: 0.12 + rand() * 0.5,
  tw: rand() > 0.78,
  delay: (rand() * 4).toFixed(2),
}));

// Constellation the tracker assembles (a dipper-like arc)
const CON = [
  { x: 138, y: 150 },
  { x: 212, y: 116 },
  { x: 286, y: 142 },
  { x: 360, y: 110 }, // target / boresight lock star
  { x: 434, y: 150 },
  { x: 456, y: 226 },
  { x: 374, y: 248 },
];
const CON_PATH =
  "M" + CON.map((p) => `${p.x} ${p.y}`).join(" L ");
const TARGET = CON[3];

const STAGES = ["ACQUIRE", "ALIGN", "LOCK", "SCAN", "SYNC"] as const;

export function StarTrackerScene() {
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

  const time = useTime();

  // ── Gimbal rotation: scroll-driven alignment + continuous idle drift ──
  const outerBase = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const midBase = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const tickBase = useTransform(scrollYProgress, [0, 1], [0, 84]);

  const outerA = useTransform(() => outerBase.get() + (time.get() / 150) * idleRef.current);
  const midA = useTransform(() => midBase.get() - (time.get() / 220) * idleRef.current);
  const tickA = useTransform(() => tickBase.get() + (time.get() / 110) * idleRef.current);

  const outerT = useMotionTemplate`rotate(${outerA} ${CX} ${CY})`;
  const midT = useMotionTemplate`rotate(${midA} ${CX} ${CY})`;
  const tickT = useMotionTemplate`rotate(${tickA} ${CX} ${CY})`;

  // ── Two-axis gimbal yoke tilt — points the optic toward the target ──
  const yawA = useTransform(scrollYProgress, [0, 0.4, 0.55, 1], [-18, -18, 6, 6]);
  const yawT = useMotionTemplate`rotate(${yawA} ${CX} ${CY})`;

  // ── Boresight beam draws from the optic to the target star at LOCK ──
  const beamLen = useTransform(scrollYProgress, [0.4, 0.54], [0, 1]);
  const beamOp = useTransform(scrollYProgress, [0.38, 0.5, 0.96, 1], [0, 0.75, 0.75, 0.45]);

  // ── Lock reticle converges on the target star ──
  const lockOp = useTransform(scrollYProgress, [0.42, 0.52], [0, 1]);
  const lockScale = useTransform(scrollYProgress, [0.42, 0.58], [2.1, 1]);
  const lockSpin = useTransform(() => (time.get() / 26) * idleRef.current);
  const lockT = useMotionTemplate`translate(${TARGET.x} ${TARGET.y}) scale(${lockScale}) rotate(${lockSpin})`;

  // ── Constellation lines draw in across SCAN ──
  const conLen = useTransform(scrollYProgress, [0.5, 0.86], [0, 1]);
  const conOp = useTransform(scrollYProgress, [0.48, 0.56], [0, 1]);

  // ── Expanding scan ring at SCAN stage ──
  const scanR = useTransform(scrollYProgress, [0.6, 0.84], [10, 150]);
  const scanOp = useTransform(scrollYProgress, [0.6, 0.72, 0.84], [0, 0.4, 0]);

  // ── Optic core charges up toward SYNC ──
  const coreOp = useTransform(scrollYProgress, [0.8, 0.95], [0.35, 1]);
  const coreR = useTransform(scrollYProgress, [0.8, 0.95], [9, 13]);

  // Progress bar + coarse stage label (≤5 re-renders, not per-frame)
  const barW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.6 ? 2 : p < 0.82 ? 3 : 4;
    setStage((cur) => (cur === next ? cur : next));
  });

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-rule"
      style={{ height: reduced ? "auto" : "280vh", background: "var(--color-ink)" }}
      aria-label="Interactive star-tracker: a robotic gimbal acquiring and locking onto a constellation, scrubbed by scroll."
    >
      <div
        className={reduced ? "relative" : "sticky top-0"}
        style={{ height: reduced ? "auto" : "100vh", overflow: "hidden" }}
      >
        {/* Cosmic vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 46%, rgba(201,169,97,0.06), transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="container relative z-10 pt-20 md:pt-24">
          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <p className="eyebrow">Star tracker</p>
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
                Find a fixed point,{" "}
                <span style={{ color: "var(--color-muted)", fontStyle: "italic" }}>
                  then everything aligns.
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
                A two-axis gimbal acquires a star field and locks its boresight —
                the same control discipline I bring to systems that have to stay
                pointed. Scroll to run the routine.
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

            <svg viewBox="0 0 640 460" width="100%" height="100%" fill="none" style={{ display: "block" }}>
              {/* ── Starfield ── */}
              <g>
                {FIELD.map((s, i) => (
                  <circle
                    key={i}
                    cx={s.x}
                    cy={s.y}
                    r={s.r}
                    fill="rgba(244,239,230,0.9)"
                    style={{
                      opacity: s.o,
                      animation: s.tw && !reduced ? `stTwinkle 3.4s ${s.delay}s ease-in-out infinite` : undefined,
                    }}
                  />
                ))}
              </g>

              {/* ── Constellation (draws in across SCAN) ── */}
              <motion.path
                d={CON_PATH}
                stroke={accent}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: conLen, opacity: conOp }}
              />
              {CON.map((p, i) => {
                const ti = 0.5 + i * 0.05;
                return <ConStar key={i} p={p} pr={scrollYProgress} ti={ti} isTarget={i === 3} />;
              })}

              {/* ── Boresight beam from optic to target star ── */}
              <motion.line
                x1={CX}
                y1={CY}
                x2={TARGET.x}
                y2={TARGET.y}
                stroke={accent}
                strokeWidth="1.2"
                strokeDasharray="2 5"
                style={{ pathLength: beamLen, opacity: beamOp }}
              />

              {/* ── Lock reticle on the target ── */}
              <motion.g transform={lockT} style={{ opacity: lockOp }}>
                <circle r="16" fill="none" stroke={accent} strokeWidth="1.2" />
                <path d="M -22 0 L -12 0 M 22 0 L 12 0 M 0 -22 L 0 -12 M 0 22 L 0 12" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
              </motion.g>

              {/* ── Expanding scan ring ── */}
              <motion.circle cx={CX} cy={CY} r={scanR} style={{ opacity: scanOp }} fill="none" stroke={accent} strokeWidth="1" />

              {/* ── Gimbal instrument ── */}
              <motion.g transform={yawT}>
                {/* Outer mount ring (slow idle + scroll spin) */}
                <motion.g transform={outerT}>
                  <circle cx={CX} cy={CY} r="126" fill="none" stroke={strokeDim} strokeWidth="1.4" strokeDasharray="3 9" />
                  {[0, 90, 180, 270].map((a) => {
                    const rad = (a * Math.PI) / 180;
                    return (
                      <rect
                        key={a}
                        x={CX + Math.cos(rad) * 126 - 5}
                        y={CY + Math.sin(rad) * 126 - 5}
                        width="10"
                        height="10"
                        rx="2"
                        fill="rgba(18,18,22,0.95)"
                        stroke={stroke}
                        strokeWidth="1.2"
                      />
                    );
                  })}
                </motion.g>

                {/* Mid gimbal ring (counter-rotates) */}
                <motion.g transform={midT}>
                  <circle cx={CX} cy={CY} r="96" fill="none" stroke={stroke} strokeWidth="1.4" />
                  <circle cx={CX} cy={CY} r="96" fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="40 260" />
                  {/* yoke arms */}
                  <path d={`M ${CX - 96} ${CY} A 96 96 0 0 1 ${CX + 96} ${CY}`} stroke="rgba(244,239,230,0.28)" strokeWidth="3" fill="none" />
                </motion.g>

                {/* Tick ring */}
                <motion.g transform={tickT}>
                  {Array.from({ length: 36 }).map((_, i) => {
                    const a = (i * 10 * Math.PI) / 180;
                    const r0 = 66;
                    const r1 = i % 3 === 0 ? 76 : 72;
                    return (
                      <line
                        key={i}
                        x1={CX + Math.cos(a) * r0}
                        y1={CY + Math.sin(a) * r0}
                        x2={CX + Math.cos(a) * r1}
                        y2={CY + Math.sin(a) * r1}
                        stroke={strokeDim}
                        strokeWidth="1"
                      />
                    );
                  })}
                </motion.g>

                {/* Optic housing */}
                <circle cx={CX} cy={CY} r="54" fill="rgba(13,13,16,0.9)" stroke={stroke} strokeWidth="1.5" />
                <circle cx={CX} cy={CY} r="38" fill="none" stroke={strokeDim} strokeWidth="1" />
                {/* Aperture crosshair */}
                <path d={`M ${CX - 30} ${CY} L ${CX + 30} ${CY} M ${CX} ${CY - 30} L ${CX} ${CY + 30}`} stroke={strokeDim} strokeWidth="1" />
                {/* Charging core */}
                <motion.circle cx={CX} cy={CY} r={coreR} style={{ opacity: coreOp }} fill={accent} />
                <motion.circle
                  cx={CX}
                  cy={CY}
                  r={coreR}
                  style={{ opacity: coreOp }}
                  fill="none"
                  stroke={accent}
                  strokeWidth="1"
                  className="st-core-glow"
                />
              </motion.g>
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
                ORBIT 02 · STAR-TRACKER
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

      <style>{`
        @keyframes stTwinkle {
          0%, 100% { opacity: 0.18; }
          50%      { opacity: 0.85; }
        }
        .st-core-glow { filter: drop-shadow(0 0 6px ${accent}); }
      `}</style>
    </section>
  );
}

/* A constellation node: lights up + pulses as scroll passes its threshold. */
function ConStar({
  p,
  pr,
  ti,
  isTarget,
}: {
  p: { x: number; y: number };
  pr: import("motion/react").MotionValue<number>;
  ti: number;
  isTarget?: boolean;
}) {
  const op = useTransform(pr, [ti - 0.05, ti], [0.2, 1]);
  const r = useTransform(pr, [ti - 0.05, ti], [1.2, isTarget ? 3.4 : 2.4]);
  return (
    <>
      <motion.circle cx={p.x} cy={p.y} r={r} style={{ opacity: op }} fill={accent} />
      {isTarget && (
        <motion.circle
          cx={p.x}
          cy={p.y}
          r="7"
          fill="none"
          stroke={accent}
          strokeWidth="1"
          style={{ opacity: op }}
        />
      )}
    </>
  );
}
