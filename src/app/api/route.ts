import { TEKA } from "@/lib/teka/config";
import { ok } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

/** GET /api — service banner */
export async function GET() {
  return ok({
    service: `${TEKA.name} API`,
    version: "2.0.0",
    status: "online",
    endpoints: [
      "GET /api/health",
      "GET /api/status",
      "GET /api/stats",
      "GET /api/products",
      "GET /api/roadmap",
      "GET /api/updates",
      "GET /api/market",
      "GET|POST /api/presence",
      "POST /api/contact",
    ],
    time: new Date().toISOString(),
  });
}
