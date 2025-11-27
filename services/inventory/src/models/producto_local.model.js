import prisma from "../database/conexion.js";

export const upsertProductoAlmacen = async (id_local, id_producto, stock_disponible) => {
    const id_almacen = parseInt(id_local);
    const id_prod = parseInt(id_producto);
    const stock = parseInt(stock_disponible);

    const existing = await prisma.productoAlmacen.findFirst({
        where: { id_almacen, id_producto: id_prod },
    });

    if (existing) {
        // Actualizar stock existente
        return prisma.productoAlmacen.update({
            where: { id: existing.id },
            data: { stock_disponible: stock },
        });
    } else {
        // Crear nueva relación
        return prisma.productoAlmacen.create({
            data: {
                id_almacen,
                id_producto: id_prod,
                stock_disponible: stock,
            },
        });
    }
};
