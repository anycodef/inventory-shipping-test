# 📝 Reservation Service

Microservicio dedicado a la gestión de reservas de productos y sus estados, con soporte para filtrado, paginación y consulta de reservas expiradas.

## 🌐 URL Base

**Local:** `http://localhost:4002`  
**Cloud Run:** `https://reservation-service-xxxxx-uc.a.run.app`

---

## � Características Principales

- ✅ **Gestión completa de reservas** con estados y expiración
- ✅ **Endpoint especializado para órdenes** que acepta `id_producto` (no requiere `id_stock_producto`)
- ✅ **Validación automática** de stock, tiendas y carriers
- ✅ **Soporte para dos tipos de envío:** RECOJO_TIENDA y DOMICILIO
- ✅ **Rollback automático** en caso de errores
- ✅ **Filtrado avanzado** por orden, estado, stock
- ✅ **Paginación** configurable
- ✅ **Consulta de reservas expiradas**

---

## 🆕 Endpoint Especializado para Módulo de Órdenes

### **POST** `/api/reservas/from-order`

Este endpoint está diseñado específicamente para el módulo de órdenes y simplifica la creación de reservas.

#### Ventajas

- ✅ Acepta `id_producto` en lugar de `id_stock_producto`
- ✅ Busca automáticamente el mejor almacén con stock disponible
- ✅ Valida disponibilidad de stock en tiempo real
- ✅ Soporta recojo en tienda o envío a domicilio
- ✅ Valida tiendas y carriers automáticamente
- ✅ Crea múltiples reservas en una sola llamada
- ✅ Actualiza stock reservado en el inventario
- ✅ Rollback automático si alguna reserva falla

#### Request Body

**Campos Comunes (Requeridos):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_orden` | `number` | ID único de la orden |
| `productos` | `array` | Lista de productos a reservar |
| `tipo_envio` | `string` | `"RECOJO_TIENDA"` o `"DOMICILIO"` |

**Estructura de cada producto:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id_producto` | `number` | Sí* | ID del producto (el sistema busca el mejor stock) |
| `id_stock_producto` | `number` | Sí* | ID directo del stock (legacy, opcional) |
| `cantidad` | `number` | Sí | Cantidad a reservar (> 0) |
| `id_almacen` | `number` | No | Preferencia de almacén (opcional) |

*Nota: Debe proporcionar `id_producto` O `id_stock_producto`

#### Escenario 1: RECOJO_TIENDA

