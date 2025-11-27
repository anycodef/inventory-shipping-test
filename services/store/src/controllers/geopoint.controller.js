class GeoPointController {
    constructor (instacePrisma) {
        this.prisma = instacePrisma;
        this.GeoPoint = this.prisma.geopoint;
    }

    // Obtener todos los geopoints
    async getGeoPoints(req, res) {
        try {
            const geopoints = await this.GeoPoint.findMany({
                include: {
                    direccion: true
                }
            });
            return res.status(200).json({
                success: true,
                data: geopoints
            });
        } catch (error) {
            console.error('Error al obtener geopoints:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al obtener geopoints',
                error: error.message
            });
        }
    }

    // Obtener un geopoint por ID
    async getGeoPointById(req, res) {
        try {
            const { id } = req.params;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            const geopoint = await this.GeoPoint.findUnique({
                where: { id: idNumerico },
                include: {
                    direccion: true
                }
            });

            if (!geopoint) {
                return res.status(404).json({ 
                    success: false,
                    message: 'GeoPoint no encontrado' 
                });
            }

            return res.status(200).json({
                success: true,
                data: geopoint
            });
        } catch (error) {
            console.error('Error al obtener geopoint por ID:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al obtener geopoint',
                error: error.message
            });
        }
    }

    // Crear un nuevo geopoint
    async createGeoPoint(req, res) {
        try {
            const { latitud, longitud } = req.body;

            if (latitud === undefined || longitud === undefined) {
                return res.status(400).json({ 
                    success: false,
                    message: 'La latitud y longitud son requeridas' 
                });
            }

            // Validar coordenadas
            const lat = parseFloat(latitud);
            const lng = parseFloat(longitud);

            if (isNaN(lat)) {
                return res.status(400).json({
                    success: false,
                    message: 'latitud debe ser un número válido'
                });
            }

            if (isNaN(lng)) {
                return res.status(400).json({
                    success: false,
                    message: 'longitud debe ser un número válido'
                });
            }

            // Validar rango de coordenadas
            if (lat < -90 || lat > 90) {
                return res.status(400).json({
                    success: false,
                    message: 'latitud debe estar entre -90 y 90'
                });
            }

            if (lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    message: 'longitud debe estar entre -180 y 180'
                });
            }

            const nuevoGeoPoint = await this.GeoPoint.create({
                data: { 
                    latitud: lat,
                    longitud: lng
                }
            });

            return res.status(201).json({
                success: true,
                data: nuevoGeoPoint,
                message: 'GeoPoint creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear geopoint:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al crear geopoint',
                error: error.message
            });
        }
    }

    // Actualizar un geopoint existente
    async updateGeoPoint(req, res) {
        try {
            const { id } = req.params;
            const { latitud, longitud } = req.body;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            if (latitud === undefined && longitud === undefined) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Debe proporcionar al menos latitud o longitud para actualizar' 
                });
            }

            // Validar coordenadas si se proporcionan
            if (latitud !== undefined) {
                const lat = parseFloat(latitud);
                if (isNaN(lat)) {
                    return res.status(400).json({
                        success: false,
                        message: 'latitud debe ser un número válido'
                    });
                }
                if (lat < -90 || lat > 90) {
                    return res.status(400).json({
                        success: false,
                        message: 'latitud debe estar entre -90 y 90'
                    });
                }
            }

            if (longitud !== undefined) {
                const lng = parseFloat(longitud);
                if (isNaN(lng)) {
                    return res.status(400).json({
                        success: false,
                        message: 'longitud debe ser un número válido'
                    });
                }
                if (lng < -180 || lng > 180) {
                    return res.status(400).json({
                        success: false,
                        message: 'longitud debe estar entre -180 y 180'
                    });
                }
            }

            // Verificar si el geopoint existe
            const geopointExistente = await this.GeoPoint.findUnique({
                where: { id: idNumerico }
            });

            if (!geopointExistente) {
                return res.status(404).json({ 
                    success: false,
                    message: 'GeoPoint no encontrado' 
                });
            }

            // Preparar datos para actualización
            const datosActualizacion = {};
            if (latitud !== undefined) datosActualizacion.latitud = parseFloat(latitud);
            if (longitud !== undefined) datosActualizacion.longitud = parseFloat(longitud);

            // Actualizar el geopoint
            const geopointActualizado = await this.GeoPoint.update({
                where: { id: idNumerico },
                data: datosActualizacion
            });

            return res.status(200).json({
                success: true,
                data: geopointActualizado,
                message: 'GeoPoint actualizado exitosamente'
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'GeoPoint no encontrado',
                    error: error.message
                });
            }

            console.error('Error al actualizar geopoint:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al actualizar geopoint',
                error: error.message
            });
        }
    }

    // Eliminar un geopoint
    async deleteGeoPoint(req, res) {
        try {
            const { id } = req.params;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            // Verificar si el geopoint existe
            const geopointExistente = await this.GeoPoint.findUnique({
                where: { id: idNumerico },
                include: {
                    direccion: true
                }
            });

            if (!geopointExistente) {
                return res.status(404).json({ 
                    success: false,
                    message: 'GeoPoint no encontrado' 
                });
            }

            // Verificar si tiene una dirección asociada
            if (geopointExistente.direccion) {
                return res.status(400).json({ 
                    success: false,
                    message: 'No se puede eliminar el geopoint porque tiene una dirección asociada' 
                });
            }

            // Eliminar el geopoint
            await this.GeoPoint.delete({
                where: { id: idNumerico }
            });

            return res.status(200).json({ 
                success: true,
                message: 'GeoPoint eliminado correctamente',
                data: { id: idNumerico }
            });
        } catch (error) {
            console.error('Error al eliminar geopoint:', error);
            
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    success: false,
                    message: 'No se puede eliminar el geopoint porque tiene una dirección asociada',
                    error: error.message
                });
            }

            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'GeoPoint no encontrado',
                    error: error.message
                });
            }
            
            return res.status(500).json({ 
                success: false,
                message: 'Error al eliminar geopoint',
                error: error.message
            });
        }
    }
}
export default GeoPointController;