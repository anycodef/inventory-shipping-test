# 📚 Resumen de Documentación de APIs - Inventory & Shipping System

> **Documentación completa y profesional de todos los microservicios**  
> Última actualización: 7 de noviembre de 2025

---

## 🎯 Índice de Servicios

| Servicio | Puerto | Endpoints | README |
|----------|--------|-----------|--------|
| **Inventory** | 4001 | 16 | [`services/inventory/README.md`](./services/inventory/README.md) |
| **Reservation** | 4002 | 10 | [`services/reservation/README.md`](./services/reservation/README.md) |
| **Shipping** | 4003 | 18 | [`services/shipping/README.md`](./services/shipping/README.md) |
| **Store** | 4005 | 51 | [`services/store/README.md`](./services/store/README.md) |

**Total de Endpoints Documentados:** 95

---

## 🗂️ Estructura de la Documentación

Cada README incluye:

✅ **Descripción general del servicio**  
✅ **URL base (local y cloud)**  
✅ **Lista completa de endpoints organizados por categoría**  
✅ **Para cada endpoint:**
- Método HTTP (GET, POST, PUT, DELETE, PATCH)
- URL completa con parámetros
- Descripción detallada de funcionalidad
- Parámetros de ruta (path params)
- Parámetros de consulta (query params)
- Cuerpo de la petición (request body) con tipos de datos
- Respuestas exitosas con ejemplos JSON
- Códigos de error con ejemplos JSON
- Validaciones aplicadas
- Notas y consideraciones especiales

✅ **Modelos de base de datos (Prisma Schema)**  
✅ **Relaciones entre modelos**  
✅ **Ejemplos de uso (curl, PowerShell, JavaScript)**  
✅ **Variables de entorno requeridas**  
✅ **Instrucciones de instalación y ejecución**

---

## 📦 Inventory Service (16 endpoints)

**Puerto:** 4001  
**Descripción:** Gestión de stock de productos, movimientos de inventario y tipos de movimiento

### Categorías de Endpoints

#### 🏷️ Tipos de Movimiento (5 endpoints)
- `GET /api/tipomovimiento` - Listar todos los tipos
- `GET /api/tipomovimiento/:id` - Obtener por ID
- `POST /api/tipomovimiento` - Crear nuevo tipo
- `PUT /api/tipomovimiento/:id` - Actualizar tipo
- `DELETE /api/tipomovimiento/:id` - Eliminar tipo

#### 📦 Stock de Productos (6 endpoints)
- `GET /api/stock` - Listar todo el stock (con filtros opcionales)
- `GET /api/stock?id_almacen=1` - Filtrar por almacén
- `GET /api/stock?id_producto=101` - Filtrar por producto ✨ **NUEVO**
- `GET /api/stock/:id` - Obtener stock por ID
- `POST /api/stock` - Registrar nuevo stock
- `PUT /api/stock/:id` - Actualizar stock
- `DELETE /api/stock/:id` - Eliminar stock
- `GET /api/stock/:stockId/movimientos` - Movimientos de un stock

#### 🔄 Movimientos (5 endpoints)
- `GET /api/movimiento` - Listar todos los movimientos
- `GET /api/movimiento/:id` - Obtener por ID
- `GET /api/movimiento/product/:id_producto_almacen` - Por producto
- `GET /api/movimiento/tipo/:id_tipo` - Por tipo de movimiento
- `POST /api/movimiento` - Registrar movimiento

### Modelos Prisma

```prisma
model ProductoAlmacen {
  id                   Int @id @default(autoincrement()) 
  id_producto          Int // FK a servicio externo
  id_almacen           Int // FK a servicio externo
  stock_reservado      Int @default(0)
  stock_disponible     Int @default(0)
  movimiento           Movimiento[]
}

model TipoMovimiento {
  id                   Int @id @default(autoincrement()) 
  nombre               String @unique
  descripcion          String?
  movimiento           Movimiento[]
}

model Movimiento {
  id                   Int @id @default(autoincrement()) 
  id_producto_almacen  Int // FK
  id_tipo              Int // FK
  cantidad             Int
  fecha                DateTime @default(now())
  producto_almacen     ProductoAlmacen @relation(...)
  tipo_movimiento      TipoMovimiento @relation(...)
}
```

**📖 Documentación completa:** [`services/inventory/README.md`](./services/inventory/README.md)

---

## 📝 Reservation Service (10 endpoints)