**Campos adicionales requeridos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_tienda` | `number` | ID de la tienda donde se recogerá |

**Ejemplo con un producto:**

```json
{
  "id_orden": 99003,
  "productos": [
    {
      "id_producto": 101,
      "cantidad": 5
    }
  ],
  "tipo_envio": "RECOJO_TIENDA",
  "id_tienda": 4
}
```

**Ejemplo con múltiples productos:**

```json
{
  "id_orden": 99005,
  "productos": [
    {
      "id_producto": 101,
      "cantidad": 2
    },
    {
      "id_producto": 103,
      "cantidad": 1
    },
    {
      "id_producto": 104,
      "cantidad": 3
    }
  ],
  "tipo_envio": "RECOJO_TIENDA",
  "id_tienda": 5
}
```

**Respuesta exitosa (201):**

```json
{
  "message": "Reservas creadas exitosamente",
  "id_orden": 99005,
  "tipo_envio": "RECOJO_TIENDA",
  "id_tienda": 5,
  "id_carrier": null,
  "total_productos": 3,
  "fecha_expiracion": "2025-11-07T22:27:28.637Z",
  "reservas": [
    {
      "id": 18,
      "id_stock_producto": 5,
      "id_orden": 99005,
      "stock_reservado": 2,
      "fecha_reserva": "2025-11-06T22:27:28.652Z",
      "fecha_expiracion": "2025-11-07T22:27:28.637Z",
      "id_estado": 1,
      "tipo_envio": "RECOJO_TIENDA",
      "id_tienda": 5,
      "id_carrier": null,
      "estado": {
        "id": 1,
        "nombre": "PENDING"
      }
    }
  ]
}
```

#### Escenario 2: DOMICILIO (Envío con Carrier)

**Campos adicionales requeridos:**

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `id_carrier` | `number` | ID del carrier | Debe existir y estar activo |
| `direccion_envio` | `string` | Dirección completa de destino | No vacía |
| `latitud_destino` | `number` | Latitud GPS del destino | -90 a 90 |
| `longitud_destino` | `number` | Longitud GPS del destino | -180 a 180 |

**Ejemplo:**

```json
{
  "id_orden": 99004,
  "productos": [
    {
      "id_producto": 102,
      "cantidad": 3
    }
  ],
  "tipo_envio": "DOMICILIO",
  "id_carrier": 1,
  "direccion_envio": "Calle Los Pinos 456, Lima",
  "latitud_destino": -12.0464,
  "longitud_destino": -77.0428
}
```

**Respuesta exitosa (201):**

```json
{
  "message": "Reservas creadas exitosamente",
  "id_orden": 99004,
  "tipo_envio": "DOMICILIO",
  "id_tienda": null,
  "id_carrier": 1,
  "total_productos": 1,
  "fecha_expiracion": "2025-11-07T22:24:29.513Z",
  "reservas": [
    {
      "id": 17,
      "id_stock_producto": 8,
      "id_orden": 99004,
      "stock_reservado": 3,
      "fecha_reserva": "2025-11-06T22:24:29.535Z",
      "fecha_expiracion": "2025-11-07T22:24:29.513Z",
      "id_estado": 1,
      "tipo_envio": "DOMICILIO",
      "id_carrier": 1,
      "direccion_envio": "Calle Los Pinos 456, Lima",
      "latitud_destino": -12.0464,
      "longitud_destino": -77.0428,
      "estado": {
        "id": 1,
        "nombre": "PENDING"
      }
    }
  ]
}
```

#### Errores Comunes

**400 - Validación:**

```json
{
  "error": "Cada producto debe tener id_producto o id_stock_producto",
  "example": { "id_producto": 101, "cantidad": 2 }
}
```

**400 - Stock Insuficiente:**

```json
{
  "error": "Stock insuficiente para algunos productos",
  "detalles": [
    {
      "id_stock_producto": 5,
      "solicitado": 500,
      "disponible": 195,
      "error": "Stock insuficiente"
    }
  ]
}
```

**404 - Tienda No Encontrada:**

```json
{
  "error": "La tienda con ID 99 no existe"
}
```

**404 - Carrier No Encontrado:**

```json
{
  "error": "El carrier con ID 99 no existe"
}
```

**400 - Tienda Inactiva:**

```json
{
  "error": "La tienda Tienda Cerrada no está activa",
  "estado": "INACTIVO"
}
```

**500 - Rollback Ejecutado:**

```json
{
  "error": "Error al crear las reservas",
  "detalles": [
    {
      "id_stock_producto": 3,
      "error": "Error de conexión con la base de datos"
    }
  ],
  "message": "Se realizó rollback de las reservas creadas"
}
```

#### Lógica de Selección de Stock

Cuando usas `id_producto`:

1. 🔍 Busca todos los registros de stock para ese producto
2. 📦 Filtra solo los que tienen stock disponible >= cantidad solicitada
3. 🏆 Ordena por mayor stock disponible
4. ✅ Selecciona el almacén con más stock
5. 🎁 Si especificas `id_almacen`, lo prioriza

**Beneficios:**
- No necesitas conocer el `id_stock_producto`
- El sistema optimiza la asignación automáticamente
- Mayor disponibilidad

#### Datos de Referencia

**Tiendas Disponibles:**

| ID | Nombre | Estado |
|----|--------|--------|
| 4 | Tienda San Isidro Premium | ACTIVO |
| 5 | Tienda Surco | ACTIVO |
| 6 | Tienda Callao | ACTIVO |
| 7 | Tienda Cusco | ACTIVO |
| 8 | Tienda Arequipa | ACTIVO |

**Carriers Disponibles:**

| ID | Nombre | Tipo |
|----|--------|------|
| 1 | FedEx Express | INTERNACIONAL |
| 2 | DHL Express | INTERNACIONAL |
| 3 | Servientrega | NACIONAL |

**Estados de Reserva:**

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | PENDING | Reserva creada, esperando confirmación |
| 2 | CONFIRMED | Reserva confirmada |
| 3 | EXPIRED | Reserva expirada |
| 4 | CANCELLED | Reserva cancelada |
| 5 | COMPLETED | Reserva completada |

**📖 Documentación completa:** Ver `/scripts/RESERVATION_API_GUIDE.md`

---

## 📚 Endpoints Disponibles

### 🏷️ Estado Reserva (State Reservation)

Base URL: `/api/estado`

#### **GET** `/api/estado`
Obtener todos los estados de reserva ordenados alfabéticamente.

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "PENDING",
    "descripcion": "Reserva pendiente de confirmación"
  },
  {
    "id": 2,
    "nombre": "CONFIRMED",
    "descripcion": "Reserva confirmada y activa"
  },
  {
    "id": 3,
    "nombre": "EXPIRED",
    "descripcion": "Reserva expirada"
  },
  {
    "id": 4,
    "nombre": "CANCELLED",
    "descripcion": "Reserva cancelada"
  },
  {
    "id": 5,
    "nombre": "COMPLETED",
    "descripcion": "Reserva completada exitosamente"
  }
]
```

