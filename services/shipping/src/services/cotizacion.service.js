import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// URLs de servicios (usar variables de entorno en producción)
const STORE_SERVICE_URL = process.env.STORE_SERVICE_URL || 'https://store-service-814404078279.us-central1.run.app/api';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'https://inventory-service-814404078279.us-central1.run.app/api';

/**
 * Servicio para calcular cotizaciones de envío
 * Actualmente usa cálculos fake basados en tarifas configuradas
 * Preparado para integración futura con APIs reales de carriers
 */
class CotizacionService {
  
  /**
   * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
   * @param {number} lat1 - Latitud origen
   * @param {number} lng1 - Longitud origen
   * @param {number} lat2 - Latitud destino
   * @param {number} lng2 - Longitud destino
   * @returns {number} Distancia en kilómetros
   */
  calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    return Math.round(distancia * 100) / 100; // Redondear a 2 decimales
  }

  toRadians(grados) {
    return grados * (Math.PI / 180);
  }

  /**
   * Obtiene almacenes del servicio de Store
   * @returns {Promise<Array>} Lista de almacenes con coordenadas
   */
  async obtenerAlmacenes() {
    try {
      const response = await fetch(`${STORE_SERVICE_URL}/almacenes?per_page=100`);
      if (!response.ok) {
        throw new Error(`Error obteniendo almacenes: ${response.statusText}`);
      }
      const result = await response.json();
      
      // El endpoint retorna { success: true, data: [...], pagination: {...} }
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      
      console.warn('Formato inesperado de respuesta de almacenes:', result);
      return [];
    } catch (error) {
      console.error('Error consultando servicio de Store:', error);
      return [];
    }
  }

  /**
   * Obtiene el stock disponible de un producto en un almacén
   * @param {number} idProducto - ID del producto
   * @param {number} idAlmacen - ID del almacén
   * @returns {Promise<Object>} Información de stock
   */
  async obtenerStockProducto(idProducto, idAlmacen) {
    try {
      const response = await fetch(
        `${INVENTORY_SERVICE_URL}/stock?id_almacen=${idAlmacen}`
      );
      if (!response.ok) {
        return { stock_disponible: 0 };
      }
      const stockProducts = await response.json();
      
      // Filtrar por id_producto ya que el endpoint solo soporta filtro por id_almacen
      const productoStock = stockProducts.find(
        stock => stock.id_producto === parseInt(idProducto)
      );
      
      return productoStock || { stock_disponible: 0 };
    } catch (error) {
      console.error(`Error consultando stock de producto ${idProducto} en almacén ${idAlmacen}:`, error);
      return { stock_disponible: 0 };
    }
  }

  /**
   * Encuentra el almacén más cercano que tenga todos los productos en stock
   * @param {number} destino_lat - Latitud destino
   * @param {number} destino_lng - Longitud destino
   * @param {Array} productos - Lista de productos [{ id_producto, cantidad }]
   * @returns {Promise<Object|null>} Almacén seleccionado o null
   */
  async encontrarAlmacenMasCercano(destino_lat, destino_lng, productos = []) {
    // Obtener todos los almacenes
    const almacenes = await this.obtenerAlmacenes();
    
    if (almacenes.length === 0) {
      console.warn('No se encontraron almacenes disponibles');
      return null;
    }

    // Si no hay productos especificados, retornar el más cercano
    if (!productos || productos.length === 0) {
      return this.encontrarAlmacenMasProximo(almacenes, destino_lat, destino_lng);
    }

    // Validar stock en cada almacén
    const almacenesConStock = [];

    for (const almacen of almacenes) {
      // Verificar que el almacén tenga coordenadas
      if (!almacen.direccion?.geopoint?.latitud || !almacen.direccion?.geopoint?.longitud) {
        continue;
      }

      // Verificar stock de todos los productos solicitados
      let tieneStock = true;
      
      for (const producto of productos) {
        const stock = await this.obtenerStockProducto(producto.id_producto, almacen.id);
        
        if (stock.stock_disponible < producto.cantidad) {
          tieneStock = false;
          break;
        }
      }

      if (tieneStock) {
        const lat = parseFloat(almacen.direccion.geopoint.latitud);
        const lng = parseFloat(almacen.direccion.geopoint.longitud);
        const distancia = this.calcularDistancia(lat, lng, destino_lat, destino_lng);
        
        almacenesConStock.push({
          ...almacen,
          distancia_km: distancia,
          latitud: lat,
          longitud: lng,
        });
      }
    }

    // Si ningún almacén tiene stock, retornar null
    if (almacenesConStock.length === 0) {
      console.warn('Ningún almacén tiene stock suficiente de los productos solicitados');
      return null;
    }

    // Ordenar por distancia y retornar el más cercano
    almacenesConStock.sort((a, b) => a.distancia_km - b.distancia_km);
    return almacenesConStock[0];
  }

  /**
   * Encuentra el almacén más próximo sin validar stock
   * @param {Array} almacenes - Lista de almacenes
   * @param {number} destino_lat - Latitud destino
   * @param {number} destino_lng - Longitud destino
   * @returns {Object|null} Almacén más cercano
   */
  encontrarAlmacenMasProximo(almacenes, destino_lat, destino_lng) {
    let almacenMasCercano = null;
    let distanciaMinima = Infinity;

    for (const almacen of almacenes) {
      if (!almacen.direccion?.geopoint?.latitud || !almacen.direccion?.geopoint?.longitud) {
        continue;
      }

      const lat = parseFloat(almacen.direccion.geopoint.latitud);
      const lng = parseFloat(almacen.direccion.geopoint.longitud);
      const distancia = this.calcularDistancia(lat, lng, destino_lat, destino_lng);

      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        almacenMasCercano = {
          ...almacen,
          distancia_km: distancia,
          latitud: lat,
          longitud: lng,
        };
      }
    }

    return almacenMasCercano;
  }

  /**
   * Obtiene tiendas del servicio de Store
   * @returns {Promise<Array>} Lista de tiendas con coordenadas
   */
  async obtenerTiendas() {
    try {
      const response = await fetch(`${STORE_SERVICE_URL}/tiendas?per_page=100`);
      if (!response.ok) {
        throw new Error(`Error obteniendo tiendas: ${response.statusText}`);
      }
      const result = await response.json();
      
      // El endpoint retorna { success: true, data: [...], pagination: {...} }
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      
      console.warn('Formato inesperado de respuesta de tiendas:', result);
      return [];
    } catch (error) {
      console.error('Error consultando servicio de Store (tiendas):', error);
      return [];
    }
  }

  /**
   * Obtiene el stock disponible en una tienda específica
   * Las tiendas obtienen stock de sus almacenes asociados
   * @param {number} idTienda - ID de la tienda
   * @param {number} idProducto - ID del producto
   * @returns {Promise<number>} Stock disponible total
   */
  async obtenerStockEnTienda(idTienda, idProducto) {
    try {
      // Obtener los almacenes que abastecen a esta tienda
      const response = await fetch(
        `${STORE_SERVICE_URL}/locales/tienda/${idTienda}/almacenes`
      );
      
      if (!response.ok) {
        return 0;
      }
      
      const result = await response.json();
      
      if (!result.success || !Array.isArray(result.data)) {
        return 0;
      }
      
      // Sumar el stock de todos los almacenes asociados
      let stockTotal = 0;
      
      for (const almacen of result.data) {
        const stockInfo = await this.obtenerStockProducto(idProducto, almacen.id);
        stockTotal += stockInfo.stock_disponible || 0;
      }
      
      return stockTotal;
    } catch (error) {
      console.error(`Error consultando stock en tienda ${idTienda}:`, error);
      return 0;
    }
  }

  /**
   * Encuentra las 3 tiendas más cercanas que tengan stock de todos los productos
   * @param {number} destino_lat - Latitud destino
   * @param {number} destino_lng - Longitud destino
   * @param {Array} productos - Lista de productos [{ id_producto, cantidad }]
   * @returns {Promise<Array>} Top 3 tiendas más cercanas con stock
   */
  async encontrarTiendasMasCercanas(destino_lat, destino_lng, productos = []) {
    // Obtener todas las tiendas activas
    const tiendas = await this.obtenerTiendas();
    
    if (tiendas.length === 0) {
      console.warn('No se encontraron tiendas disponibles');
      return [];
    }

    // Si no hay productos especificados, retornar las 3 más cercanas sin validar stock
    if (!productos || productos.length === 0) {
      const tiendasConDistancia = tiendas
        .filter(t => t.estado === 'ACTIVO' && t.direccion?.geopoint?.latitud && t.direccion?.geopoint?.longitud)
        .map(tienda => {
          const lat = parseFloat(tienda.direccion.geopoint.latitud);
          const lng = parseFloat(tienda.direccion.geopoint.longitud);
          const distancia = this.calcularDistancia(lat, lng, destino_lat, destino_lng);
          
          return {
            id: tienda.id,
            nombre: tienda.nombre,
            imagen: tienda.imagen,
            direccion: tienda.direccion.referencia,
            latitud: lat,
            longitud: lng,
            distancia_km: distancia,
          };
        })
        .sort((a, b) => a.distancia_km - b.distancia_km)
        .slice(0, 3);
      
      return tiendasConDistancia;
    }

    // Validar stock en cada tienda
    const tiendasConStock = [];

    for (const tienda of tiendas) {
      // Verificar que la tienda esté activa y tenga coordenadas
      // console.log("dasfdfsa")

      if (tienda.estado !== 'ACTIVO' || 
          !tienda.direccion?.geopoint?.latitud || 
          !tienda.direccion?.geopoint?.longitud) {
        continue;
      }

      // Verificar stock de todos los productos solicitados
      let tieneStock = true;
      
      for (const producto of productos) {
        const stockDisponible = await this.obtenerStockEnTienda(tienda.id, producto.id_producto);
        
        if (stockDisponible < producto.cantidad) {
          tieneStock = false;
          break;
        }
      }

      if (tieneStock) {
        const lat = parseFloat(tienda.direccion.geopoint.latitud);
        const lng = parseFloat(tienda.direccion.geopoint.longitud);
        const distancia = this.calcularDistancia(lat, lng, destino_lat, destino_lng);
        
        tiendasConStock.push({
          id: tienda.id,
          nombre: tienda.nombre,
          imagen: tienda.imagen,
          direccion: tienda.direccion.referencia,
          latitud: lat,
          longitud: lng,
          distancia_km: distancia,
        });
      }
    }

    // Si ninguna tienda tiene stock, retornar array vacío
    if (tiendasConStock.length === 0) {
      console.warn('Ninguna tienda tiene stock suficiente de los productos solicitados');
      return [];
    }

    // Ordenar por distancia y retornar las 3 más cercanas
    tiendasConStock.sort((a, b) => a.distancia_km - b.distancia_km);
    return tiendasConStock.slice(0, 3);
  }

  /**
   * Obtiene cotizaciones de envío para recojo en tienda y domicilio
   * @param {Object} datos - Datos para la cotización
   * @returns {Promise<Object>} Cotizaciones disponibles
   */
  async obtenerCotizaciones(datos) {
    const {
      destino_lat,
      destino_lng,
      destino_direccion,
      productos = [], // [{ id_producto, cantidad }]
      peso_kg = 1,
      dimensiones = { largo: 30, ancho: 30, alto: 30 },
      valor_declarado = 0,
    } = datos;

    // Validar que tenemos coordenadas de destino
    if (!destino_lat || !destino_lng) {
      return {
        success: true,
        recojo_tienda: {
          tipo_envio: 'RECOJO_TIENDA',
          costo_envio: 0,
          disponible: false,
          mensaje: 'Se requieren coordenadas para calcular tiendas cercanas',
          tiendas: [],
        },
        domicilio: {
          disponible: false,
          mensaje: 'Se requieren coordenadas de destino para calcular envío a domicilio',
          carriers: [],
        },
      };
    }

    // Buscar las 3 tiendas más cercanas con stock disponible
    const tiendasCercanas = await this.encontrarTiendasMasCercanas(
      destino_lat,
      destino_lng,
      productos
    );

    // Cotización para RECOJO EN TIENDA
    const cotizacionRecojoTienda = {
      tipo_envio: 'RECOJO_TIENDA',
      costo_envio: 0,
      tiempo_estimado_dias: 0,
      fecha_entrega_estimada: new Date(),
      descripcion: 'Recoge tu pedido en una de nuestras tiendas sin costo adicional',
      disponible: tiendasCercanas.length > 0,
      tiendas: tiendasCercanas,
      mensaje: tiendasCercanas.length === 0 
        ? 'No hay tiendas con stock disponible para los productos solicitados'
        : `${tiendasCercanas.length} tienda${tiendasCercanas.length > 1 ? 's' : ''} disponible${tiendasCercanas.length > 1 ? 's' : ''} para recojo`,
    };

    // Encontrar el almacén más cercano que tenga stock
    const almacenSeleccionado = await this.encontrarAlmacenMasCercano(
      destino_lat,
      destino_lng,
      productos
    );

    if (!almacenSeleccionado) {
      return {
        success: true,
        recojo_tienda: cotizacionRecojoTienda,
        domicilio: {
          disponible: false,
          mensaje: productos.length > 0 
            ? 'No hay almacenes con stock disponible para los productos solicitados'
            : 'No se encontraron almacenes disponibles',
          carriers: [],
        },
      };
    }

    // Usar coordenadas del almacén seleccionado como origen
    const origen_lat = almacenSeleccionado.latitud;
    const origen_lng = almacenSeleccionado.longitud;
    const origen_direccion = almacenSeleccionado.direccion?.referencia || almacenSeleccionado.nombre;

    // Calcular distancia desde el almacén seleccionado
    const distancia_km = almacenSeleccionado.distancia_km;

    // Obtener carriers activos
    const carriersActivos = await prisma.carrier.findMany({
      where: { activo: true },
      orderBy: { tarifa_base: 'asc' },
    });

    // Calcular cotizaciones para cada carrier (simulado)
    const cotizacionesDomicilio = carriersActivos.map(carrier => {
      // Cálculo fake basado en configuración
      const costoBase = carrier.tarifa_base;
      const costoPorPeso = carrier.tarifa_por_kg * peso_kg;
      const costoPorDistancia = (carrier.tarifa_por_km || 0) * distancia_km;
      const costoTotal = costoBase + costoPorPeso + costoPorDistancia;

      // Calcular tiempo estimado (fake)
      const tiempoEstimado = carrier.tiempo_base_dias + Math.ceil(distancia_km / 100);

      const fechaEntregaEstimada = new Date();
      fechaEntregaEstimada.setDate(fechaEntregaEstimada.getDate() + tiempoEstimado);

      return {
        carrier_id: carrier.id,
        carrier_nombre: carrier.nombre,
        carrier_codigo: carrier.codigo,
        carrier_tipo: carrier.tipo,
        logo_url: carrier.logo_url,
        costo_envio: Math.round(costoTotal * 100) / 100,
        tiempo_estimado_dias: tiempoEstimado,
        fecha_entrega_estimada: fechaEntregaEstimada,
        distancia_km: distancia_km,
        peso_maximo_kg: carrier.peso_maximo_kg,
        cobertura_nacional: carrier.cobertura_nacional,
        cobertura_internacional: carrier.cobertura_internacional,
      };
    });

    // Guardar cotizaciones en base de datos para historial
    const cotizacionesGuardadas = await Promise.all(
      cotizacionesDomicilio.map(async (cotizacion) => {
        try {
          const vigenciaHasta = new Date();
          vigenciaHasta.setHours(vigenciaHasta.getHours() + 24); // Válida por 24 horas

          const saved = await prisma.cotizacion.create({
            data: {
              origen_lat,
              origen_lng,
              origen_direccion,
              destino_lat,
              destino_lng,
              destino_direccion,
              distancia_km,
              peso_kg,
              dimensiones,
              valor_declarado,
              tipo_envio: 'DOMICILIO',
              carrier_id: cotizacion.carrier_id,
              carrier_nombre: cotizacion.carrier_nombre,
              costo_envio: cotizacion.costo_envio,
              tiempo_estimado_dias: cotizacion.tiempo_estimado_dias,
              fecha_entrega_estimada: cotizacion.fecha_entrega_estimada,
              cotizacion_valida_hasta: vigenciaHasta,
            },
          });

          return {
            ...cotizacion,
            cotizacion_id: saved.id,
            valida_hasta: vigenciaHasta,
          };
        } catch (error) {
          console.error(`Error guardando cotización de ${cotizacion.carrier_nombre}:`, error);
          return cotizacion;
        }
      })
    );

    return {
      success: true,
      distancia_km,
      almacen_origen: {
        id: almacenSeleccionado.id,
        nombre: almacenSeleccionado.nombre,
        direccion: origen_direccion,
        latitud: origen_lat,
        longitud: origen_lng,
      },
      recojo_tienda: cotizacionRecojoTienda,
      domicilio: {
        disponible: true,
        carriers: cotizacionesGuardadas,
        total_opciones: cotizacionesGuardadas.length,
      },
    };
  }

  /**
   * Obtiene el historial de cotizaciones
   * @param {Object} filtros - Filtros opcionales
   * @returns {Promise<Array>} Lista de cotizaciones
   */
  async obtenerHistorial(filtros = {}) {
    const { limit = 50, tipo_envio } = filtros;

    const where = {};
    if (tipo_envio) {
      where.tipo_envio = tipo_envio;
    }

    return await prisma.cotizacion.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtiene una cotización específica por ID
   * @param {string} id - ID de la cotización
   * @returns {Promise<Object|null>} Cotización o null
   */
  async obtenerCotizacionPorId(id) {
    return await prisma.cotizacion.findUnique({
      where: { id },
    });
  }

  /**
   * Lista todos los carriers disponibles
   * @returns {Promise<Array>} Lista de carriers
   */
  async listarCarriers() {
    return await prisma.carrier.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
}

export default new CotizacionService();
