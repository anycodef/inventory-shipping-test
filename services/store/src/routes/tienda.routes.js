import express from "express";
const router = express.Router();
import TiendaController from "../controllers/tienda.controller.js";
import prisma from "../database/conexion.js";

const tiendaController = new TiendaController(prisma);

router.get('/tiendas', tiendaController.getTiendas.bind(tiendaController));
router.post('/tiendas', tiendaController.createTienda.bind(tiendaController));

router.route('/tiendas/:id')
    .get(tiendaController.getTiendaById.bind(tiendaController))
    .put(tiendaController.updateTienda.bind(tiendaController))
    .delete(tiendaController.deleteTienda.bind(tiendaController));

export default router;