import express from "express";
const router = express.Router();
import AlmacenController from "../controllers/almacen.controller.js";
import prisma from "../database/conexion.js";

const almacenController = new AlmacenController(prisma);

router.get('/almacenes', almacenController.getAlmacenes.bind(almacenController));
router.post('/almacenes', almacenController.createAlmacen.bind(almacenController));

router.route('/almacenes/:id')
    .get(almacenController.getAlmacenById.bind(almacenController))
    .put(almacenController.updateAlmacen.bind(almacenController))
    .delete(almacenController.deleteAlmacen.bind(almacenController));

export default router;