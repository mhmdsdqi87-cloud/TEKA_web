import { db } from "@/lib/db";
import { ok, fail } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

/** GET /api/health — liveness of the API and its storage layer. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return ok({
      status: "healthy",
      api: "online",
      database: "online",
      features: ["platform_status", "ecosystem_data", "presence", "market_data", "contact_intake"],
      time: new Date().toISOString(),
    });
  } catch {
    return fail(503, "DB_UNAVAILABLE", "Storage layer is unreachable");
  }
}
