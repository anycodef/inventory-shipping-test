import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import DistritoController from "../controllers/distrito.controller.js";

const distritoController = new DistritoController(prisma);

// Obtener todos los distritos
router.get('/', distritoController.getDistritos.bind(distritoController));
router.post('/', distritoController.createDistrito.bind(distritoController));

// Obtener distritos por provincia
router.get('/provincia/:provinciaId', distritoController.getDistritosByProvincia.bind(distritoController));

router.route('/:id')
    .get(distritoController.getDistritoById.bind(distritoController))
    .put(distritoController.updateDistrito.bind(distritoController))
    .delete(distritoController.deleteDistrito.bind(distritoController));

export default router;