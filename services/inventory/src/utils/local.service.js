import axios from "axios";

const LOCALES_API = "https://store-service-814404078279.us-central1.run.app/api/locales";

/**
 * Obtiene datos básicos de un local por su ID
 * @param {number} id_local 
 * @returns {Promise<{nombre: string, imagen: string}>}
 */
export const getLocalBasico = async (id_local) => {
    try {
        const resp = await axios.get(`${LOCALES_API}/${id_local}`);

        if (resp.data?.success && resp.data.data) {
            const local = resp.data.data;
            return {
                nombre: local.nombre,
                imagen: local.imagen,
            };
        }

        // Si la API no devuelve correctamente
        return { nombre: "Desconocido", imagen: "" };
    } catch (error) {
        console.error(`❌ Error al obtener datos del local ${id_local}:`, error.message);
        return { nombre: "Desconocido", imagen: "" };
    }
};
