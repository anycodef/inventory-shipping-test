class AlmacenController {
  constructor(prismaInstance) {
    this.prisma = prismaInstance;
    this.Local = this.prisma.local;
    this.TipoLocal = this.prisma.tipoLocal;
  }

  // Helper para obtener el ID del tipo de local "Almacén"
  async getAlmacenTypeId() {
    const tipoLocal = await this.TipoLocal.findFirst({ where: { nombre: 'Almacen' } });
    if (!tipoLocal) throw new Error('El tipo de local "Almacen" no existe. Asegúrese de poblar la base de datos.');
    return tipoLocal.id;
  }

  async getAlmacenes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const per_page = parseInt(req.query.per_page) || 10;

      // Validar parámetros
      if (isNaN(page) || page < 1) {
        return res.status(400).json({
          success: false,
          message: 'page debe ser un número válido mayor a 0'
        });
      }

      if (isNaN(per_page) || per_page < 1 || per_page > 100) {
        return res.status(400).json({
          success: false,
          message: 'per_page debe ser un número válido entre 1 y 100'
        });
      }

      const skip = (page - 1) * per_page;

      const almacenTypeId = await this.getAlmacenTypeId();

      const almacenes = await this.Local.findMany({
        where: { id_tipo_local: almacenTypeId },
        skip,
        take: per_page,
        include: {
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
        },
      });

      const total = await this.Local.count({ where: { id_tipo_local: almacenTypeId } });

      res.json({
        success: true,
        data: almacenes,
        pagination: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      console.error('Error al obtener almacenes:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener almacenes', 
        error: error.message 
      });
    }
  }

  async getAlmacenById(req, res) {
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

      const almacenTypeId = await this.getAlmacenTypeId();

      const almacen = await this.Local.findFirst({
        where: {
          id: idNumerico,
          id_tipo_local: almacenTypeId,
        },
        include: {
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

      if (!almacen) {
        return res.status(404).json({ 
          success: false,
          message: 'Almacén no encontrado' 
        });
      }

      res.json({
        success: true,
        data: almacen
      });
    } catch (error) {
      console.error('Error al obtener almacen por ID:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener almacen por ID', 
        error: error.message 
      });
    }
  }

  async createAlmacen(req, res) {
    try {
      const { direccion, geopoint, ...almacenData } = req.body;

      // Validar campos requeridos del almacén
      if (!almacenData.nombre || almacenData.nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del almacén es requerido'
        });
      }

      if (almacenData.nombre.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede exceder los 30 caracteres'
        });
      }

      // Validar dirección
      if (!direccion || !direccion.referencia || !direccion.id_distrito) {
        return res.status(400).json({
          success: false,
          message: 'La dirección completa (referencia e id_distrito) es requerida'
        });
      }

      // Validar id_distrito
      const distritoId = parseInt(direccion.id_distrito);
      if (isNaN(distritoId)) {
        return res.status(400).json({
          success: false,
          message: 'id_distrito debe ser un número válido'
        });
      }

      // Validar geopoint
      if (!geopoint || geopoint.latitud === undefined || geopoint.longitud === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Las coordenadas (latitud y longitud) son requeridas'
        });
      }

      const lat = parseFloat(geopoint.latitud);
      const lng = parseFloat(geopoint.longitud);

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

      // Validar estado si se proporciona
      const estadosValidos = ['ACTIVO', 'INACTIVO'];
      if (almacenData.estado && !estadosValidos.includes(almacenData.estado.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'estado debe ser ACTIVO o INACTIVO'
        });
      }

      const almacenTypeId = await this.getAlmacenTypeId();

      const newAlmacen = await this.prisma.$transaction(async (prisma) => {
        const createdGeopoint = await prisma.geopoint.create({
          data: {
            latitud: lat,
            longitud: lng,
          },
        });

        const createdDireccion = await prisma.direccion.create({
          data: {
            referencia: direccion.referencia.trim(),
            id_distrito: distritoId,
            id_geopoint: createdGeopoint.id,
          },
        });

        return prisma.local.create({
          data: {
            nombre: almacenData.nombre.trim(),
            imagen: almacenData.imagen || null,
            estado: almacenData.estado ? almacenData.estado.toUpperCase() : 'INACTIVO',
            id_tipo_local: almacenTypeId,
            id_direccion: createdDireccion.id,
          },
          include: {
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
          },
        });
      });

      res.status(201).json({
        success: true,
        data: newAlmacen,
        message: 'Almacén creado exitosamente'
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

      console.error('Error al crear almacen:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al crear almacen', 
        error: error.message 
      });
    }
  }

  async updateAlmacen(req, res) {
    try {
      const { id } = req.params;
      const { direccion, geopoint, ...almacenData } = req.body;

      // Validar ID
      const idNumerico = parseInt(id);
      if (isNaN(idNumerico)) {
        return res.status(400).json({
          success: false,
          message: 'El ID debe ser un número válido'
        });
      }

      // Validar que al menos un campo se esté actualizando
      if (!almacenData.nombre && !almacenData.imagen && !almacenData.estado && !direccion && !geopoint) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validar nombre si se proporciona
      if (almacenData.nombre !== undefined) {
        if (typeof almacenData.nombre !== 'string' || almacenData.nombre.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'El nombre debe ser una cadena no vacía'
          });
        }
        if (almacenData.nombre.length > 30) {
          return res.status(400).json({
            success: false,
            message: 'El nombre no puede exceder los 30 caracteres'
          });
        }
      }

      // Validar coordenadas si se proporcionan
      if (geopoint) {
        if (geopoint.latitud !== undefined) {
          const lat = parseFloat(geopoint.latitud);
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

        if (geopoint.longitud !== undefined) {
          const lng = parseFloat(geopoint.longitud);
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
      }

      // Validar id_distrito si se proporciona en direccion
      if (direccion && direccion.id_distrito !== undefined) {
        const distritoId = parseInt(direccion.id_distrito);
        if (isNaN(distritoId)) {
          return res.status(400).json({
            success: false,
            message: 'id_distrito debe ser un número válido'
          });
        }
      }

      // Validar estado si se proporciona
      const estadosValidos = ['ACTIVO', 'INACTIVO'];
      if (almacenData.estado && !estadosValidos.includes(almacenData.estado.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'estado debe ser ACTIVO o INACTIVO'
        });
      }

      const almacenTypeId = await this.getAlmacenTypeId();

      const updatedAlmacen = await this.prisma.$transaction(async (prisma) => {
        const existingAlmacen = await prisma.local.findFirst({
          where: { 
            id: idNumerico, 
            id_tipo_local: almacenTypeId 
          },
          include: { direccion: true },
        });

        if (!existingAlmacen) {
          return res.status(404).json({
            success: false,
            message: 'Almacen no encontrado'
          });
        }

        if (geopoint && existingAlmacen.direccion?.id_geopoint) {
          const geopointData = {};
          if (geopoint.latitud !== undefined) {
            geopointData.latitud = parseFloat(geopoint.latitud);
          }
          if (geopoint.longitud !== undefined) {
            geopointData.longitud = parseFloat(geopoint.longitud);
          }

          await prisma.geopoint.update({
            where: { id: existingAlmacen.direccion.id_geopoint },
            data: geopointData,
          });
        }

        if (direccion && existingAlmacen.id_direccion) {
          const direccionData = {};
          if (direccion.referencia !== undefined) {
            direccionData.referencia = direccion.referencia.trim();
          }
          if (direccion.id_distrito !== undefined) {
            direccionData.id_distrito = parseInt(direccion.id_distrito);
          }

          await prisma.direccion.update({
            where: { id: existingAlmacen.id_direccion },
            data: direccionData,
          });
        }

        const localData = {};
        if (almacenData.nombre !== undefined) {
          localData.nombre = almacenData.nombre.trim();
        }
        if (almacenData.imagen !== undefined) {
          localData.imagen = almacenData.imagen;
        }
        if (almacenData.estado !== undefined) {
          localData.estado = almacenData.estado.toUpperCase();
        }

        return prisma.local.update({
          where: { id: idNumerico },
          data: localData,
          include: {
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
          },
        });
      });

      res.json({
        success: true,
        data: updatedAlmacen,
        message: 'Almacén actualizado exitosamente'
      });
    } catch (error) {
      // Manejo de errores específicos de Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Almacén no encontrado',
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

      console.error('Error al actualizar almacen:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al actualizar almacen', 
        error: error.message 
      });
    }
  }

  async deleteAlmacen(req, res) {
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

      const almacenTypeId = await this.getAlmacenTypeId();

      const result = await this.prisma.$transaction(async (prisma) => {
        const existingAlmacen = await prisma.local.findFirst({
          where: { 
            id: idNumerico, 
            id_tipo_local: almacenTypeId 
          },
          include: { direccion: true },
        });

        if (!existingAlmacen) {
          return res.status(404).json({
            success: false,
            message: 'Almacen no encontrado'
          });
        }

        const associatedTiendas = await prisma.almacenTienda.count({
          where: { id_almacen: idNumerico },
        });

        if (associatedTiendas > 0) {
          return res.status(400).json({
            success: false,
            message: `No se puede eliminar el almacén porque tiene ${associatedTiendas} tiendas asociadas`
          });
        }

        if (existingAlmacen.id_direccion) {
          const existingDireccion = await prisma.direccion.findUnique({
            where: { id: existingAlmacen.id_direccion },
          });

          if (existingDireccion?.id_geopoint) {
            await prisma.geopoint.delete({
              where: { id: existingDireccion.id_geopoint },
            });
          }
          await prisma.direccion.delete({
            where: { id: existingAlmacen.id_direccion },
          });
        }

        await prisma.local.delete({
          where: { id: idNumerico },
        });

        return { id: idNumerico };
      });

      res.status(200).json({
        success: true,
        message: 'Almacén eliminado correctamente',
        data: result
      });
    } catch (error) {
      // Manejo de errores específicos de Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Almacén no encontrado',
          error: error.message
        });
      }

      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el almacén porque tiene registros relacionados',
          error: error.message
        });
      }

      console.error('Error al eliminar almacen:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al eliminar almacen', 
        error: error.message 
      });
    }
  }
}

export default AlmacenController;