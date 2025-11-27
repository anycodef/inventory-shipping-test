import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import stockProductRoutes from "./routes/stockProducto.routes.js";
import movementRoutes from "./routes/movement.routes.js";
import typeMovementRoutes from "./routes/typeMovement.routes.js";
import productoStockRoutes from "./routes/producto_stock.routes.js";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4001;

app.use(express.json());

// Rutas
app.use("/api/stock", stockProductRoutes);
app.use("/api/productos", productoStockRoutes);
app.use("/api/movimiento", movementRoutes);
app.use('/api/tipomovimiento', typeMovementRoutes);

app.get("/", (req, res) => {
    res.send("Inventory Service is running ✅");
});

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "inventory" });
});

const HOST = "0.0.0.0"; // Escuchar en todas las interfaces (requerido por Cloud Run)
// const HOST = "localhost"; // Para desarrollo local

app.listen(PORT, HOST, () => {
    console.log(`🚀 Inventory Service running on http://${HOST}:${PORT}`);
});
