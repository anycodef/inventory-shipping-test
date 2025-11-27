class CarrierController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.Carrier = this.prisma.carrier;
    }

    async getAllCarriers(req, res) {
        try {
            const carriers = await this.Carrier.findMany({
                orderBy: { nombre: 'asc' }
            });
            return res.status(200).json({
                success: true,
                data: carriers
            });
        } catch (error) {
            console.error("Error al obtener todos los carriers:", error);
            return res.status(500).json({ 
                success: false,
                error: "Error al obtener carriers",
                message: error.message 
            });
        }
    }

    async getCarrierById(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ 
                    success: false,
                    error: "ID inválido, debe ser un número" 
                });
            }

            const carrier = await this.Carrier.findUnique({
                where: { id: idNumerico }
            });

            if (!carrier) {
                return res.status(404).json({ 
                    success: false,
                    error: "Carrier no encontrado" 
                });
            }

            return res.status(200).json({
                success: true,
                data: carrier
            });
        } catch (error) {
            console.error("Error al obtener el carrier por id:", error);
            return res.status(500).json({ 
                success: false,
                error: "Error al obtener el carrier",
                message: error.message 
            });
        }
    }

    async getAllCarriersPaginated(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (isNaN(page) || page < 1) {
                return res.status(400).json({
                    success: false,
                    error: "page debe ser un número mayor a 0"
                });
            }

            if (isNaN(limit) || limit < 1) {
                return res.status(400).json({
                    success: false,
                    error: "limit debe ser un número mayor a 0"
                });
            }

            const skip = (page - 1) * limit;

            const [carriers, total] = await Promise.all([
                this.Carrier.findMany({
                    skip,
                    take: limit,
                    orderBy: { nombre: 'asc' }
                }),
                this.Carrier.count()
            ]);

            return res.status(200).json({
                success: true,
                data: carriers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error("Error al obtener carriers paginados:", error);
            return res.status(500).json({ 
                success: false,
                error: "Error al obtener carriers",
                message: error.message 
            });
        }
    }

    async createCarrier(req, res) {
        try {
            const { nombre, tarifa_por_hora } = req.body;

            // Validación de campos requeridos
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: "El campo nombre es requerido y no puede estar vacío"
                });
            }

            if (tarifa_por_hora === undefined || tarifa_por_hora === null) {
                return res.status(400).json({
                    success: false,
                    error: "El campo tarifa_por_hora es requerido"
                });
            }

            // Validación de tarifa_por_hora
            const tarifaNum = parseFloat(tarifa_por_hora);
            if (isNaN(tarifaNum) || tarifaNum <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "tarifa_por_hora debe ser un número mayor a 0"
                });
            }

            // Validación de longitud de nombre
            if (nombre.length > 100) {
                return res.status(400).json({
                    success: false,
                    error: "El nombre no puede exceder los 100 caracteres"
                });
            }

            const carrier = await this.Carrier.create({
                data: {
                    nombre: nombre.trim(),
                    tarifa_por_hora: tarifaNum
                }
            });

            return res.status(201).json({
                success: true,
                data: carrier,
                message: "Carrier creado exitosamente"
            });
        } catch (error) {
            // Manejo de error de nombre duplicado (unique constraint)
            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    error: "Ya existe un carrier con ese nombre"
                });
            }

            console.error("Error al crear el carrier:", error);
            return res.status(500).json({
                success: false,
                error: "Error al crear el carrier",
                message: error.message
            });
        }
    }

    async updateCarrier(req, res) {
        try {
            const { id } = req.params;
            const { nombre, tarifa_por_hora } = req.body;

            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID inválido, debe ser un número"
                });
            }

            const dataToUpdate = {};

            if (nombre !== undefined) {
                if (nombre.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        error: "El nombre no puede estar vacío"
                    });
                }
                if (nombre.length > 100) {
                    return res.status(400).json({
                        success: false,
                        error: "El nombre no puede exceder los 100 caracteres"
                    });
                }
                dataToUpdate.nombre = nombre.trim();
            }

            if (tarifa_por_hora !== undefined) {
                const tarifaNum = parseFloat(tarifa_por_hora);
                if (isNaN(tarifaNum) || tarifaNum <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: "tarifa_por_hora debe ser un número mayor a 0"
                    });
                }
                dataToUpdate.tarifa_por_hora = tarifaNum;
            }

            const carrier = await this.Carrier.update({
                where: { id: idNumerico },
                data: dataToUpdate
            });

            return res.status(200).json({
                success: true,
                data: carrier,
                message: "Carrier actualizado exitosamente"
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    error: "Carrier no encontrado"
                });
            }

            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    error: "Ya existe un carrier con ese nombre"
                });
            }

            console.error("Error al actualizar el carrier:", error);
            return res.status(500).json({
                success: false,
                error: "Error al actualizar el carrier",
                message: error.message
            });
        }
    }

    async deleteCarrier(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    error: "ID inválido, debe ser un número"
                });
            }

            // Verificar si tiene envíos asociados
            const carrierWithShipments = await this.Carrier.findUnique({
                where: { id: idNumerico },
                include: { envio: true }
            });

            if (!carrierWithShipments) {
                return res.status(404).json({
                    success: false,
                    error: "Carrier no encontrado"
                });
            }

            if (carrierWithShipments.envio.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: "No se puede eliminar el carrier porque tiene envíos asociados",
                    count: carrierWithShipments.envio.length
                });
            }

            await this.Carrier.delete({
                where: { id: idNumerico }
            });

            return res.status(200).json({
                success: true,
                message: "Carrier eliminado exitosamente"
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    error: "Carrier no encontrado"
                });
            }

            if (error.code === 'P2003') {
                return res.status(409).json({
                    success: false,
                    error: "No se puede eliminar el carrier porque tiene envíos asociados"
                });
            }

            console.error("Error al eliminar el carrier:", error);
            return res.status(500).json({
                success: false,
                error: "Error al eliminar el carrier",
                message: error.message
            });
        }
    }

}

export default CarrierController;
