"use client";

/**
 * TEKA NEXUS — Deep-Space Transmission (Galactic Edition)
 *
 * A cinematic, looping "in-space advertisement" for the live TEKA Nexus academy.
 * One canvas paints the whole galaxy: pre-rendered spiral galaxy + black hole
 * + ringed planet sprites, a warp starfield, asteroid belt, rotating space
 * station, jellyfish alien, escorted Mothership Nexus-01, a saucer flyby with
 * its crew, alien pods, a wormhole and comets — choreographed on a 26s story
 * loop with synced HUD captions and a boarding-pass CTA.
 *
 * Engineering notes (mobile-Chrome hardened):
 *  - DPR capped (1.5 small screens / 2 desktop), entity counts scale down
 *  - Static deep-sky objects (galaxy, black hole, planet) are pre-rendered to
 *    offscreen canvases once per resize — per-frame cost is a single drawImage
 *  - Single rAF loop; fully paused off-screen (IntersectionObserver) or hidden tab
 *  - prefers-reduced-motion renders one static composed frame, zero animation
 *
 * Honesty: every factual claim mirrors src/lib/teka/config.ts — Nexus is a real
 * live product. The aliens, ships and wormholes are the marketing department.
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
  Ticket,
  Users2,
} from "lucide-react";
import { NEXUS } from "@/lib/teka/config";

/* ── story loop ──────────────────────────────────────────────────────────── */

const LOOP = 26; // seconds
const PHASES = [0, 5, 11, 16, 21] as const;

const PHASE_CAPTIONS = [
  "SOMEWHERE BEYOND THE STARS… A GALAXY IS SEARCHING FOR MINDS LIKE YOURS",
  "MOTHERSHIP NEXUS-01 HAS ENTERED ORBIT — ESCORTS DEPLOYED",
  "ALIEN LIFE CONFIRMED — THE JELLYFISH NEBULA SAYS HELLO",
  "EVERY CIVILIZATION BEGINS BY LEARNING. YOURS BEGINS HERE.",
  "BOARDING GATES OPEN — WORMHOLE LOCKED ON YOUR POSITION",
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
type Pod = { x: number; y: number; r: number; vy: number; ph: number; tone: string };
type Comet = { x: number; y: number; vx: number; vy: number; life: number; max: number };
type Asteroid = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  r: number;
  pts: number[];
};

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

