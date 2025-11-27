import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import DireccionController from "../controllers/direccion.controller.js";

const direccionController = new DireccionController(prisma);

// Obtener todas las direcciones
router.get('/', direccionController.getDirecciones.bind(direccionController));
router.post('/', direccionController.createDireccion.bind(direccionController));

// Obtener direcciones por distrito
router.get('/distrito/:id_distrito', direccionController.getDireccionesByDistrito.bind(direccionController));

router.route('/:id')
    .get(direccionController.getDireccionById.bind(direccionController))
    .put(direccionController.updateDireccion.bind(direccionController))
    .delete(direccionController.deleteDireccion.bind(direccionController));

export default router;