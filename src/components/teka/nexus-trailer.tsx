"use client";

/**
 * TEKA NEXUS — Deep-Space Transmission
 *
 * A cinematic, looping "in-space advertisement" for the live TEKA Nexus academy.
 * One canvas draws the whole scene: warp starfield, a ringed planet, the
 * Mothership Nexus-01, a flying saucer (crewed, naturally), alien pods and
 * comets — choreographed on a 26s story loop with synced HUD captions.
 *
 * Engineering notes (mobile-Chrome hardened):
 *  - DPR capped (1.5 on small screens / 2 on desktop), entity counts scale down
 *  - Single rAF loop; fully paused when off-screen (IntersectionObserver) or tab hidden
 *  - prefers-reduced-motion renders one static composed frame, zero animation
 *  - Transform/opacity-only CSS animations for the HTML overlay
 *
 * Honesty: every claim mirrors src/lib/teka/config.ts — Nexus is a real live product.
 */

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Globe2,
  GraduationCap,
  Hammer,
  Radar,
  Rocket,
  Sparkles,
  Users2,
} from "lucide-react";
import { NEXUS } from "@/lib/teka/config";

/* ── story loop ──────────────────────────────────────────────────────────── */

const LOOP = 26; // seconds
const PHASES = [0, 5, 11, 16, 21] as const;

const PHASE_CAPTIONS = [
  "SOMEWHERE BEYOND THE STARS… A SIGNAL IS SEARCHING FOR MINDS LIKE YOURS",
  "MOTHERSHIP NEXUS-01 HAS ENTERED ORBIT — THE ACADEMY IS LIVE",
  "ALIEN LIFE CONFIRMED. THEY CROSSED THE VOID TO LEARN. FREE.",
  "EVERY CIVILIZATION BEGINS BY LEARNING. YOURS BEGINS HERE.",
  "BOARDING GATES OPEN — WARP DRIVE CHARGED",
] as const;

const TICKER = [
  "FREE PYTHON ACADEMY",
  "WEB ACADEMY",
  "TEAMMATE MATCHING",
  "REAL PROJECTS",
  "QUIZZES & CERTIFICATES",
  "100% FREE",
  "NO EXPERIENCE NEEDED",
  "BUILT BY TEKA",
] as const;

const NEXUS_ICONS = [GraduationCap, Globe2, Users2, Hammer, Award, Sparkles];

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);
const easeInCubic = (k: number) => k * k * k;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ── the cosmos engine ───────────────────────────────────────────────────── */

type WStar = { x: number; y: number; z: number; pz: number; c: string };
type Pod = { x: number; y: number; r: number; vy: number; ph: number };
type Comet = { x: number; y: number; vx: number; vy: number; life: number; max: number };

/** Warp intensity over the loop — drives starfield speed + engine flames. */
function boostAt(lt: number): number {
  if (lt < 5) return 0.12;
  if (lt < 7.4) {
    const k = (lt - 5) / 2.4;
    const s = k * k * (3 - 2 * k); // smoothstep
    return 0.12 + 1.05 * s;
  }
  if (lt < 11) return 0.4;
  if (lt < 16) return 0.3;
  if (lt < 21) return 0.16 + 0.14 * ((lt - 16) / 5);
  if (lt < 23.2) {
    const k = clamp((lt - 21) / 2.2, 0, 1);
    return 0.3 + 1.5 * Math.sin(k * Math.PI);
  }
  return 0.12;
}

function phaseIndexAt(lt: number): number {
  let idx = 0;
  for (let i = 0; i < PHASES.length; i++) if (lt >= PHASES[i]) idx = i;
  return idx;
}

