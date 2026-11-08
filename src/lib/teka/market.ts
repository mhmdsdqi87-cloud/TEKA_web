/**
 * Market data service.
 * - Prices: CoinGecko public API (server-side, cached 60s)
 * - USD→IRR rate: open.er-api.com (cached 1h) — labeled with fetch time
 * - On upstream failure the service degrades gracefully and reports
 *   availability "UNAVAILABLE" — the UI never invents prices.
 */

export type CoinQuote = {
  id: string;
  symbol: string;
  name: string;
  usd: number;
  change24h: number | null;
  usd24hVolume: number | null;
  history: number[];
};

export type MarketPayload = {
  availability: "LIVE" | "CACHED" | "UNAVAILABLE";
  source: string;
  fetchedAt: string;
  fx: { usdToIrr: number | null; irrLabel: string; source: string } | null;
  coins: CoinQuote[];
};

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
] as const;

type CacheEntry<T> = { data: T; at: number };

const marketCache: { entry: CacheEntry<Omit<MarketPayload, "fx">> | null } = { entry: null };
const fxCache: { entry: CacheEntry<number> | null } = { entry: null };

const MARKET_TTL = 60_000;
const FX_TTL = 60 * 60_000;

async function fetchJson<T>(url: string, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function getFx(): Promise<{ usdToIrr: number | null; irrLabel: string; source: string }> {
  if (fxCache.entry && Date.now() - fxCache.entry.at < FX_TTL) {
    return {
      usdToIrr: fxCache.entry.data,
      irrLabel: `FX cached ${new Date(fxCache.entry.at).toISOString().slice(11, 16)} UTC`,
      source: "exchangerate-api.com (open endpoint)",
    };
  }
  try {
    const json = await fetchJson<{ rates?: Record<string, number> }>(
      "https://open.er-api.com/v6/latest/USD"
    );
    const irr = json?.rates?.IRR;
    if (typeof irr === "number" && irr > 0) {
      fxCache.entry = { data: Math.round(irr), at: Date.now() };
      return {
        usdToIrr: Math.round(irr),
        irrLabel: "Live reference rate",
        source: "exchangerate-api.com (open endpoint)",
      };
    }
    throw new Error("Missing IRR rate");
  } catch {
    return { usdToIrr: null, irrLabel: "Rate unavailable", source: "exchangerate-api.com (open endpoint)" };
  }
}

/** Primary source — CoinGecko public markets endpoint. */
async function fetchCoinGecko(): Promise<Omit<MarketPayload, "fx">> {
  const ids = COINS.map((c) => c.id).join(",");
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h&sparkline=false`;
  const rows = await fetchJson<
    Array<{
      id: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      total_volume: number | null;
    }>
  >(url);
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("Empty CoinGecko response");

  const byId = new Map(rows.map((r) => [r.id, r]));
  const coins: CoinQuote[] = COINS.map((c) => {
    const row = byId.get(c.id);
    return {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      usd: row?.current_price ?? 0,
      change24h: row?.price_change_percentage_24h ?? null,
      usd24hVolume: row?.total_volume ?? null,
      history: [],
    };
  });
  return {
    availability: "LIVE",
    source: "CoinGecko public API",
    fetchedAt: new Date().toISOString(),
    coins,
  };
}

const BINANCE_SYMBOLS: Record<string, string> = { bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  dogecoin: "DOGEUSDT",
};

/** Fallback source — Binance public 24h tickers (no key required). */
async function fetchBinance(): Promise<Omit<MarketPayload, "fx">> {
  const symbols = JSON.stringify(Object.values(BINANCE_SYMBOLS));
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
  const rows = await fetchJson<
    Array<{ symbol: string; lastPrice: string; priceChangePercent: string; quoteVolume: string }>
  >(url);
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("Empty Binance response");

  const bySymbol = new Map(rows.map((r) => [r.symbol, r]));
  const coins: CoinQuote[] = COINS.map((c) => {
    const row = bySymbol.get(BINANCE_SYMBOLS[c.id]);
    return {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      usd: row ? parseFloat(row.lastPrice) : 0,
      change24h: row ? parseFloat(row.priceChangePercent) : null,
      usd24hVolume: row ? parseFloat(row.quoteVolume) : null,
      history: [],
    };
  });
  return {
    availability: "LIVE",
    source: "Binance public API (fallback)",
    fetchedAt: new Date().toISOString(),
    coins,
  };
}

async function fetchMarket(): Promise<Omit<MarketPayload, "fx">> {
  if (marketCache.entry && Date.now() - marketCache.entry.at < MARKET_TTL) {
    return { ...marketCache.entry.data, availability: "CACHED", fetchedAt: new Date(marketCache.entry.at).toISOString() };
  }
  try {
    return await fetchCoinGecko();
  } catch {
    // Primary upstream failed (rate limit / outage) — try the fallback chain.
    const fallback = await fetchBinance();
    marketCache.entry = { data: { ...fallback, availability: "LIVE" }, at: Date.now() };
    return fallback;
  }
}

/** Track short in-memory history so the Command Center can draw sparklines. */
const historyStore = new Map<string, number[]>();

function pushHistory(coins: CoinQuote[]) {
  for (const coin of coins) {
    if (!coin.usd) continue;
    const arr = historyStore.get(coin.id) ?? [];
    arr.push(coin.usd);
    if (arr.length > 40) arr.shift();
    historyStore.set(coin.id, arr);
    coin.history = [...arr];
  }
}

export async function getMarket(): Promise<MarketPayload> {
  let core: Omit<MarketPayload, "fx">;
  try {
    core = await fetchMarket();
  } catch {
    if (marketCache.entry) {
      core = { ...marketCache.entry.data, availability: "CACHED", fetchedAt: new Date(marketCache.entry.at).toISOString() };
    } else {
      return {
        availability: "UNAVAILABLE",
        source: "CoinGecko public API",
        fetchedAt: new Date().toISOString(),
        fx: null,
        coins: COINS.map((c) => ({ ...c, usd: 0, change24h: null, usd24hVolume: null, history: [] })),
      };
    }
  }
  const coins = core.coins.map((c) => ({ ...c, history: [...(historyStore.get(c.id) ?? [])] }));
  pushHistory(coins);
  const fx = await getFx();
  return { ...core, coins, fx };
}
