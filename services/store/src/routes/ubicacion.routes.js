import express from "express";
const router = express.Router();
import UbicacionController from "../controllers/ubicacion.controller.js";
import prisma from "../database/conexion.js";

const ubicacionController = new UbicacionController(prisma);

router.get('/ubicacion/departamentos', ubicacionController.getDepartamentos.bind(ubicacionController));
router.get('/ubicacion/provincias', ubicacionController.getProvincias.bind(ubicacionController));
router.get('/ubicacion/distritos', ubicacionController.getDistritos.bind(ubicacionController));

export default router;