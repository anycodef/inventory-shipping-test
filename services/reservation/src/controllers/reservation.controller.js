import inventoryService from '../services/inventory.service.js';
import storeService from '../services/store.service.js';
import shippingService from '../services/shipping.service.js';

const DEFAULT_MAX_RESERVATION_HOURS = 24;
const parsedMaxHours = parseInt(process.env.RESERVATION_MAX_HOURS || DEFAULT_MAX_RESERVATION_HOURS, 10);
const MAX_RESERVATION_HOURS = Number.isNaN(parsedMaxHours) ? DEFAULT_MAX_RESERVATION_HOURS : parsedMaxHours;
const MAX_RESERVATION_MS = MAX_RESERVATION_HOURS * 60 * 60 * 1000;

class ReservationController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.Reservation = this.prisma.reserva;
    }

    // Obtener todas las reservas con filtrado y paginación
    async getAllReservation(req, res) {
        try {
            const { id_stock_producto, id_orden, id_estado, page, per_page } = req.query;
            
            // Construir filtros
            const where = {};
            if (id_stock_producto) {
                where.id_stock_producto = parseInt(id_stock_producto);
            }
            if (id_orden) {
                where.id_orden = parseInt(id_orden);
            }
            if (id_estado) {
                where.id_estado = parseInt(id_estado);
            }

            // Paginación
            const paginaActual = page ? parseInt(page) : 1;
            const porPagina = per_page ? parseInt(per_page) : 10;
            const skip = (paginaActual - 1) * porPagina;

            const [reservas, total] = await Promise.all([
                this.Reservation.findMany({
                    where,
                    include: { estado: true },
                    orderBy: { fecha_reserva: 'desc' },
                    skip,
                    take: porPagina
                }),
                this.Reservation.count({ where })
            ]);

            res.status(200).json({
                data: reservas,
                pagination: {
                    total,
                    page: paginaActual,
                    per_page: porPagina,
                    total_pages: Math.ceil(total / porPagina)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las reservas', details: error.message });
        }
    }

    // Obtener una reserva por ID
    async getReservationById(req, res) {
        const { id } = req.params;
        
        try {
            const idNumerico = parseInt(id);
            
            if (isNaN(idNumerico)) {
                return res.status(400).json({ error: 'ID inválido, debe ser un número' });
            }

            const reserva = await this.Reservation.findUnique({
                where: { id: idNumerico },
                include: { estado: true }
            });

            if (reserva) {
                res.status(200).json(reserva);
            } else {
                res.status(404).json({ error: 'Reserva no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener la reserva', details: error.message });
        }
    }

    // Crear una nueva reserva
    async createReservation(req, res) {
        const inventoryOperations = [];

        try {
            const { id_stock_producto, id_orden, stock_reservado, fecha_expiracion, id_estado, fecha_reserva } = req.body;

            // Validación de campos requeridos
            if (!id_stock_producto || !id_orden || !stock_reservado || !id_estado) {
                return res.status(400).json({ 
                    error: 'Campos requeridos faltantes',
                    required: ['id_stock_producto', 'id_orden', 'stock_reservado', 'id_estado']
                });
            }

            const stockId = parseInt(id_stock_producto);
            const orderId = parseInt(id_orden);
            const estadoId = parseInt(id_estado);
            const cantidad = parseInt(stock_reservado);

            if (Number.isNaN(stockId) || Number.isNaN(orderId) || Number.isNaN(estadoId) || Number.isNaN(cantidad)) {
                return res.status(400).json({ 
                    error: 'id_stock_producto, id_orden, id_estado y stock_reservado deben ser números'
                });
            }

            if (cantidad <= 0) {
                return res.status(400).json({ 
                    error: 'El stock_reservado debe ser mayor a 0' 
                });
            }

            const { fechaReserva, fechaExpiracion } = this.buildReservationDates(fecha_reserva, fecha_expiracion);

            await inventoryService.reserveStock(stockId, cantidad);
            inventoryOperations.push({ type: 'reserve', stockId, amount: cantidad });

            const dataToCreate = {
                id_stock_producto: stockId,
                id_orden: orderId,
                stock_reservado: cantidad,
                fecha_expiracion: fechaExpiracion,
                fecha_reserva: fechaReserva,
                id_estado: estadoId
            };

            const nuevaReserva = await this.Reservation.create({
                data: dataToCreate,
                include: { estado: true }
            });
            
            res.status(201).json(nuevaReserva);
        } catch (error) {
            await this.rollbackInventoryAdjustments(inventoryOperations);

            if (this.isInventoryInsufficientStockError(error)) {
                return res.status(409).json({ 
                    error: 'Stock insuficiente para completar la reserva',
                    details: error.message 
                });
            }

            if (error.code && error.code.startsWith('INVALID_')) {
                return res.status(400).json({ error: error.message });
            }

            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'El id_estado o id_stock_producto proporcionado no existe',
                    details: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error al crear la reserva', 
                details: error.message 
            });
        }
    }

    // Actualizar una reserva
    async updateReservation(req, res) {
        const { id } = req.params;
        
        try {
            const idNumerico = parseInt(id);
            
            if (isNaN(idNumerico)) {
                return res.status(400).json({ error: 'ID inválido, debe ser un número' });
            }

            const reservaActual = await this.Reservation.findUnique({
                where: { id: idNumerico }
            });

            if (!reservaActual) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            const { id_stock_producto, id_orden, stock_reservado, fecha_expiracion, fecha_reserva, id_estado } = req.body;
            
            const targetStockId = id_stock_producto !== undefined
                ? parseInt(id_stock_producto)
                : reservaActual.id_stock_producto;

            if (Number.isNaN(targetStockId)) {
                return res.status(400).json({ error: 'El id_stock_producto debe ser un número' });
            }

            const targetCantidad = stock_reservado !== undefined
                ? parseInt(stock_reservado)
                : reservaActual.stock_reservado;

            if (Number.isNaN(targetCantidad)) {
                return res.status(400).json({ error: 'El stock_reservado debe ser un número' });
            }

            if (targetCantidad <= 0) {
                return res.status(400).json({ error: 'El stock_reservado debe ser mayor a 0' });
            }

            const { fechaReserva, fechaExpiracion } = this.buildReservationDates(
                fecha_reserva ?? reservaActual.fecha_reserva,
                fecha_expiracion ?? reservaActual.fecha_expiracion
            );

            const dataToUpdate = {
                fecha_reserva: fechaReserva,
                fecha_expiracion: fechaExpiracion
            };

            if (id_stock_producto !== undefined) {
                dataToUpdate.id_stock_producto = targetStockId;
            }
            
            if (id_orden !== undefined) {
                const parsedOrderId = parseInt(id_orden);
                if (Number.isNaN(parsedOrderId)) {
                    return res.status(400).json({ error: 'El id_orden debe ser un número' });
                }
                dataToUpdate.id_orden = parsedOrderId;
            }
            
            if (stock_reservado !== undefined) {
                dataToUpdate.stock_reservado = targetCantidad;
            }
            
            if (id_estado !== undefined) {
                const parsedEstado = parseInt(id_estado);
                if (Number.isNaN(parsedEstado)) {
                    return res.status(400).json({ error: 'El id_estado debe ser un número' });
                }
                dataToUpdate.id_estado = parsedEstado;
            }

            const inventoryOperations = [];

            try {
                if (targetStockId !== reservaActual.id_stock_producto) {
                    await inventoryService.reserveStock(targetStockId, targetCantidad);
                    inventoryOperations.push({ type: 'reserve', stockId: targetStockId, amount: targetCantidad });

                    await inventoryService.releaseStock(
                        reservaActual.id_stock_producto,
                        reservaActual.stock_reservado
                    );
                    inventoryOperations.push({ type: 'release', stockId: reservaActual.id_stock_producto, amount: reservaActual.stock_reservado });
                } else if (targetCantidad !== reservaActual.stock_reservado) {
                    const diff = targetCantidad - reservaActual.stock_reservado;
                    if (diff > 0) {
                        await inventoryService.reserveStock(targetStockId, diff);
                        inventoryOperations.push({ type: 'reserve', stockId: targetStockId, amount: diff });
                    } else if (diff < 0) {
                        await inventoryService.releaseStock(targetStockId, Math.abs(diff));
                        inventoryOperations.push({ type: 'release', stockId: targetStockId, amount: Math.abs(diff) });
                    }
                }

                const reservaActualizada = await this.Reservation.update({
                    where: { id: idNumerico },
                    data: dataToUpdate,
                    include: { estado: true }
                });
                
                return res.status(200).json(reservaActualizada);
            } catch (error) {
                await this.rollbackInventoryAdjustments(inventoryOperations);

                if (this.isInventoryInsufficientStockError(error)) {
                    return res.status(409).json({ 
                        error: 'Stock insuficiente para completar la actualización',
                        details: error.message 
                    });
                }

                if (error.code === 'P2003') {
                    return res.status(400).json({ 
                        error: 'El id_estado proporcionado no existe',
                        details: error.message 
                    });
                }

                if (error.code === 'P2025') {
                    return res.status(404).json({ error: 'Reserva no encontrada' });
                }

                throw error;
            }
        } catch (error) {
            if (error.code && error.code.startsWith('INVALID_')) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ 
                error: 'Error al actualizar la reserva', 
                details: error.message 
            });
        }
    }

    // Eliminar una reserva
    async deleteReservation(req, res) {
        const { id } = req.params;
        
        try {
            const idNumerico = parseInt(id);
            
            if (isNaN(idNumerico)) {
                return res.status(400).json({ error: 'ID inválido, debe ser un número' });
            }

            const reserva = await this.Reservation.findUnique({
                where: { id: idNumerico }
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            await this.Reservation.delete({
                where: { id: idNumerico }
            });

            if (reserva.stock_reservado > 0) {
                try {
                    await inventoryService.releaseStock(
                        reserva.id_stock_producto,
                        reserva.stock_reservado
                    );
                } catch (releaseError) {
                    console.error(
                        `Error al liberar stock para la reserva ${idNumerico}:`,
                        releaseError.message
                    );
                }
            }
            
            res.status(200).json({ message: 'Reserva eliminada exitosamente' });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            
            res.status(500).json({ 
                error: 'Error al eliminar la reserva', 
                details: error.message 
            });
        }
    }

    buildReservationDates(fecha_reserva, fecha_expiracion) {
        const fechaReserva = fecha_reserva
            ? new Date(fecha_reserva)
            : new Date();

        if (isNaN(fechaReserva.getTime())) {
            const invalidReservationDate = new Error('La fecha_reserva no es válida');
            invalidReservationDate.code = 'INVALID_RESERVATION_DATE';
            throw invalidReservationDate;
        }

        const fechaExpiracion = fecha_expiracion
            ? new Date(fecha_expiracion)
            : new Date(fechaReserva.getTime() + MAX_RESERVATION_MS);

        if (isNaN(fechaExpiracion.getTime())) {
            const invalidExpirationDate = new Error('La fecha_expiracion no es válida');
            invalidExpirationDate.code = 'INVALID_EXPIRATION_DATE';
            throw invalidExpirationDate;
        }

        const validationError = this.validateExpirationWindow(fechaReserva, fechaExpiracion);
        if (validationError) {
            const invalidWindow = new Error(validationError);
            invalidWindow.code = 'INVALID_EXPIRATION_WINDOW';
            throw invalidWindow;
        }

        return { fechaReserva, fechaExpiracion };
    }

    validateExpirationWindow(fechaReserva, fechaExpiracion) {
        if (fechaExpiracion <= fechaReserva) {
            return 'La fecha_expiracion debe ser posterior a la fecha_reserva';
        }

        const diffMs = fechaExpiracion.getTime() - fechaReserva.getTime();
        if (diffMs > MAX_RESERVATION_MS) {
            return `La reserva no puede exceder ${MAX_RESERVATION_HOURS} horas`;
        }

        return null;
    }

    async rollbackInventoryAdjustments(operations = []) {
        if (!operations.length) {
            return;
        }

        for (let i = operations.length - 1; i >= 0; i -= 1) {
            const { type, stockId, amount } = operations[i];
            try {
                if (type === 'reserve') {
                    await inventoryService.releaseStock(stockId, amount);
                } else if (type === 'release') {
                    await inventoryService.reserveStock(stockId, amount);
                }
            } catch (error) {
                console.error(
                    `Error al revertir operación de inventario (${type}) para stock ${stockId}:`,
                    error.message
                );
            }
        }
    }

    isInventoryInsufficientStockError(error) {
        return (
            error?.code === 'INSUFFICIENT_STOCK' ||
            (typeof error?.message === 'string' && error.message.includes('Stock insuficiente'))
        );
    }

    /**
     * Crea una reserva desde el módulo de órdenes
     * Este endpoint está diseñado específicamente para el módulo de órdenes
     * y maneja la comunicación con los servicios de inventario, tiendas y shipping
     */
    async createReservationFromOrder(req, res) {
        try {
            const { 
                id_orden,
                productos, // Array de {id_producto, cantidad, id_almacen?} o {id_stock_producto, cantidad}
                tipo_envio, // "RECOJO_TIENDA" o "DOMICILIO"
                id_tienda, // Requerido si tipo_envio === "RECOJO_TIENDA"
                id_carrier, // Requerido si tipo_envio === "DOMICILIO"
                fecha_expiracion, // Opcional, por defecto 24 horas
                id_estado // Opcional, por defecto 1 (Pendiente)
            } = req.body;

            // ===== VALIDACIONES BÁSICAS =====
            if (!id_orden) {
                return res.status(400).json({ 
                    error: 'El campo id_orden es requerido' 
                });
            }

            if (!productos || !Array.isArray(productos) || productos.length === 0) {
                return res.status(400).json({ 
                    error: 'Debe proporcionar al menos un producto en el array "productos"',
                    example: [{ id_producto: 101, cantidad: 2 }]
                });
            }

            if (!tipo_envio || !['RECOJO_TIENDA', 'DOMICILIO'].includes(tipo_envio)) {
                return res.status(400).json({ 
                    error: 'El campo tipo_envio debe ser "RECOJO_TIENDA" o "DOMICILIO"' 
                });
            }

            // Validar que cada producto tenga los campos necesarios
            for (const producto of productos) {
                // Aceptar tanto id_producto como id_stock_producto
                if (!producto.id_producto && !producto.id_stock_producto) {
                    return res.status(400).json({ 
                        error: 'Cada producto debe tener id_producto o id_stock_producto',
                        example: { id_producto: 101, cantidad: 2 }
                    });
                }

                if (!producto.cantidad) {
                    return res.status(400).json({ 
                        error: 'Cada producto debe tener cantidad',
                        example: { id_producto: 101, cantidad: 2 }
                    });
                }

                if (producto.cantidad <= 0) {
                    return res.status(400).json({ 
                        error: 'La cantidad de cada producto debe ser mayor a 0' 
                    });
                }
            }

            // ===== VALIDACIONES ESPECÍFICAS POR TIPO DE ENVÍO =====
            if (tipo_envio === 'RECOJO_TIENDA') {
                if (!id_tienda) {
                    return res.status(400).json({ 
                        error: 'Para recojo en tienda, el campo id_tienda es requerido' 
                    });
                }

                // Validar que la tienda existe y está activa
                const storeValidation = await storeService.validateStore(id_tienda);
                if (!storeValidation.exists) {
                    return res.status(404).json({ 
                        error: `La tienda con ID ${id_tienda} no existe` 
                    });
                }

                if (!storeValidation.isStore) {
                    return res.status(400).json({ 
                        error: `El local con ID ${id_tienda} no es una tienda` 
                    });
                }

                if (!storeValidation.active) {
                    return res.status(400).json({ 
                        error: `La tienda ${storeValidation.data.nombre} no está activa`,
                        estado: storeValidation.data.estado
                    });
                }
            }

            if (tipo_envio === 'DOMICILIO') {
                if (!id_carrier) {
                    return res.status(400).json({ 
                        error: 'Para envío a domicilio, el campo id_carrier es requerido' 
                    });
                }

                // Validar que el carrier existe y está activo
                const carrierValidation = await shippingService.validateCarrier(id_carrier);
                if (!carrierValidation.exists) {
                    return res.status(404).json({ 
                        error: `El carrier con ID ${id_carrier} no existe` 
                    });
                }

                if (!carrierValidation.active) {
                    return res.status(400).json({ 
                        error: `El carrier ${carrierValidation.data.nombre} no está activo`
                    });
                }

                // Validar datos de dirección para envío a domicilio
                const { direccion_envio, latitud_destino, longitud_destino } = req.body;

                if (!direccion_envio || !direccion_envio.trim()) {
                    return res.status(400).json({ 
                        error: 'Para envío a domicilio, el campo direccion_envio es requerido' 
                    });
                }

                if (latitud_destino === undefined || latitud_destino === null) {
                    return res.status(400).json({ 
                        error: 'Para envío a domicilio, el campo latitud_destino es requerido' 
                    });
                }

                if (longitud_destino === undefined || longitud_destino === null) {
                    return res.status(400).json({ 
                        error: 'Para envío a domicilio, el campo longitud_destino es requerido' 
                    });
                }

                // Validar rangos de coordenadas
                const lat = parseFloat(latitud_destino);
                const lng = parseFloat(longitud_destino);

                if (isNaN(lat) || lat < -90 || lat > 90) {
                    return res.status(400).json({ 
                        error: 'La latitud_destino debe ser un número entre -90 y 90' 
                    });
                }

                if (isNaN(lng) || lng < -180 || lng > 180) {
                    return res.status(400).json({ 
                        error: 'La longitud_destino debe ser un número entre -180 y 180' 
                    });
                }
            }

            // ===== CONVERTIR id_producto A id_stock_producto =====
            // Si el producto viene con id_producto, buscar el mejor stock disponible
            const productosConStock = [];
            
            for (const producto of productos) {
                if (producto.id_producto) {
                    // Buscar stock disponible para este producto
                    try {
                        const stockInfo = await inventoryService.findAvailableStock(
                            producto.id_producto,
                            producto.cantidad,
                            producto.id_almacen // Opcional
                        );
                        
                        productosConStock.push({
                            id_stock_producto: stockInfo.id_stock_producto,
                            cantidad: producto.cantidad,
                            id_producto: producto.id_producto,
                            id_almacen: stockInfo.id_almacen,
                            stock_disponible: stockInfo.stock_disponible
                        });
                    } catch (error) {
                        return res.status(400).json({ 
                            error: `Producto ${producto.id_producto}: ${error.message}`
                        });
                    }
                } else {
                    // Ya tiene id_stock_producto, usar directamente
                    productosConStock.push({
                        id_stock_producto: producto.id_stock_producto,
                        cantidad: producto.cantidad
                    });
                }
            }

            // ===== VERIFICAR DISPONIBILIDAD DE STOCK =====
            const stockValidations = [];
            for (const producto of productosConStock) {
                try {
                    const stockInfo = await inventoryService.checkStockAvailability(
                        producto.id_stock_producto,
                        producto.cantidad
                    );

                    if (!stockInfo.available) {
                        stockValidations.push({
                            id_stock_producto: producto.id_stock_producto,
                            solicitado: producto.cantidad,
                            disponible: stockInfo.stock_disponible,
                            error: 'Stock insuficiente'
                        });
                    } else {
                        stockValidations.push({
                            id_stock_producto: producto.id_stock_producto,
                            solicitado: producto.cantidad,
                            disponible: stockInfo.stock_disponible,
                            ok: true
                        });
                    }
                } catch (error) {
                    return res.status(400).json({ 
                        error: error.message
                    });
                }
            }

            // Verificar si hay productos con stock insuficiente
            const stockInsuficiente = stockValidations.filter(v => !v.ok);
            if (stockInsuficiente.length > 0) {
                return res.status(400).json({ 
                    error: 'Stock insuficiente para algunos productos',
                    detalles: stockInsuficiente
                });
            }

            // ===== CALCULAR FECHA DE EXPIRACIÓN =====
            let fechaExp;
            let fechaReservaOrden;

            try {
                const fechas = this.buildReservationDates(undefined, fecha_expiracion);
                fechaReservaOrden = fechas.fechaReserva;
                fechaExp = fechas.fechaExpiracion;
            } catch (error) {
                if (error.code && error.code.startsWith('INVALID_')) {
                    return res.status(400).json({ error: error.message });
                }
                throw error;
            }

            // ===== CREAR RESERVAS Y ACTUALIZAR STOCK =====
            const reservasCreadas = [];
            const erroresReserva = [];

            for (const producto of productosConStock) {
                try {
                    // Reservar el stock en el servicio de inventario
                    await inventoryService.reserveStock(
                        producto.id_stock_producto,
                        producto.cantidad
                    );

                    // Crear la reserva en la base de datos
                    const dataReserva = {
                        id_stock_producto: parseInt(producto.id_stock_producto),
                        id_orden: parseInt(id_orden),
                        stock_reservado: parseInt(producto.cantidad),
                        fecha_expiracion: fechaExp,
                        fecha_reserva: fechaReservaOrden,
                        id_estado: id_estado ? parseInt(id_estado) : 1, // 1 = Pendiente por defecto
                        tipo_envio: tipo_envio
                    };

                    // Agregar id_tienda o id_carrier según el tipo de envío
                    if (tipo_envio === 'RECOJO_TIENDA') {
                        dataReserva.id_tienda = parseInt(id_tienda);
                    } else if (tipo_envio === 'DOMICILIO') {
                        dataReserva.id_carrier = parseInt(id_carrier);
                        
                        // Agregar datos de dirección y coordenadas para envío a domicilio
                        const { direccion_envio, latitud_destino, longitud_destino } = req.body;
                        dataReserva.direccion_envio = direccion_envio;
                        dataReserva.latitud_destino = parseFloat(latitud_destino);
                        dataReserva.longitud_destino = parseFloat(longitud_destino);
                    }

                    const nuevaReserva = await this.Reservation.create({
                        data: dataReserva,
                        include: { estado: true }
                    });

                    reservasCreadas.push(nuevaReserva);
                } catch (error) {
                    // Si falla la creación de una reserva, intentar liberar el stock
                    // de las reservas ya creadas
                    erroresReserva.push({
                        id_stock_producto: producto.id_stock_producto,
                        error: error.message
                    });

                    // Rollback: liberar stock de reservas exitosas
                    for (const reserva of reservasCreadas) {
                        try {
                            await inventoryService.releaseStock(
                                reserva.id_stock_producto,
                                reserva.stock_reservado
                            );
                            await this.Reservation.delete({
                                where: { id: reserva.id }
                            });
                        } catch (rollbackError) {
                            console.error('Error en rollback:', rollbackError);
                        }
                    }

                    return res.status(500).json({ 
                        error: 'Error al crear las reservas',
                        detalles: erroresReserva,
                        message: 'Se realizó rollback de las reservas creadas'
                    });
                }
            }

            // ===== RESPUESTA EXITOSA =====
            return res.status(201).json({
                message: 'Reservas creadas exitosamente',
                id_orden: id_orden,
                tipo_envio: tipo_envio,
                id_tienda: tipo_envio === 'RECOJO_TIENDA' ? id_tienda : null,
                id_carrier: tipo_envio === 'DOMICILIO' ? id_carrier : null,
                total_productos: productos.length,
                fecha_expiracion: fechaExp,
                reservas: reservasCreadas
            });

        } catch (error) {
            console.error('Error en createReservationFromOrder:', error);
            return res.status(500).json({ 
                error: 'Error al procesar la reserva desde orden', 
                details: error.message 
            });
        }
    }

    // Obtener reservas expiradas
    async getExpiredReservations(req, res) {
        try {
            const reservasExpiradas = await this.Reservation.findMany({
                where: {
                    fecha_expiracion: {
                        lt: new Date()
                    }
                },
                include: { estado: true },
                orderBy: { fecha_expiracion: 'desc' }
            });

            res.status(200).json(reservasExpiradas);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener reservas expiradas', 
                details: error.message 
            });
        }
    }
}

export default ReservationController;
