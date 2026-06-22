"use client";

/**
 * RoboticArmSection — 3D Three.js cutscene replacement.
 * Drop-in for src/components/home/RoboticArmSection.tsx
 *
 * Install peer dep first:
 *   npm install three @types/three
 *
 * No other changes needed — page.tsx already imports this component.
 */

import type * as THREE from "three";
import { useEffect, useRef } from "react";

// ── constants ──────────────────────────────────────────────────────────────
const C = { x: 0.12, y: 1.66, z: 0.92 };   // star centre (world units)
const R_STAR = 0.7;                           // star radius
const REST = { x: 0.0, y: 1.36, z: 0.42 };  // rest target before approach
const L1 = 1.35, L2 = 1.25;                  // arm segment lengths
const SHY = 0.95;                             // shoulder height
const VFRAC = [0, 0.2, 0.4, 0.6, 0.8];       // star vertex reveal thresholds

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

// camera keyframes
const CAM_KEYS = [
  { p: 0.00, pos: [3.8, 1.7, 7.2],  look: [0.05, 1.0, 0.2] },
  { p: 0.22, pos: [2.8, 1.95, 6.8], look: [0.1, 1.2, 0.5] },
  { p: 0.85, pos: [-0.9, 2.05, 6.2],look: [C.x, C.y - 0.35, C.z] },
  { p: 1.00, pos: [0.35, 1.85, 6.6], look: [C.x, C.y - 0.4, C.z] },
] as const;

function getCamKey(p: number) {
  let a = CAM_KEYS[0] as (typeof CAM_KEYS)[number],
      b = CAM_KEYS[CAM_KEYS.length - 1] as (typeof CAM_KEYS)[number];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    if (p >= CAM_KEYS[i].p && p <= CAM_KEYS[i + 1].p) {
      a = CAM_KEYS[i]; b = CAM_KEYS[i + 1]; break;
    }
  }
  const t = smooth((p - a.p) / Math.max(1e-4, b.p - a.p));
  return {
    pos:  a.pos.map( (v, i) => lerp(v, b.pos[i],  t)) as [number,number,number],
    look: a.look.map((v, i) => lerp(v, b.look[i], t)) as [number,number,number],
  };
}

