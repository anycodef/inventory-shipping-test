export const getStockEstado = (disponibleTotal) => {
    if (disponibleTotal === 0) return "AGOTADO";
    if (disponibleTotal < 50) return "BAJO STOCK";
    return "DISPONIBLE";
};

export const getStockEstadoGlobal = (disponibleTotal) => {
    if (disponibleTotal === 0) return "AGOTADO";
    if (disponibleTotal < 100) return "BAJO STOCK";
    return "DISPONIBLE";
};
