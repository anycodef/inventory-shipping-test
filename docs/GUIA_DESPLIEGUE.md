# 📘 Guía Completa de Despliegue a Google Cloud Run

> **Para:** Desarrolladores del equipo Scrum  
> **Objetivo:** Aprender a desplegar servicios sin ayuda  
> **Tiempo estimado:** 30-45 minutos (primera vez)

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#1-prerrequisitos)
2. [Instalación de Herramientas](#2-instalación-de-herramientas)
3. [Configuración Inicial](#3-configuración-inicial)
4. [Cómo Desplegar](#4-cómo-desplegar)
5. [Verificar el Despliegue](#5-verificar-el-despliegue)
6. [Solución de Problemas](#6-solución-de-problemas)
7. [Comandos Útiles](#7-comandos-útiles)

---

## 1. Prerrequisitos

Antes de empezar, asegúrate de tener:

- ✅ Acceso al proyecto de Google Cloud: `secure-potion-474303-j7`
- ✅ Cuenta de Gmail agregada como miembro del proyecto
- ✅ Windows 10/11 (para PowerShell)
- ✅ Conexión a Internet estable
- ✅ Al menos 5 GB de espacio libre en disco

---

## 2. Instalación de Herramientas

### 📦 Paso 1: Instalar Docker Desktop

#### ¿Por qué Docker?
Docker empaqueta el código en contenedores para que funcionen igual en cualquier lugar.

#### Instalación:

1. **Descargar Docker Desktop:**
   - Ve a: https://www.docker.com/products/docker-desktop/
   - Clic en **"Download for Windows"**
   - Descarga el instalador (≈500 MB)

2. **Instalar Docker:**
   ```
   - Ejecuta el instalador descargado
   - Acepta los términos y condiciones
   - Asegúrate de marcar "Use WSL 2 instead of Hyper-V"
   - Clic en "Ok" → Espera la instalación (5-10 min)
   - Reinicia tu computadora cuando lo pida
   ```

3. **Verificar instalación:**
   - Abre **PowerShell** (Windows + X → Windows PowerShell)
   - Ejecuta:
   ```powershell
   docker --version
   ```
   - Deberías ver algo como: `Docker version 24.0.x`

4. **Iniciar Docker Desktop:**
   - Abre Docker Desktop desde el menú de inicio
   - Espera a que aparezca "Engine running" en verde
   - Acepta el acuerdo de servicio si te lo pide

---

### ☁️ Paso 2: Instalar Google Cloud SDK

#### ¿Por qué Google Cloud SDK?
Permite desplegar servicios a Google Cloud desde tu terminal.

#### Instalación:

1. **Descargar el instalador:**
   - Ve a: https://cloud.google.com/sdk/docs/install
   - Clic en **"Windows"**
   - Descarga el instalador (≈80 MB)

2. **Ejecutar instalador:**
   ```
   - Doble clic en el instalador descargado
   - Acepta los términos
   - Instalar para "Usuario actual"
   - Deja todas las opciones marcadas por defecto
   - Clic en "Instalar"
   - Al finalizar, marca las 3 casillas:
     ✓ Start Google Cloud SDK Shell
     ✓ Run 'gcloud init'
     ✓ Documentation (opcional)
   - Clic en "Finish"
   ```

3. **Configurar Google Cloud SDK:**
   
   Se abrirá una ventana de terminal, sigue estos pasos:

   ```
   1. Aparece: "You must log in to continue"
      → Escribe: Y
      → Presiona Enter
   
   2. Se abrirá tu navegador
      → Inicia sesión con tu cuenta de Gmail
      → Clic en "Permitir"
   
   3. En el terminal pregunta: "Pick cloud project to use:"
      → Busca: secure-potion-474303-j7
      → Escribe el número correspondiente
      → Presiona Enter
   
   4. Pregunta: "Do you want to configure a default region?"
      → Escribe: Y
      → Busca: us-central1
      → Escribe el número
      → Presiona Enter
   ```

4. **Verificar instalación:**
   
   Abre **PowerShell** nuevo y ejecuta:
   ```powershell
   gcloud --version
   ```
   
   Deberías ver:
   ```
   Google Cloud SDK 450.0.0
   bq 2.0.x
   core 2023.xx.xx
   gsutil 5.x
   ```

5. **Autenticar Docker con Google Cloud:**
   
   En PowerShell, ejecuta:
   ```powershell
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```
   
   Cuando pregunte, escribe: `Y`

---

### 🔧 Paso 3: Clonar el Repositorio

1. **Abrir PowerShell:**
   - Windows + X → Windows PowerShell

2. **Navegar a tu carpeta de proyectos:**
   ```powershell
   cd C:\Users\TU_USUARIO\Documents
   ```
   
   ⚠️ Reemplaza `TU_USUARIO` con tu nombre de usuario de Windows

3. **Clonar el repositorio:**
   ```powershell
   git clone https://github.com/202W0807-Taller-Web/inventory-shipping.git
   ```

4. **Entrar al directorio:**
   ```powershell
   cd inventory-shipping
   ```

5. **Verificar que estás en el directorio correcto:**
   ```powershell
   ls
   ```
   
   Deberías ver:
   ```
   services/
   infra/
   deploy-single-service.ps1
   deploy-to-cloudrun.ps1
   README.md
   ...
   ```

---

## 3. Configuración Inicial

### ✅ Verificar que Todo Funciona

Antes de desplegar, verifica que las herramientas funcionan:

```powershell
# 1. Verificar Docker
docker ps

# Deberías ver una tabla vacía (está bien)

# 2. Verificar Google Cloud
gcloud projects list

# Deberías ver el proyecto: secure-potion-474303-j7

# 3. Verificar que puedes acceder al proyecto
gcloud config get-value project

# Debe mostrar: secure-potion-474303-j7
```

Si algún comando falla, revisa la [Sección 6: Solución de Problemas](#6-solución-de-problemas).

---

## 4. Cómo Desplegar

### 🚀 Opción A: Desplegar UN SOLO Servicio (Recomendado)

**Usa esto cuando:**
- Solo modificaste un servicio específico
- Quieres desplegar rápido
- Es tu primera vez desplegando

#### Pasos:

1. **Abrir PowerShell en el directorio del proyecto:**
   ```powershell
   cd C:\Users\TU_USUARIO\Documents\inventory-shipping
   ```

2. **Ejecutar el script de despliegue:**
   ```powershell
   .\deploy-single-service.ps1 -ServiceName shipping
   ```
   
   Opciones válidas para `-ServiceName`:
   - `inventory` - Servicio de inventario
   - `reservation` - Servicio de reservas
   - `shipping` - Servicio de envíos
   - `store` - Servicio de tiendas
   
   ⚠️ **No desplegar:** `warehouse` (aún en desarrollo)

3. **Esperar a que termine:**
   
   Verás algo como esto:
   ```
   🚀 Desplegando servicio: shipping
   
   🔨 Construyendo imagen Docker...
   [████████████████████] 100%
   
   ⬆️  Subiendo imagen a Artifact Registry...
   [████████████████████] 100%
   
   ☁️  Desplegando en Cloud Run...
   Deploying container to Cloud Run service [shipping-service]...
   ✅ Deployment complete
   
   ✅ shipping desplegado exitosamente!
   🔗 URL: https://shipping-service-xxxxx-uc.a.run.app
   ```

4. **¡Listo!** El servicio ya está en producción.

#### ⏱️ Tiempo estimado:
- Primera vez: 10-15 minutos
- Siguientes veces: 5-8 minutos

---

### 🎯 Opción B: Desplegar TODOS los Servicios

**Usa esto cuando:**
- Hiciste cambios en múltiples servicios
- Quieres actualizar todo el sistema
- Es un despliegue mayor

#### Pasos:

1. **Abrir PowerShell en el directorio del proyecto:**
   ```powershell
   cd C:\Users\TU_USUARIO\Documents\inventory-shipping
   ```

2. **Ejecutar el script:**
   ```powershell
   .\deploy-to-cloudrun.ps1
   ```

3. **Esperar a que termine:**
   
   El script desplegará en orden:
   ```
   1. inventory-service   (5-8 min)
   2. reservation-service (5-8 min)
   3. shipping-service    (5-8 min)
   4. store-service       (5-8 min)
   ```

#### ⏱️ Tiempo estimado:
- 20-35 minutos (todos los servicios)

---

## 5. Verificar el Despliegue

### ✅ Método 1: Revisar la URL

1. **Copiar la URL que apareció al final del despliegue:**
   ```
   🔗 URL: https://shipping-service-xxxxx-uc.a.run.app
   ```

2. **Abrir en el navegador:**
   ```
   https://shipping-service-xxxxx-uc.a.run.app
   ```
   
   Deberías ver:
   ```
   Shipping Service is running ✅
   ```

3. **Probar el health check:**
   ```
   https://shipping-service-xxxxx-uc.a.run.app/health
   ```
   
   Deberías ver:
   ```json
   {
     "status": "ok",
     "service": "shipping"
   }
   ```

---

### 📊 Método 2: Ver los Logs

```powershell
# Ver logs del servicio recién desplegado
gcloud run services logs read shipping-service --region=us-central1 --limit=50
```

Busca líneas como:
```
🚀 Starting Shipping Service...
✅ Database connected
🚀 Shipping Service running on http://0.0.0.0:4003
```

---

### 🔍 Método 3: Listar Servicios Activos

```powershell
gcloud run services list --region=us-central1
```

Deberías ver:
```
SERVICE              REGION       URL                                          
inventory-service    us-central1  https://inventory-service-xxxxx-uc.a.run.app
reservation-service  us-central1  https://reservation-service-xxxxx-uc.a.run.app
shipping-service     us-central1  https://shipping-service-xxxxx-uc.a.run.app
store-service        us-central1  https://store-service-xxxxx-uc.a.run.app
```

---

### 🧪 Método 4: Ejecutar Tests

Si desplegaste el servicio `shipping`, prueba la API de cotizaciones:

```powershell
.\test-cotizaciones.ps1
```

Deberías ver:
```
✅ Test 1: GET /api/cotizaciones - PASSED
✅ Test 2: POST /api/cotizaciones - PASSED
✅ Test 3: GET /api/cotizaciones/:id - PASSED
```

---

## 6. Solución de Problemas

### ❌ Error: "docker: command not found"

**Problema:** Docker no está instalado o no está en el PATH.

**Solución:**
1. Verifica que Docker Desktop esté corriendo (ícono de ballena en la bandeja del sistema)
2. Reinicia PowerShell
3. Si persiste, reinstala Docker Desktop

---

### ❌ Error: "gcloud: command not found"

**Problema:** Google Cloud SDK no está instalado o no está en el PATH.

**Solución:**
1. Cierra y abre PowerShell nuevamente
2. Ejecuta:
   ```powershell
   & 'C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd' --version
   ```
3. Si funciona, agrega al PATH manualmente o reinstala el SDK

---

### ❌ Error: "Permission denied"

**Problema:** No tienes permisos en el proyecto de Google Cloud.

**Solución:**
1. Contacta al Scrum Master para que te agregue al proyecto
2. Verifica que iniciaste sesión con la cuenta correcta:
   ```powershell
   gcloud auth list
   ```
3. Si es otra cuenta, cambia con:
   ```powershell
   gcloud auth login
   ```

---

### ❌ Error: "Failed to push image"

**Problema:** No tienes permisos para subir imágenes al Artifact Registry.

**Solución:**
1. Autentica Docker con Google Cloud:
   ```powershell
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```
2. Verifica que tienes permisos en el proyecto

---

### ❌ Error: "Database connection failed"

**Problema:** El servicio no puede conectarse a Cloud SQL.

**Solución:**
1. Verifica que Cloud SQL esté corriendo:
   ```powershell
   gcloud sql instances describe inventory-postgres
   ```
2. Verifica la contraseña en `deploy-single-service.ps1` (línea 13)
3. Contacta al administrador del proyecto

---

### ❌ Error: "Build failed"

**Problema:** Error al construir la imagen Docker.

**Solución:**
1. Verifica que estás en el directorio correcto del proyecto
2. Asegúrate de que hay un `Dockerfile` en `services/[nombre-servicio]/`
3. Revisa los logs de error para detalles específicos
4. Intenta limpiar Docker:
   ```powershell
   docker system prune -a
   ```
   ⚠️ Esto borrará imágenes y contenedores no usados

---

### ❌ Error: "Service deployment failed"

**Problema:** Cloud Run no pudo desplegar el servicio.

**Solución:**
1. Ve a la consola de Google Cloud:
   https://console.cloud.google.com/run?project=secure-potion-474303-j7
2. Busca el servicio y revisa los logs
3. Verifica que la imagen se subió correctamente:
   ```powershell
   gcloud artifacts docker images list us-central1-docker.pkg.dev/secure-potion-474303-j7/microservices-repo
   ```

---

## 7. Comandos Útiles

### 📊 Ver Logs en Tiempo Real

```powershell
# Ver logs de un servicio específico
gcloud run services logs tail shipping-service --region=us-central1

# Ver los últimos 100 logs
gcloud run services logs read shipping-service --region=us-central1 --limit=100
```

---

### 🔄 Revertir un Despliegue

Si algo salió mal, puedes revertir a la versión anterior:

```powershell
# Listar revisiones del servicio
gcloud run revisions list --service=shipping-service --region=us-central1

# Revertir a una revisión específica
gcloud run services update-traffic shipping-service --region=us-central1 --to-revisions=shipping-service-00001-xxx=100
```

---

### 🗑️ Eliminar un Servicio

Si necesitas eliminar un servicio:

```powershell
gcloud run services delete shipping-service --region=us-central1
```

⚠️ **Cuidado:** Esto elimina el servicio completamente.

---

### 📋 Ver Información de un Servicio

```powershell
# Descripción completa
gcloud run services describe shipping-service --region=us-central1

# Solo la URL
gcloud run services describe shipping-service --region=us-central1 --format="value(status.url)"
```

---

### 🔐 Cambiar Permisos de Acceso

Por defecto, los servicios son públicos. Para hacerlos privados:

```powershell
gcloud run services remove-iam-policy-binding shipping-service --region=us-central1 --member="allUsers" --role="roles/run.invoker"
```

---

### 🐳 Comandos Docker Útiles

```powershell
# Ver imágenes locales
docker images

# Limpiar imágenes no usadas
docker image prune -a

# Ver contenedores corriendo
docker ps

# Ver todos los contenedores
docker ps -a

# Limpiar todo (imágenes, contenedores, volúmenes)
docker system prune -a --volumes
```

⚠️ **Advertencia:** `prune` elimina datos, úsalo con cuidado.

---

## 📝 Checklist de Despliegue

Usa este checklist cada vez que vayas a desplegar:

```
□ Docker Desktop está corriendo
□ Tengo los últimos cambios del repositorio (git pull)
□ Verifiqué qué servicio modificar
□ Ejecuté el script de despliegue
□ Esperé a que termine sin errores
□ Verifiqué la URL del servicio
□ Probé el endpoint /health
□ Revisé los logs por errores
□ Notifiqué al equipo del despliegue
```

---

## 🎓 Mejores Prácticas

### ✅ DO (Hacer):

1. **Siempre hacer `git pull` antes de desplegar**
   ```powershell
   git pull origin master
   ```

2. **Desplegar solo el servicio que modificaste**
   ```powershell
   .\deploy-single-service.ps1 -ServiceName shipping
   ```

3. **Verificar los logs después del despliegue**
   ```powershell
   gcloud run services logs read shipping-service --region=us-central1 --limit=20
   ```

4. **Avisar al equipo cuando despliegues**
   - Mensaje en Slack/Discord: "Desplegando shipping-service"

5. **Probar el servicio después del despliegue**
   ```powershell
   .\test-cotizaciones.ps1
   ```

### ❌ DON'T (No Hacer):

1. **No desplegar sin probar localmente**
   - Usa `docker-compose` para probar primero

2. **No desplegar en horarios pico**
   - Evita desplegar cuando hay muchos usuarios

3. **No modificar los scripts sin avisar**
   - Si necesitas cambiar algo, consulta primero

4. **No desplegar con errores conocidos**
   - Arregla los bugs antes de desplegar

5. **No desplegar el servicio `warehouse`**
   - Aún está en desarrollo

---

## 🆘 ¿Necesitas Ayuda?

### Contactos:

- **Scrum Master:** [Nombre del Scrum Master]
- **Canal de Slack/Discord:** #despliegues
- **Documentación adicional:** `docs/` en el repositorio

### Recursos:

- [Docker Documentation](https://docs.docker.com/)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## 📌 Resumen Rápido

### Primera vez:
1. Instalar Docker Desktop
2. Instalar Google Cloud SDK
3. Configurar gcloud
4. Clonar repositorio

### Cada despliegue:
1. `git pull origin master`
2. `.\deploy-single-service.ps1 -ServiceName [servicio]`
3. Verificar URL y logs
4. Avisar al equipo

---

**¡Listo! Ya sabes cómo desplegar. Si tienes dudas, pregunta en el canal del equipo.** 🚀

---

**Última actualización:** 4 de noviembre de 2025  
**Versión:** 1.0  
**Autor:** Equipo Scrum - Inventory Shipping
