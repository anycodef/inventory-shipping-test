# Store Service (Unificado) 🏢🏪

Microservicio integral que combina la gestión de ubicaciones geográficas, locales comerciales (tiendas y almacenes) y puntos geográficos. Proporciona funcionalidad completa para administrar la jerarquía geográfica del Perú (departamentos, provincias, distritos), direcciones con geolocalización, gestión de tiendas y almacenes con sus relaciones, y locales con sus respectivos tipos.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura de Datos](#-arquitectura-de-datos)
- [Configuración](#-configuración)
- [API Endpoints](#-api-endpoints)
  - [Departamentos](#departamentos)
  - [Provincias](#provincias)
  - [Distritos](#distritos)
  - [Direcciones](#direcciones)
  - [GeoPoints](#geopoints)
  - [Tipos de Local](#tipos-de-local)
  - [Locales](#locales)
  - [Relaciones Almacén-Tienda](#relaciones-almacén-tienda)
  - [Ubicación (Complementario)](#ubicación-complementario)
  - [Tiendas](#tiendas)
  - [Almacenes](#almacenes)
- [Validaciones](#-validaciones)
- [Códigos de Error](#-códigos-de-error)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Testing](#-testing)
- [Despliegue](#-despliegue)

## 🎯 Características

- **Gestión Geográfica Completa**: Jerarquía completa de ubicaciones (Departamento → Provincia → Distrito)
- **Geolocalización Precisa**: Sistema de coordenadas GPS con validación de rangos
- **Direcciones Detalladas**: Direcciones con referencias y ubicación exacta
- **Tipos de Local Flexibles**: Sistema extensible de tipos (Almacén, Tienda, etc.)
- **Gestión de Tiendas**: Control completo de tiendas con asociación a almacenes
- **Gestión de Almacenes**: Administración de almacenes y sus tiendas asociadas
- **Relación N:M Almacén-Tienda**: Sistema de asociación múltiple entre almacenes y tiendas a través de tabla intermedia
- **Locales con Context Completo**: Información completa de ubicación y tipo
- **Filtrado Avanzado**: Filtros jerárquicos por departamento, provincia, distrito y nombre
- **Paginación Completa**: Control de resultados con metadatos y límites configurables
- **Validación de Integridad**: Validaciones de claves foráneas, unicidad y duplicados
- **Relaciones Anidadas**: Includes completos con toda la jerarquía
- **Creación Simplificada**: Endpoint POST /api/locales que crea automáticamente GeoPoint, Dirección y Local en una transacción
- **CRUD Completo de Relaciones**: Endpoints dedicados para gestionar asociaciones Almacén-Tienda

## 🏗️ Arquitectura de Datos

Este servicio maneja la estructura geográfica completa del Perú con geolocalización y relaciones N:M entre locales:

```
Departamento
    ↓
Provincia
    ↓
Distrito ←─────── Direccion ←─────── Local ←─────── TipoLocal
               ↓                       ↓
            GeoPoint              AlmacenTienda (Tabla intermedia)
                                       ↓         ↓
                                   Almacén ←───→ Tiendas
                                  (Relación N:M - Muchos a Muchos)
```

### Modelos Principales

- **Departamento**: División administrativa nivel 1 (25 departamentos)
- **Provincia**: División administrativa nivel 2 (196 provincias)
- **Distrito**: División administrativa nivel 3 (1874 distritos)
- **GeoPoint**: Coordenadas GPS (latitud/longitud)
- **Direccion**: Dirección física con referencia, distrito y geopoint
- **TipoLocal**: Clasificación de locales (Almacén, Tienda, etc.)
- **Local**: Establecimiento comercial con dirección y tipo
  - **Almacén**: Local de almacenamiento y distribución (puede abastecer a múltiples tiendas)
  - **Tienda**: Local de venta al público (puede recibir de múltiples almacenes)
- **AlmacenTienda**: Tabla intermedia que gestiona la relación N:M entre almacenes y tiendas con fecha de asignación

### Relaciones Clave

- **Jerarquía Geográfica**: Departamento → Provincia → Distrito (cascade)
- **Dirección Completa**: Direccion → Distrito + GeoPoint (1:1 con local)
- **Local Tipificado**: Local → TipoLocal + Direccion (único por dirección)
- **Relación N:M Almacén-Tienda**: 
  - Un almacén puede abastecer a múltiples tiendas
  - Una tienda puede recibir de múltiples almacenes
  - Gestionado a través de la tabla `almacen_tienda` con constraint único (id_almacen, id_tienda)
- **Unicidad**: Una dirección = Un geopoint = Un local

## ⚙️ Configuración

### Requisitos

- Node.js 18+
- PostgreSQL 14+
- Prisma ORM

### Instalación

```bash
cd services/store
npm install
```

### Variables de Entorno

Crea un archivo `.env`:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/store_db"

# Puerto del servicio
PORT=4005

# Entorno
NODE_ENV=development
```

### Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Seed de datos iniciales (incluye toda la geografía del Perú)
npx prisma db seed
```

### Ejecución Local

```bash
npm start
```

El servicio estará disponible en `http://localhost:4005`

## 📡 API Endpoints

### Departamentos

#### 1. GET `/api/departamentos`

Obtiene la lista completa de departamentos con sus provincias.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Lima",
      "provincias": [
        {
          "id": 1,
          "nombre": "Lima",
          "id_departamento": 1
        },
        {
          "id": 2,
          "nombre": "Barranca",
          "id_departamento": 1
        }
      ]
    }
  ]
}
```

#### 2. GET `/api/departamentos/:id`

Obtiene un departamento específico por su ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Lima",
    "provincias": [...]
  }
}
```

**Errores:**
- `400`: ID inválido (no numérico)
- `404`: Departamento no encontrado
- `500`: Error del servidor

#### 3. POST `/api/departamentos`

Crea un nuevo departamento.

**Request Body:**
```json
{
  "nombre": "Nuevo Departamento"
}
```

**Validaciones:**
- `nombre`: Requerido, no vacío, máximo 50 caracteres

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 26,
    "nombre": "Nuevo Departamento"
  },
  "message": "Departamento creado exitosamente"
}
```

#### 4. PUT `/api/departamentos/:id`

Actualiza un departamento existente.

**Request Body:**
```json
{
  "nombre": "Departamento Actualizado"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 26,
    "nombre": "Departamento Actualizado"
  },
  "message": "Departamento actualizado exitosamente"
}
```

#### 5. DELETE `/api/departamentos/:id`

Elimina un departamento.

**⚠️ IMPORTANTE:** No se puede eliminar si tiene provincias asociadas.

**Response:**
```json
{
  "success": true,
  "message": "Departamento eliminado correctamente",
  "data": { "id": 26 }
}
```

---

### Provincias

#### 1. GET `/api/provincias`

Obtiene todas las provincias con su departamento y distritos.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Lima",
      "id_departamento": 1,
      "departamento": {
        "id": 1,
        "nombre": "Lima"
      },
      "distritos": [...]
    }
  ]
}
```

#### 2. GET `/api/provincias/:id`

Obtiene una provincia específica por su ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Lima",
    "id_departamento": 1,
    "departamento": {
      "nombre": "Lima"
    },
    "distritos": [...]
  }
}
```

#### 3. GET `/api/provincias/departamento/:departamentoId`

Obtiene todas las provincias de un departamento específico.

**Ejemplos:**

```bash
GET /api/provincias/departamento/1  # Provincias de Lima
GET /api/provincias/departamento/2  # Provincias de Arequipa
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Lima",
      "distritos": [...]
    },
    {
      "id": 2,
      "nombre": "Barranca",
      "distritos": [...]
    }
  ]
}
```

**Errores:**
- `400`: ID de departamento inválido
- `404`: Departamento no encontrado
- `500`: Error del servidor

#### 4. POST `/api/provincias`

Crea una nueva provincia.

**Request Body:**
```json
{
  "nombre": "Cañete",
  "id_departamento": 1
}
```

**Validaciones:**
- `nombre`: Requerido, no vacío, máximo 50 caracteres
- `id_departamento`: Requerido, numérico, debe existir

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 197,
    "nombre": "Cañete",
    "id_departamento": 1
  },
  "message": "Provincia creada exitosamente"
}
```

**Errores:**
- `400`: Campos requeridos faltantes o inválidos
- `404`: Departamento no existe
- `500`: Error del servidor
- **P2003**: id_departamento no existe

#### 5. PUT `/api/provincias/:id`

Actualiza una provincia existente.

#### 6. DELETE `/api/provincias/:id`

Elimina una provincia.

**⚠️ IMPORTANTE:** No se puede eliminar si tiene distritos asociados.

---

### Distritos

#### 1. GET `/api/distritos`

Obtiene todos los distritos con su jerarquía completa.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Miraflores",
      "id_provincia": 1,
      "provincia": {
        "id": 1,
        "nombre": "Lima",
        "departamento": {
          "id": 1,
          "nombre": "Lima"
        }
      }
    }
  ]
}
```

#### 2. GET `/api/distritos/:id`

Obtiene un distrito específico por su ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Miraflores",
    "id_provincia": 1,
    "provincia": {
      "nombre": "Lima",
      "departamento": {
        "nombre": "Lima"
      }
    }
  }
}
```

#### 3. GET `/api/distritos/provincia/:provinciaId`

Obtiene todos los distritos de una provincia específica.

**Ejemplos:**

```bash
GET /api/distritos/provincia/1  # Distritos de Lima
GET /api/distritos/provincia/5  # Distritos de Callao
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Miraflores"
    },
    {
      "id": 2,
      "nombre": "San Isidro"
    }
  ]
}
```

**Errores:**
- `400`: ID de provincia inválido
- `404`: Provincia no encontrada
- `500`: Error del servidor

#### 4. POST `/api/distritos`

Crea un nuevo distrito.

**Request Body:**
```json
{
  "nombre": "Barranco",
  "id_provincia": 1
}
```

**Validaciones:**
- `nombre`: Requerido, no vacío, máximo 50 caracteres
- `id_provincia`: Requerido, numérico, debe existir

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1875,
    "nombre": "Barranco",
    "id_provincia": 1
  },
  "message": "Distrito creado exitosamente"
}
```

**Errores:**
- `400`: Campos requeridos faltantes o inválidos
- `404`: Provincia no existe
- `500`: Error del servidor
- **P2003**: id_provincia no existe

#### 5. PUT `/api/distritos/:id`

Actualiza un distrito existente.

#### 6. DELETE `/api/distritos/:id`

Elimina un distrito.

**⚠️ IMPORTANTE:** No se puede eliminar si tiene direcciones asociadas.

---

### Direcciones

#### 1. GET `/api/direcciones`

Obtiene todas las direcciones con información completa de ubicación y geopoint.

**Response:**
```json
[
  {
    "id": 1,
    "referencia": "Av. Larco 1234, frente al parque Kennedy",
    "id_distrito": 1,
    "id_geopoint": 1,
    "distrito": {
      "id": 1,
      "nombre": "Miraflores",
      "provincia": {
        "nombre": "Lima",
        "departamento": {
          "nombre": "Lima"
        }
      }
    },
    "geopoint": {
      "id": 1,
      "latitud": -12.119260,
      "longitud": -77.030442
    },
    "local": {
      "id": 1,
      "nombre": "Almacén Central"
    }
  }
]
```

#### 2. GET `/api/direcciones/:id`

Obtiene una dirección específica por su ID.

**Response:**
```json
{
  "id": 1,
  "referencia": "Av. Larco 1234",
  "id_distrito": 1,
  "id_geopoint": 1,
  "distrito": {...},
  "geopoint": {...},
  "local": {...}
}
```

**Errores:**
- `400`: ID inválido (no numérico)
- `404`: Dirección no encontrada
- `500`: Error del servidor

#### 3. GET `/api/direcciones/distrito/:id_distrito`

Obtiene todas las direcciones de un distrito específico.

**Ejemplos:**

```bash
GET /api/direcciones/distrito/1  # Direcciones de Miraflores
GET /api/direcciones/distrito/5  # Direcciones de San Isidro
```

**Response:**
```json
[
  {
    "id": 1,
    "referencia": "Av. Larco 1234",
    "id_distrito": 1,
    "distrito": {
      "nombre": "Miraflores"
    },
    "geopoint": {
      "latitud": -12.119260,
      "longitud": -77.030442
    }
  }
]
```

**Errores:**
- `400`: ID de distrito inválido o requerido
- `500`: Error del servidor

#### 4. POST `/api/direcciones`

Crea una nueva dirección.

**Request Body:**
```json
{
  "referencia": "Av. Pardo 567, a dos cuadras del mar",
  "id_distrito": 1,
  "id_geopoint": 2
}
```

**Campos:**
- `referencia` (requerido): Descripción de la dirección
- `id_distrito` (requerido): ID del distrito
- `id_geopoint` (requerido): ID del geopoint (debe ser único)

**Response:**
```json
{
  "id": 15,
  "referencia": "Av. Pardo 567, a dos cuadras del mar",
  "id_distrito": 1,
  "id_geopoint": 2,
  "distrito": {...},
  "geopoint": {...}
}
```

**Validaciones:**
- Todos los campos son requeridos
- `id_distrito` debe existir
- `id_geopoint` debe existir y no estar asociado a otra dirección

**Errores:**
- `400`: Campos requeridos faltantes, geopoint ya asociado
- `404`: Distrito o geopoint no existe
- `500`: Error del servidor
- **P2002**: Geopoint ya está asociado a otra dirección

#### 5. PUT `/api/direcciones/:id`

Actualiza una dirección existente.

**Request Body (todos los campos son opcionales):**
```json
{
  "referencia": "Av. Pardo 600, cerca de la playa",
  "id_distrito": 2
}
```

**Nota:** El `id_geopoint` NO se puede cambiar una vez creado.

**Response:**
```json
{
  "id": 15,
  "referencia": "Av. Pardo 600, cerca de la playa",
  "id_distrito": 2,
  "distrito": {...},
  "geopoint": {...}
}
```

**Validaciones:**
- Al menos un campo debe ser proporcionado
- `id_distrito` debe existir si se proporciona

**Errores:**
- `400`: Al menos un campo requerido
- `404`: Dirección o distrito no encontrado
- `500`: Error del servidor

#### 6. DELETE `/api/direcciones/:id`

Elimina una dirección.

**⚠️ IMPORTANTE:** No se puede eliminar si está asociada a un local.

**Response:**
```json
{
  "message": "Dirección eliminada correctamente"
}
```

---

### GeoPoints

#### 1. GET `/api/geopoints`

Obtiene todos los geopoints con sus direcciones asociadas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "latitud": "-12.1192600",
      "longitud": "-77.0304420",
      "direccion": [
        {
          "id": 1,
          "referencia": "Av. Larco 1234"
        }
      ]
    }
  ]
}
```

#### 2. GET `/api/geopoints/:id`

Obtiene un geopoint específico por su ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "latitud": "-12.1192600",
    "longitud": "-77.0304420",
    "direccion": [...]
  }
}
```

**Errores:**
- `400`: ID inválido (no numérico)
- `404`: GeoPoint no encontrado
- `500`: Error del servidor

#### 3. POST `/api/geopoints`

Crea un nuevo geopoint.

**Request Body:**
```json
{
  "latitud": -12.119260,
  "longitud": -77.030442
}
```

**Campos:**
- `latitud` (requerido): Latitud GPS (-90 a 90)
- `longitud` (requerido): Longitud GPS (-180 a 180)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "latitud": "-12.1192600",
    "longitud": "-77.0304420"
  },
  "message": "GeoPoint creado exitosamente"
}
```

