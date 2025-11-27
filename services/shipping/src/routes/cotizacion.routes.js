import { Router } from 'express';
import {
  obtenerCotizaciones,
  obtenerHistorial,
  obtenerCotizacionPorId,
  listarCarriers,
} from '../controllers/cotizacion.controller.js';

const router = Router();

/**
 * POST /api/cotizaciones
 * Obtiene cotizaciones de envío (recojo en tienda + domicilio con carriers)
 * El sistema calcula automáticamente el almacén más cercano con stock disponible
 * 
 * Body:
 * {
 *   "destino_lat": -12.1022,
 *   "destino_lng": -77.0211,
 *   "destino_direccion": "Av. Javier Prado 456, Lima",
 *   "productos": [
 *     { "id_producto": 1, "cantidad": 2 },
 *     { "id_producto": 3, "cantidad": 1 }
 *   ],
 *   "peso_kg": 2.5,
 *   "dimensiones": { "largo": 40, "ancho": 30, "alto": 20 },
 *   "valor_declarado": 150.00
 * }
 * 
 * Nota: El campo "productos" es opcional. Si se proporciona, el sistema
 * seleccionará el almacén más cercano que tenga stock de todos los productos.
 */
router.post('/', obtenerCotizaciones);

/**
 * GET /api/cotizaciones/historial
 * Obtiene el historial de cotizaciones
 * 
 * Query params:
 * - limit: Número de registros (default: 50)
 * - tipo_envio: DOMICILIO o RECOJO_TIENDA
 */
router.get('/historial', obtenerHistorial);

/**
 * GET /api/cotizaciones/:id
 * Obtiene una cotización específica por ID
 */
router.get('/:id', obtenerCotizacionPorId);

/**
 * GET /api/cotizaciones/carriers/disponibles
 * Lista todos los carriers disponibles
 */
router.get('/carriers/disponibles', listarCarriers);

export default router;