**Puerto:** 4002  
**Descripción:** Gestión de reservas de productos con soporte para órdenes, estados y expiración

### Categorías de Endpoints

#### 🏷️ Estados de Reserva (5 endpoints)
- `GET /api/estado` - Listar todos los estados
- `GET /api/estado/:id` - Obtener por ID (con últimas 10 reservas)
- `POST /api/estado` - Crear nuevo estado
- `PUT /api/estado/:id` - Actualizar estado
- `DELETE /api/estado/:id` - Eliminar estado

#### 📋 Reservas (5 endpoints)
- `GET /api/reservas` - Listar con filtros y paginación
- `GET /api/reservas?id_orden=1001` - Filtrar por orden
- `GET /api/reservas?id_estado=1` - Filtrar por estado
- `GET /api/reservas/:id` - Obtener por ID
- `GET /api/reservas/expiradas` - Listar expiradas
- `POST /api/reservas` - Crear reserva manual
- `PUT /api/reservas/:id` - Actualizar reserva
- `DELETE /api/reservas/:id` - Eliminar reserva

### ⚙️ Reglas de negocio clave
- Stock reservado siempre se valida contra Inventory Service; si no hay disponibilidad, el servicio responde `409 Conflict`.
- `fecha_expiracion` es opcional: se autocalcula (`RESERVATION_MAX_HOURS`, 24h por defecto) y nunca puede superar ese límite respecto a `fecha_reserva`.
- Actualizaciones/liberaciones ajustan automáticamente el `stock_reservado` en Inventory para evitar sobreventas.

#### ⭐ Endpoint Especializado para Órdenes (1 endpoint)
- `POST /api/reservas/from-order` - **Crear reservas desde orden** ✨ **NUEVO**

### Endpoint Destacado: `/api/reservas/from-order`

**Características especiales:**
- ✅ Acepta `id_producto` (no requiere `id_stock_producto`)
- ✅ Busca automáticamente el mejor almacén con stock
- ✅ Soporta RECOJO_TIENDA y DOMICILIO
- ✅ Valida tiendas y carriers
- ✅ Crea múltiples reservas en una transacción
- ✅ Rollback automático si falla

**Ejemplo RECOJO_TIENDA:**

```json
{
  "id_orden": 99003,
  "productos": [
    { "id_producto": 101, "cantidad": 5 }
  ],
  "tipo_envio": "RECOJO_TIENDA",
  "id_tienda": 4
}
```

**Ejemplo DOMICILIO:**

```json
{
  "id_orden": 99004,
  "productos": [
    { "id_producto": 102, "cantidad": 3 }
  ],
  "tipo_envio": "DOMICILIO",
  "id_carrier": 1,
  "direccion_envio": "Calle Los Pinos 456, Lima",
  "latitud_destino": -12.0464,
  "longitud_destino": -77.0428
}
```

### Modelos Prisma

```prisma
model EstadoReserva {
  id          Int       @id @default(autoincrement())
  nombre      String    @unique
  descripcion String?
  reservas    Reserva[]
}

model Reserva {
  id                Int           @id @default(autoincrement())
  id_stock_producto Int           // FK a Inventory Service
  id_orden          Int           // FK a Orders Service
  stock_reservado   Int
  fecha_reserva     DateTime      @default(now())
  fecha_expiracion  DateTime
  id_estado         Int
  estado            EstadoReserva @relation(...)
  
  // Información de envío
  tipo_envio        String        @default("DOMICILIO")
  id_tienda         Int?          // Para recojo en tienda
  id_carrier        Int?          // Para envío a domicilio
  direccion_envio   String?
  latitud_destino   Decimal?
  longitud_destino  Decimal?
}
```

**📖 Documentación completa:** [`services/reservation/README.md`](./services/reservation/README.md)  
**📖 Guía detallada de reservas:** [`scripts/RESERVATION_API_GUIDE.md`](./scripts/RESERVATION_API_GUIDE.md)

---

## 🚚 Shipping Service (18 endpoints)

**Puerto:** 4003  
**Descripción:** Gestión de envíos, carriers y cotizaciones de envío con cálculo automático de costos

### Categorías de Endpoints

#### 💰 Cotizaciones (4 endpoints) ✨ **NUEVO**
- `POST /api/cotizaciones` - Obtener cotizaciones de todos los carriers
- `GET /api/cotizaciones/historial` - Historial de cotizaciones
- `GET /api/cotizaciones/:id` - Obtener cotización por ID
- `GET /api/cotizaciones/carriers/disponibles` - Listar carriers