**Validaciones:**
- Ambos campos son requeridos
- `latitud`: Debe ser numérico, entre -90 y 90
- `longitud`: Debe ser numérico, entre -180 y 180

**Errores:**
- `400`: Campos requeridos faltantes o fuera de rango
- `500`: Error del servidor

#### 4. PUT `/api/geopoints/:id`

Actualiza un geopoint existente.

**Request Body (ambos campos son opcionales):**
```json
{
  "latitud": -12.120000,
  "longitud": -77.031000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "latitud": "-12.1200000",
    "longitud": "-77.0310000"
  },
  "message": "GeoPoint actualizado exitosamente"
}
```

**Validaciones:**
- Al menos un campo debe ser proporcionado
- Si se proporciona `latitud`: debe estar entre -90 y 90
- Si se proporciona `longitud`: debe estar entre -180 y 180

**Errores:**
- `400`: Al menos un campo requerido, o valores fuera de rango
- `404`: GeoPoint no encontrado
- `500`: Error del servidor

#### 5. DELETE `/api/geopoints/:id`

Elimina un geopoint.

**⚠️ IMPORTANTE:** No se puede eliminar si está asociado a una dirección.

**Response:**
```json
{
  "success": true,
  "message": "GeoPoint eliminado correctamente",
  "data": { "id": 100 }
}
```

---

### Tipos de Local

#### 1. GET `/api/tipolocales`

Obtiene todos los tipos de local con sus locales asociados.

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Almacén",
    "descripcion": "Local de almacenamiento y distribución",
    "locales": [
      {
        "id": 1,
        "nombre": "Almacén Central Lima"
      }
    ]
  },
  {
    "id": 2,
    "nombre": "Tienda",
    "descripcion": "Local de venta al público",
    "locales": [...]
  }
]
```

#### 2. GET `/api/tipolocales/:id`

Obtiene un tipo de local específico por su ID.

**Response:**
```json
{
  "id": 1,
  "nombre": "Almacén",
  "descripcion": "Local de almacenamiento y distribución",
  "locales": [...]
}
```

**Errores:**
- `404`: Tipo de local no encontrado
- `500`: Error del servidor

#### 3. POST `/api/tipolocales`

Crea un nuevo tipo de local.

**Request Body:**
```json
{
  "nombre": "Centro de Distribución",
  "descripcion": "Local especializado en logística y distribución"
}
```

**Campos:**
- `nombre` (requerido): Nombre del tipo (único)
- `descripcion` (opcional): Descripción del tipo

**Response:**
```json
{
  "id": 3,
  "nombre": "Centro de Distribución",
  "descripcion": "Local especializado en logística y distribución"
}
```

**Validaciones:**
- `nombre`: Requerido, debe ser único

**Errores:**
- `400`: Nombre requerido o ya existe
- `500`: Error del servidor

#### 4. PUT `/api/tipolocales/:id`

Actualiza un tipo de local existente.

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Centro de Distribución Actualizado",
  "descripcion": "Nueva descripción"
}
```

