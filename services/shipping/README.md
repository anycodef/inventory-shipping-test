# 🚚 Shipping Service

Microservicio dedicado a la gestión de envíos, transportistas (carriers) y cotizaciones de envío, con soporte para filtrado, paginación y consulta de envíos expirados.
Microservicio dedicado a la gestión de envíos, transportistas (carriers) y cotizaciones de envío, con soporte para filtrado, paginación y consulta de envíos expirados.

## 🌐 URL Base

**Local:** `http://localhost:4003`  
**Cloud Run:** `https://shipping-service-xxxxx-uc.a.run.app`

---

## 🎯 Características Principales

- ✅ **Gestión de carriers** (transportistas) con tarifas configurables
- ✅ **Cotizaciones de envío** en tiempo real para múltiples carriers
- ✅ **Cálculo automático** de distancias, costos y tiempos de entrega
- ✅ **Soporte para dos tipos de envío:** DOMICILIO y RECOJO_TIENDA
- ✅ **Historial de cotizaciones** con filtrado y límites
- ✅ **Gestión completa de envíos** con estados y seguimiento
- ✅ **Validación de pesos** y dimensiones
- ✅ **Integración con inventario** para cálculo de pesos por producto

---

## 🎯 Características Principales

- ✅ **Gestión de carriers** (transportistas) con tarifas configurables
- ✅ **Cotizaciones de envío** en tiempo real para múltiples carriers
- ✅ **Cálculo automático** de distancias, costos y tiempos de entrega
- ✅ **Soporte para dos tipos de envío:** DOMICILIO y RECOJO_TIENDA
- ✅ **Historial de cotizaciones** con filtrado y límites
- ✅ **Gestión completa de envíos** con estados y seguimiento
- ✅ **Validación de pesos** y dimensiones
- ✅ **Integración con inventario** para cálculo de pesos por producto

---

## 📚 Endpoints Disponibles

### 💰 Cotizaciones (Quotations)

Base URL: `/api/cotizaciones`

#### **POST** `/api/cotizaciones`

Obtiene cotizaciones de envío de todos los carriers disponibles para un destino específico.

**Descripción:** Este endpoint calcula automáticamente:
- Distancia desde Trujillo (origen) hasta el destino
- Costo de envío basado en distancia, peso y carrier
- Tiempo estimado de entrega
- Fecha estimada de entrega

**Request Body:**

| Campo | Tipo | Requerido | Descripción | Default |
|-------|------|-----------|-------------|---------|
| `destino_lat` | `number` | Sí | Latitud del destino (-90 a 90) | - |
| `destino_lng` | `number` | Sí | Longitud del destino (-180 a 180) | - |
| `destino_direccion` | `string` | Sí | Dirección completa del destino | - |
| `productos` | `array` | No | Array de {id_producto, cantidad} | `[]` |
| `peso_kg` | `number` | No | Peso total en kilogramos | `1` |
| `dimensiones` | `object` | No | {largo, ancho, alto} en cm | `{30,30,30}` |
| `valor_declarado` | `number` | No | Valor del paquete (para seguro) | `0` |

**Ejemplo - Cotización Simple:**

```json
{
  "destino_lat": -8.1116,
  "destino_lng": -79.0288,
  "destino_direccion": "Av. Larco 850, Trujillo, La Libertad",
  "peso_kg": 2.5
}
```

**Ejemplo - Cotización con Productos:**

```json
{
  "destino_lat": -12.0464,
  "destino_lng": -77.0428,
  "destino_direccion": "Av. Javier Prado 123, San Isidro, Lima",
  "productos": [
    { "id_producto": 101, "cantidad": 2 },
    { "id_producto": 103, "cantidad": 1 }
  ],
  "dimensiones": {
    "largo": 40,
    "ancho": 30,
    "alto": 20
  },
  "valor_declarado": 150.00
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "origen": {
    "lat": -8.1116,
    "lng": -79.0288,
    "direccion": "Trujillo, La Libertad, Perú"
  },
  "destino": {
    "lat": -12.0464,
    "lng": -77.0428,
    "direccion": "Av. Javier Prado 123, San Isidro, Lima"
  },
  "distancia_km": 558.42,
  "peso_total_kg": 2.5,
  "dimensiones": {
    "largo": 40,
    "ancho": 30,
    "alto": 20
  },
  "valor_declarado": 150.00,
  "cotizaciones": [
    {
      "carrier_id": 1,
      "carrier_nombre": "FedEx Express",
      "carrier_codigo": "FEDEX",
      "carrier_tipo": "INTERNACIONAL",
      "costo_envio": 89.50,
      "tiempo_estimado_dias": 2,
      "fecha_entrega_estimada": "2025-11-09T12:00:00.000Z",
      "desglose": {
        "tarifa_base": 50.00,
        "costo_por_distancia": 27.92,
        "costo_por_peso": 11.58,
        "subtotal": 89.50
      },
      "cotizacion_id": "cm2zk8x7y0000xxxxxxxx",
      "valida_hasta": "2025-11-07T18:30:00.000Z"
    },
    {
      "carrier_id": 2,
      "carrier_nombre": "DHL Express",
      "carrier_codigo": "DHL",
      "carrier_tipo": "INTERNACIONAL",
      "costo_envio": 95.75,
      "tiempo_estimado_dias": 1,
      "fecha_entrega_estimada": "2025-11-08T12:00:00.000Z",
      "desglose": {
        "tarifa_base": 60.00,
        "costo_por_distancia": 27.92,
        "costo_por_peso": 7.83,
        "subtotal": 95.75
      },
      "cotizacion_id": "cm2zk8x7y0001xxxxxxxx",
      "valida_hasta": "2025-11-07T18:30:00.000Z"
    },
    {
      "carrier_id": 3,
      "carrier_nombre": "Servientrega",
      "carrier_codigo": "SER",
      "carrier_tipo": "NACIONAL",
      "costo_envio": 67.20,
      "tiempo_estimado_dias": 4,
      "fecha_entrega_estimada": "2025-11-11T12:00:00.000Z",
      "desglose": {
        "tarifa_base": 30.00,
        "costo_por_distancia": 27.92,
        "costo_por_peso": 9.28,
        "subtotal": 67.20
      },
      "cotizacion_id": "cm2zk8x7y0002xxxxxxxx",
      "valida_hasta": "2025-11-07T18:30:00.000Z"
    }
  ],
  "total_carriers": 3,
  "created_at": "2025-11-07T14:30:00.000Z"
}
```

