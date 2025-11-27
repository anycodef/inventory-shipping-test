# Script para probar la cotizacion con busqueda de tiendas
# Verifica que el endpoint POST /api/cotizaciones retorne las tiendas mas cercanas con stock

Write-Host "Probando cotizacion con busqueda de tiendas cercanas..." -ForegroundColor Cyan
Write-Host ""

# Endpoint
$endpoint = "http://localhost:4003/api/cotizaciones"

# Datos de prueba - Solicitar cotizacion a Lima desde Trujillo
$body = @{
    destino_lat = -12.0464
    destino_lng = -77.0428
    destino_direccion = "Av. Javier Prado 123, San Isidro, Lima"
    productos = @(
        @{
            id_producto = 101
            cantidad = 2
        },
        @{
            id_producto = 102
            cantidad = 1
        }
    )
    peso_kg = 3.5
    dimensiones = @{
        largo = 40
        ancho = 30
        alto = 20
    }
    valor_declarado = 250.00
} | ConvertTo-Json -Depth 10

Write-Host "Destino: Lima (-12.0464, -77.0428)" -ForegroundColor Yellow
Write-Host "Productos: 2 items" -ForegroundColor Yellow
Write-Host "Peso: 3.5 kg" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Enviando solicitud..." -ForegroundColor Green
    $response = Invoke-RestMethod -Uri $endpoint -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "Cotizacion obtenida exitosamente!" -ForegroundColor Green
    Write-Host ""
    
    # Verificar estructura de respuesta
    Write-Host "ESTRUCTURA DE LA RESPUESTA:" -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
    
    if ($response.success) {
        Write-Host "[OK] success: $($response.success)" -ForegroundColor Green
        Write-Host "[OK] distancia_km: $($response.distancia_km) km" -ForegroundColor Green
    }
    
    # Verificar almacen origen
    if ($response.almacen_origen) {
        Write-Host ""
        Write-Host "ALMACEN ORIGEN:" -ForegroundColor Yellow
        Write-Host "  ID: $($response.almacen_origen.id)" -ForegroundColor White
        Write-Host "  Nombre: $($response.almacen_origen.nombre)" -ForegroundColor White
        Write-Host "  Direccion: $($response.almacen_origen.direccion)" -ForegroundColor White
        Write-Host "  Coordenadas: ($($response.almacen_origen.latitud), $($response.almacen_origen.longitud))" -ForegroundColor White
    }
    
    # Verificar RECOJO EN TIENDA
    Write-Host ""
    Write-Host "RECOJO EN TIENDA:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    if ($response.recojo_tienda) {
        $recojo = $response.recojo_tienda
        
        Write-Host "  Tipo: $($recojo.tipo_envio)" -ForegroundColor White
        Write-Host "  Costo: S/ $($recojo.costo_envio)" -ForegroundColor White
        Write-Host "  Tiempo estimado: $($recojo.tiempo_estimado_dias) dias" -ForegroundColor White
        Write-Host "  Disponible: $($recojo.disponible)" -ForegroundColor $(if ($recojo.disponible) { "Green" } else { "Red" })
        Write-Host "  Mensaje: $($recojo.mensaje)" -ForegroundColor White
        Write-Host ""
        
        if ($recojo.tiendas -and $recojo.tiendas.Count -gt 0) {
            Write-Host "  TIENDAS DISPONIBLES: $($recojo.tiendas.Count)" -ForegroundColor Green
            Write-Host ""
            
            foreach ($tienda in $recojo.tiendas) {
                Write-Host "    Tienda: $($tienda.nombre)" -ForegroundColor Yellow
                Write-Host "       ID: $($tienda.id)" -ForegroundColor Gray
                Write-Host "       Direccion: $($tienda.direccion)" -ForegroundColor Gray
                Write-Host "       Coordenadas: ($($tienda.latitud), $($tienda.longitud))" -ForegroundColor Gray
                Write-Host "       Distancia: $($tienda.distancia_km) km" -ForegroundColor Gray
                
                if ($tienda.imagen) {
                    Write-Host "       Imagen: $($tienda.imagen)" -ForegroundColor Gray
                }
                Write-Host ""
            }
            
            # Validar campos requeridos
            Write-Host "  VALIDACION DE CAMPOS:" -ForegroundColor Green
            $camposRequeridos = @('id', 'nombre', 'imagen', 'direccion', 'latitud', 'longitud', 'distancia_km')
            $primeraTienda = $recojo.tiendas[0]
            
            foreach ($campo in $camposRequeridos) {
                $existe = $primeraTienda.PSObject.Properties.Name -contains $campo
                $icono = if ($existe) { "[OK]" } else { "[X]" }
                $color = if ($existe) { "Green" } else { "Red" }
                $texto = if ($existe) { "Presente" } else { "FALTA" }
                Write-Host "    $icono Campo '$campo': $texto" -ForegroundColor $color
            }
        } else {
            Write-Host "  No hay tiendas disponibles con stock" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  No se encontro informacion de recojo en tienda" -ForegroundColor Red
    }
    
    # Verificar DOMICILIO
    Write-Host ""
    Write-Host "ENVIO A DOMICILIO:" -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
    
    if ($response.domicilio) {
        $domicilio = $response.domicilio
        
        Write-Host "  Disponible: $($domicilio.disponible)" -ForegroundColor $(if ($domicilio.disponible) { "Green" } else { "Red" })
        
        if ($domicilio.disponible -and $domicilio.carriers) {
            Write-Host "  Total carriers: $($domicilio.carriers.Count)" -ForegroundColor White
            Write-Host ""
            
            foreach ($carrier in $domicilio.carriers) {
                Write-Host "    $($carrier.carrier_nombre) ($($carrier.carrier_codigo))" -ForegroundColor Yellow
                Write-Host "       Costo: S/ $($carrier.costo_envio)" -ForegroundColor Gray
                Write-Host "       Tiempo: $($carrier.tiempo_estimado_dias) dias" -ForegroundColor Gray
                Write-Host "       Entrega estimada: $($carrier.fecha_entrega_estimada)" -ForegroundColor Gray
                Write-Host ""
            }
        } else {
            Write-Host "  Mensaje: $($domicilio.mensaje)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "PRUEBA COMPLETADA CON EXITO" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
} catch {
    Write-Host "Error al obtener cotizacion:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Detalles del error:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
}

Write-Host ""