**Response:**
```json
{
  "id": 3,
  "nombre": "Centro de Distribución Actualizado",
  "descripcion": "Nueva descripción"
}
```

**Validaciones:**
- Al menos un campo debe ser proporcionado
- Si se proporciona `nombre`, debe ser único

**Errores:**
- `400`: Al menos un campo requerido, o nombre ya existe
- `404`: Tipo de local no encontrado
- `500`: Error del servidor

#### 5. DELETE `/api/tipolocales/:id`

Elimina un tipo de local.

**⚠️ IMPORTANTE:** No se puede eliminar si tiene locales asociados.

**Response:**
```json
{
  "message": "Tipo de local eliminado correctamente"
}
```

---

### Locales

#### 1. GET `/api/locales`

Obtiene la lista de locales con paginación y filtros opcionales.

**Query Parameters:**
- `page` (opcional, default: 1): Número de página
- `per_page` (opcional, default: 20, max: 100): Resultados por página
- `nombre` (opcional): Filtrar por nombre (búsqueda parcial, case-insensitive)
- `distrito` (opcional): Filtrar por ID de distrito
- `provincia` (opcional): Filtrar por ID de provincia
- `departamento` (opcional): Filtrar por ID de departamento

**Ejemplos:**

```bash
# Sin filtros (todos los locales, página 1)
GET /api/locales

# Con paginación
GET /api/locales?page=2&per_page=50

# Filtrar por nombre
GET /api/locales?nombre=Central

# Filtrar por departamento
GET /api/locales?departamento=1

# Filtrar por provincia
GET /api/locales?provincia=1

# Filtrar por distrito
GET /api/locales?distrito=5

# Combinación: filtros + paginación
GET /api/locales?departamento=1&nombre=Central&page=1&per_page=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Almacén Central Lima",
      "imagen": "https://example.com/almacen1.jpg",
      "id_direccion": 1,
      "id_tipo_local": 1,
      "estado": "ACTIVO",
      "direccion": {
        "id": 1,
        "referencia": "Av. Argentina 1234",
        "distrito": {
          "nombre": "Cercado de Lima",
          "provincia": {
            "nombre": "Lima",
            "departamento": {
              "nombre": "Lima"
            }
          }
        },
        "geopoint": {
          "latitud": "-12.0565000",
          "longitud": "-77.1181000"
        }
      },
      "tipoLocal": {
        "id": 1,
        "nombre": "Almacén",
        "descripcion": "Local de almacenamiento"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Validaciones:**
- `page`: Debe ser un número > 0
- `per_page`: Debe ser un número entre 1 y 100
- Todos los IDs de filtro deben ser numéricos
- Filtros son jerárquicos: distrito > provincia > departamento

**Errores:**
- `400`: Parámetros de paginación o filtros inválidos
- `500`: Error del servidor

#### 2. GET `/api/locales/:id`

Obtiene un local específico por su ID con información completa.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Almacén Central Lima",
    "imagen": "https://example.com/almacen1.jpg",
    "id_direccion": 1,
    "id_tipo_local": 1,
    "estado": "ACTIVO",
    "direccion": {
      "referencia": "Av. Argentina 1234",
      "distrito": {
        "nombre": "Cercado de Lima",
        "provincia": {
          "nombre": "Lima",
          "departamento": {
            "nombre": "Lima"
          }
        }
      },
      "geopoint": {
        "latitud": "-12.0565000",
        "longitud": "-77.1181000"
      }
    },
    "tipoLocal": {
      "nombre": "Almacén",
      "descripcion": "Local de almacenamiento"
    }
  }
}
```

**Errores:**
- `400`: ID inválido (no numérico)
- `404`: Local no encontrado
- `500`: Error del servidor

#### 4. GET `/api/locales/tipo/:id_tipo_local`

Obtiene todos los locales de un tipo específico con paginación y filtros.

**Query Parameters:**
- `page` (opcional, default: 1): Número de página
- `per_page` (opcional, default: 20, max: 100): Resultados por página
- `nombre` (opcional): Filtrar por nombre (búsqueda parcial, case-insensitive)
- `departamento` (opcional): Filtrar por ID de departamento
- `provincia` (opcional): Filtrar por ID de provincia
- `distrito` (opcional): Filtrar por ID de distrito

**Ejemplos:**

```bash
# Todos los almacenes (tipo 1)
GET /api/locales/tipo/1

# Todas las tiendas con paginación
GET /api/locales/tipo/2?page=1&per_page=10

# Almacenes que contengan "Central" en el nombre
GET /api/locales/tipo/1?nombre=Central

# Tiendas del departamento de Lima con filtro por nombre
GET /api/locales/tipo/2?departamento=1&nombre=Premium&page=1&per_page=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Almacén Central Lima Norte",
      "imagen": "https://example.com/alm-lima.jpg",
      "estado": "ACTIVO",
      "id_direccion": 1,
      "id_tipo_local": 1,
      "tipoLocal": {
        "id": 1,
        "nombre": "Almacen",
        "descripcion": "Almacén principal de distribución"
      },
      "direccion": {
        "id": 1,
        "referencia": "Av. Larco 1234 - Almacén Central",
        "id_distrito": 1,
        "id_geopoint": 1,
        "geopoint": {
          "id": 1,
          "latitud": "-12.1197",
          "longitud": "-77.0352"
        },
        "distrito": {
          "id": 1,
          "nombre": "Miraflores",
          "id_provincia": 1,
          "provincia": {
            "id": 1,
            "nombre": "Lima",
            "id_departamento": 1,
            "departamento": {
              "id": 1,
              "nombre": "Lima"
            }
          }
        }
      },
      "almacenesQueAbastecen": [
        {
          "id": 1,
          "id_almacen": 1,
          "id_tienda": 4,
          "fecha_asignacion": "2025-10-11T15:27:30.706Z",
          "tienda": {
            "id": 4,
            "nombre": "Tienda San Isidro Premium",
            "estado": "ACTIVO",
            "direccion": {
              "referencia": "Av. Javier Prado 567 - Tienda Premium",
              "distrito": {
                "nombre": "San Isidro"
              }
            }
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

**Campos Especiales según Tipo:**
- **Si es Almacén (tipo 1)**: Incluye `almacenesQueAbastecen[]` con las tiendas que abastece
- **Si es Tienda (tipo 2)**: Incluye `almacenesQueRecibe[]` con los almacenes que la abastecen

**Validaciones:**
- `page`: Debe ser un número > 0
- `per_page`: Debe ser un número entre 1 y 100
- Todos los IDs de filtro deben ser numéricos

**Errores:**
- `400`: ID de tipo de local requerido o inválido, parámetros de paginación inválidos
- `404`: Tipo de local no encontrado
- `500`: Error del servidor

#### 5. POST `/api/locales`

Crea un nuevo local automáticamente con su dirección y geopoint.

**Request Body:**
```json
{
  "nombre": "Almacén Central",
  "direccion": "Av. Argentina 1234, cerca del puerto",
  "ubigeo": {
    "departamento": "1",
    "provincia": "1",
    "distrito": "25"
  },
  "estado": "Activo",
  "imagen": "https://example.com/almacen.jpg"
}
```

**Campos:**
- `nombre` (requerido): Nombre del local (máx. 30 caracteres)
- `direccion` (requerido): Referencia de la dirección (texto libre)
- `ubigeo.distrito` (requerido): ID del distrito
- `ubigeo.departamento` (opcional): Se ignora (el distrito ya tiene relación con departamento)
- `ubigeo.provincia` (opcional): Se ignora (el distrito ya tiene relación con provincia)
- `estado` (opcional, default: "INACTIVO"): "ACTIVO" o "INACTIVO"
- `imagen` (opcional): URL de la imagen

**⚠️ Notas Importantes:**
- Este endpoint crea **automáticamente** el GeoPoint, Dirección y Local en una transacción
- Las coordenadas GPS se establecen por defecto en **Lima, Perú** (-12.0464, -77.0428)
- El tipo de local se establece automáticamente como **Almacén** (id_tipo_local = 1)
- Solo se usa `ubigeo.distrito`, los campos `departamento` y `provincia` se ignoran

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 50,
    "nombre": "Almacén Central",
    "imagen": "https://example.com/almacen.jpg",
    "id_direccion": 42,
    "id_tipo_local": 1,
    "estado": "ACTIVO",
    "direccion": {
      "id": 42,
      "referencia": "Av. Argentina 1234, cerca del puerto",
      "id_distrito": 25,
      "id_geopoint": 101,
      "distrito": {
        "id": 25,
        "nombre": "Cercado de Lima",
        "provincia": {
          "id": 1,
          "nombre": "Lima",
          "departamento": {
            "id": 1,
            "nombre": "Lima"
          }
        }
      },
      "geopoint": {
        "id": 101,
        "latitud": "-12.0464000",
        "longitud": "-77.0428000"
      }
    },
    "tipoLocal": {
      "id": 1,
      "nombre": "Almacén",
      "descripcion": "Local de almacenamiento"
    }
  },
  "message": "Local creado exitosamente"
}
```

**Validaciones:**
- `nombre`: Requerido, no vacío, máximo 30 caracteres
- `direccion`: Requerido, no vacío
- `ubigeo.distrito`: Requerido, numérico, debe existir en la base de datos
- `estado`: Opcional, debe ser "ACTIVO" o "INACTIVO"

