# API de Cotizaciones de Envío

## Descripción
API para obtener cotizaciones de envío con dos modalidades:
- **Recojo en Tienda**: Gratis, sin costo de envío
- **Envío a Domicilio**: Con múltiples carriers (FedEx, DHL, Servientrega)

## Endpoints

### 1. Obtener Cotizaciones

**POST** `/api/cotizaciones`

Obtiene cotizaciones tanto para recojo en tienda como para envío a domicilio.

#### Request Body

```json
{
  "origen_lat": -12.0464,
  "origen_lng": -77.0428,
  "origen_direccion": "Av. Arequipa 1234, Lima",
  "destino_lat": -12.1022,
  "destino_lng": -77.0211,
  "destino_direccion": "Av. Javier Prado 5678, San Isidro",
  "peso_kg": 2.5,
  "dimensiones": {
    "largo": 40,
    "ancho": 30,
    "alto": 20
  },
  "valor_declarado": 150.00
}
```

**Campos obligatorios:**
- `origen_direccion`: Dirección de origen (String)
- `destino_direccion`: Dirección de destino (String)

**Campos opcionales para envío a domicilio:**
- `origen_lat`, `origen_lng`: Coordenadas de origen (Number)
- `destino_lat`, `destino_lng`: Coordenadas de destino (Number)
- `peso_kg`: Peso del paquete en kilogramos (Number, default: 1)
- `dimensiones`: Dimensiones del paquete en cm (Object, default: {largo: 30, ancho: 30, alto: 30})
- `valor_declarado`: Valor declarado del paquete (Number, default: 0)

**Nota:** Si no se proporcionan coordenadas, solo estará disponible la opción de recojo en tienda.

#### Response

```json
{
  "success": true,
  "distancia_km": 6.64,
  "recojo_tienda": {
    "tipo_envio": "RECOJO_TIENDA",
    "costo_envio": 0,
    "tiempo_estimado_dias": 0,
    "fecha_entrega_estimada": "2025-10-31T06:18:11.517Z",
    "descripcion": "Recoge tu pedido en nuestra tienda sin costo adicional",
    "carrier_nombre": "Recojo en Tienda",
    "disponible": true
  },
  "domicilio": {
    "disponible": true,
    "carriers": [
      {
        "carrier_id": 3,
        "carrier_nombre": "Servientrega",
        "carrier_codigo": "SERV",
        "carrier_tipo": "NACIONAL",
        "logo_url": null,
        "costo_envio": 28.16,
        "tiempo_estimado_dias": 4,
        "fecha_entrega_estimada": "2025-11-04T06:18:11.517Z",
        "peso_maximo_kg": 50,
        "cobertura_nacional": true,
        "cobertura_internacional": false,
        "cotizacion_id": "clx1abc123...",
        "valida_hasta": "2025-11-01T06:18:11.517Z"
      },
      {
        "carrier_id": 1,
        "carrier_nombre": "FedEx Express",
        "carrier_codigo": "FEDEX",
        "carrier_tipo": "INTERNACIONAL",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/9d/FedEx_Express.svg",
        "costo_envio": 47.25,
        "tiempo_estimado_dias": 3,
        "fecha_entrega_estimada": "2025-11-03T06:18:11.517Z",
        "peso_maximo_kg": 68,
        "cobertura_nacional": true,
        "cobertura_internacional": true,
        "cotizacion_id": "clx1def456...",
        "valida_hasta": "2025-11-01T06:18:11.517Z"
      }
    ],
    "total_opciones": 3
  }
}
```

### 2. Listar Carriers Disponibles

**GET** `/api/cotizaciones/carriers/disponibles`

Obtiene la lista de todos los carriers activos.

