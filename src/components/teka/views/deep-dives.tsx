"use client";

/**
 * Deep-dive views: Performance, Security, Experience (Premium), Global Vision.
 * Shared skeleton keeps the platform consistent; content is specific and honest.
 */
import { motion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { useRouter } from "@/lib/teka/router";
import { StatusBadge } from "@/components/teka/primitives";
import { usePlatformStatus } from "@/lib/teka/hooks";
import { SOCIALS } from "@/lib/teka/config";
import { ArrowRight, Gauge, ShieldCheck, Gem, Globe2, Send, Twitter } from "lucide-react";
import { Zap, Lock, Eye, Server, Globe2 as World, Users, Wifi, Database, FileCheck } from "lucide-react";

type Card = { icon: typeof Zap; title: string; body: string };
type Fact = { value: string; label: string; detail: string };

function DeepDive({
  eyebrow,
  title,
  highlight,
  description,
  cards,
  facts,
  cta,
  factLabel = "Verified platform facts",
}: {
  eyebrow: string;
  title: React.ReactNode;
  highlight: string;
  description: string;
  cards: Card[];
  facts: Fact[];
  cta?: { label: string; route: "command" | "contact" | "ecosystem" };
  factLabel?: string;
}) {
  const navigate = useRouter((s) => s.navigate);
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6" aria-label={`${eyebrow} details`}>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="card-hover glass rounded-3xl p-6"
            >
              <card.icon className="h-6 w-6 text-gold" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.05] bg-[#08080a] py-14" aria-label={factLabel}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mono-label mb-6 text-center text-gold/80">{factLabel}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {facts.map((fact, i) => (
              <motion.div
                key={fact.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center"
              >
                <p className="font-display text-2xl font-semibold gold-text">{fact.value}</p>
                <p className="mono-label mt-1.5 text-foreground/80">{fact.label}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{fact.detail}</p>
              </motion.div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
            {highlight}
          </p>
          {cta && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate(cta.route)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function PerformanceView() {
  const status = usePlatformStatus();
  return (
    <>
      <DeepDive
        eyebrow="TEKA Performance"
        title={<>Engineered For <span className="gold-text">Speed</span></>}
        description="Built for responsiveness and efficiency — and measured, not marketed. Here is how the platform is actually engineered."
        cards={[
          { icon: Zap, title: "Instant Interactions", body: "Client-side routing with prefetched data, optimistic UI and buttery 60fps transitions via GPU-composited animation." },
          { icon: Wifi, title: "Efficient Data", body: "TanStack Query caching, 30–60s stale windows and interval refresh keep the platform live without hammering the network." },
          { icon: Server, title: "Lean Backend", body: "In-memory caching for market data, indexed SQLite queries and capped payloads keep API responses fast and small." },
        ]}
        facts={[
          { value: "60s", label: "Market Cache", detail: "Upstream-fresh, rate-limit friendly" },
          { value: "<45s", label: "Presence Window", detail: "Real sessions, refreshed every 20s" },
          { value: "0", label: "Render Blockers", detail: "No 3-second intro animations" },
        ]}
        cta={{ label: "Watch It Live — Command Center", route: "command" }}
        factLabel="Measured engineering facts"
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-label="Live systems">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mono-label mr-2 text-muted-foreground">Live system states:</span>
          {(status.data?.systems ?? []).map((s) => (
            <StatusBadge key={s.id} state={s.state} />
          ))}
        </div>
      </section>
    </>
  );
}

export function SecurityView() {
  return (
    <DeepDive
      eyebrow="TEKA Security"
      title={<>Secure <span className="gold-text">By Design</span></>}
      description="Security is integrated into every layer of the ecosystem — protection, reliability and trust at the foundation."
      cards={[
        { icon: Lock, title: "Input Defense", body: "Every API mutation is schema-validated (Zod), length-capped and rate-limited per client before touching storage." },
        { icon: Eye, title: "Wallet Safety", body: "Read-only wallet connections. TEKA never requests signatures, transactions or secrets — and says so in the UI." },
        { icon: FileCheck, title: "Honest Chain Data", body: "One published contract, labeled testnet. We surface what is verifiable instead of claiming security we can't prove." },
      ]}
      facts={[
        { value: "100%", label: "Validated Intake", detail: "All POST bodies schema-checked" },
        { value: "5 / 10min", label: "Contact Rate Limit", detail: "Per client, abuse-resistant" },
        { value: "0", label: "Secrets In Client", detail: "No keys shipped to the browser" },
      ]}
      cta={{ label: "Review The Token Transparency", route: "token" }}
      factLabel="Platform security facts"
    />
  );
}

export function PremiumView() {
  return (
    <DeepDive
      eyebrow="TEKA Experience"
      title={<>Designed <span className="gold-text">Beyond Technology</span></>}
      description="Every pixel, every interaction, every detail — a premium digital experience crafted for the future."
      cards={[
        { icon: Gem, title: "A Material Language", body: "Deep graphite surfaces, metallic gold light and glass layering — an identity engineered to be recognized instantly." },
        { icon: Zap, title: "Purposeful Motion", body: "Animation is used to explain, not decorate. Spring-physics navigation, cinematic entries — always honoring reduced-motion." },
        { icon: Eye, title: "Detail As Standard", body: "Tabular numerals, aligned grids, hairline borders, focus rings and screen-reader labels across the entire platform." },
      ]}
      facts={[
        { value: "3", label: "Typefaces", detail: "Display, text and mono — each with a job" },
        { value: "6", label: "Divisions", detail: "One consistent visual system" },
        { value: "AA", label: "Contrast Target", detail: "Accessible foregrounds on dark surfaces" },
      ]}
      cta={{ label: "Feel It — Explore TEKA", route: "explore" }}
      factLabel="Design system facts"
    />
  );
}

export function GlobalVisionView() {
  return (
    <>
      <DeepDive
        eyebrow="TEKA Global"
        title={<>Technology <span className="gold-text">Without Borders</span></>}
        description="Creating digital solutions that connect, empower and inspire users around the world — from day one."
        cards={[
          { icon: World, title: "Worldwide Access", body: "The platform serves a global audience with reference pricing in USD and Iranian Toman, clearly sourced." },
          { icon: Globe2, title: "Open Development", body: "Public repository, published whitepaper and transparent roadmap — anyone, anywhere can follow the build." },
          { icon: Users, title: "Community First", body: "Official channels on Telegram and X, with a direct line to the founding team from any country." },
        ]}
        facts={[
          { value: "2", label: "Currencies", detail: "USD + IRR reference rates, live-sourced" },
          { value: "24/7", label: "Availability", detail: "Global, self-serve platform" },
          { value: "5", label: "Roadmap Phases", detail: "A plan measured in phases, not hype" },
        ]}
        cta={{ label: "Join The Ecosystem", route: "ecosystem" }}
        factLabel="Global platform facts"
      />
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6" aria-label="Community channels">
        <p className="mono-label text-gold/80">Follow The Journey</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={SOCIALS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            <Send className="h-4 w-4" aria-hidden /> Telegram — @TEKAOfficial
          </a>
          <a
            href={SOCIALS.x}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            <Twitter className="h-4 w-4" aria-hidden /> X — @TEKAweb3
          </a>
        </div>
      </section>
    </>
  );
}
