class TipoLocalController {
    constructor (instacePrisma) {
        this.prisma = instacePrisma;
        this.TipoLocal = this.prisma.tipoLocal;
    }

    // Obtener todos los tipos de local
    async getTiposLocal(req, res) {
        try {
            const tiposLocal = await this.TipoLocal.findMany({
                include: {
                    locales: true
                }
            });
            return res.status(200).json(tiposLocal);
        } catch (error) {
            console.error('Error al obtener tipos de local:', error);
            return res.status(500).json({ error: 'Error al obtener tipos de local' });
        }
    }

    // Obtener un tipo de local por ID
    async getTipoLocalById(req, res) {
        try {
            const { id } = req.params;
            const tipoLocal = await this.TipoLocal.findUnique({
                where: { id: Number(id) },
                include: {
                    locales: true
                }
            });

            if (!tipoLocal) {
                return res.status(404).json({ error: 'Tipo de local no encontrado' });
            }

            return res.status(200).json(tipoLocal);
        } catch (error) {
            console.error('Error al obtener tipo de local por ID:', error);
            return res.status(500).json({ error: 'Error al obtener tipo de local' });
        }
    }

    // Crear un nuevo tipo de local
    async createTipoLocal(req, res) {
        try {
            const { nombre, descripcion } = req.body;

            // Validar datos requeridos
            if (!nombre) {
                return res.status(400).json({ 
                    error: 'El nombre del tipo de local es requerido' 
                });
            }

            // Verificar si ya existe un tipo de local con el mismo nombre
            const tipoLocalExistente = await this.TipoLocal.findFirst({
                where: { nombre }
            });

            if (tipoLocalExistente) {
                return res.status(400).json({ 
                    error: 'Ya existe un tipo de local con ese nombre' 
                });
            }

            // Crear el nuevo tipo de local
            const nuevoTipoLocal = await this.TipoLocal.create({
                data: {
                    nombre,
                    descripcion
                }
            });

            return res.status(201).json(nuevoTipoLocal);
        } catch (error) {
            console.error('Error al crear tipo de local:', error);
            return res.status(500).json({ error: 'Error al crear tipo de local' });
        }
    }

    // Actualizar un tipo de local existente
    async updateTipoLocal(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;

            if (!nombre && descripcion === undefined) {
                return res.status(400).json({ 
                    error: 'Debe proporcionar al menos un campo para actualizar' 
                });
            }

            // Verificar si el tipo de local existe
            const tipoLocalExistente = await this.TipoLocal.findUnique({
                where: { id: Number(id) }
            });

            if (!tipoLocalExistente) {
                return res.status(404).json({ error: 'Tipo de local no encontrado' });
            }

            // Si se proporciona un nombre, verificar que no exista otro tipo de local con ese nombre
            if (nombre && nombre !== tipoLocalExistente.nombre) {
                const nombreExistente = await this.TipoLocal.findFirst({
                    where: { 
                        nombre,
                        id: { not: Number(id) }
                    }
                });

                if (nombreExistente) {
                    return res.status(400).json({ 
                        error: 'Ya existe otro tipo de local con ese nombre' 
                    });
                }
            }

            // Preparar datos para actualización
            const datosActualizacion = {};
            if (nombre) datosActualizacion.nombre = nombre;
            if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;

            // Actualizar el tipo de local
            const tipoLocalActualizado = await this.TipoLocal.update({
                where: { id: Number(id) },
                data: datosActualizacion
            });

            return res.status(200).json(tipoLocalActualizado);
        } catch (error) {
            console.error('Error al actualizar tipo de local:', error);
            return res.status(500).json({ error: 'Error al actualizar tipo de local' });
        }
    }

    // Eliminar un tipo de local
    async deleteTipoLocal(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el tipo de local existe
            const tipoLocalExistente = await this.TipoLocal.findUnique({
                where: { id: Number(id) },
                include: {
                    locales: true
                }
            });

            if (!tipoLocalExistente) {
                return res.status(404).json({ error: 'Tipo de local no encontrado' });
            }

            // Verificar si tiene locales asociados
            if (tipoLocalExistente.locales && tipoLocalExistente.locales.length > 0) {
                return res.status(400).json({ 
                    error: 'No se puede eliminar el tipo de local porque tiene locales asociados' 
                });
            }

            // Eliminar el tipo de local
            await this.TipoLocal.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Tipo de local eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar tipo de local:', error);
            
            // Si el error es por restricciones de clave foránea
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'No se puede eliminar el tipo de local porque tiene locales asociados' 
                });
            }
            
            return res.status(500).json({ error: 'Error al eliminar tipo de local' });
        }
    }
}

export default TipoLocalController;