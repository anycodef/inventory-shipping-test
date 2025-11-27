import express from "express";
const router = express.Router();
import prisma from "../database/conexion.js";
import { upload } from "../middlewares/multer.middleware.js";
import LocalController, { downloadLocalesCSV, uploadLocalesCSV } from "../controllers/local.controller.js";

const localController = new LocalController(prisma);

// Obtener todos los locales
router.get('/', localController.getLocales.bind(localController));

// Crear un nuevo local
router.post('/', localController.createLocal.bind(localController));

// Obtener locales por tipo (CON PAGINACIÓN Y FILTROS)
router.get('/tipo/:id_tipo_local', localController.getLocalesByTipo.bind(localController));

// ========================================
// RUTAS PARA RELACIONES ALMACÉN-TIENDA
// ========================================

// Asignar almacén a tienda
router.post('/almacen-tienda', localController.asignarAlmacenATienda.bind(localController));

// Eliminar relación almacén-tienda
router.delete('/almacen-tienda/:id', localController.eliminarRelacionAlmacenTienda.bind(localController));

// Obtener tiendas abastecidas por un almacén
router.get('/almacen/:id_almacen/tiendas', localController.getTiendasDeAlmacen.bind(localController));

// Obtener almacenes que abastecen una tienda
router.get('/tienda/:id_tienda/almacenes', localController.getAlmacenesDeTienda.bind(localController));

// ========================================
// RUTAS CRUD DE LOCAL
// ========================================

router.route('/:id')
    .get(localController.getLocalById.bind(localController))
    .put(localController.updateLocal.bind(localController))
    .delete(localController.deleteLocal.bind(localController));

// ========================================
// RUTAS PARA CARGAR / DESCARGA DE CSV
// ========================================
router.get('/download-csv/:id_tipo_local', downloadLocalesCSV);
router.post('/upload-csv/:id_tipo_local', upload.single('file'), uploadLocalesCSV);

export default router;