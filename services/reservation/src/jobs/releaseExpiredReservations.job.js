import cron from "node-cron";
import prisma from "../database/conexion.js";
import InventoryServiceClient from "../services/inventoryClient.js";

const ACTIVE_STATE_NAMES = ["PENDING", "CONFIRMED"];
const EXPIRED_STATE_NAME = "EXPIRED";
const DEFAULT_CRON_EXPRESSION = "0 0 * * *"; // Every day at 00:00
const DEFAULT_TIMEZONE =
  process.env.RELEASE_EXPIRED_RESERVATIONS_TZ || "America/Lima";

async function getStateIds(prismaClient) {
  const estados = await prismaClient.estadoReserva.findMany({
    where: {
      nombre: {
        in: [...ACTIVE_STATE_NAMES, EXPIRED_STATE_NAME],
      },
    },
  });

  const stateMap = estados.reduce((acc, estado) => {
    acc[estado.nombre] = estado.id;
    return acc;
  }, {});

  const missingStates = [...ACTIVE_STATE_NAMES, EXPIRED_STATE_NAME].filter(
    (stateName) => !stateMap[stateName]
  );

  if (missingStates.length) {
    throw new Error(
      `Missing reservation states in database: ${missingStates.join(", ")}`
    );
  }

  return {
    expired: stateMap[EXPIRED_STATE_NAME],
    actives: ACTIVE_STATE_NAMES.map((name) => stateMap[name]),
  };
}

export async function releaseExpiredReservations({
  prismaClient = prisma,
  inventoryClient = new InventoryServiceClient(),
  logger = console,
} = {}) {
  const now = new Date();
  const { expired, actives } = await getStateIds(prismaClient);

  const expiredReservations = await prismaClient.reserva.findMany({
    where: {
      fecha_expiracion: {
        lt: now,
      },
      id_estado: {
        in: actives,
      },
    },
    orderBy: {
      fecha_expiracion: "asc",
    },
  });

  if (!expiredReservations.length) {
    logger.info("[ReleaseExpiredJob] No expired reservations found");
    return { totalExpired: 0, released: 0 };
  }

  logger.info(
    `[ReleaseExpiredJob] Found ${expiredReservations.length} expired reservations`
  );

  let released = 0;

  for (const reserva of expiredReservations) {
    try {
      if (reserva.stock_reservado > 0) {
        await inventoryClient.releaseReservedStock(
          reserva.id_stock_producto,
          reserva.stock_reservado
        );
        released += 1;
      } else {
        logger.info(
          `[ReleaseExpiredJob] Reservation ${reserva.id} has no reserved stock`
        );
      }

      await prismaClient.reserva.update({
        where: { id: reserva.id },
        data: { id_estado: expired },
      });
    } catch (error) {
      logger.error(
        `[ReleaseExpiredJob] Failed processing reservation ${reserva.id}: ${error.message}`
      );
    }
  }

  logger.info(
    `[ReleaseExpiredJob] Released stock for ${released} reservations out of ${expiredReservations.length}`
  );

  return {
    totalExpired: expiredReservations.length,
    released,
  };
}

export function scheduleReleaseExpiredReservationsJob({
  cronExpression = process.env.RELEASE_EXPIRED_RESERVATIONS_CRON ||
    DEFAULT_CRON_EXPRESSION,
  timezone = DEFAULT_TIMEZONE,
  prismaClient = prisma,
  inventoryClient,
  logger = console,
  runOnInit = process.env.RUN_RELEASE_EXPIRED_ON_START === "true",
} = {}) {
  const client = inventoryClient || new InventoryServiceClient();

  logger.info(
    `[ReleaseExpiredJob] Scheduling cron ${cronExpression} (tz: ${timezone})`
  );

  const task = cron.schedule(
    cronExpression,
    async () => {
      try {
        await releaseExpiredReservations({
          prismaClient,
          inventoryClient: client,
          logger,
        });
      } catch (error) {
        logger.error(
          `[ReleaseExpiredJob] Unexpected error running cron: ${error.message}`
        );
      }
    },
    {
      scheduled: true,
      timezone,
    }
  );

  if (runOnInit) {
    releaseExpiredReservations({
      prismaClient,
      inventoryClient: client,
      logger,
    }).catch((error) =>
      logger.error(
        `[ReleaseExpiredJob] Initial execution failed: ${error.message}`
      )
    );
  }

  return task;
}
