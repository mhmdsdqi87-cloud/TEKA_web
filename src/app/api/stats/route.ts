import { db } from "@/lib/db";
import { ok, fail } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

/** GET /api/stats — ecosystem statistics with explicit data-source labels. */
export async function GET() {
  try {
    const [products, live, development, planned, experimental, roadmapDone, roadmapTotal, updates, metrics] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { status: "LIVE" } }),
        db.product.count({ where: { status: "DEVELOPMENT" } }),
        db.product.count({ where: { status: "PLANNED" } }),
        db.product.count({ where: { status: "EXPERIMENTAL" } }),
        db.roadmapItem.count({ where: { status: "COMPLETED" } }),
        db.roadmapItem.count(),
        db.platformUpdate.count(),
        db.metric.findMany({ orderBy: { order: "asc" } }),
      ]);

    const divisions = await db.product.groupBy({ by: ["division"], _count: { division: true } });

    return ok({
      products: {
        total: products,
        byStatus: { live, development, planned, experimental },
        byDivision: divisions.map((d) => ({ division: d.division, count: d._count.division })),
      },
      roadmap: { total: roadmapTotal, completed: roadmapDone },
      changelog: { entries: updates },
      metrics: metrics.map((m) => ({
        key: m.key,
        label: m.label,
        value: m.value,
        detail: m.detail,
        source: m.source,
      })),
      time: new Date().toISOString(),
    });
  } catch {
    return fail(500, "STATS_FAILED", "Unable to compute ecosystem statistics");
  }
}
