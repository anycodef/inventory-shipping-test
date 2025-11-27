class ShippingController {
    constructor(instancePrisma) {
        this.prisma = instancePrisma;
        this.Shipping = this.prisma.envio;
    }

    async getAllShipping(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                id_orden,
                id_estado,
                id_carrier,
                fecha_desde,
                fecha_hasta
            } = req.query;

            const skip = (page - 1) * limit;
            const where = {};

            // Aplicar filtros opcionales con validación
            if (id_orden) {
                const ordenId = parseInt(id_orden);
                if (isNaN(ordenId)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_orden debe ser un número válido"
                    });
                }
                where.id_orden = ordenId;
            }

            if (id_estado) {
                const estadoId = parseInt(id_estado);
                if (isNaN(estadoId)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_estado debe ser un número válido"
                    });
                }
                where.id_estado = estadoId;
            }

            if (id_carrier) {
                const carrierId = parseInt(id_carrier);
                if (isNaN(carrierId)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_carrier debe ser un número válido"
                    });
                }
                where.id_carrier = carrierId;
            }

            // Filtro por rango de fechas con validación
            if (fecha_desde || fecha_hasta) {
                where.fecha_reserva = {};
                
                if (fecha_desde) {
                    const fechaDesdeDate = new Date(fecha_desde);
                    if (isNaN(fechaDesdeDate.getTime())) {
                        return res.status(400).json({
                            success: false,
                            error: "fecha_desde no es una fecha válida"
                        });
                    }
                    where.fecha_reserva.gte = fechaDesdeDate;
                }
                
                if (fecha_hasta) {
                    const fechaHastaDate = new Date(fecha_hasta);
                    if (isNaN(fechaHastaDate.getTime())) {
                        return res.status(400).json({
                            success: false,
                            error: "fecha_hasta no es una fecha válida"
                        });
                    }
                    where.fecha_reserva.lte = fechaHastaDate;
                }
            }

            const [shippings, total] = await Promise.all([
                this.Shipping.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    include: {
                        carrier: true
                    },
                    orderBy: { fecha_reserva: 'desc' }
                }),
                this.Shipping.count({ where })
            ]);

            return res.status(200).json({
                success: true,
                data: shippings,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error("Error al obtener todos los envíos:", error);
            return res.status(500).json({
                success: false,
                error: "Error al obtener los envíos",
                message: error.message
            });
        }
    }

    // Obtener un envío por ID
    async getShippingById(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID inválido, debe ser un número"
                });
            }

            const shipping = await this.Shipping.findUnique({
                where: { id: idNumerico },
                include: {
                    carrier: true
                }
            });

            if (!shipping) {
                return res.status(404).json({
                    success: false,
                    error: "Envío no encontrado"
                });
            }

            return res.status(200).json({
                success: true,
                data: shipping
            });
        } catch (error) {
            console.error("Error al obtener el envío por ID:", error);
            return res.status(500).json({
                success: false,
                error: "Error al obtener el envío",
                message: error.message
            });
        }
    }

    // Obtener envíos por orden
    async getShippingsByOrder(req, res) {
        try {
            const { id_orden } = req.params;
            const idOrdenNumerico = parseInt(id_orden);

            if (isNaN(idOrdenNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID de orden inválido, debe ser un número"
                });
            }

            const shippings = await this.Shipping.findMany({
                where: { id_orden: idOrdenNumerico },
                include: {
                    carrier: true
                },
                orderBy: { fecha_reserva: 'desc' }
            });

            return res.status(200).json({
                success: true,
                data: shippings,
                count: shippings.length
            });
        } catch (error) {
            console.error("Error al obtener envíos por orden:", error);
            return res.status(500).json({
                success: false,
                error: "Error al obtener los envíos de la orden",
                message: error.message
            });
        }
    }

    // Crear un nuevo envío
    async createShipping(req, res) {
        try {
            const {
                id_stock_producto,
                id_orden,
                stock_reservado,
                fecha_expiracion,
                id_estado,
                id_carrier
            } = req.body;

            // Validación de campos requeridos
            if (!id_stock_producto || !id_orden || !stock_reservado || !id_estado || !id_carrier) {
                return res.status(400).json({
                    success: false,
                    error: "Faltan campos requeridos",
                    required: ['id_stock_producto', 'id_orden', 'stock_reservado', 'id_estado', 'id_carrier']
                });
            }

            // Validación de stock_reservado
            const stockReservadoNum = parseInt(stock_reservado);
            if (isNaN(stockReservadoNum) || stockReservadoNum <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "stock_reservado debe ser un número mayor a 0"
                });
            }

            // Validación de fecha_expiracion
            let fechaExpiracion;
            if (fecha_expiracion) {
                fechaExpiracion = new Date(fecha_expiracion);
                if (isNaN(fechaExpiracion.getTime())) {
                    return res.status(400).json({
                        success: false,
                        error: "fecha_expiracion no es una fecha válida"
                    });
                }

                // Validar que fecha_expiracion sea futura
                if (fechaExpiracion <= new Date()) {
                    return res.status(400).json({
                        success: false,
                        error: "fecha_expiracion debe ser una fecha futura"
                    });
                }
            } else {
                // 7 días por defecto
                fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }

            // Verificar que el carrier existe
            const idCarrierNum = parseInt(id_carrier);
            if (isNaN(idCarrierNum)) {
                return res.status(400).json({
                    success: false,
                    error: "id_carrier debe ser un número válido"
                });
            }

            const carrier = await this.prisma.carrier.findUnique({
                where: { id: idCarrierNum }
            });

            if (!carrier) {
                return res.status(404).json({
                    success: false,
                    error: "Carrier no encontrado"
                });
            }

            // Crear el envío
            const shipping = await this.Shipping.create({
                data: {
                    id_stock_producto: parseInt(id_stock_producto),
                    id_orden: parseInt(id_orden),
                    stock_reservado: stockReservadoNum,
                    fecha_reserva: new Date(),
                    fecha_expiracion: fechaExpiracion,
                    id_estado: parseInt(id_estado),
                    id_carrier: idCarrierNum
                },
                include: {
                    carrier: true
                }
            });

            return res.status(201).json({
                success: true,
                data: shipping,
                message: "Envío creado exitosamente"
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    error: "El id_carrier proporcionado no existe en la base de datos",
                    details: error.message
                });
            }

            console.error("Error al crear el envío:", error);
            return res.status(500).json({
                success: false,
                error: "Error al crear el envío",
                message: error.message
            });
        }
    }

    // Actualizar un envío
    async updateShipping(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID inválido, debe ser un número"
                });
            }

            // Verificar que el envío existe
            const existingShipping = await this.Shipping.findUnique({
                where: { id: idNumerico }
            });

            if (!existingShipping) {
                return res.status(404).json({
                    success: false,
                    error: "Envío no encontrado"
                });
            }

            // Si se actualiza el carrier, verificar que existe
            if (updateData.id_carrier) {
                const idCarrierNum = parseInt(updateData.id_carrier);
                if (isNaN(idCarrierNum)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_carrier debe ser un número válido"
                    });
                }

                const carrier = await this.prisma.carrier.findUnique({
                    where: { id: idCarrierNum }
                });

                if (!carrier) {
                    return res.status(404).json({
                        success: false,
                        error: "Carrier no encontrado"
                    });
                }
            }

            // Construir datos de actualización con validaciones
            const processedData = {};

            if (updateData.id_stock_producto !== undefined) {
                const idStockNum = parseInt(updateData.id_stock_producto);
                if (isNaN(idStockNum)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_stock_producto debe ser un número válido"
                    });
                }
                processedData.id_stock_producto = idStockNum;
            }

            if (updateData.id_orden !== undefined) {
                const idOrdenNum = parseInt(updateData.id_orden);
                if (isNaN(idOrdenNum)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_orden debe ser un número válido"
                    });
                }
                processedData.id_orden = idOrdenNum;
            }

            if (updateData.stock_reservado !== undefined) {
                const stockNum = parseInt(updateData.stock_reservado);
                if (isNaN(stockNum) || stockNum <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: "stock_reservado debe ser un número mayor a 0"
                    });
                }
                processedData.stock_reservado = stockNum;
            }

            if (updateData.id_estado !== undefined) {
                const idEstadoNum = parseInt(updateData.id_estado);
                if (isNaN(idEstadoNum)) {
                    return res.status(400).json({
                        success: false,
                        error: "id_estado debe ser un número válido"
                    });
                }
                processedData.id_estado = idEstadoNum;
            }

            if (updateData.id_carrier !== undefined) {
                processedData.id_carrier = parseInt(updateData.id_carrier);
            }

            if (updateData.fecha_expiracion !== undefined) {
                const fechaExp = new Date(updateData.fecha_expiracion);
                if (isNaN(fechaExp.getTime())) {
                    return res.status(400).json({
                        success: false,
                        error: "fecha_expiracion no es una fecha válida"
                    });
                }
                processedData.fecha_expiracion = fechaExp;
            }

            const shipping = await this.Shipping.update({
                where: { id: idNumerico },
                data: processedData,
                include: {
                    carrier: true
                }
            });

            return res.status(200).json({
                success: true,
                data: shipping,
                message: "Envío actualizado exitosamente"
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    error: "Envío no encontrado"
                });
            }

            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    error: "El id_carrier proporcionado no existe en la base de datos",
                    details: error.message
                });
            }

            console.error("Error al actualizar el envío:", error);
            return res.status(500).json({
                success: false,
                error: "Error al actualizar el envío",
                message: error.message
            });
        }
    }

    // Actualizar estado del envío
    async updateShippingStatus(req, res) {
        try {
            const { id } = req.params;
            const { id_estado } = req.body;

            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID inválido, debe ser un número"
                });
            }

            if (!id_estado) {
                return res.status(400).json({
                    success: false,
                    error: "El campo id_estado es requerido"
                });
            }

            const idEstadoNum = parseInt(id_estado);
            if (isNaN(idEstadoNum)) {
                return res.status(400).json({
                    success: false,
                    error: "id_estado debe ser un número válido"
                });
            }

            const shipping = await this.Shipping.update({
                where: { id: idNumerico },
                data: { id_estado: idEstadoNum },
                include: {
                    carrier: true
                }
            });

            return res.status(200).json({
                success: true,
                data: shipping,
                message: "Estado del envío actualizado exitosamente"
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    error: "Envío no encontrado"
                });
            }

            console.error("Error al actualizar el estado del envío:", error);
            return res.status(500).json({
                success: false,
                error: "Error al actualizar el estado",
                message: error.message
            });
        }
    }

    // Eliminar un envío
    async deleteShipping(req, res) {
        try {
            const { id } = req.params;

            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID inválido, debe ser un número"
                });
            }

            await this.Shipping.delete({
                where: { id: idNumerico }
            });

            return res.status(200).json({
                success: true,
                message: "Envío eliminado exitosamente"
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    error: "Envío no encontrado"
                });
            }

            console.error("Error al eliminar el envío:", error);
            return res.status(500).json({
                success: false,
                error: "Error al eliminar el envío",
                message: error.message
            });
        }
    }

    // Obtener envíos expirados
    async getExpiredShippings(req, res) {
        try {
            const now = new Date();

            const expiredShippings = await this.Shipping.findMany({
                where: {
                    fecha_expiracion: {
                        lt: now
                    }
                },
                include: {
                    carrier: true
                },
                orderBy: { fecha_expiracion: 'desc' }
            });

            return res.status(200).json({
                success: true,
                data: expiredShippings,
                count: expiredShippings.length
            });
        } catch (error) {
            console.error("Error al obtener envíos expirados:", error);
            return res.status(500).json({
                success: false,
                error: "Error al obtener envíos expirados",
                message: error.message
            });
        }
    }

}

export default ShippingController;
