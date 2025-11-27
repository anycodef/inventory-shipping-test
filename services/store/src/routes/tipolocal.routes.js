import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import TipoLocalController from "../controllers/tipolocal.controller.js";

const tipoLocalController = new TipoLocalController(prisma);

// Obtener todos los tipos de locales
router.get('/', tipoLocalController.getTiposLocal.bind(tipoLocalController));
router.post('/', tipoLocalController.createTipoLocal.bind(tipoLocalController));

router.route('/:id')
    .get(tipoLocalController.getTipoLocalById.bind(tipoLocalController))
    .put(tipoLocalController.updateTipoLocal.bind(tipoLocalController))
    .delete(tipoLocalController.deleteTipoLocal.bind(tipoLocalController));
// Crear un nuevo tipo de local
export default router;