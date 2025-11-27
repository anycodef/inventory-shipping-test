const DEFAULT_TIMEOUT_MS = 8000;

class InventoryServiceClient {
  constructor({
    baseUrl = process.env.INVENTORY_SERVICE_URL || "https://inventory-service-814404078279.us-central1.run.app/api",
    timeoutMs = process.env.INVENTORY_SERVICE_TIMEOUT
      ? parseInt(process.env.INVENTORY_SERVICE_TIMEOUT, 10)
      : DEFAULT_TIMEOUT_MS,
    logger = console,
  } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    // Si ya incluye /api, usar tal cual; si no, agregarlo
    this.apiBaseUrl = this.baseUrl.endsWith("/api")
      ? this.baseUrl
      : `${this.baseUrl}/api`;
    this.timeoutMs = Number.isNaN(timeoutMs) ? DEFAULT_TIMEOUT_MS : timeoutMs;
    this.logger = logger;
  }

  buildUrl(path) {
    const normalizedPath = path.startsWith("/")
      ? path
      : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }

  async request(path, { method = "GET", body, headers = {} } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.buildUrl(path), {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const error = new Error(
          `[InventoryService] Request failed with status ${response.status}`
        );
        error.response = response;
        error.payload = data;
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(
        `[InventoryService] Request error for ${method} ${path}:`,
        error.message
      );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getStockProduct(stockId) {
    if (!stockId) {
      throw new Error("stockId is required");
    }
    return this.request(`/stock/${stockId}`, { method: "GET" });
  }

  async updateStockProduct(stockId, payload) {
    if (!stockId) {
      throw new Error("stockId is required");
    }
    return this.request(`/stock/${stockId}`, { method: "PUT", body: payload });
  }

  async reserveStock(stockId, amount) {
    if (!stockId) {
      throw new Error("stockId is required");
    }
    if (!amount || amount <= 0) {
      throw new Error("amount must be greater than zero");
    }

    const stock = await this.getStockProduct(stockId);
    const available = stock?.stock_disponible ?? 0;

    if (available < amount) {
      const error = new Error(
        `Stock insuficiente. Disponible: ${available}, Solicitado: ${amount}`
      );
      error.code = "INSUFFICIENT_STOCK";
      throw error;
    }

    this.logger.info(
      `[InventoryService] Reserving ${amount} units for stock ${stockId}`
    );

    return this.updateStockProduct(stockId, {
      stock_reservado: (stock.stock_reservado || 0) + amount,
      stock_disponible: available - amount,
    });
  }

  async releaseReservedStock(stockId, amount) {
    if (!stockId) {
      throw new Error("stockId is required");
    }
    if (!amount || amount <= 0) {
      throw new Error("amount must be greater than zero");
    }

    const stock = await this.getStockProduct(stockId);

    if (!stock?.stock_reservado && stock?.stock_reservado !== 0) {
      throw new Error(
        `Stock ${stockId} does not include stock_reservado information`
      );
    }

    const updatedStockReservado = Math.max(
      0,
      (stock.stock_reservado || 0) - amount
    );
    const updatedStockDisponible =
      (stock.stock_disponible || 0) + amount;

    this.logger.info(
      `[InventoryService] Releasing ${amount} units for stock ${stockId}`
    );

    return this.updateStockProduct(stockId, {
      stock_reservado: updatedStockReservado,
      stock_disponible: updatedStockDisponible,
    });
  }
}

export default InventoryServiceClient;
