"use client";

/**
 * TEKA NEXUS — Deep-Space Transmission (Photoreal Edition)
 *
 * A cinematic, looping "in-space film" for the live TEKA Nexus academy.
 * Rendered like a long-lens documentary shot, not a cartoon:
 *   - pre-rendered volumetric nebula, spiral galaxy and a banded gas giant
 *   - the Nexus-01 orbital megastructure ring (nodes + traveling pulse + pings)
 *   - a rim-lit mothership silhouette with aviation-style nav strobes
 *   - distant unidentified craft — lights only, mystery reads as real
 *   - drift dust, comets, warp streaks, camera drift + film grain + vignette
 *
 * Engineering notes (mobile-Chrome hardened):
 *  - DPR capped (1.5 small screens / 2 desktop); deep-sky layers pre-rendered
 *    once per resize to offscreen canvases (nebula at half-res on purpose)
 *  - single rAF loop; fully paused off-screen (IntersectionObserver) or hidden
 *  - prefers-reduced-motion renders one static composed frame, zero animation
 *
 * Honesty: every factual claim mirrors src/lib/teka/config.ts — Nexus is a real
 * live product. The ships and lights are the marketing department.
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
  Sparkles,
  Ticket,
  Users2,
} from "lucide-react";
import { NEXUS } from "@/lib/teka/config";

/* ── story loop ──────────────────────────────────────────────────────────── */

const LOOP = 26; // seconds
const PHASES = [0, 5, 11, 16, 21] as const;

const PHASE_CAPTIONS = [
  "SOMEWHERE BEYOND THE STARS — A SIGNAL IS SEARCHING FOR MINDS LIKE YOURS",
  "STATION NEXUS-01 IN ORBIT — THE FREE ACADEMY IS LIVE",
  "UNKNOWN LIFEFORMS DETECTED — THEY CROSSED THE VOID TO LEARN",
  "EVERY CIVILIZATION BEGINS BY LEARNING — YOURS BEGINS HERE",
  "GATES OPEN — WARP DRIVE CHARGED",
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
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Deterministic RNG — pre-rendered sprites stay stable across rebuilds. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Warp intensity over the loop — drives starfield streaks + camera push. */
function boostAt(lt: number): number {
  if (lt < 5) return 0.05;
  if (lt < 7) {
    const k = (lt - 5) / 2;
    return 0.05 + 0.09 * (k * k * (3 - 2 * k));
  }
  if (lt < 16) return 0.12;
  if (lt < 21) return 0.09;
  if (lt < 23.4) {
    const k = clamp((lt - 21) / 2.4, 0, 1);
    return 0.1 + 1.55 * Math.sin(k * Math.PI);
  }
  return 0.05;
}

function phaseIndexAt(lt: number): number {
  let idx = 0;
  for (let i = 0; i < PHASES.length; i++) if (lt >= PHASES[i]) idx = i;
  return idx;
}

/* ── the cosmos engine ───────────────────────────────────────────────────── */

type Star = { x: number; y: number; z: number; pz: number; c: string; tw: number; ph: number };
type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; ph: number };
type Comet = { x: number; y: number; vx: number; vy: number; life: number; max: number };

