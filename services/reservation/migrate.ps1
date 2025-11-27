# Script para aplicar las migraciones de Prisma al servicio de Reservas

Write-Host "🔄 Generando migración de Prisma para el servicio de Reservas..." -ForegroundColor Cyan

# Ir al directorio del servicio de reservas
Set-Location -Path ".\services\reservation"

# Generar la migración
Write-Host "`n📝 Creando migración..." -ForegroundColor Yellow
npx prisma migrate dev --name add_shipping_fields_to_reserva

# Generar el cliente de Prisma
Write-Host "`n🔧 Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n✅ Migración completada exitosamente!" -ForegroundColor Green
Write-Host "Los siguientes campos fueron agregados a la tabla 'reserva':" -ForegroundColor Green
Write-Host "  - tipo_envio (VARCHAR 20, default: 'DOMICILIO')" -ForegroundColor White
Write-Host "  - id_tienda (INTEGER, nullable)" -ForegroundColor White
Write-Host "  - id_carrier (INTEGER, nullable)" -ForegroundColor White
Write-Host "  - direccion_envio (TEXT, nullable)" -ForegroundColor White
Write-Host "  - latitud_destino (DECIMAL(10,8), nullable)" -ForegroundColor White
Write-Host "  - longitud_destino (DECIMAL(11,8), nullable)" -ForegroundColor White

# Volver al directorio raíz
Set-Location -Path "..\..\"

Write-Host "`n📚 Consulta la documentación en:" -ForegroundColor Cyan
Write-Host "  - services/reservation/ORDERS_API.md" -ForegroundColor White
Write-Host "`n🚀 Para instalar axios, ejecuta:" -ForegroundColor Cyan
Write-Host "  cd services/reservation && npm install" -ForegroundColor White
