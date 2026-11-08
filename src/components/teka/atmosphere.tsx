"use client";

/**
 * TEKA Atmosphere — deep-space canvas engine.
 *
 * Layers:
 *  1. Twinkling starfield with depth parallax (three depth bands, gold accents)
 *  2. Slow-drifting gold dust particles + connection lines (the brand constellation)
 *  3. Occasional shooting stars with fading trails
 *
 * Honors prefers-reduced-motion (renders a single static frame).
 * Pauses on hidden tabs. Single rAF loop, DPR-aware, capped particle counts.
 */
import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };
type Star = { x: number; y: number; r: number; base: number; phase: number; freq: number; depth: number; gold: boolean };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };

export function AtmosphereCanvas({ density = 0.00008 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let nextMeteorAt = 0;

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(Math.floor(w * h * density), 90);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.5 + 0.15,
      }));

      const starCount = Math.min(Math.floor((w * h) / 6500), 170);
      stars = Array.from({ length: starCount }, () => {
        const depth = Math.random(); // 0 = far, 1 = near
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.4 + depth * 1.3,
          base: 0.18 + depth * 0.5,
          phase: Math.random() * Math.PI * 2,
          freq: 0.4 + Math.random() * 1.4,
          depth,
          gold: Math.random() > 0.86,
        };
      });

      nextMeteorAt = performance.now() + 2500 + Math.random() * 4000;
    };

    const spawnMeteor = (w: number, h: number) => {
      const fromLeft = Math.random() > 0.5;
      const speed = 7 + Math.random() * 5;
      const angle = (18 + Math.random() * 20) * (Math.PI / 180);
      meteors.push({
        x: fromLeft ? -40 : w + 40,
        y: Math.random() * h * 0.4,
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 30,
      });
    };

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // ── twinkling stars ──
      for (const s of stars) {
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.freq + s.phase);
        const alpha = s.base * twinkle;
        if (alpha < 0.02) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? `rgba(232, 199, 116, ${alpha})`
          : `rgba(214, 220, 232, ${alpha * 0.85})`;
        ctx.fill();
      }

      // ── connection lines ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(227, 184, 85, ${(1 - dist / 130) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // ── gold dust particles ──
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 199, 116, ${p.a})`;
        ctx.fill();
      }

      // ── shooting stars ──
      for (const m of meteors) {
        m.life++;
        m.x += m.vx;
        m.y += m.vy;
        const fade = Math.sin((m.life / m.maxLife) * Math.PI);
        const tailX = m.x - m.vx * 9;
        const tailY = m.y - m.vy * 9;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, "rgba(240, 212, 138, 0)");
        grad.addColorStop(1, `rgba(240, 212, 138, ${0.85 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        // bright head
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247, 231, 176, ${fade})`;
        ctx.fill();
      }
      meteors = meteors.filter((m) => m.life < m.maxLife && m.x > -80 && m.x < canvas.clientWidth + 80 && m.y < canvas.clientHeight + 80);

      if (!reduced && t > nextMeteorAt) {
        spawnMeteor(w, h);
        nextMeteorAt = t + 4500 + Math.random() * 6000;
      }
    };

    const step = (t: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
      // gentle star drift — near stars move faster (parallax)
      for (const s of stars) {
        s.x += 0.014 * (0.25 + s.depth);
        if (s.x > w + 4) s.x = -4;
      }
      draw(t);
      raf = requestAnimationFrame(step);
    };

    resize();
    if (reduced) {
      draw(0); // static composition
    } else {
      raf = requestAnimationFrame(step);
    }

    const onResize = () => {
      resize();
      if (reduced) draw(0);
    };
    window.addEventListener("resize", onResize);

    // pause when tab hidden — battery/CPU friendly
    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
