"use client";

/**
 * TEKA NEXUS — Docking Bay
 *
 * The continuation of the deep-space transmission: a fleet registry that maps
 * every real Nexus feature to a ship class, an intercepted alien-transmission
 * terminal (playful, clearly decorative) and a galactic stats strip.
 *
 * Honesty: the fleet metaphors are decoration; every factual claim
 * (free, academies, certificates, teammate matching) mirrors
 * src/lib/teka/config.ts. The aliens are not a factual claim.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Globe2,
  GraduationCap,
  Hammer,
  Radio,
  Sparkles,
  Users2,
} from "lucide-react";
import { SectionHeading } from "@/components/teka/primitives";
import { NEXUS } from "@/lib/teka/config";

/* ── fleet registry ──────────────────────────────────────────────────────── */

const FLEET = [
  {
    code: "SCV-01",
    cls: "Scout Class",
    icon: GraduationCap,
    title: "Python Academy",
    body: "Your first vessel. Learn Python from absolute zero — no experience required, no gravity holding you back.",
  },
  {
    code: "CRS-02",
    cls: "Cruiser Class",
    icon: Globe2,
    title: "Web Academy",
    body: "HTML, CSS and real websites. Chart your own constellation across the open web.",
  },
  {
    code: "DCK-03",
    cls: "Docking Bay",
    icon: Users2,
    title: "Teammate Matching",
    body: "Find your crew. The matching system pairs you with builders at your level — nobody flies alone.",
  },
  {
    code: "YRD-04",
    cls: "Shipyard",
    icon: Hammer,
    title: "Real Projects",
    body: "Tutorials are the flight simulator. The shipyard is where real projects get built and launched.",
  },
  {
    code: "LIC-05",
    cls: "Captain's License",
    icon: Award,
    title: "Quizzes & Certificates",
    body: "Clear the checkpoints, earn the certificate — proof of rank that glows on any resume.",
  },
  {
    code: "OPN-06",
    cls: "Open To All Civilizations",
    icon: Sparkles,
    title: "100% Free",
    body: "Zero tuition, zero catch, forever. The Nexus welcomes every species — and every budget.",
  },
] as const;

/* ── intercepted alien transmissions ─────────────────────────────────────── */

const MESSAGES = [
  "HUMAN, WE HAVE WATCHED YOUR PYTHON LESSONS. IMPRESSIVE SPECIES.",
  "YOUR TEAM IS MISSING THREE CREW MEMBERS. CHECK THE MATCHING BAY.",
  "THE CERTIFICATES GLOW BRIGHTLY IN OUR GALAXY TOO.",
  "TUITION? WE LOOKED IT UP. IT MEANS 'A PRICE'. THE NEXUS HAS NONE.",
  "END OF TRANSMISSION. THE GATES ARE OPEN. COME AS YOU ARE. ▸▸",
] as const;

const PRE_FILL = 2; // lines already "received" on mount

function useTransmissions(reduced: boolean) {
  const [done, setDone] = useState<string[]>(() => MESSAGES.slice(0, PRE_FILL) as unknown as string[]);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    if (reduced) return; // static full log is shown via derived values
    let mi = PRE_FILL;
    let ci = 0;
    let timer = 0;
    const typeNext = () => {
      ci++;
      const m = MESSAGES[mi];
      setCurrent(m.slice(0, ci));
      if (ci >= m.length) {
        timer = window.setTimeout(() => {
          setDone((d) => [...d, m].slice(-4));
          mi = (mi + 1) % MESSAGES.length;
          ci = 0;
          setCurrent("");
          timer = window.setTimeout(typeNext, 900);
        }, 1600);
      } else {
        timer = window.setTimeout(typeNext, 26 + Math.random() * 44);
      }
    };
    timer = window.setTimeout(typeNext, 700);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return {
    done: reduced ? ([...MESSAGES] as string[]) : done,
    current: reduced ? "" : current,
  };
}

function SignalBars() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[3, 5, 7, 9].map((h, i) => (
        <span
          key={h}
          className="w-1 animate-pulse rounded-sm bg-gold/70"
          style={{ height: h, animationDelay: `${i * 0.18}s`, animationDuration: "1.4s" }}
        />
      ))}
    </span>
  );
}

/* ── the sections ────────────────────────────────────────────────────────── */

