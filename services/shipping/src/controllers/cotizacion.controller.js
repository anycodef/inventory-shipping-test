import cotizacionService from '../services/cotizacion.service.js';

/**
 * Controlador para cotizaciones de envío
 */
export const obtenerCotizaciones = async (req, res) => {
  try {
    const {
      destino_lat,
      destino_lng,
      destino_direccion,
      productos, // [{ id_producto, cantidad }]
      peso_kg,
      dimensiones,
      valor_declarado,
    } = req.body;

    // Validaciones básicas
    if (!destino_lat || !destino_lng) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren coordenadas de destino (destino_lat, destino_lng)',
      });
    }

    if (!destino_direccion) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere dirección de destino',
      });
    }

    // Validar formato de productos si se proporcionan
    if (productos && !Array.isArray(productos)) {
      return res.status(400).json({
        success: false,
        error: 'El campo "productos" debe ser un array de objetos { id_producto, cantidad }',
      });
    }

    const cotizaciones = await cotizacionService.obtenerCotizaciones({
      destino_lat: parseFloat(destino_lat),
      destino_lng: parseFloat(destino_lng),
      destino_direccion,
      productos: productos || [],
      peso_kg: peso_kg ? parseFloat(peso_kg) : 1,
      dimensiones: dimensiones || { largo: 30, ancho: 30, alto: 30 },
      valor_declarado: valor_declarado ? parseFloat(valor_declarado) : 0,
    });

    res.json(cotizaciones);
  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
};

/**
 * Obtiene el historial de cotizaciones
 */
export const obtenerHistorial = async (req, res) => {
  try {
    const { limit, tipo_envio } = req.query;

    const cotizaciones = await cotizacionService.obtenerHistorial({
      limit: limit ? parseInt(limit) : 50,
      tipo_envio,
    });

    res.json({
      success: true,
      total: cotizaciones.length,
      cotizaciones,
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
};

/**
 * Obtiene una cotización específica
 */
export const obtenerCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await cotizacionService.obtenerCotizacionPorId(id);

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada',
      });
    }

    res.json({
      success: true,
      cotizacion,
    });
  } catch (error) {
    console.error('Error obteniendo cotización:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
};

/**
 * Lista todos los carriers disponibles
 */
export const listarCarriers = async (req, res) => {
  try {
    const carriers = await cotizacionService.listarCarriers();

    res.json({
      success: true,
      total: carriers.length,
      carriers,
    });
  } catch (error) {
    console.error('Error listando carriers:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
};
