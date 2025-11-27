import fs from "fs/promises";
import { format } from "@fast-csv/format";
import { parseCSV } from "../utils/csvParser.js";
import { getLocalesByTipo, saveDataFromCSV } from "../models/local.model.js"

class LocalController {
    constructor(prisma) {
        this.prisma = prisma
        this.Local = this.prisma.local;
    }

    // Obtener todos los locales con paginación opcional
    async getLocales(req, res) {
        try {
            const {
                page = '1',
                per_page = '20',
                nombre,           // ✅ Nuevo: filtro opcional
                departamento,     // ✅ Nuevo: filtro opcional
                provincia,        // ✅ Nuevo: filtro opcional
                distrito          // ✅ Nuevo: filtro opcional
            } = req.query;

            // Validaciones;;
            const pageNumber = parseInt(page);
            const perPageNumber = parseInt(per_page);

            if (isNaN(pageNumber) || pageNumber < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'page debe ser un número mayor a 0'
                });
            }

            if (isNaN(perPageNumber) || perPageNumber < 1 || perPageNumber > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'per_page debe ser un número entre 1 y 100'
                });
            }

            // Construir filtros dinámicos
            const where = {};

            if (nombre) {
                where.nombre = {
                    contains: nombre,
                    mode: 'insensitive'
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
                where.direccion = {
                    id_distrito: distritoId
                };
            }

            if (provincia && !distrito) {
                const provinciaId = parseInt(provincia);
                if (isNaN(provinciaId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'provincia debe ser un número válido'
                    });
                }
                where.direccion = {
                    distrito: {
                        id_provincia: provinciaId
                    }
                };
            }

            if (departamento && !provincia && !distrito) {
                const departamentoId = parseInt(departamento);
                if (isNaN(departamentoId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'departamento debe ser un número válido'
                    });
                }
                where.direccion = {
                    distrito: {
                        provincia: {
                            id_departamento: departamentoId
                        }
                    }
                };
            }

            // Obtener total y datos
            const [total, locales] = await Promise.all([
                this.Local.count({ where }),
                this.Local.findMany({
                    where,
                    include: {
                        tipoLocal: true,
                        direccion: {
                            include: {
                                geopoint: true,
                                distrito: {
                                    include: {
                                        provincia: {
                                            include: {
                                                departamento: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    skip: (pageNumber - 1) * perPageNumber,
                    take: perPageNumber,
                    orderBy: {
                        id: 'desc'
                    }
                })
            ]);

            res.status(200).json({
                success: true,
                data: locales,
                pagination: {
                    page: pageNumber,
                    per_page: perPageNumber,
                    total: total,
                    total_pages: Math.ceil(total / perPageNumber)
                }
            });

        } catch (error) {
            console.error('Error al obtener locales:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los locales',
                error: error.message
            });
        }
        ;
    }
    // Obtener un local por ID
    async getLocalById(req, res) {
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

            const local = await this.Local.findUnique({
                where: { id: idNumerico },
                include: {
                    direccion: {
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
                            geopoint: true
                        }
                    },
                    tipoLocal: true
                }
            });

            if (!local) {
                return res.status(404).json({
                    success: false,
                    message: 'Local no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: local
            });
        } catch (error) {
            console.error('Error al obtener local por ID:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener local',
                error: error.message
            });
        }
    }

    // Obtener locales por tipo (CON PAGINACIÓN Y FILTROS)
    async getLocalesByTipo(req, res) {
        try {
            const { id_tipo_local } = req.params;
            const {
                page = '1',
                per_page = '20',
                nombre,
                departamento,
                provincia,
                distrito
            } = req.query;

            if (!id_tipo_local) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del tipo de local es requerido'
                });
            }

            // Validar ID
            const tipoLocalId = parseInt(id_tipo_local);
            if (isNaN(tipoLocalId)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del tipo de local debe ser un número válido'
                });
            }

            // Validar paginación
            const pageNumber = parseInt(page);
            const perPageNumber = parseInt(per_page);

            if (isNaN(pageNumber) || pageNumber < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'page debe ser un número mayor a 0'
                });
            }

            if (isNaN(perPageNumber) || perPageNumber < 1 || perPageNumber > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'per_page debe ser un número entre 1 y 100'
                });
            }

            // Verificar si el tipo de local existe
            const tipoLocalExistente = await this.prisma.tipoLocal.findUnique({
                where: { id: tipoLocalId }
            });

            if (!tipoLocalExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de local no encontrado'
                });
            }

            // Construir filtros dinámicos
            const where = { id_tipo_local: tipoLocalId };

            if (nombre) {
                where.nombre = {
                    contains: nombre,
                    mode: 'insensitive'
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
                where.direccion = { id_distrito: distritoId };
            }

            if (provincia && !distrito) {
                const provinciaId = parseInt(provincia);
                if (isNaN(provinciaId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'provincia debe ser un número válido'
                    });
                }
                where.direccion = {
                    distrito: { id_provincia: provinciaId }
                };
            }

            if (departamento && !provincia && !distrito) {
                const departamentoId = parseInt(departamento);
                if (isNaN(departamentoId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'departamento debe ser un número válido'
                    });
                }
                where.direccion = {
                    distrito: {
                        provincia: { id_departamento: departamentoId }
                    }
                };
            }

            // Configurar includes según el tipo de local
            const include = {
                tipoLocal: true,
                direccion: {
                    include: {
                        geopoint: true,
                        distrito: {
                            include: {
                                provincia: {
                                    include: { departamento: true }
                                }
                            }
                        }
                    }
                }
            };

            // Si es almacén (tipo 1), incluir las tiendas que abastece
            if (tipoLocalId === 1) {
                include.almacenesQueAbastecen = {
                    include: {
                        tienda: {
                            select: {
                                id: true,
                                nombre: true,
                                estado: true,
                                direccion: {
                                    select: {
                                        referencia: true,
                                        distrito: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            }

            // Si es tienda (tipo 2), incluir los almacenes que la abastecen
            if (tipoLocalId === 2) {
                include.almacenesQueRecibe = {
                    include: {
                        almacen: {
                            select: {
                                id: true,
                                nombre: true,
                                estado: true,
                                direccion: {
                                    select: {
                                        referencia: true,
                                        distrito: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            }

            // Obtener total y datos con paginación
            const [total, locales] = await Promise.all([
                this.Local.count({ where }),
                this.Local.findMany({
                    where,
                    include,
                    skip: (pageNumber - 1) * perPageNumber,
                    take: perPageNumber,
                    orderBy: { id: 'desc' }
                })
            ]);

            return res.status(200).json({
                success: true,
                data: locales,
                pagination: {
                    page: pageNumber,
                    per_page: perPageNumber,
                    total: total,
                    total_pages: Math.ceil(total / perPageNumber)
                }
            });
        } catch (error) {
            console.error('Error al obtener locales por tipo:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener locales por tipo',
                error: error.message
            });
        }
    }

    // Crear un nuevo local (con creación automática de dirección y geopoint)
    async createLocal(req, res) {
        try {
            const { nombre, direccion, ubigeo, estado, imagen, id_tipo_local } = req.body;

            // Validar datos requeridos
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre es requerido y no puede estar vacío'
                });
            }

            if (!direccion || direccion.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'La dirección (referencia) es requerida'
                });
            }

            if (!ubigeo || !ubigeo.distrito) {
                return res.status(400).json({
                    success: false,
                    message: 'El distrito en ubigeo es requerido'
                });
            }

            // Validar id_tipo_local (debe ser 1 o 2)
            if (!id_tipo_local) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo id_tipo_local es requerido (1 para Almacén, 2 para Tienda)'
                });
            }

            const tipoLocalId = parseInt(id_tipo_local);
            if (isNaN(tipoLocalId) || (tipoLocalId !== 1 && tipoLocalId !== 2)) {
                return res.status(400).json({
                    success: false,
                    message: 'El id_tipo_local debe ser 1 (Almacén) o 2 (Tienda)'
                });
            }

            // Validar longitud de nombre
            if (nombre.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder los 30 caracteres'
                });
            }

            // Validar y convertir IDs
            const distritoId = parseInt(ubigeo.distrito);
            if (isNaN(distritoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'El distrito debe ser un número válido'
                });
            }

            // Validar estado si se proporciona
            const estadosValidos = ['ACTIVO', 'INACTIVO'];
            if (estado && !estadosValidos.includes(estado.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'estado debe ser ACTIVO o INACTIVO'
                });
            }

            // Verificar si el distrito existe
            const distritoExistente = await this.prisma.distrito.findUnique({
                where: { id: distritoId }
            });

            if (!distritoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'El distrito especificado no existe'
                });
            }

            // Verificar si el tipo de local existe
            const tipoLocalExistente = await this.prisma.tipoLocal.findUnique({
                where: { id: tipoLocalId }
            });

            if (!tipoLocalExistente) {
                return res.status(404).json({
                    success: false,
                    message: `El tipo de local ${tipoLocalId === 1 ? 'Almacén' : 'Tienda'} no existe en la base de datos`
                });
            }

            // Crear todo en una transacción
            const resultado = await this.prisma.$transaction(async (prisma) => {
                // 1. Crear el GeoPoint con coordenadas por defecto (Lima, Perú)
                const nuevoGeopoint = await prisma.geopoint.create({
                    data: {
                        latitud: '-12.0464',  // Lima, Perú (coordenadas por defecto)
                        longitud: '-77.0428'
                    }
                });

                // 2. Crear la Dirección
                const nuevaDireccion = await prisma.direccion.create({
                    data: {
                        referencia: direccion.trim(),
                        id_distrito: distritoId,
                        id_geopoint: nuevoGeopoint.id
                    }
                });

                // 3. Crear el Local
                const nuevoLocal = await prisma.local.create({
                    data: {
                        nombre: nombre.trim(),
                        id_direccion: nuevaDireccion.id,
                        imagen: imagen || null,
                        id_tipo_local: tipoLocalId,
                        estado: estado ? estado.toUpperCase() : 'INACTIVO'
                    },
                    include: {
                        direccion: {
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
                                geopoint: true
                            }
                        },
                        tipoLocal: true
                    }
                });

                return nuevoLocal;
            });

            return res.status(201).json({
                success: true,
                data: resultado,
                message: 'Local creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear local:', error);

            // Si el error es por restricciones de clave foránea
            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    message: 'El distrito proporcionado no existe',
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error al crear local',
                error: error.message
            });
        }
    }

    // Actualizar un local existente
    async updateLocal(req, res) {
        try {
            const { id } = req.params;
            const { nombre, imagen, id_tipo_local, estado } = req.body;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            // Validar que al menos un campo se esté actualizando
            if (!nombre && imagen === undefined && !id_tipo_local && !estado) {
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

            // Validar id_tipo_local si se proporciona
            if (id_tipo_local !== undefined) {
                const tipoLocalId = parseInt(id_tipo_local);
                if (isNaN(tipoLocalId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'id_tipo_local debe ser un número válido'
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

            // Verificar si el local existe
            const localExistente = await this.Local.findUnique({
                where: { id: idNumerico }
            });

            if (!localExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Local no encontrado'
                });
            }

            // Si se proporciona id_tipo_local, verificar si el tipo de local existe
            if (id_tipo_local) {
                const tipoLocalId = parseInt(id_tipo_local);
                const tipoLocalExistente = await this.prisma.tipoLocal.findUnique({
                    where: { id: tipoLocalId }
                });

                if (!tipoLocalExistente) {
                    return res.status(404).json({
                        success: false,
                        message: 'El tipo de local especificado no existe'
                    });
                }
            }

            // Preparar datos para actualización
            const datosActualizacion = {};
            if (nombre) datosActualizacion.nombre = nombre.trim();
            if (imagen !== undefined) datosActualizacion.imagen = imagen;
            if (id_tipo_local) datosActualizacion.id_tipo_local = parseInt(id_tipo_local);
            if (estado) datosActualizacion.estado = estado.toUpperCase();

            // Actualizar el local
            const localActualizado = await this.Local.update({
                where: { id: idNumerico },
                data: datosActualizacion,
                include: {
                    direccion: {
                        include: {
                            distrito: true,
                            geopoint: true
                        }
                    },
                    tipoLocal: true
                }
            });

            return res.status(200).json({
                success: true,
                data: localActualizado,
                message: 'Local actualizado exitosamente'
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Local no encontrado',
                    error: error.message
                });
            }

            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    message: 'El id_tipo_local proporcionado no existe',
                    error: error.message
                });
            }

            console.error('Error al actualizar local:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar local',
                error: error.message
            });
        }
    }

    // Eliminar un local
    async deleteLocal(req, res) {
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

            // Verificar si el local existe
            const localExistente = await this.Local.findUnique({
                where: { id: idNumerico }
            });

            if (!localExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Local no encontrado'
                });
            }

            // Eliminar el local
            await this.Local.delete({
                where: { id: idNumerico }
            });

            return res.status(200).json({
                success: true,
                message: 'Local eliminado correctamente',
                data: { id: idNumerico }
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Local no encontrado',
                    error: error.message
                });
            }

            if (error.code === 'P2003') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el local porque tiene registros relacionados',
                    error: error.message
                });
            }

            console.error('Error al eliminar local:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar local',
                error: error.message
            });
        }
    }

    // ========================================
    // GESTIÓN DE RELACIONES ALMACÉN-TIENDA
    // ========================================

    // Asignar un almacén a una tienda
    async asignarAlmacenATienda(req, res) {
        try {
            const { id_almacen, id_tienda } = req.body;

            // Validar datos requeridos
            if (!id_almacen || !id_tienda) {
                return res.status(400).json({
                    success: false,
                    message: 'id_almacen e id_tienda son requeridos'
                });
            }

            // Validar IDs
            const almacenId = parseInt(id_almacen);
            const tiendaId = parseInt(id_tienda);

            if (isNaN(almacenId) || isNaN(tiendaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Los IDs deben ser números válidos'
                });
            }

            // Verificar que el almacén existe y es tipo 1 (Almacén)
            const almacen = await this.Local.findUnique({
                where: { id: almacenId },
                include: { tipoLocal: true }
            });

            if (!almacen) {
                return res.status(404).json({
                    success: false,
                    message: 'Almacén no encontrado'
                });
            }

            if (almacen.id_tipo_local !== 1) {
                return res.status(400).json({
                    success: false,
                    message: 'El local especificado no es un almacén'
                });
            }

            // Verificar que la tienda existe y es tipo 2 (Tienda)
            const tienda = await this.Local.findUnique({
                where: { id: tiendaId },
                include: { tipoLocal: true }
            });

            if (!tienda) {
                return res.status(404).json({
                    success: false,
                    message: 'Tienda no encontrada'
                });
            }

            if (tienda.id_tipo_local !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'El local especificado no es una tienda'
                });
            }

            // Crear la relación
            const relacion = await this.prisma.almacenTienda.create({
                data: {
                    id_almacen: almacenId,
                    id_tienda: tiendaId
                },
                include: {
                    almacen: {
                        select: {
                            id: true,
                            nombre: true,
                            estado: true
                        }
                    },
                    tienda: {
                        select: {
                            id: true,
                            nombre: true,
                            estado: true
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                data: relacion,
                message: 'Almacén asignado a tienda exitosamente'
            });

        } catch (error) {
            // Error de unicidad (ya existe la relación)
            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: 'Esta relación almacén-tienda ya existe'
                });
            }

            console.error('Error al asignar almacén a tienda:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al asignar almacén a tienda',
                error: error.message
            });
        }
    }

    // Eliminar relación almacén-tienda
    async eliminarRelacionAlmacenTienda(req, res) {
        try {
            const { id } = req.params;

            const relacionId = parseInt(id);
            if (isNaN(relacionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            // Verificar que la relación existe
            const relacionExistente = await this.prisma.almacenTienda.findUnique({
                where: { id: relacionId }
            });

            if (!relacionExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Relación no encontrada'
                });
            }

            // Eliminar la relación
            await this.prisma.almacenTienda.delete({
                where: { id: relacionId }
            });

            return res.status(200).json({
                success: true,
                message: 'Relación almacén-tienda eliminada correctamente'
            });

        } catch (error) {
            console.error('Error al eliminar relación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar relación',
                error: error.message
            });
        }
    }

    // Obtener todas las tiendas abastecidas por un almacén específico
    async getTiendasDeAlmacen(req, res) {
        try {
            const { id_almacen } = req.params;

            const almacenId = parseInt(id_almacen);
            if (isNaN(almacenId)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del almacén debe ser un número válido'
                });
            }

            // Verificar que el almacén existe
            const almacen = await this.Local.findUnique({
                where: { id: almacenId }
            });

            if (!almacen) {
                return res.status(404).json({
                    success: false,
                    message: 'Almacén no encontrado'
                });
            }

            if (almacen.id_tipo_local !== 1) {
                return res.status(400).json({
                    success: false,
                    message: 'El local especificado no es un almacén'
                });
            }

            // Obtener las tiendas
            const relaciones = await this.prisma.almacenTienda.findMany({
                where: { id_almacen: almacenId },
                include: {
                    tienda: {
                        include: {
                            direccion: {
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
                                    geopoint: true
                                }
                            },
                            tipoLocal: true
                        }
                    }
                },
                orderBy: {
                    fecha_asignacion: 'desc'
                }
            });

            return res.status(200).json({
                success: true,
                data: relaciones,
                total: relaciones.length
            });

        } catch (error) {
            console.error('Error al obtener tiendas del almacén:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener tiendas del almacén',
                error: error.message
            });
        }
    }

    // Obtener todos los almacenes que abastecen una tienda específica
    async getAlmacenesDeTienda(req, res) {
        try {
            const { id_tienda } = req.params;

            const tiendaId = parseInt(id_tienda);
            if (isNaN(tiendaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de la tienda debe ser un número válido'
                });
            }

            // Verificar que la tienda existe
            const tienda = await this.Local.findUnique({
                where: { id: tiendaId }
            });

            if (!tienda) {
                return res.status(404).json({
                    success: false,
                    message: 'Tienda no encontrada'
                });
            }

            if (tienda.id_tipo_local !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'El local especificado no es una tienda'
                });
            }

            // Obtener los almacenes
            const relaciones = await this.prisma.almacenTienda.findMany({
                where: { id_tienda: tiendaId },
                include: {
                    almacen: {
                        include: {
                            direccion: {
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
                                    geopoint: true
                                }
                            },
                            tipoLocal: true
                        }
                    }
                },
                orderBy: {
                    fecha_asignacion: 'desc'
                }
            });

            return res.status(200).json({
                success: true,
                data: relaciones,
                total: relaciones.length
            });

        } catch (error) {
            console.error('Error al obtener almacenes de la tienda:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener almacenes de la tienda',
                error: error.message
            });
        }
    }
}