**Errores:**

```json
// 400 - Falta coordenadas
{
  "success": false,
  "error": "Se requieren coordenadas de destino (destino_lat, destino_lng)"
}

// 400 - Falta dirección
{
  "success": false,
  "error": "Se requiere dirección de destino"
}

// 400 - Formato de productos inválido
{
  "success": false,
  "error": "El campo 'productos' debe ser un array de objetos { id_producto, cantidad }"
}

// 500 - Error del servidor
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Detalle del error"
}
```

**Notas importantes:**
- Las cotizaciones son válidas por **4 horas** desde su creación
- El peso se calcula automáticamente si proporcionas productos
- La distancia se calcula usando la fórmula de Haversine
- Los costos incluyen: tarifa base + distancia + peso
- Cada cotización se guarda en la base de datos con un ID único

---

#### **GET** `/api/cotizaciones/historial`

Obtiene el historial de cotizaciones realizadas.

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción | Default |
|-----------|------|-----------|-------------|---------|
| `limit` | `number` | No | Cantidad máxima de resultados | `50` |
| `tipo_envio` | `string` | No | Filtrar por tipo (DOMICILIO, RECOJO_TIENDA) | - |

**Ejemplos:**

```bash
GET /api/cotizaciones/historial
GET /api/cotizaciones/historial?limit=20
GET /api/cotizaciones/historial?tipo_envio=DOMICILIO&limit=10
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "total": 15,
  "cotizaciones": [
    {
      "id": "cm2zk8x7y0000xxxxxxxx",
      "origen_lat": -8.1116,
      "origen_lng": -79.0288,
      "origen_direccion": "Trujillo, La Libertad, Perú",
      "destino_lat": -12.0464,
      "destino_lng": -77.0428,
      "destino_direccion": "Av. Javier Prado 123, Lima",
      "distancia_km": 558.42,
      "peso_kg": 2.5,
      "dimensiones": {
        "largo": 40,
        "ancho": 30,
        "alto": 20
      },
      "valor_declarado": 150.00,
      "tipo_envio": "DOMICILIO",
      "carrier_id": 1,
      "carrier_nombre": "FedEx Express",
      "costo_envio": 89.50,
      "tiempo_estimado_dias": 2,
      "fecha_entrega_estimada": "2025-11-09T12:00:00.000Z",
      "cotizacion_valida_hasta": "2025-11-07T18:30:00.000Z",
      "created_at": "2025-11-07T14:30:00.000Z"
    }
  ]
}
```

**Errores:**

```json
// 500 - Error del servidor
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Detalle del error"
}
```

---

#### **GET** `/api/cotizaciones/:id`

Obtiene una cotización específica por su ID.

**Parámetros:**
- `id` (path, string) - ID único de la cotización (CUID)

**Ejemplo:** `GET /api/cotizaciones/cm2zk8x7y0000xxxxxxxx`

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "cotizacion": {
    "id": "cm2zk8x7y0000xxxxxxxx",
    "origen_lat": -8.1116,
    "origen_lng": -79.0288,
    "origen_direccion": "Trujillo, La Libertad, Perú",
    "destino_lat": -12.0464,
    "destino_lng": -77.0428,
    "destino_direccion": "Av. Javier Prado 123, Lima",
    "distancia_km": 558.42,
    "peso_kg": 2.5,
    "dimensiones": {
      "largo": 40,
      "ancho": 30,
      "alto": 20
    },
    "valor_declarado": 150.00,
    "tipo_envio": "DOMICILIO",
    "carrier_id": 1,
    "carrier_nombre": "FedEx Express",
    "costo_envio": 89.50,
    "tiempo_estimado_dias": 2,
    "fecha_entrega_estimada": "2025-11-09T12:00:00.000Z",
    "cotizacion_valida_hasta": "2025-11-07T18:30:00.000Z",
    "created_at": "2025-11-07T14:30:00.000Z"
  }
}
```

**Errores:**

```json
// 404 - Cotización no encontrada
{
  "success": false,
  "error": "Cotización no encontrada"
}

