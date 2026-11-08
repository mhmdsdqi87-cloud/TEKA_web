"use client";

/**
 * TEKA IGNITION — ASCENSION
 *
 * An 8-second cinematic space boot sequence that plays on EVERY visit.
 *
 * Acts (master timeline):
 *   0.0s  VOID      — deep black, stars fade in, nebula breathes, HUD arms
 *   1.1s  SIGNAL    — a golden spark ignites at the center, radar pings, uplink log
 *   3.0s  EMBLEM    — the TEKA mark materializes out of the light with a bloom
 *                     flash, shockwave and counter-rotating orbital glyph rings
 *   4.0s  CHARGE    — warp drive charges 22 → 100%, boot log checks off
 *   6.6s  ONLINE    — 100% · SYSTEMS ONLINE flash, full bloom
 *   7.3s  WARP      — stars stretch into streaks, white-gold flash
 *   8.0s  EXIT      — iris wipe reveals the platform
 *
 * - Plays once per page load (no session skip — this is the show).
 * - Discreet SKIP control (fast-forwards into the warp jump).
 * - Honors prefers-reduced-motion: static branded splash, ~0.9s.
 * - Decorative layers are aria-hidden; content is announced via role="status".
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/* Master timeline (seconds)                                           */
/* ------------------------------------------------------------------ */

const TL = {
  SIGNAL: 1.1,
  PING2: 2.3,
  EMBLEM: 3.0,
  CHARGE: 4.0,
  ONLINE: 6.6,
  WARP: 7.3,
  EXIT: 8.0,
} as const;

const EXIT_MS = 950;
const PING_TIMES = [TL.SIGNAL, TL.PING2, TL.EMBLEM, 4.6, 5.8, TL.ONLINE] as const;

const BOOT_LINES = [
  { t: 0.9, label: "SIGNAL ACQUIRED — ESTABLISHING UPLINK" },
  { t: 1.7, label: "BOOTING TEKA CORE KERNEL v7.2" },
  { t: 2.4, label: "FORGING EMBLEM MATRIX" },
  { t: 3.2, label: "CALIBRATING ORBITAL SYSTEMS" },
  { t: 4.1, label: "SYNCING ECOSYSTEM MODULES" },
  { t: 4.9, label: "CHARGING WARP DRIVE" },
  { t: 6.0, label: "ALL SYSTEMS NOMINAL" },
  { t: 6.6, label: "IGNITION — WELCOME ABOARD" },
] as const;

type Phase = "boot" | "exit" | "done";
type Stage = "void" | "signal" | "emblem";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Piecewise mission-progress curve: creep → charge → 100. */
function progressAt(t: number): number {
  if (t <= TL.SIGNAL) return 0;
  if (t < TL.CHARGE) {
    const k = clamp01((t - TL.SIGNAL) / (TL.CHARGE - TL.SIGNAL));
    return Math.round(22 * (1 - (1 - k) * (1 - k)));
  }
  if (t < TL.ONLINE) {
    const k = clamp01((t - TL.CHARGE) / (TL.ONLINE - TL.CHARGE));
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    return Math.round(22 + 78 * e);
  }
  return 100;
}

/* ------------------------------------------------------------------ */
/* Cosmos field — deep-space starfield with warp streaks + meteors     */
/* ------------------------------------------------------------------ */

type Star = {
  angle: number;
  radius: number;
  drift: number;
  size: number;
  gold: boolean;
  tw: number;
};

type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number };

