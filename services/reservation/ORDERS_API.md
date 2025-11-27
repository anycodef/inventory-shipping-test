# API de Reservas - Endpoint para Órdenes

## Endpoint: Crear Reserva desde Orden

Este endpoint está diseñado específicamente para que el módulo de órdenes pueda realizar reservas de stock de productos.

### URL
```
POST /api/reservas/from-order
```

### Descripción
Crea una o múltiples reservas de stock para una orden, validando:
- Disponibilidad de stock en el inventario
- Existencia y estado de la tienda (si es recojo en tienda)
- Existencia y estado del carrier (si es envío a domicilio)
- Actualiza automáticamente el stock reservado en el servicio de inventario

### Headers
```
Content-Type: application/json
```

### Body Parameters

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id_orden` | Integer | Sí | ID de la orden relacionada |
| `productos` | Array | Sí | Array de productos a reservar |
| `productos[].id_stock_producto` | Integer | Sí | ID del registro en ProductoAlmacen (inventory service) |
| `productos[].cantidad` | Integer | Sí | Cantidad a reservar (debe ser > 0) |
| `tipo_envio` | String | Sí | "RECOJO_TIENDA" o "DOMICILIO" |
| `id_tienda` | Integer | Condicional | Requerido si tipo_envio = "RECOJO_TIENDA" |
| `id_carrier` | Integer | Condicional | Requerido si tipo_envio = "DOMICILIO" |
| `direccion_envio` | String | Condicional | Requerido si tipo_envio = "DOMICILIO". Dirección completa de entrega |
| `latitud_destino` | Decimal | Condicional | Requerido si tipo_envio = "DOMICILIO". Rango: -90 a 90 |
| `longitud_destino` | Decimal | Condicional | Requerido si tipo_envio = "DOMICILIO". Rango: -180 a 180 |
| `fecha_expiracion` | DateTime | No | Fecha de expiración (default: 24 horas desde ahora) |
| `id_estado` | Integer | No | ID del estado de la reserva (default: 1 - Pendiente) |

### Ejemplo de Request

#### Recojo en Tienda
```json
{
  "id_orden": 123,
  "productos": [
    {
      "id_stock_producto": 5,
      "cantidad": 2
    },
    {
      "id_stock_producto": 8,
      "cantidad": 1
    }
  ],
  "tipo_envio": "RECOJO_TIENDA",
  "id_tienda": 3,
  "fecha_expiracion": "2025-11-05T18:00:00Z"
}
```

#### Envío a Domicilio
```json
{
  "id_orden": 124,
  "productos": [
    {
      "id_stock_producto": 12,
      "cantidad": 1
    }
  ],
  "tipo_envio": "DOMICILIO",
  "id_carrier": 2,
  "direccion_envio": "Av. Arequipa 1234, San Isidro, Lima, Perú",
  "latitud_destino": -12.094167,
  "longitud_destino": -77.029722,
  "fecha_expiracion": "2025-11-06T12:00:00Z"
}
```

### Respuesta Exitosa (201 Created)

```json
{
  "message": "Reservas creadas exitosamente",
  "id_orden": 123,
  "tipo_envio": "RECOJO_TIENDA",
  "id_tienda": 3,
  "id_carrier": null,
  "total_productos": 2,
  "fecha_expiracion": "2025-11-05T18:00:00.000Z",
  "reservas": [
    {
      "id": 45,
      "id_stock_producto": 5,
      "id_orden": 123,
      "stock_reservado": 2,
      "fecha_reserva": "2025-11-04T10:30:00.000Z",
      "fecha_expiracion": "2025-11-05T18:00:00.000Z",
      "id_estado": 1,
      "tipo_envio": "RECOJO_TIENDA",
      "id_tienda": 3,
      "id_carrier": null,
      "estado": {
        "id": 1,
        "nombre": "Pendiente",
        "descripcion": "Reserva pendiente de confirmación"
      }
    },
    {
      "id": 46,
      "id_stock_producto": 8,
      "id_orden": 123,
      "stock_reservado": 1,
      "fecha_reserva": "2025-11-04T10:30:00.000Z",
      "fecha_expiracion": "2025-11-05T18:00:00.000Z",
      "id_estado": 1,
      "tipo_envio": "RECOJO_TIENDA",
      "id_tienda": 3,
      "id_carrier": null,
      "estado": {
        "id": 1,
        "nombre": "Pendiente",
        "descripcion": "Reserva pendiente de confirmación"
      }
    }
  ]
}
```

### Errores Comunes

#### 400 - Campos requeridos faltantes
```json
{
  "error": "El campo id_orden es requerido"
}
```

#### 400 - Falta dirección para envío a domicilio
```json
{
  "error": "Para envío a domicilio, el campo direccion_envio es requerido"
}
```

#### 400 - Coordenadas inválidas
```json
{
  "error": "La latitud_destino debe ser un número entre -90 y 90"
}
```

#### 400 - Stock insuficiente
```json
{
  "error": "Stock insuficiente para algunos productos",
  "detalles": [
    {
      "id_stock_producto": 5,
      "solicitado": 10,
      "disponible": 3,
      "error": "Stock insuficiente"
    }
  ]
}
```

#### 404 - Tienda no encontrada
```json
{
  "error": "La tienda con ID 99 no existe"
}
```

#### 400 - Tienda inactiva
```json
{
  "error": "La tienda Tienda Centro no está activa",
  "estado": "INACTIVO"
}
```

#### 404 - Carrier no encontrado
```json
{
  "error": "El carrier con ID 99 no existe"
}
```

#### 400 - Carrier inactivo
```json
{
  "error": "El carrier DHL Express no está activo"
}
```

#### 400 - Producto no existe en inventario
```json
{
  "error": "El producto con ID 99 no existe en el inventario"
}
```

## Flujo de Operación

1. **Validación de datos**: Verifica que todos los campos requeridos estén presentes y sean válidos
2. **Validación de tipo de envío**: 
   - Si es "RECOJO_TIENDA", verifica que la tienda exista y esté activa
   - Si es "DOMICILIO", verifica que el carrier exista y esté activo
3. **Verificación de stock**: Consulta al servicio de inventario para verificar disponibilidad de cada producto
4. **Creación de reservas**: 
   - Actualiza el stock reservado en el servicio de inventario
   - Crea los registros de reserva en la base de datos
5. **Rollback en caso de error**: Si falla alguna reserva, libera el stock de todas las reservas creadas

## Comunicación entre Servicios

Este endpoint realiza comunicación con:

- **Inventory Service** (puerto 4001): Para verificar y actualizar stock
- **Store Service** (puerto 4005): Para validar tiendas
- **Shipping Service** (puerto 4003): Para validar carriers

## Variables de Entorno Requeridas

```env
INVENTORY_SERVICE_URL=http://inventory-service:4001
STORE_SERVICE_URL=http://store-service:4005
SHIPPING_SERVICE_URL=http://shipping-service:4003
```

## Notas Importantes

- El endpoint implementa rollback automático: si falla la creación de alguna reserva, se liberan todas las reservas ya creadas
- La fecha de expiración por defecto es de 24 horas desde la creación
- El stock disponible se reduce y el stock reservado se incrementa automáticamente en el servicio de inventario
- Se valida que la cantidad solicitada sea mayor a 0
- Se valida que haya suficiente stock disponible antes de crear la reserva

### 📦 Datos de Envío Temporales

Los datos de dirección y coordenadas se almacenan **temporalmente** en la tabla de reservas:
- ✅ Se guardan cuando se crea la reserva desde una orden
- ✅ Permanecen mientras la reserva está en estado "Pendiente"
- ⚠️ Si la reserva se cancela, estos datos se eliminan junto con la reserva
- ✅ Cuando se confirma el pago, estos datos se usan para crear el envío real
- 📝 Los campos son: `direccion_envio`, `latitud_destino`, `longitud_destino`

**Importante**: Estos datos son necesarios solo para envío a domicilio. Para recojo en tienda no se requieren.