// 500 - Error del servidor
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Detalle del error"
}
```

---

#### **GET** `/api/cotizaciones/carriers/disponibles`

Lista todos los carriers disponibles con su información completa.

**Ejemplo:** `GET /api/cotizaciones/carriers/disponibles`

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "total": 3,
  "carriers": [
    {
      "id": 1,
      "nombre": "FedEx Express",
      "codigo": "FEDEX",
      "activo": true,
      "tipo": "INTERNACIONAL",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/9d/FedEx_Express.svg",
      "tarifa_base": 50.00,
      "tarifa_por_kg": 5.50,
      "tarifa_por_km": 0.05,
      "tiempo_base_dias": 2,
      "cobertura_nacional": true,
      "cobertura_internacional": true,
      "peso_maximo_kg": 70.00
    },
    {
      "id": 2,
      "nombre": "DHL Express",
      "codigo": "DHL",
      "activo": true,
      "tipo": "INTERNACIONAL",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg",
      "tarifa_base": 60.00,
      "tarifa_por_kg": 4.50,
      "tarifa_por_km": 0.05,
      "tiempo_base_dias": 1,
      "cobertura_nacional": true,
      "cobertura_internacional": true,
      "peso_maximo_kg": 70.00
    },
    {
      "id": 3,
      "nombre": "Servientrega",
      "codigo": "SER",
      "activo": true,
      "tipo": "NACIONAL",
      "logo_url": null,
      "tarifa_base": 30.00,
      "tarifa_por_kg": 4.20,
      "tarifa_por_km": 0.05,
      "tiempo_base_dias": 4,
      "cobertura_nacional": true,
      "cobertura_internacional": false,
      "peso_maximo_kg": 50.00
    }
  ]
}
```

**Errores:**

```json
// 500 - Error del servidor
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Detalle del error"
}
```

---

### 🚛 Carrier (Transportistas)

Base URL: `/api/carrier`


#### **GET** `/api/carrier`
Obtener todos los transportistas ordenados alfabéticamente.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "DHL Express",
      "tarifa_por_hora": 50.00
    },
    {
      "id": 2,
      "nombre": "Olva Courier",
      "tarifa_por_hora": 35.00
    },
    {
      "id": 3,
      "nombre": "Shalom Empresarial",
      "tarifa_por_hora": 40.00
    }
  ]
}
```

#### **GET** `/api/carrier/paginated`
Obtener transportistas con paginación.

**Query Parameters opcionales:**
- `page` (número, default: 1) - Número de página
- `limit` (número, default: 10) - Transportistas por página

**Ejemplo:** `GET /api/carrier/paginated?page=1&limit=5`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "DHL Express",
      "tarifa_por_hora": 50.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 3,
    "totalPages": 1
  }
}
```

**Errores:**
- `400` - page o limit inválidos (deben ser números > 0)
- `500` - Error del servidor

#### **GET** `/api/carrier/:id`
Obtener un transportista específico por ID, incluyendo sus últimos 10 envíos.

**Parámetros:**
- `id` (path, número) - ID del transportista

**Ejemplo:** `GET /api/carrier/1`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "DHL Express",
    "tarifa_por_hora": 50.00,
    "envio": [
      {
        "id": 1,
        "id_orden": 1001,
        "fecha_reserva": "2024-03-21T08:00:00.000Z",
        "stock_reservado": 10
      }
    ]
  }
}
```

**Errores:**
- `400` - ID inválido, debe ser un número
- `404` - Transportista no encontrado
- `500` - Error del servidor

#### **POST** `/api/carrier`
Crear un nuevo transportista.

**Body (JSON):**
```json
{
  "nombre": "Shalom Express",
  "tarifa_por_hora": 45.50
}
```

**Campos requeridos:**
- `nombre` (string) - Nombre del transportista (máx. 100 caracteres, único)
- `tarifa_por_hora` (número) - Tarifa por hora del servicio (debe ser > 0)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "nombre": "Shalom Express",
    "tarifa_por_hora": 45.50
  },
  "message": "Carrier creado exitosamente"
}
```

**Errores:**
- `400` - Campos requeridos faltantes, nombre vacío, nombre > 100 caracteres, o tarifa_por_hora ≤ 0
- `409` - Ya existe un transportista con ese nombre (duplicado)
- `500` - Error del servidor

#### **PUT** `/api/carrier/:id`
Actualizar un transportista existente.

**Parámetros:**
- `id` (path, número) - ID del transportista

**Body (JSON):** (Todos los campos son opcionales)
```json
{
  "nombre": "DHL Express Perú",
  "tarifa_por_hora": 55.00
}
```

