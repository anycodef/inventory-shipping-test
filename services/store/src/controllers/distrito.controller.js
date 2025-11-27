class DistritoController {
    constructor (instacePrisma) {
        this.prisma = instacePrisma;
        this.Distrito = this.prisma.distrito;
    }

    // Obtener todos los distritos
    async getDistritos(req, res) {
        try {
            const { id_provincia } = req.query;

            // Si se proporciona id_provincia como query param, filtrar por esa provincia
            if (id_provincia) {
                const distritos = await this.Distrito.findMany({
                    where: { 
                        id_provincia: Number(id_provincia) 
                    },
                    include: {
                        provincia: true,
                        direcciones: true
                    }
                });
                return res.status(200).json(distritos);
            }

            // Si no hay filtro, devolver todos los distritos
            const distritos = await this.Distrito.findMany({
                include: {
                    provincia: true,
                    direcciones: true
                }
            });
            return res.status(200).json(distritos);
        } catch (error) {
            console.error('Error al obtener distritos:', error);
            return res.status(500).json({ error: 'Error al obtener distritos' });
        }
    }

    // Obtener un distrito por ID
    async getDistritoById(req, res) {
        try {
            const { id } = req.params;
            const distrito = await this.Distrito.findUnique({
                where: { id: Number(id) },
                include: {
                    provincia: true,
                    direcciones: true
                }
            });

            if (!distrito) {
                return res.status(404).json({ error: 'Distrito no encontrado' });
            }

            return res.status(200).json(distrito);
        } catch (error) {
            console.error('Error al obtener distrito por ID:', error);
            return res.status(500).json({ error: 'Error al obtener distrito' });
        }
    }

    // Obtener distritos por provincia
    async getDistritosByProvincia(req, res) {
        try {
            const { provinciaId } = req.params;
            
            const distritos = await this.Distrito.findMany({
                where: { 
                    id_provincia: Number(provinciaId) 
                },
                include: {
                    direcciones: true
                }
            });

            return res.status(200).json(distritos);
        } catch (error) {
            console.error('Error al obtener distritos por provincia:', error);
            return res.status(500).json({ error: 'Error al obtener distritos por provincia' });
        }
    }

    // Crear un nuevo distrito
    async createDistrito(req, res) {
        try {
            const { nombre, id_provincia } = req.body;

            if (!nombre || !id_provincia) {
                return res.status(400).json({ 
                    error: 'El nombre del distrito y el ID de la provincia son requeridos' 
                });
            }

            // Verificar si la provincia existe
            const provincia = await this.prisma.provincia.findUnique({
                where: { id: Number(id_provincia) }
            });

            if (!provincia) {
                return res.status(404).json({ error: 'La provincia especificada no existe' });
            }

            const nuevoDistrito = await this.Distrito.create({
                data: { 
                    nombre,
                    id_provincia: Number(id_provincia)
                }
            });

            return res.status(201).json(nuevoDistrito);
        } catch (error) {
            console.error('Error al crear distrito:', error);
            return res.status(500).json({ error: 'Error al crear distrito' });
        }
    }

    // Actualizar un distrito existente
    async updateDistrito(req, res) {
        try {
            const { id } = req.params;
            const { nombre, id_provincia } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: 'El nombre del distrito es requerido' });
            }

            // Verificar si el distrito existe
            const distritoExistente = await this.Distrito.findUnique({
                where: { id: Number(id) }
            });

            if (!distritoExistente) {
                return res.status(404).json({ error: 'Distrito no encontrado' });
            }

            // Si se proporciona una nueva provincia, verificar que exista
            if (id_provincia) {
                const provincia = await this.prisma.provincia.findUnique({
                    where: { id: Number(id_provincia) }
                });

                if (!provincia) {
                    return res.status(404).json({ error: 'La provincia especificada no existe' });
                }
            }

            // Actualizar el distrito
            const distritoActualizado = await this.Distrito.update({
                where: { id: Number(id) },
                data: { 
                    nombre,
                    ...(id_provincia && { id_provincia: Number(id_provincia) })
                }
            });

            return res.status(200).json(distritoActualizado);
        } catch (error) {
            console.error('Error al actualizar distrito:', error);
            return res.status(500).json({ error: 'Error al actualizar distrito' });
        }
    }

    // Eliminar un distrito
    async deleteDistrito(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el distrito existe
            const distritoExistente = await this.Distrito.findUnique({
                where: { id: Number(id) }
            });

            if (!distritoExistente) {
                return res.status(404).json({ error: 'Distrito no encontrado' });
            }

            // Eliminar el distrito
            await this.Distrito.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Distrito eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar distrito:', error);
            
            // Si el error es por restricciones de clave foránea (tiene direcciones asociadas)
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'No se puede eliminar el distrito porque tiene direcciones asociadas' 
                });
            }
            
            return res.status(500).json({ error: 'Error al eliminar distrito' });
        }
    }
}
export default DistritoController;