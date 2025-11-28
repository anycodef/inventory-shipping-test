# Reporte de Pruebas Unitarias - Servicio Reservation

## Resumen Ejecutivo

Este documento presenta los resultados de la implementación de pruebas unitarias para el servicio de `reservation`. Este servicio maneja lógica crítica de negocio relacionada con la reserva de inventario y la orquestación de pedidos.

## Estrategia de Pruebas

Se ha implementado una estrategia de pruebas unitarias que aísla completamente el controlador de sus dependencias externas.

1.  **Mocking de Servicios Externos:** El controlador de reservaciones orquesta llamadas a `inventoryService`, `storeService` y `shippingService`. Estos servicios actúan como clientes HTTP o lógica de negocio compleja. Para las pruebas unitarias, se han mockeado completamente estos módulos, permitiendo simular respuestas exitosas y fallos sin realizar llamadas de red reales.
2.  **Prisma Mocking:** Al igual que en el servicio de inventario, se utilizó `jest-mock-extended` para simular la base de datos.
3.  **Lógica Compleja de Negocio:** Se prestó especial atención a la función `createReservationFromOrder`, que contiene una lógica compleja de validación cruzada (verificando tiendas, carriers, stock y calculando expiraciones). Las pruebas cubren tanto el flujo de "Recojo en Tienda" como el manejo de errores en validaciones externas.

## Cobertura de Código

Se han cubierto los flujos principales del `ReservationController`:

*   **CRUD Básico:** `getAllReservation`, `getReservationById`, `createReservation`.
*   **Orquestación Compleja:** `createReservationFromOrder`.

### Detalles de Pruebas Relevantes

*   **createReservationFromOrder:**
    *   Se validó que el sistema maneje correctamente la creación de reservas cuando el usuario elige recoger en tienda.
    *   Se simuló la interacción con el servicio de inventario para verificar la disponibilidad de stock.
    *   Se probó el manejo de errores cuando una tienda no existe (validación externa).
*   **Gestión de Inventario:**
    *   Las pruebas verifican que se llame a `inventoryService.reserveStock` con los parámetros correctos.
    *   Se verifica el comportamiento ante falta de stock (`INSUFFICIENT_STOCK`), asegurando que el controlador responda con el código HTTP apropiado (409 Conflict).

## Conclusiones

Las pruebas unitarias confirman que la lógica de orquestación de reservas funciona correctamente bajo aislamiento. La capacidad de simular respuestas de microservicios externos es clave para la estabilidad de este servicio.
