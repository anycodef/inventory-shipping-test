import express from "express";
const router = express.Router();
import StateReservationController from "../controllers/stateReservation.controller.js";
import prisma from "../database/conexion.js";

const stateReservationController = new StateReservationController(prisma);

// Crear un nuevo estado
router.post("/", stateReservationController.createStateReservation.bind(stateReservationController));
router.get("/", stateReservationController.getAllStateReservation.bind(stateReservationController));

router.route("/:id")
  .get(stateReservationController.getStateReservationById.bind(stateReservationController))
  .put(stateReservationController.updateStateReservation.bind(stateReservationController))
  .delete(stateReservationController.deleteStateReservation.bind(stateReservationController));

export default router;