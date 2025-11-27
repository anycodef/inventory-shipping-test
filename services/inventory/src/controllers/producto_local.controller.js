import { parseCSV } from "../utils/csvParser.js";
import { upsertProductoAlmacen } from "../models/producto_local.model.js";
import fs from "fs";

export const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Debe subir un archivo CSV." });
        }

        const filePath = req.file.path;
        const REQUIRED_HEADERS = ["id_local", "id_producto", "stock_disponible"];
        const rows = await parseCSV(filePath, REQUIRED_HEADERS);

        const results = [];

        for (const row of rows) {
            const { id_local, id_producto, stock_disponible } = row;

            if (!id_local || !id_producto || !stock_disponible) continue;

            const updated = await upsertProductoAlmacen(id_local, id_producto, stock_disponible);
            results.push(updated);
        }

        fs.unlinkSync(filePath); // elimina el archivo temporal

        res.json({
            message: "Archivo procesado correctamente.",
            total: results.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al procesar el archivo.", error: error.message });
    }
};
