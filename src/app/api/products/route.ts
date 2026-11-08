import { db } from "@/lib/db";
import { ok, fail } from "@/lib/teka/api-utils";
import { PRODUCT_DIVISIONS, PRODUCT_STATUS } from "@/lib/teka/config";

export const dynamic = "force-dynamic";

const VALID_DIVISIONS = PRODUCT_DIVISIONS.map((d) => d.id);
const VALID_STATUSES = Object.keys(PRODUCT_STATUS);

/** GET /api/products — ecosystem catalog with optional division/status/search filters. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const division = url.searchParams.get("division");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q");
    const featured = url.searchParams.get("featured");

    if (division && !VALID_DIVISIONS.includes(division)) {
      return fail(400, "INVALID_DIVISION", `division must be one of: ${VALID_DIVISIONS.join(", ")}`);
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return fail(400, "INVALID_STATUS", `status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const where: Record<string, unknown> = {};
    if (division) where.division = division;
    if (status) where.status = status;
    if (featured === "true") where.featured = true;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { tagline: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: [{ division: "asc" }, { order: "asc" }],
    });

    return ok({ count: products.length, products });
  } catch {
    return fail(500, "PRODUCTS_FAILED", "Unable to load ecosystem catalog");
  }
}
