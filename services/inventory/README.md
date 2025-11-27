# 📦 Inventory Service

Microservicio dedicado a la gestión completa del inventario de productos, incluyendo stock en almacenes, movimientos y tipos de movimiento.

## 🌐 URL Base

**Local:** `http://localhost:4001`  
**Cloud Run:** `https://inventory-service-xxxxx-uc.a.run.app`

---

## 📚 Endpoints Disponibles

### 🏷️ Tipo Movimiento (Type Movement)

Base URL: `/api/tipomovimiento`

#### **GET** `/api/tipomovimiento`
Obtener todos los tipos de movimiento disponibles.

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "ENTRADA",
    "descripcion": "Entrada de productos al almacén"
  },
  {
    "id": 2,
    "nombre": "SALIDA",
    "descripcion": "Salida de productos del almacén"
  },
  {
    "id": 3,
    "nombre": "AJUSTE_POSITIVO",
    "descripcion": "Ajuste de inventario positivo"
  }
]
```

#### **GET** `/api/tipomovimiento/:id`
Obtener un tipo de movimiento específico por ID.

**Parámetros:**
- `id` (path, número) - ID del tipo de movimiento

**Ejemplo:** `GET /api/tipomovimiento/1`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "ENTRADA",
  "descripcion": "Entrada de productos al almacén"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Tipo de movimiento no encontrado
- `500` - Error del servidor

#### **POST** `/api/tipomovimiento`
Crear un nuevo tipo de movimiento.

**Body (JSON):**
```json
{
  "nombre": "TRANSFERENCIA",
  "descripcion": "Transferencia entre almacenes"
}
```

**Campos requeridos:**
- `nombre` (string) - Nombre único del tipo de movimiento
- `descripcion` (string, opcional) - Descripción del tipo

**Respuesta exitosa (201):**
```json
{
  "id": 6,
  "nombre": "TRANSFERENCIA",
  "descripcion": "Transferencia entre almacenes"
}
```

**Errores:**
- `400` - El nombre es requerido
- `409` - El nombre ya existe (duplicado)
- `500` - Error del servidor

#### **PUT** `/api/tipomovimiento/:id`
Actualizar un tipo de movimiento existente.

**Parámetros:**
- `id` (path, número) - ID del tipo de movimiento

**Body (JSON):**
```json
{
  "nombre": "TRANSFERENCIA_INTERNA",
  "descripcion": "Transferencia entre almacenes internos"
}
```

**Ejemplo:** `PUT /api/tipomovimiento/6`

**Respuesta exitosa (200):**
```json
{
  "id": 6,
  "nombre": "TRANSFERENCIA_INTERNA",
  "descripcion": "Transferencia entre almacenes internos"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Tipo de movimiento no encontrado
- `500` - Error del servidor

#### **DELETE** `/api/tipomovimiento/:id`
Eliminar un tipo de movimiento.

**Parámetros:**
- `id` (path, número) - ID del tipo de movimiento

**Ejemplo:** `DELETE /api/tipomovimiento/6`

**Respuesta exitosa (200):**
```json
{
  "message": "Tipo de movimiento eliminado exitosamente"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Tipo de movimiento no encontrado
- `500` - Error del servidor

---

### Stock (ProductoAlmacen)

Base URL: `/api/stock`

#### **GET** `/api/stock`
Obtener todos los productos en stock de todos los almacenes.

**Query Parameters opcionales:**
- `id_almacen` (número) - Filtrar por almacén específico

**Ejemplo sin filtro:** `GET /api/stock`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "id_producto": 101,
    "id_almacen": 1,
    "stock_reservado": 10,
    "stock_disponible": 140,
    "movimiento": [
      {
        "id": 1,
        "cantidad": 100,
        "fecha": "2024-01-10T00:00:00.000Z",
        "tipo_movimiento": {
          "id": 1,
          "nombre": "ENTRADA"
        }
      }
    ]
  }
]
```

**Ejemplo con filtro:** `GET /api/stock?id_almacen=1`

**Respuesta:** Retorna solo productos del almacén 1

#### **GET** `/api/stock/:id`
Obtener información detallada de un stock específico.

**Parámetros:**
- `id` (path, número) - ID del registro de stock

**Ejemplo:** `GET /api/stock/1`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "id_producto": 101,
  "id_almacen": 1,
  "stock_reservado": 10,
  "stock_disponible": 140,
  "movimiento": [
    {
      "id": 1,
      "id_producto_almacen": 1,
      "id_tipo": 1,
      "cantidad": 100,
      "fecha": "2024-01-10T00:00:00.000Z",
      "observacion": null,
      "tipo_movimiento": {
        "id": 1,
        "nombre": "ENTRADA",
        "descripcion": "Entrada de productos al almacén"
      }
    }
  ]
}
```

**Errores:**
- `400` - ID inválido
- `404` - Producto en almacén no encontrado
- `500` - Error del servidor

#### **POST** `/api/stock`
Registrar un nuevo producto en un almacén.

**Body (JSON):**
```json
{
  "id_producto": 105,
  "id_almacen": 2,
  "stock_reservado": 0,
  "stock_disponible": 50
}
```

**Campos requeridos:**
- `id_producto` (número) - ID del producto (FK lógica)
- `id_almacen` (número) - ID del almacén (FK lógica)
- `stock_reservado` (número, opcional, default: 0) - Stock reservado
- `stock_disponible` (número, opcional, default: 0) - Stock disponible

**Respuesta exitosa (201):**
```json
{
  "id": 9,
  "id_producto": 105,
  "id_almacen": 2,
  "stock_reservado": 0,
  "stock_disponible": 50
}
```

**Errores:**
- `400` - Campos requeridos faltantes o stocks negativos
- `500` - Error del servidor

#### **PUT** `/api/stock/:id`
Actualizar el stock de un producto en almacén.

**Parámetros:**
- `id` (path, número) - ID del registro de stock

**Body (JSON):**
```json
{
  "stock_reservado": 15,
  "stock_disponible": 85
}
```

**Ejemplo:** `PUT /api/stock/1`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "id_producto": 101,
  "id_almacen": 1,
  "stock_reservado": 15,
  "stock_disponible": 85
}
```

