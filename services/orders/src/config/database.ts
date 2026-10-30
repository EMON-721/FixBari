import { PrismaClient } from "@local-services/database";

export const prisma = new PrismaClient();

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
