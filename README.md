# 🚀 Proyecto Inventory-Shipping

Bienvenido al proyecto Inventory-Shipping, un sistema de microservicios robusto y escalable diseñado para la gestión integral de inventarios, almacenes, reservas, envíos y tiendas. Construido con Node.js y orquestado con Docker, este proyecto ofrece una arquitectura modular y eficiente para operaciones logísticas complejas.

## � Nuevo: Endpoint para Módulo de Órdenes

El servicio de **Reservas** ahora incluye un endpoint especializado para el módulo de órdenes que permite:
- ✅ **Crear reservas de stock** para múltiples productos
- ✅ **Validar disponibilidad** de stock en tiempo real
- ✅ **Soportar recojo en tienda** o **envío a domicilio**
- ✅ **Validación automática** de tiendas y carriers
- ✅ **Actualización automática** de stock reservado
- ✅ **Rollback automático** en caso de errores

**📖 Documentación completa:**
- [CAMBIOS_ENDPOINT_ORDENES.md](./CAMBIOS_ENDPOINT_ORDENES.md) - Resumen de cambios
- [ARQUITECTURA_RESERVAS.md](./ARQUITECTURA_RESERVAS.md) - Diagramas y flujos
- [EJEMPLOS_INTEGRACION.md](./EJEMPLOS_INTEGRACION.md) - Ejemplos en varios lenguajes
- [services/reservation/ORDERS_API.md](./services/reservation/ORDERS_API.md) - API detallada

**🧪 Testing:** `.\test-reservations-from-order.ps1`

---

## �🌟 Estructura del Proyecto

Nuestro sistema se compone de los siguientes microservicios, cada uno con una responsabilidad clara y bien definida:

- **Inventory Service** (Puerto 4001): 📦 Encargado de la gestión detallada del inventario de productos.
- **Reservation Service** (Puerto 4002): 📝 Gestiona las reservas y la disponibilidad de los productos. ⭐ **¡Nuevo endpoint para órdenes!**
- **Shipping Service** (Puerto 4003): 🚚 Controla todo el proceso de envío y logística de entrega.
- **Store Service** (Puerto 4005): 🏪 Maneja la información de las tiendas y sus ubicaciones geográficas.

## ☁️ Despliegue a Google Cloud Run

Este proyecto está configurado para desplegarse automáticamente en **Google Cloud Run**.

### 🤖 CI/CD Automatizado (NUEVO!)

**Ahora con GitHub Actions:** Cada push se valida automáticamente y se despliega a la nube sin intervención manual.

- **[Arquitectura CI/CD](./docs/ARQUITECTURA_CI_CD.md)** - Cómo funciona el pipeline completo
- **[Resumen de Implementación](./docs/RESUMEN_CI_CD_IMPLEMENTACION.md)** - Qué se implementó y cómo usarlo
- **[Configuración de Secrets](./docs/CONFIGURACION_SECRETS_GITHUB.md)** - Cómo configurar GitHub Actions

### 📘 Guías de Despliegue (Manuales):

- **[Guía Completa de Despliegue](./docs/GUIA_DESPLIEGUE.md)** - Tutorial paso a paso desde instalación hasta despliegue
- **[Cheat Sheet](./docs/CHEAT_SHEET_DESPLIEGUE.md)** - Comandos rápidos para despliegue

### ⚡ Despliegue Rápido (Manual):

```powershell
# Desplegar un servicio específico
.\deploy-single-service.ps1 -ServiceName shipping

# Desplegar todos los servicios
.\deploy-to-cloudrun.ps1
```

**URLs de Producción:**
- Inventory: https://inventory-service-xxxxx-uc.a.run.app
- Reservation: https://reservation-service-xxxxx-uc.a.run.app
- Shipping: https://shipping-service-xxxxx-uc.a.run.app
- Store: https://store-service-xxxxx-uc.a.run.app

---

## 🛠️ Desarrollo Local (Opcional)

Para desarrollo local, asegúrate de tener instaladas las siguientes herramientas:

- [**Docker**](https://www.docker.com/get-started): La plataforma líder para desarrollar, enviar y ejecutar aplicaciones en contenedores.
- [**Docker Compose**](https://docs.docker.com/compose/install/): Una herramienta para definir y ejecutar aplicaciones Docker de múltiples contenedores.

## 🚀 Instalación y Puesta en Marcha

Sigue estos sencillos pasos para configurar y ejecutar el entorno de desarrollo completo:

1.  **Clonar el Repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd inventory-shipping
    ```

2.  **Configuración de Variables de Entorno**:
    Cada microservicio requiere su propio archivo `.env` para la configuración. Copia el archivo de ejemplo (`.env.example`) y personalízalo según tus necesidades.

    Por ejemplo, para el `Inventory Service`:
    ```bash
    cp services/inventory/.env.example services/inventory/.env
    ```
    Repite este paso para cada microservicio que desees activar.

3.  **Construcción y Despliegue con Docker Compose**:
    Desde la raíz del proyecto, ejecuta el siguiente comando para construir las imágenes de Docker y levantar todos los servicios junto con sus bases de datos:
    ```bash
    docker-compose -f infra/docker-compose.dev.yml up --build
    ```
    Este proceso puede tomar unos minutos la primera vez.

4.  **Acceso a los Servicios**:
    Una vez que todos los contenedores estén operativos, podrás interactuar con los microservicios a través de los puertos expuestos. Consulta la documentación específica de cada microservicio para conocer sus endpoints y funcionalidades.

## 🤝 Contribución

¡Tu experiencia es invaluable! Te invitamos a contribuir a la mejora continua de este proyecto. Si deseas unirte, por favor, sigue nuestra guía de contribución:

1.  Realiza un `fork` del repositorio.
2.  Crea una nueva rama para tu funcionalidad o corrección (`git checkout -b feature/tu-funcionalidad`).
3.  Implementa tus cambios, asegurándote de que todas las pruebas pasen y el código cumpla con nuestros estándares de calidad.
4.  Realiza un `commit` descriptivo de tus cambios (`git commit -am 'feat: Descripción concisa de tu contribución'`).
5.  Sube tu rama a tu repositorio `fork` (`git push origin feature/tu-funcionalidad`).
6.  Abre un `Pull Request` detallando tus cambios y su impacto.

## 📚 Documentación de Microservicios

Explora la documentación detallada de cada microservicio para entender sus APIs, modelos de datos y funcionalidades específicas:

- [Inventory Service](./services/inventory/README.md)
- [Reservation Service](./services/reservation/README.md)
- [Shipping Service](./services/shipping/README.md)
- [Store Service](./services/store/README.md)
