import prisma from "../database/conexion.js";
import { getStockEstadoGlobal, getStockEstado } from "../utils/stockHelper.js";
import axios from "axios";
import { getLocalBasico } from "../utils/local.service.js";
import { getProductoBasico } from "../utils/producto.service.js";

// ruta del servicio 1 (productos)
const PRODUCTOS_API = "https://catalogo-service-dcc3a7dgbja8b6dd.canadacentral-01.azurewebsites.net/api";

export const getProductosConStock = async (page = 1, perPage = 5, categoria = "") => {

    // Construimos la URL base
    let url = `${PRODUCTOS_API}/productos/listado?PageNumber=${page}&PageSize=${perPage}`;

    // Solo agregamos 'Categoria' si no está vacía
    if (categoria && categoria.trim() !== "") {
        url += `&Categoria=${encodeURIComponent(categoria.trim())}`;
    }

    // 1️⃣ Traer productos del servicio 1
    const resp = await axios.get(url);
    const productos = resp.data?.data || [];

    const pagination = {
        total: resp.data?.total ?? 0,
        page: resp.data?.currentPage ?? 1,
        per_page: resp.data?.itemsPerPage ?? 10,
        total_pages: resp.data?.totalPages ?? 1
    };

    if (productos.length === 0) {
        return {
            success: true,
            data: [],
            pagination
        };
    }

    // 2️⃣ Obtener el stock total de TODOS los productos en una sola consulta
    const stockGlobal = await prisma.productoAlmacen.groupBy({
        by: ["id_producto"],
        _sum: {
            stock_disponible: true,
            stock_reservado: true,
        },
    });

    // 3️⃣ Convertir los resultados en un mapa para acceso rápido
    const stockMap = new Map(
        stockGlobal.map((s) => [
            s.id_producto,
            {
                disponible: s._sum.stock_disponible || 0,
                reservado: s._sum.stock_reservado || 0,
            },
        ])
    );

    // 4️⃣ Armar la respuesta final fusionando catálogo + stock
    const productosConStock = productos.map((prod) => {
        const stock = stockMap.get(prod.id) || { disponible: 0, reservado: 0 };
        const stk_disponible_total = stock.disponible;
        const stk_reservado_total = stock.reservado;

        return {
            id: prod.id,
            nombre: prod.nombre,
            imagen: prod.imagen,
            stk_disponible_global: stk_disponible_total,
            stk_reservado_global: stk_reservado_total,
            stk_total_global: stk_disponible_total + stk_reservado_total,
            stk_estado_global: getStockEstadoGlobal(stk_disponible_total),
        };
    });

    return {
        success: true,
        data: productosConStock,
        pagination
    };
};

export const getCategoriasProducto = async () => {
    const url = `${PRODUCTOS_API}/atributos/1`;
    const resp = await axios.get(url);

    const categorias = resp.data.atributoValores.map((item) => ({
        id: item.id,
        nombre: item.valor
    }));

    return categorias;
}

export const getStockPorProducto = async (id_producto, page = 1, perPage = 5) => {
    // 1️⃣ Contar total de locales que tienen ese producto
    const total = await prisma.productoAlmacen.count({
        where: { id_producto },
    });

    if (total === 0) {
        return {
            success: true,
            data: [],
            pagination: { total: 0, page, per_page: perPage, total_pages: 0 },
        };
    }

    // 2️⃣ Obtener registros con paginación
    const productosAlmacen = await prisma.productoAlmacen.findMany({
        where: { id_producto },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { id_almacen: "asc" },
    });

    // 3️⃣ Obtener info de los locales desde el servicio externo (en paralelo)
    const localesPromises = productosAlmacen.map(pa => getLocalBasico(pa.id_almacen));
    const localesInfo = await Promise.all(localesPromises);

    // 4️⃣ Armar la respuesta combinando los datos
    const data = productosAlmacen.map((pa, i) => {
        const local = localesInfo[i] || { nombre: "Desconocido", imagen: "" };
        const disponible = pa.stock_disponible;
        const reservado = pa.stock_reservado;
        const total = disponible + reservado;

        return {
            id_almacen: pa.id_almacen,
            local: local.nombre,     // 👈 cambiamos a “local” en la respuesta
            imagen: local.imagen,
            stk_disponible: disponible,
            stk_reservado: reservado,
            stk_total: total,
            stk_estado: getStockEstado(disponible),
        };
    });

    // 5️⃣ Paginación
    const pagination = {
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
    };

    return { success: true, data, pagination };
};

export const getStockPorAlmacen = async (id_almacen, page = 1, perPage = 5) => {
    const total = await prisma.productoAlmacen.count({
        where: { id_almacen },
    });

    if (total === 0) {
        return {
            success: true,
            data: [],
            pagination: { total: 0, page, per_page: perPage, total_pages: 0 },
        };
    }

    const productosAlmacen = await prisma.productoAlmacen.findMany({
        where: { id_almacen },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { id_producto: "asc" },
    });

    // 🔹 Obtener datos básicos de productos en paralelo
    const productosInfo = await Promise.all(
        productosAlmacen.map((pa) => getProductoBasico(pa.id_producto))
    );

    // 🔹 Información del local (para posibles logs o referencias)
    const localInfo = await getLocalBasico(id_almacen);

    const data = productosAlmacen.map((pa, i) => {
        const prod = productosInfo[i];
        const disponible = pa.stock_disponible;
        const reservado = pa.stock_reservado;
        const total = disponible + reservado;

        return {
            id_producto: pa.id_producto,
            producto: prod.nombre,
            imagen: prod.imagen,
            stk_disponible: disponible,
            stk_reservado: reservado,
            stk_total: total,
            stk_estado: getStockEstadoGlobal(disponible),
        };
    });

    const pagination = {
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
    };

    return { success: true, data, pagination };
};