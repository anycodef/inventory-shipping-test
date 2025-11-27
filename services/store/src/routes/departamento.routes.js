import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import DepartamentoController from "../controllers/departamento.controller.js";

const departamentoController = new DepartamentoController(prisma);

// Obtener todos los departamentos
router.get('/', departamentoController.getDepartamentos.bind(departamentoController));
router.post('/', departamentoController.createDepartamento.bind(departamentoController));

router.route('/:id')
    .get(departamentoController.getDepartamentoById.bind(departamentoController))
    .put(departamentoController.updateDepartamento.bind(departamentoController))
    .delete(departamentoController.deleteDepartamento.bind(departamentoController));

export default router;