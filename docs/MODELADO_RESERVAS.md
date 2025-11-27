# Modelo de Reservas (visión en primera persona)

> Última actualización: 2025-11-08.

## 1. Lo que construí

Yo diseñé el modelo de reservas para que cada bloqueo de stock tenga nombre y apellido:

- **EstadoReserva** guarda la trazabilidad (`PENDING`, `CONFIRMED`, `EXPIRED`, etc.).
- **Reserva** relaciona un `id_stock_producto` de Inventory, la orden externa (`id_orden`) y los metadatos de envío (tienda/carrier, dirección, coordenadas).
- Todos los registros llevan `fecha_reserva` y `fecha_expiracion`. El servicio nunca permite que una reserva viva más de `RESERVATION_MAX_HOURS` (24h por defecto).

## 2. Flujo técnico

1. **Validación de stock:** Antes de crear o actualizar una reserva llamo al Inventory Service (`PUT /api/stock/:id`), resto `stock_disponible` y sumo `stock_reservado`. Si Inventory responde con "Stock insuficiente", devuelvo un `409 Conflict`.
2. **TTL automático:** Si el cliente no envía `fecha_expiracion`, la calculo como `fecha_reserva + RESERVATION_MAX_HOURS`. También rechazo fechas en el pasado o mayores al límite.
3. **Actualizaciones seguras:** Cuando cambia la cantidad o el `id_stock_producto`, primero reservo el nuevo stock y, solo si todo sale bien, libero el anterior. Si algo falla, hago rollback sobre Inventory para no dejar números inconsistentes.
4. **Eliminaciones limpias:** Al borrar una reserva libero inmediatamente su stock reservado, aún si la eliminación se hizo de forma manual.
5. **Cron nocturno:** Cada medianoche, el job `releaseExpiredReservations` marca como `EXPIRED` las reservas vencidas y regresa su stock.

## 3. Cómo ejecutar y probar

```bash
# 1. Levantar los servicios base
docker-compose -f infra/docker-compose.dev.yml up -d reservation-service inventory-service

# 2. Entrar al servicio de reservas
cd services/reservation
npm install
npm run dev

# 3. Crear una reserva (éxito)
curl -X POST http://localhost:4002/api/reservas \
  -H "Content-Type: application/json" \
  -d '{"id_stock_producto":1,"id_orden":9001,"stock_reservado":5,"id_estado":1}'

# 4. Intentar reservar más stock del disponible (409)
curl -X POST http://localhost:4002/api/reservas \
  -H "Content-Type: application/json" \
  -d '{"id_stock_producto":1,"id_orden":9002,"stock_reservado":999,"id_estado":1}'

# 5. Ejecutar manualmente la liberación de expiradas
npm run release:expired
```

> Tips personales:
> - Ajusta `RESERVATION_MAX_HOURS` si necesitas una ventana distinta para pruebas.
> - Activa `RUN_RELEASE_EXPIRED_ON_START=true` cuando quieras validar el cron inmediatamente.

## 4. Interacción con otros servicios

- **Inventory Service:** Es mi fuente de verdad para `stock_disponible` y `stock_reservado`. Todas las reservas tocan este servicio (axios en controladores y `InventoryServiceClient` en el cron). Una reserva es rechazada si Inventory reporta stock insuficiente.
- **Store Service:** Cuando creo reservas desde una orden (`POST /api/reservas/from-order`) valido que la tienda exista y esté activa.
- **Shipping Service:** Para envíos a domicilio confirmo que el carrier esté habilitado y guardo la dirección/geo del destino. Además Shipping lee inventario reservado para calcular cotizaciones realistas.

Con esta arquitectura puedo garantizar que ningún cliente bloquee stock durante más de 24 horas y que siempre exista paridad entre lo reservado en Inventory y lo registrado en la base de datos de reservas.
