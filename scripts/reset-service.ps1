# Script para resetear un servicio especifico
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("inventory", "reservation", "shipping", "store")]
    [string]$Service
)

Write-Host "Reseteando servicio: $Service" -ForegroundColor Cyan

$serviceConfig = @{
    "inventory" = @{DB = "inventory-db"; Container = "inventory-service"; Volume = "infra_inventory_db_data"}
    "reservation" = @{DB = "reservation-db"; Container = "reservation-service"; Volume = "infra_reservation_db_data"}
    "shipping" = @{DB = "shipping-db"; Container = "shipping-service"; Volume = "infra_shipping_db_data"}
    "store" = @{DB = "store-db"; Container = "store-service"; Volume = "infra_store_db_data"}
}

$config = $serviceConfig[$Service]

Write-Host "[1/5] Deteniendo servicios..." -ForegroundColor Yellow
docker-compose -f infra/docker-compose.dev.yml stop $config.Container
docker-compose -f infra/docker-compose.dev.yml stop $config.DB

Write-Host "[2/5] Eliminando contenedores..." -ForegroundColor Yellow
docker-compose -f infra/docker-compose.dev.yml rm -f $config.Container
docker-compose -f infra/docker-compose.dev.yml rm -f $config.DB

Write-Host "[3/5] Eliminando volumen..." -ForegroundColor Yellow
docker volume rm $config.Volume -f 2>$null

Write-Host "[4/5] Levantando base de datos..." -ForegroundColor Yellow
docker-compose -f infra/docker-compose.dev.yml up -d $config.DB
Start-Sleep -Seconds 10

Write-Host "[5/5] Levantando servicio..." -ForegroundColor Yellow
docker-compose -f infra/docker-compose.dev.yml up -d $config.Container
Start-Sleep -Seconds 10

Write-Host "Logs del servicio:" -ForegroundColor Cyan
docker logs $config.Container --tail 30

Write-Host "RESET COMPLETADO" -ForegroundColor Green
