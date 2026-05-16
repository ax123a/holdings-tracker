// Prisma client singleton — lazy so importing this module never instantiates
// PrismaClient. Build-time module evaluation (e.g. Next.js "Collecting page
// data") used to crash here when DATABASE_URL was absent and the runtime
// provider didn't need Prisma anyway. The Proxy defers `new PrismaClient()`
// until the first real call (`prisma.holder.findMany(...)`).

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let client: PrismaClient | null = null;

function getClient(): PrismaClient {
  if (client) return client;
  if (globalForPrisma.prisma) {
    client = globalForPrisma.prisma;
    return client;
  }
  client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
