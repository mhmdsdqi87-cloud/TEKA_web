import { getMarket } from "@/lib/teka/market";
import { ok, fail, clientKey, rateLimit } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/market — live market data (CoinGecko) + USD/IRR reference rate.
 * availability: LIVE (fresh fetch) | CACHED (served from cache) | UNAVAILABLE (upstream down — no prices invented).
 */
export async function GET(req: Request) {
  const limit = rateLimit(clientKey(req, "market"), 30, 60_000);
  if (!limit.allowed) {
    return fail(429, "RATE_LIMITED", "Too many market requests — retry shortly", {
      resetAt: new Date(limit.resetAt).toISOString(),
    });
  }
  try {
    const market = await getMarket();
    return ok(market);
  } catch {
    return fail(502, "MARKET_FAILED", "Market service could not produce a payload");
  }
}
