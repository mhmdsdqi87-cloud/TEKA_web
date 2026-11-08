"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { useRouter } from "@/lib/teka/router";
import { TEAM, SOCIALS } from "@/lib/teka/config";
import { ArrowRight, Compass, Eye, Github, Target } from "lucide-react";

export function AboutView() {
  const navigate = useRouter((s) => s.navigate);

  return (
    <>
      <PageHeader
        eyebrow="About TEKA"
        title={<>A Vision. A Technology. <span className="gold-text">A Future.</span></>}
        description="TEKA is building the next generation of digital technology — combining innovation, blockchain and modern software experiences into one powerful ecosystem."
      />

      {/* Mission & vision */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16" aria-label="Mission and vision">
        <div className="grid gap-4 md:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="card-hover glass rounded-3xl p-8"
          >
            <Target className="h-7 w-7 text-gold" aria-hidden />
            <p className="mono-label mt-5 text-gold/80">Our Mission</p>
            <p className="mt-3 font-display text-xl md:text-2xl font-medium leading-snug">
              Creating premium digital solutions that connect people, technology and the future.
            </p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="card-hover glass rounded-3xl p-8"
          >
            <Eye className="h-7 w-7 text-silver" aria-hidden />
            <p className="mono-label mt-5 text-silver">Our Vision</p>
            <p className="mt-3 font-display text-xl md:text-2xl font-medium leading-snug">
              Building a global technology ecosystem designed for the next digital generation.
            </p>
          </motion.article>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-white/[0.05] bg-[#08080a] py-16" aria-label="Principles">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mono-label text-gold/80 mb-3">How TEKA Operates</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Principles, <span className="gold-text">Not Promises</span></h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Ship, Then Claim", body: "A feature exists when you can use it. Statuses on this platform are generated from real system state — never from marketing." },
              { title: "Transparency As Design", body: "Sources, caches, testnets and plans are labeled inline. If data is unavailable we say so instead of inventing it." },
              { title: "Craft At Every Scale", body: "From typography to API error handling, the same engineering standard applies across the entire ecosystem." },
            ].map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass rounded-2xl p-6"
              >
                <span className="font-display text-3xl font-bold text-gold/25">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16" aria-label="Team">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="glass-gold rounded-3xl p-8 text-center"
        >
          <p className="mono-label text-gold/80">Founder & Creator</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">{TEAM[0].name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{TEAM[0].role} · {TEAM[1].name} — {TEAM[1].role}</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            &ldquo;The mind behind TEKA — a developer focused on creating future-ready digital products and technology experiences.&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={TEAM[0].link ?? SOCIALS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
            >
              <Github className="h-4 w-4" aria-hidden /> GitHub Profile
            </a>
            <button
              onClick={() => navigate("contact")}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              Contact TEKA <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Organization facts">
          {[
            { icon: Compass, label: "Independent Initiative", value: "Self-founded" },
            { icon: Github, label: "Open Development", value: "Public repository" },
            { icon: Target, label: "Current Phase", value: "Phase 2 — Product" },
          ].map((f) => (
            <div key={f.label} className="glass rounded-2xl p-5 text-center">
              <f.icon className="mx-auto h-5 w-5 text-gold/70" aria-hidden />
              <p className="mt-3 font-display text-lg font-semibold">{f.value}</p>
              <p className="mono-label mt-1 text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
