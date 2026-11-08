import { db } from "@/lib/db";
import { ok, fail, clientKey, rateLimit, readJson } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

const WINDOW_MS = 45_000; // presence window — a session counts if seen within 45s

function cleanId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 64) return null;
  return trimmed;
}

/** GET /api/presence — the REAL number of active sessions in the last 45s. */
export async function GET() {
  try {
    const cutoff = new Date(Date.now() - WINDOW_MS);
    const active = await db.presenceSession.count({ where: { lastSeen: { gte: cutoff } } });
    return ok({
      active,
      displayed: active, // deliberately identical — no inflation multiplier, ever
      windowSeconds: WINDOW_MS / 1000,
      policy: "Anonymous session heartbeats. Real counts only.",
      time: new Date().toISOString(),
    });
  } catch {
    return fail(500, "PRESENCE_FAILED", "Unable to read presence data");
  }
}

/** POST /api/presence — heartbeat: upsert an anonymous session id. */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "presence"), 120, 60_000);
  if (!limit.allowed) {
    return fail(429, "RATE_LIMITED", "Presence heartbeats exceeded", {
      resetAt: new Date(limit.resetAt).toISOString(),
    });
  }
  try {
    const body = await readJson(req);
    const id = cleanId((body as { sessionId?: unknown } | null)?.sessionId);
    if (!id) return fail(400, "INVALID_SESSION", "sessionId is required (1–64 chars)");

    await db.presenceSession.upsert({
      where: { id },
      update: { lastSeen: new Date() },
      create: { id, lastSeen: new Date() },
    });

    // opportunistic cleanup of long-stale sessions
    await db.presenceSession.deleteMany({ where: { lastSeen: { lt: new Date(Date.now() - 3_600_000) } } });

    const active = await db.presenceSession.count({
      where: { lastSeen: { gte: new Date(Date.now() - WINDOW_MS) } },
    });
    return ok({ active, displayed: active, windowSeconds: WINDOW_MS / 1000 });
  } catch {
    return fail(500, "PRESENCE_FAILED", "Unable to record presence");
  }
}
