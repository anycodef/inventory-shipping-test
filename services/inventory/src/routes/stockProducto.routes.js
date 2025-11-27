import express from "express";
const router = express.Router();
import StockProductController from "../controllers/stockProduct.controller.js";
import prisma from "../database/conexion.js";
const stockProductController = new StockProductController(prisma);

// Ruta para obtener stock de múltiples productos (debe ir antes de las rutas genéricas)
router.post('/bulk', stockProductController.getStockByProducts.bind(stockProductController))

router.get('/', stockProductController.getAllStockProducts.bind(stockProductController))
router.post('/', stockProductController.createStockProduct.bind(stockProductController))

router.route('/:id')
    .get(stockProductController.getStockProductById.bind(stockProductController))
    .put(stockProductController.updateStockProduct.bind(stockProductController))
    .delete(stockProductController.deleteStockProduct.bind(stockProductController))

// Ruta adicional: Obtener movimientos de un stock específico
router.get('/:stockId/movimientos', stockProductController.getMovementsByStock.bind(stockProductController))

export default router;  