"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { TokenomicsChart } from "@/components/teka/tokenomics-chart";
import { WalletPanel } from "@/components/teka/wallet-panel";
import { TOKEN, TOKENOMICS } from "@/lib/teka/config";
import { Lightbulb, Lock, Globe2, Layers3 } from "lucide-react";

const UTILITY = [
  {
    icon: Lightbulb,
    title: "Ecosystem Power",
    body: "TEKA Token is designed to connect products and services inside the ecosystem — access, subscriptions and digital experiences.",
  },
  {
    icon: Lock,
    title: "Transparent Economy",
    body: "Fixed supply of 100,000,000, published allocations and an honest deployment status. No hidden mints, no fake markets.",
  },
  {
    icon: Globe2,
    title: "Global Access",
    body: "An ERC-20 asset on Ethereum infrastructure — globally verifiable on-chain once utility goes live in later phases.",
  },
];

export function TokenView() {
  return (
    <>
      <PageHeader
        eyebrow="Official Token"
        title={<>TEKA <span className="gold-text">Token</span></>}
        description="The digital asset designed to power the TEKA ecosystem — currently in development on the Sepolia testnet. Not tradeable."
      />

      {/* Facts strip */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12" aria-label="Token facts">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: "Name", value: TOKEN.name },
            { label: "Standard", value: TOKEN.standard },
            { label: "Decimals", value: String(TOKEN.decimals) },
            { label: "Total Supply", value: "100M" },
            { label: "Mainnet", value: "Not deployed" },
          ].map((fact, i) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass rounded-2xl px-4 py-5 text-center"
            >
              <p className="font-display text-xl md:text-2xl font-semibold">{fact.value}</p>
              <p className="mono-label mt-1.5 text-muted-foreground">{fact.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Utility */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16" aria-label="Token utility">
        <div className="grid gap-4 md:grid-cols-3">
          {UTILITY.map((u, i) => (
            <motion.article
              key={u.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="card-hover glass rounded-2xl p-6"
            >
              <u.icon className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Tokenomics */}
      <section className="border-y border-white/[0.05] bg-[#08080a] py-16 md:py-20" aria-label="Tokenomics">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mono-label text-gold/80 mb-3">TEKA Tokenomics</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">
              Published. Fixed. <span className="gold-text">Verifiable.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-muted-foreground">
              Allocation per Whitepaper v1.0 §6 — interactive breakdown:
            </p>
          </div>
          <TokenomicsChart />
          <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
            Note: the whitepaper also describes an initial circulating allocation of up to 45,000,000 TEKA.
            Allocations are pre-launch targets — no tokens are circulating or claimable today.
          </p>
        </div>
      </section>

      {/* Wallet */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16" aria-label="Wallet connection">
        <WalletPanel />
      </section>

      {/* Honest disclaimer */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20" aria-label="Token disclaimer">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-amber-200">
            <Layers3 className="h-4 w-4" aria-hidden /> What this token is — and is not
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
            <li>• A utility concept in development: {TOKENOMICS[0].tokens.toLocaleString("en-US")} of 100M TEKA is earmarked for ecosystem & community use.</li>
            <li>• Not a tradeable asset: no mainnet deployment, no exchange listings, no liquidity pools exist.</li>
            <li>• Not financial advice or an investment offer. Nothing here is a solicitation to buy anything.</li>
            <li>• Verify everything on-chain: the only published address is the Sepolia testnet contract shown above.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