function CosmosField({
  boostRef,
  reduced,
}: {
  boostRef: React.MutableRefObject<number>;
  reduced: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let raf = 0;
    let running = true;
    let boost = 0.6;
    let lastMeteor = 0;
    let nextMeteorIn = 1500;
    let last = performance.now();
    let seededW = 0;
    let seededH = 0;

    const seed = (w: number, h: number) => {
      const count = Math.min(Math.round((w * h) / 6200), 240);
      seededW = w;
      seededH = h;
      stars = Array.from({ length: count }, (_, i) => ({
        angle: Math.random() * Math.PI * 2,
        radius: (0.05 + Math.random() * 0.95) * Math.max(w, h) * 0.8,
        drift: (0.0001 + Math.random() * 0.0004) * (i % 3 === 0 ? -1 : 1),
        size: Math.random() * 1.5 + 0.35,
        gold: Math.random() > 0.86,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(w, h);
    };

    const drawStatic = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const x = w / 2 + Math.cos(s.angle) * s.radius;
        const y = h / 2 + Math.sin(s.angle) * s.radius;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? "rgba(231,197,120,0.8)" : "rgba(216,222,234,0.55)";
        ctx.fill();
      }
    };

    let startT = performance.now();

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - last);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.max(w, h) * 0.95;

      boost += (boostRef.current - boost) * 0.055;

      // motion-trail fade → every drawn frame leaves a fading wake
      ctx.fillStyle = "rgba(4,4,6,0.4)";
      ctx.fillRect(0, 0, w, h);

      const warping = boost > 2;
      for (const s of stars) {
        const px = cx + Math.cos(s.angle) * s.radius;
        const py = cy + Math.sin(s.angle) * s.radius;
        s.angle += s.drift * dt * (1 + boost * 0.2);
        s.radius += boost * dt * (0.02 + (s.radius / maxR) * 0.18);
        s.tw += dt * 0.004;
        if (s.radius > maxR) {
          s.radius = 6 + Math.random() * 44;
          s.angle = Math.random() * Math.PI * 2;
        }
        const x = cx + Math.cos(s.angle) * s.radius;
        const y = cy + Math.sin(s.angle) * s.radius;
        const twinkle = 0.55 + 0.45 * Math.sin(s.tw);
        const alpha = Math.min(0.95, (0.16 + (s.radius / maxR) * 0.7) * twinkle);
        ctx.strokeStyle = s.gold
          ? `rgba(238,205,124,${alpha})`
          : `rgba(214,222,236,${alpha * 0.85})`;
        ctx.lineWidth = s.size * (warping ? 2 : 1);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // meteors drift across now and then (never during warp)
      if (!reduced && !warping && now - lastMeteor > nextMeteorIn) {
        lastMeteor = now;
        nextMeteorIn = 1700 + Math.random() * 2500;
        const sx = w * (0.15 + Math.random() * 0.7);
        const sy = h * Math.random() * 0.35;
        const dir = Math.random() > 0.5 ? 1 : -1;
        const spd = 0.5 + Math.random() * 0.45;
        meteors.push({
          x: sx,
          y: sy,
          vx: dir * spd * 0.4,
          vy: spd * 0.28,
          life: 0,
          max: 900,
        });
      }
      meteors = meteors.filter((m) => m.life < m.max);
      for (const m of meteors) {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = m.life / m.max;
        const a = Math.sin(Math.PI * k) * 0.75;
        const tail = 90;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
        grad.addColorStop(0, `rgba(240,214,150,${a})`);
        grad.addColorStop(1, "rgba(240,214,150,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
        ctx.stroke();
      }

      // periodic star re-twinkle seeds (keeps field alive on long sessions)
      if (now - startT > 30000) startT = now;
      raf = requestAnimationFrame(step);
    };

    resize();
    if (reduced) {
      drawStatic();
    } else {
      ctx.fillStyle = "#040406";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      raf = requestAnimationFrame(step);
    }

    const onResize = () => {
      // Mobile Chrome fires resize when the URL bar collapses/expands during
      // scroll — re-seeding on those events makes stars jump. Only re-seed on
      // a real width change (rotation, split screen, real keyboard).
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (Math.abs(w - seededW) < 2 && Math.abs(h - seededH) < 8) return;
      resize();
      if (reduced) drawStatic();
    };
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (reduced) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [boostRef, reduced]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Shockwave ping ring                                                 */
/* ------------------------------------------------------------------ */

function PingRing({
  id,
  big,
  onDone,
}: {
  id: number;
  big: boolean;
  onDone: (id: number) => void;
}) {
  const size = big ? 620 : 440;
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        x: "-50%",
        y: "-50%",
        border: `1px solid rgba(240,212,138,${big ? 0.55 : 0.4})`,
        boxShadow: `0 0 46px rgba(227,184,85,${big ? 0.28 : 0.16}), inset 0 0 26px rgba(227,184,85,0.1)`,
      }}
      initial={{ scale: 0.12, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{ duration: big ? 1.9 : 1.6, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => onDone(id)}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Glyph tick ring (static geometry, CSS-rotated wrapper)              */
/* ------------------------------------------------------------------ */

const TICKS = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  const major = i % 4 === 0;
  const r1 = major ? 148 : 151;
  const r2 = 158;
  return {
    x1: 180 + Math.cos(a) * r1,
    y1: 180 + Math.sin(a) * r1,
    x2: 180 + Math.cos(a) * r2,
    y2: 180 + Math.sin(a) * r2,
    major,
  };
});

/* ------------------------------------------------------------------ */
/* Preloader                                                           */
/* ------------------------------------------------------------------ */

export function Preloader() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [stage, setStage] = useState<Stage>("void");
  const [progress, setProgress] = useState(0);
  const [bootIdx, setBootIdx] = useState(-1);
  const [pings, setPings] = useState<{ id: number; big: boolean }[]>([]);
  const [online, setOnline] = useState(false);
  const [warpFlash, setWarpFlash] = useState(false);

  const boostRef = useRef(0.6);
  const skipRef = useRef(false);
  const skipStartRef = useRef(-1);
  const stageRef = useRef(0);
  const onlineRef = useRef(false);
  const warpRef = useRef(false);
  const exitRef = useRef(false);
  const pingIdxRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  /** Fast-path used by both the timeline (at TL.WARP) and the skip button. */
  const beginExit = () => {
    if (exitRef.current) return;
    exitRef.current = true;
    document.body.style.overflow = "";
    setPhase("exit");
    const t = window.setTimeout(() => setPhase("done"), EXIT_MS);
    timersRef.current.push(t);
  };

  const beginWarp = () => {
    if (warpRef.current) return;
    warpRef.current = true;
    boostRef.current = 16;
    setWarpFlash(true);
    setOnline(true);
    setProgress(100);
    setBootIdx(BOOT_LINES.length - 1);
    const t = window.setTimeout(beginExit, (TL.EXIT - TL.WARP) * 1000);
    timersRef.current.push(t);
  };

  /* Master timeline — one rAF loop drives the whole show. */
  useEffect(() => {
    if (phase !== "boot") return;

    if (reduced) {
      const t = window.setTimeout(() => setPhase("done"), 900);
      return () => window.clearTimeout(t);
    }

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    let lastPct = -1;
    let lastIdx = -2;

    const loop = (now: number) => {
      // skip = fast-forward from the warp beat
      if (skipRef.current && skipStartRef.current < 0) {
        skipStartRef.current = (now - start) / 1000;
        beginWarp();
      }
      const elapsed = (now - start) / 1000;
      const t = skipRef.current
        ? TL.WARP + Math.max(0, elapsed - skipStartRef.current)
        : elapsed;

      // shockwave pings at their beats
      while (pingIdxRef.current < PING_TIMES.length && t >= PING_TIMES[pingIdxRef.current]) {
        const beat = PING_TIMES[pingIdxRef.current];
        const big = beat === TL.EMBLEM || beat === TL.ONLINE;
        const id = pingIdxRef.current;
        setPings((p) => [...p, { id, big }]);
        pingIdxRef.current += 1;
      }

      // progress + boot log
      const pct = progressAt(t);
      if (pct !== lastPct) {
        setProgress(pct);
        lastPct = pct;
      }
      let idx = -1;
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (t >= BOOT_LINES[i].t) idx = i;
        else break;
      }
      if (idx !== lastIdx) {
        setBootIdx(idx);
        lastIdx = idx;
      }

      // stage gates
      if (t >= TL.SIGNAL && stageRef.current < 1) {
        stageRef.current = 1;
        setStage("signal");
      }
      if (t >= TL.EMBLEM && stageRef.current < 2) {
        stageRef.current = 2;
        setStage("emblem");
      }
      if (t >= TL.ONLINE && !onlineRef.current) {
        onlineRef.current = true;
        setOnline(true);
      }

      // warp-drive escalation
      if (!skipRef.current) {
        boostRef.current = t >= TL.WARP ? 16 : t >= TL.CHARGE ? 1.15 : 0.6;
        if (t >= TL.WARP) beginWarp();
        if (t >= TL.EXIT) {
          beginExit();
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      for (const t of timersRef.current) window.clearTimeout(t);
      timersRef.current = [];
    };
  }, [phase, reduced]);

  if (phase === "done") return null;

  const exiting = phase === "exit";
  const showEmblem = stage === "emblem";
  const sparkOn = stage === "signal";
  const pct = String(Math.min(100, progress)).padStart(3, "0");
  const R = 138;
  const CIRC = 2 * Math.PI * R;

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#040406]"
      initial={{ clipPath: "circle(141% at 50% 50%)" }}
      animate={exiting ? { clipPath: "circle(0% at 50% 50%)" } : { clipPath: "circle(141% at 50% 50%)" }}
      transition={{ duration: exiting ? 0.9 : 0, ease: [0.7, 0, 0.3, 1] }}
      role="status"
      aria-label="TEKA platform is loading"
    >
      {/* Deep-space canvas */}
      <CosmosField boostRef={boostRef} reduced={!!reduced} />

      {/* Nebula atmosphere */}
      <div className="nebula nebula-a" aria-hidden="true" />
      <div className="nebula nebula-b" aria-hidden="true" />

      {/* Core glow + vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 46% 36% at 50% 46%, rgba(227,184,85,0.14), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {/* ── HUD frame ─────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-5 z-10 flex items-start justify-between px-5 sm:px-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: exiting ? 0 : 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45 }}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] tracking-[0.34em] text-white/35">
          TEKA SYSTEMS // IGNITION SEQ.07
        </span>
        <span className="hidden font-mono text-[9px] tracking-[0.34em] text-white/35 sm:block">
          DEEP ORBIT — EST. 2025
        </span>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex items-end justify-between px-5 sm:px-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: exiting ? 0 : 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6 }}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] tracking-[0.34em] text-white/35">
          35.6892° N — 51.3890° E
        </span>
        <span className="font-mono text-[9px] tracking-[0.34em] text-gold-bright/50">
          TEKA-∞
        </span>
      </motion.div>

      {/* ── Center stack ──────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-10 sm:pb-6">
        {/* Emblem cluster — vh-clamped so short viewports never collide */}
        <div className="relative h-[min(300px,40vh)] w-[min(300px,40vh)] sm:h-[min(360px,42vh)] sm:w-[min(360px,42vh)]">
          {/* The spark — before the emblem */}
          <AnimatePresence>
            {sparkOn && !showEmblem && (
              <motion.div
                key="spark"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.45, 1] }}
                exit={{ opacity: 0, scale: 2.4, transition: { duration: 0.4 } }}
                transition={{
                  opacity: { duration: 0.35 },
                  scale: { duration: 1.15, repeat: Infinity, ease: "easeInOut" },
                }}
                aria-hidden="true"
              >
                <div
                  className="h-3 w-3 rounded-full bg-gold-bright"
                  style={{
                    boxShadow:
                      "0 0 18px 4px rgba(240,212,138,0.85), 0 0 60px 18px rgba(227,184,85,0.35)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orbital machinery — deploy with the emblem */}
          <AnimatePresence>
            {showEmblem && (
              <motion.div
                key="rings"
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0, scale: 1.18 }}
                animate={{ opacity: exiting ? 0 : 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                {/* counter-rotating glyph rings */}
                <div className="spin-cw-30 absolute inset-0">
                  <svg viewBox="0 0 360 360" className="h-full w-full" fill="none">
                    <circle
                      cx="180"
                      cy="180"
                      r="168"
                      stroke="rgba(227,184,85,0.16)"
                      strokeWidth="1"
                      strokeDasharray="2 10"
                    />
                  </svg>
                </div>
                <div className="spin-ccw-46 absolute inset-0">
                  <svg viewBox="0 0 360 360" className="h-full w-full" fill="none">
                    {TICKS.map((tk, i) => (
                      <line
                        key={i}
                        x1={tk.x1}
                        y1={tk.y1}
                        x2={tk.x2}
                        y2={tk.y2}
                        stroke={tk.major ? "rgba(240,212,138,0.5)" : "rgba(200,205,214,0.2)"}
                        strokeWidth={tk.major ? 1.6 : 1}
                      />
                    ))}
                  </svg>
                </div>

                {/* faint inner circle */}
                <svg viewBox="0 0 360 360" className="absolute inset-0 h-full w-full" fill="none">
                  <circle cx="180" cy="180" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                </svg>

                {/* progress arc */}
                <svg viewBox="0 0 360 360" className="absolute inset-0 h-full w-full" fill="none">
                  <defs>
                    <linearGradient id="ignition-arc-v2" x1="0" y1="0" x2="360" y2="360">
                      <stop offset="0%" stopColor="#b08d3e" />
                      <stop offset="55%" stopColor="#f0d48a" />
                      <stop offset="100%" stopColor="#b08d3e" />
                    </linearGradient>
                  </defs>
                  <circle cx="180" cy="180" r={R} stroke="rgba(227,184,85,0.12)" strokeWidth="1.5" />
                  <circle
                    cx="180"
                    cy="180"
                    r={R}
                    stroke="url(#ignition-arc-v2)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC * (1 - Math.min(100, progress) / 100)}
                    transform="rotate(-90 180 180)"
                    style={{ transition: "stroke-dashoffset 140ms linear" }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shockwave pings */}
          {pings.map((p) => (
            <PingRing
              key={p.id}
              id={p.id}
              big={p.big}
              onDone={(id) => setPings((list) => list.filter((x) => x.id !== id))}
            />
          ))}

          {/* The TEKA emblem */}
          <AnimatePresence>
            {showEmblem && (
              <motion.div
                key="emblem"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.78, filter: "blur(14px)" }}
                animate={{
                  opacity: exiting ? 0 : 1,
                  scale: exiting ? 1.5 : 1,
                  filter: exiting ? "blur(8px)" : "blur(0px)",
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: exiting ? 0.55 : 1.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="emblem-halo absolute h-[52%] w-[86%]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: online ? 1.0 : 0.75, scale: 1 }}
                  transition={{ duration: online ? 0.4 : 1.4, ease: "easeOut" }}
                  aria-hidden="true"
                />
                <Image
                  src="/teka-mark.png"
                  alt="TEKA emblem"
                  width={272}
                  height={153}
                  priority
                  className="relative h-[36%] w-[64%] object-contain"
                  style={{
                    filter: online
                      ? "drop-shadow(0 0 42px rgba(240,212,138,0.65))"
                      : "drop-shadow(0 0 26px rgba(227,184,85,0.35))",
                    transition: "filter 600ms ease",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wordmark */}
        <AnimatePresence>
          {showEmblem && (
            <motion.div
              key="wordmark"
              initial={{ opacity: 0, letterSpacing: "0.9em" }}
              animate={{ opacity: exiting ? 0 : 1, letterSpacing: "0.5em" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="mt-3 text-center sm:mt-5"
              aria-hidden="true"
            >
              <span className="font-display text-xl font-bold gold-text sm:text-2xl">TEKA</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Systems online flash */}
        <div className="mt-2 flex h-5 items-center justify-center sm:mt-3" aria-hidden="true">
          <AnimatePresence>
            {online && (
              <motion.p
                key="online"
                initial={{ opacity: 0, letterSpacing: "0.2em", scale: 0.92 }}
                animate={{ opacity: 1, letterSpacing: "0.42em", scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono text-[11px] font-semibold text-gold-bright sm:text-xs"
                style={{ textShadow: "0 0 18px rgba(240,212,138,0.6)" }}
              >
                SYSTEMS ONLINE
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Boot log — rolling window, clipped from the top on short screens */}
        <motion.div
          className="mt-2 flex h-[68px] w-[300px] flex-col justify-end gap-[3px] overflow-hidden sm:mt-3 sm:h-[96px] sm:w-[360px]"
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          {BOOT_LINES.map((line, i) => {
            const done = bootIdx > i;
            const active = bootIdx === i;
            return (
              <motion.p
                key={line.label}
                initial={false}
                animate={{ opacity: done ? 0.24 : active ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                className="text-center font-mono text-[9px] tracking-[0.26em] text-gold-bright/90 sm:text-[10px]"
              >
                {done ? `✓ ${line.label}` : active ? `▸ ${line.label}` : line.label}
              </motion.p>
            );
          })}
        </motion.div>
      </div>

      {/* ── Bottom readout ────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center gap-2.5"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      >
        <div className="h-px w-52 overflow-hidden bg-white/[0.07] sm:w-72">
          <div
            className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
            style={{ width: `${Math.min(100, progress)}%`, transition: "width 140ms linear" }}
          />
        </div>
        <p className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground">
          {pct}% — {online ? "SYSTEMS ONLINE" : "INITIALIZING"}
        </p>
      </motion.div>

      {/* ── Skip control ──────────────────────────────────────────── */}
      {!reduced && !exiting && (
        <motion.button
          type="button"
          onClick={(e) => {
            skipRef.current = true;
            e.currentTarget.blur();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="absolute right-5 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 rounded-md border border-white/10 px-3 py-1.5 font-mono text-[9px] tracking-[0.3em] text-white/45 transition-colors hover:border-gold/40 hover:text-gold-bright active:border-gold/40 active:text-gold-bright sm:bottom-14 sm:right-8"
          aria-label="Skip the loading intro"
        >
          SKIP →
        </motion.button>
      )}

      {/* Warp flash */}
      <AnimatePresence>
        {warpFlash && (
          <motion.div
            key="warp-flash"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 46%, rgba(255,244,214,0.95), rgba(240,212,138,0.5) 34%, transparent 68%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: exiting ? 0.4 : 0.5, ease: "easeOut" }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <span className="sr-only">
        Loading TEKA — building the future of digital technology.
      </span>
    </motion.div>
  );
}
