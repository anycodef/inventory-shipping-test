import { getProductosConStock, getCategoriasProducto, getStockPorProducto, getStockPorAlmacen } from "../models/producto_stock.model.js";

export const obtenerStockGlobal = async (req, res) => {
    try {
        const { PageNumber = 1, PageSize = 5, Categoria = "" } = req.query;
        const data = await getProductosConStock(Number(PageNumber), Number(PageSize), encodeURIComponent(Categoria));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener el stock global de productos",
        });
    }
};

export const obtenerCategoriasProducto = async (req, res) => {
    try {
        const categorias = await getCategoriasProducto();
        res.json({
            success: true,
            data: categorias,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las categorías de productos",
        });
    }
};

export const obtenerStockPorProducto = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const { PageNumber = 1, PageSize = 5 } = req.query;

        const data = await getStockPorProducto(Number(id_producto), Number(PageNumber), Number(PageSize));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener el stock del producto",
        });
    }
};

export const obtenerStockPorAlmacen = async (req, res) => {
    try {
        const { id_almacen } = req.params;
        const { PageNumber = 1, PageSize = 5 } = req.query;

        const data = await getStockPorAlmacen(Number(id_almacen), Number(PageNumber), Number(PageSize));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener el stock por almacén",
        });
    }
};