#### **GET** `/api/estado/:id`
Obtener un estado de reserva específico por ID, incluyendo las últimas 10 reservas asociadas.

**Parámetros:**
- `id` (path, número) - ID del estado de reserva

**Ejemplo:** `GET /api/estado/2`

**Respuesta exitosa (200):**
```json
{
  "id": 2,
  "nombre": "CONFIRMED",
  "descripcion": "Reserva confirmada y activa",
  "reservas": [
    {
      "id": 1,
      "id_stock_producto": 1,
      "id_orden": 1001,
      "stock_reservado": 10,
      "fecha_reserva": "2024-03-21T10:00:00.000Z",
      "fecha_expiracion": "2024-03-28T10:00:00.000Z",
      "id_estado": 2
    }
  ]
}
```

**Errores:**
- `400` - ID inválido, debe ser un número
- `404` - Estado no encontrado
- `500` - Error del servidor

#### **POST** `/api/estado`
Crear un nuevo estado de reserva.

**Body (JSON):**
```json
{
  "nombre": "EN_PROCESO",
  "descripcion": "Reserva siendo procesada"
}
```

**Campos requeridos:**
- `nombre` (string) - Nombre del estado (máx. 100 caracteres, se convierte a MAYÚSCULAS)
- `descripcion` (string, opcional) - Descripción del estado

**Respuesta exitosa (201):**
```json
{
  "id": 6,
  "nombre": "EN_PROCESO",
  "descripcion": "Reserva siendo procesada"
}
```

**Errores:**
- `400` - El campo nombre es requerido o excede 100 caracteres
- `409` - Ya existe un estado con ese nombre (duplicado)
- `500` - Error del servidor

#### **PUT** `/api/estado/:id`
Actualizar un estado de reserva existente.

**Parámetros:**
- `id` (path, número) - ID del estado de reserva

**Body (JSON):**
```json
{
  "nombre": "EN_PREPARACION",
  "descripcion": "Reserva en preparación para envío"
}
```

**Ejemplo:** `PUT /api/estado/6`

**Respuesta exitosa (200):**
```json
{
  "id": 6,
  "nombre": "EN_PREPARACION",
  "descripcion": "Reserva en preparación para envío"
}
```

**Errores:**
- `400` - ID inválido o nombre vacío/muy largo
- `404` - Estado no encontrado
- `409` - Nombre duplicado
- `500` - Error del servidor

#### **DELETE** `/api/estado/:id`
Eliminar un estado de reserva.

**Parámetros:**
- `id` (path, número) - ID del estado de reserva

**Ejemplo:** `DELETE /api/estado/6`

**Respuesta exitosa (200):**
```json
{
  "message": "Estado eliminado exitosamente"
}
```

**Errores:**
- `400` - ID inválido o estado tiene reservas asociadas
- `404` - Estado no encontrado
- `500` - Error del servidor

---

### 📋 Reserva (Reservation)

Base URL: `/api/reservas`

#### **GET** `/api/reservas`
Obtener todas las reservas con soporte para filtrado y paginación.

**Query Parameters opcionales:**
- `id_stock_producto` (número) - Filtrar por stock de producto
- `id_orden` (número) - Filtrar por orden
- `id_estado` (número) - Filtrar por estado
- `page` (número, default: 1) - Número de página
- `per_page` (número, default: 10) - Reservas por página

