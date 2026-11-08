/**
 * TEKA Platform Seed
 * All content is sourced from the TEKA repository & whitepaper v1.0.
 * Statuses are honest: nothing is marked LIVE unless it genuinely exists.
 * Run: bunx tsx prisma/seed.ts   (or: bun prisma/seed.ts)
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding TEKA platform data…");

  await db.product.deleteMany();
  await db.roadmapItem.deleteMany();
  await db.platformUpdate.deleteMany();
  await db.metric.deleteMany();

  // ─── Ecosystem divisions & products ─────────────────────────────────────────
  const products = [
    // TECHNOLOGY — the core platform (the website itself is genuinely live)
    {
      slug: "teka-web-platform",
      name: "TEKA Web Platform",
      division: "TECHNOLOGY",
      tagline: "The flagship web experience of the TEKA ecosystem.",
      description:
        "The official TEKA platform: brand, ecosystem discovery, token transparency and the Command Center. Built as a modern, performant web application with a live data layer.",
      status: "LIVE",
      category: "PLATFORM",
      metrics: JSON.stringify([
        { label: "Views", value: "12 Sections" },
        { label: "Stack", value: "Next.js 16" },
      ]),
      featured: true,
      order: 1,
    },
    {
      slug: "command-center",
      name: "TEKA Command Center",
      division: "TECHNOLOGY",
      tagline: "Mission control for the entire ecosystem.",
      description:
        "A live operations dashboard: platform status, honest presence telemetry, ecosystem statistics, market feeds and the platform changelog — all powered by the TEKA API.",
      status: "LIVE",
      category: "PLATFORM",
      metrics: JSON.stringify([
        { label: "Data", value: "Live API" },
        { label: "Storage", value: "SQLite + Prisma" },
      ]),
      featured: true,
      order: 2,
    },
    {
      slug: "teka-api",
      name: "TEKA API",
      division: "TECHNOLOGY",
      tagline: "The data backbone of the platform.",
      description:
        "A consistent REST API layer serving platform status, ecosystem data, honest presence telemetry, cached market data and validated contact intake. Rate limiting and structured errors included.",
      status: "LIVE",
      category: "INFRASTRUCTURE",
      metrics: JSON.stringify([
        { label: "Endpoints", value: "9" },
        { label: "Cache", value: "In-memory" },
      ]),
      featured: false,
      order: 3,
    },

    // WEB3 — token & blockchain infrastructure
    {
      slug: "teka-token",
      name: "TEKA Token",
      division: "WEB3",
      tagline: "The digital asset powering the TEKA ecosystem.",
      description:
        "An ERC-20 utility token (100,000,000 supply, 18 decimals) intended to power digital products, services and subscriptions inside the ecosystem. A development contract is deployed on the Ethereum Sepolia testnet. No mainnet deployment exists yet — the token is not tradeable.",
      status: "DEVELOPMENT",
      category: "INFRASTRUCTURE",
      metrics: JSON.stringify([
        { label: "Supply", value: "100,000,000" },
        { label: "Standard", value: "ERC-20" },
        { label: "Network", value: "Sepolia Testnet" },
      ]),
      featured: true,
      order: 1,
    },
    {
      slug: "teka-contract",
      name: "Token Contract (Testnet)",
      division: "WEB3",
      tagline: "Development contract on Ethereum Sepolia.",
      description:
        "Initial development deployment of the TEKA token contract on the Ethereum Sepolia testnet, published in the TEKA Whitepaper v1.0. This is explicitly a testnet implementation — not a production-market deployment.",
      status: "DEVELOPMENT",
      category: "INFRASTRUCTURE",
      metrics: JSON.stringify([
        { label: "Network", value: "Sepolia" },
        { label: "Standard", value: "ERC-20" },
      ]),
      featured: false,
      order: 2,
    },
    {
      slug: "wallet-integration",
      name: "Wallet Integration",
      division: "WEB3",
      tagline: "MetaMask connection with honest network handling.",
      description:
        "Wallet connection UX with explicit handling for rejected requests, missing providers and unsupported networks. The UI always distinguishes testnet from mainnet and never claims a deployment that isn't verified.",
      status: "LIVE",
      category: "TOOLING",
      metrics: JSON.stringify([{ label: "Providers", value: "MetaMask (EIP-1193)" }]),
      featured: false,
      order: 3,
    },

    // PRODUCTS — digital products (planned per whitepaper Phase 2)
    {
      slug: "digital-products-suite",
      name: "Digital Products Suite",
      division: "PRODUCTS",
      tagline: "Virtual digital products and interactive experiences.",
      description:
        "A planned suite of virtual digital products, tools and interactive experiences as described in the TEKA Whitepaper (Phase 2 — Product). Not yet built.",
      status: "PLANNED",
      category: "PLATFORM",
      metrics: JSON.stringify([{ label: "Phase", value: "2 — Product" }]),
      featured: true,
      order: 1,
    },
    {
      slug: "subscription-services",
      name: "Subscription Services",
      division: "PRODUCTS",
      tagline: "Subscription-based access to ecosystem services.",
      description:
        "Planned subscription architecture offering access to virtual gadgets, digital products and premium services, with TEKA Token utility at the core (Phase 2 — Product).",
      status: "PLANNED",
      category: "PLATFORM",
      metrics: JSON.stringify([{ label: "Phase", value: "2 — Product" }]),
      featured: false,
      order: 2,
    },
    {
      slug: "teka-market-feed",
      name: "TEKA Market Feed",
      division: "PRODUCTS",
      tagline: "Live market data with transparent sourcing.",
      description:
        "A live market dashboard serving BTC, ETH, SOL, BNB, XRP and DOGE prices via the CoinGecko public API with server-side caching, plus USD/IRR conversion. Note: this is third-party market data, not 'TEKA ecosystem' data.",
      status: "LIVE",
      category: "TOOLING",
      metrics: JSON.stringify([
        { label: "Assets", value: "6" },
        { label: "Source", value: "CoinGecko" },
      ]),
      featured: true,
      order: 3,
    },

    // LABS — experiments
    {
      slug: "molten-metal-engine",
      name: "Molten Metal Engine",
      division: "LABS",
      tagline: "A cinematic, GPU-friendly visual engine.",
      description:
        "An experimental atmospheric rendering engine for the TEKA brand — layered gradients, gold-lit particle fields and reduced-motion-aware animation. Original concept carried over from the first TEKA site and rebuilt for performance.",
      status: "EXPERIMENTAL",
      category: "EXPERIENCE",
      metrics: JSON.stringify([{ label: "Type", value: "Visual R&D" }]),
      featured: true,
      order: 1,
    },
    {
      slug: "presence-telemetry",
      name: "Presence Telemetry",
      division: "LABS",
      tagline: "Honest, privacy-friendly visitor presence.",
      description:
        "An experimental presence system: anonymous session heartbeats persisted in SQLite, reported with zero inflation — the original site multiplied real visitor counts by 6×; TEKA shows the true number.",
      status: "LIVE",
      category: "EXPERIENCE",
      metrics: JSON.stringify([{ label: "Policy", value: "No inflation" }]),
      featured: false,
      order: 2,
    },
    {
      slug: "decentralized-identity",
      name: "Decentralized Identity",
      division: "LABS",
      tagline: "Exploring wallet-based ecosystem identity.",
      description:
        "Early exploration of wallet-based identity for ecosystem access and subscriptions. Purely experimental — no production design committed.",
      status: "EXPERIMENTAL",
      category: "INFRASTRUCTURE",
      metrics: JSON.stringify([{ label: "Type", value: "R&D" }]),
      featured: false,
      order: 3,
    },

    // INTELLIGENCE — data & analytics (planned)
    {
      slug: "analytics-engine",
      name: "TEKA Analytics Engine",
      division: "INTELLIGENCE",
      tagline: "Turning ecosystem data into intelligence.",
      description:
        "Planned analytics layer for ecosystem insights: product usage, token transparency metrics and platform health. Designed in the Technology page vision — implementation follows in a later phase.",
      status: "PLANNED",
      category: "PLATFORM",
      metrics: JSON.stringify([{ label: "Phase", value: "4 — Production" }]),
      featured: false,
      order: 1,
    },
    {
      slug: "market-intelligence",
      name: "Market Intelligence",
      division: "INTELLIGENCE",
      tagline: "From raw prices to contextual insight.",
      description:
        "Planned evolution of the Market Feed: historical context, on-chain transparency data and clearly-labeled derived metrics. Nothing fabricated — only data we can source.",
      status: "PLANNED",
      category: "TOOLING",
      metrics: JSON.stringify([{ label: "Depends on", value: "Market Feed" }]),
      featured: false,
      order: 2,
    },

    // COMMUNITY — live channels
    {
      slug: "community-hub",
      name: "TEKA Community Hub",
      division: "COMMUNITY",
      tagline: "The official channels of the TEKA community.",
      description:
        "Official Telegram and X channels for announcements, feedback and community discussion, plus direct contact with the founding team. Live today.",
      status: "LIVE",
      category: "COMMUNITY",
      metrics: JSON.stringify([
        { label: "Telegram", value: "@TEKAOfficial" },
        { label: "X", value: "@TEKAweb3" },
      ]),
      featured: true,
      order: 1,
    },
    {
      slug: "creator-program",
      name: "Creator Program",
      division: "COMMUNITY",
      tagline: "Building with the community, not just for it.",
      description:
        "Planned program for creators, developers and contributors shaping the ecosystem (Phase 3 — Community). Details will be published as the program is designed.",
      status: "PLANNED",
      category: "COMMUNITY",
      metrics: JSON.stringify([{ label: "Phase", value: "3 — Community" }]),
      featured: false,
      order: 2,
    },
  ];

  for (const p of products) await db.product.create({ data: p });

  // ─── Roadmap (whitepaper v1.0 §9 — the authoritative 5-phase plan) ──────────
  const roadmap = [
    {
      phase: "PHASE 01",
      title: "Foundation",
      description:
        "TEKA brand launch, official website, token contract development, whitepaper documentation and initial testnet deployment on Ethereum Sepolia.",
      status: "COMPLETED",
      period: "DONE",
      order: 1,
    },
    {
      phase: "PHASE 02",
      title: "Product",
      description:
        "Virtual digital products, subscription architecture, first ecosystem services and backend expansion — the platform you are using now is part of this phase.",
      status: "IN_PROGRESS",
      period: "IN PROGRESS",
      order: 2,
    },
    {
      phase: "PHASE 03",
      title: "Community",
      description:
        "Public documentation, community growth programs, partnerships and product feedback loops.",
      status: "PLANNED",
      period: "PLANNED",
      order: 3,
    },
    {
      phase: "PHASE 04",
      title: "Production",
      description:
        "Security review, final tokenomics, production blockchain deployment, liquidity strategy and TGE planning. No dates promised before audits pass.",
      status: "PLANNED",
      period: "PLANNED",
      order: 4,
    },
    {
      phase: "PHASE 05",
      title: "Ecosystem",
      description:
        "Additional products, integrations, subscription tiers and broader TEKA Token utility across the ecosystem.",
      status: "PLANNED",
      period: "PLANNED",
      order: 5,
    },
  ];
  for (const r of roadmap) await db.roadmapItem.create({ data: r });

  // ─── Platform changelog (genuine updates of this platform) ──────────────────
  const updates = [
    {
      title: "Platform v2 launched — full redesign",
      body: "TEKA Web was rebuilt from the ground up: cinematic hero, honest data policy, Command Center, ecosystem discovery and a consistent dark-gold design system.",
      type: "MILESTONE",
      version: "2.0.0",
    },
    {
      title: "Command Center is live",
      body: "A real operations dashboard with platform status, ecosystem statistics, live market feed and platform telemetry — powered by the new TEKA API.",
      type: "FEATURE",
      version: "2.0.0",
    },
    {
      title: "Honest presence telemetry",
      body: "Removed the 6× visitor-count inflation from the legacy site. TEKA now reports real, anonymous presence numbers only.",
      type: "IMPROVEMENT",
      version: "2.0.0",
    },
    {
      title: "Persistent storage layer",
      body: "Platform content, contact messages and presence sessions now persist in SQLite via Prisma — data survives restarts and deployments.",
      type: "FEATURE",
      version: "2.0.0",
    },
    {
      title: "Token transparency overhaul",
      body: "The placeholder contract address was removed. The only published contract is the Sepolia testnet deployment from Whitepaper v1.0, clearly labeled as testnet.",
      type: "IMPROVEMENT",
      version: "2.0.0",
    },
    {
      title: "Live market feed with transparent sourcing",
      body: "Market data is served from the CoinGecko public API with server-side caching, USD/IRR conversion and explicit availability states when upstream data is unreachable.",
      type: "FEATURE",
      version: "2.0.0",
    },
  ];
  for (const u of updates) await db.platformUpdate.create({ data: u });

  // ─── Verified metrics & clearly-labeled targets ─────────────────────────────
  const metrics = [
    { key: "total_supply", label: "Total Supply", value: "100,000,000", detail: "TEKA, fixed supply per Whitepaper v1.0", source: "VERIFIED", order: 1 },
    { key: "token_standard", label: "Token Standard", value: "ERC-20", detail: "Ethereum, 18 decimals", source: "VERIFIED", order: 2 },
    { key: "network_testnet", label: "Test Network", value: "Sepolia", detail: "Development contract deployed (testnet only)", source: "VERIFIED", order: 3 },
    { key: "network_mainnet", label: "Mainnet", value: "Not deployed", detail: "No verified mainnet contract exists", source: "VERIFIED", order: 4 },
    { key: "whitepaper", label: "Whitepaper", value: "v1.0", detail: "Published in the repository", source: "VERIFIED", order: 5 },
    { key: "api_endpoints", label: "API Endpoints", value: "9", detail: "REST, validated + rate-limited", source: "VERIFIED", order: 6 },
    { key: "divisions", label: "Ecosystem Divisions", value: "6", detail: "Products, Labs, Intelligence, Technology, Web3, Community", source: "VERIFIED", order: 7 },
    { key: "uptime_target", label: "Uptime Target", value: "99.9%", detail: "Design target — not a measured SLA", source: "DESIGN_TARGET", order: 8 },
    { key: "global_access", label: "Global Access", value: "Worldwide", detail: "Platform available globally, English + Persian market pricing", source: "VERIFIED", order: 9 },
  ];
  for (const m of metrics) await db.metric.create({ data: m });

  const counts = {
    products: await db.product.count(),
    roadmap: await db.roadmapItem.count(),
    updates: await db.platformUpdate.count(),
    metrics: await db.metric.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
