class DireccionController {
    constructor (instacePrisma) {
        this.prisma = instacePrisma;
        this.Direccion = this.prisma.direccion;
    }

    // Obtener todas las direcciones
    async getDirecciones(req, res) {
        try {
            const direcciones = await this.Direccion.findMany({
                include: {
                    distrito: {
                        include: {
                            provincia: {
                                include: {
                                    departamento: true
                                }
                            }
                        }
                    },
                    geopoint: true,
                    local: true
                }
            });
            return res.status(200).json(direcciones);
        } catch (error) {
            console.error('Error al obtener direcciones:', error);
            return res.status(500).json({ error: 'Error al obtener direcciones' });
        }
    }

    // Obtener una dirección por ID
    async getDireccionById(req, res) {
        try {
            const { id } = req.params;
            const direccion = await this.Direccion.findUnique({
                where: { id: Number(id) },
                include: {
                    distrito: {
                        include: {
                            provincia: {
                                include: {
                                    departamento: true
                                }
                            }
                        }
                    },
                    geopoint: true,
                    local: true
                }
            });

            if (!direccion) {
                return res.status(404).json({ error: 'Dirección no encontrada' });
            }

            return res.status(200).json(direccion);
        } catch (error) {
            console.error('Error al obtener dirección por ID:', error);
            return res.status(500).json({ error: 'Error al obtener dirección' });
        }
    }

    // Obtener direcciones por distrito
    async getDireccionesByDistrito(req, res) {
        try {
            const { id_distrito } = req.params;
            
            if (!id_distrito) {
                return res.status(400).json({ error: 'El ID del distrito es requerido' });
            }

            const direcciones = await this.Direccion.findMany({
                where: { id_distrito: Number(id_distrito) },
                include: {
                    distrito: true,
                    geopoint: true,
                    local: true
                }
            });

            return res.status(200).json(direcciones);
        } catch (error) {
            console.error('Error al obtener direcciones por distrito:', error);
            return res.status(500).json({ error: 'Error al obtener direcciones por distrito' });
        }
    }

    // Crear una nueva dirección
    async createDireccion(req, res) {
        try {
            const { id_distrito, id_geopoint, referencia } = req.body;

            // Validar datos requeridos
            if (!id_distrito || !id_geopoint || !referencia) {
                return res.status(400).json({ 
                    error: 'El ID del distrito, ID del geopoint y la referencia son requeridos' 
                });
            }

            // Verificar si el distrito existe
            const distritoExistente = await this.prisma.distrito.findUnique({
                where: { id: Number(id_distrito) }
            });

            if (!distritoExistente) {
                return res.status(404).json({ error: 'El distrito especificado no existe' });
            }

            // Verificar si el geopoint existe
            const geopointExistente = await this.prisma.geopoint.findUnique({
                where: { id: Number(id_geopoint) }
            });

            if (!geopointExistente) {
                return res.status(404).json({ error: 'El geopoint especificado no existe' });
            }

            // Verificar si el geopoint ya está asociado a otra dirección
            const direccionExistente = await this.Direccion.findUnique({
                where: { id_geopoint: Number(id_geopoint) }
            });

            if (direccionExistente) {
                return res.status(400).json({ 
                    error: 'El geopoint ya está asociado a otra dirección' 
                });
            }

            // Crear la nueva dirección
            const nuevaDireccion = await this.Direccion.create({
                data: {
                    id_distrito: Number(id_distrito),
                    id_geopoint: Number(id_geopoint),
                    referencia
                },
                include: {
                    distrito: true,
                    geopoint: true
                }
            });

            return res.status(201).json(nuevaDireccion);
        } catch (error) {
            console.error('Error al crear dirección:', error);
            
            // Si el error es por restricciones de clave única
            if (error.code === 'P2002') {
                return res.status(400).json({ 
                    error: 'El geopoint ya está asociado a otra dirección' 
                });
            }
            
            return res.status(500).json({ error: 'Error al crear dirección' });
        }
    }

    // Actualizar una dirección existente
    async updateDireccion(req, res) {
        try {
            const { id } = req.params;
            const { id_distrito, referencia } = req.body;

            if (!id_distrito && !referencia) {
                return res.status(400).json({ 
                    error: 'Debe proporcionar al menos un campo para actualizar' 
                });
            }

            // Verificar si la dirección existe
            const direccionExistente = await this.Direccion.findUnique({
                where: { id: Number(id) }
            });

            if (!direccionExistente) {
                return res.status(404).json({ error: 'Dirección no encontrada' });
            }

            // Si se proporciona id_distrito, verificar si el distrito existe
            if (id_distrito) {
                const distritoExistente = await this.prisma.distrito.findUnique({
                    where: { id: Number(id_distrito) }
                });

                if (!distritoExistente) {
                    return res.status(404).json({ error: 'El distrito especificado no existe' });
                }
            }

            // Preparar datos para actualización
            const datosActualizacion = {};
            if (id_distrito) datosActualizacion.id_distrito = Number(id_distrito);
            if (referencia) datosActualizacion.referencia = referencia;

            // Actualizar la dirección
            const direccionActualizada = await this.Direccion.update({
                where: { id: Number(id) },
                data: datosActualizacion,
                include: {
                    distrito: true,
                    geopoint: true,
                    local: true
                }
            });

            return res.status(200).json(direccionActualizada);
        } catch (error) {
            console.error('Error al actualizar dirección:', error);
            return res.status(500).json({ error: 'Error al actualizar dirección' });
        }
    }

    // Eliminar una dirección
    async deleteDireccion(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la dirección existe
            const direccionExistente = await this.Direccion.findUnique({
                where: { id: Number(id) },
                include: {
                    local: true
                }
            });

            if (!direccionExistente) {
                return res.status(404).json({ error: 'Dirección no encontrada' });
            }

            // Verificar si tiene un local asociado
            if (direccionExistente.local) {
                return res.status(400).json({ 
                    error: 'No se puede eliminar la dirección porque tiene un local asociado' 
                });
            }

            // Eliminar la dirección
            await this.Direccion.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Dirección eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar dirección:', error);
            
            // Si el error es por restricciones de clave foránea
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'No se puede eliminar la dirección porque tiene un local asociado' 
                });
            }
            
            return res.status(500).json({ error: 'Error al eliminar dirección' });
        }
    }
}

export default DireccionController;