**Errores:**
- `400` - ID inválido o stocks negativos
- `404` - Stock no encontrado
- `500` - Error del servidor

#### **DELETE** `/api/stock/:id`
Eliminar un registro de stock.

**Parámetros:**
- `id` (path, número) - ID del registro de stock

**Ejemplo:** `DELETE /api/stock/9`

**Respuesta exitosa (200):**
```json
{
  "message": "Stock de producto eliminado exitosamente"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Stock no encontrado
- `500` - Error del servidor

#### **GET** `/api/stock/:stockId/movimientos`
Obtener todos los movimientos de un stock específico.

**Parámetros:**
- `stockId` (path, número) - ID del registro de stock

**Ejemplo:** `GET /api/stock/1/movimientos`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "id_producto_almacen": 1,
    "id_tipo": 1,
    "cantidad": 100,
    "fecha": "2024-01-10T00:00:00.000Z",
    "observacion": null,
    "tipo_movimiento": {
      "id": 1,
      "nombre": "ENTRADA"
    }
  },
  {
    "id": 2,
    "id_producto_almacen": 1,
    "id_tipo": 1,
    "cantidad": 50,
    "fecha": "2024-02-15T00:00:00.000Z",
    "observacion": null,
    "tipo_movimiento": {
      "id": 1,
      "nombre": "ENTRADA"
    }
  }
]
```

#### **POST** `/api/stock/bulk`
**🎯 ENDPOINT PARA MÓDULO DE CATÁLOGO**

Obtener stock de múltiples productos organizado por almacenes. Este endpoint permite consultar el inventario de varios productos a la vez y devuelve el stock total y desglosado por cada almacén.