#### 🚛 Carriers (7 endpoints)
- `GET /api/carrier` - Listar todos los carriers
- `GET /api/carrier/paginated` - Listar con paginación
- `GET /api/carrier/:id` - Obtener por ID
- `POST /api/carrier` - Crear nuevo carrier
- `PUT /api/carrier/:id` - Actualizar carrier
- `DELETE /api/carrier/:id` - Eliminar carrier

#### 📦 Envíos (7 endpoints)
- `GET /api/shipping` - Listar con filtros y paginación
- `GET /api/shipping?id_orden=1001` - Filtrar por orden
- `GET /api/shipping?id_carrier=1` - Filtrar por carrier
- `GET /api/shipping/:id` - Obtener por ID
- `GET /api/shipping/order/:id_orden` - Por orden
- `GET /api/shipping/status/expired` - Listar expirados
- `POST /api/shipping` - Crear envío
- `PUT /api/shipping/:id` - Actualizar envío
- `PATCH /api/shipping/:id/status` - Actualizar solo estado
- `DELETE /api/shipping/:id` - Eliminar envío

### Endpoint Destacado: `POST /api/cotizaciones`

**Funcionalidad:**
- Calcula distancia desde Trujillo hasta destino
- Obtiene cotizaciones de todos los carriers activos
- Calcula costo basado en: tarifa base + distancia + peso
- Calcula tiempo de entrega y fecha estimada
- Guarda cotización en base de datos (válida 4 horas)

**Request:**

```json
{
  "destino_lat": -12.0464,
  "destino_lng": -77.0428,
  "destino_direccion": "Av. Javier Prado 123, Lima",
  "productos": [
    { "id_producto": 101, "cantidad": 2 }
  ],
  "peso_kg": 2.5,
  "dimensiones": {
    "largo": 40,
    "ancho": 30,
    "alto": 20
  },
  "valor_declarado": 150.00
}
```

**Response:** Devuelve cotizaciones de todos los carriers con:
- Costo total y desglose
- Tiempo estimado de entrega
- Fecha estimada de entrega
- ID de cotización único
- Validez de 4 horas

### Modelos Prisma

```prisma
model Carrier {
  id                   Int      @id @default(autoincrement())
  nombre               String   @unique
  codigo               String   @unique
  activo               Boolean  @default(true)
  tipo                 String   @default("NACIONAL")
  logo_url             String?
  
  // Tarifas
  tarifa_base          Float    @default(0)
  tarifa_por_kg        Float    @default(0)
  tarifa_por_km        Float?
  tiempo_base_dias     Int      @default(3)
  
  // Configuración
  cobertura_nacional   Boolean  @default(true)
  cobertura_internacional Boolean @default(false)
  peso_maximo_kg       Float?
  
  envios               Envio[]
}

model Envio {
  id                   Int      @id @default(autoincrement())
  id_stock_producto    Int
  id_orden             Int
  stock_reservado      Int
  fecha_reserva        DateTime
  fecha_expiracion     DateTime
  id_estado            Int
  id_carrier           Int?
  tracking_number      String?
  costo_envio          Float?
  tiempo_estimado_dias Int?
  tipo_envio           String   @default("DOMICILIO")
  direccion_destino    Json?
  peso_kg              Float?
  carrier              Carrier? @relation(...)
}

model Cotizacion {
  id                   String   @id @default(cuid())
  
  // Origen y destino
  origen_lat           Float?
  origen_lng           Float?
  destino_lat          Float?
  destino_lng          Float?
  destino_direccion    String?
  distancia_km         Float?
  
  // Paquete
  peso_kg              Float?
  dimensiones          Json?
  valor_declarado      Float?
  tipo_envio           String
  
  // Resultado
  carrier_id           Int?
  carrier_nombre       String?
  costo_envio          Float
  tiempo_estimado_dias Int
  fecha_entrega_estimada DateTime?
  cotizacion_valida_hasta DateTime
  created_at           DateTime @default(now())
}
```

**📖 Documentación completa:** [`services/shipping/README.md`](./services/shipping/README.md)

---

## 🏬 Store Service (51 endpoints)

**Puerto:** 4005  
**Descripción:** Gestión de ubicaciones geográficas (Perú), tiendas, almacenes y sus relaciones