**Ejemplo:** `PUT /api/carrier/1`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "DHL Express Perú",
    "tarifa_por_hora": 55.00
  },
  "message": "Carrier actualizado exitosamente"
}
```

**Errores:**
- `400` - ID inválido, nombre vacío, nombre > 100 caracteres, o tarifa_por_hora ≤ 0
- `404` - Transportista no encontrado
- `409` - Nombre duplicado
- `500` - Error del servidor

#### **DELETE** `/api/carrier/:id`
Eliminar un transportista.

**Parámetros:**
- `id` (path, número) - ID del transportista

**Ejemplo:** `DELETE /api/carrier/4`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Carrier eliminado exitosamente"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Transportista no encontrado
- `409` - No se puede eliminar porque tiene envíos asociados
- `500` - Error del servidor

**Nota:** El sistema verifica si el transportista tiene envíos asociados antes de eliminarlo y devuelve la cantidad de envíos si los tiene.

---

### 📦 Envío (Shipping)

Base URL: `/api/shipping`

#### **GET** `/api/shipping`
Obtener todos los envíos con soporte para filtrado y paginación.

**Query Parameters opcionales:**
- `page` (número, default: 1) - Número de página
- `limit` (número, default: 10) - Envíos por página
- `id_orden` (número) - Filtrar por orden
- `id_estado` (número) - Filtrar por estado
- `id_carrier` (número) - Filtrar por transportista
- `fecha_desde` (ISO date) - Filtrar desde fecha
- `fecha_hasta` (ISO date) - Filtrar hasta fecha

**Ejemplo sin filtros:** `GET /api/shipping`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_stock_producto": 1,
      "id_orden": 1001,
      "stock_reservado": 10,
      "fecha_reserva": "2024-03-21T08:00:00.000Z",
      "fecha_expiracion": "2024-03-28T08:00:00.000Z",
      "id_estado": 1,
      "id_carrier": 1,
      "carrier": {
        "id": 1,
        "nombre": "DHL Express",
        "tarifa_por_hora": 50.00
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 9,
    "totalPages": 1
  }
}
```

**Ejemplo con filtros:** `GET /api/shipping?id_carrier=1&id_estado=2&page=1&limit=5`

**Respuesta:** Retorna solo envíos del carrier DHL Express con estado 2, 5 por página

**Ejemplo filtro por fechas:** `GET /api/shipping?fecha_desde=2024-03-01&fecha_hasta=2024-03-31`

**Respuesta:** Retorna envíos creados en marzo 2024

**Errores:**
- `400` - Parámetros de filtrado inválidos (deben ser números o fechas válidas)
- `500` - Error del servidor

#### **GET** `/api/shipping/:id`
Obtener un envío específico por ID.

**Parámetros:**
- `id` (path, número) - ID del envío

**Ejemplo:** `GET /api/shipping/1`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "id_stock_producto": 1,
    "id_orden": 1001,
    "stock_reservado": 10,
    "fecha_reserva": "2024-03-21T08:00:00.000Z",
    "fecha_expiracion": "2024-03-28T08:00:00.000Z",
    "id_estado": 1,
    "id_carrier": 1,
    "carrier": {
      "id": 1,
      "nombre": "DHL Express",
      "tarifa_por_hora": 50.00
    }
  }
}
```

**Errores:**
- `400` - ID inválido, debe ser un número
- `404` - Envío no encontrado
- `500` - Error del servidor

#### **GET** `/api/shipping/order/:id_orden`
Obtener todos los envíos de una orden específica.

**Parámetros:**
- `id_orden` (path, número) - ID de la orden

**Ejemplo:** `GET /api/shipping/order/1001`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_orden": 1001,
      "stock_reservado": 10,
      "fecha_reserva": "2024-03-21T08:00:00.000Z",
      "carrier": {
        "nombre": "DHL Express"
      }
    }
  ],
  "count": 1
}
```

**Errores:**
- `400` - ID de orden inválido, debe ser un número
- `500` - Error del servidor

#### **GET** `/api/shipping/status/expired`
Obtener todos los envíos que ya expiraron (fecha_expiracion < fecha actual).

**Ejemplo:** `GET /api/shipping/status/expired`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "id_stock_producto": 7,
      "id_orden": 1009,
      "stock_reservado": 0,
      "fecha_reserva": "2024-03-05T08:00:00.000Z",
      "fecha_expiracion": "2024-03-12T08:00:00.000Z",
      "carrier": {
        "nombre": "Olva Courier"
      }
    }
  ],
  "count": 1
}
```

**Nota:** Los envíos se ordenan por fecha_expiracion descendente (más recientes primero).

#### **POST** `/api/shipping`
Crear un nuevo envío.

**Body (JSON):**
```json
{
  "id_stock_producto": 2,
  "id_orden": 1010,
  "stock_reservado": 15,
  "fecha_expiracion": "2024-04-10T23:59:59.000Z",
  "id_estado": 1,
  "id_carrier": 1
}
```

**Campos requeridos:**
- `id_stock_producto` (número) - ID del stock del producto (FK lógica a Inventory)
- `id_orden` (número) - ID de la orden (FK lógica a Orders)
- `stock_reservado` (número) - Cantidad reservada (debe ser > 0)
- `id_estado` (número) - ID del estado del envío
- `id_carrier` (número) - ID del transportista (debe existir)

**Campos opcionales:**
- `fecha_expiracion` (datetime) - Fecha límite del envío (default: +7 días)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "id_stock_producto": 2,
    "id_orden": 1010,
    "stock_reservado": 15,
    "fecha_reserva": "2024-03-25T18:30:00.000Z",
    "fecha_expiracion": "2024-04-10T23:59:59.000Z",
    "id_estado": 1,
    "id_carrier": 1,
    "carrier": {
      "nombre": "DHL Express"
    }
  },
  "message": "Envío creado exitosamente"
}
```