**Ejemplo sin filtros:** `GET /api/reservas`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "id_stock_producto": 1,
      "id_orden": 1001,
      "stock_reservado": 10,
      "fecha_reserva": "2024-03-21T10:00:00.000Z",
      "fecha_expiracion": "2024-03-28T10:00:00.000Z",
      "id_estado": 2,
      "estado": {
        "id": 2,
        "nombre": "CONFIRMED",
        "descripcion": "Reserva confirmada y activa"
      }
    }
  ],
  "pagination": {
    "total": 9,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

**Ejemplo con filtros:** `GET /api/reservas?id_estado=2&page=1&per_page=5`

**Respuesta:** Retorna solo reservas con estado CONFIRMED, 5 por página

**Ejemplo filtro por orden:** `GET /api/reservas?id_orden=1001`

**Respuesta:** Retorna todas las reservas de la orden 1001

#### **GET** `/api/reservas/:id`
Obtener una reserva específica por ID.

**Parámetros:**
- `id` (path, número) - ID de la reserva

**Ejemplo:** `GET /api/reservas/1`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "id_stock_producto": 1,
  "id_orden": 1001,
  "stock_reservado": 10,
  "fecha_reserva": "2024-03-21T10:00:00.000Z",
  "fecha_expiracion": "2024-03-28T10:00:00.000Z",
  "id_estado": 2,
  "estado": {
    "id": 2,
    "nombre": "CONFIRMED",
    "descripcion": "Reserva confirmada y activa"
  }
}
```

**Errores:**
- `400` - ID inválido, debe ser un número
- `404` - Reserva no encontrada
- `500` - Error del servidor

#### **GET** `/api/reservas/expiradas`
Obtener todas las reservas que ya expiraron (fecha_expiracion < fecha actual).

**Ejemplo:** `GET /api/reservas/expiradas`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 9,
    "id_stock_producto": 7,
    "id_orden": 1009,
    "stock_reservado": 0,
    "fecha_reserva": "2024-03-05T09:00:00.000Z",
    "fecha_expiracion": "2024-03-12T09:00:00.000Z",
    "id_estado": 3,
    "estado": {
      "nombre": "EXPIRED"
    }
  }
]
```

**Nota:** Las reservas se ordenan por fecha_expiracion descendente (más recientes primero).

#### **POST** `/api/reservas`
Crear una nueva reserva.

**Body (JSON):**
```json
{
  "id_stock_producto": 1,
  "id_orden": 1010,
  "stock_reservado": 15,
  "fecha_expiracion": "2024-04-10T23:59:59.000Z",
  "id_estado": 1
}
```

**Campos requeridos:**
- `id_stock_producto` (número) - ID del stock del producto (FK a Inventory)
- `id_orden` (número) - ID de la orden (FK lógica a Orders)
- `stock_reservado` (número) - Cantidad a reservar (debe ser > 0)
- `fecha_expiracion` (datetime) - Fecha límite de la reserva
- `id_estado` (número) - ID del estado de la reserva

**Campos opcionales:**
- `fecha_reserva` (datetime) - Fecha de creación (default: fecha actual)

**Respuesta exitosa (201):**
```json
{
  "id": 10,
  "id_stock_producto": 1,
  "id_orden": 1010,
  "stock_reservado": 15,
  "fecha_reserva": "2024-03-25T18:30:00.000Z",
  "fecha_expiracion": "2024-04-10T23:59:59.000Z",
  "id_estado": 1,
  "estado": {
    "nombre": "PENDING"
  }
}
```

**Validaciones:**
- `stock_reservado` debe ser mayor a 0
- `fecha_expiracion` debe ser posterior a `fecha_reserva`
- `id_estado` debe existir en la tabla EstadoReserva

**Errores:**
- `400` - Campos requeridos faltantes, stock_reservado ≤ 0, fechas inválidas, o fecha_expiracion ≤ fecha_reserva
- `400` - P2003: El id_estado proporcionado no existe
- `500` - Error del servidor

#### **PUT** `/api/reservas/:id`
Actualizar una reserva existente.

**Parámetros:**
- `id` (path, número) - ID de la reserva

**Body (JSON):** (Todos los campos son opcionales)
```json
{
  "stock_reservado": 20,
  "id_estado": 2,
  "fecha_expiracion": "2024-04-15T23:59:59.000Z"
}
```

**Ejemplo:** `PUT /api/reservas/10`

**Respuesta exitosa (200):**
```json
{
  "id": 10,
  "id_stock_producto": 1,
  "id_orden": 1010,
  "stock_reservado": 20,
  "fecha_reserva": "2024-03-25T18:30:00.000Z",
  "fecha_expiracion": "2024-04-15T23:59:59.000Z",
  "id_estado": 2,
  "estado": {
    "nombre": "CONFIRMED"
  }
}
```

**Campos actualizables:**
- `id_stock_producto` (número)
- `id_orden` (número)
- `stock_reservado` (número, debe ser > 0)
- `fecha_reserva` (datetime)
- `fecha_expiracion` (datetime)
- `id_estado` (número)

**Errores:**
- `400` - ID inválido, stock_reservado ≤ 0, fechas inválidas, o id_estado no existe
- `404` - Reserva no encontrada
- `500` - Error del servidor

