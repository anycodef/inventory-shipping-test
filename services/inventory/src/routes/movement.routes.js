import express from "express";
const router = express.Router();
import MovementController from "../controllers/movement.controller.js";
import prisma from "../database/conexion.js";

const movementController = new MovementController(prisma);

router.get('/', movementController.getAllMovements.bind(movementController))
router.post('/', movementController.createMovement.bind(movementController))

router.route('/:id')
    .get(movementController.getMovementById.bind(movementController))
    .put(movementController.updateMovement.bind(movementController))
    .delete(movementController.deleteMovement.bind(movementController))

//Rutas adicionales
router.get('/product/:id_producto_almacen', movementController.getMovementsByProducto.bind(movementController))
router.get('/tipo/:id_tipo', movementController.getMovementsByTipo.bind(movementController))

export default router;