### Categorías de Endpoints

#### 🗺️ Geografía del Perú (15 endpoints)
- **Departamentos (5):** CRUD completo
- **Provincias (5):** CRUD completo + filtro por departamento
- **Distritos (5):** CRUD completo + filtro por provincia

#### 📍 Ubicaciones (15 endpoints)
- **Geopoints (5):** CRUD completo de coordenadas GPS
- **Direcciones (5):** CRUD completo con geopoint y distrito
- **Búsqueda (5):** Filtros jerárquicos y avanzados

#### 🏪 Locales Comerciales (16 endpoints)
- **Tipos de Local (5):** CRUD completo (Almacén, Tienda, etc.)
- **Locales (6):** CRUD completo + filtros avanzados
- **Tiendas (3):** Gestión específica de tiendas
- **Almacenes (2):** Gestión específica de almacenes

#### 🔗 Relaciones Almacén-Tienda (5 endpoints)
- Asociar/desasociar almacenes con tiendas
- Listar relaciones
- Gestión de abastecimiento

### Características Especiales

- ✅ **Jerarquía geográfica completa del Perú**
- ✅ **25 departamentos, 196 provincias, 1874 distritos**
- ✅ **Geolocalización con validación GPS**
- ✅ **Relación N:M entre almacenes y tiendas**
- ✅ **Creación simplificada de locales** (crea GeoPoint, Dirección y Local en una transacción)
- ✅ **Filtrado jerárquico** (departamento → provincia → distrito)
- ✅ **Paginación completa** con metadatos
- ✅ **Validación de integridad referencial**

### Modelos Prisma

```prisma
// Jerarquía geográfica
model Departamento {
  id         Int         @id @default(autoincrement())
  nombre     String      @unique
  provincias Provincia[]
}

model Provincia {
  id              Int          @id @default(autoincrement())
  nombre          String
  id_departamento Int
  departamento    Departamento @relation(...)
  distritos       Distrito[]
}

model Distrito {
  id           Int         @id @default(autoincrement())
  nombre       String
  id_provincia Int
  provincia    Provincia   @relation(...)
  direcciones  Direccion[]
}

// Ubicación física
model Geopoint {
  id        Int        @id @default(autoincrement())
  latitud   Decimal
  longitud  Decimal
  direccion Direccion?
}

model Direccion {
  id          Int       @id @default(autoincrement())
  referencia  String
  id_distrito Int
  distrito    Distrito  @relation(...)
  id_geopoint Int       @unique
  geopoint    Geopoint  @relation(...)
  local       Local?
}

// Locales comerciales
model TipoLocal {
  id          Int     @id @default(autoincrement())
  nombre      String  @unique
  descripcion String?
  locales     Local[]
}

model Local {
  id               Int       @id @default(autoincrement())
  nombre           String
  imagen           String?
  estado           String    @default("INACTIVO")
  id_direccion     Int       @unique
  direccion        Direccion @relation(...)
  id_tipo_local    Int
  tipoLocal        TipoLocal @relation(...)
  
  // Relaciones N:M
  almacenesQueAbastecen AlmacenTienda[] @relation("AlmacenAbastece")
  almacenesQueRecibe    AlmacenTienda[] @relation("TiendaRecibe")
}

model AlmacenTienda {
  id               Int      @id @default(autoincrement())
  id_almacen       Int
  id_tienda        Int
  fecha_asignacion DateTime @default(now())
  almacen          Local    @relation("AlmacenAbastece", ...)
  tienda           Local    @relation("TiendaRecibe", ...)
}
```

**📖 Documentación completa:** [`services/store/README.md`](./services/store/README.md)

---

## 🔗 Integración entre Servicios

### Flujo de una Orden Completa

```mermaid
sequenceDiagram
    participant Order as Orders Module
    participant Reservation as Reservation Service
    participant Inventory as Inventory Service
    participant Store as Store Service
    participant Shipping as Shipping Service
    
    Order->>Shipping: POST /api/cotizaciones (obtener precios)
    Shipping-->>Order: Cotizaciones de carriers
    
    Order->>Reservation: POST /api/reservas/from-order
    Reservation->>Inventory: Buscar stock disponible
    Inventory-->>Reservation: id_stock_producto + disponibilidad
    
    alt tipo_envio = RECOJO_TIENDA
        Reservation->>Store: Validar tienda
        Store-->>Reservation: Tienda válida
    else tipo_envio = DOMICILIO
        Reservation->>Shipping: Validar carrier
        Shipping-->>Reservation: Carrier válido
    end
    
    Reservation->>Inventory: Reservar stock
    Inventory-->>Reservation: Stock actualizado
    Reservation-->>Order: Reservas creadas exitosamente
```

