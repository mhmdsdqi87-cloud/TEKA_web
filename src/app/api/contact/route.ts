import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, clientKey, rateLimit, readJson } from "@/lib/teka/api-utils";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  topic: z.enum(["GENERAL", "PARTNERSHIP", "PRODUCT", "MEDIA", "SUPPORT"]),
  message: z.string().trim().min(10, "Message is too short").max(4000),
});

/** POST /api/contact — validated, rate-limited, persisted contact intake. */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "contact"), 5, 10 * 60_000);
  if (!limit.allowed) {
    return fail(429, "RATE_LIMITED", "Too many messages — please wait a few minutes", {
      resetAt: new Date(limit.resetAt).toISOString(),
    });
  }

  const body = await readJson(req);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "VALIDATION_FAILED", "Check the highlighted fields", parsed.error.flatten().fieldErrors);
  }

  try {
    const saved = await db.contactMessage.create({ data: parsed.data });
    return ok(
      {
        id: saved.id,
        receivedAt: saved.createdAt,
        note: "Message stored. The team reads every submission.",
      },
      { status: 201 }
    );
  } catch {
    return fail(500, "CONTACT_FAILED", "Unable to store your message right now");
  }
}
