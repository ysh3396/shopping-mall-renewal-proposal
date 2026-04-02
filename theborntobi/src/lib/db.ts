import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getRuntimeDatabaseUrl() {
  const direct = process.env.DIRECT_DATABASE_URL;
  if (direct) return direct;

  const pooled = process.env.DATABASE_URL;
  if (!pooled) {
    throw new Error("DATABASE_URL is not set");
  }

  return pooled.replace(/\?pgbouncer=true&connection_limit=1$/, "");
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getRuntimeDatabaseUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
