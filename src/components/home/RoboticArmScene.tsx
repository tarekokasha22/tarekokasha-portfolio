"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  useTime,
} from "motion/react";

/* ──────────────────────────────────────────────────────────────────
   UR5e pick-and-place — autonomous, always running.

   The arm runs its routine on its own clock (no scroll required): it
   slides left to the PICK platform, folds down and grips the payload,
   sweeps right to PLACE it, then shuttles back the other way. A smooth
   ping-pong loop driven by useTime() keeps it in perpetual motion.

   Forward kinematics: nested SVG <g translate> + <motion.g rotate>.
   Each joint sits at local (0,0) of a translated group, so rotate()
   spins around the joint centre without transform-origin hacks.
   ────────────────────────────────────────────────────────────────── */

const stroke     = "rgba(244,239,230,0.6)";
const strokeDim  = "rgba(244,239,230,0.22)";
const accent     = "#C9A961";

const PICK_X  = 162;   // x-centre of the pick platform
const PLACE_X = 478;   // x-centre of the place platform
const BASE_Y  = 400;   // normal carriage y (work surface level)

const CYCLE = 11000;   // ms for a full forward sweep (ping-pong doubles it)

function Link({ length, width = 18 }: { length: number; width?: number }) {
  return (
    <g>
      <rect
        x={-width / 2} y={-length}
        width={width}  height={length + width / 2}
        rx={width / 2}
        fill="rgba(18,18,22,0.9)" stroke={stroke} strokeWidth={1.5}
      />
      <line x1={0} y1={-length + 6} x2={0} y2={-6} stroke={strokeDim} strokeWidth={1} />
    </g>
  );
}

function Joint({ r = 9 }: { r?: number }) {
  return (
    <>
      <circle cx={0} cy={0} r={r}           fill="rgba(13,13,16,0.95)" stroke={stroke} strokeWidth={1.5} />
      <circle cx={0} cy={0} r={r * 0.42}    fill="none"                stroke={accent} strokeWidth={1.2} />
    </>
  );
}

const STAGES = ["APPROACH", "GRIP", "TRANSFER", "PLACE", "RELEASE"] as const;