#### **DELETE** `/api/reservas/:id`
Eliminar una reserva.

**Parámetros:**
- `id` (path, número) - ID de la reserva

**Ejemplo:** `DELETE /api/reservas/10`

**Respuesta exitosa (200):**
```json
{
  "message": "Reserva eliminada exitosamente"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Reserva no encontrada
- `500` - Error del servidor


---

## 🗄️ Modelos de Datos (Prisma Schema)

### EstadoReserva (StateReservation)
```prisma
model EstadoReserva {
  id          Int       @id @default(autoincrement())
  nombre      String    @unique @db.VarChar(100)
  descripcion String?   @db.Text
  reservas    Reserva[]

  @@map("estado_reserva")
}
```

**Relaciones:**
- Un EstadoReserva puede tener múltiples Reservas

### Reserva (Reservation)
```prisma
model Reserva {
  id                 Int            @id @default(autoincrement())
  id_stock_producto  Int
  id_orden           Int
  stock_reservado    Int
  fecha_reserva      DateTime       @default(now())
  fecha_expiracion   DateTime
  id_estado          Int
  estado             EstadoReserva  @relation(fields: [id_estado], references: [id])

  @@map("reserva")
}
```

**Relaciones:**
- Cada Reserva pertenece a un EstadoReserva
- `id_stock_producto` referencia al servicio Inventory (relación lógica, no FK física)
- `id_orden` referencia a un sistema de órdenes externo (relación lógica)

---

## 🎯 Códigos de Error Prisma

### P2002 - Unique Constraint Violation
**Cuándo ocurre:** Al intentar crear/actualizar un EstadoReserva con un nombre duplicado.

**Ejemplo:**
```bash
POST /api/estado
{
  "nombre": "PENDING"  # Ya existe
}
```

**Respuesta (409):**
```json
{
  "error": "Ya existe un estado con ese nombre"
}
```

### P2003 - Foreign Key Constraint Violation
**Cuándo ocurre:** 
1. Al crear/actualizar una Reserva con un `id_estado` que no existe
2. Al intentar eliminar un EstadoReserva que tiene Reservas asociadas

**Ejemplo 1:**
```bash
POST /api/reservas
{
  "id_estado": 999  # No existe
}
```

**Respuesta (400):**
```json
{
  "error": "El id_estado proporcionado no existe"
}
```

**Ejemplo 2:**
```bash
DELETE /api/estado/2  # Tiene reservas asociadas
```

**Respuesta (400):**
```json
{
  "error": "No se puede eliminar el estado porque tiene reservas asociadas"
}
```

### P2025 - Record Not Found
**Cuándo ocurre:** Al intentar actualizar/eliminar una Reserva o EstadoReserva que no existe.

**Ejemplo:**
```bash
PUT /api/reservas/9999
```

**Respuesta (404):**
```json
{
  "error": "Reserva no encontrada"
}
```

---

## 📊 Ejemplos de Uso Completos

### Flujo: Crear una nueva reserva de producto

**1. Verificar estados disponibles:**
```bash
GET http://localhost:4002/api/estado
```

**2. Crear la reserva:**
```bash
POST http://localhost:4002/api/reservas
Content-Type: application/json

{
  "id_stock_producto": 3,
  "id_orden": 1011,
  "stock_reservado": 25,
  "fecha_expiracion": "2024-04-20T23:59:59.000Z",
  "id_estado": 1
}
```

**3. Verificar la reserva creada:**
```bash
GET http://localhost:4002/api/reservas/11
```

**4. Confirmar la reserva (cambiar estado):**
```bash
PUT http://localhost:4002/api/reservas/11
Content-Type: application/json

{
  "id_estado": 2
}
```

### Flujo: Consultar reservas filtradas por estado

**1. Obtener solo reservas confirmadas con paginación:**
```bash
GET http://localhost:4002/api/reservas?id_estado=2&page=1&per_page=5
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "id_stock_producto": 1,
      "id_orden": 1001,
      "stock_reservado": 10,
      "fecha_reserva": "2024-03-21T10:00:00.000Z",
      "fecha_expiracion": "2024-03-28T10:00:00.000Z",
      "id_estado": 2,
      "estado": {
        "id": 2,
        "nombre": "CONFIRMED",
        "descripcion": "Reserva confirmada y activa"
      }
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "per_page": 5,
    "total_pages": 1
  }
}
```

### Flujo: Gestión de reservas expiradas

**1. Consultar todas las reservas expiradas:**
```bash
GET http://localhost:4002/api/reservas/expiradas
```

**2. Actualizar estado de una reserva expirada:**
```bash
PUT http://localhost:4002/api/reservas/9
Content-Type: application/json