const NexusCosmos = memo(function NexusCosmos({ onPhase }: { onPhase: (i: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onPhaseRef = useRef(onPhase);
  useEffect(() => {
    onPhaseRef.current = onPhase;
  }, [onPhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 640;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    const N_STARS = small ? 150 : 240;
    const N_PODS = small ? 2 : 4;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let scale = 0;
    let shipScale = small ? 0.72 : 1;
    let parkX = 0;
    let parkY = 0;

    let stars: WStar[] = [];
    let pods: Pod[] = [];
    let comets: Comet[] = [];
    let nextCometAt = 0;
    let seededW = 0;
    let seededH = 0;

    const respawnStar = (s: WStar, init = false) => {
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 3; tries++) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        if (Math.max(Math.abs(x), Math.abs(y)) > 0.06) break;
      }
      s.x = x;
      s.y = y;
      s.z = init ? Math.random() * 0.9 + 0.1 : 1;
      s.pz = s.z;
      const g = Math.random();
      s.c = g < 0.12 ? "232,199,116" : g < 0.2 ? "126,222,190" : "214,220,232";
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h * 0.46;
      scale = Math.min(cx, cy);
      // park the mothership in the upper-left corridor — planet owns the right,
      // HUD badges own the exact top-center, copy owns the middle.
      parkX = w < 640 ? w * 0.3 : w * 0.26;
      parkY = Math.max(h * 0.2, 116);

      stars = [];
      for (let i = 0; i < N_STARS; i++) {
        const s: WStar = { x: 0, y: 0, z: 0, pz: 0, c: "" };
        respawnStar(s, true);
        stars.push(s);
      }
      pods = Array.from({ length: N_PODS }, (_, i) => ({
        x: (0.08 + 0.2 * i + Math.random() * 0.07) * w,
        y: Math.random() * h,
        r: 13 + Math.random() * 8,
        vy: -(0.1 + Math.random() * 0.14),
        ph: Math.random() * Math.PI * 2,
      }));
      seededW = w;
      seededH = h;
    };

    /* ── shared drawing helpers ── */

    const drawAlien = (x: number, y: number, s: number) => {
      ctx.fillStyle = "#5bd68d";
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.62, s * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b0f0c";
      ctx.beginPath();
      ctx.ellipse(x - s * 0.26, y - s * 0.05, s * 0.17, s * 0.28, -0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + s * 0.26, y - s * 0.05, s * 0.17, s * 0.28, 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5bd68d";
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.beginPath();
      ctx.moveTo(x - s * 0.22, y - s * 0.62);
      ctx.lineTo(x - s * 0.38, y - s * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y - s * 0.62);
      ctx.lineTo(x + s * 0.38, y - s * 0.95);
      ctx.stroke();
      ctx.fillStyle = "#8af0b4";
      ctx.beginPath();
      ctx.arc(x - s * 0.38, y - s * 0.98, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + s * 0.38, y - s * 0.98, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (t: number) => {
      const R = clamp(scale * 0.3, 46, 140);
      const px = Math.min(w * 0.82, w - R * 1.15);
      const py = Math.max(h * 0.14, R * 0.9);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.42);
      ctx.strokeStyle = "rgba(227,184,85,0.2)";
      ctx.lineWidth = R * 0.15;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.85, R * 0.5, 0, Math.PI * 1.02, Math.PI * 1.98);
      ctx.stroke();
      ctx.restore();

      const g = ctx.createRadialGradient(px - R * 0.45, py - R * 0.5, R * 0.1, px, py, R);
      g.addColorStop(0, "#3d4049");
      g.addColorStop(0.6, "#17181d");
      g.addColorStop(1, "#0a0a0e");
      ctx.beginPath();
      ctx.arc(px, py, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, R, 0, Math.PI * 2);
      ctx.clip();
      const rim = ctx.createLinearGradient(px - R, py - R, px + R * 0.4, py + R);
      rim.addColorStop(0, "rgba(227,184,85,0.5)");
      rim.addColorStop(0.4, "rgba(227,184,85,0.05)");
      rim.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rim;
      ctx.fillRect(px - R, py - R, R * 2, R * 2);
      ctx.restore();

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.42);
      ctx.strokeStyle = "rgba(227,184,85,0.42)";
      ctx.lineWidth = R * 0.15;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.85, R * 0.5, 0, Math.PI * 0.02, Math.PI * 0.98);
      ctx.stroke();
      ctx.restore();

      // moon
      const ma = t * 0.00012;
      const mx = px + Math.cos(ma) * R * 2.5;
      const my = py - R * 1.15 + Math.sin(ma) * R * 0.85;
      ctx.beginPath();
      ctx.arc(mx, my, Math.max(2.5, R * 0.055), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,205,214,0.7)";
      ctx.fill();
    };

    const drawMothership = (x: number, y: number, warp: number, t: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(shipScale, shipScale);

      // engine flames (behind hull)
      const flick = 0.75 + 0.25 * Math.sin(t * 0.03);
      const flame = 34 + warp * 90 * flick;
      for (const ex of [-44, 0, 44]) {
        const grad = ctx.createLinearGradient(ex - flame, 0, ex, 0);
        grad.addColorStop(0, "rgba(240,212,138,0)");
        grad.addColorStop(0.7, "rgba(240,212,138,0.5)");
        grad.addColorStop(1, "rgba(255,244,214,0.95)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ex - flame, 2);
        ctx.lineTo(ex, 2);
        ctx.stroke();
      }

      // hull
      const hull = ctx.createLinearGradient(0, -18, 0, 12);
      hull.addColorStop(0, "#e9ebf0");
      hull.addColorStop(0.45, "#9ba3ae");
      hull.addColorStop(1, "#23242a");
      ctx.beginPath();
      ctx.moveTo(-70, 0);
      ctx.lineTo(-40, -14);
      ctx.lineTo(28, -16);
      ctx.lineTo(62, -6);
      ctx.lineTo(70, 0);
      ctx.lineTo(56, 9);
      ctx.lineTo(-40, 10);
      ctx.closePath();
      ctx.fillStyle = hull;
      ctx.fill();
      ctx.strokeStyle = "rgba(227,184,85,0.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // gold trim + windows
      ctx.strokeStyle = "rgba(227,184,85,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-58, -3);
      ctx.lineTo(58, -3);
      ctx.stroke();
      ctx.fillStyle = "rgba(240,212,138,0.9)";
      for (const wx of [-34, -18, -2, 14, 30]) {
        ctx.beginPath();
        ctx.arc(wx, 3.5, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // cockpit dome
      ctx.beginPath();
      ctx.arc(30, -15, 9, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(240,212,138,0.85)";
      ctx.shadowColor = "rgba(240,212,138,0.9)";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // fins
      ctx.fillStyle = "#3a3d46";
      ctx.beginPath();
      ctx.moveTo(-44, -13);
      ctx.lineTo(-30, -24);
      ctx.lineTo(-18, -14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-30, 9);
      ctx.lineTo(-16, 18);
      ctx.lineTo(-2, 9.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawSaucer = (x: number, y: number, k: number, t: number) => {
      ctx.save();
      ctx.translate(x, y);

      // abduction beam
      if (k > 0.12 && k < 0.88) {
        const flicker = 0.75 + 0.25 * Math.sin(t * 0.021);
        const beam = ctx.createLinearGradient(0, 6, 0, h * 0.42);
        beam.addColorStop(0, `rgba(126,222,190,${0.3 * flicker})`);
        beam.addColorStop(1, "rgba(126,222,190,0)");
        ctx.beginPath();
        ctx.moveTo(-9, 6);
        ctx.lineTo(9, 6);
        ctx.lineTo(30, h * 0.42);
        ctx.lineTo(-30, h * 0.42);
        ctx.closePath();
        ctx.fillStyle = beam;
        ctx.fill();
      }

      // dome (glass) + crew
      ctx.beginPath();
      ctx.arc(0, -7, 13, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(180,240,220,0.16)";
      ctx.fill();
      ctx.strokeStyle = "rgba(180,240,220,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      drawAlien(0, -12, 7);

      // saucer body
      const body = ctx.createLinearGradient(0, -8, 0, 10);
      body.addColorStop(0, "#dfe2e9");
      body.addColorStop(0.5, "#8f939b");
      body.addColorStop(1, "#26272c");
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(227,184,85,0.45)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // rim lights — sequential chase
      for (let i = 0; i < 6; i++) {
        const lx = -25 + i * 10;
        const lit = (Math.floor(t / 140) + i) % 6 === 0;
        ctx.beginPath();
        ctx.arc(lx, 4, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = lit ? "rgba(247,231,176,0.95)" : "rgba(126,222,190,0.5)";
        ctx.fill();
      }

      ctx.restore();
    };

    const drawPod = (p: Pod) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(126,222,190,0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(126,222,190,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      drawAlien(p.x, p.y + 1, p.r * 0.62);
    };

    /* ── choreography ── */

    const shipState = (lt: number): { x: number; y: number; warp: number; on: boolean } => {
      if (lt < PHASES[1]) return { x: 0, y: 0, warp: 0, on: false };
      if (lt < 7.6) {
        const k = easeOutCubic((lt - 5) / 2.6);
        return { x: -240 + k * (parkX + 240), y: parkY, warp: 1.1, on: true };
      }
      if (lt < 21) {
        return {
          x: parkX + Math.sin(lt * 0.7) * 6,
          y: parkY + Math.sin(lt * 1.1) * 5,
          warp: 0.2,
          on: true,
        };
      }
      if (lt < 23.4) {
        const k = easeInCubic((lt - 21) / 2.4);
        return { x: parkX + k * (w - parkX + 320), y: parkY, warp: 1.6, on: true };
      }
      return { x: 0, y: 0, warp: 0, on: false };
    };

    const saucerState = (lt: number): { x: number; y: number; k: number } | null => {
      if (lt < 11 || lt >= 15.8) return null;
      const k = (lt - 11) / 4.8;
      return { x: w + 80 - k * (w + 160), y: h * 0.34 + Math.sin(k * Math.PI * 2.2) * h * 0.05, k };
    };

    const draw = (t: number, lt: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);

      // warp starfield
      const boost = boostAt(lt);
      const speed = (0.05 + boost * 0.55) * dt;
      ctx.lineCap = "round";
      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0.03) {
          respawnStar(s);
          continue;
        }
        const k = 0.92;
        const x1 = cx + (s.x / s.z) * scale * k;
        const y1 = cy + (s.y / s.z) * scale * k;
        const x0 = cx + (s.x / s.pz) * scale * k;
        const y0 = cy + (s.y / s.pz) * scale * k;
        const depth = 1 - s.z;
        ctx.strokeStyle = `rgba(${s.c},${0.2 + depth * 0.75})`;
        ctx.lineWidth = depth * 1.7 + 0.3;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      // comets
      for (const m of comets) {
        m.life += dt;
        m.x += m.vx * dt * 60;
        m.y += m.vy * dt * 60;
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const tailX = m.x - m.vx * 9;
        const tailY = m.y - m.vy * 9;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, "rgba(240,212,138,0)");
        grad.addColorStop(1, `rgba(240,212,138,${0.8 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }
      comets = comets.filter(
        (m) => m.life < m.max && m.x > -80 && m.x < w + 80 && m.y < h + 80,
      );
      if (t > nextCometAt) {
        const fromLeft = Math.random() > 0.5;
        const sp = 6 + Math.random() * 4;
        const ang = (18 + Math.random() * 18) * (Math.PI / 180);
        comets.push({
          x: fromLeft ? -40 : w + 40,
          y: Math.random() * h * 0.35,
          vx: (fromLeft ? 1 : -1) * Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          max: 60 + Math.random() * 30,
        });
        nextCometAt = t + 5000 + Math.random() * 7000;
      }

      drawPlanet(t);

      // alien pods
      for (const p of pods) {
        p.y += p.vy * dt * 60;
        p.x += Math.sin(t * 0.0006 + p.ph) * 0.2;
        if (p.y < -50) {
          p.y = h + 50;
          p.x = Math.random() * w;
        }
        drawPod(p);
      }

      // saucer flyby
      const saucer = saucerState(lt);
      if (saucer) drawSaucer(saucer.x, saucer.y, saucer.k, t);

      // mothership
      const ship = shipState(lt);
      if (ship.on) drawMothership(ship.x, ship.y, ship.warp, t);

      // warp-burst flash
      if (lt >= 21 && lt < 22.8) {
        const a = Math.sin(clamp((lt - 21) / 1.2, 0, 1) * Math.PI) * 0.14;
        ctx.fillStyle = `rgba(247,231,176,${a})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    /** Static composed frame for prefers-reduced-motion. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const k = 0.92;
        const x = cx + (s.x / s.z) * scale * k;
        const y = cy + (s.y / s.z) * scale * k;
        const depth = 1 - s.z;
        ctx.fillStyle = `rgba(${s.c},${0.2 + depth * 0.75})`;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
      drawPlanet(0);
      drawSaucer(w * 0.74, h * 0.3, 0.4, 0);
      drawPod(pods[0] ?? { x: w * 0.1, y: h * 0.62, r: 15, vy: 0, ph: 0 });
      drawMothership(parkX, parkY, 0.2, 0);
    };

    /* ── loop / lifecycle ── */

    let raf = 0;
    let running = true;
    let inView = true;
    let last = performance.now();
    let acc = 0;
    let lastPhase = -1;

    const step = (now: number) => {
      if (!running || !inView) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      acc += dt;
      if (acc >= LOOP) acc -= LOOP;
      draw(now, acc, dt);
      const idx = phaseIndexAt(acc);
      if (idx !== lastPhase) {
        lastPhase = idx;
        onPhaseRef.current(idx);
      }
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running && inView && !reduced) {
        cancelAnimationFrame(raf);
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
    };

    resize();
    if (reduced) {
      drawStatic();
    } else {
      start();
    }

    const onResize = () => {
      // Mobile Chrome fires resize when the URL bar hides — only react to
      // real viewport changes (rotation / split screen).
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (Math.abs(cw - seededW) < 2 && Math.abs(ch - seededH) < 8) return;
      resize();
      if (reduced) drawStatic();
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) start();
        else stop();
      },
      { rootMargin: "80px", threshold: 0.02 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
});

/* ── decorative ticking coordinates (isolated so the section never re-renders) ── */

function TelemetryCoords() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 1100);
    return () => window.clearInterval(id);
  }, []);
  const ra = (4.31 + Math.sin(tick * 0.7) * 0.04).toFixed(2);
  const dec = (-16.42 + Math.cos(tick * 0.5) * 0.06).toFixed(2);
  return (
    <span className="mono-label text-muted-foreground/60 tabular-nums">
      RA {ra}h · DEC {dec}° · SIGNAL LOCK
    </span>
  );
}

/* ── the section ─────────────────────────────────────────────────────────── */

export function NexusTrailer() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);

  const handlePhase = useCallback((i: number) => setPhase(i), []);
  // Static frame (reduced motion) always shows the calm caption.
  const shownPhase = reduced ? 3 : phase;

  return (
    <section
      className="relative flex min-h-[92svh] flex-col overflow-hidden"
      aria-label="TEKA Nexus — deep space transmission"
    >
      {/* deep-space nebula wash (CSS only, GPU cheap) */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 18% 24%, rgba(227,184,85,0.07), transparent 70%), radial-gradient(ellipse 48% 40% at 82% 76%, rgba(126,222,190,0.05), transparent 72%), #050506",
        }}
      />

      {/* the cosmos */}
      <NexusCosmos onPhase={handlePhase} />

      {/* center scrim — keeps copy readable over warp streaks */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 64% 52% at 50% 52%, rgba(5,5,5,0.6), transparent 72%)",
        }}
      />

      {/* top/bottom blends into the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute inset-4 z-20 sm:inset-6" aria-hidden="true">
        <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-gold/35" />
        <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-lg border-r-2 border-t-2 border-gold/35" />
        <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-gold/35" />
        <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-gold/35" />
      </div>

      {/* HUD top strip */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-7 sm:px-12 sm:pt-9">
        <span className="mono-label inline-flex items-center gap-2 text-gold/80">
          <Radar className="h-3.5 w-3.5 animate-pulse" aria-hidden />
          Live Transmission · Relay-7
        </span>
        <span className="hidden sm:block">
          <TelemetryCoords />
        </span>
      </div>

      {/* main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* status badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.07] px-3.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 pulse-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="mono-label text-emerald-300">Live Product</span>
            </span>
            <span className="mono-label text-muted-foreground/60">Node NEXUS-01 // Mothership</span>
          </div>

          {/* Persian name */}
          <p
            dir="rtl"
            lang="fa"
            className="mt-6 font-display text-base font-medium tracking-[0.3em] text-gold/70"
          >
            {NEXUS.nativeName}
          </p>

          {/* the big one */}
          <h2 className="gold-text mt-2 font-display text-[17vw] font-bold leading-[0.95] tracking-tight sm:text-8xl lg:text-9xl">
            TEKA NEXUS
          </h2>

          <p className="mt-4 font-display text-lg font-medium text-foreground/90 sm:text-2xl">
            {NEXUS.tagline}
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
            {NEXUS.description}
          </p>

          {/* synced cinematic caption */}
          <div className="mt-6 flex min-h-[3.5rem] items-center justify-center" aria-live="off">
            <AnimatePresence mode="wait">
              <motion.p
                key={shownPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="max-w-xl font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gold-bright/90 sm:text-xs"
              >
                {PHASE_CAPTIONS[shownPhase]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* features */}
          <ul
            className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-3"
            aria-label="TEKA Nexus features"
          >
            {NEXUS.features.map((feature, i) => {
              const Icon = NEXUS_ICONS[i % NEXUS_ICONS.length];
              return (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-gold flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-gold-bright/90 sm:text-[13px]"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                  {feature}
                </motion.li>
              );
            })}
          </ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-3"
          >
            <a
              href={NEXUS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-8 py-3.5 text-sm font-semibold text-black shadow-[0_0_46px_-8px_rgba(227,184,85,0.6)] transition-transform duration-300 hover:scale-[1.045] active:scale-[0.97] sm:text-base"
              aria-label={`Open ${NEXUS.name} — the TEKA academy (new tab)`}
            >
              <Rocket className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              Board The Nexus
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground/80">
              teka-nexus.vercel.app · free forever
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* transmission ticker */}
      <div className="relative z-20 mt-auto overflow-hidden border-t border-white/[0.06] bg-black/45 py-2.5">
        <div className="nexus-ticker flex w-max items-center gap-10 whitespace-nowrap px-5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
              {TICKER.map((item) => (
                <span key={item} className="flex items-center gap-10">
                  <span className="mono-label text-gold/70">{item}</span>
                  <span className="text-gold/40" aria-hidden>
                    ▸
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