export function NexusFleet() {
  const reduced = !!useReducedMotion();
  const { done, current } = useTransmissions(reduced);

  return (
    <>
      {/* ── FLEET REGISTRY ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-y border-white/[0.05] bg-[#070709] py-16 md:py-24"
        aria-label="TEKA Nexus fleet registry"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 50% 38% at 16% 8%, rgba(227,184,85,0.06), transparent 70%), radial-gradient(ellipse 44% 36% at 88% 92%, rgba(126,222,190,0.04), transparent 70%)",
          }}
        />
        <div className="grid-backdrop absolute inset-0 opacity-50" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Docking Bay"
            title={
              <>
                Choose Your <span className="gold-text">Ship</span>
              </>
            }
            description="Every TEKA Nexus feature, registered as a vessel of the fleet. All systems operational. All seats free."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FLEET.map((ship, i) => (
              <motion.article
                key={ship.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="card-hover glass group relative overflow-hidden rounded-3xl p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/25 bg-gold/10">
                    <ship.icon className="h-5 w-5 text-gold" aria-hidden />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" aria-hidden />
                    <span className="mono-label text-emerald-300">Ready</span>
                  </span>
                </div>

                <p className="mono-label mt-5 text-gold/80">
                  {ship.code} · {ship.cls}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold">{ship.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ship.body}</p>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.07] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gold-bright">
                    FREE SEAT ✓
                  </span>
                  <span className="flex items-end gap-1" aria-hidden="true">
                    {[2, 3.5, 2.5].map((hh, k) => (
                      <span
                        key={k}
                        className="w-1 rounded-sm bg-gold/30 transition-colors duration-300 group-hover:bg-gold/70"
                        style={{ height: hh * 4 }}
                      />
                    ))}
                  </span>
                </div>

                {/* holographic sweep */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALIEN TRANSMISSIONS ────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24" aria-label="Intercepted alien transmissions">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Intercepted Signals"
            title={
              <>
                The Aliens <span className="silver-text">Are Talking</span>
              </>
            }
            description="Live relay from the TEKA Nexus fan club, somewhere past Andromeda. Decorative transmissions only — the courses are the real signal."
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass overflow-hidden rounded-3xl border-gold/15"
          >
            {/* terminal header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </span>
                <span className="mono-label text-muted-foreground">Nexus Relay · Deep Space Log</span>
              </div>
              <SignalBars />
            </div>

            {/* terminal body */}
            <div className="min-h-[16.5rem] space-y-3 p-5 font-mono text-[12.5px] leading-relaxed sm:min-h-[15rem] sm:p-6 sm:text-[13px]">
              {done.map((m, i) => (
                <p key={`${i}-${m.slice(0, 12)}`} className="text-silver/90">
                  <span className="mr-2 text-gold/70" aria-hidden>
                    ▸
                  </span>
                  <span className="mr-2 text-gold/50">SIG-00{(i % 9) + 1}</span>
                  {m}
                </p>
              ))}
              {current && (
                <p className="text-foreground/90">
                  <span className="mr-2 text-gold/70" aria-hidden>
                    ▸
                  </span>
                  <span className="mr-2 text-gold/50">SIG-00{(done.length % 9) + 1}</span>
                  {current}
                  <span className="terminal-cursor ml-1 text-gold" aria-hidden>
                    ▊
                  </span>
                </p>
              )}
              {!current && (
                <p className="text-muted-foreground/50">
                  <span className="mr-2 text-gold/40" aria-hidden>
                    ▸
                  </span>
                  listening…
                  <span className="terminal-cursor ml-1 text-gold/60" aria-hidden>
                    ▊
                  </span>
                </p>
              )}
            </div>

            {/* terminal footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-white/[0.02] px-5 py-3">
              <span className="mono-label inline-flex items-center gap-2 text-emerald-300/90">
                <Radio className="h-3 w-3" aria-hidden />
                Signal: strong
              </span>
              <span className="mono-label text-muted-foreground/60">
                Origin: unverified · Vibe: friendly
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GALACTIC STATS ─────────────────────────────────────────────── */}
      <section className="relative pb-20 pt-2" aria-label="Nexus at a glance">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.05] lg:grid-cols-4"
          >
            {[
              { value: "02", label: "Academies Live", detail: "Python · Web" },
              { value: "100%", label: "Free Forever", detail: "No fees, no catch" },
              { value: "00", label: "Experience Needed", detail: "Start from zero" },
              { value: "∞", label: "Curiosity Required", detail: "The only entry fee" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0c]/95 px-5 py-6 text-center">
                <dd className="gold-text font-display text-3xl font-bold sm:text-4xl">
                  {s.value}
                </dd>
                <dt className="mono-label mt-2 text-muted-foreground">{s.label}</dt>
                <p className="mt-1 text-[11px] text-muted-foreground/60">{s.detail}</p>
              </div>
            ))}
          </motion.dl>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex justify-center"
          >
            <a
              href={NEXUS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-8 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97]"
              aria-label={`Open ${NEXUS.name} — the TEKA academy (new tab)`}
            >
              Launch The Nexus
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