export const downloadLocalesCSV = async (req, res) => {
    try {
        // TODO: Añadir validacion
        const { id_tipo_local } = req.params;
        const locales = await getLocalesByTipo(id_tipo_local);

        if (!locales.length) {
            return res.status(404).json({ message: "No hay locales para descargar" })
        }

        const fileName = id_tipo_local == 1 ? "almacenes" : "tiendas"

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}.csv"`);

        const csvStream = format({ headers: true, writeBOM: true });
        csvStream.pipe(res);

        locales.forEach(local => {
            csvStream.write({
                id: local.id,
                nombre: local.nombre,
                imagen: local.imagen ?? "",
                estado: local.estado,
                direccion: local.direccion?.referencia ?? "",
                departamento: local.direccion?.distrito?.provincia?.departamento?.nombre ?? "",
                provincia: local.direccion?.distrito?.provincia?.nombre ?? "",
                distrito: local.direccion?.distrito?.nombre ?? "",
            });
        });

        csvStream.end();

        csvStream.on("finish", () => {
            res.end();
        });

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error generando CSV" })
    }
}

export const uploadLocalesCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo" });
        }

        const { id_tipo_local } = req.params;
        const REQUIRED_HEADERS = ["nombre", "imagen", "estado", "direccion", "distrito"];

        const rows = await parseCSV(req.file.path, REQUIRED_HEADERS);
        const total = rows.length;

        const { count: inserted, errors: failed } = await saveDataFromCSV(Number(id_tipo_local), rows);

        await fs.unlink(req.file.path);

        return res.status(200).json({
            message: `Procesamiento completado: ${inserted} de ${total} filas insertadas correctamente. ${failed} errores encontrados.`,
            resumen: { total, insertadas: inserted, errores: failed },
        });

    } catch (error) {
        try {
            await fs.unlink(req.file.path);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Error al procesar el archivo CSV",
                error: error.message,
            });
        }
    }
}
export default LocalController;