class ProvinciaController {
    constructor (instacePrisma) {
        this.prisma = instacePrisma;
        this.Provincia = this.prisma.provincia;
    }

    // Obtener todas las provincias
    async getProvincias(req, res) {
        try {
            const { id_departamento } = req.query;

            // Si se proporciona id_departamento como query param, filtrar por ese departamento
            if (id_departamento) {
                const provincias = await this.Provincia.findMany({
                    where: { 
                        id_departamento: Number(id_departamento) 
                    },
                    include: {
                        departamento: true,
                        distritos: true
                    }
                });
                return res.status(200).json({ success: true, data: provincias });
            }

            // Si no hay filtro, devolver todas las provincias
            const provincias = await this.Provincia.findMany({
                include: {
                    departamento: true,
                    distritos: true
                }
            });
            return res.status(200).json({ success: true, data: provincias });
        } catch (error) {
            console.error('Error al obtener provincias:', error);
            return res.status(500).json({ success: false, error: 'Error al obtener provincias' });
        }
    }

    // Obtener una provincia por ID
    async getProvinciaById(req, res) {
        try {
            const { id } = req.params;
            const provincia = await this.Provincia.findUnique({
                where: { id: Number(id) },
                include: {
                    departamento: true,
                    distritos: true
                }
            });

            if (!provincia) {
                return res.status(404).json({ success: false, error: 'Provincia no encontrada' });
            }

            return res.status(200).json({ success: true, data: provincia });
        } catch (error) {
            console.error('Error al obtener provincia por ID:', error);
            return res.status(500).json({ success: false, error: 'Error al obtener provincia' });
        }
    }

    // Obtener provincias por departamento
    async getProvinciasByDepartamento(req, res) {
        try {
            const { departamentoId } = req.params;
            
            const provincias = await this.Provincia.findMany({
                where: { 
                    id_departamento: Number(departamentoId) 
                },
                include: {
                    distritos: true
                }
            });

            return res.status(200).json({ success: true, data: provincias });
        } catch (error) {
            console.error('Error al obtener provincias por departamento:', error);
            return res.status(500).json({ success: false, error: 'Error al obtener provincias por departamento' });
        }
    }

    // Crear una nueva provincia
    async createProvincia(req, res) {
        try {
            const { nombre, id_departamento } = req.body;

            if (!nombre || !id_departamento) {
                return res.status(400).json({ 
                    error: 'El nombre de la provincia y el ID del departamento son requeridos' 
                });
            }

            // Verificar si el departamento existe
            const departamento = await this.prisma.departamento.findUnique({
                where: { id: Number(id_departamento) }
            });

            if (!departamento) {
                return res.status(404).json({ error: 'El departamento especificado no existe' });
            }

            const nuevaProvincia = await this.Provincia.create({
                data: { 
                    nombre,
                    id_departamento: Number(id_departamento)
                }
            });

            return res.status(201).json(nuevaProvincia);
        } catch (error) {
            console.error('Error al crear provincia:', error);
            return res.status(500).json({ error: 'Error al crear provincia' });
        }
    }

    // Actualizar una provincia existente
    async updateProvincia(req, res) {
        try {
            const { id } = req.params;
            const { nombre, id_departamento } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: 'El nombre de la provincia es requerido' });
            }

            // Verificar si la provincia existe
            const provinciaExistente = await this.Provincia.findUnique({
                where: { id: Number(id) }
            });

            if (!provinciaExistente) {
                return res.status(404).json({ error: 'Provincia no encontrada' });
            }

            // Si se proporciona un nuevo departamento, verificar que exista
            if (id_departamento) {
                const departamento = await this.prisma.departamento.findUnique({
                    where: { id: Number(id_departamento) }
                });

                if (!departamento) {
                    return res.status(404).json({ error: 'El departamento especificado no existe' });
                }
            }

            // Actualizar la provincia
            const provinciaActualizada = await this.Provincia.update({
                where: { id: Number(id) },
                data: { 
                    nombre,
                    ...(id_departamento && { id_departamento: Number(id_departamento) })
                }
            });

            return res.status(200).json(provinciaActualizada);
        } catch (error) {
            console.error('Error al actualizar provincia:', error);
            return res.status(500).json({ error: 'Error al actualizar provincia' });
        }
    }

    // Eliminar una provincia
    async deleteProvincia(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la provincia existe
            const provinciaExistente = await this.Provincia.findUnique({
                where: { id: Number(id) }
            });

            if (!provinciaExistente) {
                return res.status(404).json({ error: 'Provincia no encontrada' });
            }

            // Eliminar la provincia
            await this.Provincia.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Provincia eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar provincia:', error);
            
            // Si el error es por restricciones de clave foránea (tiene distritos asociados)
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'No se puede eliminar la provincia porque tiene distritos asociados' 
                });
            }
            
            return res.status(500).json({ error: 'Error al eliminar provincia' });
        }
    }
}

export default ProvinciaController;