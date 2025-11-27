import axios from 'axios';

const STORE_SERVICE_URL = process.env.STORE_SERVICE_URL || 'https://store-service-814404078279.us-central1.run.app/api';

class StoreService {
    /**
     * Verifica si una tienda existe y está activa
     * @param {number} id_tienda - ID de la tienda
     * @returns {Promise<{exists: boolean, active: boolean, data: object}>}
     */
    async validateStore(id_tienda) {
        try {
            const response = await axios.get(
                `${STORE_SERVICE_URL}/locales/${id_tienda}`
            );

            if (response.data && response.data.success && response.data.data) {
                const local = response.data.data;
                
                // Verificar que sea una tienda (no almacén)
                const esTienda = local.tipoLocal && 
                                (local.tipoLocal.nombre.toLowerCase().includes('tienda') ||
                                 local.tipoLocal.nombre.toLowerCase() === 'tienda');
                
                const estaActiva = local.estado === 'ACTIVO';

                return {
                    exists: true,
                    active: estaActiva,
                    isStore: esTienda,
                    data: {
                        id: local.id,
                        nombre: local.nombre,
                        estado: local.estado,
                        tipo: local.tipoLocal?.nombre,
                        direccion: local.direccion
                    }
                };
            }

            return {
                exists: false,
                active: false,
                isStore: false,
                data: null
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    exists: false,
                    active: false,
                    isStore: false,
                    data: null
                };
            }
            throw new Error(`Error al consultar el servicio de tiendas: ${error.message}`);
        }
    }

    /**
     * Obtiene información de una tienda
     * @param {number} id_tienda - ID de la tienda
     * @returns {Promise<object>}
     */
    async getStoreInfo(id_tienda) {
        try {
            const response = await axios.get(
                `${STORE_SERVICE_URL}/locales/${id_tienda}`
            );

            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(`La tienda con ID ${id_tienda} no se encontró`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`La tienda con ID ${id_tienda} no existe`);
            }
            throw new Error(`Error al obtener información de la tienda: ${error.message}`);
        }
    }

    /**
     * Obtiene todas las tiendas activas
     * @returns {Promise<object[]>}
     */
    async getActiveStores() {
        try {
            const response = await axios.get(
                `${STORE_SERVICE_URL}/locales?estado=ACTIVO`
            );

            if (response.data && response.data.data) {
                // Filtrar solo tiendas (no almacenes)
                return response.data.data.filter(local => 
                    local.tipoLocal && 
                    (local.tipoLocal.nombre.toLowerCase().includes('tienda') ||
                     local.tipoLocal.nombre.toLowerCase() === 'tienda')
                );
            }

            return [];
        } catch (error) {
            throw new Error(`Error al obtener tiendas activas: ${error.message}`);
        }
    }

    /**
     * Verifica si una tienda puede atender un pedido (verificando almacenes asociados)
     * @param {number} id_tienda - ID de la tienda
     * @returns {Promise<boolean>}
     */
    async canStoreHandleOrder(id_tienda) {
        try {
            const storeInfo = await this.validateStore(id_tienda);
            
            if (!storeInfo.exists || !storeInfo.active || !storeInfo.isStore) {
                return false;
            }

            // Aquí podrías agregar lógica adicional para verificar
            // si la tienda tiene almacenes asociados, horarios, etc.
            
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default new StoreService();