#### Response

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
      "tarifa_base": 25,
      "tarifa_por_kg": 8.5,
      "tarifa_por_km": 0.15,
      "tiempo_base_dias": 2,
      "cobertura_nacional": true,
      "cobertura_internacional": true,
      "peso_maximo_kg": 68
    }
  ]
}
```

### 3. Obtener Historial de Cotizaciones

**GET** `/api/cotizaciones/historial?limit=50&tipo_envio=DOMICILIO`

Obtiene el historial de cotizaciones realizadas.

#### Query Parameters
- `limit` (opcional): Número máximo de registros (default: 50)
- `tipo_envio` (opcional): Filtrar por tipo (`DOMICILIO` o `RECOJO_TIENDA`)

#### Response

```json
{
  "success": true,
  "total": 10,
  "cotizaciones": [
    {
      "id": "clx1abc123...",
      "origen_lat": -12.0464,
      "origen_lng": -77.0428,
      "origen_direccion": "Av. Arequipa 1234, Lima",
      "destino_lat": -12.1022,
      "destino_lng": -77.0211,
      "destino_direccion": "Av. Javier Prado 5678, San Isidro",
      "distancia_km": 6.64,
      "peso_kg": 2.5,
      "dimensiones": { "largo": 40, "ancho": 30, "alto": 20 },
      "valor_declarado": 150,
      "tipo_envio": "DOMICILIO",
      "carrier_id": 1,
      "carrier_nombre": "FedEx Express",
      "costo_envio": 47.25,
      "tiempo_estimado_dias": 3,
      "fecha_entrega_estimada": "2025-11-03T06:18:11.517Z",
      "cotizacion_valida_hasta": "2025-11-01T06:18:11.517Z",
      "created_at": "2025-10-31T06:18:11.517Z"
    }
  ]
}
```

### 4. Obtener Cotización por ID

**GET** `/api/cotizaciones/:id`

Obtiene una cotización específica por su ID.

#### Response

```json
{
  "success": true,
  "cotizacion": {
    "id": "clx1abc123...",
    "origen_lat": -12.0464,
    // ... resto de campos
  }
}
```

## Ejemplo de Integración en Frontend

### React/Vue/Angular

```javascript
// Obtener cotizaciones
const obtenerCotizaciones = async (datosEnvio) => {
  try {
    const response = await fetch('http://localhost:4003/api/cotizaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origen_lat: datosEnvio.origen.lat,
        origen_lng: datosEnvio.origen.lng,
        origen_direccion: datosEnvio.origen.direccion,
        destino_lat: datosEnvio.destino.lat,
        destino_lng: datosEnvio.destino.lng,
        destino_direccion: datosEnvio.destino.direccion,
        peso_kg: datosEnvio.peso,
        dimensiones: datosEnvio.dimensiones,
        valor_declarado: datosEnvio.valorTotal,
      }),
    });

    const data = await response.json();
    
    // Mostrar opciones al usuario
    console.log('Recojo en tienda:', data.recojo_tienda);
    console.log('Opciones de envío:', data.domicilio.carriers);
    
    return data;
  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error);
  }
};
```

### Flujo Recomendado en el Frontend

1. **Pantalla de Checkout**
   - Usuario selecciona tipo de entrega: "Recojo en Tienda" o "Envío a Domicilio"

2. **Si selecciona "Recojo en Tienda"**
   - Mostrar: "Gratis - Recoge tu pedido en nuestra tienda"
   - No se requiere dirección de envío ni cotización

3. **Si selecciona "Envío a Domicilio"**
   - Solicitar dirección de entrega
   - (Opcional) Obtener coordenadas de la dirección usando Google Maps API
   - Llamar al endpoint `/api/cotizaciones` con los datos
   - Mostrar todas las opciones de carriers ordenadas por precio
   - Usuario selecciona el carrier preferido

4. **Al confirmar la orden**
   - Guardar:
     - `tipo_envio`: "RECOJO_TIENDA" o "DOMICILIO"
     - `cotizacion_id`: ID de la cotización seleccionada (si es envío a domicilio)
     - `carrier_id`: ID del carrier seleccionado (si es envío a domicilio)
     - `costo_envio`: Costo del envío
     - `direccion_destino`: Dirección completa

## Cálculo de Tarifas (Actual - Fake)

Las tarifas se calculan con la siguiente fórmula:

```
costo_total = tarifa_base + (tarifa_por_kg * peso_kg) + (tarifa_por_km * distancia_km)
tiempo_estimado = tiempo_base_dias + (distancia_km / 100)
```

### Tarifas Actuales de Carriers Fake

| Carrier | Tarifa Base | Por KG | Por KM | Tiempo Base |
|---------|-------------|--------|--------|-------------|
| Servientrega | S/. 15 | S/. 5 | S/. 0.10 | 3 días |
| FedEx Express | S/. 25 | S/. 8.50 | S/. 0.15 | 2 días |
| DHL Express | S/. 30 | S/. 9 | S/. 0.18 | 1 día |

## Integración Futura con APIs Reales

El sistema está preparado para integrar APIs reales de carriers. Cuando esto suceda:

1. Las tarifas serán reales y actualizadas
2. Se obtendrán tracking numbers reales
3. Se podrán generar etiquetas de envío
4. Se podrá hacer seguimiento en tiempo real

La estructura de la respuesta seguirá siendo la misma, garantizando compatibilidad con tu frontend.

## URLs para Producción y Desarrollo

**Desarrollo Local:**
```
http://localhost:4003/api/cotizaciones
```

**Producción (Cloud Run):**
```
https://shipping-service-814404078279.us-central1.run.app/api/cotizaciones
```

## Notas Importantes

1. **Recojo en Tienda** siempre está disponible y es gratis
2. **Envío a Domicilio** requiere coordenadas para calcular distancia y costos
3. Las cotizaciones se guardan con validez de 24 horas
4. Los carriers están ordenados por precio (más barato primero)
5. Actualmente todo es fake, pero escalable para integración real

## Soporte

Para dudas o problemas, contacta al equipo de desarrollo.