**Validaciones:**
- `stock_reservado` debe ser mayor a 0
- `fecha_expiracion` debe ser una fecha futura (si se proporciona)
- `id_carrier` debe existir en la tabla Carrier

**Errores:**
- `400` - Campos requeridos faltantes, stock_reservado ≤ 0, fecha_expiracion inválida o pasada, o id_carrier inválido
- `404` - Carrier no encontrado
- `500` - Error del servidor

#### **PUT** `/api/shipping/:id`
Actualizar un envío completo.

**Parámetros:**
- `id` (path, número) - ID del envío

**Body (JSON):** (Todos los campos son opcionales)
```json
{
  "stock_reservado": 20,
  "id_estado": 2,
  "id_carrier": 2,
  "fecha_expiracion": "2024-04-15T23:59:59.000Z"
}
```

**Ejemplo:** `PUT /api/shipping/10`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "id_stock_producto": 2,
    "id_orden": 1010,
    "stock_reservado": 20,
    "fecha_reserva": "2024-03-25T18:30:00.000Z",
    "fecha_expiracion": "2024-04-15T23:59:59.000Z",
    "id_estado": 2,
    "id_carrier": 2,
    "carrier": {
      "nombre": "Olva Courier"
    }
  },
  "message": "Envío actualizado exitosamente"
}
```

**Campos actualizables:**
- `id_stock_producto` (número)
- `id_orden` (número)
- `stock_reservado` (número, debe ser > 0)
- `id_estado` (número)
- `id_carrier` (número, debe existir)
- `fecha_expiracion` (datetime)

**Errores:**
- `400` - ID inválido, stock_reservado ≤ 0, fecha inválida, o id_carrier no existe
- `404` - Envío o Carrier no encontrado
- `500` - Error del servidor

#### **PATCH** `/api/shipping/:id/status`
Actualizar solo el estado de un envío (más eficiente que PUT).

**Parámetros:**
- `id` (path, número) - ID del envío

**Body (JSON):**
```json
{
  "id_estado": 3
}
```

**Ejemplo:** `PATCH /api/shipping/10/status`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "id_stock_producto": 2,
    "id_orden": 1010,
    "stock_reservado": 20,
    "fecha_reserva": "2024-03-25T18:30:00.000Z",
    "fecha_expiracion": "2024-04-15T23:59:59.000Z",
    "id_estado": 3,
    "id_carrier": 2,
    "carrier": {
      "nombre": "Olva Courier"
    }
  },
  "message": "Estado del envío actualizado exitosamente"
}
```

**Campo requerido:**
- `id_estado` (número) - Nuevo estado del envío

**Errores:**
- `400` - ID o id_estado inválidos
- `404` - Envío no encontrado
- `500` - Error del servidor

#### **DELETE** `/api/shipping/:id`
Eliminar un envío.

**Parámetros:**
- `id` (path, número) - ID del envío

**Ejemplo:** `DELETE /api/shipping/10`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Envío eliminado exitosamente"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Envío no encontrado
- `500` - Error del servidor


---

## 🗄️ Modelos de Datos (Prisma Schema)

### Carrier (Transportista)
```prisma
model Carrier {
  id              Int     @id @default(autoincrement())
  nombre          String  @unique @db.VarChar(100)
  tarifa_por_hora Decimal @db.Decimal(10, 2)
  envio           Envio[]

  @@map("carrier")
}
```

**Relaciones:**
- Un Carrier puede tener múltiples Envios

### Envio (Shipping)
```prisma
model Envio {
  id                 Int      @id @default(autoincrement())
  id_stock_producto  Int
  id_orden           Int
  stock_reservado    Int
  fecha_reserva      DateTime @default(now())
  fecha_expiracion   DateTime
  id_estado          Int
  id_carrier         Int
  carrier            Carrier  @relation(fields: [id_carrier], references: [id])

  @@map("envio")
}
```

**Relaciones:**
- Cada Envio pertenece a un Carrier
- `id_stock_producto` referencia al servicio Inventory (relación lógica, no FK física)
- `id_orden` referencia a un sistema de órdenes externo (relación lógica)
- `id_estado` referencia a estados de envío (relación lógica)

---

## 🎯 Códigos de Error Prisma

### P2002 - Unique Constraint Violation
**Cuándo ocurre:** Al intentar crear/actualizar un Carrier con un nombre duplicado.

**Ejemplo:**
```bash
POST /api/carrier
{
  "nombre": "DHL Express"  # Ya existe
}
```

**Respuesta (409):**
```json
{
  "success": false,
  "error": "Ya existe un carrier con ese nombre"
}
```

