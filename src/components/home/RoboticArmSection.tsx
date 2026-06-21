"use client";

/**
 * RoboticArmSection — scroll-pinned, robotics-themed centerpiece.
 * Drop at: src/components/home/RoboticArmSection.tsx
 * Render it on the home page between two of your existing sections, e.g.
 * after <HeroSection /> or before <SelectedWork />.
 *
 * A six-axis arm powers up and traces a constellation (2-bone IK) as you
 * scroll through the pinned section, with live telemetry HUD. Uses your
 * existing CSS tokens (--color-ink / --color-cream / --color-accent /
 * --font-display / --font-sans) so it matches automatically. Your global
 * <SpaceBackground /> already supplies the starfield behind it.
 *
 * IMPORTANT: do NOT put overflow-x:hidden / overflow:hidden on any ancestor
 * of this section — it breaks position:sticky (clip horizontal overflow on
 * <body> with `max-width:100%` instead).
 */

import { useEffect, useRef } from "react";

const VTX_THRESH = [0, 0.2, 0.4, 0.6, 0.8];
const STAR_PATH = "M350,285 L405.9,456.9 L259.7,350.6 L440.3,350.6 L294,456.9 Z";

export function RoboticArmSection() {
  const pinRef = useRef<HTMLElement>(null);
  const upperArm = useRef<SVGLineElement>(null);
  const foreArm = useRef<SVGLineElement>(null);
  const elbow = useRef<SVGCircleElement>(null);
  const baseGlow = useRef<SVGCircleElement>(null);
  const gripper = useRef<SVGGElement>(null);
  const tipGlow = useRef<SVGCircleElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const vtx = [
    useRef<SVGCircleElement>(null),
    useRef<SVGCircleElement>(null),
    useRef<SVGCircleElement>(null),
    useRef<SVGCircleElement>(null),
    useRef<SVGCircleElement>(null),
  ];
  const phase = useRef<HTMLDivElement>(null);
  const j1 = useRef<HTMLSpanElement>(null);
  const j2 = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const torque = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const BASE = { x: 180, y: 500 };
    const L1 = 200, L2 = 200;
    const REST = { x: 250, y: 470 };
    const V0 = { x: 350, y: 285 };
    const pathLen = trace.current?.getTotalLength() ?? 904;

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const smooth = (t: number) => t * t * (3 - 2 * t);

    let targetP = 0;
    let sp = 0;
    let raf = 0;

    const onScroll = () => {
      const sec = pinRef.current;
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      targetP = clamp(-r.top / Math.max(1, total), 0, 1);
    };

    const update = (p: number) => {
      let tip: { x: number; y: number };
      let pathProg = 0;
      if (p < 0.22) {
        const k = smooth(clamp(p / 0.22, 0, 1));
        tip = { x: lerp(REST.x, V0.x, k), y: lerp(REST.y, V0.y, k) };
      } else {
        pathProg = smooth(clamp((p - 0.22) / 0.66, 0, 1));
        const pt = trace.current!.getPointAtLength(pathLen * pathProg);
        tip = { x: pt.x, y: pt.y };
      }
      // 2-bone IK
      const dx = tip.x - BASE.x, dy = tip.y - BASE.y;
      const d = clamp(Math.hypot(dx, dy), 1, L1 + L2 - 0.5);
      const a1 = Math.atan2(dy, dx);
      const a2 = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
      const sh = a1 - a2;
      const ex = BASE.x + L1 * Math.cos(sh), ey = BASE.y + L1 * Math.sin(sh);
      const foreAng = Math.atan2(tip.y - ey, tip.x - ex);

      upperArm.current?.setAttribute("x2", ex.toFixed(1));
      upperArm.current?.setAttribute("y2", ey.toFixed(1));
      foreArm.current?.setAttribute("x1", ex.toFixed(1));
      foreArm.current?.setAttribute("y1", ey.toFixed(1));
      foreArm.current?.setAttribute("x2", tip.x.toFixed(1));
      foreArm.current?.setAttribute("y2", tip.y.toFixed(1));
      elbow.current?.setAttribute("cx", ex.toFixed(1));
      elbow.current?.setAttribute("cy", ey.toFixed(1));
      if (gripper.current)
        gripper.current.style.transform = `translate(${tip.x.toFixed(1)}px,${tip.y.toFixed(1)}px) rotate(${(foreAng * 180 / Math.PI).toFixed(1)}deg)`;
      tipGlow.current?.setAttribute("cx", tip.x.toFixed(1));
      tipGlow.current?.setAttribute("cy", tip.y.toFixed(1));
      tipGlow.current?.setAttribute("opacity", p > 0.05 ? "0.9" : "0");

      if (trace.current) {
        trace.current.style.strokeDasharray = pathLen.toFixed(1);
        trace.current.style.strokeDashoffset = (pathLen * (1 - pathProg)).toFixed(1);
      }
      vtx.forEach((r, i) => {
        const on = pathProg >= VTX_THRESH[i] - 0.001 && p >= 0.22;
        const c = r.current;
        if (!c) return;
        c.setAttribute("r", on ? "3.4" : "2");
        c.setAttribute("opacity", on ? "1" : "0.18");
        c.setAttribute("fill", on ? "#C9A961" : "#F4EFE6");
        c.style.filter = on ? "drop-shadow(0 0 5px #C9A961)" : "none";
      });
      baseGlow.current?.setAttribute("opacity", clamp(p / 0.08, 0.3, 1).toFixed(2));

      const ph = p < 0.08 ? "Powering up" : p < 0.22 ? "Calibrating axes" : p < 0.92 ? "Tracing asterism" : "Axis locked";
      if (phase.current && phase.current.textContent !== ph) phase.current.textContent = ph;
      if (j1.current) j1.current.textContent = (sh * 180 / Math.PI).toFixed(1) + "°";
      if (j2.current) j2.current.textContent = ((foreAng - sh) * 180 / Math.PI).toFixed(1) + "°";
      if (pct.current) pct.current.textContent = Math.round(pathProg * 100) + "%";
      if (torque.current) torque.current.style.width = clamp(8 + Math.abs(Math.sin(p * Math.PI)) * 70 + pathProg * 18, 8, 100).toFixed(0) + "%";
      if (caption.current) {
        const cap = p < 0.22 ? "Six axes. One trajectory." : p < 0.92 ? "Drawing the asterism, joint by joint." : "Locked. Every cycle accounted for.";
        if (caption.current.textContent !== cap) caption.current.textContent = cap;
      }
    };

    const loop = () => {
      sp += (targetP - sp) * 0.12;
      update(sp);
      raf = requestAnimationFrame(loop);
    };

    onScroll();
    if (reduce) {
      update(1); // show finished state, no loop
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const hudLabel: React.CSSProperties = {
    fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase",
    color: "rgba(244,239,230,0.4)",
  };
  const teleRow: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", gap: "1.4rem",
    fontSize: "0.72rem", color: "rgba(244,239,230,0.55)", marginBottom: "0.5rem",
  };

  return (
    <section ref={pinRef} style={{ position: "relative", zIndex: 5, height: "360vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* top-left phase */}
        <div style={{ position: "absolute", top: "clamp(1.5rem,5vh,3rem)", left: "clamp(1.5rem,5vw,4rem)", zIndex: 10 }}>
          <div style={{ ...hudLabel, marginBottom: "0.5rem" }}>System state</div>
          <div ref={phase} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,3.2vw,2.6rem)", fontWeight: 300, color: "var(--color-accent)" }}>Standby</div>
        </div>
        {/* top-right telemetry */}
        <div style={{ position: "absolute", top: "clamp(1.5rem,5vh,3rem)", right: "clamp(1.5rem,5vw,4rem)", zIndex: 10, textAlign: "right", minWidth: 180 }}>
          <div style={{ ...hudLabel, marginBottom: "0.9rem" }}>Telemetry</div>
          <div style={teleRow}><span>θ shoulder</span><span ref={j1} style={{ color: "var(--color-cream)", fontVariantNumeric: "tabular-nums" }}>0.0°</span></div>
          <div style={teleRow}><span>θ elbow</span><span ref={j2} style={{ color: "var(--color-cream)", fontVariantNumeric: "tabular-nums" }}>0.0°</span></div>
          <div style={{ ...teleRow, marginBottom: "0.7rem" }}><span>trace</span><span ref={pct} style={{ color: "var(--color-accent)", fontVariantNumeric: "tabular-nums" }}>0%</span></div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(244,239,230,0.35)", marginBottom: "0.4rem" }}>Servo torque</div>
          <div style={{ width: "100%", height: 2, background: "rgba(244,239,230,0.12)" }}><div ref={torque} style={{ height: 2, width: "8%", background: "var(--color-accent)", boxShadow: "0 0 5px var(--color-accent)" }} /></div>
        </div>

        <svg viewBox="0 0 700 600" style={{ width: "min(94vw,1040px)", height: "auto", maxHeight: "86vh", overflow: "visible" }}>
          <defs>
            <radialGradient id="tipG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#C9A961" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line x1="40" y1="520" x2="360" y2="520" stroke="rgba(244,239,230,0.12)" strokeWidth="1" />
          <path d={STAR_PATH} fill="none" stroke="rgba(244,239,230,0.10)" strokeWidth="1" strokeDasharray="2 5" />
          <path ref={trace} d={STAR_PATH} fill="none" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px rgba(201,169,97,0.7))" }} />
          <g>
            <circle ref={vtx[0]} cx="350" cy="285" r="2" fill="#F4EFE6" opacity="0.18" />
            <circle ref={vtx[1]} cx="405.9" cy="456.9" r="2" fill="#F4EFE6" opacity="0.18" />
            <circle ref={vtx[2]} cx="259.7" cy="350.6" r="2" fill="#F4EFE6" opacity="0.18" />
            <circle ref={vtx[3]} cx="440.3" cy="350.6" r="2" fill="#F4EFE6" opacity="0.18" />
            <circle ref={vtx[4]} cx="294" cy="456.9" r="2" fill="#F4EFE6" opacity="0.18" />
          </g>
          <rect x="150" y="500" width="60" height="22" rx="3" fill="none" stroke="rgba(244,239,230,0.5)" strokeWidth="1.5" />
          <circle ref={baseGlow} cx="180" cy="500" r="6" fill="none" stroke="#C9A961" strokeWidth="1.5" opacity="0.3" />
          <circle cx="180" cy="500" r="11" fill="none" stroke="rgba(244,239,230,0.3)" strokeWidth="1.5" />
          <line ref={upperArm} x1="180" y1="500" x2="240" y2="470" stroke="rgba(244,239,230,0.7)" strokeWidth="6" strokeLinecap="round" />
          <line ref={foreArm} x1="240" y1="470" x2="300" y2="430" stroke="rgba(244,239,230,0.7)" strokeWidth="5" strokeLinecap="round" />
          <circle ref={elbow} cx="240" cy="470" r="7" fill="#0B0B0C" stroke="#C9A961" strokeWidth="1.6" />
          <g ref={gripper} style={{ transform: "translate(300px,430px)" }}>
            <circle cx="0" cy="0" r="5.5" fill="#0B0B0C" stroke="#C9A961" strokeWidth="1.6" />
            <line x1="4" y1="-6" x2="13" y2="-9" stroke="#C9A961" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="4" y1="6" x2="13" y2="9" stroke="#C9A961" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="11" y1="-9" x2="11" y2="9" stroke="rgba(244,239,230,0.4)" strokeWidth="1" strokeLinecap="round" />
          </g>
          <circle ref={tipGlow} cx="300" cy="430" r="16" fill="url(#tipG)" opacity="0" />
        </svg>

        <div ref={caption} style={{ position: "absolute", bottom: "clamp(1.5rem,5vh,3rem)", left: "50%", transform: "translateX(-50%)", zIndex: 10, fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(244,239,230,0.45)" }}>
          Six axes. One trajectory.
        </div>
      </div>
    </section>
  );
}