**Errores:**
- `400`: Campos requeridos faltantes, distrito inválido, valores inválidos
- `404`: Distrito no existe, tipo de local por defecto no configurado
- `500`: Error del servidor
- **P2003**: El distrito proporcionado no existe

#### 6. PUT `/api/locales/:id`

Actualiza un local existente.

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Tienda Miraflores Premium",
  "imagen": "https://example.com/nueva-imagen.jpg",
  "id_tipo_local": 3,
  "estado": "INACTIVO"
}
```

**Campos:**
- Todos los campos son opcionales
- `id_direccion` NO se puede cambiar una vez creado
- Se actualizan solo los campos proporcionados

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 50,
    "nombre": "Tienda Miraflores Premium",
    "imagen": "https://example.com/nueva-imagen.jpg",
    "id_tipo_local": 3,
    "estado": "INACTIVO",
    "direccion": {...},
    "tipoLocal": {...}
  },
  "message": "Local actualizado exitosamente"
}
```

**Validaciones:**
- Al menos un campo debe ser proporcionado
- `nombre`: Si se proporciona, no puede estar vacío ni exceder 30 caracteres
- `id_tipo_local`: Si se proporciona, debe ser numérico y existir
- `estado`: Si se proporciona, debe ser "ACTIVO" o "INACTIVO"

**Errores:**
- `400`: Al menos un campo requerido, o valores inválidos
- `404`: Local o tipo de local no encontrado
- `500`: Error del servidor
- **P2025**: Local no encontrado (error de Prisma)
- **P2003**: id_tipo_local no existe

#### 7. DELETE `/api/locales/:id`

Elimina un local.

**Response:**
```json
{
  "success": true,
  "message": "Local eliminado correctamente",
  "data": { "id": 50 }
}
```

**Errores:**
- `400`: ID inválido (no numérico)
- `404`: Local no encontrado
- `500`: Error del servidor
- **P2025**: Local no encontrado (error de Prisma)
- **P2003**: No se puede eliminar por registros relacionados

---

### Relaciones Almacén-Tienda

Endpoints dedicados para gestionar la relación N:M (Muchos a Muchos) entre almacenes y tiendas a través de la tabla intermedia `almacen_tienda`.

#### 1. POST `/api/locales/almacen-tienda`

Crea una nueva relación entre un almacén y una tienda.

**Request Body:**
```json
{
  "id_almacen": 1,
  "id_tienda": 5
}
```

**Campos:**
- `id_almacen` (requerido): ID del almacén (debe ser tipo_local = 1)
- `id_tienda` (requerido): ID de la tienda (debe ser tipo_local = 2)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "id_almacen": 1,
    "id_tienda": 5,
    "fecha_asignacion": "2025-10-11T15:31:33.256Z",
    "almacen": {
      "id": 1,
      "nombre": "Almacén Central Lima Norte",
      "estado": "ACTIVO"
    },
    "tienda": {
      "id": 5,
      "nombre": "Tienda Surco Mall",
      "estado": "ACTIVO"
    }
  },
  "message": "Almacén asignado a tienda exitosamente"
}
```

**Validaciones:**
- Ambos campos son requeridos y deben ser numéricos
- El `id_almacen` debe corresponder a un local de tipo Almacén (tipo 1)
- El `id_tienda` debe corresponder a un local de tipo Tienda (tipo 2)
- No se permiten relaciones duplicadas (constraint único en la tabla)
- Ambos locales deben existir y estar activos

**Errores:**
- `400`: 
  - Campos requeridos faltantes o inválidos
  - "Esta relación almacén-tienda ya existe" (duplicado)
  - "El local especificado no es un almacén"
  - "El local especificado no es una tienda"
- `404`: 
  - Almacén no encontrado
  - Tienda no encontrada
- `500`: Error del servidor

#### 2. DELETE `/api/locales/almacen-tienda/:id`

Elimina una relación específica entre almacén y tienda.

**Parámetros:**
- `id` (en URL): ID de la relación en la tabla `almacen_tienda`

**Ejemplo:**
```bash
DELETE /api/locales/almacen-tienda/6
```

**Response:**
```json
{
  "success": true,
  "message": "Relación almacén-tienda eliminada correctamente"
}
```

**Errores:**
- `400`: ID inválido (no numérico)
- `404`: "Relación no encontrada"
- `500`: Error del servidor

#### 3. GET `/api/locales/almacen/:id_almacen/tiendas`

Obtiene todas las tiendas que abastece un almacén específico.

**Parámetros:**
- `id_almacen` (en URL): ID del almacén

**Ejemplo:**
```bash
GET /api/locales/almacen/1/tiendas
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_almacen": 1,
      "id_tienda": 4,
      "fecha_asignacion": "2025-10-11T15:27:30.706Z",
      "tienda": {
        "id": 4,
        "nombre": "Tienda San Isidro Premium",
        "imagen": "https://example.com/tienda-si.jpg",
        "estado": "ACTIVO",
        "id_direccion": 2,
        "id_tipo_local": 2,
        "direccion": {
          "id": 2,
          "referencia": "Av. Javier Prado 567 - Tienda Premium",
          "id_distrito": 2,
          "id_geopoint": 2,
          "distrito": {
            "id": 2,
            "nombre": "San Isidro",
            "id_provincia": 1,
            "provincia": {
              "id": 1,
              "nombre": "Lima",
              "id_departamento": 1,
              "departamento": {
                "id": 1,
                "nombre": "Lima"
              }
            }
          },
          "geopoint": {
            "id": 2,
            "latitud": "-12.0931",
            "longitud": "-77.0428"
          }
        },
        "tipoLocal": {
          "id": 2,
          "nombre": "Tienda",
          "descripcion": "Tienda de venta al público"
        }
      }
    },
    {
      "id": 2,
      "id_almacen": 1,
      "id_tienda": 5,
      "fecha_asignacion": "2025-10-11T15:27:30.706Z",
      "tienda": {
        "id": 5,
        "nombre": "Tienda Surco Mall",
        "imagen": "https://example.com/tienda-surco.jpg",
        "estado": "ACTIVO",
        "direccion": {...}
      }
    }
  ],
  "total": 2
}
```

**Errores:**
- `400`: ID de almacén inválido o requerido
- `404`: Almacén no encontrado
- `500`: Error del servidor

#### 4. GET `/api/locales/tienda/:id_tienda/almacenes`

Obtiene todos los almacenes que abastecen a una tienda específica.

**Parámetros:**
- `id_tienda` (en URL): ID de la tienda

**Ejemplo:**
```bash
GET /api/locales/tienda/5/almacenes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "id_almacen": 1,
      "id_tienda": 5,
      "fecha_asignacion": "2025-10-11T15:27:30.706Z",
      "almacen": {
        "id": 1,
        "nombre": "Almacén Central Lima Norte",
        "imagen": "https://example.com/alm-lima.jpg",
        "estado": "ACTIVO",
        "id_direccion": 1,
        "id_tipo_local": 1,
        "direccion": {
          "id": 1,
          "referencia": "Av. Larco 1234 - Almacén Central",
          "id_distrito": 1,
          "id_geopoint": 1,
          "distrito": {
            "id": 1,
            "nombre": "Miraflores",
            "id_provincia": 1,
            "provincia": {
              "id": 1,
              "nombre": "Lima",
              "id_departamento": 1,
              "departamento": {
                "id": 1,
                "nombre": "Lima"
              }
            }
          },
          "geopoint": {
            "id": 1,
            "latitud": "-12.1197",
            "longitud": "-77.0352"
          }
        },
        "tipoLocal": {
          "id": 1,
          "nombre": "Almacen",
          "descripcion": "Almacén principal de distribución"
        }
      }
    }
  ],
  "total": 1
}
```

**Errores:**
- `400`: ID de tienda inválido o requerido
- `404`: Tienda no encontrada
- `500`: Error del servidor

---

### Ubicación (Complementario)

Endpoints simplificados para consultas rápidas de ubicación.

#### 1. GET `/api/ubicacion/departamentos`

Obtiene lista simple de departamentos.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Lima" },
    { "id": 2, "nombre": "Cusco" },
    { "id": 3, "nombre": "Arequipa" }
  ]
}
```

#### 2. GET `/api/ubicacion/provincias?id_departamento=:id`

Obtiene provincias de un departamento específico.

**Ejemplo:**
```bash
GET /api/ubicacion/provincias?id_departamento=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Lima", "id_departamento": 1 },
    { "id": 2, "nombre": "Barranca", "id_departamento": 1 }
  ]
}
```

#### 3. GET `/api/ubicacion/distritos?id_provincia=:id`

Obtiene distritos de una provincia específica.

**Ejemplo:**
```bash
GET /api/ubicacion/distritos?id_provincia=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Miraflores", "id_provincia": 1 },
    { "id": 2, "nombre": "San Isidro", "id_provincia": 1 }
  ]
}
```

---

### Tiendas

Endpoints específicos para gestión de tiendas.