### P2003 - Foreign Key Constraint Violation
**Cuándo ocurre:** 
1. Al crear/actualizar un Envío con un `id_carrier` que no existe
2. Al intentar eliminar un Carrier que tiene Envíos asociados

**Ejemplo 1:**
```bash
POST /api/shipping
{
  "id_carrier": 999  # No existe
}
```

**Respuesta (400):**
```json
{
  "success": false,
  "error": "El id_carrier proporcionado no existe en la base de datos"
}
```

**Ejemplo 2:**
```bash
DELETE /api/carrier/1  # Tiene envíos asociados
```

**Respuesta (409):**
```json
{
  "success": false,
  "error": "No se puede eliminar el carrier porque tiene envíos asociados",
  "count": 5
}
```

### P2025 - Record Not Found
**Cuándo ocurre:** Al intentar actualizar/eliminar un Envío o Carrier que no existe.

**Ejemplo:**
```bash
PUT /api/shipping/9999
```

**Respuesta (404):**
```json
{
  "success": false,
  "error": "Envío no encontrado"
}
```

---

## 📊 Ejemplos de Uso Completos

### Flujo: Crear un transportista y asignar envíos

**1. Crear el transportista:**
```bash
POST http://localhost:4003/api/carrier
Content-Type: application/json

{
  "nombre": "Shalom Express",
  "tarifa_por_hora": 42.50
}
```

**2. Verificar el transportista creado:**
```bash
GET http://localhost:4003/api/carrier/4
```

**3. Crear un envío con ese transportista:**
```bash
POST http://localhost:4003/api/shipping
Content-Type: application/json

{
  "id_stock_producto": 3,
  "id_orden": 1011,
  "stock_reservado": 25,
  "fecha_expiracion": "2024-04-20T23:59:59.000Z",
  "id_estado": 1,
  "id_carrier": 4
}
```

**4. Ver los envíos del transportista:**
```bash
GET http://localhost:4003/api/carrier/4
```

### Flujo: Consultar envíos filtrados

**1. Obtener envíos de un transportista específico:**
```bash
GET http://localhost:4003/api/shipping?id_carrier=1&page=1&limit=5
```

**2. Obtener envíos de una orden:**
```bash
GET http://localhost:4003/api/shipping/order/1001
```

**3. Obtener envíos con estado específico:**
```bash
GET http://localhost:4003/api/shipping?id_estado=2&page=1&limit=10
```

**4. Obtener envíos en un rango de fechas:**
```bash
GET http://localhost:4003/api/shipping?fecha_desde=2024-03-01&fecha_hasta=2024-03-31
```

### Flujo: Gestión de envíos expirados

**1. Consultar todos los envíos expirados:**
```bash
GET http://localhost:4003/api/shipping/status/expired
```

**2. Actualizar estado de un envío expirado:**
```bash
PATCH http://localhost:4003/api/shipping/9/status
Content-Type: application/json

{
  "id_estado": 5
}
```

### Flujo: Actualizar un envío

**1. Actualización completa (PUT):**
```bash
PUT http://localhost:4003/api/shipping/1
Content-Type: application/json

{
  "stock_reservado": 30,
  "id_estado": 3,
  "id_carrier": 2,
  "fecha_expiracion": "2024-05-01T23:59:59.000Z"
}
```

**2. Actualización solo del estado (PATCH - más eficiente):**
```bash
PATCH http://localhost:4003/api/shipping/1/status
Content-Type: application/json

{
  "id_estado": 4
}
```

---

## 🧪 Testing de Endpoints

### Pruebas con PowerShell

```powershell
# 1. Obtener todos los transportistas
Invoke-RestMethod -Uri "http://localhost:4003/api/carrier" -Method Get

# 2. Obtener transportistas paginados
Invoke-RestMethod -Uri "http://localhost:4003/api/carrier/paginated?page=1&limit=5" -Method Get

# 3. Obtener transportista con sus envíos
Invoke-RestMethod -Uri "http://localhost:4003/api/carrier/1" -Method Get

# 4. Crear nuevo transportista
$carrier = @{
    nombre = "Courier Nacional"
    tarifa_por_hora = 38.00
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4003/api/carrier" -Method Post `
    -ContentType "application/json" -Body $carrier

