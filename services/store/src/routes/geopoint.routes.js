import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import GeopointController from "../controllers/geopoint.controller.js";

const geopointController = new GeopointController(prisma);

// Obtener todos los geopoints
router.get('/', geopointController.getGeoPoints.bind(geopointController));
router.post('/', geopointController.createGeoPoint.bind(geopointController));

router.route('/:id')
    .get(geopointController.getGeoPointById.bind(geopointController))
    .put(geopointController.updateGeoPoint.bind(geopointController))
    .delete(geopointController.deleteGeoPoint.bind(geopointController));
// Crear un nuevo geopoint
export default router;