> **⚠️ NOTA IMPORTANTE - Relación N:M:** 
> Las tiendas ya no tienen el campo `id_almacen` directo. La relación entre almacenes y tiendas ahora es N:M (muchos a muchos) a través de la tabla `almacen_tienda`.
> - Para asignar almacenes a una tienda, usa: `POST /api/locales/almacen-tienda`
> - Para ver almacenes de una tienda, usa: `GET /api/locales/tienda/:id/almacenes`

#### 1. GET `/api/tiendas`

Obtiene todas las tiendas con paginación y filtros.

**Query Parameters:**
- `page` (opcional, default: 1): Número de página
- `per_page` (opcional, default: 10): Resultados por página
- `nombre` (opcional): Filtrar por nombre
- `estado` (opcional): Filtrar por estado (ACTIVO/INACTIVO)
- `almacen` (opcional): Filtrar por ID de almacén que las abastece
- `distrito` (opcional): Filtrar por ID de distrito
- `provincia` (opcional): Filtrar por ID de provincia
- `departamento` (opcional): Filtrar por ID de departamento

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "imagen": "https://example.com/tienda-si.jpg",
      "nombre": "Tienda San Isidro Premium",
      "almacenes": "Almacén Central Lima Norte",
      "estado": "ACTIVO",
      "direccion": "Av. Javier Prado 567 - Tienda Premium",
      "distrito": "San Isidro",
      "provincia": "Lima",
      "departamento": "Lima"
    },
    {
      "id": 5,
      "imagen": "https://example.com/tienda-surco.jpg",
      "nombre": "Tienda Surco Mall",
      "almacenes": "Almacén Central Lima Norte, Almacén Cusco",
      "estado": "ACTIVO",
      "direccion": "Av. Primavera 890 - Tienda Sur",
      "distrito": "Surco",
      "provincia": "Lima",
      "departamento": "Lima"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

**Nota:** El campo `almacenes` muestra los nombres de todos los almacenes que abastecen la tienda, separados por coma, o "Sin asignar" si no tiene ninguno.

#### 2. GET `/api/tiendas/:id`

Obtiene una tienda específica por su ID con toda su información.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "imagen": "https://example.com/tienda-si.jpg",
    "nombre": "Tienda San Isidro Premium",
    "almacenes": "Almacén Central Lima Norte",
    "estado": "ACTIVO",
    "direccion": "Av. Javier Prado 567 - Tienda Premium",
    "distrito": "San Isidro",
    "provincia": "Lima",
    "departamento": "Lima"
  }
}
```

#### 3. POST `/api/tiendas`

Crea una nueva tienda con creación automática de dirección y geopoint.

> **⚠️ CAMBIO IMPORTANTE:** Este endpoint ya NO acepta `id_almacen`. Las relaciones con almacenes deben crearse usando el endpoint `/api/locales/almacen-tienda` después de crear la tienda.

**Request Body:**
```json
{
  "nombre": "Tienda Nueva",
  "referencia": "Calle Principal 123",
  "id_distrito": 5,
  "latitud": -12.0464,
  "longitud": -77.0428,
  "estado": "ACTIVO",
  "imagen": "https://example.com/tienda.jpg"
}
```

**Campos:**
- `nombre` (requerido): Nombre de la tienda (máx. 30 caracteres)
- `referencia` (requerido): Referencia de la dirección
- `id_distrito` (requerido): ID del distrito
- `latitud` (requerido): Coordenada GPS (-90 a 90)
- `longitud` (requerido): Coordenada GPS (-180 a 180)
- `estado` (opcional, default: "INACTIVO"): "ACTIVO" o "INACTIVO"
- `imagen` (opcional): URL de la imagen

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "imagen": "https://example.com/tienda.jpg",
    "nombre": "Tienda Nueva",
    "almacenes": "Sin asignar",
    "estado": "ACTIVO",
    "direccion": "Calle Principal 123",
    "distrito": "Santiago",
    "provincia": "Cusco",
    "departamento": "Cusco"
  },
  "message": "Tienda creada exitosamente"
}
```

**Para asignar almacenes después de crear:**
```bash
POST /api/locales/almacen-tienda
{
  "id_almacen": 1,
  "id_tienda": 10
}
```

#### 4. PUT `/api/tiendas/:id`

Actualiza una tienda existente.

> **⚠️ CAMBIO IMPORTANTE:** Este endpoint ya NO acepta `id_almacen`. Usa los endpoints de relación N:M para gestionar almacenes.

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Tienda Actualizada",
  "estado": "INACTIVO",
  "imagen": "https://example.com/nueva-imagen.jpg",
  "referencia": "Nueva dirección 456",
  "id_distrito": 7,
  "latitud": -12.05,
  "longitud": -77.04
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "imagen": "https://example.com/nueva-imagen.jpg",
    "nombre": "Tienda Actualizada",
    "almacenes": "Almacén Central Lima Norte",
    "estado": "INACTIVO",
    "direccion": "Nueva dirección 456",
    "distrito": "Cayma",
    "provincia": "Arequipa",
    "departamento": "Arequipa"
  },
  "message": "Tienda actualizada exitosamente"
}
```

#### 5. DELETE `/api/tiendas/:id`

Elimina una tienda y sus relaciones con almacenes.

**⚠️ IMPORTANTE:** Al eliminar una tienda, también se eliminan automáticamente todas sus relaciones en la tabla `almacen_tienda` (gracias al `onDelete: Cascade` en el schema de Prisma).

**Response:**
```json
{
  "success": true,
  "message": "Tienda eliminada exitosamente"
}
```

---

### Almacenes

Endpoints específicos para gestión de almacenes.

> **⚠️ NOTA IMPORTANTE - Relación N:M:** 
> Los almacenes ya no tienen un array directo de `tiendasAsociadas`. La relación entre almacenes y tiendas ahora es N:M (muchos a muchos) a través de la tabla `almacen_tienda`.
> - Para asignar tiendas a un almacén, usa: `POST /api/locales/almacen-tienda`
> - Para ver tiendas de un almacén, usa: `GET /api/locales/almacen/:id/tiendas`

#### 1. GET `/api/almacenes`

Obtiene todos los almacenes con paginación y filtros.

**Query Parameters:**
- `page` (opcional, default: 1): Número de página
- `per_page` (opcional, default: 20): Resultados por página
- `nombre` (opcional): Filtrar por nombre
- `estado` (opcional): Filtrar por estado (ACTIVO/INACTIVO)
- `departamento` (opcional): Filtrar por ID de departamento
- `provincia` (opcional): Filtrar por ID de provincia
- `distrito` (opcional): Filtrar por ID de distrito

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Almacén Central Lima Norte",
      "imagen": "https://example.com/alm-lima.jpg",
      "estado": "ACTIVO",
      "id_direccion": 1,
      "id_tipo_local": 1,
      "direccion": {
        "id": 1,
        "referencia": "Av. Larco 1234 - Almacén Central",
        "id_distrito": 1,
        "id_geopoint": 1,
        "distrito": {
          "id": 1,
          "nombre": "Miraflores",
          "id_provincia": 1,
          "provincia": {
            "id": 1,
            "nombre": "Lima",
            "id_departamento": 1,
            "departamento": {
              "id": 1,
              "nombre": "Lima"
            }
          }
        },
        "geopoint": {
          "id": 1,
          "latitud": "-12.1197",
          "longitud": "-77.0352"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 4,
    "total_pages": 1
  }
}
```

**Nota:** Para ver las tiendas asociadas a un almacén, usa `GET /api/locales/almacen/:id/tiendas`

#### 2. GET `/api/almacenes/:id`

Obtiene un almacén específico por su ID con toda su información.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Almacén Central Lima Norte",
    "estado": "ACTIVO",
    "imagen": "https://example.com/alm-lima.jpg",
    "id_direccion": 1,
    "id_tipo_local": 1,
    "direccion": {
      "referencia": "Av. Larco 1234 - Almacén Central",
      "distrito": {
        "nombre": "Miraflores",
        "provincia": {
          "nombre": "Lima",
          "departamento": {
            "nombre": "Lima"
          }
        }
      },
      "geopoint": {
        "latitud": "-12.1197",
        "longitud": "-77.0352"
      }
    }
  }
}
```

**Nota:** Para ver las tiendas de este almacén, usa `GET /api/locales/almacen/1/tiendas`

#### 3. POST `/api/almacenes`

Crea un nuevo almacén con creación automática de dirección y geopoint.

**Request Body:**
```json
{
  "nombre": "Almacén Nuevo",
  "referencia": "Av. Industrial 456, zona industrial",
  "id_distrito": 25,
  "latitud": -12.0464,
  "longitud": -77.0428,
  "estado": "ACTIVO",
  "imagen": "https://example.com/almacen.jpg"
}
```

**Campos:**
- `nombre` (requerido): Nombre del almacén (máx. 30 caracteres)
- `referencia` (requerido): Referencia de la dirección
- `id_distrito` (requerido): ID del distrito
- `latitud` (requerido): Coordenada GPS (-90 a 90)
- `longitud` (requerido): Coordenada GPS (-180 a 180)
- `estado` (opcional, default: "INACTIVO"): "ACTIVO" o "INACTIVO"
- `imagen` (opcional): URL de la imagen

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "nombre": "Almacén Nuevo",
    "estado": "ACTIVO",
    "imagen": "https://example.com/almacen.jpg",
    "direccion": {
      "referencia": "Av. Industrial 456, zona industrial",
      "distrito": {
        "nombre": "Cercado de Lima",
        "provincia": {
          "nombre": "Lima",
          "departamento": {
            "nombre": "Lima"
          }
        }
      }
    }
  },
  "message": "Almacén creado exitosamente"
}
```