**Body (JSON):**
```json
{
  "productIds": [103, 104, 105]
}
```

**Campos requeridos:**
- `productIds` (array de números) - Array con los IDs de los productos a consultar

**Respuesta exitosa (200):**
```json
[
  {
    "id_producto": 103,
    "stock_total": 180,
    "stock_disponible_total": 150,
    "stock_reservado_total": 30,
    "almacenes": [
      {
        "id_almacen": 2,
        "stock_disponible": 80,
        "stock_reservado": 20,
        "stock_total": 100
      },
      {
        "id_almacen": 5,
        "stock_disponible": 70,
        "stock_reservado": 10,
        "stock_total": 80
      }
    ]
  },
  {
    "id_producto": 104,
    "stock_total": 250,
    "stock_disponible_total": 220,
    "stock_reservado_total": 30,
    "almacenes": [
      {
        "id_almacen": 2,
        "stock_disponible": 120,
        "stock_reservado": 15,
        "stock_total": 135
      },
      {
        "id_almacen": 5,
        "stock_disponible": 100,
        "stock_reservado": 15,
        "stock_total": 115
      }
    ]
  },
  {
    "id_producto": 105,
    "stock_total": 0,
    "stock_disponible_total": 0,
    "stock_reservado_total": 0,
    "almacenes": []
  }
]
```

**Descripción de la respuesta:**
- Se devuelve un array con un objeto por cada producto solicitado
- Si un producto no tiene stock en ningún almacén, se devuelve con totales en 0 y array de almacenes vacío
- `stock_total`: Suma de stock disponible + reservado de todos los almacenes
- `stock_disponible_total`: Suma de stock disponible de todos los almacenes
- `stock_reservado_total`: Suma de stock reservado de todos los almacenes
- `almacenes`: Array con el detalle de stock por cada almacén que tiene el producto

**Errores:**
- `400` - productIds faltante, no es un array, está vacío, o contiene IDs inválidos
- `500` - Error del servidor

**Ejemplo de uso desde otro servicio:**
```javascript
const response = await fetch('http://localhost:4001/api/stock/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productIds: [103, 104, 105] })
});
const stockData = await response.json();
```

---

### 🔄 Movimiento (Movement)

Base URL: `/api/movimiento`

#### **GET** `/api/movimiento`
Obtener todos los movimientos de inventario (ordenados por fecha descendente).

**Respuesta exitosa (200):**
```json
[
  {
    "id": 12,
    "id_producto_almacen": 1,
    "id_tipo": 5,
    "cantidad": 10,
    "fecha": "2024-03-15T00:00:00.000Z",
    "observacion": "Transfer a Arequipa",
    "producto_almacen": {
      "id": 1,
      "id_producto": 101,
      "id_almacen": 1,
      "stock_reservado": 10,
      "stock_disponible": 140
    },
    "tipo_movimiento": {
      "id": 5,
      "nombre": "TRANSFERENCIA",
      "descripcion": "Transferencia entre almacenes"
    }
  }
]
```

#### **GET** `/api/movimiento/:id`
Obtener un movimiento específico por ID.

**Parámetros:**
- `id` (path, número) - ID del movimiento

**Ejemplo:** `GET /api/movimiento/1`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "id_producto_almacen": 1,
  "id_tipo": 1,
  "cantidad": 100,
  "fecha": "2024-01-10T00:00:00.000Z",
  "observacion": null,
  "producto_almacen": {
    "id": 1,
    "id_producto": 101,
    "id_almacen": 1
  },
  "tipo_movimiento": {
    "id": 1,
    "nombre": "ENTRADA"
  }
}
```

**Errores:**
- `400` - ID inválido
- `404` - Movimiento no encontrado
- `500` - Error del servidor

#### **GET** `/api/movimiento/product/:id_producto_almacen`
Obtener todos los movimientos de un producto en almacén específico.

**Parámetros:**
- `id_producto_almacen` (path, número) - ID del stock del producto

**Ejemplo:** `GET /api/movimiento/product/1`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "id_producto_almacen": 1,
    "id_tipo": 1,
    "cantidad": 100,
    "fecha": "2024-01-10T00:00:00.000Z",
    "tipo_movimiento": {
      "nombre": "ENTRADA"
    }
  },
  {
    "id": 2,
    "id_producto_almacen": 1,
    "id_tipo": 1,
    "cantidad": 50,
    "fecha": "2024-02-15T00:00:00.000Z",
    "tipo_movimiento": {
      "nombre": "ENTRADA"
    }
  }
]
```

