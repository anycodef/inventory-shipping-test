import express from "express";
const router = express.Router();
import ReservationController from "../controllers/reservation.controller.js";
import prisma from "../database/conexion.js";

const reservationController = new ReservationController(prisma);

// Obtener reservas expiradas (debe ir antes de /:id)
router.get('/expiradas', reservationController.getExpiredReservations.bind(reservationController));

// Crear una nueva reserva desde el módulo de órdenes (debe ir antes de '/' para evitar conflictos)
router.post('/from-order', reservationController.createReservationFromOrder.bind(reservationController));

// Obtener todas las reservas (con filtrado y paginación)
router.get('/', reservationController.getAllReservation.bind(reservationController));

// Obtener una reserva por ID
router.get('/:id', reservationController.getReservationById.bind(reservationController));


// Crear una nueva reserva
router.post('/', reservationController.createReservation.bind(reservationController));

// Actualizar una reserva
router.put('/:id', reservationController.updateReservation.bind(reservationController));

// Eliminar una reserva
router.delete('/:id', reservationController.deleteReservation.bind(reservationController));

export default router;
