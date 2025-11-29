# Reporte de Pruebas Unitarias - Servicio Shipping

## Resumen Ejecutivo

Este reporte documenta las pruebas unitarias realizadas para el servicio de `shipping`, encargado de la gestión de carriers, cotizaciones y envíos.

## Estrategia de Pruebas

Se ha seguido una estrategia consistente con los otros servicios, priorizando el aislamiento y el mocking.

1.  **Aislamiento de Controladores:** Se han creado pruebas para `CarrierController` aislando la interacción con la base de datos a través de mocks de Prisma.
2.  **Validaciones de Negocio:** Se han probado exhaustivamente las reglas de negocio para la gestión de transportistas (carriers), como la validación de nombres únicos, tarifas válidas y restricciones de integridad referencial (no eliminar carriers con envíos asociados).

## Cobertura de Código

Se ha alcanzado una cobertura significativa para `CarrierController` (~60% de líneas), validando los métodos CRUD principales.

### Detalles de Pruebas (`CarrierController`)

*   **Gestión de Transportistas:**
    *   **Listado:** Verificación de recuperación de datos ordenada.
    *   **Creación:** Validación de entradas (nombre no vacío, tarifa positiva) y manejo de conflictos (nombres duplicados).
    *   **Actualización:** Verificación de actualización parcial y manejo de errores (no encontrado).
    *   **Eliminación:** Validación crítica de integridad: se impide la eliminación de un carrier si ya tiene envíos asociados, protegiendo la integridad histórica de los datos.

## Conclusiones

Las pruebas implementadas aseguran que la gestión fundamental de los transportistas es robusta y resistente a errores comunes y violaciones de integridad de datos.
