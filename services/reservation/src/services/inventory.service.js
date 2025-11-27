import axios from 'axios';

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'https://inventory-service-814404078279.us-central1.run.app/api';

class InventoryService {
    /**
     * Verifica si hay stock disponible para un producto en un almacén
     * @param {number} id_stock_producto - ID del registro de stock en ProductoAlmacen
     * @param {number} cantidad - Cantidad solicitada
     * @returns {Promise<{available: boolean, stock_disponible: number, stock_reservado: number}>}
     */
    async checkStockAvailability(id_stock_producto, cantidad) {
        try {
            const response = await axios.get(
                `${INVENTORY_SERVICE_URL}/stock/${id_stock_producto}`
            );

            if (response.data) {
                const { stock_disponible, stock_reservado } = response.data;
                
                return {
                    available: stock_disponible >= cantidad,
                    stock_disponible,
                    stock_reservado,
                    id_producto: response.data.id_producto,
                    id_almacen: response.data.id_almacen
                };
            }

            return {
                available: false,
                stock_disponible: 0,
                stock_reservado: 0
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`El producto con ID ${id_stock_producto} no existe en el inventario`);
            }
            throw new Error(`Error al consultar el servicio de inventario: ${error.message}`);
        }
    }

    /**
     * Actualiza el stock reservado de un producto
     * @param {number} id_stock_producto - ID del registro de stock
     * @param {number} cantidad - Cantidad a reservar
     * @returns {Promise<object>}
     */
    async reserveStock(id_stock_producto, cantidad) {
        try {
            // Primero obtenemos el stock actual
            const stockInfo = await this.checkStockAvailability(id_stock_producto, cantidad);
            
            if (!stockInfo.available) {
                const insufficientError = new Error(
                    `Stock insuficiente. Disponible: ${stockInfo.stock_disponible}, Solicitado: ${cantidad}`
                );
                insufficientError.code = 'INSUFFICIENT_STOCK';
                throw insufficientError;
            }

            // Actualizamos el stock
            const nuevoStockReservado = stockInfo.stock_reservado + cantidad;
            const nuevoStockDisponible = stockInfo.stock_disponible - cantidad;

            const response = await axios.put(
                `${INVENTORY_SERVICE_URL}/stock/${id_stock_producto}`,
                {
                    stock_reservado: nuevoStockReservado,
                    stock_disponible: nuevoStockDisponible
                }
            );

            return response.data;
        } catch (error) {
            if (error.message.includes('Stock insuficiente')) {
                throw error;
            }
            throw new Error(`Error al reservar stock: ${error.message}`);
        }
    }

    /**
     * Libera stock reservado (cuando se cancela una reserva)
     * @param {number} id_stock_producto - ID del registro de stock
     * @param {number} cantidad - Cantidad a liberar
     * @returns {Promise<object>}
     */
    async releaseStock(id_stock_producto, cantidad) {
        try {
            const response = await axios.get(
                `${INVENTORY_SERVICE_URL}/stock/${id_stock_producto}`
            );

            if (response.data) {
                const { stock_disponible, stock_reservado } = response.data;
                
                const nuevoStockReservado = Math.max(0, stock_reservado - cantidad);
                const nuevoStockDisponible = stock_disponible + cantidad;

                const updateResponse = await axios.put(
                    `${INVENTORY_SERVICE_URL}/stock/${id_stock_producto}`,
                    {
                        stock_reservado: nuevoStockReservado,
                        stock_disponible: nuevoStockDisponible
                    }
                );

                return updateResponse.data;
            }
        } catch (error) {
            throw new Error(`Error al liberar stock: ${error.message}`);
        }
    }

    /**
     * Obtiene información de múltiples productos de stock
     * @param {number[]} ids - Array de IDs de stock
     * @returns {Promise<object[]>}
     */
    async getMultipleStockInfo(ids) {
        try {
            const promises = ids.map(id => 
                axios.get(`${INVENTORY_SERVICE_URL}/stock/${id}`)
                    .then(response => response.data)
                    .catch(() => null)
            );
            
            const results = await Promise.all(promises);
            return results.filter(result => result !== null);
        } catch (error) {
            throw new Error(`Error al obtener información de stocks: ${error.message}`);
        }
    }

    /**
     * Busca el mejor stock disponible para un producto
     * Devuelve el registro de stock con mayor disponibilidad
     * @param {number} id_producto - ID del producto
     * @param {number} cantidad - Cantidad solicitada
     * @param {number} id_almacen - (Opcional) ID del almacén preferido
     * @returns {Promise<{id_stock_producto: number, stock_disponible: number, id_almacen: number}>}
     */
    async findAvailableStock(id_producto, cantidad, id_almacen = null) {
        try {
            // Obtener todos los registros de stock para este producto
            const response = await axios.get(
                `${INVENTORY_SERVICE_URL}/stock`,
                {
                    params: {
                        id_producto: id_producto
                    }
                }
            );

            if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                throw new Error(`No se encontró stock para el producto ${id_producto}`);
            }

            let stockRecords = response.data;

            // Si se especifica un almacén preferido, intentar usar ese primero
            if (id_almacen) {
                const preferredStock = stockRecords.find(
                    s => s.id_almacen === id_almacen && s.stock_disponible >= cantidad
                );
                
                if (preferredStock) {
                    return {
                        id_stock_producto: preferredStock.id,
                        stock_disponible: preferredStock.stock_disponible,
                        id_almacen: preferredStock.id_almacen,
                        id_producto: preferredStock.id_producto
                    };
                }
            }

            // Buscar cualquier stock disponible con suficiente cantidad
            const availableStock = stockRecords
                .filter(s => s.stock_disponible >= cantidad)
                .sort((a, b) => b.stock_disponible - a.stock_disponible); // Ordenar por mayor disponibilidad

            if (availableStock.length === 0) {
                const totalDisponible = stockRecords.reduce(
                    (sum, s) => sum + s.stock_disponible, 
                    0
                );
                
                const insufficientError = new Error(
                    `Stock insuficiente para el producto ${id_producto}. ` +
                    `Solicitado: ${cantidad}, Disponible: ${totalDisponible}`
                );
                insufficientError.code = 'INSUFFICIENT_STOCK';
                throw insufficientError;
            }

            // Devolver el stock con mayor disponibilidad
            const bestStock = availableStock[0];
            return {
                id_stock_producto: bestStock.id,
                stock_disponible: bestStock.stock_disponible,
                id_almacen: bestStock.id_almacen,
                id_producto: bestStock.id_producto
            };
        } catch (error) {
            if (error.message.includes('Stock insuficiente') || error.message.includes('No se encontró stock')) {
                throw error;
            }
            throw new Error(`Error al buscar stock disponible: ${error.message}`);
        }
    }
}

export default new InventoryService();
