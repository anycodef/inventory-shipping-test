import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import ShippingController from "../controllers/shipping.controller.js";

const shippingController = new ShippingController(prisma);

// Rutas específicas PRIMERO (antes de las rutas con parámetros dinámicos)
router.get('/status/expired', shippingController.getExpiredShippings.bind(shippingController));
router.get('/order/:id_orden', shippingController.getShippingsByOrder.bind(shippingController));

// Rutas generales
router.get('/', shippingController.getAllShipping.bind(shippingController));
router.post('/', shippingController.createShipping.bind(shippingController));

// Rutas con parámetros dinámicos AL FINAL
router.route('/:id')
    .get(shippingController.getShippingById.bind(shippingController))
    .put(shippingController.updateShipping.bind(shippingController))
    .delete(shippingController.deleteShipping.bind(shippingController));

// Ruta específica con parámetro
router.patch('/:id/status', shippingController.updateShippingStatus.bind(shippingController));

export default router;