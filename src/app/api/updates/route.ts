import { db } from "@/lib/db";
import { ok, fail } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

/** GET /api/updates — platform changelog (newest first). */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitRaw = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitRaw) || 10, 1), 50);
    const updates = await db.platformUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return ok({ count: updates.length, updates });
  } catch {
    return fail(500, "UPDATES_FAILED", "Unable to load platform updates");
  }
}