{
  "id_estado": 3
}
```

### Flujo: Crear un nuevo estado personalizado

**1. Crear estado "EN_TRANSITO":**
```bash
POST http://localhost:4002/api/estado
Content-Type: application/json

{
  "nombre": "en_transito",
  "descripcion": "Reserva en tránsito hacia el almacén"
}
```

**Respuesta (201):**
```json
{
  "id": 6,
  "nombre": "EN_TRANSITO",
  "descripcion": "Reserva en tránsito hacia el almacén"
}
```

**Nota:** El nombre se convierte automáticamente a MAYÚSCULAS.

---

## 🧪 Testing de Endpoints

### Pruebas con PowerShell

```powershell
# 1. Obtener todos los estados
Invoke-RestMethod -Uri "http://localhost:4002/api/estado" -Method Get

# 2. Obtener estado con sus reservas
Invoke-RestMethod -Uri "http://localhost:4002/api/estado/2" -Method Get

# 3. Crear nuevo estado
$body = @{
    nombre = "VERIFICANDO"
    descripcion = "Reserva en proceso de verificación"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4002/api/estado" -Method Post `
    -ContentType "application/json" -Body $body

# 4. Obtener todas las reservas con filtros
Invoke-RestMethod -Uri "http://localhost:4002/api/reservas?id_estado=2&page=1&per_page=10" -Method Get

# 5. Obtener reservas de una orden específica
Invoke-RestMethod -Uri "http://localhost:4002/api/reservas?id_orden=1001" -Method Get

# 6. Crear nueva reserva
$reserva = @{
    id_stock_producto = 2
    id_orden = 1012
    stock_reservado = 30
    fecha_expiracion = "2024-05-01T23:59:59.000Z"
    id_estado = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4002/api/reservas" -Method Post `
    -ContentType "application/json" -Body $reserva

# 7. Obtener reservas expiradas
Invoke-RestMethod -Uri "http://localhost:4002/api/reservas/expiradas" -Method Get

# 8. Actualizar reserva
$actualizacion = @{
    stock_reservado = 35
    id_estado = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4002/api/reservas/1" -Method Put `
    -ContentType "application/json" -Body $actualizacion

# 9. Eliminar reserva
Invoke-RestMethod -Uri "http://localhost:4002/api/reservas/10" -Method Delete
```

### Pruebas con cURL

```bash
# Obtener todos los estados
curl http://localhost:4002/api/estado

# Obtener estado por ID con reservas
curl http://localhost:4002/api/estado/2

# Crear nuevo estado
curl -X POST http://localhost:4002/api/estado \
  -H "Content-Type: application/json" \
  -d '{"nombre":"APROBANDO","descripcion":"Reserva pendiente de aprobación"}'

# Obtener reservas filtradas y paginadas
curl "http://localhost:4002/api/reservas?id_estado=2&page=1&per_page=5"

# Obtener reservas por orden
curl "http://localhost:4002/api/reservas?id_orden=1001"

# Crear nueva reserva
curl -X POST http://localhost:4002/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "id_stock_producto": 4,
    "id_orden": 1013,
    "stock_reservado": 15,
    "fecha_expiracion": "2024-05-10T23:59:59.000Z",
    "id_estado": 1
  }'

# Obtener reservas expiradas
curl http://localhost:4002/api/reservas/expiradas

# Actualizar reserva
curl -X PUT http://localhost:4002/api/reservas/1 \
  -H "Content-Type: application/json" \
  -d '{"stock_reservado": 40, "id_estado": 2}'

# Eliminar reserva
curl -X DELETE http://localhost:4002/api/reservas/11
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
cd services/reservation

# 2. Construir la imagen
docker build -t reservation-service:latest .

# 3. Ejecutar el contenedor
docker run -p 4002:8080 `
  -e DATABASE_URL="postgresql://user:password@host:5432/reservationdb?schema=public" `
  -e NODE_ENV="production" `
  reservation-service:latest

# 4. Verificar salud del servicio
Invoke-RestMethod -Uri "http://localhost:4002/health"
```

### Despliegue a Google Cloud Run

**Opción 1: Desplegar solo Reservation**
```powershell
# Desde el directorio raíz del proyecto
.\deploy-single-service.ps1 -ServiceName reservation
```

**Opción 2: Desplegar todos los servicios**
```powershell
.\deploy-to-cloudrun.ps1
```

### Variables de Entorno Requeridas

```env
# Obligatorias
DATABASE_URL=postgresql://user:password@host:5432/reservationdb?schema=public
NODE_ENV=production

# Opcionales
PORT=8080  # Cloud Run usa 8080 por defecto
LOG_LEVEL=info
INVENTORY_SERVICE_URL=http://inventory-service:4001  # URL base del servicio de inventario (el controlador agrega /api)
RELEASE_EXPIRED_RESERVATIONS_CRON=0 0 * * *  # Personaliza la hora del cron
RELEASE_EXPIRED_RESERVATIONS_TZ=America/Lima  # Zona horaria para el cron
RUN_RELEASE_EXPIRED_ON_START=false  # Ejecuta el proceso una vez al iniciar (útil para pruebas)
INVENTORY_SERVICE_TIMEOUT=8000  # Tiempo máx. de espera (ms) al llamar al servicio de inventario
RESERVATION_MAX_HOURS=24  # TTL máximo para las reservas antes de expirar automáticamente
```

### Conexión a Cloud SQL

Para Cloud Run, usar Cloud SQL Proxy:

```powershell
# En deploy-single-service.ps1 o deploy-to-cloudrun.ps1
gcloud run deploy reservation-service `
  --image gcr.io/$PROJECT_ID/reservation-service `
  --add-cloudsql-instances $PROJECT_ID:$REGION:$INSTANCE_NAME `
  --set-env-vars DATABASE_URL="postgresql://user:password@/reservationdb?host=/cloudsql/$PROJECT_ID:$REGION:$INSTANCE_NAME"
```

### Health Check

Endpoint: `GET /health`

**Respuesta esperada:**
```json
{
  "status": "OK",
  "service": "Reservation Service",
  "timestamp": "2024-03-25T10:30:00.000Z"
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
- **5 Estados:** PENDING, CONFIRMED, EXPIRED, CANCELLED, COMPLETED
- **9 Reservas:** Distribuidas entre diferentes productos, órdenes y estados

Ver detalles completos en: `SEED_DATA_STRUCTURE.md`

---

## ⏰ Liberación Automática de Reservas Expiradas

Este servicio ejecuta un cron diario (por defecto a las **00:00** hora de Lima) que:

1. Busca reservas con `fecha_expiracion` vencida y estado `PENDING` o `CONFIRMED`.
2. Libera el stock correspondiente llamando al endpoint `PUT /api/stock/:id` del Inventory Service.
3. Marca la reserva como `EXPIRED` para conservar el historial (no se elimina el registro).

### Personalización del Cron
- `RELEASE_EXPIRED_RESERVATIONS_CRON`: cambia la expresión (formato estándar `node-cron`).
- `RELEASE_EXPIRED_RESERVATIONS_TZ`: define la zona horaria (default `America/Lima`).
- `RUN_RELEASE_EXPIRED_ON_START=true`: ejecuta el proceso una vez al iniciar el servicio (útil en QA).

### Ejecución Manual
```bash
cd services/reservation
npm run release:expired
```
El script reutiliza la misma lógica que el cron para liberar reservas en el momento.

### Interacción con Inventory Service
- Requiere `INVENTORY_SERVICE_URL` apuntando al endpoint base (`http://inventory-service:4001` en Docker).
- El job valida que los estados `PENDING`, `CONFIRMED` y `EXPIRED` existan (se crean en el seed).
- Si el ajuste de stock falla, la reserva conserva su estado original para evitar inconsistencias.

## 🧩 Reglas de negocio de Reservas

- Cada creación o actualización de reserva valida y descuenta stock en Inventory Service antes de persistir la fila; si el inventario reporta insuficiencia se responde `409 Conflict`.
- `fecha_expiracion` se calcula automáticamente cuando no se envía y nunca puede superar `RESERVATION_MAX_HOURS` (24h por defecto) contadas desde `fecha_reserva`.
- La API rechaza fechas inválidas o expiraciones retroactivas para mantener la integridad temporal de la reserva.
- `PUT /api/reservas/:id` ajusta el stock reservado cuando cambias cantidades o el `id_stock_producto` (liberando el stock anterior).
- `DELETE /api/reservas/:id` siempre libera el stock que estaba retenido antes de eliminar el registro.

---

## 📋 Validaciones Importantes

### EstadoReserva
- ✅ `nombre` es requerido y único
- ✅ `nombre` máximo 100 caracteres
- ✅ `nombre` se convierte automáticamente a MAYÚSCULAS
- ❌ No se puede eliminar si tiene reservas asociadas

### Reserva
- ✅ `id_stock_producto` es requerido y debe existir en Inventory
- ✅ `stock_reservado` debe ser > 0 y tener stock disponible antes de confirmar la reserva
- ✅ `fecha_expiracion` se valida automáticamente y no puede exceder `RESERVATION_MAX_HOURS`
- ✅ `fecha_reserva` se asigna automáticamente si no se proporciona
- ✅ `id_estado` es requerido y debe existir
- ✅ Eliminaciones/actualizaciones ajustan el stock reservado para evitar inconsistencias

---

## 🔗 Integración con Otros Servicios

### Inventory Service
- **URL Local:** `http://localhost:4001`
- **Relación:** `Reserva.id_stock_producto` → `StockProduct.id`
- **Flujo:** La API valida y descuenta stock automáticamente; usa estos endpoints solo para auditorías o debugging

**Ejemplo de verificación opcional:**
```bash
# 1. Consultar stock disponible
GET http://localhost:4001/api/stock/3

# 2. Si hay stock, crear reserva
POST http://localhost:4002/api/reservas
{
  "id_stock_producto": 3,
  "stock_reservado": 10,
  ...
}
```

### Shipping Service
- **URL Local:** `http://localhost:4003`
- **Relación:** Reservas confirmadas pueden generar envíos
- **Flujo:** Una vez confirmada la reserva (`id_estado = 2`), crear shipping

---

## 📚 Referencias

- **API Documentation:** Este README
- **Prisma Schema:** `services/reservation/prisma/schema.prisma`
- **Seed Data Details:** `SEED_DATA_STRUCTURE.md`
- **All API Endpoints:** `scripts/API_ENDPOINTS.md`
- **Seeding Guide:** `scripts/SEEDING_GUIDE.md`
- **Liberación de reservas:** `docs/LIBERACION_RESERVAS.md`
- **Modelado y reglas:** `docs/MODELADO_RESERVAS.md`

---

## 📝 Notas Técnicas

1. **Paginación:** Por defecto devuelve 10 registros por página, configurable con `per_page`
2. **Ordenamiento:** Estados alfabéticamente (ASC), reservas expiradas por fecha descendente
3. **Filtrado:** Soporta filtrado simultáneo por `id_stock_producto`, `id_orden` y `id_estado`
4. **Fechas:** Todas las fechas en formato ISO 8601 (UTC)
5. **Normalización:** Nombres de estados siempre en MAYÚSCULAS
6. **Relaciones:** El servicio incluye datos del estado en las respuestas de reservas
7. **Límite de includes:** Al obtener estado por ID, incluye solo las últimas 10 reservas

---

## 🐛 Troubleshooting

### Error: "El id_estado proporcionado no existe"
**Solución:** Verificar que el ID del estado exista antes de crear/actualizar:
```bash
GET http://localhost:4002/api/estado
```

### Error: "No se puede eliminar el estado porque tiene reservas asociadas"
**Solución:** Primero eliminar o actualizar las reservas asociadas, luego eliminar el estado.

### Error: "stock_reservado debe ser mayor a 0"
**Solución:** Proporcionar un valor válido para `stock_reservado` (entero positivo).

### Error: "La fecha de expiración debe ser posterior a la fecha de reserva"
**Solución:** Asegurarse de que `fecha_expiracion` sea mayor que `fecha_reserva`.

### Reservas expiradas no aparecen
**Verificación:** Las reservas expiradas son aquellas donde `fecha_expiracion < NOW()`.
```bash
GET http://localhost:4002/api/reservas/expiradas
```

---

## 👨‍💻 Desarrollo

### Estructura del Proyecto
```
services/reservation/
├── prisma/
│   ├── schema.prisma      # Definición de modelos
│   └── seed.js            # Datos de prueba
├── src/
│   ├── controllers/
│   │   ├── reservation.controller.js
│   │   └── stateReservation.controller.js
│   ├── routes/
│   │   ├── reservation.routes.js
│   │   └── stateReservation.routes.js
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
DATABASE_URL="postgresql://user:password@localhost:5432/reservationdb"
PORT=4002

# 3. Ejecutar migraciones y seed
npm run prisma:migrate
npm run prisma:seed

# 4. Iniciar en modo desarrollo
npm run dev
```

---

**Última actualización:** Marzo 2024  
**Puerto por defecto:** 4002  
**Versión:** 1.0.0
