import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import carrierRoutes from "./routes/carrier.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import cotizacionRoutes from "./routes/cotizacion.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;
app.use(cors());
app.use(express.json());


app.use("/api/carrier", carrierRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/cotizaciones", cotizacionRoutes);

app.get("/", (req, res) => {
  res.send("shipping Service is running ✅");
});

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "shipping" });
});

const HOST = "0.0.0.0"; // Escuchar en todas las interfaces (requerido por Cloud Run)

app.listen(PORT, HOST, () => {
  console.log(`🚀 Shipping Service running on http://${HOST}:${PORT}`);
});