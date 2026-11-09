"use client";

import { motion } from "framer-motion";
import { Hero } from "@/components/teka/hero";
import { MarketWidget } from "@/components/teka/market-widget";
import { EcosystemMap } from "@/components/teka/ecosystem-map";
import { TokenomicsChart } from "@/components/teka/tokenomics-chart";
import { RoadmapTimeline } from "@/components/teka/roadmap-timeline";
import { NexusTrailer } from "@/components/teka/nexus-trailer";
import { SectionHeading } from "@/components/teka/primitives";
import { useRouter } from "@/lib/teka/router";
import { FAQ } from "@/lib/teka/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ShieldCheck, Zap, Layers, Globe2, Eye } from "lucide-react";

const PILLARS = [
  {
    icon: Layers,
    title: "One Connected Ecosystem",
    body: "Products, infrastructure, intelligence and community operating as a single engineered system.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency First",
    body: "Real statuses, sourced data, clearly labeled plans. A testnet is called a testnet — always.",
  },
  {
    icon: Zap,
    title: "Engineered Performance",
    body: "Modern web architecture built for speed, efficiency and a premium feel on every device.",
  },
  {
    icon: Globe2,
    title: "Built For The World",
    body: "A global technology brand designed without borders — accessible anywhere, on any device.",
  },
];

export function HomeView() {
  const navigate = useRouter((s) => s.navigate);

  return (
    <>
      <Hero />

      {/* Market */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20" aria-label="Market overview">
        <SectionHeading
          eyebrow="TEKA Market"
          title={<>Global Market <span className="silver-text">Reference</span></>}
          description="Live third-party market data, transparently sourced — with honest availability states when upstreams fail."
        />
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <MarketWidget />
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="relative border-y border-white/[0.05] bg-[#08080a] py-16 md:py-24" aria-label="Platform pillars">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why TEKA"
            title={<>Built For <span className="gold-text">The Future</span></>}
            description="Powerful technology designed for speed, transparency and a premium digital experience."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, i) => (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="card-hover glass rounded-2xl p-6"
              >
                <pillar.icon className="h-6 w-6 text-gold" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* TEKA NEXUS — deep-space transmission (cinematic showcase) */}
      <NexusTrailer />

      {/* Ecosystem map */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24" aria-label="Ecosystem map">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="TEKA Ecosystem"
              title={<>One Core. <span className="gold-text">Six Divisions.</span></>}
              description="Every part of TEKA works together — a connected technology ecosystem spanning products, blockchain infrastructure, intelligence and community."
            />
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => navigate("ecosystem")}
              className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-6 py-2.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/20"
            >
              Discover the Ecosystem
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </motion.button>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pb-16"
          >
            <EcosystemMap compact />
          </motion.div>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="relative border-y border-white/[0.05] bg-[#08080a] py-16 md:py-24" aria-label="Tokenomics">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="TEKA Tokenomics"
            title={<>A Sustainable <span className="gold-text">Economy</span></>}
            description="Fixed supply of 100,000,000 TEKA — allocation exactly as published in Whitepaper v1.0."
          />
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <TokenomicsChart />
          </motion.div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-24" aria-label="Roadmap">
        <SectionHeading
          eyebrow="TEKA Roadmap"
          title={<>Building The Future, <span className="silver-text">Step By Step</span></>}
          description="Five phases from the official whitepaper. Completed work is marked completed — plans are marked planned. No vanity dates."
        />
        <RoadmapTimeline />
      </section>

      {/* FAQ */}
      <section className="relative border-t border-white/[0.05] bg-[#08080a] py-16 md:py-24" aria-label="Frequently asked questions">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title={<>Frequently Asked <span className="gold-text">Questions</span></>}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="glass rounded-2xl px-6">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-white/[0.07]">
                  <AccordionTrigger className="text-left text-sm md:text-base hover:text-gold-bright hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 md:py-28" aria-label="Call to action">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(227,184,85,0.08), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Eye className="mx-auto h-8 w-8 text-gold/60" aria-hidden />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-6 font-display text-3xl md:text-5xl font-semibold text-balance"
          >
            We don&apos;t build products. <span className="gold-text">We build the future.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-muted-foreground"
          >
            TEKA is creating next-generation digital technology with innovation, security and premium experiences.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <button
              onClick={() => navigate("token")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              Discover TEKA Token
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              onClick={() => navigate("contact")}
              className="rounded-full glass px-7 py-3 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold-bright"
            >
              Connect With TEKA
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
