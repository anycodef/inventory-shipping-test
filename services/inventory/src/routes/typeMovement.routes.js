import express from "express";
const router = express.Router();
import TypeMovementController from "../controllers/typeMovement.controller.js";
import prisma from "../database/conexion.js";
const typeMovementController = new TypeMovementController(prisma);

router.get("/", typeMovementController.getAllTypeMovement.bind(typeMovementController));
router.post("/", typeMovementController.createTypeMovement.bind(typeMovementController));

router.route("/:id")
    .get(typeMovementController.getTypeMovementById.bind(typeMovementController))
    .put(typeMovementController.updateTypeMovement.bind(typeMovementController))
    .delete(typeMovementController.deleteTypeMovement.bind(typeMovementController));

export default router;