**Errores:**
- `400` - ID de producto almacén inválido
- `500` - Error del servidor

#### **GET** `/api/movimiento/tipo/:id_tipo`
Obtener todos los movimientos por tipo de movimiento.

**Parámetros:**
- `id_tipo` (path, número) - ID del tipo de movimiento

**Ejemplo:** `GET /api/movimiento/tipo/1` (todos los movimientos de tipo ENTRADA)

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "cantidad": 100,
    "fecha": "2024-01-10T00:00:00.000Z",
    "producto_almacen": {
      "id": 1,
      "id_producto": 101,
      "id_almacen": 1
    },
    "tipo_movimiento": {
      "nombre": "ENTRADA"
    }
  }
]
```

**Errores:**
- `400` - ID de tipo movimiento inválido
- `500` - Error del servidor

#### **POST** `/api/movimiento`
Crear un nuevo movimiento de inventario.

**Body (JSON):**
```json
{
  "id_producto_almacen": 1,
  "id_tipo": 1,
  "cantidad": 25,
  "observacion": "Reabastecimiento mensual"
}
```

**Campos requeridos:**
- `id_producto_almacen` (número) - ID del stock del producto
- `id_tipo` (número) - ID del tipo de movimiento
- `cantidad` (número) - Cantidad del movimiento (debe ser > 0)
- `observacion` (string, opcional) - Notas adicionales

**Respuesta exitosa (201):**
```json
{
  "id": 13,
  "id_producto_almacen": 1,
  "id_tipo": 1,
  "cantidad": 25,
  "fecha": "2024-03-25T15:30:00.000Z",
  "observacion": "Reabastecimiento mensual"
}
```

**Errores:**
- `400` - Campos requeridos faltantes o cantidad inválida
- `404` - Producto en almacén o tipo de movimiento no encontrado
- `500` - Error del servidor

#### **PUT** `/api/movimiento/:id`
Actualizar un movimiento existente.

**Parámetros:**
- `id` (path, número) - ID del movimiento

**Body (JSON):**
```json
{
  "cantidad": 30,
  "observacion": "Reabastecimiento mensual actualizado"
}
```

**Ejemplo:** `PUT /api/movimiento/13`

**Respuesta exitosa (200):**
```json
{
  "id": 13,
  "id_producto_almacen": 1,
  "id_tipo": 1,
  "cantidad": 30,
  "fecha": "2024-03-25T15:30:00.000Z",
  "observacion": "Reabastecimiento mensual actualizado"
}
```

**Errores:**
- `400` - ID inválido o cantidad inválida
- `404` - Movimiento no encontrado
- `500` - Error del servidor

#### **DELETE** `/api/movimiento/:id`
Eliminar un movimiento.

**Parámetros:**
- `id` (path, número) - ID del movimiento

**Ejemplo:** `DELETE /api/movimiento/13`

**Respuesta exitosa (200):**
```json
{
  "message": "Movimiento eliminado exitosamente"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Movimiento no encontrado
- `500` - Error del servidor

---

## 🗄️ Modelos de Datos (Prisma Schema)

### TipoMovimiento (Type Movement)
```prisma
model TipoMovimiento {
  id          Int          @id @default(autoincrement())
  nombre      String       @unique
  descripcion String?
  movimiento  Movimiento[]
  
  @@map("tipo_movimiento")
}
```

**Descripción:** Catálogo de tipos de movimientos de inventario (ENTRADA, SALIDA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, TRANSFERENCIA).

---

### ProductoAlmacen (Stock Product)
```prisma
model ProductoAlmacen {
  id                 Int          @id @default(autoincrement())
  id_producto        Int          // FK lógica a servicio Products
  id_almacen         Int          // FK lógica a servicio Store/Warehouse
  stock_reservado    Int          @default(0)
  stock_disponible   Int          @default(0)
  movimiento         Movimiento[]
  
  @@map("producto_almacen")
}
```

**Descripción:** Representa el stock de un producto en un almacén específico. Mantiene stock disponible y reservado.

**Relaciones externas:**
- `id_producto`: Referencia lógica al microservicio Products
- `id_almacen`: Referencia lógica al microservicio Store/Warehouse (IDs: 1, 2, 3)

---

### Movimiento (Movement)
```prisma
model Movimiento {
  id                   Int            @id @default(autoincrement())
  id_producto_almacen  Int
  id_tipo              Int
  cantidad             Int
  fecha                DateTime       @default(now())
  observacion          String?
  producto_almacen     ProductoAlmacen @relation(fields: [id_producto_almacen], references: [id])
  tipo_movimiento      TipoMovimiento  @relation(fields: [id_tipo], references: [id])
  
  @@map("movimiento")
}
```

**Descripción:** Registra cada movimiento de inventario (entrada, salida, ajustes, transferencias) con su cantidad y fecha.

---

## 🔗 Relaciones entre Entidades

```
TipoMovimiento (1) ──┐
                     │
                     ├──> (N) Movimiento (N) ──┐
                     │                          │
ProductoAlmacen (1) ─┘                          └──> Incluye relaciones completas en respuestas
```

**Notas importantes:**
- Un `ProductoAlmacen` puede tener múltiples `Movimientos`
- Un `TipoMovimiento` puede tener múltiples `Movimientos`
- Los endpoints incluyen automáticamente las relaciones (includes) para facilitar consultas

---

## 📊 Ejemplos de Uso Completos

### Ejemplo 1: Crear producto en almacén con movimiento de entrada

**Paso 1:** Crear stock del producto
```bash
POST http://localhost:4001/api/stock
Content-Type: application/json

{
  "id_producto": 201,
  "id_almacen": 1,
  "stock_disponible": 0,
  "stock_reservado": 0
}
```

**Paso 2:** Registrar entrada de productos
```bash
POST http://localhost:4001/api/movimiento
Content-Type: application/json

{
  "id_producto_almacen": 9,
  "id_tipo": 1,
  "cantidad": 100,
  "observacion": "Primera entrada del producto 201"
}
```

**Paso 3:** Actualizar stock disponible
```bash
PUT http://localhost:4001/api/stock/9
Content-Type: application/json

{
  "stock_disponible": 100
}
```

---

### Ejemplo 2: Consultar historial de movimientos de un producto

```bash
GET http://localhost:4001/api/stock/1/movimientos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "cantidad": 100,
    "fecha": "2024-01-10T00:00:00.000Z",
    "observacion": null,
    "tipo_movimiento": {
      "nombre": "ENTRADA"
    }
  },
  {
    "id": 2,
    "cantidad": 50,
    "fecha": "2024-02-15T00:00:00.000Z",
    "observacion": null,
    "tipo_movimiento": {
      "nombre": "ENTRADA"
    }
  },
  {
    "id": 12,
    "cantidad": 10,
    "fecha": "2024-03-15T00:00:00.000Z",
    "observacion": "Transfer a Arequipa",
    "tipo_movimiento": {
      "nombre": "TRANSFERENCIA"
    }
  }
]
```

---

### Ejemplo 3: Filtrar productos por almacén

```bash
GET http://localhost:4001/api/stock?id_almacen=1
```

**Respuesta:** Retorna todos los productos del almacén con ID 1 (Almacén Lima Central)

---

### Ejemplo 4: Obtener todos los movimientos de tipo ENTRADA

```bash
GET http://localhost:4001/api/movimiento/tipo/1
```

**Respuesta:** Lista todos los movimientos de entrada en orden descendente por fecha.

---

## 🚀 Configuración y Despliegue

### Variables de Entorno

Crear archivo `.env` en la raíz del servicio:

```env
# Puerto del servicio
PORT=4001

# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/inventory?schema=public"

# Modo de ejecución
NODE_ENV=development
```

### Instalación Local

```bash
cd services/inventory

# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Poblar base de datos con datos iniciales
npm run seed

# Iniciar servidor
npm run dev
```

### Docker Local

```bash
cd services/inventory

# Construir imagen
docker build -t inventory-service .

# Ejecutar contenedor
docker run -p 4001:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/inventory" \
  inventory-service
```

### Despliegue a Cloud Run

Desde la raíz del proyecto:

```powershell
# Desplegar solo inventory
.\deploy-single-service.ps1 -ServiceName inventory

# O desplegar todos los servicios
.\deploy-to-cloudrun.ps1
```

**Requisitos previos:**
- Docker Desktop ejecutándose
- Google Cloud CLI instalado y autenticado
- Artifact Registry configurado
- Cloud SQL PostgreSQL configurado

---

## 🧪 Testing de Endpoints

### Health Check
```bash
GET http://localhost:4001/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "service": "inventory"
}
```

### Root Endpoint
```bash
GET http://localhost:4001/
```

**Respuesta:**
```
Inventory Service is running ✅
```

---

## 📝 Notas de Implementación

### Validaciones Implementadas

✅ **Validación de IDs:** Todos los endpoints validan que los IDs sean números válidos  
✅ **Validación de campos requeridos:** Se verifica presencia de campos obligatorios  
✅ **Validación de stocks negativos:** Los stocks no pueden ser menores a 0  
✅ **Validación de cantidad de movimiento:** La cantidad debe ser mayor a 0  
✅ **Manejo de errores Prisma:** P2002 (duplicados), P2003 (FK), P2025 (no encontrado)

### Características Adicionales

🔹 **Includes automáticos:** Las respuestas incluyen relaciones completas  
🔹 **Ordenamiento por fecha:** Los movimientos se ordenan por fecha descendente  
🔹 **Filtrado por almacén:** Query param `id_almacen` en `/api/stock`  
🔹 **Timestamps automáticos:** Campo `fecha` se genera automáticamente  
🔹 **Respuestas consistentes:** Formato JSON estándar con manejo de errores

### Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Datos inválidos o campos faltantes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: nombre duplicado) |
| 500 | Internal Server Error | Error del servidor |

---

## 🔄 Integración con Otros Microservicios

### Dependencias Lógicas

```
Products Service (futuro)
    ↓ (id_producto)
Inventory Service
    ↓ (id_almacen)
Store/Warehouse Service
```

**Referencias externas:**
- `id_producto`: 101-105 (productos ficticios en seeds)
- `id_almacen`: 1, 2, 3 (almacenes en Store/Warehouse)
- `id_orden`: Usado por Reservation/Shipping services

### Endpoints de Consulta Recomendados

Para sincronización entre servicios:
- `GET /api/stock?id_almacen={id}` - Obtener todo el stock de un almacén
- `GET /api/stock/{id}` - Verificar disponibilidad de producto específico
- `GET /api/movimiento/product/{id}` - Auditoría de movimientos

---

## 📞 Contacto y Soporte

**Proyecto:** Inventory & Shipping Management  
**Repositorio:** [202W0807-Taller-Web/inventory-shipping](https://github.com/202W0807-Taller-Web/inventory-shipping)  
**Documentación completa:** Ver `/scripts/API_ENDPOINTS.md`

---

**Última actualización:** 09 de octubre de 2025  
**Versión del servicio:** 1.0.0  
**Node.js:** 18.x LTS  
**Prisma:** 5.x