### Foreign Keys Lógicas entre Servicios

| Servicio | Campo | Referencia | Servicio Destino |
|----------|-------|------------|------------------|
| Reservation | `id_stock_producto` | `ProductoAlmacen.id` | Inventory |
| Reservation | `id_tienda` | `Local.id` (tipo=Tienda) | Store |
| Reservation | `id_carrier` | `Carrier.id` | Shipping |
| Shipping | `id_stock_producto` | `ProductoAlmacen.id` | Inventory |
| Shipping | `id_carrier` | `Carrier.id` | Shipping |
| Inventory | `id_producto` | `Producto.id` | External |
| Inventory | `id_almacen` | `Local.id` (tipo=Almacén) | Store |

---

## 🛠️ Herramientas de Desarrollo

### Scripts Disponibles

- **Seeding:** `scripts/SEEDING_GUIDE.md` - Datos de prueba
- **Endpoints:** `scripts/API_ENDPOINTS.md` - Referencia rápida
- **Verificación:** `scripts/verify-seeding.ps1` - Validar datos

### Variables de Entorno

**Inventory Service:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5433/inventory_db"
PORT=4001
```

**Reservation Service:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5434/reservation_db"
PORT=4002
INVENTORY_SERVICE_URL="http://inventory-service:4001"
STORE_SERVICE_URL="http://store-service:4005"
SHIPPING_SERVICE_URL="http://shipping-service:4003"
RESERVATION_MAX_HOURS=24
```

**Shipping Service:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5435/shipping_db"
PORT=4003
INVENTORY_SERVICE_URL="http://inventory-service:4001"
```

**Store Service:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5436/store_db"
PORT=4005
```

---

## 📖 Guías Adicionales

| Documento | Descripción |
|-----------|-------------|
| [`arquitecture/README.md`](./arquitecture/README.md) | Arquitectura del sistema |
| [`scripts/API_ENDPOINTS.md`](./scripts/API_ENDPOINTS.md) | Referencia rápida de endpoints |
| [`scripts/SEEDING_GUIDE.md`](./scripts/SEEDING_GUIDE.md) | Datos de prueba disponibles |
| [`scripts/RESERVATION_API_GUIDE.md`](./scripts/RESERVATION_API_GUIDE.md) | Guía detallada de reservas |

---

## ✅ Checklist de Validación

### Schemas de Prisma
- ✅ **Inventory:** ProductoAlmacen, TipoMovimiento, Movimiento
- ✅ **Reservation:** EstadoReserva, Reserva (con tipo_envio, coordenadas)
- ✅ **Shipping:** Carrier, Envio, Cotizacion
- ✅ **Store:** Jerarquía geográfica + Locales + AlmacenTienda

### Controllers vs Models
- ✅ Todos los controllers acceden correctamente a los modelos Prisma
- ✅ Relaciones (`include`) coinciden con schema
- ✅ Foreign keys validadas antes de crear registros
- ✅ Validaciones de negocio implementadas

### Documentación
- ✅ Todos los endpoints documentados con ejemplos
- ✅ Request bodies con tipos de datos especificados
- ✅ Responses con estructuras JSON completas
- ✅ Errores comunes documentados con códigos HTTP
- ✅ Query params y path params explicados
- ✅ Validaciones y reglas de negocio claras

---

## 🚀 Para Empezar

1. **Leer el README del servicio que necesitas usar**
2. **Revisar los ejemplos de request/response**
3. **Consultar los datos de prueba disponibles** (`SEEDING_GUIDE.md`)
4. **Probar los endpoints con los ejemplos proporcionados**
5. **Revisar la sección de errores si algo falla**

---

## 📞 Soporte

Para más información:
- Revisa los READMEs individuales de cada servicio
- Consulta `API_ENDPOINTS.md` para referencia rápida
- Revisa `RESERVATION_API_GUIDE.md` para flujo completo de órdenes

---

**Última actualización:** 7 de noviembre de 2025  
**Versión de la documentación:** 2.0  
**Total de endpoints documentados:** 95
