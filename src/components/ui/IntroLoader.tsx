"use client";

/**
 * IntroLoader — cinematic preloader for the homepage.
 * Drop this file at: src/components/ui/IntroLoader.tsx
 *
 * Then render it ONCE, high in the tree. Easiest: add it to
 * src/components/layout/ClientWidgets.tsx (see notes at bottom),
 * or place <IntroLoader /> at the top of your home page.tsx.
 *
 * It uses your existing design tokens (--color-ink / --color-cream /
 * --color-accent / --color-muted) so it matches automatically.
 * Plays once per browser session (sessionStorage) so it doesn't
 * replay on every client navigation.
 */

import { useEffect, useRef, useState } from "react";

const STATUS = [
  "Initializing systems",
  "Compiling components",
  "Loading selected work",
  "Calibrating interface",
  "Ready",
];

type Phase = "loading" | "revealing" | "done";

export function IntroLoader({
  duration = 2600,
  // "slide-up" | "split" | "fade"
  curtain = "slide-up",
  oncePerSession = true,
}: {
  duration?: number;
  curtain?: "slide-up" | "split" | "fade";
  oncePerSession?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const raf = useRef<number>(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || (oncePerSession && sessionStorage.getItem("introPlayed"))) {
      setPhase("done");
      return;
    }
    // lock scroll while the intro plays
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setPhase("revealing");
          setTimeout(() => {
            setPhase("done");
            document.body.style.overflow = "";
            sessionStorage.setItem("introPlayed", "1");
          }, 1300);
        }, 380);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      document.body.style.overflow = "";
    };
  }, [duration, oncePerSession]);

  if (phase === "done") return null;

  const lifting = phase !== "loading";
  const idx =
    progress >= 100 ? 4 : progress > 75 ? 3 : progress > 50 ? 2 : progress > 25 ? 1 : 0;

  const panelEase = "cubic-bezier(0.76,0,0.24,1)";
  const panel: React.CSSProperties = {
    position: "fixed",
    top: 0,
    bottom: 0,
    background: "var(--color-ink)",
    zIndex: 9990,
    willChange: "transform, opacity",
  };

  return (
    <div aria-hidden="true">
      {/* curtain panel(s) */}
      {curtain === "split" ? (
        <>
          <div
            style={{
              ...panel,
              left: 0,
              width: "50.5%",
              transform: lifting ? "translateX(-101%)" : "translateX(0)",
              transition: `transform 1.15s ${panelEase}`,
            }}
          />
          <div
            style={{
              ...panel,
              right: 0,
              width: "50.5%",
              transform: lifting ? "translateX(101%)" : "translateX(0)",
              transition: `transform 1.15s ${panelEase}`,
            }}
          />
        </>
      ) : (
        <div
          style={{
            ...panel,
            left: 0,
            right: 0,
            ...(curtain === "fade"
              ? { opacity: lifting ? 0 : 1, transition: "opacity 1.1s ease" }
              : {
                  transform: lifting ? "translateY(-101%)" : "translateY(0)",
                  transition: `transform 1.15s ${panelEase}`,
                }),
          }}
        />
      )}

      {/* loader content */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9991,
          pointerEvents: "none",
          opacity: lifting ? 0 : 1,
          transform: lifting ? "translateY(-10px)" : "translateY(0)",
          transition: "opacity .45s ease, transform .6s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* top-left identity */}
        <div
          style={{
            position: "absolute",
            top: "clamp(1.5rem,5vw,3rem)",
            left: "clamp(1.5rem,5vw,5rem)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.25rem,2vw,1.6rem)",
              color: "var(--color-cream)",
              letterSpacing: "0.02em",
            }}
          >
            Tarek Okasha
          </div>
          <div
            style={{
              marginTop: "0.4rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.66rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            AI Systems · Custom Software
          </div>
        </div>

        {/* status, bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(2.5rem,7vh,4rem)",
            left: "clamp(1.5rem,5vw,5rem)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
          }}
        >
          {STATUS[idx]}
        </div>

        {/* counter, bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(1.5rem,5vh,3rem)",
            right: "clamp(1.5rem,5vw,5rem)",
            display: "flex",
            alignItems: "flex-end",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(5rem,15vw,13rem)",
              fontWeight: 300,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              color: "var(--color-accent)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(progress).padStart(3, "0")}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem,3vw,2.5rem)",
              fontWeight: 300,
              color: "var(--color-muted)",
              marginBottom: "0.6em",
            }}
          >
            %
          </span>
        </div>

        {/* progress line */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 1,
            background: "rgba(244,239,230,0.1)",
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            height: 1,
            width: `${progress}%`,
            background: "var(--color-accent)",
            boxShadow: "0 0 8px var(--color-accent)",
          }}
        />
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   HOW TO WIRE IT IN
   ───────────────────────────────────────────────────────────
   Option A (recommended) — add to ClientWidgets.tsx:

     import { IntroLoader } from "@/components/ui/IntroLoader";
     // inside the returned fragment:
     <IntroLoader />

   Option B — home page only (src/app/page.tsx is a server file,
   so add it inside a client section). Since HeroSection is already
   "use client", you can render <IntroLoader /> at the top of
   HeroSection's returned JSX instead.

   Props:
     duration={2600}          // ms to count 0→100
     curtain="slide-up"       // "slide-up" | "split" | "fade"
     oncePerSession={true}    // set false to replay on every load while testing
   ─────────────────────────────────────────────────────────── */
