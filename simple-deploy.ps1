# Script simple para levantar servicios
Write-Host "Intentando levantar servicios..." -ForegroundColor Yellow

# Primero intentemos solo las bases de datos
Write-Host "Levantando solo las bases de datos primero..." -ForegroundColor Green
docker-compose -f infra/docker-compose.dev.yml up -d reservation-db inventory-db shipping-db store-db

# Esperar que las bases de datos estén listas
Write-Host "Esperando que las bases de datos esten listas..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Ahora intentar los servicios uno por uno
$services = @("inventory-service", "reservation-service", "shipping-service", "store-service")

foreach ($service in $services) {
    Write-Host "Intentando levantar $service..." -ForegroundColor Cyan
    docker-compose -f infra/docker-compose.dev.yml up -d --build $service
    Start-Sleep -Seconds 5
}

# Verificar estado final
Write-Host "Estado final de los servicios:" -ForegroundColor Magenta
docker-compose -f infra/docker-compose.dev.yml ps

Write-Host "Si hay errores, revisa los logs con:" -ForegroundColor Yellow
Write-Host "docker-compose -f infra/docker-compose.dev.yml logs [nombre-servicio]" -ForegroundColor White