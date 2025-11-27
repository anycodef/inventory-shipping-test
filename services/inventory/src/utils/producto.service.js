import axios from "axios";

const PRODUCTOS_API = "https://catalogo-service-dcc3a7dgbja8b6dd.canadacentral-01.azurewebsites.net/api";

/**
 * Obtiene información básica del producto
 * (nombre e imagen principal)
 * @param {number} id_producto
 * @returns {Promise<{ nombre: string, imagen: string }>}
 */
export const getProductoBasico = async (id_producto) => {
    try {
        const resp = await axios.get(`${PRODUCTOS_API}/productos/${id_producto}`);
        const producto = resp.data;

        if (!producto) {
            return { nombre: "Desconocido", imagen: "" };
        }

        // Buscar imagen principal del producto
        let imagen = "";
        const principal = producto.productoImagenes?.find((img) => img.principal);
        if (principal) {
            imagen = principal.imagen;
        } else if (producto.productoImagenes?.length > 0) {
            // Fallback: tomar la primera imagen si no hay principal
            imagen = producto.productoImagenes[0].imagen;
        } else if (producto.variantes?.length > 0) {
            // Segundo fallback: usar imagen de la primera variante
            const varianteImg = producto.variantes[0].varianteImagenes?.[0]?.imagen;
            if (varianteImg) imagen = varianteImg;
        }

        return {
            nombre: producto.nombre || "Sin nombre",
            imagen: imagen || "",
        };
    } catch (error) {
        console.error(`❌ Error al obtener producto ${id_producto}:`, error.message);
        return { nombre: "Desconocido", imagen: "" };
    }
};
