class MovementController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.Movement = this.prisma.movimiento;
    }

    async getAllMovements(req, res) {
        try {
            const movements = await this.Movement.findMany({
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                },
                orderBy: {
                    fecha: 'desc' // Ordenar por fecha descendente (más recientes primero)
                }
            });
            res.status(200).json(movements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMovementById(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const movement = await this.Movement.findUnique({
                where: { id: idNumerico },
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                }
            });

            if (!movement) {
                return res.status(404).json({ message: "Movimiento no encontrado" });
            }

            res.status(200).json(movement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMovementsByProducto(req, res) {
        try {
            const { id_producto_almacen } = req.params;
            const idNumerico = parseInt(id_producto_almacen);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID de producto almacén inválido" });
            }

            const movements = await this.Movement.findMany({
                where: { id_producto_almacen: idNumerico },
                include: {
                    tipo_movimiento: true
                },
                orderBy: {
                    fecha: 'desc'
                }
            });

            res.status(200).json(movements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMovementsByTipo(req, res) {
        try {
            const { id_tipo } = req.params;
            const idNumerico = parseInt(id_tipo);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID de tipo movimiento inválido" });
            }

            const movements = await this.Movement.findMany({
                where: { id_tipo: idNumerico },
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                },
                orderBy: {
                    fecha: 'desc'
                }
            });

            res.status(200).json(movements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createMovement(req, res) {
        try {
            const { id_producto_almacen, id_tipo, cantidad, fecha } = req.body;

            // Validación de campos requeridos
            if (!id_producto_almacen || !id_tipo || !cantidad) {
                return res.status(400).json({ 
                    message: "id_producto_almacen, id_tipo y cantidad son requeridos" 
                });
            }

            // Validación de cantidad
            if (cantidad <= 0) {
                return res.status(400).json({ 
                    message: "La cantidad debe ser mayor a 0" 
                });
            }

            // Preparar datos para crear
            const dataToCreate = {
                id_producto_almacen: parseInt(id_producto_almacen),
                id_tipo: parseInt(id_tipo),
                cantidad: parseInt(cantidad)
            };

            // Si se proporciona fecha, validarla y agregarla
            if (fecha) {
                const fechaMovimiento = new Date(fecha);
                if (isNaN(fechaMovimiento.getTime())) {
                    return res.status(400).json({ 
                        message: "Formato de fecha inválido" 
                    });
                }
                dataToCreate.fecha = fechaMovimiento;
            }

            const newMovement = await this.Movement.create({
                data: dataToCreate,
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                }
            });

            res.status(201).json(newMovement);
        } catch (error) {
            // Error de clave foránea
            if (error.code === 'P2003') {
                return res.status(404).json({ 
                    message: "El producto almacén o tipo de movimiento especificado no existe" 
                });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async updateMovement(req, res) {
        try {
            const { id } = req.params;
            const { id_producto_almacen, id_tipo, cantidad, fecha } = req.body;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            // Construir objeto de datos solo con campos proporcionados
            const dataToUpdate = {};

            if (id_producto_almacen !== undefined) {
                dataToUpdate.id_producto_almacen = parseInt(id_producto_almacen);
            }
            if (id_tipo !== undefined) {
                dataToUpdate.id_tipo = parseInt(id_tipo);
            }
            if (cantidad !== undefined) {
                if (cantidad <= 0) {
                    return res.status(400).json({ 
                        message: "La cantidad debe ser mayor a 0" 
                    });
                }
                dataToUpdate.cantidad = parseInt(cantidad);
            }
            if (fecha !== undefined) {
                const fechaMovimiento = new Date(fecha);
                if (isNaN(fechaMovimiento.getTime())) {
                    return res.status(400).json({ 
                        message: "Formato de fecha inválido" 
                    });
                }
                dataToUpdate.fecha = fechaMovimiento;
            }

            const updatedMovement = await this.Movement.update({
                where: { id: idNumerico },
                data: dataToUpdate,
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                }
            });

            res.status(200).json(updatedMovement);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Movimiento no encontrado" });
            }
            if (error.code === 'P2003') {
                return res.status(404).json({ 
                    message: "El producto almacén o tipo de movimiento especificado no existe" 
                });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async deleteMovement(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            await this.Movement.delete({
                where: { id: idNumerico }
            });

            res.status(200).json({ message: "Movimiento eliminado exitosamente" });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Movimiento no encontrado" });
            }
            res.status(500).json({ message: error.message });
        }
    }
}

export default MovementController;