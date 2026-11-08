/**
 * TEKA — single source of truth for brand facts.
 * Everything here is either verified (repository / whitepaper v1.0)
 * or explicitly labeled as a target. No invented data.
 */

export const TEKA = {
  name: "TEKA",
  tagline: "Building The Future Of Digital Technology",
  brandStatement:
    "TEKA is a technology ecosystem focused on digital innovation, advanced technology, and next-generation digital experiences.",
  description:
    "An independent technology initiative building digital products, emerging technology and future-oriented experiences.",
  foundedYear: 2025,
  whitepaperVersion: "v1.0",
} as const;

export const SOCIALS = {
  telegram: "https://t.me/TEKAOfficial",
  x: "https://x.com/TEKAweb3",
  github: "https://github.com/mhmdsdqi87-cloud",
  email: "mhmdsdqi87@gmail.com",
} as const;

export const TEAM = [
  { name: "Mohammad Sadeghi", role: "Founder & Creator", link: SOCIALS.github },
  { name: "Raouf Nemati", role: "Media Director", link: null },
] as const;

/** Tokenomics per Whitepaper v1.0 §6 — the 6-bucket allocation (sums to 100M). */
export const TOKENOMICS = [
  { id: "ecosystem", label: "Ecosystem & Community", percent: 40, tokens: 40_000_000, color: "#E3B855" },
  { id: "development", label: "Development & Technology", percent: 20, tokens: 20_000_000, color: "#F2F2F0" },
  { id: "liquidity", label: "Liquidity", percent: 15, tokens: 15_000_000, color: "#9BA3AE" },
  { id: "marketing", label: "Marketing & Growth", percent: 10, tokens: 10_000_000, color: "#B08D3E" },
  { id: "team", label: "Team & Founders", percent: 10, tokens: 10_000_000, color: "#6E7683" },
  { id: "reserve", label: "Reserve", percent: 5, tokens: 5_000_000, color: "#43484F" },
] as const;

export const TOKEN = {
  name: "TEKA",
  symbol: "TEKA",
  standard: "ERC-20",
  decimals: 18,
  totalSupply: 100_000_000,
  network: "Ethereum",
  /**
   * Only published contract — Sepolia TESTNET deployment, Whitepaper v1.0 §5.
   * It is explicitly "a testnet implementation and not a production-market deployment".
   */
  testnet: {
    network: "Sepolia Testnet",
    chainId: 11155111,
    chainIdHex: "0xaa36a7",
    address: "0xf4B93222d36303A7eb30218a350cc0cA094D53DB",
    explorer: "https://sepolia.etherscan.io",
  },
  mainnet: null as null | { address: string }, // No verified mainnet deployment exists.
  tradeable: false,
} as const;

export const FAQ = [
  {
    q: "What is TEKA?",
    a: "TEKA is an independent technology ecosystem focused on digital innovation — building digital products, tools, blockchain infrastructure and future-oriented digital experiences.",
  },
  {
    q: "Is the TEKA Token live and tradeable?",
    a: "No. A development contract exists on the Ethereum Sepolia testnet only. There is no mainnet deployment, no exchange listings and no liquidity yet. Any claim otherwise would be false — TEKA will never present a testnet contract as a production token.",
  },
  {
    q: "What is the total supply of TEKA?",
    a: "100,000,000 TEKA, fixed. Allocation: 40% Ecosystem & Community, 20% Development & Technology, 15% Liquidity, 10% Marketing & Growth, 10% Team & Founders, 5% Reserve.",
  },
  {
    q: "How will TEKA be used?",
    a: "Per the whitepaper, TEKA is a utility token intended to power access to virtual digital products, subscription-based services and ecosystem experiences as those products ship in Phase 2 and beyond.",
  },
  {
    q: "Where can I read the details?",
    a: "The TEKA Whitepaper v1.0 is published in the official GitHub repository, including the testnet contract address, roadmap and risk disclaimers.",
  },
] as const;

export const PRODUCT_DIVISIONS = [
  {
    id: "TECHNOLOGY",
    name: "TEKA Technology",
    code: "T-01",
    description:
      "The core platform: the TEKA web experience, the Command Center and the API layer that powers every live surface of the ecosystem.",
  },
  {
    id: "WEB3",
    name: "TEKA Web3",
    code: "W-02",
    description:
      "Blockchain infrastructure and the TEKA Token — developed transparently on the Sepolia testnet before any production step.",
  },
  {
    id: "PRODUCTS",
    name: "TEKA Products",
    code: "P-03",
    description:
      "Digital products, tools and subscription services planned for Phase 2 — designed as the utility layer of the ecosystem.",
  },
  {
    id: "LABS",
    name: "TEKA Labs",
    code: "L-04",
    description:
      "Experimental projects and visual/interaction R&D. Labs work ships as experiments — clearly labeled, never overpromised.",
  },
  {
    id: "INTELLIGENCE",
    name: "TEKA Intelligence",
    code: "I-05",
    description:
      "Data & analytics initiatives that turn ecosystem and market data into transparent, useful insight.",
  },
  {
    id: "COMMUNITY",
    name: "TEKA Community",
    code: "C-06",
    description:
      "The people around the ecosystem: official channels, creator programs and direct access to the founding team.",
  },
] as const;

export type DivisionId = (typeof PRODUCT_DIVISIONS)[number]["id"];

export const PRODUCT_STATUS = {
  LIVE: { label: "LIVE", tone: "gold" },
  DEVELOPMENT: { label: "IN DEVELOPMENT", tone: "silver" },
  PLANNED: { label: "PLANNED", tone: "muted" },
  EXPERIMENTAL: { label: "EXPERIMENTAL", tone: "outline" },
} as const;

export type ProductStatus = keyof typeof PRODUCT_STATUS;