/** Realistic stellar color temperatures (blue-white → white → warm → orange). */
const STAR_TONES = ["214,222,238", "244,240,230", "240,214,166", "216,170,148"];

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
    const sDpr = Math.min(dpr, 1.5); // sprites render slightly soft on purpose
    const N_STARS = small ? 150 : 260;
    const N_MOTES = small ? 14 : 26;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let scale = 0;
    let shipLen = 0;
    let seededW = 0;
    let seededH = 0;

    let stars: Star[] = [];
    let motes: Mote[] = [];
    let comets: Comet[] = [];
    let nextCometAt = 0;

    // pre-rendered deep-sky layers
    let nebula: HTMLCanvasElement | null = null;
    let galaxy: HTMLCanvasElement | null = null;
    let galaxySize = 0;
    let planet: HTMLCanvasElement | null = null;
    let planetR = 0;
    let planetBox = 0;

    const makeSprite = (cw: number, ch: number) => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.ceil(cw * sDpr));
      c.height = Math.max(1, Math.ceil(ch * sDpr));
      const g = c.getContext("2d");
      if (!g) return null;
      g.setTransform(sDpr, 0, 0, sDpr, 0, 0);
      return { c, g };
    };

    /* volumetric nebula — half-res, it is meant to be soft */
    const buildNebula = () => {
      const nw = Math.max(320, Math.round(w / 2));
      const nh = Math.max(240, Math.round(h / 2));
      const sp = makeSprite(nw, nh);
      if (!sp) return;
      const { c, g } = sp;
      const rng = mulberry32(9107);
      g.globalCompositeOperation = "lighter";
      const blobs = small ? 9 : 15;
      for (let i = 0; i < blobs; i++) {
        const bx = rng() * nw;
        const by = rng() * nh;
        const br = (0.14 + rng() * 0.34) * Math.min(nw, nh);
        const tone = rng();
        const col = tone < 0.42 ? "24,54,50" : tone < 0.78 ? "64,46,20" : "30,36,52";
        const grad = g.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, `rgba(${col},${0.16 + rng() * 0.1})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = grad;
        g.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      // dark dust lanes for depth
      g.globalCompositeOperation = "source-over";
      for (let i = 0; i < 7; i++) {
        const bx = rng() * nw;
        const by = rng() * nh;
        const br = (0.1 + rng() * 0.26) * Math.min(nw, nh);
        const grad = g.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, "rgba(3,4,6,0.42)");
        grad.addColorStop(1, "rgba(3,4,6,0)");
        g.fillStyle = grad;
        g.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      nebula = c;
    };

    /* spiral galaxy — thousands of star points on two arms + warm core */
    const buildGalaxy = () => {
      const S = Math.round(clamp(scale * 1.5, 260, 560));
      const sp = makeSprite(S, S);
      if (!sp) return;
      const { c, g } = sp;
      const rng = mulberry32(4423);
      const cc = S / 2;
      const tilt = 0.46;
      const coreR = S * 0.05;
      const ARMS = 2;
      const perArm = Math.round((small ? 300 : 460) / ARMS);
      // faint halo
      let grad = g.createRadialGradient(cc, cc, 0, cc, cc, S * 0.5);
      grad.addColorStop(0, "rgba(210,200,175,0.1)");
      grad.addColorStop(0.55, "rgba(190,180,160,0.035)");
      grad.addColorStop(1, "rgba(190,180,160,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
      // star streams
      for (let arm = 0; arm < ARMS; arm++) {
        for (let i = 0; i < perArm; i++) {
          const f = i / perArm;
          const r = coreR + Math.pow(f, 0.82) * S * 0.44;
          const ang = arm * Math.PI + f * 4.9 + (rng() - 0.5) * 0.22;
          const spread = (2 + f * 13) * (rng() - 0.5);
          const gx = cc + Math.cos(ang) * r - Math.sin(ang) * spread;
          const gy = cc + (Math.sin(ang) * r + Math.cos(ang) * spread) * tilt;
          const gr = 0.35 + rng() * 0.95;
          const fade = (1 - f * 0.72) * (0.3 + rng() * 0.55);
          const roll = rng();
          const col = roll < 0.76 ? "212,220,236" : roll < 0.9 ? "238,216,168" : "150,200,190";
          g.fillStyle = `rgba(${col},${fade})`;
          g.beginPath();
          g.arc(gx, gy, gr, 0, Math.PI * 2);
          g.fill();
        }
      }
      // core bulge
      grad = g.createRadialGradient(cc, cc, 0, cc, cc, S * 0.16);
      grad.addColorStop(0, "rgba(255,246,220,0.95)");
      grad.addColorStop(0.22, "rgba(244,220,160,0.4)");
      grad.addColorStop(0.6, "rgba(220,190,130,0.12)");
      grad.addColorStop(1, "rgba(220,190,130,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cc, cc, S * 0.16, 0, Math.PI * 2);
      g.fill();
      galaxy = c;
      galaxySize = S;
    };

    /* gas giant — banded, turbulent, limb-darkened, atmosphere rim on lit side */
    const buildPlanet = () => {
      const R = Math.round(clamp(scale * 0.34, 58, 168));
      const S = Math.ceil(R * 2.4);
      const sp = makeSprite(S, S);
      if (!sp) return;
      const { c, g } = sp;
      const cc = S / 2;
      const rng = mulberry32(8123);

      const bands: Array<[string, number, number]> = [
        ["#6e6350", 0, 0.13],
        ["#847458", 0.13, 0.24],
        ["#5a5142", 0.24, 0.36],
        ["#93825f", 0.36, 0.5],
        ["#6b5f4a", 0.5, 0.62],
        ["#8a7a5c", 0.62, 0.74],
        ["#4c4536", 0.74, 0.85],
        ["#37322a", 0.85, 1],
      ];
      g.save();
      g.beginPath();
      g.arc(cc, cc, R, 0, Math.PI * 2);
      g.clip();
      for (const [col, a, b] of bands) {
        g.fillStyle = col;
        g.fillRect(cc - R, cc - R + 2 * R * a, 2 * R, 2 * R * (b - a) + 1);
      }
      // turbulent cloud streaks
      const streaks = small ? 42 : 70;
      for (let i = 0; i < streaks; i++) {
        const sy = cc - R + rng() * 2 * R;
        const sx = cc - R + rng() * 2 * R;
        const sw = R * (0.3 + rng() * 1.1);
        const sh = R * (0.015 + rng() * 0.05);
        const roll = rng();
        g.fillStyle =
          roll < 0.5
            ? "rgba(196,178,136,0.1)"
            : roll < 0.8
              ? "rgba(30,27,20,0.14)"
              : "rgba(226,214,180,0.07)";
        g.beginPath();
        g.ellipse(sx, sy, sw, sh, 0, 0, Math.PI * 2);
        g.fill();
      }
      // limb darkening
      let grad = g.createRadialGradient(cc, cc, R * 0.52, cc, cc, R);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.82, "rgba(0,0,0,0.34)");
      grad.addColorStop(1, "rgba(0,0,0,0.86)");
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
      // day-side light (sun upper-left)
      grad = g.createRadialGradient(
        cc - R * 0.55,
        cc - R * 0.55,
        R * 0.1,
        cc - R * 0.4,
        cc - R * 0.4,
        R * 1.5,
      );
      grad.addColorStop(0, "rgba(255,240,208,0.3)");
      grad.addColorStop(0.45, "rgba(255,238,200,0.08)");
      grad.addColorStop(1, "rgba(255,238,200,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
      g.restore();

      // thin atmosphere rim on the lit limb
      g.save();
      g.strokeStyle = "rgba(244,226,186,0.5)";
      g.lineWidth = 1.3;
      g.shadowColor = "rgba(240,220,170,0.8)";
      g.shadowBlur = 9;
      g.beginPath();
      g.arc(cc, cc, R + 0.4, Math.PI * 0.86, Math.PI * 1.72);
      g.stroke();
      g.restore();

      planet = c;
      planetR = R;
      planetBox = S;
    };

    const respawnStar = (s: Star, init = false) => {
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 3; tries++) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        if (Math.max(Math.abs(x), Math.abs(y)) > 0.05) break;
      }
      s.x = x;
      s.y = y;
      s.z = init ? Math.random() * 0.9 + 0.1 : 1;
      s.pz = s.z;
      const g = Math.random();
      s.c =
        g < 0.55 ? STAR_TONES[0] : g < 0.8 ? STAR_TONES[1] : g < 0.95 ? STAR_TONES[2] : STAR_TONES[3];
      s.tw = 0.6 + Math.random() * 1.8;
      s.ph = Math.random() * Math.PI * 2;
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
      shipLen = clamp(w * 0.16, 120, 230);

      stars = [];
      for (let i = 0; i < N_STARS; i++) {
        const s: Star = { x: 0, y: 0, z: 0, pz: 0, c: "", tw: 0, ph: 0 };
        respawnStar(s, true);
        stars.push(s);
      }
      motes = Array.from({ length: N_MOTES }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 5,
        a: 0.05 + Math.random() * 0.09,
        ph: Math.random() * Math.PI * 2,
      }));
      comets = [];

      buildNebula();
      buildGalaxy();
      buildPlanet();

      seededW = w;
      seededH = h;
    };

    /* ── dynamic drawing ── */

    /** Nexus-01 orbital megastructure — thin ring, nodes, heartbeat pulse, pings. */
    const drawStationRing = (px: number, py: number, R: number, lt: number) => {
      const rx = R * 1.8;
      const ry = R * 0.52;
      const tilt = -0.22;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(tilt);
      // the structure itself
      ctx.strokeStyle = "rgba(196,206,222,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      // nodes
      const NODES = 12;
      for (let i = 0; i < NODES; i++) {
        const a = (i / NODES) * Math.PI * 2;
        const nx = Math.cos(a) * rx;
        const ny = Math.sin(a) * ry;
        const major = i % 3 === 0;
        ctx.beginPath();
        ctx.arc(nx, ny, major ? 2 : 1.1, 0, Math.PI * 2);
        ctx.fillStyle = major ? "rgba(240,220,170,0.85)" : "rgba(196,206,222,0.55)";
        ctx.fill();
      }
      // traveling pulse — the academy's heartbeat
      const pa = lt * 0.85;
      ctx.fillStyle = "rgba(255,238,190,0.95)";
      ctx.shadowColor = "rgba(240,212,138,0.9)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(Math.cos(pa) * rx, Math.sin(pa) * ry, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // signal ping — expanding ellipse every 3.4s
      const pk = (lt % 3.4) / 3.4;
      ctx.save();
      ctx.translate(px, py);
      ctx.strokeStyle = `rgba(240,212,138,${0.3 * (1 - pk)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * (1.15 + pk * 1.6), R * (1.15 + pk * 1.6) * 0.62, tilt, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    /** Mothership silhouette — rim-lit hull, window strip, plasma engines, strobes. */
    const drawMothership = (x: number, y: number, t: number, alpha: number) => {
      if (alpha <= 0.01) return;
      const L = shipLen;
      const H = L * 0.17;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(-0.02 + Math.sin(t * 0.0006) * 0.012);

      // hull
      const hull = ctx.createLinearGradient(0, -H * 0.7, 0, H * 0.5);
      hull.addColorStop(0, "#232833");
      hull.addColorStop(0.45, "#12151c");
      hull.addColorStop(1, "#05060a");
      ctx.beginPath();
      ctx.moveTo(-L * 0.5, H * 0.04);
      ctx.bezierCurveTo(-L * 0.36, -H * 0.6, L * 0.05, -H * 0.66, L * 0.3, -H * 0.22);
      ctx.quadraticCurveTo(L * 0.47, -H * 0.05, L * 0.5, 0);
      ctx.quadraticCurveTo(L * 0.34, H * 0.42, -L * 0.16, H * 0.44);
      ctx.quadraticCurveTo(-L * 0.45, H * 0.32, -L * 0.5, H * 0.04);
      ctx.closePath();
      ctx.fillStyle = hull;
      ctx.fill();

      // rim light from the planet side
      const rim = ctx.createLinearGradient(-L * 0.5, 0, L * 0.5, 0);
      rim.addColorStop(0, "rgba(244,232,200,0.04)");
      rim.addColorStop(0.75, "rgba(244,232,200,0.4)");
      rim.addColorStop(1, "rgba(255,246,220,0.8)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.1;
      ctx.shadowColor = "rgba(240,220,170,0.55)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-L * 0.5, H * 0.04);
      ctx.bezierCurveTo(-L * 0.36, -H * 0.6, L * 0.05, -H * 0.66, L * 0.3, -H * 0.22);
      ctx.quadraticCurveTo(L * 0.47, -H * 0.05, L * 0.5, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // dorsal fin
      ctx.beginPath();
      ctx.moveTo(-L * 0.16, -H * 0.5);
      ctx.lineTo(-L * 0.06, -H * 0.95);
      ctx.lineTo(L * 0.03, -H * 0.48);
      ctx.closePath();
      ctx.fillStyle = "#161a22";
      ctx.fill();

      // soft window strip
      for (let i = 0; i < 12; i++) {
        const wx = -L * 0.4 + i * (L * 0.066);
        ctx.fillStyle = `rgba(250,232,180,${0.16 + 0.2 * Math.sin(t * 0.002 + i)})`;
        ctx.fillRect(wx, H * 0.02, 1.4, 1.2);
      }

      // engines — two soft plasma glows
      ctx.globalCompositeOperation = "lighter";
      for (const ex of [-L * 0.46, -L * 0.4]) {
        const er = L * 0.055 * (0.85 + 0.15 * Math.sin(t * 0.02 + ex));
        const eg = ctx.createRadialGradient(ex, 0, 0, ex, 0, er);
        eg.addColorStop(0, "rgba(255,244,214,0.75)");
        eg.addColorStop(0.4, "rgba(240,212,138,0.32)");
        eg.addColorStop(1, "rgba(240,212,138,0)");
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(ex, 0, er, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // aviation strobes — double-blink, red port / green starboard
      const blink = t % 1300 < 90 || (t % 1300 > 180 && t % 1300 < 260);
      if (blink) {
        ctx.fillStyle = "rgba(255,80,70,0.9)";
        ctx.beginPath();
        ctx.arc(-L * 0.1, -H * 0.62, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(90,230,140,0.9)";
        ctx.beginPath();
        ctx.arc(L * 0.26, -H * 0.28, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    /** Distant unidentified craft — dark disk, warm light row, one faint scan beam. */
    const drawVisitor = (x: number, y: number, s: number, t: number, k: number, dir: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(dir, 1);
      // hull — barely there
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.34, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10,12,16,0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(170,182,200,0.22)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // light row — the only thing that reads at distance
      for (let i = -2; i <= 2; i++) {
        const lx = i * s * 0.32;
        const tw = 0.55 + 0.45 * Math.sin(t * 0.004 + i * 1.7);
        ctx.beginPath();
        ctx.arc(lx, s * 0.1, Math.max(0.8, s * 0.055), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,226,170,${0.5 + 0.4 * tw})`;
        ctx.fill();
      }
      // one faint scan beam near mid-pass
      if (k > 0.4 && k < 0.62) {
        const bk = Math.sin(((k - 0.4) / 0.22) * Math.PI);
        const beam = ctx.createLinearGradient(0, s * 0.3, 0, h * 0.3);
        beam.addColorStop(0, `rgba(240,226,190,${0.16 * bk})`);
        beam.addColorStop(1, "rgba(240,226,190,0)");
        ctx.beginPath();
        ctx.moveTo(-s * 0.2, s * 0.3);
        ctx.lineTo(s * 0.2, s * 0.3);
        ctx.lineTo(s * 1.1, h * 0.3);
        ctx.lineTo(-s * 1.1, h * 0.3);
        ctx.closePath();
        ctx.fillStyle = beam;
        ctx.fill();
      }
      ctx.restore();
    };

    const visitorState = (lt: number, i: number): { x: number; y: number; k: number } | null => {
      if (lt < 11.2 || lt >= 15.9) return null;
      const k = (lt - 11.2) / 4.7;
      const yBase = i === 0 ? 0.3 : 0.2;
      return {
        x: (i === 0 ? -0.05 + k * 0.85 : 1.03 - k * 0.78) * w,
        y: h * yBase + Math.sin(k * Math.PI * 2.4 + i * 2) * h * 0.025,
        k,
      };
    };

    const shipState = (lt: number): { x: number; y: number; alpha: number } | null => {
      if (lt < 15.9 || lt >= 21.2) return null;
      const k = (lt - 15.9) / 5.3;
      return {
        x: (-0.18 + k * 1.38) * w,
        y: h * 0.14 + Math.sin(lt * 0.9) * 3.5,
        alpha: Math.min(1, k * 6, (1 - k) * 6),
      };
    };

    const draw = (t: number, lt: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);

      const warp = boostAt(lt);
      // camera — slow documentary drift + gentle push during warp
      const camX = Math.sin(lt * 0.1) * 7 + Math.sin(lt * 0.037) * 9;
      const camY = Math.cos(lt * 0.083) * 5;
      const zoom = 1 + 0.018 * Math.sin(lt * 0.05) + clamp(warp - 0.3, 0, 1.3) * 0.055;
      const shake = warp > 0.6 ? (warp - 0.6) * 3.4 : 0;
      ctx.save();
      ctx.translate(cx + (Math.random() - 0.5) * shake, cy + (Math.random() - 0.5) * shake);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);

      // nebula
      if (nebula) {
        ctx.globalAlpha = 0.92;
        ctx.drawImage(nebula, camX * 0.16, camY * 0.16, w, h);
        ctx.globalAlpha = 1;
      }

      // spiral galaxy — slow majestic rotation
      if (galaxy) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.translate(w * 0.16 + camX * 0.26, h * 0.24 + camY * 0.26);
        ctx.rotate(0.42 + lt * 0.012);
        ctx.drawImage(galaxy, -galaxySize / 2, -galaxySize / 2, galaxySize, galaxySize);
        ctx.restore();
      }

      // planet system
      const px = Math.min(w - planetR * 1.02, w * 0.8) + camX * 0.5;
      const py = Math.max(h * 0.2, planetR + 88) + camY * 0.5;
      if (planet) {
        const reveal = lt < 5 ? 0.94 : lt < 11 ? 0.94 + 0.06 * easeOutCubic((lt - 5) / 6) : 1;
        ctx.save();
        ctx.globalAlpha = 0.98;
        ctx.translate(px, py);
        ctx.scale(reveal, reveal);
        ctx.drawImage(planet, -planetBox / 2, -planetBox / 2, planetBox, planetBox);
        ctx.restore();
        // moon
        const ma = lt * 0.55 + 1.2;
        ctx.beginPath();
        ctx.arc(
          px + Math.cos(ma) * planetR * 1.7,
          py + Math.sin(ma) * planetR * 0.6,
          Math.max(1.6, planetR * 0.045),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(214,220,232,0.75)";
        ctx.fill();

        drawStationRing(px, py, planetR * reveal, lt);
      }

      // warp starfield — radial streaks, depth-parallaxed with the camera
      const speed = (0.035 + warp * 0.42) * dt;
      ctx.lineCap = "round";
      const twk = t * 0.001;
      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0.03) {
          respawnStar(s);
          continue;
        }
        const k = 0.92;
        const depth = 1 - s.z;
        const ox = camX * (0.18 + depth * 0.85);
        const oy = camY * (0.18 + depth * 0.85);
        const x1 = cx + ox + (s.x / s.z) * scale * k;
        const y1 = cy + oy + (s.y / s.z) * scale * k;
        const x0 = cx + ox + (s.x / s.pz) * scale * k;
        const y0 = cy + oy + (s.y / s.pz) * scale * k;
        const tw = 0.72 + 0.28 * Math.sin(twk * s.tw + s.ph);
        ctx.strokeStyle = `rgba(${s.c},${(0.18 + depth * 0.7) * tw})`;
        ctx.lineWidth = depth * 1.5 + 0.25;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      // drift dust — near-field depth cue
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;
        if (m.y < -10) m.y = h + 10;
        if (m.y > h + 10) m.y = -10;
        ctx.beginPath();
        ctx.arc(m.x + camX * 1.6, m.y + camY * 1.6, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(222,228,240,${m.a * (0.7 + 0.3 * Math.sin(twk * 1.4 + m.ph))})`;
        ctx.fill();
      }

      // comets — soft head glow, gradient tail (only in the calm phases)
      for (const m of comets) {
        m.life += dt;
        m.x += m.vx * dt * 60;
        m.y += m.vy * dt * 60;
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const tx = m.x - m.vx * 10;
        const ty = m.y - m.vy * 10;
        const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
        grad.addColorStop(0, "rgba(244,238,220,0)");
        grad.addColorStop(1, `rgba(244,238,220,${0.55 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 5);
        hg.addColorStop(0, `rgba(255,250,235,${0.5 * fade})`);
        hg.addColorStop(1, "rgba(255,250,235,0)");
        ctx.fillStyle = hg;
        ctx.fillRect(m.x - 5, m.y - 5, 10, 10);
      }
      comets = comets.filter((m) => m.life < m.max && m.x > -80 && m.x < w + 80 && m.y < h + 80);
      if (t > nextCometAt && lt < 13) {
        const fromLeft = Math.random() > 0.5;
        const sp = 6 + Math.random() * 4;
        const ang = (18 + Math.random() * 18) * (Math.PI / 180);
        comets.push({
          x: fromLeft ? -40 : w + 40,
          y: Math.random() * h * 0.3,
          vx: (fromLeft ? 1 : -1) * Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          max: 60 + Math.random() * 30,
        });
        nextCometAt = t + 6000 + Math.random() * 8000;
      }

      // distant visitors — lights only, mystery reads as real
      for (let i = 0; i < 2; i++) {
        const v = visitorState(lt, i);
        if (v) drawVisitor(v.x, v.y, small ? 9 : 13, t, v.k, i === 0 ? 1 : -1);
      }

      // mothership passage
      const ship = shipState(lt);
      if (ship) drawMothership(ship.x, ship.y, t, ship.alpha);

      ctx.restore();

      // subtle gold wash when warp ignites
      if (lt >= 21 && lt < 23) {
        const a = Math.sin(clamp((lt - 21) / 2, 0, 1) * Math.PI) * 0.1;
        ctx.fillStyle = `rgba(244,234,200,${a})`;
        ctx.fillRect(0, 0, w, h);
      }

      // loop-boundary fades — cut/crossfade feel
      let fade = 0;
      if (lt < 1) fade = 1 - lt;
      else if (lt > 25) fade = lt - 25;
      if (fade > 0) {
        ctx.fillStyle = `rgba(3,3,4,${clamp(fade, 0, 1)})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    /** Static composed frame for prefers-reduced-motion. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      if (nebula) ctx.drawImage(nebula, 0, 0, w, h);
      if (galaxy) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.translate(w * 0.16, h * 0.24);
        ctx.rotate(0.45);
        ctx.drawImage(galaxy, -galaxySize / 2, -galaxySize / 2, galaxySize, galaxySize);
        ctx.restore();
      }
      for (const s of stars) {
        const depth = 1 - s.z;
        const x = cx + (s.x / s.z) * scale * 0.92;
        const y = cy + (s.y / s.z) * scale * 0.92;
        ctx.fillStyle = `rgba(${s.c},${0.18 + depth * 0.7})`;
        ctx.fillRect(x, y, 1.3, 1.3);
      }
      const px = Math.min(w - planetR * 1.02, w * 0.8);
      const py = Math.max(h * 0.2, planetR + 88);
      if (planet) {
        ctx.drawImage(planet, px - planetBox / 2, py - planetBox / 2, planetBox, planetBox);
        drawStationRing(px, py, planetR, 0.35);
      }
      for (const m of motes) {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(222,228,240,${m.a})`;
        ctx.fill();
      }
      drawMothership(w * 0.34, h * 0.15, 0, 0.9);
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
      {/* deep-space base wash (CSS only, GPU cheap) */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 18% 24%, rgba(227,184,85,0.06), transparent 70%), radial-gradient(ellipse 48% 40% at 82% 76%, rgba(126,222,190,0.04), transparent 72%), #050505",
        }}
      />

      {/* the cosmos */}
      <NexusCosmos onPhase={handlePhase} />

      {/* center scrim — keeps copy readable over the starfield */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 64% 52% at 50% 52%, rgba(5,5,5,0.6), transparent 72%)",
        }}
      />

      {/* film grade — vignette + grain */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 74% 64% at 50% 46%, transparent 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <div className="nexus-grain" aria-hidden="true" />

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
              <span className="mono-label text-muted-foreground">Station NEXUS-01 // Orbital Ring</span>
            </span>
          </div>

          {/* honest status console */}
          <p className="mono-label mt-3 text-muted-foreground/70">
            status: live · access: free · level: beginner → pro
          </p>

          {/* Persian name */}
          <p
            dir="rtl"
            lang="fa"
            className="mt-6 font-display text-base font-medium tracking-[0.3em] text-gold/70 sm:text-lg"
          >
            {NEXUS.nativeName}
          </p>

          {/* the big one — poster scale */}
          <h2 className="gold-text mt-1 w-full font-display text-[19.5vw] font-bold leading-[0.88] tracking-[-0.02em] [filter:drop-shadow(0_0_28px_rgba(227,184,85,0.16))] sm:text-[10rem] lg:text-[11.5rem]">
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
