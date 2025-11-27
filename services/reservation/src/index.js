import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import reservationRoutes from "./routes/reservation.routes.js";
import stateReservationRoutes from "./routes/stateReservation.routes.js";
import { scheduleReleaseExpiredReservationsJob } from "./jobs/releaseExpiredReservations.job.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;
app.use(cors());
app.use(express.json());

// Rutas en español
app.use("/api/reservas", reservationRoutes);
app.use("/api/estado", stateReservationRoutes);

app.get("/", (req, res) => {
  res.send("Servicio de Reservas corriendo en el puerto " + PORT + " ✅");
});

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "reservation" });
});

const HOST = "0.0.0.0"; // Escuchar en todas las interfaces (requerido por Cloud Run)

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servicio de Reservas corriendo en http://${HOST}:${PORT}`);
});

// Programar liberación diaria de reservas expiradas
scheduleReleaseExpiredReservationsJob();
