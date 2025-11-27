# Guía de Liberación de Reservas Expiradas

> Última actualización: 2025-11-08.

Esta guía describe la funcionalidad que automatiza la liberación del stock asociado a reservas expiradas dentro del microservicio **Reservation**. También explica cómo configurarla, cómo ejecutarla manualmente y cómo se comunica con el resto de servicios del proyecto.

---

## 1. ¿Qué se implementó?
- **Job nocturno** (cron `0 0 * * *`) que corre todos los días a las 00:00 (zona horaria `America/Lima` por defecto).
- **Cliente del Inventory Service** para ajustar `stock_reservado` y `stock_disponible` del producto almacenado.
- **Actualización del estado de la reserva** a `EXPIRED` luego de liberar el stock (el registro se mantiene para auditoría).
- **Script manual** (`npm run release:expired`) para ejecutar el proceso bajo demanda.
- **Variables de entorno adicionales** que permiten personalizar la hora del cron, la zona horaria y la URL del Inventory Service.

---

## 2. Flujo Detallado
1. El job consulta la base de datos y obtiene todas las reservas con `fecha_expiracion` pasada y estado `PENDING` o `CONFIRMED`.
2. Por cada reserva:
   - Si `stock_reservado > 0`, llama a `PUT /api/stock/:id` del Inventory Service para:
     - Restar la cantidad del campo `stock_reservado`.
     - Sumar la misma cantidad al `stock_disponible`.
   - Si la actualización del stock es exitosa, la reserva se marca como `EXPIRED`.
3. Si ocurre algún error al ajustar el inventario, la reserva mantiene su estado original para evitar desbalances.

---

## 3. Configuración

### Variables de Entorno Clave
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `INVENTORY_SERVICE_URL` | URL base del Inventory Service. | `http://inventory-service:4001` |
| `RELEASE_EXPIRED_RESERVATIONS_CRON` | Expresión cron (`node-cron`) para programar la tarea. | `0 0 * * *` |
| `RELEASE_EXPIRED_RESERVATIONS_TZ` | Zona horaria utilizada por el cron. | `America/Lima` |
| `RUN_RELEASE_EXPIRED_ON_START` | Si es `true`, ejecuta el proceso una vez al iniciar el servicio (útil en QA). | `false` |
| `INVENTORY_SERVICE_TIMEOUT` | Timeout máximo (ms) para las llamadas HTTP al Inventory Service. | `8000` |

> Todas estas variables pueden definirse en el despliegue (Docker Compose, Cloud Run, etc.).  
> En `infra/docker-compose.dev.yml` el `INVENTORY_SERVICE_URL` ya está configurado para entornos locales.

---

## 4. Ejecución

### 4.1 Automática (cron)
No requiere intervención. Al levantar el microservicio de reservas el cron se programa automáticamente y se ejecuta todos los días a medianoche.

### 4.2 Manual (script)
```bash
cd services/reservation
npm install          # si aún no se han instalado dependencias
npm run release:expired
```
El script muestra por consola cuántas reservas expiradas se encontraron y cuántas liberaron stock correctamente. Es ideal para entornos de prueba o para ejecutar la tarea sin esperar al cron.

---

## 5. Interacción con Otros Servicios
- **Inventory Service**: Se consume el endpoint `PUT /api/stock/:id`. Es indispensable que el `id_stock_producto` de la reserva exista en inventario y que el servicio esté accesible.
- **Shipping / Store**: No interactúan directamente con este job, pero se benefician porque el stock liberado vuelve a estar disponible para nuevas órdenes y envíos.
- **Base de datos Reservation**: Se requiere que los estados `PENDING`, `CONFIRMED` y `EXPIRED` existan. El seed oficial los genera automáticamente.

---

## 6. Recomendaciones
- Monitorear logs del cron para detectar reservas que fallen al liberar stock.
- Activar `RUN_RELEASE_EXPIRED_ON_START=true` en ambientes de QA para validar la funcionalidad tras desplegar.
- Mantener sincronizados los seeds de Inventory y Reservation para asegurar que `id_stock_producto` referencie registros válidos.

---

¿Dudas o mejoras? Revisa también `services/reservation/README.md` para más contexto y abre un issue en el repositorio si necesitas soporte adicional.
