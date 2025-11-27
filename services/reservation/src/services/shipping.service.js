import axios from 'axios';

const SHIPPING_SERVICE_URL = process.env.SHIPPING_SERVICE_URL || 'https://shipping-service-814404078279.us-central1.run.app/api';

class ShippingService {
    /**
     * Verifica si un carrier existe y está activo
     * @param {number} id_carrier - ID del carrier
     * @returns {Promise<{exists: boolean, active: boolean, data: object}>}
     */
    async validateCarrier(id_carrier) {
        try {
            const response = await axios.get(
                `${SHIPPING_SERVICE_URL}/carrier/${id_carrier}`
            );

            if (response.data && response.data.success && response.data.data) {
                const carrier = response.data.data;
                
                return {
                    exists: true,
                    active: carrier.activo === true,
                    data: {
                        id: carrier.id,
                        nombre: carrier.nombre,
                        codigo: carrier.codigo,
                        tipo: carrier.tipo,
                        activo: carrier.activo,
                        tarifa_base: carrier.tarifa_base,
                        tiempo_base_dias: carrier.tiempo_base_dias
                    }
                };
            }

            return {
                exists: false,
                active: false,
                data: null
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    exists: false,
                    active: false,
                    data: null
                };
            }
            throw new Error(`Error al consultar el servicio de carriers: ${error.message}`);
        }
    }

    /**
     * Obtiene información de un carrier
     * @param {number} id_carrier - ID del carrier
     * @returns {Promise<object>}
     */
    async getCarrierInfo(id_carrier) {
        try {
            const response = await axios.get(
                `${SHIPPING_SERVICE_URL}/carriers/${id_carrier}`
            );

            if (response.data && response.data.success) {
                return response.data.data;
            }

            throw new Error('Carrier no encontrado');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`El carrier con ID ${id_carrier} no existe`);
            }
            throw new Error(`Error al obtener información del carrier: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los carriers activos
     * @returns {Promise<object[]>}
     */
    async getActiveCarriers() {
        try {
            const response = await axios.get(
                `${SHIPPING_SERVICE_URL}/carriers`
            );

            if (response.data && response.data.success && response.data.data) {
                // Filtrar solo carriers activos
                return response.data.data.filter(carrier => carrier.activo === true);
            }

            return [];
        } catch (error) {
            throw new Error(`Error al obtener carriers activos: ${error.message}`);
        }
    }

    /**
     * Crea una cotización de envío
     * @param {object} cotizacionData - Datos para la cotización
     * @returns {Promise<object>}
     */
    async createShippingQuote(cotizacionData) {
        try {
            const response = await axios.post(
                `${SHIPPING_SERVICE_URL}/cotizaciones`,
                cotizacionData
            );

            if (response.data && response.data.success) {
                return response.data.data;
            }

            return response.data;
        } catch (error) {
            throw new Error(`Error al crear cotización de envío: ${error.message}`);
        }
    }

    /**
     * Verifica si un carrier puede atender un envío
     * @param {number} id_carrier - ID del carrier
     * @param {object} shippingDetails - Detalles del envío (peso, destino, etc.)
     * @returns {Promise<boolean>}
     */
    async canCarrierHandleShipment(id_carrier, shippingDetails = {}) {
        try {
            const carrierInfo = await this.validateCarrier(id_carrier);
            
            if (!carrierInfo.exists || !carrierInfo.active) {
                return false;
            }

            // Verificar peso máximo si está definido
            if (carrierInfo.data.peso_maximo_kg && shippingDetails.peso_kg) {
                if (shippingDetails.peso_kg > carrierInfo.data.peso_maximo_kg) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}

export default new ShippingService();