/** Wormhole glow envelope — wakes up in phase 3, flares when the ship dives in. */
function wormholeAt(lt: number): number {
  if (lt < 16) return 0.12;
  if (lt < 21) return 0.3;
  if (lt < 22.6) return 0.3 + 0.7 * Math.min(1, (lt - 21) / 1.2);
  if (lt < 25) return Math.max(0.12, 1 - (lt - 22.6) / 1.4);
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
    const N_ASTEROIDS = small ? 7 : 13;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let scale = 0;
    const shipScale = small ? 0.72 : 1;
    let parkX = 0;
    let parkY = 0;
    let wormX = 0;

    let stars: WStar[] = [];
    let pods: Pod[] = [];
    let comets: Comet[] = [];
    let asteroids: Asteroid[] = [];
    let nextCometAt = 0;
    let seededW = 0;
    let seededH = 0;

    // pre-rendered deep-sky sprites
    let galaxySprite: HTMLCanvasElement | null = null;
    let galaxySize = 0;
    let holeSprite: HTMLCanvasElement | null = null;
    let holeSize = 0;
    let planetSprite: HTMLCanvasElement | null = null;
    let planetR = 0;
    let planetW = 0;

    const makeSprite = (wCss: number, hCss: number) => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.ceil(wCss * dpr));
      c.height = Math.max(1, Math.ceil(hCss * dpr));
      const g = c.getContext("2d");
      if (!g) return null;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { c, g };
    };

    const buildGalaxy = () => {
      const S = Math.round(clamp(scale * 1.1, 220, 430));
      const sp = makeSprite(S, S);
      if (!sp) return;
      const { c, g } = sp;
      const cxy = S / 2;
      let grad = g.createRadialGradient(cxy, cxy, 0, cxy, cxy, S * 0.5);
      grad.addColorStop(0, "rgba(240,230,200,0.10)");
      grad.addColorStop(0.5, "rgba(227,184,85,0.05)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
      for (let arm = 0; arm < 2; arm++) {
        for (let i = 0; i < 170; i++) {
          const t = i / 170;
          const ang = arm * Math.PI + t * 3.8;
          const r = 3 + Math.pow(t, 0.8) * S * 0.46;
          const jitter = (Math.random() - 0.5) * 6;
          const x = cxy + Math.cos(ang) * r + jitter;
          const y = cxy + Math.sin(ang) * r * 0.62 + jitter; // perspective tilt
          const rr = 0.5 + Math.random() * 1.1;
          const fade = (1 - t) * 0.55 + 0.08;
          const gold = Math.random() < 0.22;
          const teal = Math.random() < 0.06;
          g.fillStyle = gold
            ? `rgba(232,199,116,${fade})`
            : teal
              ? `rgba(126,222,190,${fade * 0.8})`
              : `rgba(214,220,232,${fade * 0.85})`;
          g.beginPath();
          g.arc(x, y, rr, 0, Math.PI * 2);
          g.fill();
        }
      }
      grad = g.createRadialGradient(cxy, cxy, 0, cxy, cxy, S * 0.1);
      grad.addColorStop(0, "rgba(255,244,214,0.9)");
      grad.addColorStop(0.4, "rgba(240,212,138,0.35)");
      grad.addColorStop(1, "rgba(240,212,138,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cxy, cxy, S * 0.1, 0, Math.PI * 2);
      g.fill();
      galaxySprite = c;
      galaxySize = S;
    };

    const buildBlackHole = () => {
      const B = Math.round(clamp(scale * 0.42, 110, 190));
      const sp = makeSprite(B, B);
      if (!sp) return;
      const { c, g } = sp;
      const cc = B / 2;
      g.save();
      g.translate(cc, cc);
      g.rotate(-0.35);
      const disk = (ry: number, alpha: number, width: number) => {
        g.strokeStyle = `rgba(240,212,138,${alpha})`;
        g.lineWidth = width;
        g.beginPath();
        g.ellipse(0, 0, B * 0.42, ry, 0, 0, Math.PI * 2);
        g.stroke();
      };
      disk(B * 0.13, 0.3, B * 0.09);
      disk(B * 0.1, 0.55, B * 0.05);
      g.restore();
      const grad = g.createRadialGradient(cc, cc, B * 0.12, cc, cc, B * 0.24);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.75, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cc, cc, B * 0.24, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,244,214,0.85)";
      g.lineWidth = 1.4;
      g.shadowColor = "rgba(240,212,138,0.9)";
      g.shadowBlur = 10;
      g.beginPath();
      g.arc(cc, cc, B * 0.155, 0, Math.PI * 2);
      g.stroke();
      g.shadowBlur = 0;
      holeSprite = c;
      holeSize = B;
    };

    const buildPlanet = () => {
      const R = Math.round(clamp(scale * 0.3, 46, 140));
      const S = Math.ceil(R * 4.1);
      const sp = makeSprite(S, S);
      if (!sp) return;
      const { c, g } = sp;
      const cc = S / 2;
      g.save();
      g.translate(cc, cc);
      g.rotate(-0.42);
      g.strokeStyle = "rgba(227,184,85,0.2)";
      g.lineWidth = R * 0.15;
      g.beginPath();
      g.ellipse(0, 0, R * 1.85, R * 0.5, 0, Math.PI * 1.02, Math.PI * 1.98);
      g.stroke();
      g.restore();
      const grad = g.createRadialGradient(cc - R * 0.45, cc - R * 0.5, R * 0.1, cc, cc, R);
      grad.addColorStop(0, "#3d4049");
      grad.addColorStop(0.6, "#17181d");
      grad.addColorStop(1, "#0a0a0e");
      g.beginPath();
      g.arc(cc, cc, R, 0, Math.PI * 2);
      g.fillStyle = grad;
      g.fill();
      g.save();
      g.beginPath();
      g.arc(cc, cc, R, 0, Math.PI * 2);
      g.clip();
      const rim = g.createLinearGradient(cc - R, cc - R, cc + R * 0.4, cc + R);
      rim.addColorStop(0, "rgba(227,184,85,0.5)");
      rim.addColorStop(0.4, "rgba(227,184,85,0.05)");
      rim.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rim;
      g.fillRect(cc - R, cc - R, R * 2, R * 2);
      g.restore();
      g.save();
      g.translate(cc, cc);
      g.rotate(-0.42);
      g.strokeStyle = "rgba(227,184,85,0.42)";
      g.lineWidth = R * 0.15;
      g.beginPath();
      g.ellipse(0, 0, R * 1.85, R * 0.5, 0, Math.PI * 0.02, Math.PI * 0.98);
      g.stroke();
      g.restore();
      planetSprite = c;
      planetR = R;
      planetW = S;
    };

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

    const makeAsteroid = (randomY: boolean): Asteroid => {
      const r = 3 + Math.random() * 7;
      const pts: number[] = [];
      const n = 8;
      for (let i = 0; i < n; i++) {
        pts.push(r * (0.7 + Math.random() * 0.55));
      }
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -20,
        vx: (Math.random() - 0.5) * 0.24,
        vy: 0.04 + Math.random() * 0.12,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.01,
        r,
        pts,
      };
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
      // Mothership parks in the upper-left corridor (emerging from the galaxy):
      // galaxy owns far left, planet owns the right, HUD badges own top-center.
      parkX = w < 640 ? w * 0.3 : w * 0.26;
      parkY = Math.max(h * 0.2, 116);
      wormX = w * 0.88;

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
        tone: i % 2 === 0 ? "#5bd68d" : "#5bd6c9",
      }));
      asteroids = Array.from({ length: N_ASTEROIDS }, () => makeAsteroid(true));

      buildGalaxy();
      buildBlackHole();
      buildPlanet();

      seededW = w;
      seededH = h;
    };

    /* ── shared drawing helpers ── */

    const drawAlien = (x: number, y: number, s: number, tone = "#5bd68d") => {
      ctx.fillStyle = tone;
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
      ctx.strokeStyle = tone;
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.beginPath();
      ctx.moveTo(x - s * 0.22, y - s * 0.62);
      ctx.lineTo(x - s * 0.38, y - s * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y - s * 0.62);
      ctx.lineTo(x + s * 0.38, y - s * 0.95);
      ctx.stroke();
      ctx.fillStyle = "#aef7cc";
      ctx.beginPath();
      ctx.arc(x - s * 0.38, y - s * 0.98, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + s * 0.38, y - s * 0.98, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawJelly = (x: number, y: number, t: number, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      const pulse = 1 + Math.sin(t * 0.0012) * 0.08;
      const grad = ctx.createRadialGradient(0, -4, 2, 0, 0, 20 * pulse);
      grad.addColorStop(0, "rgba(196,150,240,0.5)");
      grad.addColorStop(0.7, "rgba(150,110,210,0.22)");
      grad.addColorStop(1, "rgba(150,110,210,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 20 * pulse, Math.PI, 0);
      ctx.quadraticCurveTo(20 * pulse, 6, 0, 8);
      ctx.quadraticCurveTo(-20 * pulse, 6, -20 * pulse, 0);
      ctx.fill();
      // a friendly face — the jellyfish is on our side
      ctx.fillStyle = "rgba(20,10,30,0.85)";
      ctx.beginPath();
      ctx.arc(-5, -6, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -6, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,10,30,0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -1, 2.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "rgba(170,130,225,0.4)";
      ctx.lineWidth = 1.4;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(k * 7, 6);
        const sway = Math.sin(t * 0.002 + k) * 5;
        ctx.quadraticCurveTo(k * 7 + sway, 20, k * 7 + sway * 1.6, 34);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawStation = (x: number, y: number, t: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = 0.55;
      const rot = t * 0.0004;
      ctx.strokeStyle = "rgba(155,163,174,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = rot + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
        ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24);
        ctx.stroke();
      }
      const lit = Math.floor(t / 700) % 2 === 0;
      ctx.fillStyle = lit ? "rgba(240,212,138,0.95)" : "rgba(240,212,138,0.25)";
      ctx.beginPath();
      ctx.arc(Math.cos(rot) * 24, Math.sin(rot) * 24, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawMothership = (x: number, y: number, warp: number, t: number, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
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

    const drawEscorts = (shipX: number, shipY: number, lt: number, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 3; i++) {
        const a = lt * 1.1 + i * ((Math.PI * 2) / 3);
        const ex = shipX + Math.cos(a) * 105 * shipScale;
        const ey = shipY + Math.sin(a) * 26 * shipScale;
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = "rgba(240,212,138,0.85)";
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-5, 3.4);
        ctx.lineTo(-5, -3.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
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
      drawAlien(p.x, p.y + 1, p.r * 0.62, p.tone);
    };

    const drawWormhole = (t: number, lt: number) => {
      const inten = wormholeAt(lt);
      ctx.save();
      ctx.globalAlpha = 0.35 + inten * 0.65;
      ctx.translate(wormX, parkY);
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 46);
      grad.addColorStop(0, "rgba(2,6,5,0.95)");
      grad.addColorStop(0.6, `rgba(14,34,30,${0.5 + inten * 0.4})`);
      grad.addColorStop(1, "rgba(126,222,190,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(126,222,190,${0.5 + inten * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 13]);
      ctx.lineDashOffset = -t * 0.05;
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(240,212,138,${0.35 + inten * 0.5})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = t * 0.04;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    /* ── choreography ── */

    const shipState = (
      lt: number,
    ): { x: number; y: number; warp: number; on: boolean; alpha: number } => {
      if (lt < PHASES[1]) return { x: 0, y: 0, warp: 0, on: false, alpha: 1 };
      if (lt < 7.6) {
        const k = easeOutCubic((lt - 5) / 2.6);
        return { x: -240 + k * (parkX + 240), y: parkY, warp: 1.1, on: true, alpha: 1 };
      }
      if (lt < 21) {
        return {
          x: parkX + Math.sin(lt * 0.7) * 6,
          y: parkY + Math.sin(lt * 1.1) * 5,
          warp: 0.2,
          on: true,
          alpha: 1,
        };
      }
      if (lt < 23) {
        // dive into the wormhole
        const k = easeInCubic((lt - 21) / 2);
        const target = wormX + 60;
        const alpha = lt > 22.4 ? clamp(1 - (lt - 22.4) / 0.6, 0, 1) : 1;
        return { x: parkX + k * (target - parkX), y: parkY, warp: 1.6, on: true, alpha };
      }
      return { x: 0, y: 0, warp: 0, on: false, alpha: 1 };
    };

    const saucerState = (lt: number): { x: number; y: number; k: number } | null => {
      if (lt < 11 || lt >= 15.8) return null;
      const k = (lt - 11) / 4.8;
      return { x: w + 80 - k * (w + 160), y: h * 0.34 + Math.sin(k * Math.PI * 2.2) * h * 0.05, k };
    };

    const jellyState = (lt: number): { x: number; y: number; alpha: number } => {
      const x = w * (0.06 + (lt / LOOP) * 0.88);
      const y = h * 0.26 + Math.sin(lt * 1.3) * 14;
      const edge = Math.min(1, lt / 2, (LOOP - lt) / 2);
      return { x, y, alpha: clamp(edge, 0, 1) * 0.75 };
    };

    const draw = (t: number, lt: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);

      // ── deep sky (pre-rendered sprites) ──
      if (galaxySprite) {
        const gx = w * 0.13;
        const gy = h * 0.2;
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.translate(gx, gy);
        ctx.rotate(lt * 0.018);
        ctx.drawImage(galaxySprite, -galaxySize / 2, -galaxySize / 2, galaxySize, galaxySize);
        ctx.restore();
      }
      if (holeSprite) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.drawImage(holeSprite, w * 0.1 - holeSize / 2, h * 0.8 - holeSize / 2, holeSize, holeSize);
        ctx.restore();
      }
      if (planetSprite) {
        const px = Math.min(w * 0.82, w - planetR * 1.15);
        const py = Math.max(h * 0.14, planetR * 0.9);
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(planetSprite, px - planetW / 2, py - planetW / 2, planetW, planetW);
        ctx.restore();
        // moon
        const ma = t * 0.00012;
        ctx.beginPath();
        ctx.arc(px + Math.cos(ma) * planetR * 2.5, py - planetR * 1.15 + Math.sin(ma) * planetR * 0.85, Math.max(2.5, planetR * 0.055), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,205,214,0.7)";
        ctx.fill();
      }
      drawStation(w * 0.7, h * 0.74, t);

      // ── warp starfield ──
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

      // ── comets ──
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
      comets = comets.filter((m) => m.life < m.max && m.x > -80 && m.x < w + 80 && m.y < h + 80);
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

      // ── asteroid belt ──
      for (const a of asteroids) {
        a.x += a.vx * dt * 60;
        a.y += a.vy * dt * 60;
        a.rot += a.vr;
        if (a.y > h + 24) {
          a.y = -24;
          a.x = Math.random() * w;
        }
        if (a.x < -24) a.x = w + 24;
        if (a.x > w + 24) a.x = -24;
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.beginPath();
        for (let i = 0; i < a.pts.length; i++) {
          const ang = (i / a.pts.length) * Math.PI * 2;
          const rr = a.pts[i];
          const px2 = Math.cos(ang) * rr;
          const py2 = Math.sin(ang) * rr;
          if (i === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(42,44,51,0.9)";
        ctx.fill();
        ctx.strokeStyle = "rgba(155,163,174,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // ── alien pods ──
      for (const p of pods) {
        p.y += p.vy * dt * 60;
        p.x += Math.sin(t * 0.0006 + p.ph) * 0.2;
        if (p.y < -50) {
          p.y = h + 50;
          p.x = Math.random() * w;
        }
        drawPod(p);
      }

      // ── jellyfish ambassador ──
      const jelly = jellyState(lt);
      drawJelly(jelly.x, jelly.y, t, jelly.alpha);

      // ── wormhole (behind the ship so it dives in) ──
      drawWormhole(t, lt);

      // ── saucer flyby ──
      const saucer = saucerState(lt);
      if (saucer) drawSaucer(saucer.x, saucer.y, saucer.k, t);

      // ── mothership + escorts ──
      const ship = shipState(lt);
      if (ship.on) {
        drawEscorts(ship.x, ship.y, lt, ship.alpha);
        drawMothership(ship.x, ship.y, ship.warp, t, ship.alpha);
      }

      // ── warp-burst flash ──
      if (lt >= 21 && lt < 22.8) {
        const a = Math.sin(clamp((lt - 21) / 1.2, 0, 1) * Math.PI) * 0.14;
        ctx.fillStyle = `rgba(247,231,176,${a})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    /** Static composed frame for prefers-reduced-motion. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      if (galaxySprite) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.translate(w * 0.13, h * 0.2);
        ctx.rotate(0.3);
        ctx.drawImage(galaxySprite, -galaxySize / 2, -galaxySize / 2, galaxySize, galaxySize);
        ctx.restore();
      }
      if (holeSprite) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.drawImage(holeSprite, w * 0.1 - holeSize / 2, h * 0.8 - holeSize / 2, holeSize, holeSize);
        ctx.restore();
      }
      if (planetSprite) {
        const px = Math.min(w * 0.82, w - planetR * 1.15);
        const py = Math.max(h * 0.14, planetR * 0.9);
        ctx.drawImage(planetSprite, px - planetW / 2, py - planetW / 2, planetW, planetW);
      }
      drawStation(w * 0.7, h * 0.74, 0);
      for (const s of stars) {
        const k = 0.92;
        const x = cx + (s.x / s.z) * scale * k;
        const y = cy + (s.y / s.z) * scale * k;
        const depth = 1 - s.z;
        ctx.fillStyle = `rgba(${s.c},${0.2 + depth * 0.75})`;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
      for (const a of asteroids) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.beginPath();
        for (let i = 0; i < a.pts.length; i++) {
          const ang = (i / a.pts.length) * Math.PI * 2;
          if (i === 0) ctx.moveTo(Math.cos(ang) * a.pts[i], Math.sin(ang) * a.pts[i]);
          else ctx.lineTo(Math.cos(ang) * a.pts[i], Math.sin(ang) * a.pts[i]);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(42,44,51,0.9)";
        ctx.fill();
        ctx.strokeStyle = "rgba(155,163,174,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      for (const p of pods) drawPod(p);
      drawJelly(w * 0.4, h * 0.26, 0, 0.6);
      drawWormhole(0, 16);
      drawSaucer(w * 0.74, h * 0.42, 0.4, 0);
      drawEscorts(parkX, parkY, 0.8, 1);
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

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
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
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="TEKA Nexus — deep space transmission"
    >
      {/* deep-space nebula wash (CSS only, GPU cheap) */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 18% 24%, rgba(227,184,85,0.07), transparent 70%), radial-gradient(ellipse 48% 40% at 82% 76%, rgba(126,222,190,0.05), transparent 72%), #050505",
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
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center"
        >
          {/* status badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="glass-gold inline-flex items-center gap-2 rounded-full px-3.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 pulse-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="mono-label text-emerald-300">Live Product</span>
            </span>
            <span className="glass inline-flex items-center rounded-full px-3.5 py-1">
              <span className="mono-label text-muted-foreground">Node NEXUS-01 // Mothership</span>
            </span>
          </div>

          {/* system check line */}
          <p className="mono-label mt-3 text-muted-foreground/70">
            warp drive ✓ · life support ✓ · unlimited curiosity ✓
          </p>

          {/* Persian name */}
          <p
            dir="rtl"
            lang="fa"
            className="mt-6 font-display text-base font-medium tracking-[0.3em] text-gold/70 sm:text-lg"
          >
            {NEXUS.nativeName}
          </p>

          {/* the big one — galactic scale */}
          <h2 className="gold-text mt-1 w-full font-display text-[18.5vw] font-bold leading-[0.92] tracking-tight sm:text-[9rem] lg:text-[11rem]">
            TEKA NEXUS
          </h2>

          <p className="mt-4 font-display text-lg font-medium text-foreground/90 sm:text-2xl">
            {NEXUS.tagline}
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
            {NEXUS.description}
          </p>

          {/* synced cinematic caption in a glass strip */}
          <div className="mt-6 flex min-h-[4rem] items-center justify-center" aria-live="off">
            <AnimatePresence mode="wait">
              <motion.div
                key={shownPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="glass relative rounded-2xl px-5 py-3"
              >
                <span className="absolute left-2 top-2 h-2 w-2 border-l border-t border-gold/50" aria-hidden />
                <span className="absolute right-2 top-2 h-2 w-2 border-r border-t border-gold/50" aria-hidden />
                <span className="absolute bottom-2 left-2 h-2 w-2 border-b border-l border-gold/50" aria-hidden />
                <span className="absolute bottom-2 right-2 h-2 w-2 border-b border-r border-gold/50" aria-hidden />
                <p className="max-w-xl text-balance font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gold-bright/90 sm:text-xs">
                  {PHASE_CAPTIONS[shownPhase]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* features */}
          <ul
            className="mx-auto mt-7 grid w-full max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-3"
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
                  className="glass group/chip relative flex min-h-[48px] items-center gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 transition-colors duration-300 hover:border-gold/40"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-gold/25 bg-gold/10">
                    <Icon className="h-3.5 w-3.5 text-gold" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left text-xs font-medium text-foreground/90 sm:text-[13px]">
                    {feature}
                  </span>
                  <span className="mono-label shrink-0 text-muted-foreground/50">
                    SYS-0{i + 1}
                  </span>
                  {/* holographic sweep */}
                  <span
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover/chip:translate-x-full"
                    aria-hidden="true"
                  />
                </motion.li>
              );
            })}
          </ul>

          {/* CTA — the boarding pass */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex w-full flex-col items-center gap-4"
          >
            <a
              href={NEXUS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-gold group relative block w-full max-w-md overflow-hidden rounded-2xl shadow-[0_0_60px_-16px_rgba(227,184,85,0.55)] transition-all duration-300 hover:border-gold/60 hover:shadow-[0_0_80px_-14px_rgba(227,184,85,0.7)] active:scale-[0.98]"
              aria-label={`Open ${NEXUS.name} — the TEKA academy (new tab)`}
            >
              <div className="flex">
                {/* gold stub */}
                <div className="relative grid w-16 shrink-0 place-items-center border-r border-dashed border-black/40 bg-gradient-to-b from-gold-deep via-gold to-gold-bright">
                  <span className="-rotate-90 whitespace-nowrap font-mono text-[10px] font-bold tracking-[0.35em] text-black">
                    NEXUS-01
                  </span>
                </div>
                {/* main panel */}
                <div className="min-w-0 flex-1 px-5 py-4 text-left">
                  <p className="mono-label flex items-center gap-2 text-muted-foreground">
                    <Ticket className="h-3.5 w-3.5 text-gold" aria-hidden />
                    Boarding Pass · Gate 42
                  </p>
                  <p className="mt-1.5 font-display text-lg font-semibold text-foreground">
                    PASSENGER: <span className="gold-text">YOU</span>
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                      DEST: TEKA-NEXUS.VERCEL.APP
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-gold/15 px-3.5 py-1.5 text-xs font-semibold text-gold-bright transition-transform duration-300 group-hover:scale-105">
                      Board
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>
                </div>
              </div>
              {/* punch-hole perforations */}
              <span className="absolute left-16 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20 bg-[#050505]" aria-hidden="true" />
              {/* holographic sweep */}
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                aria-hidden="true"
              />
            </a>
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground/80">
              free forever · no fees · no catch
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