export function RoboticArmScene() {
  const [stage, setStage] = useState(0);
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    reducedRef.current = r;
  }, []);

  // ── Autonomous clock → ping-pong progress 0→1→0 ──
  const time = useTime();
  const progress = useTransform(() => {
    // Reduced motion: hold the arm in a composed "grip" pose, no animation
    if (reducedRef.current) return 0.30;
    const raw = (time.get() % CYCLE) / CYCLE;          // 0 → 1 sawtooth
    const tri = raw < 0.5 ? raw * 2 : 2 - raw * 2;     // 0 → 1 → 0 triangle
    return tri * tri * (3 - 2 * tri);                  // smoothstep ease
  });

  /* ────────────────────────────────────────────────────
     Keyframe timeline (driven by `progress`)
     p=0    : home centre (320)
     p=0.15 : sliding toward pick  (~230)
     p=0.30 : at pick  (162) — arm folds DOWN to platform
     p=0.50 : in transit, crossing stage  (~320)
     p=0.70 : at place (478) — arm folds DOWN to platform
     p=0.85 : sliding back (~500)
     p=1.0  : home centre (320)
  ──────────────────────────────────────────────────── */
  const P = [0, 0.15, 0.30, 0.50, 0.70, 0.85, 1.0];

  // ── Rail carriage X: the whole arm translates left then right ──
  const bx = useTransform(progress, P, [320, 230, PICK_X, 320, PLACE_X, 500, 320]);
  // ── Carriage Y: dips down at pick/place so the arm reaches the platform ──
  const by = useTransform(progress, P, [BASE_Y, BASE_Y + 4, BASE_Y + 10, BASE_Y, BASE_Y + 10, BASE_Y + 4, BASE_Y]);
  const baseT = useMotionTemplate`translate(${bx} ${by})`;

  /* ────────────────────────────────────────────────────
     Joint angles  (degrees, clockwise from vertical)
     At GRIP / PLACE the elbow folds to ~160° — nearly
     doubled back — which brings the wrist DOWN close to
     the platform even though the base is floor-level.
  ──────────────────────────────────────────────────── */
  const a1 = useTransform(progress, P, [-10, -18, -22,  0,  22,  18,  10]);
  const a2 = useTransform(progress, P, [ 52, 115, 160, 44, 160, 115,  52]);
  const a3 = useTransform(progress, P, [-26, -48,  70,-18,  -70,  48,  26]);

  const j1 = useMotionTemplate`rotate(${a1})`;
  const j2 = useMotionTemplate`rotate(${a2})`;
  const j3 = useMotionTemplate`rotate(${a3})`;

  // ── Gripper: open → close → carry → open ──
  const close     = useTransform(progress, [0, 0.27, 0.33, 0.78, 0.88, 1], [0, 0, 1, 1, 0, 0]);
  const fingerPos = useTransform(close, [0, 1], [13, 5]);
  const fingerNeg = useTransform(close, [0, 1], [-13, -5]);
  const fingerLT  = useMotionTemplate`translate(${fingerNeg} 0)`;
  const fingerRT  = useMotionTemplate`translate(${fingerPos} 0)`;

  // ── Payload hand-off ──
  const leftOp  = useTransform(progress, [0, 0.30, 0.35], [1, 1, 0]);
  const heldOp  = useTransform(progress, [0, 0.30, 0.35, 0.80, 0.90], [0, 0, 1, 1, 0]);
  const rightOp = useTransform(progress, [0, 0.85, 0.93], [0, 0, 1]);

  const barW = useTransform(progress, [0, 1], ["8%", "100%"]);

  useMotionValueEvent(progress, "change", (p) => {
    const next = p < 0.18 ? 0 : p < 0.36 ? 1 : p < 0.66 ? 2 : p < 0.88 ? 3 : 4;
    setStage((cur) => (cur === next ? cur : next));
  });

  return (
    <section
      className="relative border-t border-rule overflow-hidden"
      aria-label="Interactive robotics: a rail-mounted arm running an autonomous pick-and-place routine."
    >
      <div className="relative" style={{ minHeight: "100vh" }}>
        {/* Blueprint grid */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            "linear-gradient(rgba(201,169,97,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,97,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, #000 30%, transparent 80%)",
        }} />

        {/* Header */}
        <div className="container relative z-10 pt-20 md:pt-24">
          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <p className="eyebrow">Live routine</p>
            </div>
            <div className="md:col-span-9 max-w-2xl">
              <h2 className="text-cream" style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                A pick-and-place,{" "}
                <span style={{ color: "var(--color-muted)", fontStyle: "italic" }}>running on its own.</span>
              </h2>
              <p className="mt-4" style={{
                fontFamily: "var(--font-sans)", fontSize: "0.95rem",
                color: "var(--color-muted)", lineHeight: 1.6,
              }}>
                The arm slides on its rail, reaches down to grip, sweeps
                across, and places — then shuttles back and does it again.
                The same motion logic behind my UR5e robotics work, looping
                live.
              </p>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="relative w-full" style={{ maxWidth: 760 }}>
            {/* Corner brackets */}
            {(["tl","tr","bl","br"] as const).map((c) => (
              <span key={c} aria-hidden className="absolute w-6 h-6 pointer-events-none" style={{
                top:    c[0]==="t" ? 0 : undefined, bottom: c[0]==="b" ? 0 : undefined,
                left:   c[1]==="l" ? 0 : undefined, right:  c[1]==="r" ? 0 : undefined,
                borderTop:    c[0]==="t" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                borderBottom: c[0]==="b" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                borderLeft:   c[1]==="l" ? `1px solid rgba(201,169,97,0.4)` : undefined,
                borderRight:  c[1]==="r" ? `1px solid rgba(201,169,97,0.4)` : undefined,
              }} />
            ))}

            {/* Horizontal scanner sweep */}
            {!reduced && (
              <div aria-hidden className="absolute top-0 bottom-0 pointer-events-none" style={{
                width: 2,
                background: "linear-gradient(to bottom, transparent, rgba(201,169,97,0.5), transparent)",
                animation: "armScanSweep 6s ease-in-out infinite",
              }} />
            )}

            <svg viewBox="0 0 640 460" width="100%" height="100%" fill="none" style={{ display: "block" }}>

              {/* ── Rail track ── */}
              <rect x="72" y={BASE_Y + 2} width="496" height="16" rx="3"
                fill="rgba(16,16,20,0.85)" stroke={strokeDim} strokeWidth="1.2" />
              <line x1="80" y1={BASE_Y + 4} x2="560" y2={BASE_Y + 4} stroke={stroke} strokeWidth="1" />
              {Array.from({ length: 25 }).map((_, i) => (
                <line key={i}
                  x1={80 + i * 20} y1={BASE_Y + 2}
                  x2={80 + i * 20} y2={BASE_Y + 18}
                  stroke={strokeDim} strokeWidth="0.8" />
              ))}
              <rect x="68" y={BASE_Y - 2} width="8" height="22" rx="2"
                fill="rgba(18,18,22,0.95)" stroke={stroke} strokeWidth="1.2" />
              <rect x="564" y={BASE_Y - 2} width="8" height="22" rx="2"
                fill="rgba(18,18,22,0.95)" stroke={stroke} strokeWidth="1.2" />

              <line x1="70" y1={BASE_Y} x2="570" y2={BASE_Y} stroke={strokeDim} strokeWidth="1" />

              {/* ── PICK platform ── */}
              <rect x={PICK_X - 38} y={BASE_Y - 22} width="76" height="12" rx="2"
                fill="rgba(16,16,20,0.6)" stroke={stroke} strokeWidth="1.2" />
              <text x={PICK_X} y={BASE_Y + 32} textAnchor="middle"
                fill={strokeDim} fontSize="10" fontFamily="var(--font-sans)" letterSpacing="2">PICK</text>

              {/* ── PLACE platform ── */}
              <rect x={PLACE_X - 38} y={BASE_Y - 22} width="76" height="12" rx="2"
                fill="rgba(16,16,20,0.6)" stroke={stroke} strokeWidth="1.2" />
              <text x={PLACE_X} y={BASE_Y + 32} textAnchor="middle"
                fill={strokeDim} fontSize="10" fontFamily="var(--font-sans)" letterSpacing="2">PLACE</text>

              {/* ── Static payloads ── */}
              <motion.g style={{ opacity: leftOp }}>
                <rect x={PICK_X - 13}  y={BASE_Y - 44} width="26" height="22" rx="3"
                  fill="rgba(201,169,97,0.16)" stroke={accent} strokeWidth="1.3" />
              </motion.g>
              <motion.g style={{ opacity: rightOp }}>
                <rect x={PLACE_X - 13} y={BASE_Y - 44} width="26" height="22" rx="3"
                  fill="rgba(201,169,97,0.16)" stroke={accent} strokeWidth="1.3" />
              </motion.g>

              {/* ── Arm assembly: carriage rides on the rail ── */}
              <motion.g transform={baseT}>
                <rect x="-30" y="-2" width="60" height="18" rx="3"
                  fill="rgba(13,13,16,0.96)" stroke={stroke} strokeWidth="1.5" />
                <rect x="-16" y="-14" width="32" height="16" rx="3"
                  fill="rgba(18,18,22,0.95)" stroke={stroke} strokeWidth="1.3" />
                <circle cx="0" cy="7" r="2.2" fill={accent}
                  style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />

                {/* ── Shoulder joint ── */}
                <g transform="translate(0,-12)">
                  <motion.g transform={j1}>
                    <Link length={132} width={20} />
                    <Joint r={11} />

                    {/* ── Elbow ── */}
                    <g transform="translate(0,-132)">
                      <motion.g transform={j2}>
                        <Link length={118} width={16} />
                        <Joint r={9} />

                        {/* ── Wrist ── */}
                        <g transform="translate(0,-118)">
                          <motion.g transform={j3}>
                            <Joint r={7} />
                            <rect x="-12" y="-30" width="24" height="26" rx="4"
                              fill="rgba(18,18,22,0.95)" stroke={stroke} strokeWidth="1.4" />
                            <circle cx="0" cy="-34" r="2.4" fill={accent}
                              style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />

                            {/* Gripper fingers */}
                            <motion.g transform={fingerLT}>
                              <path d="M -3 -30 L -3 -50 L -8 -56"
                                stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </motion.g>
                            <motion.g transform={fingerRT}>
                              <path d="M 3 -30 L 3 -50 L 8 -56"
                                stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </motion.g>

                            {/* Carried payload — child of wrist, travels with it */}
                            <motion.g style={{ opacity: heldOp }}>
                              <rect x="-13" y="-58" width="26" height="22" rx="3"
                                fill="rgba(201,169,97,0.2)" stroke={accent} strokeWidth="1.3" />
                            </motion.g>
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>
              </motion.g>

            </svg>
          </div>
        </div>

        {/* Telemetry HUD */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 md:pb-14">
          <div className="container flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs tabular mb-2"
                style={{ fontFamily: "var(--font-sans)", color: "var(--color-accent)", letterSpacing: "0.15em" }}>
                ROUTINE 01 · UR5e
              </p>
              <p className="text-cream" style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: 300, letterSpacing: "0.04em",
              }}>
                {String(stage + 1).padStart(2, "0")} / 05 · {STAGES[stage]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {STAGES.map((s, i) => (
                <span key={s} className="text-[10px] px-2.5 py-1 border transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-sans)", letterSpacing: "0.12em",
                    color:       i === stage ? "var(--color-ink)"    : "var(--color-muted)",
                    background:  i === stage ? "var(--color-accent)" : "transparent",
                    borderColor: i === stage  ? "var(--color-accent)" : "var(--color-rule)",
                  }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
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