// ── component ──────────────────────────────────────────────────────────────
export function RoboticArmSection() {
  const pinRef     = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const phaseRef   = useRef<HTMLDivElement>(null);
  const j1Ref      = useRef<HTMLSpanElement>(null);
  const j2Ref      = useRef<HTMLSpanElement>(null);
  const pctRef     = useRef<HTMLSpanElement>(null);
  const torqueRef  = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let sp = 0, targetP = 0;
    const t0 = performance.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let three: any = null;

    // ── build glow canvas texture ──────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeGlowTex = (THREE: any) => {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0,    "rgba(255,247,222,1)");
      grd.addColorStop(0.22, "rgba(231,200,120,0.9)");
      grd.addColorStop(0.55, "rgba(201,169,97,0.35)");
      grd.addColorStop(1,    "rgba(201,169,97,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    };

    // position+orient a unit-Y cylinder mesh to span A→B
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boneMesh = (THREE: any, mesh: any, A: any, B: any) => {
      const dir = new THREE.Vector3().subVectors(B, A);
      const len = dir.length() || 0.0001;
      mesh.position.copy(A).add(B).multiplyScalar(0.5);
      mesh.scale.set(1, len, 1);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    };

    // ── initialise Three.js ────────────────────────────────────────────────
    const initThree = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0B0B0C, 0.045);

      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(3.8, 1.7, 7.2);

      // lighting
      scene.add(new THREE.AmbientLight(0x3a3f4a, 0.7));
      scene.add(new THREE.HemisphereLight(0x8294b4, 0x070708, 0.5));
      const key = new THREE.DirectionalLight(0xffe6b4, 1.0);
      key.position.set(3, 6, 4); scene.add(key);
      const rim = new THREE.DirectionalLight(0x5577bb, 0.55);
      rim.position.set(-5, 2, -4); scene.add(rim);
      const tipLight = new THREE.PointLight(0xffd98a, 0.0, 6, 2);
      tipLight.position.set(C.x, C.y, C.z); scene.add(tipLight);

      const glowTex = makeGlowTex(THREE);

      // shared materials
      const matMetal  = new THREE.MeshStandardMaterial({ color: 0x202329, metalness: 0.95, roughness: 0.38 });
      const matMetal2 = new THREE.MeshStandardMaterial({ color: 0x171a1f, metalness: 0.9,  roughness: 0.45 });
      const matGold   = new THREE.MeshStandardMaterial({ color: 0xC9A961, metalness: 0.7,  roughness: 0.28, emissive: 0xC9A961, emissiveIntensity: 0.35 });
      const matJoint  = new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.6,  roughness: 0.5,  emissive: 0xC9A961, emissiveIntensity: 0.18 });

      // ground disc + rings
      const disc = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64),
        new THREE.MeshStandardMaterial({ color: 0x0d0f12, metalness: 0.6, roughness: 0.7, transparent: true, opacity: 0.85 }));
      disc.rotation.x = -Math.PI / 2; disc.position.y = 0.001; scene.add(disc);
      [0.5, 1.0, 1.6].forEach((r, i) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.004, 6, 80),
          new THREE.MeshBasicMaterial({ color: 0xC9A961, transparent: true, opacity: 0.10 + i * 0.02 }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = 0.003; scene.add(ring);
      });

      // base column
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.16, 48), matMetal2);
      base.position.y = 0.08; scene.add(base);
      const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 8, 64), matGold);
      baseRing.rotation.x = -Math.PI / 2; baseRing.position.y = 0.16; scene.add(baseRing);

      // turntable group (yaw rotates here)
      const turntable = new THREE.Group(); turntable.position.y = 0.16; scene.add(turntable);
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.62, 36), matMetal);
      column.position.y = 0.31; turntable.add(column);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 10, 40), matGold);
      collar.rotation.x = -Math.PI / 2; collar.position.y = 0.6; turntable.add(collar);

      // shoulder
      const shoulderHub  = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), matJoint); turntable.add(shoulderHub);
      const shoulderHubR = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 10, 32), matGold); turntable.add(shoulderHubR);

      // bones
      const upper       = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.085, 1, 28), matMetal); turntable.add(upper);
      const upperAccent = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.06, 28), matGold); turntable.add(upperAccent);
      const fore        = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1, 28), matMetal); turntable.add(fore);
      const foreAccent  = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.05, 28), matGold); turntable.add(foreAccent);
      const elbowHub    = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 24), matJoint); turntable.add(elbowHub);
      const elbowRingM  = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.014, 10, 28), matGold); turntable.add(elbowRingM);

      // wrist + gripper prongs
      const wrist    = new THREE.Group(); turntable.add(wrist);
      const wristHub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 20), matMetal); wrist.add(wristHub);
      const mkProng  = (s: number) => {
        const g = new THREE.Group();
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.16, 0.03), matMetal);
        arm.position.set(s * 0.045, 0.1, 0); arm.rotation.z = -s * 0.28; g.add(arm);
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.03), matGold);
        tip.position.set(s * 0.075, 0.19, 0); g.add(tip);
        return g;
      };
      wrist.add(mkProng(1)); wrist.add(mkProng(-1));

      // tip glow sprite
      const tipSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0xffe6a8, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      tipSprite.scale.set(0.55, 0.55, 0.55); scene.add(tipSprite);

      // ── pentagram star path ──
      const order = [0, 2, 4, 1, 3];
      const pts = [];
      for (let i = 0; i <= 5; i++) {
        const k   = order[i % 5];
        const ang = -Math.PI / 2 + k * (2 * Math.PI / 5);
        pts.push(new THREE.Vector3(C.x + R_STAR * Math.cos(ang), C.y + R_STAR * Math.sin(ang), C.z));
      }
      const curve    = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.04);
      const tube     = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 640, 0.016, 9, false),
        new THREE.MeshStandardMaterial({ color: 0xC9A961, emissive: 0xE7C878, emissiveIntensity: 1.5, metalness: 0.3, roughness: 0.4, transparent: true, opacity: 0.95 })
      );
      tube.geometry.setDrawRange(0, 0); scene.add(tube);

      const tubeGlow = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 640, 0.04, 9, false),
        new THREE.MeshBasicMaterial({ color: 0xC9A961, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      tubeGlow.geometry.setDrawRange(0, 0); scene.add(tubeGlow);

      // faint full-path guide
      const guide = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 320, 0.006, 6, false),
        new THREE.MeshBasicMaterial({ color: 0xF4EFE6, transparent: true, opacity: 0.08 })
      );
      scene.add(guide);

      // corner vertex markers + glow sprites
      const corners: Array<{ m: THREE.Mesh; gl: THREE.Sprite }> = [];
      for (let k = 0; k < 5; k++) {
        const ang = -Math.PI / 2 + k * (2 * Math.PI / 5);
        const pos = new THREE.Vector3(C.x + R_STAR * Math.cos(ang), C.y + R_STAR * Math.sin(ang), C.z);
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xF4EFE6, transparent: true, opacity: 0.2 }));
        m.position.copy(pos); scene.add(m);
        const gl = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex, color: 0xffe6a8, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        gl.scale.set(0.32, 0.32, 0.32); gl.position.copy(pos); scene.add(gl);
        corners.push({ m, gl });
      }

      // centre gem (appears on lock)
      const gem     = new THREE.Group(); gem.position.set(C.x, C.y, C.z); scene.add(gem);
      const gemCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0),
        new THREE.MeshStandardMaterial({ color: 0xE7C878, emissive: 0xE7C878, emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.25 }));
      gem.add(gemCore);
      const gemGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0xffe6a8, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      gemGlow.scale.set(1.0, 1.0, 1.0); gem.add(gemGlow);
      gem.scale.setScalar(0.001);

      const tipIdx  = tube.geometry.index     ? tube.geometry.index.count     : 0;
      const glowIdx = tubeGlow.geometry.index ? tubeGlow.geometry.index.count : 0;

      three = {
        THREE, renderer, scene, camera, curve, tube, tubeGlow,
        turntable, upper, upperAccent, fore, foreAccent,
        elbowHub, elbowRingM, shoulderHub, shoulderHubR,
        wrist, tipSprite, tipLight, corners, gem, gemCore, gemGlow,
        tipIdx, glowIdx,
      };
    };

    // ── update scene per frame ─────────────────────────────────────────────
    const updateScene = (p: number) => {
      if (!three) return;
      const {
        THREE, renderer, scene, camera, curve, tube, tubeGlow,
        turntable, upper, upperAccent, fore, foreAccent,
        elbowHub, elbowRingM, shoulderHub, shoulderHubR,
        wrist, tipSprite, tipLight, corners, gem, gemCore, gemGlow,
        tipIdx, glowIdx,
      } = three;
      const time = (performance.now() - t0) / 1000;

      // ── resolve target ──
      let trace = 0;
      let target: THREE.Vector3;
      if (p < 0.18) {
        const k     = smooth(clamp((p - 0.06) / 0.12, 0, 1));
        const start = curve.getPoint(0) as THREE.Vector3;
        target = new THREE.Vector3(lerp(REST.x, start.x, k), lerp(REST.y, start.y, k), lerp(REST.z, start.z, k));
      } else {
        trace  = smooth((p - 0.18) / 0.7);
        target = curve.getPoint(clamp(trace, 0, 1)) as THREE.Vector3;
      }

      // ── 2-bone IK ──
      const dx = target.x, dz = target.z;
      const r   = Math.hypot(dx, dz);
      const yaw = Math.atan2(dx, dz);
      const hx  = r > 1e-4 ? dx / r : 0, hz = r > 1e-4 ? dz / r : 1;
      const dy  = target.y - SHY;
      let d     = Math.hypot(r, dy);
      d         = clamp(d, 0.05, L1 + L2 - 0.04);
      const aDist  = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
      const hgt    = Math.sqrt(Math.max(0, L1 * L1 - aDist * aDist));
      const pu = r / d, pv = dy / d;
      const elbowU = aDist * pu + hgt * (-pv);
      const elbowV = aDist * pv + hgt * pu;

      const S  = new THREE.Vector3(0, SHY - 0.16, 0);
      const E  = new THREE.Vector3(hx * elbowU, (SHY - 0.16) + elbowV, hz * elbowU);
      const Tt = new THREE.Vector3(hx * r,       (SHY - 0.16) + dy,    hz * r);

      turntable.rotation.y = yaw;
      boneMesh(THREE, upper, S, E);
      boneMesh(THREE, fore,  E, Tt);
      upperAccent.position.copy(S).lerp(E,  0.5);  upperAccent.quaternion.copy(upper.quaternion);
      foreAccent.position.copy(E).lerp(Tt,  0.62); foreAccent.quaternion.copy(fore.quaternion);
      shoulderHub.position.copy(S);  shoulderHubR.position.copy(S);  shoulderHubR.quaternion.copy(upper.quaternion);
      elbowHub.position.copy(E);     elbowRingM.position.copy(E);     elbowRingM.quaternion.copy(fore.quaternion);

      const foreDir = new THREE.Vector3().subVectors(Tt, E).normalize();
      wrist.position.copy(Tt);
      wrist.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), foreDir);

      // tip glow
      const drawing = p >= 0.18 && trace < 0.999 && trace > 0.001;
      tipSprite.position.copy(target);
      tipSprite.material.opacity = lerp(tipSprite.material.opacity, p > 0.1 ? (drawing ? 1 : 0.45) : 0, 0.2);
      tipSprite.scale.setScalar(lerp(0.42, 0.62, 0.5 + 0.5 * Math.sin(time * 6)) * (p > 0.1 ? 1 : 0.2));
      tipLight.position.copy(target);
      tipLight.intensity = lerp(tipLight.intensity, p > 0.1 ? 2.2 : 0, 0.15);

      // traced tube
      tube.geometry.setDrawRange(0, Math.floor(tipIdx  * clamp(trace, 0, 1)));
      tubeGlow.geometry.setDrawRange(0, Math.floor(glowIdx * clamp(trace, 0, 1)));

      // corner stars
      corners.forEach((c: { m: THREE.Mesh; gl: THREE.Sprite }, i: number) => {
        const on = trace >= VFRAC[i] - 0.002 && p >= 0.18;
        c.m.material.opacity = lerp(c.m.material.opacity as number, on ? 1 : 0.2, 0.2);
        (c.m.material as THREE.MeshBasicMaterial).color.set(on ? 0xE7C878 : 0xF4EFE6);
        c.gl.material.opacity = lerp(c.gl.material.opacity as number, on ? 0.9 : 0, 0.2);
        c.m.scale.setScalar(lerp(c.m.scale.x, on ? 1.5 : 1.0, 0.2));
      });

      // centre gem
      const lock = smooth((p - 0.9) / 0.1);
      gem.scale.setScalar(lerp(gem.scale.x, 0.001 + lock, 0.18));
      gem.rotation.y += 0.01; gem.rotation.x = Math.sin(time * 0.8) * 0.15;
      gemCore.material.emissiveIntensity = 0.9 + Math.sin(time * 3) * 0.4 * lock;
      gemGlow.material.opacity = lock * (0.7 + Math.sin(time * 3) * 0.2);
      gemGlow.scale.setScalar(lerp(0.9, 1.3, 0.5 + 0.5 * Math.sin(time * 2)) * lock + 0.001);

      // camera
      const ck   = getCamKey(p);
      const idle = p > 0.92 ? 1 : 0.4;
      camera.position.set(
        ck.pos[0] + Math.sin(time * 0.25) * 0.06 * idle,
        ck.pos[1] + Math.sin(time * 0.40) * 0.03 * idle,
        ck.pos[2] + Math.cos(time * 0.22) * 0.05 * idle
      );
      camera.lookAt(ck.look[0], ck.look[1], ck.look[2]);
      renderer.render(scene, camera);

      // ── HUD ──
      const shAng   = Math.atan2(elbowV, elbowU) * 180 / Math.PI;
      const foreAng = Math.atan2(dy - elbowV, r - elbowU) * 180 / Math.PI;
      const phaseLabel = p < 0.08 ? "Powering up"
        : p < 0.18 ? "Calibrating axes"
        : p < 0.90 ? "Tracing asterism"
        : "Axis locked";
      if (phaseRef.current   && phaseRef.current.textContent !== phaseLabel) phaseRef.current.textContent = phaseLabel;
      if (j1Ref.current)      j1Ref.current.textContent      = shAng.toFixed(1) + "°";
      if (j2Ref.current)      j2Ref.current.textContent      = (foreAng - shAng).toFixed(1) + "°";
      if (pctRef.current)     pctRef.current.textContent     = Math.round(trace * 100) + "%";
      if (torqueRef.current)  torqueRef.current.style.width  =
        clamp(8 + Math.abs(Math.sin(p * Math.PI)) * 70 + trace * 18, 8, 100).toFixed(0) + "%";

      // progress dots
      const stage = p < 0.08 ? 0 : p < 0.18 ? 1 : p < 0.9 ? 2 : 3;
      [0,1,2,3].forEach(i => {
        const el = document.getElementById(`arm3d-dot-${i}`);
        if (el) el.style.background = i <= stage ? "#C9A961" : "rgba(244,239,230,0.18)";
      });

      if (captionRef.current) {
        const cap = p < 0.18 ? "Six axes. One trajectory."
          : p < 0.9 ? "Drawing the asterism, joint by joint."
          : "Locked. Every cycle accounted for.";
        if (captionRef.current.textContent !== cap) captionRef.current.textContent = cap;
      }
    };

    // ── resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!three) return;
      const canvas = canvasRef.current; if (!canvas) return;
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      three.renderer.setSize(w, h, false);
      three.camera.aspect = w / h;
      three.camera.updateProjectionMatrix();
    };

    // ── scroll ────────────────────────────────────────────────────────────
    const onScroll = () => {
      const sec = pinRef.current; if (!sec) return;
      const total   = sec.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - sec.offsetTop;
      targetP = clamp(scrolled / Math.max(1, total), 0, 1);
    };

    // ── main loop ─────────────────────────────────────────────────────────
    const loop = () => {
      sp += (targetP - sp) * 0.14;
      if (three) updateScene(sp);
      raf = requestAnimationFrame(loop);
    };

    initThree().then(() => { onScroll(); onResize(); loop(); });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (three?.renderer) three.renderer.dispose();
    };
  }, []);

  // ── styles ────────────────────────────────────────────────────────────
  const hudLabel: React.CSSProperties = {
    fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase",
    color: "rgba(244,239,230,0.4)",
  };
  const teleRow: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", gap: "1.4rem",
    fontSize: "0.72rem", color: "rgba(244,239,230,0.55)", marginBottom: "0.5rem",
  };

  return (
    <section ref={pinRef} style={{ position: "relative", zIndex: 5, height: "240vh" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* 3-D canvas */}
        <canvas ref={canvasRef} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          zIndex: 5, display: "block",
        }} />

        {/* top-left — phase + dots */}
        <div style={{ position: "absolute", top: "clamp(1.5rem,5vh,3rem)", left: "clamp(1.5rem,5vw,4rem)", zIndex: 10 }}>
          <div style={{ ...hudLabel, marginBottom: "0.5rem" }}>System state</div>
          <div ref={phaseRef} style={{
            fontFamily: "var(--font-display,serif)",
            fontSize: "clamp(1.6rem,3.2vw,2.6rem)",
            fontWeight: 300, letterSpacing: "-0.01em",
            color: "var(--color-accent,#C9A961)",
          }}>
            Standby
          </div>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.9rem" }}>
            {[0,1,2,3].map(i => (
              <span key={i} id={`arm3d-dot-${i}`} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "rgba(244,239,230,0.18)", display: "inline-block",
              }} />
            ))}
          </div>
        </div>

        {/* top-right — telemetry */}
        <div style={{ position: "absolute", top: "clamp(1.5rem,5vh,3rem)", right: "clamp(1.5rem,5vw,4rem)", zIndex: 10, textAlign: "right", minWidth: 180 }}>
          <div style={{ ...hudLabel, marginBottom: "0.9rem" }}>Telemetry</div>
          <div style={teleRow}>
            <span>θ&#8201;shoulder</span>
            <span ref={j1Ref} style={{ color: "var(--color-cream,#F4EFE6)", fontVariantNumeric: "tabular-nums" }}>0.0°</span>
          </div>
          <div style={teleRow}>
            <span>θ&#8201;elbow</span>
            <span ref={j2Ref} style={{ color: "var(--color-cream,#F4EFE6)", fontVariantNumeric: "tabular-nums" }}>0.0°</span>
          </div>
          <div style={{ ...teleRow, marginBottom: "0.7rem" }}>
            <span>trace</span>
            <span ref={pctRef} style={{ color: "var(--color-accent,#C9A961)", fontVariantNumeric: "tabular-nums" }}>0%</span>
          </div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(244,239,230,0.35)", marginBottom: "0.4rem" }}>
            Servo torque
          </div>
          <div style={{ width: "100%", height: 2, background: "rgba(244,239,230,0.12)" }}>
            <div ref={torqueRef} style={{
              height: 2, width: "8%",
              background: "var(--color-accent,#C9A961)",
              boxShadow: "0 0 5px var(--color-accent,#C9A961)",
            }} />
          </div>
        </div>

        {/* bottom caption */}
        <div ref={captionRef} style={{
          position: "absolute", bottom: "clamp(1.5rem,5vh,3rem)",
          left: "50%", transform: "translateX(-50%)", zIndex: 10,
          fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(244,239,230,0.45)", whiteSpace: "nowrap",
        }}>
          Six axes. One trajectory.
        </div>
      </div>
    </section>
  );
}
