import { db } from "@/lib/db";
import { ok, fail } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

/** GET /api/roadmap — milestone phases with honest statuses. */
export async function GET() {
  try {
    const items = await db.roadmapItem.findMany({ orderBy: { order: "asc" } });
    return ok({ count: items.length, phases: items });
  } catch {
    return fail(500, "ROADMAP_FAILED", "Unable to load roadmap");
  }
}
