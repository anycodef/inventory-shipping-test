import prisma from "../database/conexion.js";
import InventoryServiceClient from "../services/inventoryClient.js";
import { releaseExpiredReservations } from "../jobs/releaseExpiredReservations.job.js";

async function main() {
  const inventoryClient = new InventoryServiceClient();
  try {
    const result = await releaseExpiredReservations({
      prismaClient: prisma,
      inventoryClient,
    });
    console.log(
      `[ManualRelease] Completed. Total expired: ${result.totalExpired}, released: ${result.released}`
    );
  } catch (error) {
    console.error("[ManualRelease] Failed to release reservations:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
