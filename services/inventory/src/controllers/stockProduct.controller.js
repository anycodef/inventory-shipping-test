class StockProductController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.StockProducto = this.prisma.productoAlmacen;
    }

    async getAllStockProducts(req, res) {
        try {
            const { id_almacen, id_producto } = req.query;

            let whereClause = {};

            // Si se proporciona id_almacen, filtrar por ese almacén
            if (id_almacen) {
                whereClause.id_almacen = parseInt(id_almacen);
            }

            // Si se proporciona id_producto, filtrar por ese producto
            if (id_producto) {
                whereClause.id_producto = parseInt(id_producto);
            }

            // Buscar productos según los filtros
            const stockProducts = await this.StockProducto.findMany({
                where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
                include: {
                    movimiento: {
                        include: {
                            tipo_movimiento: true
                        }
                    }
                }
            });

            res.status(200).json(stockProducts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getStockProductById(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const stockProduct = await this.StockProducto.findUnique({
                where: { id: idNumerico },
                include: {
                    movimiento: {
                        include: {
                            tipo_movimiento: true
                        }
                    }
                }
            });

            if (!stockProduct) {
                return res.status(404).json({ message: "Producto en almacén no encontrado" });
            }

            res.status(200).json(stockProduct);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createStockProduct(req, res) {
        try {
            const { id_producto, id_almacen, stock_reservado, stock_disponible } = req.body;

            // Validación de campos requeridos
            if (!id_producto || !id_almacen) {
                return res.status(400).json({ 
                    message: "id_producto e id_almacen son requeridos" 
                });
            }

            // Validación de stocks (no pueden ser negativos)
            if (stock_reservado < 0 || stock_disponible < 0) {
                return res.status(400).json({ 
                    message: "Los stocks no pueden ser negativos" 
                });
            }

            const newStockProduct = await this.StockProducto.create({
                data: {
                    id_producto: parseInt(id_producto),
                    id_almacen: parseInt(id_almacen),
                    stock_reservado: stock_reservado ? parseInt(stock_reservado) : 0,
                    stock_disponible: stock_disponible ? parseInt(stock_disponible) : 0
                }
            });

            res.status(201).json(newStockProduct);
        } catch (error) {
            // Error de clave foránea
            if (error.code === 'P2003') {
                return res.status(404).json({ 
                    message: "El producto o almacén especificado no existe" 
                });
            }
            // Error de duplicado (si tienes unique constraint)
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    message: "Ya existe este producto en el almacén especificado" 
                });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async updateStockProduct(req, res) {
        try {
            const { id } = req.params;
            const { id_producto, id_almacen, stock_reservado, stock_disponible } = req.body;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            // Construir objeto de datos solo con campos proporcionados
            const dataToUpdate = {};

            if (id_producto !== undefined) {
                dataToUpdate.id_producto = parseInt(id_producto);
            }
            if (id_almacen !== undefined) {
                dataToUpdate.id_almacen = parseInt(id_almacen);
            }
            if (stock_reservado !== undefined) {
                if (stock_reservado < 0) {
                    return res.status(400).json({ 
                        message: "El stock reservado no puede ser negativo" 
                    });
                }
                dataToUpdate.stock_reservado = parseInt(stock_reservado);
            }
            if (stock_disponible !== undefined) {
                if (stock_disponible < 0) {
                    return res.status(400).json({ 
                        message: "El stock disponible no puede ser negativo" 
                    });
                }
                dataToUpdate.stock_disponible = parseInt(stock_disponible);
            }

            const updatedStockProduct = await this.StockProducto.update({
                where: { id: idNumerico },
                data: dataToUpdate
            });

            res.status(200).json(updatedStockProduct);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Producto en almacén no encontrado" });
            }
            if (error.code === 'P2003') {
                return res.status(404).json({ 
                    message: "El producto o almacén especificado no existe" 
                });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async deleteStockProduct(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            await this.StockProducto.delete({
                where: { id: idNumerico }
            });

            res.status(200).json({ message: "Producto de almacén eliminado exitosamente" });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Producto en almacén no encontrado" });
            }
            // Error si hay movimientos asociados
            if (error.code === 'P2003') {
                return res.status(409).json({ 
                    message: "No se puede eliminar: existen movimientos asociados" 
                });
            }
            res.status(500).json({ message: error.message });
        }
    }

    // Obtener todos los movimientos de un stock específico
    async getMovementsByStock(req, res) {
        const { stockId } = req.params;
        try {
            const movimientos = await this.prisma.movimiento.findMany({
                where: { id_producto_almacen: parseInt(stockId) },
                include: {
                    tipo_movimiento: true
                },
                orderBy: {
                    fecha: 'desc'
                }
            });
            res.status(200).json(movimientos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los movimientos', details: error.message });
        }
    }

    // Obtener stock de múltiples productos organizado por almacenes
    async getStockByProducts(req, res) {
        try {
            const { productIds } = req.body;

            // Validación de entrada
            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ 
                    message: "Se requiere un array de productIds con al menos un ID" 
                });
            }

            // Convertir a números y validar
            const validProductIds = productIds
                .map(id => parseInt(id))
                .filter(id => !isNaN(id));

            if (validProductIds.length === 0) {
                return res.status(400).json({ 
                    message: "No se proporcionaron IDs de productos válidos" 
                });
            }

            // Obtener stock de todos los productos solicitados
            const stockData = await this.StockProducto.findMany({
                where: {
                    id_producto: {
                        in: validProductIds
                    }
                },
                select: {
                    id_producto: true,
                    id_almacen: true,
                    stock_disponible: true,
                    stock_reservado: true
                }
            });

            // Organizar los datos por producto
            const resultado = validProductIds.map(productId => {
                // Filtrar stock para este producto
                const stockProducto = stockData.filter(s => s.id_producto === productId);
                
                // Calcular stock total
                const stockTotal = stockProducto.reduce((sum, item) => 
                    sum + item.stock_disponible + item.stock_reservado, 0
                );
                
                const stockDisponibleTotal = stockProducto.reduce((sum, item) => 
                    sum + item.stock_disponible, 0
                );
                
                const stockReservadoTotal = stockProducto.reduce((sum, item) => 
                    sum + item.stock_reservado, 0
                );

                // Organizar por almacén
                const porAlmacen = stockProducto.map(item => ({
                    id_almacen: item.id_almacen,
                    stock_disponible: item.stock_disponible,
                    stock_reservado: item.stock_reservado,
                    stock_total: item.stock_disponible + item.stock_reservado
                }));

                return {
                    id_producto: productId,
                    stock_total: stockTotal,
                    stock_disponible_total: stockDisponibleTotal,
                    stock_reservado_total: stockReservadoTotal,
                    almacenes: porAlmacen
                };
            });

            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ 
                message: "Error al obtener stock de productos", 
                error: error.message 
            });
        }
    }
}

export default StockProductController;