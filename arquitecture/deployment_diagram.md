# Diagrama de Despliegue

El siguiente diagrama de Mermaid ilustra la arquitectura de despliegue del sistema en un entorno de desarrollo local utilizando Docker Compose.

```mermaid
graph TD
    subgraph "Docker Host"
        subgraph "Servicios de Aplicación"
            A[reservation-service]
            B[inventory-service]
            C[shipping-service]
            D[store-service]
        end

        subgraph "Bases de Datos"
            DB1[reservation-db (PostgreSQL)]
            DB2[inventory-db (PostgreSQL)]
            DB3[shipping-db (PostgreSQL)]
            DB4[store-db (PostgreSQL)]
        end

        A --"API RESTful (HTTP)"--> B
        A --"API RESTful (HTTP)"--> C
        A --"API RESTful (HTTP)"--> D

        A --"TCP/IP"--> DB1
        B --"TCP/IP"--> DB2
        C --"TCP/IP"--> DB3
        D --"TCP/IP"--> DB4
    end
```

## Descripción

- **Servicios de Aplicación:** Cada microservicio (`reservation-service`, `inventory-service`, `shipping-service`, `store-service`) se ejecuta en su propio contenedor Docker.
- **Bases de Datos:** Cada servicio tiene su propia base de datos PostgreSQL, que también se ejecuta en un contenedor Docker.
- **Comunicación:**
    - El `reservation-service` se comunica con los otros servicios a través de API RESTful sobre HTTP.
    - Cada servicio se comunica con su base de datos dedicada a través de TCP/IP.
- **Orquestación:** Docker Compose se utiliza para orquestar todos los contenedores en un entorno de desarrollo local.