import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import CarrierController from "../controllers/carrier.controller.js";


const carrierController = new CarrierController(prisma);

router.get("/", carrierController.getAllCarriers.bind(carrierController));
router.post("/", carrierController.createCarrier.bind(carrierController));
router.get("/paginated", carrierController.getAllCarriersPaginated.bind(carrierController));

router.route("/:id")
    .get(carrierController.getCarrierById.bind(carrierController))
    .put(carrierController.updateCarrier.bind(carrierController))
    .delete(carrierController.deleteCarrier.bind(carrierController));
    

export default router;