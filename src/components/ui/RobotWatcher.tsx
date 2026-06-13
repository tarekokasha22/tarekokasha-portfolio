"use client";

import { useEffect, useRef, useState } from "react";

export function RobotWatcher() {
  const robotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Smoothly lerped values
  const rendered = useRef({ headRot: 0, pupilX: 0, pupilY: 0, armRot: 0 });
  // Targets driven by mouse
  const target = useRef({ headRot: 0, pupilX: 0, pupilY: 0, armRot: 0 });

  // Direct DOM refs — zero React re-renders
  const headGroupRef = useRef<SVGGElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);
  const leftArmRef = useRef<SVGGElement>(null);
  const rightArmRef = useRef<SVGGElement>(null);
  const antennaLedRef = useRef<SVGCircleElement>(null);
  const visorScanRef = useRef<SVGRectElement>(null);

  const [isAwake, setIsAwake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [excited, setExcited] = useState(false);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const excitedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scanX = useRef(0);
  const waveT = useRef(0);
  // While a contextual message is showing, the robot must stay awake + waving
  const reactingRef = useRef(false);
  const excitedRef = useRef(false);
  const lastPoke = useRef(-1);
  const firstPoke = useRef(true);
  // Proximity: true while the cursor is hovering near/over the robot
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Deadpan lines Thaqib says when you poke him. Named after At-Tariq —
  // the piercing star of Surah 86 — so the jokes ride the line between
  // star, robotics, AI and quiet Cairo confidence. No exclamation marks.
  const POKES = [
    // ── Always the first line you get (index 0) ──
    "You found me. I mostly watch.",
    // ── Funny ──
    "Poke me again. I dare you. Nothing will happen, but I dare you.",
    "Please hire Tarek so I can afford better animations.",
    "I waved back. You did not wave first. This is awkward for both of us.",
    "Fun fact: I cannot leave this corner. Send help. Or snacks.",
    "I have been standing here for 8 hours. My feet are decorative.",
    "I asked for a raise. They gave me a longer wave animation.",
    "My job is standing in a corner. I am crushing it.",
    "I do not blink. It is not a flex, it is a hardware limitation.",
    "Tarek built me in one afternoon. I have feelings about that.",
    "I run on hopes, dreams, and one undocumented function.",
    // ── Robotics ──
    "I have six axes. I use two. Budget cuts.",
    // ── AI / the work ──
    "Trained on starlight and ambitious client briefs.",
    "I read your scroll speed. You are a fast one.",
    // ── Watching / brand ──
    "I see everything. I report almost nothing. Discretion is premium.",
    "He books projects for 2026. I keep the calendar warm.",
    "Beep. Back to work.",
  ];

  // Random pick. First poke is always the intro line (index 0); after that,
  // pick from the rest at random, never repeating the same line twice in a row.
  const pickPoke = () => {
    if (firstPoke.current) {
      firstPoke.current = false;
      lastPoke.current = 0;
      return POKES[0];
    }
    if (POKES.length < 2) return POKES[0];
    // Skip index 0 (the intro) for all subsequent pokes
    let i = 1 + Math.floor(Math.random() * (POKES.length - 1));
    if (i === lastPoke.current) {
      i = i + 1 > POKES.length - 1 ? 1 : i + 1;
    }
    lastPoke.current = i;
    return POKES[i];
  };

  const handlePoke = () => {
    setIsAwake(true);
    clearTimeout(sleepTimer.current);

    const msg = pickPoke();
    reactingRef.current = true;
    excitedRef.current = true;
    setMessage(msg);
    setExcited(true);

    clearTimeout(excitedTimer.current);
    excitedTimer.current = setTimeout(() => {
      excitedRef.current = false;
      reactingRef.current = false;
      setExcited(false);
      setMessage(null);
      clearTimeout(sleepTimer.current);
      sleepTimer.current = setTimeout(() => setIsAwake(false), 4000);
    }, 3600);
  };

  // ── Contextual messages: any element with [data-robot="..."] speaks ──
  useEffect(() => {
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-robot]");
      if (el) {
        const msg = el.getAttribute("data-robot");
        if (msg) {
          reactingRef.current = true;
          setMessage(msg);
          setIsAwake(true);
          clearTimeout(sleepTimer.current);
        }
      }
    };
    const out = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("[data-robot]");
      const next = (e.relatedTarget as HTMLElement | null)?.closest("[data-robot]");
      if (el && !next) {
        reactingRef.current = false;
        setMessage(null);
        clearTimeout(sleepTimer.current);
        sleepTimer.current = setTimeout(() => setIsAwake(false), 4000);
      }
    };
    document.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out, { passive: true });
    return () => {
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!robotRef.current) return;

      setIsAwake(true);
      clearTimeout(sleepTimer.current);

      const rect = robotRef.current.getBoundingClientRect();

      // ── Proximity: distance from cursor to robot center ──
      const bodyCX = rect.left + rect.width / 2;
      const bodyCY = rect.top + rect.height / 2;
      const pdx = e.clientX - bodyCX;
      const pdy = e.clientY - bodyCY;
      const proximity = Math.sqrt(pdx * pdx + pdy * pdy);
      const isNear = proximity < 150;
      if (isNear !== nearRef.current) {
        nearRef.current = isNear;
        setNear(isNear);
      }

      // Stay awake while a message is showing OR the cursor is hovering near him
      if (!reactingRef.current && !nearRef.current) {
        sleepTimer.current = setTimeout(() => setIsAwake(false), 4000);
      }

      // Head pivot is ~30% down the robot
      const headCX = rect.left + rect.width / 2;
      const headCY = rect.top + rect.height * 0.30;

      const dx = e.clientX - headCX;
      const dy = e.clientY - headCY;

      // Head tilt: ±22 deg max
      target.current.headRot = Math.max(-22, Math.min(22, dx * 0.010));

      // Pupil offset: max 4px
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxP = 4.0;
      target.current.pupilX = dist > 0 ? (dx / dist) * Math.min(maxP, dist * 0.022) : 0;
      target.current.pupilY = dist > 0 ? (dy / dist) * Math.min(maxP, dist * 0.022) : 0;

      // Arm rotation: both arms lean toward cursor direction
      target.current.armRot = Math.max(-28, Math.min(28, dx * 0.008));
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      clearTimeout(sleepTimer.current);
      clearTimeout(excitedTimer.current);
    };
  }, []);

  // RAF animation loop — only runs while awake (mouse recently moved).
  // On first load the robot is idle, so nothing competes with hydration.
  useEffect(() => {
    if (!isAwake) return;

    const animate = () => {
      const r = rendered.current;
      const t = target.current;

      r.headRot = lerp(r.headRot, t.headRot, 0.09);
      r.pupilX  = lerp(r.pupilX,  t.pupilX,  0.12);
      r.pupilY  = lerp(r.pupilY,  t.pupilY,  0.12);
      r.armRot  = lerp(r.armRot,  t.armRot,  0.06);

      if (headGroupRef.current) {
        headGroupRef.current.style.transform = `rotate(${r.headRot}deg)`;
      }
      // Left pupil base: cx=26, cy=45
      if (leftPupilRef.current) {
        leftPupilRef.current.setAttribute("cx", String(26 + r.pupilX));
        leftPupilRef.current.setAttribute("cy", String(45 + r.pupilY));
      }
      // Right pupil base: cx=46, cy=45
      if (rightPupilRef.current) {
        rightPupilRef.current.setAttribute("cx", String(46 + r.pupilX));
        rightPupilRef.current.setAttribute("cy", String(45 + r.pupilY));
      }
      // Arms: shoulder pivots at (14,78) left and (58,78) right.
      // Hover → right arm waves. Poke (excited) → both arms throw up.
      if (reactingRef.current || excitedRef.current || nearRef.current) {
        waveT.current += excitedRef.current ? 0.32 : 0.18;
      }
      if (leftArmRef.current) {
        if (excitedRef.current) {
          const wave = 118 - Math.sin(waveT.current) * 14;
          leftArmRef.current.style.transform = `rotate(${wave}deg)`;
        } else {
          leftArmRef.current.style.transform = `rotate(${-8 + r.armRot * 0.7}deg)`;
        }
      }
      if (rightArmRef.current) {
        if (reactingRef.current || excitedRef.current || nearRef.current) {
          const wave = -118 + Math.sin(waveT.current) * 14;
          rightArmRef.current.style.transform = `rotate(${wave}deg)`;
        } else {
          rightArmRef.current.style.transform = `rotate(${8 + r.armRot * 0.7}deg)`;
        }
      }

      // Visor scan line
      if (visorScanRef.current) {
        scanX.current = (scanX.current + 0.7) % 42;
        visorScanRef.current.setAttribute("x", String(17 + scanX.current));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAwake]);

  const stroke = "rgba(244,239,230,0.55)";
  const strokeDim = "rgba(244,239,230,0.25)";
  const accent = "#C9A961";
  const awakeAccent = isAwake ? accent : "rgba(201,169,97,0.3)";
  const glow = isAwake ? `drop-shadow(0 0 6px ${accent})` : "none";

  return (
    <div
      ref={robotRef}
      className="fixed bottom-5 right-4 lg:bottom-8 lg:right-8 z-40 block select-none"
      style={{
        width: 72,
        height: 120,
        pointerEvents: "none",
        transform: near ? "translateY(-8px) scale(1.07)" : "translateY(0) scale(1)",
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
        transformOrigin: "bottom right",
      }}
      aria-hidden="true"
    >
      {/* ── Contextual speech bubble ── */}
      {message && (
        <div
          key={message}
          style={{
            position: "absolute",
            bottom: 116,
            right: 4,
            width: "min(208px, calc(100vw - 28px))",
            padding: "11px 14px",
            background: "rgba(13,13,16,0.94)",
            border: "1px solid rgba(201,169,97,0.32)",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            animation: "robotBubbleIn 0.42s cubic-bezier(0.16,1,0.3,1) both",
            transformOrigin: "bottom right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "8px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: 5,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#4CAF50",
                display: "inline-block",
                animation: "robotBubbleDot 1.4s ease-in-out infinite",
              }}
            />
            Thaqib
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12.5px",
              lineHeight: 1.45,
              color: "var(--color-cream)",
              margin: 0,
            }}
          >
            {message}
          </p>
          {/* Tail pointing down toward the robot */}
          <span
            style={{
              position: "absolute",
              bottom: -6,
              right: 22,
              width: 11,
              height: 11,
              background: "rgba(13,13,16,0.94)",
              borderRight: "1px solid rgba(201,169,97,0.32)",
              borderBottom: "1px solid rgba(201,169,97,0.32)",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}

      <svg
        viewBox="0 0 72 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handlePoke}
        style={{
          animation: excited
            ? "robotExcited 0.6s ease-in-out"
            : "robotBob 3.8s ease-in-out infinite",
          overflow: "visible",
          pointerEvents: "auto",
          cursor: "none",
        }}
      >
        {/* ── Antenna ── */}
        <line x1="36" y1="14" x2="36" y2="27" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <circle
          ref={antennaLedRef}
          cx="36" cy="10" r="4"
          fill={isAwake ? accent : "none"}
          stroke={accent}
          strokeWidth="1.2"
          style={{
            filter: isAwake ? `drop-shadow(0 0 6px ${accent})` : "none",
            animation: isAwake ? "antennaPulse 1.6s ease-in-out infinite" : "none",
          }}
        />
        {/* Antenna side fins */}
        <line x1="30" y1="16" x2="33" y2="19" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
        <line x1="42" y1="16" x2="39" y2="19" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />

        {/* ── Head (rotates) ── */}
        <g
          ref={headGroupRef}
          style={{ transformOrigin: "36px 45px", transform: "rotate(0deg)" }}
        >
          {/* Head outer */}
          <rect x="12" y="27" width="48" height="36" rx="5" stroke={stroke} strokeWidth="1.5" />

          {/* Corner rivets */}
          <circle cx="17" cy="32" r="1.2" fill={strokeDim} />
          <circle cx="55" cy="32" r="1.2" fill={strokeDim} />
          <circle cx="17" cy="58" r="1.2" fill={strokeDim} />
          <circle cx="55" cy="58" r="1.2" fill={strokeDim} />

          {/* Visor slot */}
          <rect
            x="17" y="36" width="38" height="17"
            rx="2.5"
            stroke={awakeAccent}
            strokeWidth="1"
            fill={`rgba(201,169,97,${isAwake ? "0.07" : "0.02"})`}
          />

          {/* Visor scan line (animated via RAF) */}
          {isAwake && (
            <rect
              ref={visorScanRef}
              x="17" y="36" width="2" height="17"
              fill={`rgba(201,169,97,0.35)`}
              rx="1"
            />
          )}

          {/* Left pupil */}
          <circle
            ref={leftPupilRef}
            cx="26" cy="45" r="4"
            fill={awakeAccent}
            style={{ filter: isAwake ? glow : "none" }}
          />

          {/* Right pupil */}
          <circle
            ref={rightPupilRef}
            cx="46" cy="45" r="4"
            fill={awakeAccent}
            style={{ filter: isAwake ? glow : "none" }}
          />

          {/* Brow lines */}
          <line x1="19" y1="33" x2="29" y2="33" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="37" y1="33" x2="47" y2="33" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.5" />

          {/* Chin ventilation slots */}
          <line x1="27" y1="58" x2="30" y2="58" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
          <line x1="33" y1="58" x2="36" y2="58" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
          <line x1="39" y1="58" x2="42" y2="58" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
          <line x1="45" y1="58" x2="48" y2="58" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* ── Neck ── */}
        <line x1="36" y1="63" x2="36" y2="75" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        {/* Neck collar */}
        <rect x="29" y="68" width="14" height="4" rx="1.5" stroke={strokeDim} strokeWidth="1" />

        {/* ── Left Arm ── */}
        <g
          ref={leftArmRef}
          style={{ transformOrigin: "14px 78px", transform: "rotate(-8deg)" }}
        >
          {/* Shoulder joint */}
          <circle cx="14" cy="78" r="3" stroke={stroke} strokeWidth="1.2" fill="none" />
          {/* Upper arm */}
          <line x1="14" y1="78" x2="5" y2="95" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* Elbow joint */}
          <circle cx="5" cy="95" r="2" stroke={stroke} strokeWidth="1" fill="none" />
          {/* Forearm */}
          <line x1="5" y1="95" x2="8" y2="110" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="8" cy="112" r="2.5" stroke={awakeAccent} strokeWidth="1" fill="none"
            style={{ filter: isAwake ? `drop-shadow(0 0 3px ${accent})` : "none" }} />
        </g>

        {/* ── Right Arm ── */}
        <g
          ref={rightArmRef}
          style={{ transformOrigin: "58px 78px", transform: "rotate(8deg)" }}
        >
          {/* Shoulder joint */}
          <circle cx="58" cy="78" r="3" stroke={stroke} strokeWidth="1.2" fill="none" />
          {/* Upper arm */}
          <line x1="58" y1="78" x2="67" y2="95" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* Elbow joint */}
          <circle cx="67" cy="95" r="2" stroke={stroke} strokeWidth="1" fill="none" />
          {/* Forearm */}
          <line x1="67" y1="95" x2="64" y2="110" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="64" cy="112" r="2.5" stroke={awakeAccent} strokeWidth="1" fill="none"
            style={{ filter: isAwake ? `drop-shadow(0 0 3px ${accent})` : "none" }} />
        </g>

        {/* ── Body ── */}
        <rect x="15" y="75" width="42" height="28" rx="3.5" stroke={stroke} strokeWidth="1.5" />

        {/* Body panel lines */}
        <line x1="15" y1="86" x2="57" y2="86" stroke={strokeDim} strokeWidth="0.8" />
        <line x1="36" y1="86" x2="36" y2="103" stroke={strokeDim} strokeWidth="0.8" />

        {/* Body center LED */}
        <circle
          cx="36" cy="92" r="3.5"
          fill={isAwake ? accent : "none"}
          stroke={accent}
          strokeWidth="1.2"
          style={{
            filter: isAwake ? `drop-shadow(0 0 5px ${accent})` : "none",
            animation: isAwake ? "bodyLed 2.4s ease-in-out infinite 0.4s" : "none",
          }}
        />

        {/* Body side vents */}
        <line x1="19" y1="79" x2="19" y2="84" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <line x1="53" y1="79" x2="53" y2="84" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.45" />

        {/* Body lower indicators */}
        <circle cx="26" cy="97" r="1.5" fill={isAwake ? "rgba(74,144,217,0.7)" : strokeDim}
          style={{ filter: isAwake ? "drop-shadow(0 0 3px rgba(74,144,217,0.8))" : "none" }} />
        <circle cx="46" cy="97" r="1.5" fill={isAwake ? "rgba(76,175,80,0.7)" : strokeDim}
          style={{ filter: isAwake ? "drop-shadow(0 0 3px rgba(76,175,80,0.8))" : "none" }} />

        {/* ── Legs ── */}
        <line x1="27" y1="103" x2="27" y2="114" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <line x1="45" y1="103" x2="45" y2="114" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        {/* Feet */}
        <line x1="21" y1="114" x2="33" y2="114" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <line x1="39" y1="114" x2="51" y2="114" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        {/* Foot detail */}
        <line x1="21" y1="117" x2="27" y2="117" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
        <line x1="45" y1="117" x2="51" y2="117" stroke={strokeDim} strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
