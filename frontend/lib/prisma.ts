import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// @ts-ignore - PrismaClient constructor type issue
export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
