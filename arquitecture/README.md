# Arquitectura del sistema

## Vision general
- El proyecto se organiza como un conjunto de microservicios Node.js independientes (`inventory`, `reservation`, `shipping`, `store`), cada uno con su propio codigo, dependencias y ciclo de despliegue.
- Cada servicio expone una API REST sobre Express y define puntos de salud (`/health`) para integraciones con plataformas gestionadas como Cloud Run.
- Prisma actua como capa de acceso a datos en todos los servicios y se genera durante el proceso de build dentro de los containers.

## Microservicios y dominios
- **Inventory Service (`services/inventory`)**: administra stock de productos, movimientos y tipos de movimiento. Publica rutas bajo `/api/stock`, `/api/movimiento` y `/api/tipomovimiento`.
- **Reservation Service (`services/reservation`)**: gestiona reservas y estados asociados. Sus endpoints principales se encuentran en `/api/reservas` y `/api/estado`.
- **Shipping Service (`services/shipping`)**: orquesta transportistas y envios mediante rutas `/api/carrier` y `/api/shipping`.
- **Store Service (`services/store`)**: expone informacion de tiendas, almacenes y capas geograficas heredadas del contexto de warehouse, agrupadas en rutas `/api` y `/api/*` especificas (departamentos, provincias, distritos, locales, geopoints, etc.).
- Cada servicio reutiliza el mismo patron de arranque (`src/index.js`): carga de variables con `dotenv`, habilitacion de CORS, parseo de JSON y registro de modulos de rutas desacoplados.

## Persistencia
- El `docker-compose` localizado en `infra/docker-compose.dev.yml` provisiona una base de datos PostgreSQL dedicada por microservicio (`inventory-db`, `reservation-db`, `shipping-db`, `store-db`).
- Las credenciales y URLs se inyectan via variables de entorno definidas en cada servicio (`DATABASE_URL`, `PORT`, etc.), fomentando el aislamiento de datos y la escalabilidad horizontal.
- Los volumenes `pgdata_*` persisten datos durante sesiones locales de desarrollo.

## Contenedores y despliegue
- Cada servicio provee un `Dockerfile` basado en `node:18-alpine` que instala dependencias, genera el cliente Prisma y prepara un `docker-entrypoint.sh` comun para ejecutar migraciones o seeds antes de iniciar.
- La orquestacion local se realiza con Docker Compose, exponiendo puertos 4001-4005 para las APIs y 5433-5437 para las bases de datos.
- Los scripts de despliegue (`deploy-to-cloudrun.ps1`, `deploy-single-service.ps1`) y los endpoints de salud reflejan la intencion de desplegar cada microservicio de forma independiente en infraestructura administrada.

## Configuracion y productividad
- Cada servicio incluye un `README.md`, plantillas `.env.example` y guias de seeding en `scripts/` para facilitar configuracion reproducible.
- El repositorio raiz ofrece comandos unificados para levantar todo el entorno (`docker-compose -f infra/docker-compose.dev.yml up --build`), manteniendo coherencia entre equipos.
