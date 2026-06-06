"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  dx: number;
  dy: number;
  layer: 0 | 1 | 2;
  colorIdx: number;
}

interface ShootingStar {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
  active: boolean;
  cooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

interface Nebula {
  nx: number;
  ny: number;
  r: number;
  r0: number; g0: number; b0: number;
  a: number;
  driftX: number;
  driftY: number;
  phase: number;
}

const PARALLAX = [0.04, 0.14, 0.32] as const;

const STAR_COLORS = [
  "rgba(244,239,230,",
  "rgba(190,215,255,",
  "rgba(201,169,97,",
  "rgba(255,255,255,",
] as const;

// Target 30fps — stars look identical to 60fps, uses half the GPU budget
const FRAME_INTERVAL = 1000 / 30;

export function SpaceBackground() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const mouseRef      = useRef({ x: -9999, y: -9999 });
  const scrollRef     = useRef(0);
  const starsRef      = useRef<Star[]>([]);
  const shootingRef   = useRef<ShootingStar[]>([]);
  const particlesRef  = useRef<Particle[]>([]);
  const nebulasRef    = useRef<Nebula[]>([]);
  const rafRef        = useRef<number>(0);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tRef          = useRef(0);
  const lastTimeRef   = useRef(0);
  // Cached layout values — updated only on resize/scroll, not every frame
  const rectRef       = useRef({ left: 0, top: 0 });
  const vignetteRef   = useRef<CanvasGradient | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = () => {
      scrollRef.current = window.scrollY;
      // Canvas viewport position changes with scroll — update cache
      const r = canvas.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top };
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const buildScene = () => {
      const W = canvas.width;
      const H = canvas.height;
      const isMobile = W < 768;

      const maxStars = isMobile ? 70 : 150;
      const total = Math.min(Math.floor((W * H) / 7000), maxStars);
      const layerCount = [
        Math.floor(total * 0.50),
        Math.floor(total * 0.33),
        Math.floor(total * 0.17),
      ];

      starsRef.current = [];
      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < layerCount[layer]; i++) {
          const rnd = Math.random();
          const colorIdx = rnd < 0.65 ? 0 : rnd < 0.83 ? 1 : rnd < 0.93 ? 2 : 3;
          const sizeBase  = layer === 0 ? 0.25 : layer === 1 ? 0.6 : 1.1;
          const sizeRange = layer === 0 ? 0.70 : layer === 1 ? 0.9 : 1.4;

          starsRef.current.push({
            x: Math.random(),
            y: Math.random(),
            size: sizeBase + Math.random() * sizeRange,
            baseOpacity: layer === 0
              ? Math.random() * 0.45 + 0.05
              : layer === 1
              ? Math.random() * 0.55 + 0.12
              : Math.random() * 0.65 + 0.2,
            twinkleSpeed:  Math.random() * 0.018 + 0.004,
            twinkleOffset: Math.random() * Math.PI * 2,
            dx: (Math.random() - 0.5) * (layer === 0 ? 0.018 : layer === 1 ? 0.028 : 0.045),
            dy: (Math.random() - 0.5) * (layer === 0 ? 0.012 : layer === 1 ? 0.020 : 0.030),
            layer: layer as 0 | 1 | 2,
            colorIdx,
          });
        }
      }

      // 2 nebulae max — each does a full-canvas fill, keep it lean
      nebulasRef.current = [
        { nx: 0.10, ny: 0.18, r: 0.28, r0: 201, g0: 169, b0: 97,  a: 0.050, driftX:  0.000018, driftY:  0.000010, phase: 0   },
        { nx: 0.83, ny: 0.55, r: 0.24, r0: 74,  g0: 144, b0: 217, a: 0.040, driftX: -0.000012, driftY:  0.000008, phase: 1.4 },
      ];

      shootingRef.current = Array.from({ length: 4 }, (_, i) => ({
        x: 0, y: 0, angle: 0, speed: 0, length: 0, opacity: 0,
        active: false,
        cooldown: 100 + i * 80,
      }));
    };

    const resize = () => {
      const w = canvas.parentElement?.clientWidth || window.innerWidth || 1280;
      const h = canvas.parentElement?.clientHeight || window.innerHeight || 900;
      canvas.width  = w;
      canvas.height = h;

      // Cache bounding rect once per resize
      const r = canvas.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top };

      // Build vignette gradient once per resize — reused every frame
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(6,6,8,0.55)");
      vignetteRef.current = vig;

      buildScene();
    };

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
        const speed = Math.random() * 3.5 + 1.2;
        particlesRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 0.9,
          size: Math.random() * 1.8 + 0.6,
        });
      }
    };

    const draw = (timestamp: number) => {
      // 30fps cap — bail early if not enough time has elapsed
      if (timestamp - lastTimeRef.current < FRAME_INTERVAL) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTimeRef.current = timestamp;

      const W = canvas.width;
      const H = canvas.height;
      tRef.current++;
      const t = tRef.current;
      const scroll = scrollRef.current;

      ctx.clearRect(0, 0, W, H);

      // Cached vignette — no gradient object created per frame
      if (vignetteRef.current) {
        ctx.fillStyle = vignetteRef.current;
        ctx.fillRect(0, 0, W, H);
      }

      // Nebulae drift
      nebulasRef.current.forEach((nb) => {
        nb.nx = (nb.nx + nb.driftX + 1) % 1;
        nb.ny = (nb.ny + nb.driftY + 1) % 1;
        const x = nb.nx * W;
        const y = nb.ny * H;
        const r = nb.r * W;
        const breathe = 0.85 + 0.15 * Math.sin(t * 0.0045 + nb.phase);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * breathe);
        grad.addColorStop(0,   `rgba(${nb.r0},${nb.g0},${nb.b0},${nb.a})`);
        grad.addColorStop(0.5, `rgba(${nb.r0},${nb.g0},${nb.b0},${nb.a * 0.4})`);
        grad.addColorStop(1,   "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      // Cached rect — no layout read per frame
      const mx = mouseRef.current.x - rectRef.current.left;
      const my = mouseRef.current.y - rectRef.current.top;

      // Stars — layered parallax
      starsRef.current.forEach((s) => {
        const parallaxFactor = PARALLAX[s.layer];

        if (!prefersReduced) {
          s.x = (s.x + s.dx / W + 1) % 1;
          s.y = (s.y + s.dy / H + 1) % 1;
        }

        const screenX = s.x * W;
        const screenY = ((s.y * H + scroll * parallaxFactor) % H + H) % H;

        const twinkle = prefersReduced
          ? 1
          : Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;

        // distSq check before sqrt — skips sqrt for the vast majority of stars
        const ddx = screenX - mx;
        const ddy = screenY - my;
        const distSq = ddx * ddx + ddy * ddy;
        const proxRange = s.layer === 2 ? 180 : 120;
        let prox = 0;
        if (distSq < proxRange * proxRange) {
          prox = (1 - Math.sqrt(distSq) / proxRange) * (s.layer === 2 ? 1.0 : 0.6);
        }

        const op = Math.min(1, s.baseOpacity * twinkle + prox * 0.9);
        const sz = s.size + prox * (s.layer === 2 ? 2.5 : 1.5);
        const col = STAR_COLORS[s.colorIdx];

        ctx.beginPath();
        ctx.arc(screenX, screenY, sz, 0, Math.PI * 2);
        ctx.fillStyle = `${col}${op.toFixed(3)})`;
        ctx.fill();

        if (sz > 2.2 || prox > 0.4 || (s.layer === 2 && sz > 1.5)) {
          const arm = sz * (s.layer === 2 ? 3.8 : 2.8);
          ctx.strokeStyle = `${col}${(op * 0.35).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(screenX - arm, screenY);
          ctx.lineTo(screenX + arm, screenY);
          ctx.moveTo(screenX, screenY - arm);
          ctx.lineTo(screenX, screenY + arm);
          ctx.stroke();
        }

        if (s.layer === 2 && sz > 1.8 && prox > 0.15) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, sz * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `${col}${Math.min(1, op * 1.25).toFixed(3)})`;
          ctx.fill();
        }
      });

      // Shooting stars
      if (!prefersReduced) {
        shootingRef.current.forEach((ss) => {
          if (!ss.active) {
            if (--ss.cooldown <= 0) {
              ss.active  = true;
              ss.x       = Math.random() * W * 0.75 + W * 0.05;
              ss.y       = Math.random() * H * 0.50;
              ss.angle   = Math.PI / 5 + (Math.random() - 0.5) * 0.35;
              ss.speed   = Math.random() * 10 + 8;
              ss.length  = Math.random() * 120 + 60;
              ss.opacity = 0.95;
            }
          } else {
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= 0.014;

            const tx = ss.x - Math.cos(ss.angle) * ss.length;
            const ty = ss.y - Math.sin(ss.angle) * ss.length;
            const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
            grad.addColorStop(0,    "transparent");
            grad.addColorStop(0.55, `rgba(201,169,97,${(ss.opacity * 0.5).toFixed(3)})`);
            grad.addColorStop(1,    `rgba(244,239,230,${ss.opacity.toFixed(3)})`);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(ss.x, ss.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244,239,230,${ss.opacity.toFixed(3)})`;
            ctx.fill();

            if (ss.opacity <= 0 || ss.x > W + 150 || ss.y > H + 150) {
              ss.active   = false;
              ss.cooldown = Math.floor(Math.random() * 280 + 120);
            }
          }
        });
      }

      // Click burst particles
      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0.01);
      particlesRef.current.forEach((p) => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.opacity *= 0.94;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,97,${p.opacity.toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,239,230,${(p.opacity * 0.8).toFixed(3)})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize",    resize,  { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("click",     onClick);

    if (prefersReduced) {
      // Single static frame for reduced-motion users
      draw(0);
    } else {
      // Delay canvas start by 500ms — lets the CSS hero animation and first
      // paint complete before the canvas loop competes for the main thread
      startTimerRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(draw);
      }, 500);
    }

    return () => {
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("click",     onClick);
      window.removeEventListener("scroll",    onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
