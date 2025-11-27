# Script para arreglar y levantar los servicios
Write-Host "Arreglando servicios..." -ForegroundColor Yellow

# Detener todos los contenedores
Write-Host "Deteniendo servicios existentes..." -ForegroundColor Red
docker-compose -f infra/docker-compose.dev.yml down

# Limpiar contenedores e imágenes previas
Write-Host "Limpiando contenedores e imagenes previas..." -ForegroundColor Yellow
docker system prune -f
docker rmi -f infra-inventory-service infra-reservation-service infra-shipping-service infra-store-service 2>$null

# Verificar permisos de docker-entrypoint.sh en Windows (usando WSL si está disponible)
$services = @("inventory", "reservation", "shipping", "store")

foreach ($service in $services) {
    $entrypointPath = "services/$service/docker-entrypoint.sh"
    if (Test-Path $entrypointPath) {
        Write-Host "Verificando permisos para $service..." -ForegroundColor Green
        # En Windows, asegurar que el archivo tenga terminaciones de línea Unix
        $content = Get-Content $entrypointPath -Raw
        $content = $content -replace "`r`n", "`n"
        Set-Content $entrypointPath -Value $content -NoNewline
    } else {
        Write-Host "Archivo docker-entrypoint.sh no encontrado para $service" -ForegroundColor Red
    }
}

# Reconstruir y levantar servicios
Write-Host "Reconstruyendo y levantando servicios..." -ForegroundColor Green
docker-compose -f infra/docker-compose.dev.yml up --build -d

# Esperar un momento y verificar estado
Start-Sleep -Seconds 10
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
docker-compose -f infra/docker-compose.dev.yml ps

Write-Host "URLs para tu frontend local:" -ForegroundColor Magenta
Write-Host "VITE_API_LOCAL=http://localhost:4005/api" -ForegroundColor White
Write-Host "VITE_API_INVENTORY=http://localhost:4001/api" -ForegroundColor White
Write-Host "VITE_API_RESERVATION=http://localhost:4002/api" -ForegroundColor White
Write-Host "VITE_API_SHIPPING=http://localhost:4003/api" -ForegroundColor White