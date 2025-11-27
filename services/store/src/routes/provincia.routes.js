import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import ProvinciaController from "../controllers/provincia.controller.js";

const provinciaController = new ProvinciaController(prisma);

// Obtener todas las provincias
router.get('/', provinciaController.getProvincias.bind(provinciaController));
router.post('/', provinciaController.createProvincia.bind(provinciaController));

// Obtener provincias por departamento
router.get('/departamento/:departamentoId', provinciaController.getProvinciasByDepartamento.bind(provinciaController));

router.route('/:id')
    .get(provinciaController.getProvinciaById.bind(provinciaController))
    .put(provinciaController.updateProvincia.bind(provinciaController))
    .delete(provinciaController.deleteProvincia.bind(provinciaController));

export default router;