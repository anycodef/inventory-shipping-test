# Contenido para Presentación: Pruebas Unitarias en Microservicios

A continuación se detalla el contenido sugerido para cada diapositiva de la presentación, enfocado en explicar técnicamente el trabajo de aseguramiento de calidad realizado.

---

## Slide 1: Estrategia de Pruebas Unitarias

**Título:** Estrategia de Testing: Aislamiento y Mocking Profesional

**Puntos Clave:**
*   **Enfoque:** Pruebas unitarias puras, enfocadas en validar la lógica de negocio de los controladores de forma aislada.
*   **Aislamiento:** Se desacoplaron totalmente los controladores de sus dependencias externas (Base de Datos/Prisma y Microservicios HTTP).
*   **Herramientas:**
    *   `Jest`: Framework de pruebas estándar en la industria.
    *   `jest-mock-extended`: Para simulación tipada y profunda del cliente Prisma.
    *   `jest.unstable_mockModule`: Técnica avanzada para mockear módulos ES Modules (ESM) nativos.

**Explicación Técnica:**
"Para garantizar la fiabilidad sin depender de infraestructura real (como una BD levantada), utilizamos mocks. Esto permite simular escenarios de éxito, error y casos borde (como fallos de red o datos corruptos) de manera determinista y rápida."

---

## Slide 2: Cobertura del Servicio Inventory

**Título:** Servicio Inventory: Cobertura Completa de Controladores

**Puntos Clave:**
*   **Alcance:** 100% de los controladores probados (`movement`, `stockProduct`, `producto_local`, etc.).
*   **Casos de Prueba (48 tests):**
    *   Gestión de movimientos de inventario (entradas/salidas).
    *   Validación de stock negativo y reglas de negocio.
    *   Carga masiva de productos vía CSV (mockeando el sistema de archivos `fs`).
*   **Desafío Resuelto:** Mocking de dependencias internas como `csvParser` y modelos de datos complejos.

---

## Slide 3: Servicio Reservation y Orquestación

**Título:** Servicio Reservation: Probando Lógica Compleja de Negocio

**Puntos Clave:**
*   **Desafío:** Este servicio orquesta llamadas a otros microservicios (`Inventory`, `Store`, `Shipping`).
*   **Solución:** Se implementaron mocks de `axios` y servicios internos para simular la comunicación entre microservicios.
*   **Escenarios Críticos Probados:**
    *   `createReservationFromOrder`: Validación de flujo completo (verificar tienda, verificar stock, reservar).
    *   Manejo de transacciones distribuidas simuladas (rollback de stock si falla la reserva).
    *   Manejo de errores de red o servicios no disponibles (404, 500).

---

## Slide 4: Servicio Shipping y Validaciones

**Título:** Servicio Shipping: Integridad de Datos y Cotizaciones

**Puntos Clave:**
*   **Validaciones de Integridad:** Se probó que no se puedan eliminar transportistas (`Carriers`) si tienen envíos asociados (Restricción de Clave Foránea simulada).
*   **Cálculo de Fechas:** Verificación de lógica de fechas futuras para expiración de envíos.
*   **Mocking de Servicios:** Pruebas del controlador de `Cotizacion` simulando respuestas del servicio de lógica de negocio.

---

## Slide 5: Servicio Store y Transaccionalidad

**Título:** Servicio Store: Integridad Transaccional

**Puntos Clave:**
*   **Transacciones:** Se validó la creación atómica de Tiendas, que implica crear registros en 3 tablas simultáneamente (`Local`, `Direccion`, `GeoPoint`).
*   **Técnica:** Se utilizó `prisma.$transaction.mockImplementation` para asegurar que si una parte falla, todo el proceso se revierte (simulado en el test).
*   **Geoespacial:** Validación de coordenadas (latitud/longitud) y relaciones jerárquicas (Distrito -> Provincia -> Departamento).

---

## Slide 6: Métricas y Resultados

**Título:** Resultados del Ciclo de Pruebas

**Puntos Clave:**
*   **Total de Tests:** +110 pruebas unitarias ejecutadas.
*   **Estado:** 100% Pasando (Green Build).
*   **Tecnología:** Soporte completo para ES Modules (Node.js moderno) en el entorno de pruebas.
*   **Valor Agregado:** Detección temprana de errores de lógica (ej. validaciones faltantes en creación de almacenes) y documentación viva del comportamiento esperado del sistema.
