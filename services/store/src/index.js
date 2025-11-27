import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Rutas de geografía (de Warehouse)
import departamentoRoutes from './routes/departamento.routes.js';
import provinciaRoutes from './routes/provincia.routes.js';
import distritoRoutes from './routes/distrito.routes.js';
import direccionRoutes from './routes/direccion.routes.js';
import geopointRoutes from './routes/geopoint.routes.js';
import tipolocalRoutes from './routes/tipolocal.routes.js';
import localRoutes from './routes/local.routes.js';

// Rutas existentes de Store
import ubicacionRoutes from './routes/ubicacion.routes.js';
import tiendaRoutes from './routes/tienda.routes.js';
import almacenRoutes from './routes/almacen.routes.js';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4005;

app.use(express.json());
// Registrar rutas de geografía
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/provincias', provinciaRoutes);
app.use('/api/distritos', distritoRoutes);
app.use('/api/direcciones', direccionRoutes);
app.use('/api/geopoints', geopointRoutes);
app.use('/api/tipolocales', tipolocalRoutes);
app.use('/api/locales', localRoutes);

// Rutas
app.use('/api', ubicacionRoutes);
app.use('/api', almacenRoutes);
app.use('/api', tiendaRoutes);

app.get("/", (req, res) => {
    res.send("Store Service is running ✅");
});

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "store" });
});

const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Store Service running on http://${HOST}:${PORT}`);
});