**Para asignar tiendas después de crear:**
```bash
POST /api/locales/almacen-tienda
{
  "id_almacen": 16,
  "id_tienda": 5
}
```

#### 4. PUT `/api/almacenes/:id`

Actualiza un almacén existente.

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Almacén Actualizado",
  "estado": "INACTIVO",
  "imagen": "https://example.com/nueva-imagen.jpg",
  "referencia": "Nueva dirección 789",
  "id_distrito": 8,
  "latitud": -12.06,
  "longitud": -77.05
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "nombre": "Almacén Actualizado",
    "estado": "INACTIVO",
    "imagen": "https://example.com/nueva-imagen.jpg",
    "direccion": {
      "referencia": "Nueva dirección 789",
      "distrito": {
        "nombre": "Cayma",
        "provincia": {
          "nombre": "Arequipa"
        }
      }
    }
  },
  "message": "Almacén actualizado exitosamente"
}
```

#### 5. DELETE `/api/almacenes/:id`

Elimina un almacén.

**⚠️ IMPORTANTE:** No se puede eliminar si tiene tiendas asociadas en la tabla `almacen_tienda`.

**Response Exitosa:**
```json
{
  "success": true,
  "message": "Almacén eliminado exitosamente"
}
```

**Response con Error (tiene tiendas asociadas):**
```json
{
  "success": false,
  "message": "No se puede eliminar el almacén porque tiene 3 tiendas asociadas"
}
```

**Nota:** Si necesitas eliminar un almacén con tiendas asociadas, primero elimina las relaciones usando `DELETE /api/locales/almacen-tienda/:id`

---

## ✅ Validaciones

### Campos de Texto

| Campo | Requerido | Tipo | Validación |
|-------|-----------|------|------------|
| `nombre` (departamento/provincia/distrito) | Sí | String | No vacío, máx. 50 caracteres |
| `nombre` (local) | Sí | String | No vacío, máx. 30 caracteres |
| `nombre` (tipo_local) | Sí | String | No vacío, único |
| `referencia` (direccion) | Sí | String | No vacío |
| `descripcion` | No | String | Texto libre |
| `imagen` | No | String | URL válida |
| `estado` | No | String | "ACTIVO" o "INACTIVO" |

### IDs Numéricos

| Campo | Requerido | Tipo | Validación |
|-------|-----------|------|------------|
| `id_departamento` | Sí (provincia) | Integer | Numérico, debe existir |
| `id_provincia` | Sí (distrito) | Integer | Numérico, debe existir |
| `id_distrito` | Sí (direccion/tienda/almacen) | Integer | Numérico, debe existir |
| `id_geopoint` | Sí (direccion) | Integer | Numérico, debe existir, único |
| `id_direccion` | Sí (local) | Integer | Numérico, debe existir, único |
| `id_tipo_local` | Sí (local) | Integer | Numérico, debe existir |
| `id_almacen` | Sí (relación) | Integer | Numérico, debe existir (para crear relación N:M) |
| `id_tienda` | Sí (relación) | Integer | Numérico, debe existir (para crear relación N:M) |

### Coordenadas Geográficas

| Campo | Requerido | Tipo | Rango Válido |
|-------|-----------|------|--------------|
| `latitud` | Sí (geopoint) | Decimal | -90.0 a 90.0 |
| `longitud` | Sí (geopoint) | Decimal | -180.0 a 180.0 |

### Paginación

| Parámetro | Default | Tipo | Rango Válido |
|-----------|---------|------|--------------|
| `page` | 1 | Integer | > 0 |
| `per_page` | 10 | Integer | 1 a 100 |

### Estados Válidos

- `ACTIVO`: El local está operativo
- `INACTIVO`: El local no está operativo (default al crear)

---

## 🚨 Códigos de Error

### Errores HTTP

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| `400` | Bad Request | Parámetros inválidos, validaciones fallidas, restricciones de unicidad |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error del servidor o base de datos |

### Errores de Prisma

#### P2002 - Unique Constraint Violation
```json
{
  "success": false,
  "message": "La dirección ya está asociada a otro local",
  "error": "Unique constraint failed..."
}
```

**Cuándo ocurre:**
- Al crear local con `id_direccion` que ya está asociado a otro local
- Al crear dirección con `id_geopoint` que ya está asociado a otra dirección
- Al crear tipo de local con `nombre` que ya existe

**Solución:**
- Usa una dirección diferente
- Crea un nuevo geopoint
- Usa un nombre único para el tipo de local

#### P2003 - Foreign Key Constraint Failed
```json
{
  "success": false,
  "message": "El id_direccion o id_tipo_local proporcionado no existe",
  "error": "Foreign key constraint failed..."
}
```

**Cuándo ocurre:**
- Al crear/actualizar local con `id_direccion` o `id_tipo_local` que no existe
- Al crear dirección con `id_distrito` o `id_geopoint` que no existe
- Al crear provincia con `id_departamento` que no existe
- Al crear distrito con `id_provincia` que no existe

**Solución:**
- Verifica que el recurso referenciado existe
- Crea el recurso padre antes de crear el hijo

#### P2025 - Record Not Found
```json
{
  "success": false,
  "message": "Local no encontrado",
  "error": "An operation failed because it depends on one or more records that were required but not found."
}
```

**Cuándo ocurre:**
- Al actualizar o eliminar un recurso inexistente
- Al buscar por ID que no existe

**Solución:**
- Verifica que el ID proporcionado es correcto
- Usa GET para listar recursos disponibles

### Errores de Validación Específicos

#### Coordenadas Inválidas
```json
{
  "success": false,
  "message": "latitud debe estar entre -90 y 90"
}
```

#### Dirección/GeoPoint Ya Asociado
```json
{
  "success": false,
  "message": "La dirección ya está asociada a otro local"
}
```

#### Recursos con Dependencias
```json
{
  "success": false,
  "message": "No se puede eliminar el departamento porque tiene provincias asociadas"
}
```

```json
{
  "success": false,
  "message": "No se puede eliminar el almacén porque tiene 2 tiendas asociadas"
}
```

---

## 💡 Ejemplos de Uso

### PowerShell

#### Obtener Todos los Departamentos
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/api/departamentos" -Method GET
```

#### Obtener Provincias de un Departamento
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/api/provincias/departamento/1" -Method GET
```

#### Obtener Distritos de una Provincia
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/api/distritos/provincia/1" -Method GET
```

