class StateReservationController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.StateReservation = this.prisma.estadoReserva;
    }

    // Obtener todos los estados de reserva
    async getAllStateReservation(req, res) {
        try {
            const estados = await this.StateReservation.findMany({
                orderBy: { nombre: 'asc' }
            });
            res.status(200).json(estados);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los estados', details: error.message });
        }
    }

    // Obtener un estado por ID
    async getStateReservationById(req, res) {
        const { id } = req.params;
        
        try {
            const idNumerico = parseInt(id);
            
            if (isNaN(idNumerico)) {
                return res.status(400).json({ error: 'ID inválido, debe ser un número' });
            }

            const estado = await this.StateReservation.findUnique({ 
                where: { id: idNumerico },
                include: { 
                    reservas: {
                        orderBy: { fecha_reserva: 'desc' },
                        take: 10 // Limitar a las últimas 10 reservas
                    }
                }
            });

            if (estado) {
                res.status(200).json(estado);
            } else {
                res.status(404).json({ error: 'Estado no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el estado', details: error.message });
        }
    }

    // Crear un nuevo estado
    async createStateReservation(req, res) {
        try {
            const { nombre, descripcion } = req.body;

            // Validación de campo requerido
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({ 
                    error: 'El campo nombre es requerido y no puede estar vacío' 
                });
            }

            // Validación de longitud
            if (nombre.length > 100) {
                return res.status(400).json({ 
                    error: 'El nombre no puede exceder los 100 caracteres' 
                });
            }

            const nuevoEstado = await this.StateReservation.create({ 
                data: {
                    nombre: nombre.trim().toUpperCase(), // Normalizar a mayúsculas
                    descripcion: descripcion ? descripcion.trim() : null
                }
            });
            
            res.status(201).json(nuevoEstado);
        } catch (error) {
            // Manejo de error de nombre duplicado
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    error: 'Ya existe un estado con ese nombre',
                    details: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error al crear el estado', 
                details: error.message 
            });
        }
    }
    
    // Actualizar un estado
    async updateStateReservation(req, res) {
        const { id } = req.params;
        
        try {
            const idNumerico = parseInt(id);
            
            if (isNaN(idNumerico)) {
                return res.status(400).json({ error: 'ID inválido, debe ser un número' });
            }

            const { nombre, descripcion } = req.body;
            const dataToUpdate = {};

            if (nombre !== undefined) {
                if (nombre.trim() === '') {
                    return res.status(400).json({ 
                        error: 'El nombre no puede estar vacío' 
                    });
                }
                if (nombre.length > 100) {
                    return res.status(400).json({ 
                        error: 'El nombre no puede exceder los 100 caracteres' 
                    });
                }
                dataToUpdate.nombre = nombre.trim().toUpperCase();
            }

            if (descripcion !== undefined) {
                dataToUpdate.descripcion = descripcion ? descripcion.trim() : null;
            }

            const estadoActualizado = await this.StateReservation.update({
                where: { id: idNumerico },
                data: dataToUpdate
            });
            
            res.status(200).json(estadoActualizado);
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Estado no encontrado' });
            }
            
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    error: 'Ya existe un estado con ese nombre',
                    details: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error al actualizar el estado', 
                details: error.message 
            });
        }
    }
    
    // Eliminar un estado
    async deleteStateReservation(req, res) {
        const { id } = req.params;
        
        try {
            const idNumerico = parseInt(id);
            
            if (isNaN(idNumerico)) {
                return res.status(400).json({ error: 'ID inválido, debe ser un número' });
            }

            await this.StateReservation.delete({ 
                where: { id: idNumerico } 
            });
            
            res.status(200).json({ message: 'Estado eliminado exitosamente' });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Estado no encontrado' });
            }
            
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'No se puede eliminar el estado porque tiene reservas asociadas',
                    details: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error al eliminar el estado', 
                details: error.message 
            });
        }
    }
}

export default StateReservationController;