# 5. Actualizar transportista
$updateCarrier = @{
    nombre = "Courier Nacional Express"
    tarifa_por_hora = 40.00
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4003/api/carrier/4" -Method Put `
    -ContentType "application/json" -Body $updateCarrier

# 6. Obtener todos los envíos con filtros
Invoke-RestMethod -Uri "http://localhost:4003/api/shipping?id_carrier=1&page=1&limit=10" -Method Get

# 7. Obtener envíos de una orden específica
Invoke-RestMethod -Uri "http://localhost:4003/api/shipping/order/1001" -Method Get

# 8. Crear nuevo envío
$envio = @{
    id_stock_producto = 2
    id_orden = 1012
    stock_reservado = 30
    fecha_expiracion = "2024-05-01T23:59:59.000Z"
    id_estado = 1
    id_carrier = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4003/api/shipping" -Method Post `
    -ContentType "application/json" -Body $envio

# 9. Obtener envíos expirados
Invoke-RestMethod -Uri "http://localhost:4003/api/shipping/status/expired" -Method Get

# 10. Actualizar estado de envío (PATCH)
$updateStatus = @{
    id_estado = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4003/api/shipping/1/status" -Method Patch `
    -ContentType "application/json" -Body $updateStatus

# 11. Actualizar envío completo (PUT)
$updateEnvio = @{
    stock_reservado = 35
    id_estado = 3
    id_carrier = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4003/api/shipping/1" -Method Put `
    -ContentType "application/json" -Body $updateEnvio

# 12. Eliminar envío
Invoke-RestMethod -Uri "http://localhost:4003/api/shipping/10" -Method Delete

# 13. Eliminar transportista
Invoke-RestMethod -Uri "http://localhost:4003/api/carrier/4" -Method Delete
```

### Pruebas con cURL

```bash
# Obtener todos los transportistas
curl http://localhost:4003/api/carrier

# Obtener transportistas paginados
curl "http://localhost:4003/api/carrier/paginated?page=1&limit=5"

# Obtener transportista por ID con envíos
curl http://localhost:4003/api/carrier/1

# Crear nuevo transportista
curl -X POST http://localhost:4003/api/carrier \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Express Delivery","tarifa_por_hora":45.00}'

# Actualizar transportista
curl -X PUT http://localhost:4003/api/carrier/4 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Express Delivery Premium","tarifa_por_hora":50.00}'

# Obtener envíos filtrados y paginados
curl "http://localhost:4003/api/shipping?id_carrier=1&id_estado=2&page=1&limit=5"

# Obtener envíos por orden
curl http://localhost:4003/api/shipping/order/1001

# Crear nuevo envío
curl -X POST http://localhost:4003/api/shipping \
  -H "Content-Type: application/json" \
  -d '{
    "id_stock_producto": 4,
    "id_orden": 1013,
    "stock_reservado": 15,
    "fecha_expiracion": "2024-05-10T23:59:59.000Z",
    "id_estado": 1,
    "id_carrier": 1
  }'

# Obtener envíos expirados
curl http://localhost:4003/api/shipping/status/expired

# Actualizar solo el estado (PATCH)
curl -X PATCH http://localhost:4003/api/shipping/1/status \
  -H "Content-Type: application/json" \
  -d '{"id_estado": 3}'

# Actualizar envío completo (PUT)
curl -X PUT http://localhost:4003/api/shipping/1 \
  -H "Content-Type: application/json" \
  -d '{"stock_reservado": 40, "id_estado": 2}'

# Eliminar envío
curl -X DELETE http://localhost:4003/api/shipping/11

# Eliminar transportista
curl -X DELETE http://localhost:4003/api/carrier/4
```

---

## 🚀 Despliegue

### Prerequisitos
- Docker Desktop instalado y corriendo
- Google Cloud SDK instalado (`gcloud` CLI)
- Cuenta de Google Cloud con proyecto creado
- Cloud SQL (PostgreSQL) instancia configurada

### Despliegue Local con Docker

```powershell
# 1. Navegar al directorio del servicio
cd services/shipping

# 2. Construir la imagen
docker build -t shipping-service:latest .

# 3. Ejecutar el contenedor
docker run -p 4003:8080 `
  -e DATABASE_URL="postgresql://user:password@host:5432/shippingdb?schema=public" `
  -e NODE_ENV="production" `
  shipping-service:latest

# 4. Verificar salud del servicio
Invoke-RestMethod -Uri "http://localhost:4003/health"
```

### Despliegue a Google Cloud Run

**Opción 1: Desplegar solo Shipping**
```powershell
# Desde el directorio raíz del proyecto
.\deploy-single-service.ps1 -ServiceName shipping
```

**Opción 2: Desplegar todos los servicios**
```powershell
.\deploy-to-cloudrun.ps1
```

### Variables de Entorno Requeridas

```env
# Obligatorias
DATABASE_URL=postgresql://user:password@host:5432/shippingdb?schema=public
NODE_ENV=production

# Opcionales
PORT=8080  # Cloud Run usa 8080 por defecto
LOG_LEVEL=info
```

### Conexión a Cloud SQL

Para Cloud Run, usar Cloud SQL Proxy:

```powershell
# En deploy-single-service.ps1 o deploy-to-cloudrun.ps1
gcloud run deploy shipping-service `
  --image gcr.io/$PROJECT_ID/shipping-service `
  --add-cloudsql-instances $PROJECT_ID:$REGION:$INSTANCE_NAME `
  --set-env-vars DATABASE_URL="postgresql://user:password@/shippingdb?host=/cloudsql/$PROJECT_ID:$REGION:$INSTANCE_NAME"
```

### Health Check

Endpoint: `GET /health`

**Respuesta esperada:**
```json
{
  "status": "ok",
  "service": "shipping"
}
```

---

## 🔧 Configuración de Base de Datos

### Inicializar Prisma

```powershell
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma
npx prisma generate

# 3. Ejecutar migraciones
npx prisma migrate deploy

# 4. Poblar base de datos con datos de prueba
npx prisma db seed
```

### Seed Data

El archivo `prisma/seed.js` crea:
- **3 Carriers:** DHL Express, Olva Courier, Shalom Empresarial
- **9 Envíos:** Distribuidos entre diferentes carriers, órdenes y estados

Ver detalles completos en: `SEED_DATA_STRUCTURE.md`

---

## 📋 Validaciones Importantes

### Carrier
- ✅ `nombre` es requerido y único
- ✅ `nombre` máximo 100 caracteres
- ✅ `tarifa_por_hora` es requerida y debe ser > 0
- ❌ No se puede eliminar si tiene envíos asociados

### Envio
- ✅ `id_stock_producto` es requerido
- ✅ `id_orden` es requerido
- ✅ `stock_reservado` es requerido y debe ser > 0
- ✅ `id_estado` es requerido
- ✅ `id_carrier` es requerido y debe existir
- ✅ `fecha_expiracion` debe ser futura (si se proporciona)
- ✅ `fecha_expiracion` por defecto es +7 días
- ✅ `fecha_reserva` se asigna automáticamente

---

## 🔗 Integración con Otros Servicios

### Inventory Service
- **URL Local:** `http://localhost:4001`
- **Relación:** `Envio.id_stock_producto` → `StockProduct.id`
- **Flujo:** Antes de crear un envío, verificar disponibilidad en Inventory

**Ejemplo de verificación:**
```bash
# 1. Consultar stock disponible
GET http://localhost:4001/api/stock/3

# 2. Si hay stock, crear envío
POST http://localhost:4003/api/shipping
{
  "id_stock_producto": 3,
  "stock_reservado": 10,
  "id_carrier": 1,
  ...
}
```

### Reservation Service
- **URL Local:** `http://localhost:4002`
- **Relación:** Los envíos pueden estar relacionados con reservas
- **Flujo:** Una reserva confirmada puede generar un envío

---

## 📚 Referencias

- **API Documentation:** Este README
- **Prisma Schema:** `services/shipping/prisma/schema.prisma`
- **Seed Data Details:** `SEED_DATA_STRUCTURE.md`
- **All API Endpoints:** `scripts/API_ENDPOINTS.md`
- **Seeding Guide:** `scripts/SEEDING_GUIDE.md`

---

## 📝 Notas Técnicas

1. **Paginación:** Por defecto devuelve 10 registros por página, configurable con `limit`
2. **Ordenamiento:** Carriers alfabéticamente (ASC), envíos por fecha_reserva descendente
3. **Filtrado:** Soporta filtrado simultáneo por múltiples campos
4. **Fechas:** Todas las fechas en formato ISO 8601 (UTC)
5. **Relaciones:** El servicio incluye datos del carrier en las respuestas de envíos
6. **Límite de includes:** Al obtener carrier por ID, incluye solo los últimos 10 envíos
7. **PATCH vs PUT:** Usar PATCH para actualizar solo el estado (más eficiente)

---

## 🐛 Troubleshooting

### Error: "El id_carrier proporcionado no existe"
**Solución:** Verificar que el ID del carrier exista antes de crear/actualizar:
```bash
GET http://localhost:4003/api/carrier
```

### Error: "No se puede eliminar el carrier porque tiene envíos asociados"
**Solución:** Primero eliminar o reasignar los envíos asociados, luego eliminar el carrier.

### Error: "stock_reservado debe ser un número mayor a 0"
**Solución:** Proporcionar un valor válido para `stock_reservado` (entero positivo).

### Error: "fecha_expiracion debe ser una fecha futura"
**Solución:** Asegurarse de que `fecha_expiracion` sea mayor que la fecha actual.

### Envíos expirados no aparecen
**Verificación:** Los envíos expirados son aquellos donde `fecha_expiracion < NOW()`.
```bash
GET http://localhost:4003/api/shipping/status/expired
```

---

## 👨‍💻 Desarrollo

### Estructura del Proyecto
```
services/shipping/
├── prisma/
│   ├── schema.prisma      # Definición de modelos
│   └── seed.js            # Datos de prueba
├── src/
│   ├── controllers/
│   │   ├── carrier.controller.js
│   │   └── shipping.controller.js
│   ├── routes/
│   │   ├── carrier.routes.js
│   │   └── shipping.routes.js
│   ├── database/
│   │   └── conexion.js    # Cliente Prisma
│   └── index.js           # Servidor Express
├── Dockerfile
├── docker-entrypoint.sh
├── package.json
└── README.md
```

### Scripts Disponibles

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "node prisma/seed.js",
    "prisma:studio": "prisma studio"
  }
}
```

### Modo Desarrollo

```powershell
# 1. Instalar dependencias
npm install

# 2. Configurar .env
DATABASE_URL="postgresql://user:password@localhost:5432/shippingdb"
PORT=4003

# 3. Ejecutar migraciones y seed
npm run prisma:migrate
npm run prisma:seed

# 4. Iniciar en modo desarrollo
npm run dev
```

---

**Última actualización:** Marzo 2024  
**Puerto por defecto:** 4003  
**Versión:** 1.0.0
