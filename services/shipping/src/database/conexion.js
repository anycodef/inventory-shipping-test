import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma para evitar múltiples conexiones en desarrollo
const prisma = global.prisma || new PrismaClient({
  log: ["warn", "error"],
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;