class TiendaController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.Local = this.prisma.local;
        this.TipoLocal = this.prisma.tipoLocal;
    }

    async getTiendaTypeId() {
        const tipoLocal = await this.TipoLocal.findFirst({ where: { nombre: 'Tienda' } });
        if (!tipoLocal) {
            throw new Error('El tipo de local "Tienda" no existe. Asegúrese de poblar la base de datos.');
        }
        return tipoLocal.id;
    }

    async getTiendas(req, res) {
        try {
            const { nombre, almacen, distrito, provincia, departamento } = req.query;
            
            const page = parseInt(req.query.page);
            const per_page = parseInt(req.query.per_page);

            // Validar paginación
            if (req.query.page && (isNaN(page) || page < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'page debe ser un número mayor a 0'
                });
            }

            if (req.query.per_page && (isNaN(per_page) || per_page < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'per_page debe ser un número mayor a 0'
                });
            }

            const pageNumber = page || 1;
            const per_pageNumber = per_page || 10;
            const skip = (pageNumber - 1) * per_pageNumber;

            const tiendaTypeId = await this.getTiendaTypeId();

            const where = {
                id_tipo_local: tiendaTypeId,
            };

            if (nombre) {
                where.nombre = { contains: nombre, mode: 'insensitive' };
            }

            if (almacen) {
                const almacenId = parseInt(almacen);
                if (isNaN(almacenId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'almacen debe ser un número válido'
                    });
                }
                where.almacenesQueRecibe = {
                    some: {
                        id_almacen: almacenId
                    }
                };
            }

            if (distrito) {
                const distritoId = parseInt(distrito);
                if (isNaN(distritoId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'distrito debe ser un número válido'
                    });
                }
                where.direccion = { distrito: { id: distritoId } };
            }

            if (provincia) {
                const provinciaId = parseInt(provincia);
                if (isNaN(provinciaId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'provincia debe ser un número válido'
                    });
                }
                where.direccion = { 
                    ...where.direccion, 
                    distrito: { 
                        ...where.direccion?.distrito, 
                        provincia: { id: provinciaId } 
                    } 
                };
            }

            if (departamento) {
                const departamentoId = parseInt(departamento);
                if (isNaN(departamentoId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'departamento debe ser un número válido'
                    });
                }
                where.direccion = { 
                    ...where.direccion, 
                    distrito: { 
                        ...where.direccion?.distrito, 
                        provincia: { 
                            ...where.direccion?.distrito?.provincia, 
                            departamento: { id: departamentoId } 
                        } 
                    } 
                };
            }

            const tiendas = await this.Local.findMany({
                where,
                skip,
                take: per_pageNumber,
                include: {
                    almacenesQueRecibe: {
                        include: {
                            almacen: {
                                select: {
                                    id: true,
                                    nombre: true,
                                },
                            },
                        },
                    },
                    direccion: {
                        include: {
                            geopoint: true,
                            distrito: {
                                include: {
                                    provincia: {
                                        include: {
                                            departamento: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    tipoLocal: true,
                },
                orderBy: {
                    id: 'asc'
                }
            });

            const total = await this.Local.count({ where });

            // Mapear el resultado
            const resultadoMapeado = tiendas.map(tienda => ({
                id: tienda.id,
                imagen: tienda.imagen,
                nombre: tienda.nombre,
                almacenes: tienda.almacenesQueRecibe && tienda.almacenesQueRecibe.length > 0 
                    ? tienda.almacenesQueRecibe.map(rel => rel.almacen.nombre).join(', ')
                    : 'Sin asignar',
                estado: tienda.estado,
                direccion: {
                    referencia: tienda.direccion.referencia,
                    geopoint: tienda.direccion.geopoint ? {
                        latitud: tienda.direccion.geopoint.latitud,
                        longitud: tienda.direccion.geopoint.longitud
                    } : null
                },
                distrito: tienda.direccion.distrito.nombre,
                provincia: tienda.direccion.distrito.provincia.nombre,
                departamento: tienda.direccion.distrito.provincia.departamento.nombre,
            }));

            res.status(200).json({
                success: true,
                data: resultadoMapeado,
                pagination: {
                    page: pageNumber,
                    per_page: per_pageNumber,
                    total: total,
                    total_pages: Math.ceil(total / per_pageNumber),
                },
            });
        } catch (error) {
            console.error('Error al obtener tiendas:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al obtener tiendas', 
                error: error.message 
            });
        }
    }

    async getTiendaById(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido, debe ser un número'
                });
            }

            const tiendaTypeId = await this.getTiendaTypeId();

            const tienda = await this.Local.findFirst({
                where: {
                    id: idNumerico,
                    id_tipo_local: tiendaTypeId,
                },
                include: {
                    almacenesQueRecibe: {
                        include: {
                            almacen: {
                                select: {
                                    id: true,
                                    nombre: true,
                                },
                            },
                        },
                    },
                    tipoLocal: true,
                    direccion: {
                        include: {
                            distrito: {
                                include: {
                                    provincia: {
                                        include: {
                                            departamento: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!tienda) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Tienda no encontrada' 
                });
            }

            const resultadoMapeado = {
                id: tienda.id,
                imagen: tienda.imagen,
                nombre: tienda.nombre,
                almacenes: tienda.almacenesQueRecibe && tienda.almacenesQueRecibe.length > 0 
                    ? tienda.almacenesQueRecibe.map(rel => rel.almacen.nombre).join(', ')
                    : 'Sin asignar',
                estado: tienda.estado,
                direccion: tienda.direccion.referencia,
                distrito: tienda.direccion.distrito.nombre,
                provincia: tienda.direccion.distrito.provincia.nombre,
                departamento: tienda.direccion.distrito.provincia.departamento.nombre,
            };

            res.status(200).json({
                success: true,
                data: resultadoMapeado
            });
        } catch (error) {
            console.error('Error al obtener tienda por ID:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al obtener tienda por ID', 
                error: error.message 
            });
        }
    }

    async createTienda(req, res) {
        const { nombre, imagen, estado, referencia, id_distrito, latitud, longitud } = req.body;

        try {
            // Validar campos requeridos
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo nombre es requerido y no puede estar vacío'
                });
            }

            if (!referencia || referencia.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo referencia es requerido'
                });
            }

            if (!id_distrito) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo id_distrito es requerido'
                });
            }

            if (latitud === undefined || latitud === null) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo latitud es requerido'
                });
            }

            if (longitud === undefined || longitud === null) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo longitud es requerido'
                });
            }

            // Validar longitud de nombre
            if (nombre.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder los 30 caracteres'
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

            // Validar id_distrito
            const distritoId = parseInt(id_distrito);
            if (isNaN(distritoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'id_distrito debe ser un número válido'
                });
            }

            // Validar estado (opcional, pero si se proporciona debe ser válido)
            const estadosValidos = ['ACTIVO', 'INACTIVO'];
            if (estado && !estadosValidos.includes(estado.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'estado debe ser ACTIVO o INACTIVO'
                });
            }

            const tiendaTypeId = await this.getTiendaTypeId();
            
            const newTienda = await this.prisma.$transaction(async (prisma) => {
                const geopoint = await prisma.geopoint.create({
                    data: {
                        latitud: lat,
                        longitud: lng,
                    },
                });

                const direccion = await prisma.direccion.create({
                    data: {
                        referencia: referencia.trim(),
                        id_distrito: distritoId,
                        id_geopoint: geopoint.id,
                    },
                });

                const tienda = await prisma.local.create({
                    data: {
                        nombre: nombre.trim(),
                        imagen: imagen || null,
                        estado: estado ? estado.toUpperCase() : 'INACTIVO',
                        id_direccion: direccion.id,
                        id_tipo_local: tiendaTypeId,
                    },
                    include: {
                        almacenesQueRecibe: {
                            include: {
                                almacen: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                    },
                                },
                            },
                        },
                        tipoLocal: true,
                        direccion: {
                            include: {
                                distrito: {
                                    include: {
                                        provincia: {
                                            include: {
                                                departamento: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                return tienda;
            });

            const resultadoMapeado = {
                id: newTienda.id,
                imagen: newTienda.imagen,
                nombre: newTienda.nombre,
                almacenes: newTienda.almacenesQueRecibe && newTienda.almacenesQueRecibe.length > 0 
                    ? newTienda.almacenesQueRecibe.map(rel => rel.almacen.nombre).join(', ')
                    : 'Sin asignar',
                estado: newTienda.estado,
                direccion: newTienda.direccion.referencia,
                distrito: newTienda.direccion.distrito.nombre,
                provincia: newTienda.direccion.distrito.provincia.nombre,
                departamento: newTienda.direccion.distrito.provincia.departamento.nombre,
            };

            res.status(201).json({
                success: true,
                data: resultadoMapeado,
                message: 'Tienda creada exitosamente'
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    message: 'El id_distrito proporcionado no existe',
                    error: error.message
                });
            }

            console.error('Error al crear tienda:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al crear tienda', 
                error: error.message 
            });
        }
    }

    async updateTienda(req, res) {
        const { id } = req.params;
        const { nombre, imagen, estado, referencia, id_distrito, latitud, longitud } = req.body;

        try {
            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            // Validar que al menos un campo se esté actualizando
            if (!nombre && !imagen && !estado && !referencia && !id_distrito && !latitud && !longitud) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar al menos un campo para actualizar'
                });
            }

            // Validar nombre si se proporciona
            if (nombre !== undefined) {
                if (typeof nombre !== 'string' || nombre.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        message: 'El nombre debe ser una cadena no vacía'
                    });
                }
                if (nombre.length > 30) {
                    return res.status(400).json({
                        success: false,
                        message: 'El nombre no puede exceder los 30 caracteres'
                    });
                }
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

            // Validar id_distrito si se proporciona
            if (id_distrito !== undefined) {
                const distritoId = parseInt(id_distrito);
                if (isNaN(distritoId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'id_distrito debe ser un número válido'
                    });
                }
            }

            // Validar estado si se proporciona
            const estadosValidos = ['ACTIVO', 'INACTIVO'];
            if (estado && !estadosValidos.includes(estado.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'estado debe ser ACTIVO o INACTIVO'
                });
            }

            const tiendaTypeId = await this.getTiendaTypeId();
            const updatedTienda = await this.prisma.$transaction(async (prisma) => {
                const existingTienda = await prisma.local.findFirst({
                    where: {
                        id: idNumerico,
                        id_tipo_local: tiendaTypeId,
                    },
                    include: {
                        direccion: true,
                    },
                });

                if (!existingTienda) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tienda no encontrada'
                    });
                }

                // Actualizar Geopoint si se proporcionan latitud o longitud
                if (latitud !== undefined || longitud !== undefined) {
                    const geopointData = {};
                    if (latitud !== undefined) {
                        geopointData.latitud = parseFloat(latitud);
                    }
                    if (longitud !== undefined) {
                        geopointData.longitud = parseFloat(longitud);
                    }

                    await prisma.geopoint.update({
                        where: { id: existingTienda.direccion.id_geopoint },
                        data: geopointData,
                    });
                }

                // Actualizar Direccion si se proporcionan referencia o id_distrito
                if (referencia !== undefined || id_distrito !== undefined) {
                    const direccionData = {};
                    if (referencia !== undefined) {
                        direccionData.referencia = referencia.trim();
                    }
                    if (id_distrito !== undefined) {
                        direccionData.id_distrito = parseInt(id_distrito);
                    }

                    await prisma.direccion.update({
                        where: { id: existingTienda.id_direccion },
                        data: direccionData,
                    });
                }

                // Actualizar Local
                const localData = {};
                if (nombre !== undefined) {
                    localData.nombre = nombre.trim();
                }
                if (imagen !== undefined) {
                    localData.imagen = imagen;
                }
                if (estado !== undefined) {
                    localData.estado = estado.toUpperCase();
                }

                const tienda = await prisma.local.update({
                    where: { id: idNumerico },
                    data: localData,
                    include: {
                        almacenesQueRecibe: {
                            include: {
                                almacen: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                    },
                                },
                            },
                        },
                        tipoLocal: true,
                        direccion: {
                            include: {
                                distrito: {
                                    include: {
                                        provincia: {
                                            include: {
                                                departamento: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                return tienda;
            });

            const resultadoMapeado = {
                id: updatedTienda.id,
                imagen: updatedTienda.imagen,
                nombre: updatedTienda.nombre,
                almacenes: updatedTienda.almacenesQueRecibe && updatedTienda.almacenesQueRecibe.length > 0 
                    ? updatedTienda.almacenesQueRecibe.map(rel => rel.almacen.nombre).join(', ')
                    : 'Sin asignar',
                estado: updatedTienda.estado,
                direccion: updatedTienda.direccion.referencia,
                distrito: updatedTienda.direccion.distrito.nombre,
                provincia: updatedTienda.direccion.distrito.provincia.nombre,
                departamento: updatedTienda.direccion.distrito.provincia.departamento.nombre,
            };

            res.status(200).json({
                success: true,
                data: resultadoMapeado,
                message: 'Tienda actualizada exitosamente'
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Tienda no encontrada',
                    error: error.message
                });
            }

            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    message: 'El id_distrito proporcionado no existe',
                    error: error.message
                });
            }

            console.error('Error al actualizar tienda:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al actualizar tienda', 
                error: error.message 
            });
        }
    }

    async deleteTienda(req, res) {
        const { id } = req.params;

        try {
            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            const tiendaTypeId = await this.getTiendaTypeId();
            const deletedTienda = await this.prisma.$transaction(async (prisma) => {
                const existingTienda = await prisma.local.findFirst({
                    where: {
                        id: idNumerico,
                        id_tipo_local: tiendaTypeId,
                    },
                    include: {
                        direccion: true,
                    },
                });

                if (!existingTienda) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tienda no encontrada'
                    });
                }

                // Eliminar el Local
                await prisma.local.delete({
                    where: { id: idNumerico },
                });

                // Eliminar la Direccion asociada
                await prisma.direccion.delete({
                    where: { id: existingTienda.id_direccion },
                });

                // Eliminar el Geopoint asociado
                await prisma.geopoint.delete({
                    where: { id: existingTienda.direccion.id_geopoint },
                });

                return existingTienda;
            });

            res.status(200).json({ 
                success: true,
                message: 'Tienda eliminada correctamente', 
                data: { id: deletedTienda.id }
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Tienda no encontrada',
                    error: error.message
                });
            }

            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar la tienda porque tiene registros relacionados',
                    error: error.message
                });
            }

            console.error('Error al eliminar tienda:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al eliminar tienda', 
                error: error.message 
            });
        }
    }
}

export default TiendaController;