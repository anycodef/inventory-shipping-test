import express from "express";
import { obtenerStockGlobal, obtenerCategoriasProducto, obtenerStockPorProducto, obtenerStockPorAlmacen } from "../controllers/producto_stock.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadCSV } from "../controllers/producto_local.controller.js";

const router = express.Router();

router.get("/", obtenerStockGlobal);
router.get("/categorias", obtenerCategoriasProducto);
router.get("/almacen/:id_almacen", obtenerStockPorAlmacen);
router.post("/upload-csv", upload.single("file"), uploadCSV)
router.get("/:id_producto", obtenerStockPorProducto);

export default router;
