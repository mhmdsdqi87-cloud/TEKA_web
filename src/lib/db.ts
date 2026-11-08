import { PrismaClient } from "@prisma/client";

/**
 * Fail-soft database access.
 *
 * The client is constructed defensively so environments without DATABASE_URL
 * (e.g. serverless previews / fresh CI) can still import this module at build
 * time. Any query on a missing database throws a recognizable
 * "TEKA_DB_UNAVAILABLE" error, which the API route handlers already catch and
 * translate into honest, labeled fallback responses — no crashes, no fake data.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient | undefined {
  try {
    // Explicit datasource URL (with a sensible default) so construction never
    // explodes when DATABASE_URL is absent — failures surface at query time,
    // where every route is wrapped in try/catch.
    return new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL ?? "file:./db/custom.db" },
      },
      log: ["error"],
    });
  } catch {
    return undefined;
  }
}

/** A PrismaClient-shaped stub whose every property/call throws a known error. */
function unavailableStub(): PrismaClient {
  const make = (): PrismaClient => {
    const fn = function throwable() {
      throw new Error("TEKA_DB_UNAVAILABLE");
    };
    return new Proxy(fn, {
      get: (_target, prop) => {
        if (prop === "then") return undefined; // never look like a promise
        return make();
      },
      apply: () => {
        throw new Error("TEKA_DB_UNAVAILABLE");
      },
    }) as unknown as PrismaClient;
  };
  return make();
}

const client = globalForPrisma.prisma ?? createClient();

export const db: PrismaClient = client ?? unavailableStub();

if (process.env.NODE_ENV !== "production" && client) {
  globalForPrisma.prisma = client;
}