#### Crear un GeoPoint
```powershell
$body = @{
    latitud = -12.0969
    longitud = -77.0365
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/geopoints" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Crear una Dirección
```powershell
$body = @{
    referencia = "Av. Javier Prado 456, cerca del centro comercial"
    id_distrito = 5
    id_geopoint = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/direcciones" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Crear un Tipo de Local
```powershell
$body = @{
    nombre = "Centro de Distribución"
    descripcion = "Local especializado en logística"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/tipolocales" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Crear un Local
```powershell
$body = @{
    nombre = "Almacén Norte"
    direccion = "Av. Túpac Amaru 456, frente al hospital"
    ubigeo = @{
        distrito = "25"
    }
    estado = "ACTIVO"
    imagen = "https://example.com/almacen.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/locales" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Listar Locales con Paginación
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/api/locales?page=1&per_page=15" -Method GET
```

#### Filtrar Locales por Ubicación
```powershell
# Filtrar por departamento
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?departamento=1" -Method GET

# Filtrar por nombre y distrito
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?nombre=Central&distrito=5" -Method GET
```

#### Obtener Locales por Tipo
```powershell
# Obtener todos los almacenes (tipo_local = 1)
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/tipo/1" -Method GET
```

#### Actualizar un Local
```powershell
$body = @{
    estado = "INACTIVO"
    nombre = "Almacén Norte Actualizado"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/locales/50" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"
```

#### Eliminar un Local
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/50" -Method DELETE
```

### cURL

#### Obtener Direcciones de un Distrito
```bash
curl -X GET "http://localhost:4004/api/direcciones/distrito/1"
```

#### Crear un GeoPoint
```bash
curl -X POST http://localhost:4004/api/geopoints \
  -H "Content-Type: application/json" \
  -d '{
    "latitud": -12.0464,
    "longitud": -77.0428
  }'
```

#### Crear un Local Completo (con creación automática)
```bash
# El endpoint ahora crea todo automáticamente en una sola llamada
curl -X POST http://localhost:4004/api/locales \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Tienda San Isidro",
    "direccion": "Av. Javier Prado 789, cerca del centro comercial",
    "ubigeo": {
      "distrito": "5"
    },
    "estado": "ACTIVO",
    "imagen": "https://example.com/tienda.jpg"
  }'
```

**Nota:** Este endpoint crea automáticamente el GeoPoint, Dirección y Local en una transacción.

#### Filtrar Locales
```bash
curl -X GET "http://localhost:4004/api/locales/filtrar?departamento=1&page=1&per_page=10"
```

#### Ejemplos Específicos de Tiendas y Almacenes

**Crear un Almacén (PowerShell):**
```powershell
$almacen = @{
    nombre = "Almacén Central Lima"
    direccion = "Av. Argentina 1234, cerca del puerto"
    ubigeo = @{
        distrito = "25"
    }
    estado = "ACTIVO"
    imagen = "https://example.com/almacen.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4005/api/almacenes" `
    -Method POST -Body $almacen -ContentType "application/json"
```

**Crear una Tienda asociada a un Almacén (PowerShell):**
```powershell
$tienda = @{
    nombre = "Tienda Miraflores Premium"
    id_almacen = 1
    direccion = "Av. Larco 789"
    ubigeo = @{
        distrito = "1"
    }
    estado = "ACTIVO"
    imagen = "https://example.com/tienda.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4005/api/tiendas" `
    -Method POST -Body $tienda -ContentType "application/json"
```

**Listar todas las Tiendas de un Almacén:**
```powershell
Invoke-RestMethod -Uri "http://localhost:4005/api/tiendas?id_almacen=1" -Method GET
```

**Obtener Almacén con sus Tiendas:**
```powershell
Invoke-RestMethod -Uri "http://localhost:4005/api/almacenes/1" -Method GET
```

**Usar endpoints de Ubicación (consultas rápidas):**
```powershell
# Obtener departamentos
Invoke-RestMethod -Uri "http://localhost:4005/api/ubicacion/departamentos" -Method GET

# Obtener provincias de Lima
Invoke-RestMethod -Uri "http://localhost:4005/api/ubicacion/provincias?id_departamento=1" -Method GET

# Obtener distritos de provincia Lima
Invoke-RestMethod -Uri "http://localhost:4005/api/ubicacion/distritos?id_provincia=1" -Method GET
```

**Filtrar Locales Genéricos:**
```powershell
# Todos los locales
Invoke-RestMethod -Uri "http://localhost:4005/api/locales" -Method GET

# Solo almacenes (tipo_local = 1)
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/tipo/1" -Method GET

# Solo tiendas (tipo_local = 2)
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/tipo/2" -Method GET

# Locales por departamento
Invoke-RestMethod -Uri "http://localhost:4005/api/locales?departamento=1" -Method GET

# Locales por nombre
Invoke-RestMethod -Uri "http://localhost:4005/api/locales?nombre=Central" -Method GET
```

**Gestionar Relaciones Almacén-Tienda (N:M):**

```powershell
# 1. Crear una relación entre almacén y tienda
$relacion = @{
    id_almacen = 1
    id_tienda = 5
} | ConvertTo-Json

$nuevaRelacion = Invoke-RestMethod -Uri "http://localhost:4005/api/locales/almacen-tienda" `
    -Method POST -Body $relacion -ContentType "application/json"

# 2. Obtener todas las tiendas que abastece un almacén
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/almacen/1/tiendas" -Method GET

# 3. Obtener todos los almacenes que abastecen a una tienda
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/tienda/5/almacenes" -Method GET

# 4. Eliminar una relación almacén-tienda
$idRelacion = 6
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/almacen-tienda/$idRelacion" `
    -Method DELETE

# 5. Consultar locales por tipo con relaciones incluidas
# Almacenes con sus tiendas asociadas
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/tipo/1?page=1&per_page=10" -Method GET

# Tiendas con sus almacenes asociados
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/tipo/2?nombre=Premium" -Method GET

# 6. Filtrar con paginación y múltiples criterios
Invoke-RestMethod -Uri "http://localhost:4005/api/locales/tipo/2?departamento=1&nombre=Tienda&page=1&per_page=5" -Method GET
```

**Ejemplos con curl (Bash):**

```bash
# Crear relación almacén-tienda
curl -X POST http://localhost:4005/api/locales/almacen-tienda \
  -H "Content-Type: application/json" \
  -d '{
    "id_almacen": 2,
    "id_tienda": 6
  }'

# Obtener tiendas de un almacén
curl http://localhost:4005/api/locales/almacen/2/tiendas

# Obtener almacenes de una tienda
curl http://localhost:4005/api/locales/tienda/6/almacenes

# Eliminar relación
curl -X DELETE http://localhost:4005/api/locales/almacen-tienda/6

# Listar almacenes con paginación y filtro por nombre
curl "http://localhost:4005/api/locales/tipo/1?nombre=Central&page=1&per_page=5"

# Listar tiendas de un departamento específico
curl "http://localhost:4005/api/locales/tipo/2?departamento=1&per_page=20"
```

---

## 🧪 Testing

### Verificar Salud del Servicio
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/health" -Method GET
```

### Test Completo de Jerarquía Geográfica
```powershell
# 1. Obtener departamentos
$departamentos = Invoke-RestMethod -Uri "http://localhost:4004/api/departamentos" -Method GET
Write-Host "Total de departamentos:" $departamentos.data.Count

# 2. Obtener provincias de Lima
$provincias = Invoke-RestMethod -Uri "http://localhost:4004/api/provincias/departamento/1" -Method GET
Write-Host "Provincias de Lima:" $provincias.data.Count

# 3. Obtener distritos de Lima provincia
$distritos = Invoke-RestMethod -Uri "http://localhost:4004/api/distritos/provincia/1" -Method GET
Write-Host "Distritos de Lima:" $distritos.data.Count
```

### Test Completo de Creación de Local
```powershell
# Con el nuevo endpoint, crear un local es mucho más simple
$local = @{
    nombre = "Test Local"
    direccion = "Calle de Prueba 123"
    ubigeo = @{
        distrito = "1"
    }
    estado = "ACTIVO"
} | ConvertTo-Json

$nuevoLocal = Invoke-RestMethod -Uri "http://localhost:4004/api/locales" `
    -Method POST -Body $local -ContentType "application/json"
Write-Host "Local creado con ID:" $nuevoLocal.data.id
Write-Host "Dirección creada automáticamente con ID:" $nuevoLocal.data.id_direccion
Write-Host "GeoPoint creado automáticamente con ID:" $nuevoLocal.data.direccion.id_geopoint

# Obtener local completo
$localCompleto = Invoke-RestMethod -Uri "http://localhost:4004/api/locales/$($nuevoLocal.data.id)" -Method GET
Write-Host "Local completo obtenido:"
Write-Host "- Nombre:" $localCompleto.data.nombre
Write-Host "- Dirección:" $localCompleto.data.direccion.referencia
Write-Host "- Distrito:" $localCompleto.data.direccion.distrito.nombre
Write-Host "- Provincia:" $localCompleto.data.direccion.distrito.provincia.nombre
Write-Host "- Departamento:" $localCompleto.data.direccion.distrito.provincia.departamento.nombre
Write-Host "- Coordenadas:" $localCompleto.data.direccion.geopoint.latitud "," $localCompleto.data.direccion.geopoint.longitud

# Limpiar (eliminar en orden inverso)
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/$($nuevoLocal.data.id)" -Method DELETE
Invoke-RestMethod -Uri "http://localhost:4004/api/direcciones/$($nuevoLocal.data.id_direccion)" -Method DELETE
Invoke-RestMethod -Uri "http://localhost:4004/api/geopoints/$($nuevoLocal.data.direccion.id_geopoint)" -Method DELETE
Write-Host "Test completado y recursos eliminados"
```

### Test de Filtrado de Locales
```powershell
# Test: Filtrar por nombre
$resultado = Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?nombre=Central" -Method GET
Write-Host "Locales con 'Central' en el nombre:" $resultado.data.Count

# Test: Filtrar por departamento
$resultado = Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?departamento=1" -Method GET
Write-Host "Locales en departamento 1:" $resultado.data.Count

# Test: Filtrar por distrito
$resultado = Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?distrito=5" -Method GET
Write-Host "Locales en distrito 5:" $resultado.data.Count
```

### Test de Validaciones
```powershell
# Test: Crear geopoint con coordenadas inválidas
try {
    $invalid = @{
        latitud = 100  # Inválido
        longitud = -77
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:4004/api/geopoints" `
        -Method POST -Body $invalid -ContentType "application/json"
} catch {
    Write-Host "✓ Validación correcta: latitud fuera de rango"
}

# Test: Crear local sin campos requeridos
try {
    $invalid = @{
        nombre = "Test"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:4004/api/locales" `
        -Method POST -Body $invalid -ContentType "application/json"
} catch {
    Write-Host "✓ Validación correcta: campos requeridos"
}

# Test: ID no numérico
try {
    Invoke-RestMethod -Uri "http://localhost:4004/api/locales/abc" -Method GET
} catch {
    Write-Host "✓ Validación correcta: ID no numérico"
}
```

---

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
# Base de datos (Cloud SQL)
DATABASE_URL="postgresql://user:password@/warehouse_db?host=/cloudsql/project-id:region:instance-name"

# Puerto
PORT=8080

# Entorno
NODE_ENV=production
```

### Docker Build

```bash
# Construir imagen
docker build -t warehouse-service .

# Ejecutar contenedor
docker run -p 4004:4004 --env-file .env warehouse-service
```

### Google Cloud Run

```bash
# Build y push
gcloud builds submit --tag gcr.io/PROJECT_ID/warehouse-service

# Deploy
gcloud run deploy warehouse-service \
  --image gcr.io/PROJECT_ID/warehouse-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME
```

### Script de Despliegue

Usa el script automatizado desde la raíz del proyecto:

```powershell
# Desplegar servicio warehouse
.\deploy-single-service.ps1 -ServiceName warehouse
```

### Verificación Post-Despliegue

```powershell
# Reemplaza con tu URL de Cloud Run
$SERVICE_URL = "https://warehouse-service-xxx.run.app"

# Health check
Invoke-RestMethod -Uri "$SERVICE_URL/health" -Method GET

# Probar endpoints
Invoke-RestMethod -Uri "$SERVICE_URL/api/departamentos" -Method GET
Invoke-RestMethod -Uri "$SERVICE_URL/api/locales?page=1&per_page=5" -Method GET
```

### Monitoreo

Verifica logs en Cloud Run:
```bash
gcloud run services logs read warehouse-service --region us-central1
```

---

## 📚 Documentación Adicional

- **Prisma Schema**: `prisma/schema.prisma`
- **Seed Data**: `prisma/seed.js`
- **Database Guide**: `../../scripts/CLOUD_DATABASE_GUIDE.md`
- **API Endpoints**: `../../scripts/API_ENDPOINTS.md`

---

## 🏗️ Arquitectura del Servicio

```
services/warehouse/
├── src/
│   ├── index.js                       # Servidor Express
│   ├── controllers/
│   │   ├── departamento.controller.js # CRUD departamentos
│   │   ├── provincia.controller.js    # CRUD provincias
│   │   ├── distrito.controller.js     # CRUD distritos
│   │   ├── direccion.controller.js    # CRUD direcciones
│   │   ├── geopoint.controller.js     # CRUD geopoints
│   │   ├── tipolocal.controller.js    # CRUD tipos de local
│   │   └── local.controller.js        # CRUD locales con filtros
│   ├── routes/
│   │   ├── departamento.routes.js     # Rutas departamentos
│   │   ├── provincia.routes.js        # Rutas provincias
│   │   ├── distrito.routes.js         # Rutas distritos
│   │   ├── direccion.routes.js        # Rutas direcciones
│   │   ├── geopoint.routes.js         # Rutas geopoints
│   │   ├── tipolocal.routes.js        # Rutas tipos de local
│   │   └── local.routes.js            # Rutas locales
│   └── database/
│       └── conexion.js                # Prisma Client
├── prisma/
│   ├── schema.prisma                  # Esquema de base de datos
│   └── seed.js                        # Datos iniciales
├── Dockerfile                          # Configuración de Docker
├── docker-entrypoint.sh               # Script de inicio
└── package.json                       # Dependencias

```

---

## 🔧 Troubleshooting

### Error: "El distrito especificado no existe"
**Solución:** Verifica que el distrito existe:
```powershell
Invoke-RestMethod -Uri "http://localhost:4004/api/distritos" -Method GET
```

### Error: "El tipo de local por defecto no existe en la base de datos"
**Solución:** Asegúrate de ejecutar el seed de datos:
```bash
npx prisma db seed
```

### Quiero especificar coordenadas GPS personalizadas
**Situación:** El endpoint POST /api/locales usa coordenadas por defecto.

**Solución:** Si necesitas coordenadas específicas, usa el flujo manual:
```powershell
# 1. Crear GeoPoint con coordenadas específicas
$geopoint = @{
    latitud = -12.1234
    longitud = -77.5678
} | ConvertTo-Json

$nuevoGeopoint = Invoke-RestMethod -Uri "http://localhost:4004/api/geopoints" `
    -Method POST -Body $geopoint -ContentType "application/json"

# 2. Crear Dirección
$direccion = @{
    referencia = "Mi dirección"
    id_distrito = 25
    id_geopoint = $nuevoGeopoint.data.id
} | ConvertTo-Json

$nuevaDireccion = Invoke-RestMethod -Uri "http://localhost:4004/api/direcciones" `
    -Method POST -Body $direccion -ContentType "application/json"

# 3. Crear Local manualmente (usando el endpoint antiguo si está disponible)
# O actualizar las coordenadas del geopoint después de crear el local
```

### Quiero crear un local de tipo "Tienda" en lugar de "Almacén"
**Situación:** POST /api/locales crea automáticamente como tipo "Almacén".

**Solución:** Actualiza el tipo después de crear:
```powershell
# 1. Crear local (se crea como Almacén por defecto)
$local = @{
    nombre = "Mi Tienda"
    direccion = "Calle Principal 123"
    ubigeo = @{ distrito = "5" }
    estado = "ACTIVO"
} | ConvertTo-Json

$nuevoLocal = Invoke-RestMethod -Uri "http://localhost:4004/api/locales" `
    -Method POST -Body $local -ContentType "application/json"

# 2. Actualizar a tipo Tienda (id_tipo_local = 2)
$update = @{
    id_tipo_local = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/locales/$($nuevoLocal.data.id)" `
    -Method PUT -Body $update -ContentType "application/json"
```

### Error: "El geopoint ya está asociado a otra dirección"
**Solución:** Un geopoint solo puede tener una dirección. Crea un nuevo geopoint:
```powershell
$body = @{
    latitud = -12.0500
    longitud = -77.0400
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/api/geopoints" `
    -Method POST -Body $body -ContentType "application/json"
```

### Error: "No se puede eliminar el departamento porque tiene provincias asociadas"
**Solución:** Primero elimina todas las provincias del departamento, luego elimina el departamento.

### Filtrado jerárquico no devuelve resultados esperados
**Solución:** Los filtros son jerárquicos. Si usas `distrito`, ignora `provincia` y `departamento`:
```powershell
# Correcto: filtrar por distrito específico
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?distrito=5" -Method GET

# Si quieres filtrar por provincia, no uses distrito
Invoke-RestMethod -Uri "http://localhost:4004/api/locales/filtrar?provincia=1" -Method GET
```

---

## 📝 Notas Importantes

1. **Jerarquía Geográfica Completa**: Sistema de 3 niveles (Departamento → Provincia → Distrito)
2. **Creación Automática de Locales**: POST /api/locales crea automáticamente GeoPoint, Dirección y Local en una transacción
3. **Coordenadas GPS por Defecto**: Si no se especifican coordenadas, se usan las de Lima, Perú (-12.0464, -77.0428)
4. **Tipo de Local por Defecto**: Los locales se crean automáticamente como "Almacén" (id_tipo_local = 1)
5. **Relación N:M Almacén-Tienda**: Sistema de muchos a muchos - un almacén puede abastecer múltiples tiendas y una tienda puede recibir de múltiples almacenes
6. **Tabla Intermedia AlmacenTienda**: Gestiona las relaciones con constraint único para evitar duplicados
7. **Unicidad Estricta**: Un geopoint = Una dirección = Un local
8. **Relaciones en Cascada**: Eliminar un recurso padre requiere eliminar hijos primero
9. **Endpoints Dedicados de Relaciones**: 4 endpoints específicos para CRUD de relaciones almacén-tienda
10. **Filtrado Jerárquico**: Los filtros de ubicación son excluyentes (distrito > provincia > departamento)
11. **GeoPoints Inmutables**: Una vez creada una dirección, su geopoint no puede cambiar
12. **Direcciones Únicas**: Una dirección solo puede estar asociada a un local
13. **Paginación Completa**: GET /api/locales/tipo/:id con soporte para page, per_page y múltiples filtros
14. **Filtrado Avanzado**: Los filtros se pueden combinar por nombre, departamento, provincia y distrito
15. **Validación de Coordenadas**: Latitud (-90 a 90) y longitud (-180 a 180) con validación estricta
16. **Endpoints Complementarios**: /api/locales (genérico) + /api/tiendas y /api/almacenes (específicos)
17. **Endpoint Ubicación**: /api/ubicacion/* proporciona consultas rápidas para formularios
18. **Estado Default**: Al crear local sin especificar `estado`, se establece como "INACTIVO"
19. **Ubigeo Simplificado**: Solo se usa `ubigeo.distrito`, los campos departamento y provincia se ignoran
20. **Transacciones Atómicas**: Si falla la creación de algún componente, se revierten todos los cambios
21. **Seed Data Completo**: La base de datos incluye toda la geografía del Perú + datos de ejemplo (3 almacenes, 5 tiendas, 5 relaciones)
22. **Validaciones Robustas**: Verificación de existencia antes de crear relaciones y prevención de duplicados
23. **Fecha de Asignación**: Cada relación almacén-tienda incluye timestamp de cuándo se creó la asociación
24. **Relaciones Anidadas en Consultas**: GET /api/locales/tipo/:id incluye automáticamente las relaciones según el tipo de local
25. **Sin Campo id_almacen en Tiendas**: Las tiendas ya no tienen campo directo `id_almacen`. Todas las relaciones ahora son N:M vía tabla intermedia
26. **Creación/Actualización de Tiendas**: POST y PUT /api/tiendas ya NO aceptan `id_almacen`. Usa endpoints de relación dedicados
27. **Validación de Eliminación Mejorada**: Al eliminar almacén, verifica relaciones en `almacen_tienda` en lugar del campo obsoleto
28. **Respuesta con Múltiples Almacenes**: Los endpoints de tiendas ahora muestran campo `almacenes` (plural) con nombres separados por coma

---

**Store Service (Unificado)** - Sistema Integral de Gestión de Tiendas, Almacenes y Ubicaciones  
Puerto: `4005` | Base de Datos: `store` | Framework: Express.js + Prisma  
Versión: 2.2.0 (Controllers actualizados para N:M) | ~51 Endpoints Total (+4 endpoints de relaciones)